import Student from "../models/studentModel.js";
import { Response } from "../utils/response.js";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { sendEMail } from "../middlewares/sendEmail.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const studentRegister = async (req, res) => {
  const { email, password, rollno, mobileno, gender, name } = req.body;

  try {
    console.log("Request Body:", req.body);

    const existingStudent = await Student.findOne({
      $or: [{ email }, { rollno }],
    });
    console.log("Existing student:", existingStudent);
    if (existingStudent) {
      return Response(
        res,
        400,
        false,
        "Student with this email or roll number already exists"
      );
    }

    const student = new Student({
      email,
      password,
      rollno,
      mobileno,
      gender,
      name,
    });
    await student.save();

    return Response(res, 201, true, "Student successfully registered");
  } catch (error) {
    console.error("Error registering student:", error);
    return Response(res, 500, false, "Server error", error.message);
  }
};

export const studentLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return Response(res, 400, false, "Please provide email and password");
    }
    const student = await Student.findOne({ email });
    if (!student) {
      return Response(res, 404, false, "Student not found");
    }

    const isPasswordValid = await student.comparePassword(password);
    if (!isPasswordValid) {
      return Response(res, 401, false, "Invalid credentials");
    }

    const studenttoken = jwt.sign(
      { id: student._id, role: "student" },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    const loginOtp = Math.floor(100000 + Math.random() * 900000);
    const loginOtpExpire = new Date(
      Date.now() + process.env.LOGIN_OTP_EXPIRE * 60 * 1000
    );

    student.otp = loginOtp;
    student.otpExpire = loginOtpExpire;
    await student.save();

    let emailTemplate = fs.readFileSync(
      path.join(__dirname, "../templates/mail.html"),
      "utf-8"
    );

    emailTemplate = emailTemplate
      .replace("{{OTP_CODE}}", loginOtp)
      .replaceAll("{{MAIL}}", process.env.SMTP_USER)
      .replace("{{PORT}}", process.env.PORT)
      .replace("{{USER_ID}}", student._id.toString());

    await sendEMail({
      email,
      subject: "Verify your account",
      html: emailTemplate,
    });
    return res.status(200).json({
      success: true,
      message: "OTP sent to your email",
      token: studenttoken,
      data: student._id,
      userRole: "student",
    })
  } catch (error) {
    console.error(`Error logging in student for email :${email}`, error);
    return Response(res, 500, false, "Internal Server error", error.message);
  }
};

export const verifyStudentLoginOtp = async (req, res) => {
  const { id } = req.params;
  const { otp } = req.body;

  try {
    const student = await Student.findById(id);
    if (!student) {
      return Response(res, 404, false, "Student not found");
    }

    if (String(student.otp) !== String(otp)) {
      return Response(res, 400, false, "Invalid OTP");
    }

    const token = jwt.sign(
      { id: student._id, role: "student" },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    const isProduction = process.env.NODE_ENV === "production";
    const cookieOptions = {
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    };

    res.cookie("studentToken", token, cookieOptions);

    return Response(res, 200, true, "Student OTP verified successfully", {
      token,
    });
  } catch (error) {
    return Response(res, 500, false, "Server error", error.message);
  }
};

export const resendStudentLoginOtp = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Student ID is required",
      });
    }
    const student = await Student.findById(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const loginOtp = Math.floor(100000 + Math.random() * 900000);
    const loginOtpExpire = new Date(
      Date.now() + process.env.OTP_EXPIRE * 60 * 1000
    );

    student.otp = loginOtp;
    student.otpExpire = loginOtpExpire;
    await student.save();

    let emailTemplate = fs.readFileSync(
      path.join(__dirname, "../templates/mail.html"),
      "utf-8"
    );

    emailTemplate = emailTemplate
      .replace("{{OTP_CODE}}", loginOtp)
      .replaceAll("{{MAIL}}", process.env.SMTP_USER)
      .replace("{{PORT}}", process.env.PORT)
      .replace("{{USER_ID}}", student._id.toString());

    await sendEMail({
      email: student.email,
      subject: "Verify your account",
      html: emailTemplate,
    });

    return res.status(200).json({
      success: true,
      message: "OTP sent to your email",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find();
    res.status(200).json({ success: true, students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteStudent = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedStudent = await Student.findByIdAndDelete(id);
    if (!deletedStudent) {
      return Response(res, 404, false, "Student not found");
    }
    return Response(res, 200, true, "Student deleted successfully");
  } catch (error) {
    return Response(res, 500, false, "Server error", error.message);
  }
};

export const getStudentProfile = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const student = await Student.findById(decoded.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json({
      success: true,
      name: student.name,
      rollno: student.rollno,
      gender: student.gender,
      mobileno: student.mobileno,
      email: student.email,
    });
  } catch (error) {
    console.error("Error fetching student profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getStudentCount = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments({ role: "student" });
    res.status(200).json({ success: true, totalStudents });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

export const updateStudentProfile = async (req, res) => {
  try {
    const { name, email, mobileno, gender } = req.body;
    // Extract token from header
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const studentId = decoded.id;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (name) student.name = name;
    if (email) student.email = email;
    if (mobileno) student.mobileno = mobileno;
    if (gender) student.gender = gender;

    await student.save();

    res.status(200).json({ success: true, message: "Profile updated successfully", student });
  } catch (error) {
    console.error("Error updating student profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, mobileno, gender, rollno } = req.body;

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    if (name) student.name = name;
    if (email) student.email = email;
    if (mobileno) student.mobileno = mobileno;
    if (gender) student.gender = gender;
    if (rollno) student.rollno = rollno;

    await student.save();

    res.status(200).json({ success: true, message: "Student updated successfully", student });
  } catch (error) {
    console.error("Error updating student:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
