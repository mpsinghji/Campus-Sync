import fs from "fs";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";
import { sendEMail } from "../middlewares/sendEmail.js";
import Admin from "../models/adminModel.js";
import Student from "../models/studentModel.js";
import Teacher from "../models/teacherModel.js";
import { Response } from "../utils/response.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const adminRegister = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log("Request Body:", req.body);

    const existingAdmin = await Admin.findOne({ email });
    console.log("Existing Admin:", existingAdmin);
    if (existingAdmin) {
      return Response(res, 400, false, "Admin already exists");
    }

    const admin = new Admin({ email, password });
    await admin.save();

    return Response(res, 201, true, "Admin successfully registered");
  } catch (error) {
    console.error("Error registering admin:", error);
    return Response(res, 500, false, "Server error", error.message);
  }
};

export const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log("Admin Login Attempt:", { email });

    if (!email || !password) {
      console.log("Missing credentials");
      return Response(res, 400, false, "Please provide email and password");
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      console.log("Admin not found for email:", email);
      return Response(res, 404, false, "Admin not found");
    }

    console.log("Admin found, verifying password");
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      console.log("Invalid password for admin:", email);
      return Response(res, 401, false, "Invalid credentials");
    }

    console.log("Password verified, generating token");
    const adminToken = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    console.log("Generating OTP");
    const loginOtp = Math.floor(100000 + Math.random() * 900000);
    const loginOtpExpire = new Date(
      Date.now() + (process.env.LOGIN_OTP_EXPIRE || 10) * 60 * 1000
    );

    console.log("Generated OTP:", loginOtp);
    console.log("OTP Expire:", loginOtpExpire);

    admin.otp = loginOtp.toString();
    admin.otpExpire = loginOtpExpire;

    console.log("Saving admin with OTP");
    const savedAdmin = await admin.save();
    console.log("Saved Admin OTP:", savedAdmin.otp);
    console.log("Saved Admin OTP Expire:", savedAdmin.otpExpire);

    console.log("Reading email template");
    let emailTemplate = fs.readFileSync(
      path.join(__dirname, "../templates/mail.html"),
      "utf-8"
    );
    emailTemplate = emailTemplate
      .replace("{{OTP_CODE}}", loginOtp)
      .replaceAll("{{MAIL}}", process.env.SMTP_USER)
      .replace("{{PORT}}", process.env.PORT)
      .replace("{{USER_ID}}", admin._id.toString());

    console.log("Sending email");
    await sendEMail({
      email,
      subject: "Verify your account",
      html: emailTemplate,
    });

    console.log("Login successful");
    return res.status(200).json({
      success: true,
      message: "Admin logged in successfully",
      token: adminToken,
      data: admin._id,
      userRole: "admin",
    });
  } catch (error) {
    console.error("Detailed login error:", {
      message: error.message,
      stack: error.stack,
      email: email
    });
    return Response(res, 500, false, "Internal server error", error.message);
  }
};

export const verifyAdminLoginOtp = async (req, res) => {
  const { id } = req.params; // Admin ID
  const { otp } = req.body; // OTP

  try {
    console.log("Verifying OTP for admin ID:", id);
    console.log("Received OTP:", otp);

    const admin = await Admin.findById(id);
    if (!admin) {
      console.log("Admin not found");
      return Response(res, 404, false, "Admin not found");
    }

    console.log("Stored OTP:", admin.otp);
    console.log("OTP Expire:", admin.otpExpire);

    if (!admin.otp || !admin.otpExpire) {
      console.log("No OTP found or expired");
      return Response(res, 400, false, "Invalid OTP");
    }

    if (new Date() > admin.otpExpire) {
      console.log("OTP has expired");
      return Response(res, 400, false, "Invalid OTP");
    }

    if (String(admin.otp) !== String(otp)) {
      console.log("Invalid OTP");
      return Response(res, 400, false, "Invalid OTP");
    }

    console.log("OTP verified successfully, generating token");
    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    // Clear OTP after successful verification
    admin.otp = undefined;
    admin.otpExpire = undefined;
    await admin.save();
    console.log("OTP cleared from database");

    // Create user data object excluding sensitive information
    const userData = {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
      address: admin.address,
      qualification: admin.qualification,
      role: "admin"
    };

    // Set token cookie
    res.cookie("adminToken", token, {
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    // Set user data cookie
    res.cookie("adminData", JSON.stringify(userData), {
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      secure: true,
      sameSite: "none",
    });

    return Response(res, 200, true, "Admin verified successfully", {
      token,
      user: userData
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return Response(res, 500, false, "Server error", error.message);
  }
};

export const resendAdminLoginOtp = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Admin ID is required",
      });
    }
    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    const loginOtp = Math.floor(100000 + Math.random() * 900000);
    const loginOtpExpire = new Date(
      Date.now() + process.env.OTP_EXPIRE * 60 * 1000
    );

    admin.otp = loginOtp;
    admin.otpExpire = loginOtpExpire;
    await admin.save();

    let emailTemplate = fs.readFileSync(
      path.join(__dirname, "../templates/mail.html"),
      "utf-8"
    );
    emailTemplate = emailTemplate
      .replace("{{OTP_CODE}}", loginOtp)
      .replaceAll("{{MAIL}}", process.env.SMTP_USER)
      .replace("{{PORT}}", process.env.PORT)
      .replace("{{USER_ID}}", admin._id.toString());

    await sendEMail({
      email: admin.email,
      subject: "Verify your account",
      html: emailTemplate,
    });

    return res.status(200).json({
      success: true,
      message: "Otp Resend To Admin Email Successfully",
    });
  } catch (error) {
    return Response(res, 500, false, "Server error", error.message);
  }
};

export const getDashboardData = async (req, res) => {
  try {
    // Count total users based on their roles
    const totalStudents = await Student.countDocuments({ role: "student" });
    const totalTeachers = await Teacher.countDocuments({ role: "teacher" });
    const totalAdmins = await Admin.countDocuments({ role: "admin" });

    return res.status(200).json({
      totalStudents,
      totalTeachers,
      totalAdmins,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAdminProfile = async (req, res) => {
  try {
    const admin = req.user;
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json({ email: admin.email });
  } catch (error) {
    console.error("Error fetching admin profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const adminLogout = async (req, res) => {
  try {
    // Clear all admin related cookies
    res.clearCookie('adminToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none"
    });

    res.clearCookie('adminData', {
      secure: process.env.NODE_ENV === "production",
      sameSite: "none"
    });

    return Response(res, 200, true, "Logged out successfully");
  } catch (error) {
    console.error("Logout Error:", error);
    return Response(res, 500, false, "Error during logout", error.message);
  }
};
