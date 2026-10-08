import { SystemSettings } from "../models/systemSettingsModel.js";

/**
 * Resolves the dynamic JWT expiration based on Super Admin system settings.
 * Supports "hours" and "days". Defaults to "7d" if not set.
 */
export const getTokenExpiresIn = async () => {
  try {
    const settings = await SystemSettings.findOne({ key: "otp_settings" });
    if (settings) {
      const unit = settings.sessionTimeoutUnit || "days";
      const value = settings.sessionTimeoutValue || settings.sessionTimeoutDays || 7;
      const safeVal = Math.max(1, parseInt(value, 10) || 1);
      if (unit === "hours") {
        return `${safeVal}h`;
      }
      return `${safeVal}d`;
    }
  } catch (err) {
    console.error("Error retrieving session timeout settings:", err.message);
  }
  return "7d";
};
