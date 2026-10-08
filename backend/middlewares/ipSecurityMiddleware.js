import IpAccessRule from "../models/ipAccessRuleModel.js";
import { getClientIp, isIpInCidr } from "../utils/ipUtils.js";

// In-memory cache for O(1) request evaluation without DB latency
const activeIpBlocksCache = new Map(); // ip -> { type, expiresAt, reason }
let activeCidrRulesCache = []; // [{ cidr, type, expiresAt }]

/**
 * Loads all active rules from MongoDB into the in-memory cache.
 */
export const reloadIpBlockCache = async () => {
  try {
    const now = new Date();
    // Query active rules from DB
    const rules = await IpAccessRule.find({ status: "active" }).lean();

    activeIpBlocksCache.clear();
    activeCidrRulesCache = [];

    const expiredRuleIds = [];

    for (const rule of rules) {
      if (rule.expiresAt && new Date(rule.expiresAt) <= now) {
        expiredRuleIds.push(rule._id);
        continue;
      }

      if (rule.cidr) {
        activeCidrRulesCache.push({
          cidr: rule.cidr,
          type: rule.type,
          expiresAt: rule.expiresAt,
        });
      } else if (rule.ip) {
        activeIpBlocksCache.set(rule.ip, {
          type: rule.type,
          expiresAt: rule.expiresAt,
          reason: rule.reason,
        });
      }
    }

    // Mark expired rules asynchronously in DB
    if (expiredRuleIds.length > 0) {
      await IpAccessRule.updateMany(
        { _id: { $in: expiredRuleIds } },
        { $set: { status: "expired" } }
      );
    }
  } catch (err) {
    console.error("[IpSecurity] Failed to refresh IP block cache:", err.message);
  }
};

/**
 * Direct check if an IP is currently blocked (in-memory fast path).
 */
export const checkIsIpBlocked = (ip) => {
  if (!ip) return false;
  const now = new Date();

  // 1. Direct IP check
  if (activeIpBlocksCache.has(ip)) {
    const rule = activeIpBlocksCache.get(ip);
    if (rule.expiresAt && new Date(rule.expiresAt) <= now) {
      activeIpBlocksCache.delete(ip);
      // Asynchronously mark expired in DB
      IpAccessRule.updateMany(
        { ip, status: "active", expiresAt: { $lte: now } },
        { $set: { status: "expired" } }
      ).catch(() => {});
      return false;
    }
    return true;
  }

  // 2. CIDR range check
  for (const cidrRule of activeCidrRulesCache) {
    if (cidrRule.expiresAt && new Date(cidrRule.expiresAt) <= now) {
      continue;
    }
    if (isIpInCidr(ip, cidrRule.cidr)) {
      return true;
    }
  }

  return false;
};

/**
 * Add or update an IP block in the in-memory cache directly.
 */
export const addIpBlockToCache = (ip, type, expiresAt, reason = "") => {
  if (ip) {
    activeIpBlocksCache.set(ip, { type, expiresAt, reason });
  }
};

/**
 * Remove an IP block from the in-memory cache directly.
 */
export const removeIpBlockFromCache = (ip) => {
  if (ip) {
    activeIpBlocksCache.delete(ip);
  }
};

// Periodically synchronize cache and expire stale blocks every 30 seconds
const syncTimer = setInterval(() => {
  reloadIpBlockCache().catch(() => {});
}, 30000);
if (syncTimer && typeof syncTimer.unref === "function") {
  syncTimer.unref();
}

/**
 * Express Middleware: Evaluates every incoming request against the IP firewall.
 */
export const ipSecurityMiddleware = async (req, res, next) => {
  try {
    const clientIp = getClientIp(req);

    // Initial check against fast cache
    if (checkIsIpBlocked(clientIp)) {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    next();
  } catch (err) {
    // Fail-open for unanticipated middleware bugs to avoid dropping whole site, but log error
    console.error("[IpSecurityMiddleware] Error evaluating IP rules:", err);
    next();
  }
};
