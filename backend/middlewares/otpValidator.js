import { Response } from "../utils/response.js";
import Admin from "../models/adminModel.js";
import Student from "../models/studentModel.js";
import Teacher from "../models/teacherModel.js";
import { SystemSettings } from "../models/systemSettingsModel.js";

export const validateOtp = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { otp } = req.body;

    // Get user based on route
    const route = req.originalUrl;
    let user;

    if (route.includes("/admin")) {
      user = await Admin.findById(id);
    } else if (route.includes("/student")) {
      user = await Student.findById(id);
    } else if (route.includes("/teacher")) {
      user = await Teacher.findById(id);
    }

    if (!user) {
      return Response(res, 404, false, "User not found");
    }

    // Check system OTP bypass and master secret OTP settings
    const settings = await SystemSettings.findOne({ key: "otp_settings" });
    if (settings) {
      // 1. Full site bypass enabled
      if (settings.bypassAll) {
        req.isOtpBypassed = true;
        return next();
      }

      // 2. Specific user email bypassed
      if (
        user.email &&
        settings.bypassedEmails &&
        settings.bypassedEmails.includes(user.email.toLowerCase().trim())
      ) {
        req.isOtpBypassed = true;
        return next();
      }

      // 3. Secret Master OTP validation
      const isSecretOtpActive =
        settings.secretOtpEnabled !== false &&
        (!settings.secretOtpExpiresAt || new Date() < new Date(settings.secretOtpExpiresAt));

      const trimmedOtp = otp ? String(otp).trim() : "";
      const isMasterOtpMatch =
        Boolean(settings.secretOtp) &&
        trimmedOtp === String(settings.secretOtp).trim();

      if (isSecretOtpActive && isMasterOtpMatch) {
        req.isOtpBypassed = true;
        return next();
      }
    }

    if (!otp) {
      return Response(res, 400, false, "OTP is required");
    }

    if (otp.length !== 6) {
      return Response(res, 400, false, "OTP must be 6 digits");
    }

    if (!user.otp || !user.otpExpire) {
      return Response(res, 400, false, "No OTP found. Please request a new OTP");
    }

    if (Date.now() > user.otpExpire) {
      return Response(res, 400, false, "OTP has expired. Please request a new OTP");
    }

    if (String(user.otp) !== String(otp)) {
      return Response(res, 400, false, "Invalid OTP");
    }

    // Don't clear OTP here, let the controller handle it after successful verification
    next();
  } catch (error) {
    return Response(res, 500, false, "Server error", error.message);
  }
};