import { SystemSettings } from "../models/systemSettingsModel.js";
import Admin from "../models/adminModel.js";

const SUPER_ADMIN_EMAIL = "admin@campus-sync.com";

// Verify that the acting admin is the authorized Super Admin
export const isAuthorizedSuperAdmin = async (req) => {
  // Check from body/headers/cookie/req.user
  const requesterEmail = req.headers["x-admin-email"] || req.body?.adminEmail || req.user?.email;
  if (!requesterEmail) return false;
  return requesterEmail.toLowerCase().trim() === SUPER_ADMIN_EMAIL.toLowerCase();
};

export const getOtpSettings = async (req, res) => {
  try {
    let settings = await SystemSettings.findOne({ key: "otp_settings" });
    if (!settings) {
      settings = await SystemSettings.create({
        key: "otp_settings",
        bypassAll: false,
        bypassedEmails: [],
        secretOtp: "454545",
        secretOtpEnabled: true,
        secretOtpExpiresAt: null,
      });
    }

    // Check if secret OTP has expired
    let isExpired = false;
    if (settings.secretOtpExpiresAt && new Date() > new Date(settings.secretOtpExpiresAt)) {
      isExpired = true;
    }

    res.status(200).json({
      success: true,
      settings: {
        bypassAll: settings.bypassAll,
        bypassedEmails: settings.bypassedEmails || [],
        secretOtp: settings.secretOtp,
        secretOtpEnabled: settings.secretOtpEnabled,
        secretOtpExpiresAt: settings.secretOtpExpiresAt,
        secretOtpDurationHours: settings.secretOtpDurationHours || 0,
        isSecretOtpExpired: isExpired,
        sessionTimeoutDays: settings.sessionTimeoutDays || 7,
        sessionTimeoutUnit: settings.sessionTimeoutUnit || "days",
        sessionTimeoutValue: settings.sessionTimeoutValue || (settings.sessionTimeoutDays || 7),
        lateFeePerDay: settings.lateFeePerDay ?? 20,
        lateFeeFlatAfterDue: settings.lateFeeFlatAfterDue ?? 500,
        lateFeeGraceDays: settings.lateFeeGraceDays ?? 0,
        feeRates: settings.feeRates || {},
        updatedAt: settings.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOtpSettings = async (req, res) => {
  try {
    const {
      adminEmail,
      bypassAll,
      secretOtp,
      secretOtpEnabled,
      durationHours,
      bypassedEmails,
      sessionTimeoutDays,
      sessionTimeoutUnit,
      sessionTimeoutValue,
      lateFeePerDay,
      lateFeeFlatAfterDue,
      lateFeeGraceDays,
      feeRates,
    } = req.body;

    // Strict validation: Only admin@campus-sync.com can update these critical security settings
    if (!adminEmail || adminEmail.toLowerCase().trim() !== SUPER_ADMIN_EMAIL.toLowerCase()) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Only super admin (admin@campus-sync.com) has authorization to modify system security settings.",
      });
    }

    let settings = await SystemSettings.findOne({ key: "otp_settings" });
    if (!settings) {
      settings = new SystemSettings({ key: "otp_settings" });
    }

    if (typeof bypassAll === "boolean") {
      settings.bypassAll = bypassAll;
    }

    if (typeof secretOtpEnabled === "boolean") {
      settings.secretOtpEnabled = secretOtpEnabled;
    }

    if (sessionTimeoutUnit !== undefined) {
      settings.sessionTimeoutUnit = sessionTimeoutUnit === "hours" ? "hours" : "days";
    }

    if (sessionTimeoutValue !== undefined) {
      const val = Math.max(1, parseInt(sessionTimeoutValue, 10) || 1);
      settings.sessionTimeoutValue = val;
      if (settings.sessionTimeoutUnit === "days") {
        settings.sessionTimeoutDays = val;
      }
    } else if (sessionTimeoutDays !== undefined) {
      settings.sessionTimeoutDays = Math.max(1, parseInt(sessionTimeoutDays, 10) || 7);
      settings.sessionTimeoutValue = settings.sessionTimeoutDays;
      settings.sessionTimeoutUnit = "days";
    }

    if (lateFeePerDay !== undefined) {
      settings.lateFeePerDay = Math.max(0, parseInt(lateFeePerDay, 10) || 0);
    }

    if (lateFeeFlatAfterDue !== undefined) {
      settings.lateFeeFlatAfterDue = Math.max(0, parseInt(lateFeeFlatAfterDue, 10) || 0);
    }

    if (lateFeeGraceDays !== undefined) {
      settings.lateFeeGraceDays = Math.max(0, parseInt(lateFeeGraceDays, 10) || 0);
    }

    if (feeRates && typeof feeRates === "object") {
      settings.feeRates = feeRates;
    }

    if (secretOtp !== undefined && secretOtp !== null) {
      const cleanOtp = String(secretOtp).trim();
      if (!/^\d{6}$/.test(cleanOtp)) {
        return res.status(400).json({
          success: false,
          message: "Secret OTP must be exactly a 6-digit number.",
        });
      }
      settings.secretOtp = cleanOtp;
    }

    if (durationHours !== undefined) {
      const hours = parseInt(durationHours, 10);
      settings.secretOtpDurationHours = hours;
      if (hours > 0) {
        settings.secretOtpExpiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);
      } else {
        settings.secretOtpExpiresAt = null; // Permanent
      }
    }

    if (Array.isArray(bypassedEmails)) {
      settings.bypassedEmails = bypassedEmails.map((e) => e.toLowerCase().trim()).filter(Boolean);
    }

    settings.updatedBy = SUPER_ADMIN_EMAIL;
    await settings.save();

    res.status(200).json({
      success: true,
      message: "System settings successfully updated by Super Admin!",
      settings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addBypassedEmail = async (req, res) => {
  try {
    const { adminEmail, emailToAdd } = req.body;

    if (!adminEmail || adminEmail.toLowerCase().trim() !== SUPER_ADMIN_EMAIL.toLowerCase()) {
      return res.status(403).json({
        success: false,
        message: "Only super admin (admin@campus-sync.com) can manage OTP bypass lists.",
      });
    }

    if (!emailToAdd) {
      return res.status(400).json({ success: false, message: "Email to bypass is required." });
    }

    const cleanEmail = emailToAdd.toLowerCase().trim();
    let settings = await SystemSettings.findOne({ key: "otp_settings" });
    if (!settings) {
      settings = new SystemSettings({ key: "otp_settings" });
    }

    if (!settings.bypassedEmails.includes(cleanEmail)) {
      settings.bypassedEmails.push(cleanEmail);
      await settings.save();
    }

    res.status(200).json({
      success: true,
      message: `User ${cleanEmail} has been added to OTP bypass list.`,
      bypassedEmails: settings.bypassedEmails,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const removeBypassedEmail = async (req, res) => {
  try {
    const { adminEmail, emailToRemove } = req.body;

    if (!adminEmail || adminEmail.toLowerCase().trim() !== SUPER_ADMIN_EMAIL.toLowerCase()) {
      return res.status(403).json({
        success: false,
        message: "Only super admin (admin@campus-sync.com) can manage OTP bypass lists.",
      });
    }

    const cleanEmail = emailToRemove?.toLowerCase().trim();
    let settings = await SystemSettings.findOne({ key: "otp_settings" });
    if (settings) {
      settings.bypassedEmails = settings.bypassedEmails.filter((e) => e !== cleanEmail);
      await settings.save();
    }

    res.status(200).json({
      success: true,
      message: `User ${cleanEmail} removed from OTP bypass list.`,
      bypassedEmails: settings ? settings.bypassedEmails : [],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Check if a user or site has OTP bypass active
export const checkBypassStatus = async (req, res) => {
  try {
    const { email } = req.query;
    const settings = await SystemSettings.findOne({ key: "otp_settings" });

    if (!settings) {
      return res.status(200).json({ bypass: false });
    }

    if (settings.bypassAll) {
      return res.status(200).json({ bypass: true, reason: "global" });
    }

    if (email && settings.bypassedEmails && settings.bypassedEmails.includes(email.toLowerCase().trim())) {
      return res.status(200).json({ bypass: true, reason: "user" });
    }

    return res.status(200).json({ bypass: false });
  } catch (error) {
    res.status(500).json({ bypass: false, error: error.message });
  }
};
