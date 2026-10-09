import IpAccessRule from "../models/ipAccessRuleModel.js";
import IpSecurityEvent from "../models/ipSecurityEventModel.js";
import IpAuditLog from "../models/ipAuditLogModel.js";
import { getClientIp, isValidIp } from "../utils/ipUtils.js";
import {
  addIpBlockToCache,
  removeIpBlockFromCache,
  checkIsIpBlocked,
  addIpSafelistToCache,
  removeIpSafelistFromCache,
  checkIsIpSafelisted,
} from "../middlewares/ipSecurityMiddleware.js";
import { resetRateLimitForIp } from "../middlewares/rateLimiter.js";
import { Response } from "../utils/response.js";
import Admin from "../models/adminModel.js";
import Student from "../models/studentModel.js";
import Teacher from "../models/teacherModel.js";
import { logSecurityEvent } from "../middlewares/ipLoggingMiddleware.js";

/**
 * Evaluates real behavioral risk level from recorded statistics.
 */
export const calculateIpRisk = (stats, isCurrentlyBlocked = false, isBanned = false, isSafelisted = false) => {
  if (isSafelisted) return "Safe";
  if (isBanned) return "Critical";
  if (isCurrentlyBlocked) return "High";

  const rateLimitHits = stats.rateLimitHits || 0;
  const failedAuth = stats.failedAuthCount || 0;

  if (rateLimitHits >= 5 || (rateLimitHits >= 3 && failedAuth >= 10)) {
    return "Critical";
  }
  if (rateLimitHits >= 2 || failedAuth >= 10) {
    return "High";
  }
  if (rateLimitHits >= 1 || failedAuth >= 5) {
    return "Medium";
  }
  if (failedAuth >= 1) {
    return "Low";
  }
  return "Normal";
};

// 1. Overview Dashboard Statistics (100% computed inside MongoDB without loading distinct IP arrays into Node.js heap)
export const getIpSecurityOverview = async (req, res) => {
  try {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const todayStart = new Date(new Date().setHours(0, 0, 0, 0));

    const [overviewAgg, activeBlockedRules, activeBannedRules, activeSafelistRules] = await Promise.all([
      IpSecurityEvent.aggregate([
        {
          $facet: {
            totalUniqueIps: [
              { $group: { _id: "$ip" } },
              { $count: "count" },
            ],
            activeIpsRecent: [
              { $match: { timestamp: { $gte: twentyFourHoursAgo } } },
              { $group: { _id: "$ip" } },
              { $count: "count" },
            ],
            rateLimitedIpsRecent: [
              { $match: { eventType: "RATE_LIMIT_TRIGGERED", timestamp: { $gte: twentyFourHoursAgo } } },
              { $group: { _id: "$ip" } },
              { $count: "count" },
            ],
            suspiciousEventsCount: [
              { $match: { eventType: { $in: ["SUSPICIOUS_REQUEST", "RATE_LIMIT_TRIGGERED", "ACCESS_DENIED"] } } },
              { $group: { _id: "$ip" } },
              { $count: "count" },
            ],
            eventsTodayCount: [
              { $match: { timestamp: { $gte: todayStart } } },
              { $count: "count" },
            ],
          },
        },
      ]),
      IpAccessRule.countDocuments({
        status: "active",
        type: "temporary_block",
        $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
      }),
      IpAccessRule.countDocuments({
        status: "active",
        type: { $in: ["permanent_block", "ban"] },
      }),
      IpAccessRule.countDocuments({
        status: "active",
        type: { $in: ["safelist", "allow"] },
      }),
    ]);

    const facet = overviewAgg?.[0] || {};
    const totalUniqueIps = facet.totalUniqueIps?.[0]?.count || 0;
    const activeIps = facet.activeIpsRecent?.[0]?.count || 0;
    const rateLimitedIps = facet.rateLimitedIpsRecent?.[0]?.count || 0;
    const suspiciousIps = facet.suspiciousEventsCount?.[0]?.count || 0;
    const securityEventsToday = facet.eventsTodayCount?.[0]?.count || 0;

    const clientIp = getClientIp(req);

    return Response(res, 200, true, "IP Security Overview retrieved", {
      totalUniqueIps,
      activeIps,
      blockedIps: activeBlockedRules,
      bannedIps: activeBannedRules,
      safelistedIps: activeSafelistRules,
      temporaryBlocks: activeBlockedRules,
      rateLimitedIps,
      suspiciousIps,
      securityEventsToday,
      currentSuperAdminIp: clientIp,
    });
  } catch (error) {
    console.error("Error in getIpSecurityOverview:", error);
    return Response(res, 500, false, "Failed to load IP security overview", error.message);
  }
};

