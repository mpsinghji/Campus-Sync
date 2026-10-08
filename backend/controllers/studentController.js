import Student from "../models/studentModel.js";
import SystemSettings from "../models/systemSettingsModel.js";
import { Response } from "../utils/response.js";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { sendEMail } from "../middlewares/sendEmail.js";
import { getTokenExpiresIn } from "../utils/tokenConfig.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const studentRegister = async (req, res) => {
  const {
    email,
    password,
    rollno,
    mobileno,
    gender,
    name,
    batch,
    department,
    degree,
    specialization,
    durationYears,
    feePerSemester,
    semester,
    section,
    dob,
    bloodGroup,
    address,
    city,
    state,
    pincode,
    guardianName,
    guardianPhone,
    admissionDate,
  } = req.body;

  try {
    console.log("Student Register Request:", { email, rollno, name, batch, degree, department });

    const existingStudent = await Student.findOne({
      $or: [{ email: email?.toLowerCase().trim() }, { rollno: rollno?.trim() }],
    });
    if (existingStudent) {
      return Response(
        res,
        400,
        false,
        "Student with this email or roll number already exists"
      );
    }

    const student = new Student({
      email: email?.toLowerCase().trim(),
      password,
      rollno: rollno?.trim(),
      mobileno: mobileno?.trim(),
      gender: gender || "male",
      name: name?.trim(),
      batch: batch?.trim() || "Batch 2024",
      department: department?.trim() || "Computer Science",
      degree: degree?.trim() || "B.Tech",
      specialization: specialization?.trim() || "Core Computer Science",
      durationYears: Number(durationYears) || 4,
      feePerSemester: Number(feePerSemester) || 45000,
      semester: semester?.trim() || "Semester 1",
      section: section?.trim() || "A",
      dob: dob || "",
      bloodGroup: bloodGroup || "",
      address: address || "",
      city: city || "",
      state: state || "",
      pincode: pincode || "",
      guardianName: guardianName || "",
      guardianPhone: guardianPhone || "",
      admissionDate: admissionDate || "",
    });
    await student.save();

    return Response(res, 201, true, "Student successfully registered", { student });
  } catch (error) {
    console.error("Error registering student:", error);
    return Response(res, 500, false, "Server error", error.message);
  }
};

