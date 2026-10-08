import Teacher from "../models/teacherModel.js";
import { SystemSettings } from "../models/systemSettingsModel.js";
import { Response } from "../utils/response.js";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { sendEMail } from "../middlewares/sendEmail.js";
import { getTokenExpiresIn } from "../utils/tokenConfig.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const teacherRegister = async (req, res) => {
  const {
    email,
    password,
    name,
    phone,
    employeeId,
    designation,
    department,
    subject,
    qualification,
    experience,
    gender,
    dob,
    joiningDate,
    bloodGroup,
    address,
    city,
    responsibility,
  } = req.body;

  try {
    console.log("Teacher Register Request:", { email, name, department, designation, responsibility });

    // Check if the teacher already exists
    const existingteacher = await Teacher.findOne({ email: email?.toLowerCase().trim() });
    if (existingteacher) {
      return Response(res, 400, false, "Teacher with this email already exists");
    }

    // Create a new teacher
    const teacher = new Teacher({
      email: email?.toLowerCase().trim(),
      password,
      name: name?.trim() || "Teacher",
      phone: phone?.trim() || "",
      employeeId: employeeId?.trim() || "",
      designation: designation?.trim() || "Assistant Professor",
      responsibility: responsibility?.trim() || "Teacher",
      department: department?.trim() || "Computer Science",
      subject: subject?.trim() || "",
      qualification: qualification?.trim() || "M.Tech / Ph.D",
      experience: experience?.trim() || "",
      gender: gender || "male",
      dob: dob || "",
      joiningDate: joiningDate || "",
      bloodGroup: bloodGroup || "",
      address: address || "",
      city: city || "",
    });
    await teacher.save();

    return Response(res, 201, true, "Teacher successfully registered", { teacher });
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

    if (teacher.isRestricted) {
      return Response(res, 403, false, `Your account has been restricted by administration. ${teacher.restrictionReason ? "Reason: " + teacher.restrictionReason : "Please contact campus authorities."}`);
    }

    const expiresIn = await getTokenExpiresIn();
    const teachertoken = jwt.sign(
      { id: teacher._id, role: "teacher" },
      process.env.JWT_SECRET,
      {
        expiresIn,
      }
    );

    const settings = await SystemSettings.findOne({ key: "otp_settings" });
    const isGlobalBypass = settings?.bypassAll === true;
    const isUserBypassed = settings?.bypassedEmails && settings.bypassedEmails.includes(email.toLowerCase().trim());

    if (isGlobalBypass || isUserBypassed) {
      console.log("Teacher login: OTP bypassed by system settings");
      const userData = {
        id: teacher._id,
        name: teacher.name || "Faculty Member",
        email: teacher.email,
        role: "teacher",
        responsibility: teacher.responsibility || "Teacher",
        department: teacher.department || "Academics",
      };

      const isProduction = process.env.NODE_ENV === "production";
      const unit = settings?.sessionTimeoutUnit || "days";
      const val = settings?.sessionTimeoutValue || settings?.sessionTimeoutDays || 7;
      const sessionMs = unit === "hours" ? val * 60 * 60 * 1000 : val * 24 * 60 * 60 * 1000;
      const cookieOptions = {
        expires: new Date(Date.now() + sessionMs),
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
      };

      res.cookie("teacherToken", teachertoken, cookieOptions);
      res.cookie("teacherData", JSON.stringify({
        ...userData,
        token: teachertoken,
        user: userData,
      }), {
        ...cookieOptions,
        httpOnly: false,
      });

      return res.status(200).json({
        success: true,
        bypassOtp: true,
        message: "Faculty login successful (OTP bypassed by system settings)",
        token: teachertoken,
        data: teacher._id,
        user: userData,
        userRole: "teacher",
      });
    }

    const loginOtp = Math.floor(100000 + Math.random() * 900000);
    const loginOtpExpire = new Date(
      Date.now() + (Number(process.env.LOGIN_OTP_EXPIRE) || 15) * 60 * 1000
    );
    teacher.otp = loginOtp;
    teacher.otpExpire = loginOtpExpire;
    if (!teacher.name) {
      teacher.name = "Faculty Member";
    }
    await teacher.save();

    let emailSent = false;
    try {
      let emailTemplate = fs.readFileSync(
        path.join(__dirname, "../templates/mail.html"),
        "utf-8"
      );
      emailTemplate = emailTemplate
        .replace("{{OTP_CODE}}", loginOtp)
        .replaceAll("{{MAIL}}", process.env.SMTP_USER || "admin@campus-sync.com")
        .replace("{{PORT}}", process.env.PORT || "5000")
        .replace("{{USER_ID}}", teacher._id.toString());

      await sendEMail({
        email,
        subject: "Verify your account",
        html: emailTemplate,
      });
      emailSent = true;
      console.log(`✉️ Teacher OTP email sent to ${email}: ${loginOtp}`);
    } catch (mailErr) {
      console.warn(`⚠️ [Mail Service Warning] Could not send OTP email to teacher ${email}:`, mailErr.message);
      console.log(`🔐 [LOCAL/FALLBACK OTP] Teacher (${email}) OTP is: ${loginOtp}`);
    }

    return res.status(200).json({
      success: true,
      message: emailSent
        ? "OTP sent to your email successfully"
        : `OTP generated (${loginOtp}). Check console or use Master Secret OTP to sign in.`,
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

    if (!req.isOtpBypassed && String(teacher.otp) !== String(otp)) {
      return Response(res, 400, false, "Invalid OTP");
    }

    const expiresIn = await getTokenExpiresIn();
    const token = jwt.sign(
      { id: teacher._id, role: "teacher" },
      process.env.JWT_SECRET,
      {
        expiresIn,
      }
    );

    const settings = await SystemSettings.findOne({ key: "otp_settings" });
    const unit = settings?.sessionTimeoutUnit || "days";
    const val = settings?.sessionTimeoutValue || settings?.sessionTimeoutDays || 7;
    const sessionMs = unit === "hours" ? val * 60 * 60 * 1000 : val * 24 * 60 * 60 * 1000;

    const isProduction = process.env.NODE_ENV === "production";
    const cookieOptions = {
      expires: new Date(Date.now() + sessionMs),
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    };

    res.cookie("teacherToken", token, cookieOptions);

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
    const rawTeachers = await Teacher.find().sort({ createdAt: -1 });
    const teachers = rawTeachers.map((t) => {
      const obj = t.toObject();
      delete obj.password;
      obj.isRestricted = Boolean(obj.isRestricted);
      obj.restrictionReason = obj.restrictionReason || "";
      return obj;
    });
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
    let teacherId = req.user?.id || req.user?._id;
    if (!teacherId && req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        teacherId = decoded?.id;
      } catch (e) {}
    }

    let teacher = null;
    if (teacherId) {
      teacher = await Teacher.findById(teacherId);
    }
    if (!teacher && req.headers["x-user-email"]) {
      teacher = await Teacher.findOne({ email: req.headers["x-user-email"].toLowerCase().trim() });
    }
    if (!teacher) {
      teacher = await Teacher.findOne({});
    }

    if (!teacher) {
      return res.status(404).json({ success: false, message: "Teacher not found" });
    }

    res.status(200).json({
      success: true,
      name: teacher.name || "Faculty Member",
      email: teacher.email,
      phone: teacher.phone || "",
      responsibility: teacher.responsibility || "Teacher",
      department: teacher.department || "Academics",
      officeRoom: teacher.officeRoom || "",
      qualification: teacher.qualification || "",
      experience: teacher.experience || "",
    });
  } catch (error) {
    console.error("Error fetching teacher profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateTeacherProfile = async (req, res) => {
  try {
    const { email, name, phone, department, officeRoom } = req.body;
    let teacherId = req.user?.id || req.user?._id;
    if (!teacherId && req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        teacherId = decoded?.id;
      } catch (e) {}
    }

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    if (email) teacher.email = email;
    if (name) teacher.name = name;
    if (phone) teacher.phone = phone;
    if (department) teacher.department = department;
    if (officeRoom) teacher.officeRoom = officeRoom;

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
    const {
      name,
      email,
      phone,
      employeeId,
      designation,
      department,
      subject,
      qualification,
      experience,
      responsibility,
    } = req.body;

    const teacher = await Teacher.findById(id);
    if (!teacher) {
      return res.status(404).json({ success: false, message: "Teacher not found" });
    }

    if (name) teacher.name = name;
    if (email) teacher.email = email;
    if (phone !== undefined) teacher.phone = phone;
    if (employeeId !== undefined) teacher.employeeId = employeeId;
    if (designation !== undefined) teacher.designation = designation;
    if (department !== undefined) teacher.department = department;
    if (subject !== undefined) teacher.subject = subject;
    if (qualification !== undefined) teacher.qualification = qualification;
    if (experience !== undefined) teacher.experience = experience;
    if (responsibility !== undefined) teacher.responsibility = responsibility;

    await teacher.save();

    res.status(200).json({ success: true, message: "Teacher updated successfully", teacher });
  } catch (error) {
    console.error("Error updating teacher:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const changeTeacherPassword = async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  try {
    let teacherId = req.user?._id || req.user?.id;
    if (!teacherId && req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        teacherId = decoded?.id;
      } catch (e) {}
    }

    if (!teacherId) {
      return res.status(401).json({ success: false, message: "Unauthorized: Session expired" });
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: "Please fill all password fields" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: "New passwords do not match" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ success: false, message: "Teacher not found" });
    }

    const isMatch = await teacher.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Current password is incorrect" });
    }

    teacher.password = newPassword;
    await teacher.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully!",
    });
  } catch (error) {
    console.error("Error changing teacher password:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