// 2. Live & Recent IP Activity with Server-Side Pagination, Filtering & Minimal Memory Footprint
export const getIpActivity = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const searchQuery = req.query.search ? req.query.search.trim() : "";
    const filterStatus = req.query.status || "all";
    const filterRisk = req.query.risk || "all";

    const now = new Date();
    // 1. Fetch only active rules with minimal projection
    const activeRules = await IpAccessRule.find({
      status: "active",
      $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
    })
      .select("ip type expiresAt reason notes")
      .lean();

    const activeRulesMap = new Map();
    const safelistIps = [];
    const bannedIps = [];
    const blockedIps = [];

    for (const r of activeRules) {
      if (!r.ip) continue;
      activeRulesMap.set(r.ip, r);
      if (r.type === "safelist" || r.type === "allow") {
        safelistIps.push(r.ip);
      } else if (r.type === "permanent_block" || r.type === "ban") {
        bannedIps.push(r.ip);
      } else {
        blockedIps.push(r.ip);
      }
    }

    // 2. Match stage (IP address or account email search)
    const matchStage = {};
    if (searchQuery) {
      const [matchedAdmins, matchedStudents, matchedTeachers] = await Promise.all([
        Admin.find({
          $or: [
            { name: { $regex: searchQuery, $options: "i" } },
            { email: { $regex: searchQuery, $options: "i" } },
          ],
        })
          .select("email")
          .limit(50)
          .lean(),
        Student.find({
          $or: [
            { name: { $regex: searchQuery, $options: "i" } },
            { email: { $regex: searchQuery, $options: "i" } },
          ],
        })
          .select("email")
          .limit(50)
          .lean(),
        Teacher.find({
          $or: [
            { name: { $regex: searchQuery, $options: "i" } },
            { email: { $regex: searchQuery, $options: "i" } },
          ],
        })
          .select("email")
          .limit(50)
          .lean(),
      ]);

      const matchedEmails = [
        ...matchedAdmins.map((u) => u.email),
        ...matchedStudents.map((u) => u.email),
        ...matchedTeachers.map((u) => u.email),
      ];

      matchStage.$or = [
        { ip: { $regex: searchQuery, $options: "i" } },
        { accountEmail: { $regex: searchQuery, $options: "i" } },
        ...(matchedEmails.length > 0 ? [{ accountEmail: { $in: matchedEmails } }] : []),
      ];
    }

    // 3. Full aggregation pipeline executed inside MongoDB
    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: "$ip",
          lastSeen: { $max: "$timestamp" },
          firstSeen: { $min: "$timestamp" },
          requestCount: { $sum: 1 },
          failedAuthCount: {
            $sum: {
              $cond: [
                {
                  $in: [
                    "$eventType",
                    ["LOGIN_FAILURE", "OTP_FAILURE", "UNAUTHORIZED_REQUEST"],
                  ],
                },
                1,
                0,
              ],
            },
          },
          otpFailures: {
            $sum: { $cond: [{ $eq: ["$eventType", "OTP_FAILURE"] }, 1, 0] },
          },
          rateLimitHits: {
            $sum: { $cond: [{ $eq: ["$eventType", "RATE_LIMIT_TRIGGERED"] }, 1, 0] },
          },
          accounts: { $addToSet: "$accountEmail" },
          roles: { $addToSet: "$accountRole" },
        },
      },
      {
        $addFields: {
          status: {
            $switch: {
              branches: [
                { case: { $in: ["$_id", safelistIps] }, then: "safelisted" },
                { case: { $in: ["$_id", bannedIps] }, then: "banned" },
                { case: { $in: ["$_id", blockedIps] }, then: "blocked" },
                { case: { $gt: ["$rateLimitHits", 0] }, then: "rate_limited" },
              ],
              default: "normal",
            },
          },
          risk: {
            $switch: {
              branches: [
                { case: { $in: ["$_id", safelistIps] }, then: "Safe" },
                { case: { $in: ["$_id", bannedIps] }, then: "Critical" },
                { case: { $in: ["$_id", blockedIps] }, then: "High" },
                {
                  case: {
                    $or: [
                      { $gte: ["$rateLimitHits", 5] },
                      {
                        $and: [
                          { $gte: ["$rateLimitHits", 3] },
                          { $gte: ["$failedAuthCount", 10] },
                        ],
                      },
                    ],
                  },
                  then: "Critical",
                },
                {
                  case: {
                    $or: [
                      { $gte: ["$rateLimitHits", 2] },
                      { $gte: ["$failedAuthCount", 10] },
                    ],
                  },
                  then: "High",
                },
                {
                  case: {
                    $or: [
                      { $gte: ["$rateLimitHits", 1] },
                      { $gte: ["$failedAuthCount", 5] },
                    ],
                  },
                  then: "Medium",
                },
                { case: { $gte: ["$failedAuthCount", 1] }, then: "Low" },
              ],
              default: "Normal",
            },
          },
        },
      },
    ];

    // Status filter in MongoDB
    if (filterStatus !== "all") {
      pipeline.push({ $match: { status: filterStatus } });
    }

    // Risk filter in MongoDB
    if (filterRisk !== "all") {
      pipeline.push({
        $match: {
          risk: { $regex: new RegExp(`^${filterRisk}$`, "i") },
        },
      });
    }

    // Database-side pagination: returns ONLY current page data and total count
    pipeline.push({
      $facet: {
        metadata: [{ $count: "total" }],
        data: [
          { $sort: { lastSeen: -1 } },
          { $skip: skip },
          { $limit: limit },
        ],
      },
    });

    const [aggResult] = await IpSecurityEvent.aggregate(pipeline);
    const totalCount = aggResult?.metadata?.[0]?.total || 0;
    const paginatedItems = aggResult?.data || [];

    // 4. Look up genuine accounts ONLY for the 10 paginated records on this page
    const pageCandidateEmails = [
      ...new Set(
        paginatedItems.flatMap((item) => item.accounts || []).filter(Boolean)
      ),
    ];

    const realAccountsMap = new Map();
    if (pageCandidateEmails.length > 0) {
      const [realAdmins, realStudents, realTeachers] = await Promise.all([
        Admin.find({ email: { $in: pageCandidateEmails } })
          .select("email name role isSuperAdmin")
          .lean(),
        Student.find({ email: { $in: pageCandidateEmails } })
          .select("email name role")
          .lean(),
        Teacher.find({ email: { $in: pageCandidateEmails } })
          .select("email name role")
          .lean(),
      ]);

      for (const a of realAdmins) {
        if (a?.email) {
          realAccountsMap.set(a.email.toLowerCase(), {
            email: a.email,
            name: a.name || "Administrator",
            role: a.isSuperAdmin ? "Superadmin" : (a.role || "Admin"),
          });
        }
      }
      for (const s of realStudents) {
        if (s?.email) {
          realAccountsMap.set(s.email.toLowerCase(), {
            email: s.email,
            name: s.name || "Student",
            role: "Student",
          });
        }
      }
      for (const t of realTeachers) {
        if (t?.email) {
          realAccountsMap.set(t.email.toLowerCase(), {
            email: t.email,
            name: t.name || "Teacher",
            role: "Teacher",
          });
        }
      }
    }

    const clientIp = getClientIp(req);

    // 5. Final lightweight enrichment
    const enrichedList = paginatedItems.map((item) => {
      const activeRule = activeRulesMap.get(item._id);
      const verifiedAccounts = (item.accounts || [])
        .filter(Boolean)
        .map((email) => realAccountsMap.get(String(email).toLowerCase()))
        .filter(Boolean);
      const verifiedRoles = [...new Set(verifiedAccounts.map((a) => a.role))];

      return {
        ip: item._id,
        lastSeen: item.lastSeen,
        firstSeen: item.firstSeen,
        requestCount: item.requestCount,
        failedAuthCount: item.failedAuthCount,
        otpFailures: item.otpFailures,
        rateLimitHits: item.rateLimitHits,
        accounts: verifiedAccounts,
        roles: verifiedRoles,
        status: item.status,
        risk: item.risk,
        isSafelisted: item.status === "safelisted",
        isCurrentSuperAdmin: item._id === clientIp,
        ruleDetails: activeRule || null,
      };
    });

    return Response(res, 200, true, "IP activity retrieved", {
      activity: enrichedList,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit) || 1,
      },
      currentSuperAdminIp: clientIp,
    });
  } catch (error) {
    console.error("Error in getIpActivity:", error);
    return Response(res, 500, false, "Failed to load IP activity", error.message);
  }
};

