import express from "express";
import {
  getOtpSettings,
  updateOtpSettings,
  addBypassedEmail,
  removeBypassedEmail,
  checkBypassStatus,
} from "../controllers/securityController.js";

const router = express.Router();

router.get("/otp-settings", getOtpSettings);
router.put("/otp-settings", updateOtpSettings);
router.post("/bypass-email", addBypassedEmail);
router.delete("/bypass-email", removeBypassedEmail);
router.get("/check-bypass", checkBypassStatus);

export default router;
