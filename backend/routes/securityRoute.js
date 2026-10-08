import express from "express";
import {
  getOtpSettings,
  updateOtpSettings,
  addBypassedEmail,
  removeBypassedEmail,
  checkBypassStatus,
} from "../controllers/securityController.js";
import { isAuthenticated, requireSuperAdmin } from "../middlewares/auth.js";

const router = express.Router();

router.get("/otp-settings", getOtpSettings);
router.put("/otp-settings", isAuthenticated, requireSuperAdmin, updateOtpSettings);
router.post("/bypass-email", isAuthenticated, requireSuperAdmin, addBypassedEmail);
router.delete("/bypass-email", isAuthenticated, requireSuperAdmin, removeBypassedEmail);
router.get("/check-bypass", checkBypassStatus);

export default router;