// 3. List Active and Historical IP Rules
export const getIpRules = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const filterStatus = req.query.status || "all";
    const filterQuery = {};
    if (filterStatus !== "all") {
      filterQuery.status = filterStatus;
    }

    const totalRules = await IpAccessRule.countDocuments(filterQuery);
    const rules = await IpAccessRule.find(filterQuery)
      .select("ip cidr type status reason notes source createdBy createdAt expiresAt removedBy removedAt removalReason")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return Response(res, 200, true, "IP rules retrieved", {
      rules,
      pagination: {
        page,
        limit,
        totalCount: totalRules,
        totalPages: Math.ceil(totalRules / limit) || 1,
      },
    });
  } catch (error) {
    console.error("Error in getIpRules:", error);
    return Response(res, 500, false, "Failed to load IP rules", error.message);
  }
};

// 4. Detailed Security Inspection for a single IP
export const getIpDetails = async (req, res) => {
  try {
    const { ip } = req.params;
    if (!ip || !isValidIp(ip)) {
      return Response(res, 400, false, "Invalid or missing IP address");
    }

    const cleanIp = ip.trim();
    const clientIp = getClientIp(req);

    // Fetch all rules associated with this IP
    const rules = await IpAccessRule.find({ ip: cleanIp })
      .sort({ createdAt: -1 })
      .lean();

    // Check active block status
    const now = new Date();
    const activeRule = rules.find((r) => {
      if (r.status !== "active") return false;
      if (r.expiresAt && new Date(r.expiresAt) <= now) return false;
      return true;
    });

    // Fetch aggregate statistics from events
    const statsAggregation = await IpSecurityEvent.aggregate([
      { $match: { ip: cleanIp } },
      {
        $group: {
          _id: "$ip",
          totalRequests: { $sum: 1 },
          firstSeen: { $min: "$timestamp" },
          lastSeen: { $max: "$timestamp" },
          loginSuccesses: {
            $sum: { $cond: [{ $eq: ["$eventType", "LOGIN_SUCCESS"] }, 1, 0] },
          },
          loginFailures: {
            $sum: { $cond: [{ $eq: ["$eventType", "LOGIN_FAILURE"] }, 1, 0] },
          },
          otpFailures: {
            $sum: { $cond: [{ $eq: ["$eventType", "OTP_FAILURE"] }, 1, 0] },
          },
          rateLimitHits: {
            $sum: { $cond: [{ $eq: ["$eventType", "RATE_LIMIT_TRIGGERED"] }, 1, 0] },
          },
          accounts: { $addToSet: "$accountEmail" },
          roles: { $addToSet: "$accountRole" },
          userAgents: { $addToSet: "$userAgent" },
        },
      },
    ]);

    const stats = statsAggregation[0] || {
      totalRequests: 0,
      firstSeen: null,
      lastSeen: null,
      loginSuccesses: 0,
      loginFailures: 0,
      otpFailures: 0,
      rateLimitHits: 0,
      accounts: [],
      roles: [],
      userAgents: [],
    };

    stats.failedAuthCount = (stats.loginFailures || 0) + (stats.otpFailures || 0);

    const isSafelisted = Boolean(
      activeRule && (activeRule.type === "safelist" || activeRule.type === "allow")
    );
    const isBanned = Boolean(
      activeRule &&
        (activeRule.type === "permanent_block" || activeRule.type === "ban")
    );
    const isBlocked = Boolean(activeRule && !isSafelisted);
    const risk = calculateIpRisk(stats, isBlocked, isBanned, isSafelisted);

    const candidateEmails = (stats.accounts || []).filter(Boolean);
    const [realAdmins, realStudents, realTeachers] = await Promise.all([
      Admin.find({ email: { $in: candidateEmails } }).select("email name role isSuperAdmin").lean(),
      Student.find({ email: { $in: candidateEmails } }).select("email name role").lean(),
      Teacher.find({ email: { $in: candidateEmails } }).select("email name role").lean(),
    ]);

    const realAccountsMap = new Map();
    for (const a of realAdmins) {
      if (a?.email) {
        realAccountsMap.set(a.email.toLowerCase(), {
          email: a.email,
          name: a.name || "Administrator",
          role: a.isSuperAdmin ? "Superadmin" : (a.role || "Admin"),
        });
      }
    }
    for (const s of realStudents) {
      if (s?.email) {
        realAccountsMap.set(s.email.toLowerCase(), {
          email: s.email,
          name: s.name || "Student",
          role: "Student",
        });
      }
    }
    for (const t of realTeachers) {
      if (t?.email) {
        realAccountsMap.set(t.email.toLowerCase(), {
          email: t.email,
          name: t.name || "Teacher",
          role: "Teacher",
        });
      }
    }

    const verifiedAccounts = candidateEmails
      .map((email) => realAccountsMap.get(String(email).toLowerCase()))
      .filter(Boolean);

    const verifiedRoles = [...new Set(verifiedAccounts.map((a) => a.role))];

    // Fetch recent events (last 50) with minimal projected fields
    const recentEventsRaw = await IpSecurityEvent.find({ ip: cleanIp })
      .select("timestamp eventType method path statusCode isAuthenticated accountEmail accountRole")
      .sort({ timestamp: -1 })
      .limit(50)
      .lean();

    // Sanitize events so only real verified accounts are shown
    const recentEvents = recentEventsRaw.map((ev) => {
      const email = ev.accountEmail ? String(ev.accountEmail).toLowerCase() : null;
      const verified = email ? realAccountsMap.get(email) : null;
      return {
        ...ev,
        accountEmail: verified ? verified.email : null,
        accountName: verified ? verified.name : null,
        accountRole: verified ? verified.role : (ev.isAuthenticated ? ev.accountRole : null),
      };
    });

    // Fetch audit actions performed on this IP with minimal projected fields
    const auditLogs = await IpAuditLog.find({ targetIp: cleanIp })
      .select("action targetIp performedBy reason duration expiresAt result timestamp metadata")
      .sort({ timestamp: -1 })
      .limit(50)
      .lean();

    return Response(res, 200, true, "IP details retrieved successfully", {
      ip: cleanIp,
      isCurrentSuperAdmin: cleanIp === clientIp,
      currentStatus: isSafelisted ? "safelisted" : isBanned ? "banned" : isBlocked ? "blocked" : "normal",
      risk,
      isSafelisted,
      activeRule: activeRule || null,
      rulesHistory: rules,
      stats: {
        ...stats,
        accounts: verifiedAccounts,
        roles: verifiedRoles,
        userAgents: (stats.userAgents || []).filter(Boolean),
      },
      recentEvents,
      auditLogs,
    });
  } catch (error) {
    console.error("Error in getIpDetails:", error);
    return Response(res, 500, false, "Failed to load IP details", error.message);
  }
};

