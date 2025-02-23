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
    if (!email || !password)
      return Response(res, 400, false, "Please provide email and password");

    const admin = await Admin.findOne({ email });
    if (!admin) return Response(res, 404, false, "Admin not found");

    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid)
      return Response(res, 401, false, "Invalid credentials");

    const adminToken = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    const loginOtp = Math.floor(100000 + Math.random() * 900000);
    const loginOtpExpire = new Date(
      Date.now() + process.env.LOGIN_OTP_EXPIRE * 60 * 1000
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
      email,
      subject: "Verify your account",
      html: emailTemplate,
    });
    return res.status(200).json({
      success: true,
      message: "Admin logged in successfully",
      token: adminToken,
      data: admin._id,
      userRole: "admin",
    });
  } catch (error) {
    console.error(`Error during admin login for email: ${email}`, error);
    return Response(res, 500, false, "Internal server error");
  }
};

export const verifyAdminLoginOtp = async (req, res) => {
  const { id } = req.params; // Admin ID
  const { otp } = req.body; // OTP

  try {
    const admin = await Admin.findById(id);
    if (!admin) {
      return Response(res, 404, false, "Admin not found ");
    }

    if (String(admin.otp) !== String(otp)) {
      return Response(res, 400, false, "Invalid OTP");
    }

    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.cookie("adminToken", token, {
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
    });

    return Response(res, 200, true, "Admin OTP verified successfully", {
      token,
    });
  } catch (error) {
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
    const admin = await Admin.findOne({});
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json({ email: admin.email });
  } catch (error) {
    console.error("Error fetching admin profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
