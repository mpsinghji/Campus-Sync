import { Response } from "../utils/response.js";
import Admin from "../models/adminModel.js";
import Student from "../models/studentModel.js";
import Teacher from "../models/teacherModel.js";

export const validateOtp = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { otp } = req.body;

    if (!otp) {
      return Response(res, 400, false, "OTP is required");
    }

    if (otp.length !== 6) {
      return Response(res, 400, false, "OTP must be 6 digits");
    }

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