// 5. Manual Temporary Block
export const blockIp = async (req, res) => {
  try {
    const { ip, durationMinutes, reason, notes, confirmSelfBlock } = req.body;

    if (!ip || !isValidIp(ip)) {
      return Response(res, 400, false, "Valid IP address is required");
    }

    const cleanIp = ip.trim();
    if (checkIsIpSafelisted(cleanIp)) {
      return Response(res, 400, false, `IP ${cleanIp} is currently on the Safelist (Always Safe). Remove it from Safelist before blocking.`);
    }

    const duration = parseInt(durationMinutes, 10);
    if (isNaN(duration) || duration <= 0) {
      return Response(res, 400, false, "Duration in minutes must be a positive integer");
    }

    if (!reason || !reason.trim()) {
      return Response(res, 400, false, "A reason for the temporary block is required");
    }

    const clientIp = getClientIp(req);

    // Safety guard: prevent accidental self-lockout unless explicit confirmation flag provided
    if (cleanIp === clientIp && !confirmSelfBlock) {
      return Response(res, 400, false, "Self-Lockout Warning: The specified IP matches your current connection. Set confirmSelfBlock to true to proceed.", {
        isCurrentIp: true,
      });
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + duration * 60 * 1000);

    // Deactivate previous active rules for this IP
    await IpAccessRule.updateMany(
      { ip: cleanIp, status: "active" },
      { $set: { status: "removed", removedReason: "Overwritten by new temporary block" } }
    );

    // Create new temporary block rule
    const newRule = await IpAccessRule.create({
      ip: cleanIp,
      type: "temporary_block",
      status: "active",
      reason: reason.trim(),
      notes: (notes || "").trim(),
      createdBy: req.user.email,
      createdAt: now,
      expiresAt,
      source: "manual",
    });

    // Update in-memory cache immediately
    addIpBlockToCache(cleanIp, "temporary_block", expiresAt, reason.trim());

    // Record immutable audit log
    await IpAuditLog.create({
      action: "TEMPORARY_IP_BLOCK",
      targetIp: cleanIp,
      performedBy: req.user.email,
      performedById: req.user._id,
      reason: reason.trim(),
      duration: `${duration} minutes`,
      expiresAt,
      metadata: { notes },
    });

    // Log security event
    await logSecurityEvent({
      ip: cleanIp,
      eventType: "IP_TEMP_BLOCKED",
      metadata: {
        durationMinutes: duration,
        reason: reason.trim(),
        performedBy: req.user.email,
      },
    });

    return Response(res, 200, true, `IP ${cleanIp} temporarily blocked for ${duration} minutes.`, {
      rule: newRule,
    });
  } catch (error) {
    console.error("Error in blockIp:", error);
    return Response(res, 500, false, "Failed to block IP", error.message);
  }
};

