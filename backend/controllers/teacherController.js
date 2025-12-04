import Teacher from "../models/teacherModel.js";
import { Response } from "../utils/response.js";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { sendEMail } from "../middlewares/sendEmail.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const teacherRegister = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log("Request Body:", req.body);

    // Check if the teacher already exists
    const existingteacher = await Teacher.findOne({ email });
    console.log("Existing teacher:", existingteacher);
    if (existingteacher) {
      return Response(res, 400, false, "teacher already exists");
    }

    // Create a new teacher
    const teacher = new Teacher({ email, password });
    await teacher.save();

    return Response(res, 201, true, "teacher successfully registered");
  } catch (error) {
    console.error("Error registering teacher:", error);
    return Response(res, 500, false, "Server error", error.message);
  }
};

export const teacherLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return Response(res, 400, false, "Email and password are required");
    }
    const teacher = await Teacher.findOne({ email });
    if (!teacher) {
      return Response(res, 404, false, "Teacher not found");
    }

    const isPasswordValid = await teacher.comparePassword(password);
    if (!isPasswordValid) {
      return Response(res, 401, false, "Invalid credentials");
    }

    const teachertoken = jwt.sign(
      { id: teacher._id, role: "teacher" },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    const loginOtp = Math.floor(100000 + Math.random() * 900000);
    const loginOtpExpire = new Date(
      Date.now() + process.env.LOGIN_OTP_EXPIRE * 60 * 1000
    );
    teacher.otp = loginOtp;
    teacher.otpExpire = loginOtpExpire;
    await teacher.save();

    let emailTemplate = fs.readFileSync(
      path.join(__dirname, "../templates/mail.html"),
      "utf-8"
    );
    emailTemplate = emailTemplate
      .replace("{{OTP_CODE}}", loginOtp)
      .replaceAll("{{MAIL}}", process.env.SMTP_USER)
      .replace("{{PORT}}", process.env.PORT)
      .replace("{{USER_ID}}", teacher._id.toString());

    await sendEMail({
      email,
      subject: "Verify your account",
      html: emailTemplate,
    });
    return res.status(200).json({
      success: true,
      message: "Teacher logged in successfully",
      token: teachertoken,
      data: teacher._id,
      userRole: "teacher",
    });
  } catch (error) {
    console.error(`Error logging in teacher for email: ${email}`, error);
    return Response(res, 500, false, "Internal Server error", error.message);
  }
};

export const verifyTeacherLoginOtp = async (req, res) => {
  const { id } = req.params;
  const { otp } = req.body;

  try {
    const teacher = await Teacher.findById(id);
    if (!teacher) {
      return Response(res, 404, false, "Teacher not found");
    }

    if (String(teacher.otp) !== String(otp)) {
      return Response(res, 400, false, "Invalid OTP");
    }

    const token = jwt.sign(
      { id: teacher._id, role: "teacher" },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.cookie("teacherToken", token, {
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    return res.status(200).json({
      success: true,
      message: "Teacher verified successfully",
      token,
      data: teacher._id,
      userRole: "teacher",
    });
  } catch (error) {
    return Response(res, 500, false, "Server error", error.message);
  }
};

export const resendTeacherLoginOtp = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Teacher ID is required",
      });
    }
    const teacher = await Teacher.findById(id);

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    const loginOtp = Math.floor(100000 + Math.random() * 900000);
    const loginOtpExpire = new Date(
      Date.now() + process.env.OTP_EXPIRE * 60 * 1000
    );

    teacher.otp = loginOtp;
    teacher.otpExpire = loginOtpExpire;
    await teacher.save();

    let emailTemplate = fs.readFileSync(
      path.join(__dirname, "../templates/mail.html"),
      "utf-8"
    );
    emailTemplate = emailTemplate
      .replace("{{OTP_CODE}}", loginOtp)
      .replaceAll("{{MAIL}}", process.env.SMTP_USER)
      .replace("{{PORT}}", process.env.PORT)
      .replace("{{USER_ID}}", teacher._id.toString());

    await sendEMail({
      email: teacher.email,
      subject: "Verify your account",
      html: emailTemplate,
    });

    return res.status(200).json({
      success: true,
      message: "Teacher login OTP sent successfully",
    });
  } catch (error) {
    return Response(res, 500, false, "Server error", error.message);
  }
};

export const getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find();
    res.status(200).json({ success: true, teachers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteTeacher = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedTeacher = await Teacher.findByIdAndDelete(id);
    if (!deletedTeacher) {
      return Response(res, 404, false, "Teacher not found");
    }
    return Response(res, 200, true, "Teacher deleted successfully");
  } catch (error) {
    return Response(res, 500, false, "Server error", error.message);
  }
};

export const getTeacherProfile = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({});
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    res.status(200).json({ email: teacher.email });
  } catch (error) {
    console.error("Error fetching teacher profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateTeacherProfile = async (req, res) => {
  try {
    const { email } = req.body;
    const teacherId = req.user.id; // Assuming auth middleware attaches user to req

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    if (email) teacher.email = email;

    await teacher.save();

    res.status(200).json({ success: true, message: "Profile updated successfully", teacher });
  } catch (error) {
    console.error("Error updating teacher profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;

    const teacher = await Teacher.findById(id);
    if (!teacher) {
      return res.status(404).json({ success: false, message: "Teacher not found" });
    }

    if (name) teacher.name = name;
    if (email) teacher.email = email;

    await teacher.save();

    res.status(200).json({ success: true, message: "Teacher updated successfully", teacher });
  } catch (error) {
    console.error("Error updating teacher:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
