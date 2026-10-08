import crypto from "crypto";
import IpSecurityEvent from "../models/ipSecurityEventModel.js";
import IpAccessRule from "../models/ipAccessRuleModel.js";
import { getClientIp, getIpVersion, isLocalIp } from "../utils/ipUtils.js";
import { addIpBlockToCache } from "./ipSecurityMiddleware.js";

// In-memory tracker for rapid detection of abusive bursts (short rolling window)
const failureTracker = new Map(); // ip -> { failedAuthCount, rateLimitCount, lastFailureTime }

/**
 * Helper to log explicit security events directly from controllers.
 */
export const logSecurityEvent = async ({
  ip,
  eventType,
  method = "",
  path = "",
  statusCode = 200,
  isAuthenticated = false,
  accountId = null,
  accountRole = null,
  accountEmail = null,
  userAgent = "",
  requestId = "",
  metadata = {},
}) => {
  try {
    const ipVersion = getIpVersion(ip) || "v4";
    // Strictly omit account identity unless authenticated to prevent attacker spoofing/fake accounts
    const validAccountId = isAuthenticated && accountId ? accountId : null;
    const validAccountRole = isAuthenticated && accountRole ? accountRole : null;
    const validAccountEmail = isAuthenticated && accountEmail ? accountEmail : null;

    await IpSecurityEvent.create({
      ip,
      ipVersion,
      timestamp: new Date(),
      eventType,
      method,
      path,
      statusCode,
      isAuthenticated: Boolean(isAuthenticated),
      accountId: validAccountId,
      accountRole: validAccountRole,
      accountEmail: validAccountEmail,
      userAgent: (userAgent || "").slice(0, 300),
      requestId: requestId || crypto.randomUUID(),
      metadata,
    });
  } catch (err) {
    // Non-blocking catch
    console.error("[IpSecurityLogger] Error logging security event:", err.message);
  }
};

/**
 * Evaluates whether an IP has crossed threshold for automatic defense.
 */
const checkAutomaticDefense = async (ip, eventType) => {
  // Requirement 18: Never automatically block localhost or loopback infrastructure
  if (!ip || isLocalIp(ip)) {
    return;
  }

  const now = Date.now();
  let tracker = failureTracker.get(ip);

  if (!tracker || now - tracker.lastFailureTime > 10 * 60 * 1000) {
    tracker = { failedAuthCount: 0, rateLimitCount: 0, lastFailureTime: now };
  }

  tracker.lastFailureTime = now;

  if (eventType === "RATE_LIMIT_TRIGGERED") {
    tracker.rateLimitCount += 1;
  } else if (eventType === "LOGIN_FAILURE" || eventType === "OTP_FAILURE") {
    tracker.failedAuthCount += 1;
  }

  failureTracker.set(ip, tracker);

  // Conservative threshold: 5+ rate-limit triggers OR 15+ auth failures within 10 minutes
  if (tracker.rateLimitCount >= 5 || tracker.failedAuthCount >= 15) {
    try {
      const existingActive = await IpAccessRule.findOne({ ip, status: "active" });
      if (!existingActive) {
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes temporary defense block
        const reason =
          tracker.rateLimitCount >= 5
            ? "Automated security block: Excessive rate limit exhaustion (5+ triggers)"
            : "Automated security block: Repeated credential failures (15+ failed attempts)";

        await IpAccessRule.create({
          ip,
          type: "temporary_block",
          status: "active",
          reason,
          source: "automatic",
          createdBy: "Automated Defense System",
          expiresAt,
        });

        addIpBlockToCache(ip, "temporary_block", expiresAt, reason);

        await logSecurityEvent({
          ip,
          eventType: "IP_TEMP_BLOCKED",
          metadata: {
            source: "automatic",
            rateLimitCount: tracker.rateLimitCount,
            failedAuthCount: tracker.failedAuthCount,
          },
        });

        // Reset tracker once block is issued
        failureTracker.delete(ip);
      }
    } catch (autoErr) {
      console.error("[IpSecurity] Automatic defense creation error:", autoErr.message);
    }
  }
};

/**
 * Express middleware for asynchronous request & security event logging.
 */
export const ipLoggingMiddleware = (req, res, next) => {
  const requestId = crypto.randomUUID();
  req.requestId = requestId;

  res.on("finish", () => {
    // Run asynchronously after response is sent to avoid adding latency
    setImmediate(async () => {
      try {
        const clientIp = getClientIp(req);
        const path = req.originalUrl || req.url || "";
        const method = req.method;
        const statusCode = res.statusCode;
        const userAgent = req.headers["user-agent"] || "";

        // Identify authenticated user identity if available on req
        const isAuthenticated = Boolean(req.user);
        const accountId = req.user?._id?.toString() || null;
        const accountRole = req.role || req.user?.role || null;
        const accountEmail = req.user?.email || null;

        // Skip static asset files & health checks from polluting security logs
        if (
          path.startsWith("/assets/") ||
          path.endsWith(".css") ||
          path.endsWith(".js") ||
          path.endsWith(".png") ||
          path.endsWith(".jpg") ||
          path.endsWith(".svg") ||
          path.endsWith(".ico")
        ) {
          return;
        }

        // Determine specific event type
        let eventType = "REQUEST";
        const lowerPath = path.toLowerCase();

        // Suspicious path probe detection
        if (
          lowerPath.includes("../") ||
          lowerPath.includes(".env") ||
          lowerPath.includes("wp-admin") ||
          lowerPath.includes("phpmyadmin") ||
          lowerPath.includes("/etc/passwd") ||
          lowerPath.includes("eval(")
        ) {
          eventType = "SUSPICIOUS_REQUEST";
        } else if (statusCode === 429) {
          eventType = "RATE_LIMIT_TRIGGERED";
        } else if (statusCode === 403) {
          eventType = "ACCESS_DENIED";
        } else if (statusCode === 401) {
          eventType = "UNAUTHORIZED_REQUEST";
        } else if (lowerPath.includes("/login")) {
          if (lowerPath.includes("/verify/")) {
            eventType = statusCode < 400 ? "OTP_SUCCESS" : "OTP_FAILURE";
          } else if (lowerPath.includes("/resend/")) {
            eventType = "OTP_REQUEST";
          } else {
            eventType = statusCode < 400 ? "LOGIN_SUCCESS" : "LOGIN_FAILURE";
          }
        }

        // Write event to database (strictly sanitizing bodies/passwords/OTPs)
        await logSecurityEvent({
          ip: clientIp,
          eventType,
          method,
          path,
          statusCode,
          isAuthenticated,
          accountId,
          accountRole,
          accountEmail,
          userAgent,
          requestId,
          metadata: {
            origin: req.headers["origin"] || "",
          },
        });

        // Trigger automatic defense checks for suspicious activity
        if (
          eventType === "RATE_LIMIT_TRIGGERED" ||
          eventType === "LOGIN_FAILURE" ||
          eventType === "OTP_FAILURE"
        ) {
          await checkAutomaticDefense(clientIp, eventType);
        }
      } catch (logErr) {
        // Safe catch
      }
    });
  });

  next();
};