// 6. Permanent Ban
export const banIp = async (req, res) => {
  try {
    const { ip, reason, notes, confirmationPhrase } = req.body;

    if (!ip || !isValidIp(ip)) {
      return Response(res, 400, false, "Valid IP address is required");
    }

    const cleanIp = ip.trim();
    if (checkIsIpSafelisted(cleanIp)) {
      return Response(res, 400, false, `IP ${cleanIp} is currently on the Safelist (Always Safe). Remove it from Safelist before banning.`);
    }

    if (!reason || !reason.trim()) {
      return Response(res, 400, false, "A reason for the permanent ban is required");
    }

    // Require strict confirmation phrase
    const expectedPhrase = `BAN ${cleanIp}`;
    if (confirmationPhrase?.trim() !== expectedPhrase) {
      return Response(res, 400, false, `Confirmation failed. You must provide confirmation phrase: "${expectedPhrase}"`);
    }

    const clientIp = getClientIp(req);
    if (cleanIp === clientIp) {
      return Response(res, 403, false, "Action Denied: You cannot permanently ban your own active connection IP address.");
    }

    const now = new Date();

    // Deactivate previous active rules
    await IpAccessRule.updateMany(
      { ip: cleanIp, status: "active" },
      { $set: { status: "removed", removedReason: "Overwritten by permanent ban" } }
    );

    // Create permanent ban rule
    const newRule = await IpAccessRule.create({
      ip: cleanIp,
      type: "permanent_block",
      status: "active",
      reason: reason.trim(),
      notes: (notes || "").trim(),
      createdBy: req.user.email,
      createdAt: now,
      expiresAt: null, // permanent
      source: "manual",
    });

    // Update in-memory cache
    addIpBlockToCache(cleanIp, "permanent_block", null, reason.trim());

    // Record immutable audit log
    await IpAuditLog.create({
      action: "PERMANENT_BAN",
      targetIp: cleanIp,
      performedBy: req.user.email,
      performedById: req.user._id,
      reason: reason.trim(),
      duration: "Permanent",
      expiresAt: null,
      metadata: { notes },
    });

    // Log security event
    await logSecurityEvent({
      ip: cleanIp,
      eventType: "IP_PERMANENT_BANNED",
      metadata: {
        reason: reason.trim(),
        performedBy: req.user.email,
      },
    });

    return Response(res, 200, true, `IP ${cleanIp} permanently banned.`, {
      rule: newRule,
    });
  } catch (error) {
    console.error("Error in banIp:", error);
    return Response(res, 500, false, "Failed to ban IP", error.message);
  }
};