export const bulkRegisterStudents = async (req, res) => {
  const { students, defaultBatch } = req.body;

  try {
    if (!Array.isArray(students) || students.length === 0) {
      return Response(res, 400, false, "Please provide an array of students to register.");
    }

    const successful = [];
    const skipped = [];

    for (let i = 0; i < students.length; i++) {
      const item = students[i];
      const email = item.email?.toLowerCase().trim();
      const rollno = item.rollno ? String(item.rollno).trim() : null;
      const name = item.name?.trim();
      const mobileno = item.mobileno ? String(item.mobileno).trim() : `98${Math.floor(10000000 + Math.random() * 90000000)}`;
      const password = item.password || "student123";
      const batch = item.batch?.trim() || defaultBatch?.trim() || "Batch 2024";

      if (!email || !rollno || !name) {
        skipped.push({
          index: i + 1,
          name: name || "Unknown",
          email: email || "N/A",
          reason: "Missing required fields (name, email, or rollno)",
        });
        continue;
      }

      // Check duplicate
      const exists = await Student.findOne({
        $or: [{ email }, { rollno }],
      });

      if (exists) {
        skipped.push({
          index: i + 1,
          name,
          email,
          rollno,
          reason: "Email or roll number already exists",
        });
        continue;
      }

      const newStudent = new Student({
        name,
        email,
        password,
        rollno,
        mobileno,
        batch,
        department: item.department || "Computer Science",
        degree: item.degree || "B.Tech",
        specialization: item.specialization || "Core Computer Science",
        durationYears: Number(item.durationYears) || 4,
        feePerSemester: Number(item.feePerSemester) || 45000,
        semester: item.semester || "Semester 1",
        section: item.section || "A",
        gender: item.gender || "male",
        dob: item.dob || "",
        bloodGroup: item.bloodGroup || "",
        address: item.address || "",
        city: item.city || "",
        state: item.state || "",
        pincode: item.pincode || "",
        guardianName: item.guardianName || "",
        guardianPhone: item.guardianPhone || "",
        admissionDate: item.admissionDate || "",
      });

      await newStudent.save();
      successful.push({
        name: newStudent.name,
        email: newStudent.email,
        rollno: newStudent.rollno,
        batch: newStudent.batch,
      });
    }

    return Response(res, 201, true, `Successfully registered ${successful.length} students!`, {
      totalSubmitted: students.length,
      registeredCount: successful.length,
      skippedCount: skipped.length,
      registered: successful,
      skipped,
    });
  } catch (error) {
    console.error("Error bulk registering students:", error);
    return Response(res, 500, false, "Server error during bulk registration", error.message);
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

    if (student.isRestricted) {
      return Response(res, 403, false, `Your account has been restricted by administration. ${student.restrictionReason ? "Reason: " + student.restrictionReason : "Please contact campus administration."}`);
    }

    const expiresIn = await getTokenExpiresIn();
    const studenttoken = jwt.sign(
      { id: student._id, role: "student" },
      process.env.JWT_SECRET,
      {
        expiresIn,
      }
    );

    const settings = await SystemSettings.findOne({ key: "otp_settings" });
    const isGlobalBypass = settings?.bypassAll === true;
    const isUserBypassed = settings?.bypassedEmails && settings.bypassedEmails.includes(email.toLowerCase().trim());

    if (isGlobalBypass || isUserBypassed) {
      console.log("Student login: OTP bypassed by system settings");
      const userData = {
        id: student._id,
        name: student.name || "Student",
        email: student.email,
        rollno: student.rollno || "",
        department: student.department || "",
        batch: student.batch || "",
        semester: student.semester || "",
        section: student.section || "",
        role: "student",
        blockedModules: student.blockedModules || [],
        autoFeeBlock: Boolean(student.autoFeeBlock),
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

      res.cookie("studentToken", studenttoken, cookieOptions);
      res.cookie("studentData", JSON.stringify({
        ...userData,
        token: studenttoken,
        user: userData,
      }), {
        ...cookieOptions,
        httpOnly: false,
      });

      return res.status(200).json({
        success: true,
        bypassOtp: true,
        message: "Student login successful (OTP bypassed by system settings)",
        token: studenttoken,
        data: student._id,
        user: userData,
      });
    }

    const loginOtp = Math.floor(100000 + Math.random() * 900000);
    const loginOtpExpire = new Date(
      Date.now() + (Number(process.env.LOGIN_OTP_EXPIRE) || 15) * 60 * 1000
    );

    student.otp = loginOtp;
    student.otpExpire = loginOtpExpire;
    if (!student.name) {
      student.name = "Student";
    }
    await student.save();

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
        .replace("{{USER_ID}}", student._id.toString());

      await sendEMail({
        email,
        subject: "Verify your account",
        html: emailTemplate,
      });
      emailSent = true;
      console.log(`✉️ Student OTP email sent to ${email}: ${loginOtp}`);
    } catch (mailErr) {
      console.warn(`⚠️ [Mail Service Warning] Could not send OTP email to student ${email}:`, mailErr.message);
      console.log(`🔐 [LOCAL/FALLBACK OTP] Student (${email}) OTP is: ${loginOtp}`);
    }

    return res.status(200).json({
      success: true,
      message: emailSent
        ? "OTP sent to your email successfully"
        : `OTP generated (${loginOtp}). Check console or use Master Secret OTP to sign in.`,
      token: studenttoken,
      data: student._id,
      userRole: "student",
    });
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

    if (!req.isOtpBypassed && String(student.otp) !== String(otp)) {
      return Response(res, 400, false, "Invalid OTP");
    }

    // Invalidate OTP immediately to prevent replay attacks
    student.otp = undefined;
    student.otpExpire = undefined;
    await student.save();

    const expiresIn = await getTokenExpiresIn();
    const token = jwt.sign(
      { id: student._id, role: "student" },
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

    res.cookie("studentToken", token, cookieOptions);

    const userData = {
      id: student._id,
      name: student.name,
      email: student.email,
      rollno: student.rollno,
      batch: student.batch,
      department: student.department,
      semester: student.semester,
      section: student.section,
      role: "student",
      blockedModules: student.blockedModules || [],
      autoFeeBlock: Boolean(student.autoFeeBlock),
    };

    res.cookie("studentData", JSON.stringify({
      ...userData,
      token,
      user: userData,
    }), {
      ...cookieOptions,
      httpOnly: false,
    });

    return Response(res, 200, true, "Student OTP verified successfully", {
      token,
      user: userData,
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
    const rawStudents = await Student.find().sort({ createdAt: -1 });
    const students = rawStudents.map((s) => {
      const obj = s.toObject();
      delete obj.password;
      obj.isRestricted = Boolean(obj.isRestricted);
      obj.restrictionReason = obj.restrictionReason || "";
      obj.blockedModules = obj.blockedModules || [];
      obj.autoFeeBlock = Boolean(obj.autoFeeBlock);
      return obj;
    });
    res.status(200).json({ success: true, students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getStudentDirectory = async (req, res) => {
  try {
    const students = await Student.find(
      {},
      "_id name rollno department batch email semester section"
    ).sort({ name: 1 });
    res.status(200).json({ success: true, students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllBatches = async (req, res) => {
  try {
    const batches = await Student.distinct("batch");
    res.status(200).json({ success: true, batches: batches.filter(Boolean) });
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
    let studentId = req.user?.id || req.user?._id;
    if (!studentId && req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        studentId = decoded?.id;
      } catch (e) {}
    }

    if (!studentId) {
      return res.status(401).json({ success: false, message: "Unauthorized: Valid authentication required." });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    res.status(200).json({
      success: true,
      _id: student._id,
      name: student.name,
      rollno: student.rollno,
      gender: student.gender,
      mobileno: student.mobileno,
      email: student.email,
      batch: student.batch || "Batch 2024",
      department: student.department || "Computer Science",
      semester: student.semester || "Semester 1",
      section: student.section || "A",
      address: student.address || "",
      guardianName: student.guardianName || "",
      guardianPhone: student.guardianPhone || "",
    });
  } catch (error) {
    console.error("Error fetching student profile:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
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
    let studentId = req.user?.id || req.user?._id;
    if (!studentId && req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        studentId = decoded?.id;
      } catch (e) {}
    }
    if (!studentId) {
      return res.status(401).json({ success: false, message: "No token or authentication provided" });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
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

export const changeStudentPassword = async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  try {
    let studentId = req.user?._id || req.user?.id;
    if (!studentId && req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        studentId = decoded?.id;
      } catch (e) {}
    }

    if (!studentId) {
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

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const isMatch = await student.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Current password is incorrect" });
    }

    student.password = newPassword;
    await student.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully!",
    });
  } catch (error) {
    console.error("Error changing student password:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
