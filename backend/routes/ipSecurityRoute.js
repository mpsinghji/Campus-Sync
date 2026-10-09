import express from "express";
import {
  getIpSecurityOverview,
  getIpActivity,
  getIpRules,
  getIpDetails,
  blockIp,
  banIp,
  unblockIp,
  resetIpRateLimit,
  safelistIp,
  removeSafelistIp,
  getIpAuditLogs,
} from "../controllers/ipSecurityController.js";
import { isAuthenticated, requireSuperAdmin } from "../middlewares/auth.js";

const router = express.Router();

// Strict RBAC: All IP Security management endpoints are Superadmin-only
router.use(isAuthenticated, requireSuperAdmin);

// Dashboard summary
router.get("/overview", getIpSecurityOverview);

// Live & recent activity table
router.get("/activity", getIpActivity);

// Active & historical rules list
router.get("/rules", getIpRules);

// Single IP security deep-dive
router.get("/details/:ip", getIpDetails);

// Actions
router.post("/block", blockIp);
router.post("/ban", banIp);
router.post("/unblock", unblockIp);
router.post("/reset-rate-limit", resetIpRateLimit);
router.post("/safelist", safelistIp);
router.post("/remove-safelist", removeSafelistIp);

// Audit logs
router.get("/audit-logs", getIpAuditLogs);

export default router;