// 7. Unblock / Remove Ban
export const unblockIp = async (req, res) => {
  try {
    const { ip, ruleId, reason } = req.body;

    if (!ip && !ruleId) {
      return Response(res, 400, false, "Either IP address or ruleId is required");
    }

    const cleanIp = ip ? ip.trim() : null;
    const filter = cleanIp ? { ip: cleanIp, status: "active" } : { _id: ruleId, status: "active" };

    const activeRules = await IpAccessRule.find(filter);
    if (activeRules.length === 0) {
      return Response(res, 404, false, "No active block or ban rule found for this IP");
    }

    const now = new Date();
    const removalReason = (reason || "Manually unblocked by Superadmin").trim();

    // Mark rule inactive without deleting historical record
    await IpAccessRule.updateMany(filter, {
      $set: {
        status: "removed",
        removedBy: req.user.email,
        removedAt: now,
        removalReason,
      },
    });

    const targetIp = cleanIp || activeRules[0].ip;

    // Remove from in-memory cache
    removeIpBlockFromCache(targetIp);

    // Record immutable audit log
    await IpAuditLog.create({
      action: "UNBLOCK_IP",
      targetIp,
      performedBy: req.user.email,
      performedById: req.user._id,
      reason: removalReason,
      metadata: { affectedRulesCount: activeRules.length },
    });

    // Log security event
    await logSecurityEvent({
      ip: targetIp,
      eventType: "IP_UNBLOCKED",
      metadata: {
        removalReason,
        performedBy: req.user.email,
      },
    });

    return Response(res, 200, true, `IP ${targetIp} unblocked successfully. Restrictions removed.`);
  } catch (error) {
    console.error("Error in unblockIp:", error);
    return Response(res, 500, false, "Failed to unblock IP", error.message);
  }
};

// 8. Reset Rate Limit for an IP
export const resetIpRateLimit = async (req, res) => {
  try {
    const targetIp = req.body?.ip ? req.body.ip.trim() : getClientIp(req);

    if (!isValidIp(targetIp)) {
      return Response(res, 400, false, "Valid IP address is required");
    }

    await resetRateLimitForIp(targetIp);

    // Record immutable audit log
    await IpAuditLog.create({
      action: "RATE_LIMIT_RESET",
      targetIp,
      performedBy: req.user.email,
      performedById: req.user._id,
      reason: "Manual rate-limit cooldown reset",
    });

    return Response(res, 200, true, `Rate limit successfully cleared for IP: ${targetIp}`, {
      ip: targetIp,
    });
  } catch (error) {
    console.error("Error in resetIpRateLimit:", error);
    return Response(res, 500, false, "Failed to reset rate limit", error.message);
  }
};

// 9. Immutable Superadmin Audit Logs
export const getIpAuditLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const totalLogs = await IpAuditLog.countDocuments();
    const logs = await IpAuditLog.find()
      .select("action targetIp performedBy reason duration expiresAt result timestamp metadata")
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return Response(res, 200, true, "IP Audit Logs retrieved", {
      logs,
      pagination: {
        page,
        limit,
        totalCount: totalLogs,
        totalPages: Math.ceil(totalLogs / limit) || 1,
      },
    });
  } catch (error) {
    console.error("Error in getIpAuditLogs:", error);
    return Response(res, 500, false, "Failed to load audit logs", error.message);
  }
};

// 10. Safelist IP (Always Safe / Never Block)
export const safelistIp = async (req, res) => {
  try {
    const { ip, reason, notes } = req.body;
    if (!ip || !isValidIp(ip)) {
      return Response(res, 400, false, "Valid IP address is required");
    }
    const cleanIp = ip.trim();
    const now = new Date();

    // Deactivate previous active rules for this IP (blocks/bans)
    await IpAccessRule.updateMany(
      { ip: cleanIp, status: "active" },
      { $set: { status: "removed", removedReason: "Overwritten by Safelist rule" } }
    );

    const newRule = await IpAccessRule.create({
      ip: cleanIp,
      type: "safelist",
      status: "active",
      reason: (reason || "Manually added to Safelist (Always Safe)").trim(),
      notes: (notes || "").trim(),
      createdBy: req.user?.email || "Superadmin",
      createdAt: now,
      expiresAt: null, // Always safe / permanent unless removed
      source: "manual",
    });

    removeIpBlockFromCache(cleanIp);
    addIpSafelistToCache(cleanIp);
    await resetRateLimitForIp(cleanIp);

    await IpAuditLog.create({
      action: "SAFELIST_IP",
      targetIp: cleanIp,
      performedBy: req.user?.email || "Superadmin",
      performedById: req.user?._id,
      reason: (reason || "Manually added to Safelist").trim(),
      metadata: { notes },
    });

    await logSecurityEvent({
      ip: cleanIp,
      eventType: "IP_SAFELISTED",
      metadata: {
        reason: (reason || "Manually added to Safelist").trim(),
        performedBy: req.user?.email || "Superadmin",
      },
    });

    return Response(res, 200, true, `IP ${cleanIp} is now marked as Safelisted (Always Safe).`, {
      rule: newRule,
    });
  } catch (error) {
    console.error("Error in safelistIp:", error);
    return Response(res, 500, false, "Failed to safelist IP", error.message);
  }
};

// 11. Remove IP from Safelist
export const removeSafelistIp = async (req, res) => {
  try {
    const { ip, reason } = req.body;
    if (!ip) {
      return Response(res, 400, false, "IP address is required");
    }
    const cleanIp = ip.trim();
    const now = new Date();

    await IpAccessRule.updateMany(
      { ip: cleanIp, status: "active", type: { $in: ["safelist", "allow"] } },
      {
        $set: {
          status: "removed",
          removedBy: req.user?.email || "Superadmin",
          removedAt: now,
          removalReason: (reason || "Removed from Safelist").trim(),
        },
      }
    );

    removeIpSafelistFromCache(cleanIp);

    await IpAuditLog.create({
      action: "REMOVE_SAFELIST_IP",
      targetIp: cleanIp,
      performedBy: req.user?.email || "Superadmin",
      performedById: req.user?._id,
      reason: (reason || "Removed from Safelist").trim(),
    });

    await logSecurityEvent({
      ip: cleanIp,
      eventType: "IP_SAFELIST_REMOVED",
      metadata: {
        reason: (reason || "Removed from Safelist").trim(),
        performedBy: req.user?.email || "Superadmin",
      },
    });

    return Response(res, 200, true, `IP ${cleanIp} removed from Safelist.`);
  } catch (error) {
    console.error("Error in removeSafelistIp:", error);
    return Response(res, 500, false, "Failed to remove IP from Safelist", error.message);
  }
};

// 12. Safe Superadmin Memory Diagnostics (Requirement 12)
export const getMemoryDiagnostics = async (req, res) => {
  try {
    const mem = process.memoryUsage();
    return Response(res, 200, true, "Process memory diagnostics", {
      rssMB: Number((mem.rss / 1024 / 1024).toFixed(2)),
      heapTotalMB: Number((mem.heapTotal / 1024 / 1024).toFixed(2)),
      heapUsedMB: Number((mem.heapUsed / 1024 / 1024).toFixed(2)),
      externalMB: Number((mem.external / 1024 / 1024).toFixed(2)),
      arrayBuffersMB: Number((mem.arrayBuffers / 1024 / 1024).toFixed(2)),
      uptimeSeconds: Math.floor(process.uptime()),
    });
  } catch (error) {
    return Response(res, 500, false, "Failed to retrieve memory diagnostics", error.message);
  }
};

