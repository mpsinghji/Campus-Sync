import fs from "fs";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";
import { sendEMail } from "../middlewares/sendEmail.js";
import Admin from "../models/adminModel.js";
import Student from "../models/studentModel.js";
import Teacher from "../models/teacherModel.js";
import { SystemSettings } from "../models/systemSettingsModel.js";
import { Events } from "../models/eventsSchema.js";
import { Announcement } from "../models/announcementSchema.js";
import { Book } from "../models/librarySchema.js";
import Fee from "../models/feeModel.js";
import { Response } from "../utils/response.js";
import { getTokenExpiresIn } from "../utils/tokenConfig.js";
import { resetRateLimitForIp, resetAllRateLimits } from "../middlewares/rateLimiter.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPER_ADMIN_EMAIL = "admin@campus-sync.com";

export const adminRegister = async (req, res) => {
  const { email, password, name, phone, designation, department, officeRoom, address } = req.body;

  try {
    const cleanEmail = email?.toLowerCase().trim();
    console.log("Admin Register Request:", { email: cleanEmail, name, designation, department });

    // Authentication and authorization: Only an authenticated Admin/Superadmin can register an Admin
    if (!req.user || req.role !== "admin") {
      return Response(
        res,
        401,
        false,
        "Unauthorized: Authentication as Administrator is required to create Admin accounts."
      );
    }

    // Hierarchy rule: Only verified Super Admin can create Super Admin accounts
    if (cleanEmail === SUPER_ADMIN_EMAIL || designation === "Super Admin") {
      if (!req.isSuperAdmin) {
        return Response(
          res,
          403,
          false,
          "Forbidden: Only the primary Super Admin (admin@campus-sync.com) has authorization to create accounts with Super Admin privileges."
        );
      }
    }

    const existingAdmin = await Admin.findOne({ email: cleanEmail });
    if (existingAdmin) {
      return Response(res, 400, false, "Admin with this email already exists");
    }

    const isSuper = cleanEmail === SUPER_ADMIN_EMAIL || designation === "Super Admin";

    const admin = new Admin({
      email: cleanEmail,
      password,
      name: name?.trim() || "Admin",
      phone: phone?.trim() || "",
      designation: designation?.trim() || "Administrator",
      department: department?.trim() || "Administration",
      officeRoom: officeRoom?.trim() || "",
      address: address?.trim() || "",
      isSuperAdmin: isSuper,
    });
    await admin.save();

    return Response(res, 201, true, "Admin successfully registered", { admin });
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

    const cleanEmail = email.toLowerCase().trim();
    const admin = await Admin.findOne({ email: cleanEmail });
    if (!admin) {
      console.log("Admin not found for email:", cleanEmail);
      return Response(res, 404, false, "Admin not found");
    }

    console.log("Admin found, verifying password");
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      console.log("Invalid password for admin:", cleanEmail);
      return Response(res, 401, false, "Invalid credentials");
    }

    if (admin.isRestricted) {
      console.log("Admin account restricted:", cleanEmail);
      return Response(res, 403, false, `Your account has been restricted by administration. ${admin.restrictionReason ? "Reason: " + admin.restrictionReason : "Please contact campus support."}`);
    }

    console.log("Password verified, generating token");
    const expiresIn = await getTokenExpiresIn();
    const adminToken = jwt.sign(
      { id: admin._id, role: "admin", isSuperAdmin: admin.isSuperAdmin || cleanEmail === SUPER_ADMIN_EMAIL },
      process.env.JWT_SECRET,
      {
        expiresIn,
      }
    );

    // Check if user is Super Admin or OTP is turned off by Super Admin (Global Bypass / Bypassed User)
    const settings = await SystemSettings.findOne({ key: "otp_settings" });
    const isGlobalBypass = settings?.bypassAll === true;
    const isUserBypassed = settings?.bypassedEmails && settings.bypassedEmails.includes(cleanEmail);
    const isSuperAdminUser = cleanEmail === SUPER_ADMIN_EMAIL;

    if (isSuperAdminUser || isGlobalBypass || isUserBypassed) {
      console.log("OTP bypassed: skipping OTP and logging user directly in");
      const userData = {
        id: admin._id,
        name: admin.name || (isSuperAdminUser ? "Super Admin" : "Administrator"),
        email: admin.email,
        phone: admin.phone || "",
        designation: admin.designation || (isSuperAdminUser ? "Super Admin" : "Administrator"),
        department: admin.department || "Administration",
        role: "admin",
        isSuperAdmin: isSuperAdminUser || admin.isSuperAdmin,
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

      res.cookie("adminToken", adminToken, cookieOptions);
      res.cookie("adminData", JSON.stringify({
        ...userData,
        token: adminToken,
        user: userData,
      }), {
        ...cookieOptions,
        httpOnly: false,
      });

      return res.status(200).json({
        success: true,
        bypassOtp: true,
        message: isSuperAdminUser
          ? "Super Admin authenticated successfully (OTP bypassed)"
          : "Admin authenticated successfully (OTP bypassed by system settings)",
        token: adminToken,
        data: admin._id,
        user: userData,
        userRole: "admin",
      });
    }

    console.log("Generating OTP for standard admin");
    const loginOtp = Math.floor(100000 + Math.random() * 900000);
    const loginOtpExpire = new Date(
      Date.now() + (process.env.LOGIN_OTP_EXPIRE || 10) * 60 * 1000
    );

    admin.otp = loginOtp.toString();
    admin.otpExpire = loginOtpExpire;
    await admin.save();

    let emailSent = false;
    try {
      console.log("Reading email template");
      let emailTemplate = fs.readFileSync(
        path.join(__dirname, "../templates/mail.html"),
        "utf-8"
      );
      emailTemplate = emailTemplate
        .replace("{{OTP_CODE}}", loginOtp)
        .replaceAll("{{MAIL}}", process.env.SMTP_USER || "admin@campus-sync.com")
        .replace("{{PORT}}", process.env.PORT || "5000")
        .replace("{{USER_ID}}", admin._id.toString());

      console.log("Sending email");
      await sendEMail({
        email: cleanEmail,
        subject: "Verify your account",
        html: emailTemplate,
      });
      emailSent = true;
      console.log(`✉️ Admin OTP email sent to ${cleanEmail}: ${loginOtp}`);
    } catch (mailErr) {
      console.warn(`⚠️ [Mail Service Warning] Could not send OTP email to admin ${cleanEmail}:`, mailErr.message);
      console.log(`🔐 [LOCAL/FALLBACK OTP] Admin (${cleanEmail}) OTP is: ${loginOtp}`);
    }

    console.log("Login successful, responding with OTP challenge");
    return res.status(200).json({
      success: true,
      message: emailSent
        ? "Admin OTP sent to your email successfully"
        : `OTP generated (${loginOtp}). Check console or use Master Secret OTP to sign in.`,
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

    if (!req.isOtpBypassed) {
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
    }

    console.log("OTP verified successfully, generating token");
    const expiresIn = await getTokenExpiresIn();
    const token = jwt.sign(
      { id: admin._id, role: "admin", isSuperAdmin: admin.isSuperAdmin || admin.email === SUPER_ADMIN_EMAIL },
      process.env.JWT_SECRET,
      {
        expiresIn,
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
      designation: admin.designation || "Administrator",
      department: admin.department || "Administration",
      isSuperAdmin: admin.isSuperAdmin || admin.email === SUPER_ADMIN_EMAIL,
      role: "admin"
    };

    const settings = await SystemSettings.findOne({ key: "otp_settings" });
    const unit = settings?.sessionTimeoutUnit || "days";
    const val = settings?.sessionTimeoutValue || settings?.sessionTimeoutDays || 7;
    const sessionMs = unit === "hours" ? val * 60 * 60 * 1000 : val * 24 * 60 * 60 * 1000;

    // Set cookie options based on environment
    const isProduction = process.env.NODE_ENV === "production";
    const cookieOptions = {
      expires: new Date(Date.now() + sessionMs),
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    };

    // Set token cookie
    res.cookie("adminToken", token, cookieOptions);

    // Set user data cookie
    res.cookie("adminData", JSON.stringify(userData), {
      ...cookieOptions,
      httpOnly: false, // User data needs to be accessible by client
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

    // Responsibility breakdowns under teacher/staff category
    const librariansCount = await Teacher.countDocuments({ responsibility: "Librarian" });
    const examControllersCount = await Teacher.countDocuments({ responsibility: "Exam Controller" });
    const eventCoordinatorsCount = await Teacher.countDocuments({ responsibility: "Event Coordinator" });
    const studentRegistrarsCount = await Teacher.countDocuments({ responsibility: "Student Registrar" });
    const accountsCount = await Teacher.countDocuments({ responsibility: "Accounts / Finance Officer" });
    const facultyCount = await Teacher.countDocuments({
      responsibility: { $nin: ["Librarian", "Exam Controller", "Event Coordinator", "Student Registrar", "Accounts / Finance Officer"] },
    });

    return res.status(200).json({
      totalStudents,
      totalTeachers,
      totalAdmins,
      breakdown: {
        librarians: librariansCount,
        examControllers: examControllersCount,
        eventCoordinators: eventCoordinatorsCount,
        studentRegistrars: studentRegistrarsCount,
        accountsOfficers: accountsCount,
        faculty: facultyCount,
      },
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
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    res.status(200).json({
      success: true,
      id: admin._id,
      name: admin.name || "Administrator",
      email: admin.email,
      phone: admin.phone || "",
      designation: admin.designation || "Administrator",
      department: admin.department || "Administration",
      officeRoom: admin.officeRoom || "",
      address: admin.address || "",
      isSuperAdmin: admin.isSuperAdmin || admin.email === SUPER_ADMIN_EMAIL,
      createdAt: admin.createdAt,
    });
  } catch (error) {
    console.error("Error fetching admin profile:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const changeAdminPassword = async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  try {
    let adminId = req.user?._id || req.user?.id;
    if (!adminId && req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        adminId = decoded?.id;
      } catch (e) {}
    }

    if (!adminId) {
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

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Current password is incorrect" });
    }

    admin.password = newPassword;
    await admin.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully!",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    return res.status(500).json({ success: false, message: error.message });
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

// Master Admin: Fetch all users across all roles
export const getAllUsersMaster = async (req, res) => {
  try {
    const isSuperAdmin = Boolean(req.isSuperAdmin);

    const admins = await Admin.find().sort({ createdAt: -1 });
    const teachers = await Teacher.find().sort({ createdAt: -1 });
    const students = await Student.find().sort({ createdAt: -1 });

    const formatUser = (user, roleName) => {
      const obj = user.toObject();
      delete obj.password;
      obj.isRestricted = Boolean(user.isRestricted);
      obj.restrictionReason = user.restrictionReason || "";
      obj.userCategory = roleName;
      return obj;
    };

    return res.status(200).json({
      success: true,
      isSuperAdmin,
      admins: admins.map((a) => formatUser(a, "admin")),
      teachers: teachers.map((t) => formatUser(t, "teacher")),
      students: students.map((s) => formatUser(s, "student")),
      counts: {
        totalAdmins: admins.length,
        totalTeachers: teachers.length,
        totalStudents: students.length,
        totalUsers: admins.length + teachers.length + students.length,
      },
    });
  } catch (error) {
    console.error("Error fetching master users:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Master Admin: Edit any user's profile, role, responsibility, batch, department, password
export const updateUserMaster = async (req, res) => {
  const { role, id } = req.params;
  const {
    adminRequesterEmail,
    name,
    email,
    phone,
    designation,
    responsibility,
    department,
    subject,
    batch,
    rollno,
    mobileno,
    gender,
    address,
    city,
    password,
  } = req.body;

  try {
    const isSuper = Boolean(req.isSuperAdmin);

    let userModel = null;
    if (role === "admin") userModel = Admin;
    else if (role === "teacher") userModel = Teacher;
    else if (role === "student") userModel = Student;
    else return res.status(400).json({ success: false, message: "Invalid role specified" });

    const targetUser = await userModel.findById(id);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Hierarchy rule: Normal admin cannot edit or modify Super Admin
    if (targetUser.email?.toLowerCase().trim() === SUPER_ADMIN_EMAIL && !isSuper) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Only Super Admin (admin@campus-sync.com) can modify Super Admin accounts.",
      });
    }

    // Normal admin cannot modify another admin
    if (role === "admin" && !isSuper) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Only Super Admin can modify Administrator accounts.",
      });
    }

    if (name) targetUser.name = name.trim();
    if (email) targetUser.email = email.toLowerCase().trim();
    if (phone) targetUser.phone = phone.trim();
    if (mobileno) targetUser.mobileno = mobileno.trim();
    if (designation) targetUser.designation = designation.trim();
    if (responsibility) targetUser.responsibility = responsibility.trim();
    if (department) targetUser.department = department.trim();
    if (subject) targetUser.subject = subject.trim();
    if (batch) targetUser.batch = batch.trim();
    if (rollno) targetUser.rollno = rollno.trim();
    if (gender) targetUser.gender = gender;
    if (address) targetUser.address = address.trim();
    if (city) targetUser.city = city.trim();

    // If new password provided by Super Admin
    if (password && password.trim()) {
      targetUser.password = password.trim();
    }

    await targetUser.save();

    return res.status(200).json({
      success: true,
      message: `${targetUser.name || "User"} updated successfully!`,
      user: targetUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Master Admin: Delete any user
export const deleteUserMaster = async (req, res) => {
  const { role, id } = req.params;

  try {
    const isSuper = Boolean(req.isSuperAdmin);

    let userModel = null;
    if (role === "admin") userModel = Admin;
    else if (role === "teacher") userModel = Teacher;
    else if (role === "student") userModel = Student;
    else return res.status(400).json({ success: false, message: "Invalid role specified" });

    const targetUser = await userModel.findById(id);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Rule: Super Admin account cannot be deleted
    if (targetUser.email?.toLowerCase().trim() === SUPER_ADMIN_EMAIL) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Primary Super Admin (admin@campus-sync.com) cannot be deleted.",
      });
    }

    // Normal admin cannot delete another admin
    if (role === "admin" && !isSuper) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Only Super Admin can delete Administrator accounts.",
      });
    }

    await userModel.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: `User ${targetUser.name || targetUser.email} permanently removed.`,
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const DEFAULT_ROLE_PERMISSIONS = {
  Administrator: {
    dashboard: true,
    users: true,
    users_studentsDir: true,
    users_facultyDir: true,
    users_registerStudent: true,
    users_registerFaculty: true,
    users_registerAdmin: true,
    academics: true,
    academics_attendance: true,
    academics_exams: true,
    academics_assignments: true,
    academics_classes: true,
    services: true,
    services_accountsFees: true,
    services_library: true,
    services_events: true,
    services_announcements: true,
    settings: true,
  },
  AccountsOfficer: {
    dashboard: true,
    users: true,
    users_studentsDir: true,
    users_facultyDir: true,
    users_registerStudent: false, // Accounts has no role in registration
    users_registerFaculty: false,
    users_registerAdmin: false,
    academics: false, // Accounts has no role in watching attendance, assignments, exams, classes
    academics_attendance: false,
    academics_exams: false,
    academics_assignments: false,
    academics_classes: false,
    services: true,
    services_accountsFees: true,
    services_library: false,
    services_events: false,
    services_announcements: true,
    settings: true,
  },
  StudentRegistrar: {
    dashboard: true,
    users: true,
    users_studentsDir: true,
    users_facultyDir: true,
    users_registerStudent: true,
    users_registerFaculty: false,
    users_registerAdmin: false,
    academics: false,
    academics_attendance: false,
    academics_exams: false,
    academics_assignments: false,
    academics_classes: false,
    services: true,
    services_accountsFees: false,
    services_library: false,
    services_events: false,
    services_announcements: true,
    settings: true,
  },
  ExamController: {
    dashboard: true,
    users: false,
    users_studentsDir: false,
    users_facultyDir: false,
    users_registerStudent: false,
    users_registerFaculty: false,
    users_registerAdmin: false,
    academics: true,
    academics_attendance: true,
    academics_exams: true,
    academics_assignments: false,
    academics_classes: false,
    services: true,
    services_accountsFees: false,
    services_library: false,
    services_events: false,
    services_announcements: true,
    settings: true,
  },
  Teacher: {
    dashboard: true,
    users: true,
    users_studentsDir: true,
    users_facultyDir: false,
    users_registerStudent: false,
    users_registerFaculty: false,
    users_registerAdmin: false,
    academics: true,
    academics_attendance: true,
    academics_exams: true,
    academics_assignments: true,
    academics_classes: true,
    services: true,
    services_accountsFees: false,
    services_library: false,
    services_events: false,
    services_announcements: true,
    settings: true,
  },
  Librarian: {
    dashboard: true,
    users: false,
    users_studentsDir: false,
    users_facultyDir: false,
    users_registerStudent: false,
    users_registerFaculty: false,
    users_registerAdmin: false,
    academics: false,
    academics_attendance: false,
    academics_exams: false,
    academics_assignments: false,
    academics_classes: false,
    services: true,
    services_accountsFees: false,
    services_library: true,
    services_events: false,
    services_announcements: true,
    settings: true,
  },
  EventCoordinator: {
    dashboard: true,
    users: false,
    users_studentsDir: false,
    users_facultyDir: false,
    users_registerStudent: false,
    users_registerFaculty: false,
    users_registerAdmin: false,
    academics: false,
    academics_attendance: false,
    academics_exams: false,
    academics_assignments: false,
    academics_classes: false,
    services: true,
    services_accountsFees: false,
    services_library: false,
    services_events: true,
    services_announcements: true,
    settings: true,
  },
  Student: {
    dashboard: true,
    users: false,
    users_studentsDir: false,
    users_facultyDir: false,
    users_registerStudent: false,
    users_registerFaculty: false,
    users_registerAdmin: false,
    academics: true,
    academics_attendance: true,
    academics_exams: true,
    academics_assignments: true,
    academics_classes: true,
    services: true,
    services_accountsFees: true,
    services_library: true,
    services_events: true,
    services_announcements: true,
    settings: true,
  },
};

// Master Admin: Get role permissions matrix
export const getRolePermissionsMaster = async (req, res) => {
  try {
    let settings = await SystemSettings.findOne({ key: "otp_settings" });
    if (!settings) {
      settings = await SystemSettings.create({
        key: "otp_settings",
        rolePermissions: DEFAULT_ROLE_PERMISSIONS,
      });
    }

    let current = settings.rolePermissions || {};
    let modified = false;

    // Ensure all roles and their granular sub-field permissions exist
    Object.keys(DEFAULT_ROLE_PERMISSIONS).forEach((roleKey) => {
      if (!current[roleKey] || typeof current[roleKey] !== "object") {
        current[roleKey] = { ...DEFAULT_ROLE_PERMISSIONS[roleKey] };
        modified = true;
      } else {
        Object.keys(DEFAULT_ROLE_PERMISSIONS[roleKey]).forEach((field) => {
          if (current[roleKey][field] === undefined) {
            current[roleKey][field] = DEFAULT_ROLE_PERMISSIONS[roleKey][field];
            modified = true;
          }
        });
      }
    });

    if (modified) {
      settings.rolePermissions = current;
      settings.markModified("rolePermissions");
      await settings.save();
    }

    return res.status(200).json({
      success: true,
      rolePermissions: current,
      fieldVisibility: settings.fieldVisibility || {},
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Master Admin: Update role permissions matrix
export const updateRolePermissionsMaster = async (req, res) => {
  const { rolePermissions, fieldVisibility } = req.body;

  try {
    if (!req.isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Only Super Admin (admin@campus-sync.com) can configure role permissions and field visibility.",
      });
    }

    let settings = await SystemSettings.findOne({ key: "otp_settings" });
    if (!settings) {
      settings = new SystemSettings({ key: "otp_settings" });
    }

    if (rolePermissions) {
      settings.rolePermissions = rolePermissions;
      settings.markModified("rolePermissions");
    }
    if (fieldVisibility) {
      settings.fieldVisibility = fieldVisibility;
      settings.markModified("fieldVisibility");
    }
    await settings.save();

    return res.status(200).json({
      success: true,
      message: "Role permissions & field visibility updated successfully!",
      rolePermissions: settings.rolePermissions,
      fieldVisibility: settings.fieldVisibility,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Master Admin: Reset / Override user password directly
export const resetPasswordMaster = async (req, res) => {
  const { role, id, newPassword } = req.body;
  try {
    if (!req.isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Only Super Admin (admin@campus-sync.com) can reset user passwords.",
      });
    }

    if (!newPassword || newPassword.trim().length < 4) {
      return res.status(400).json({ success: false, message: "Password must be at least 4 characters long." });
    }

    let model;
    if (role === "admin") model = Admin;
    else if (role === "teacher") model = Teacher;
    else if (role === "student") model = Student;
    else return res.status(400).json({ success: false, message: "Invalid role specified." });

    const user = await model.findById(id);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    const cleanPass = newPassword.trim();
    user.password = cleanPass;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `Password for ${user.name || user.email} successfully updated.`,
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Master Admin: Seed realistic, professional demo campus data
export const seedCampusDataMaster = async (req, res) => {
  try {
    if (!req.isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Only Super Admin (admin@campus-sync.com) can execute campus data seeding.",
      });
    }

    // 1. Ensure Super Admin Account
    let superAdmin = await Admin.findOne({ email: SUPER_ADMIN_EMAIL });
    if (!superAdmin) {
      superAdmin = await Admin.create({
        name: "Master Super Admin",
        email: SUPER_ADMIN_EMAIL,
        password: "admin123",
        phone: "9876543210",
        designation: "Super Admin",
        department: "Executive Campus Governance",
        officeRoom: "HQ-01",
      });
    }

    // 2. Academic Dean Admin
    let dean = await Admin.findOne({ email: "dean.academics@campus-sync.com" });
    if (!dean) {
      await Admin.create({
        name: "Dr. Rajesh Sharma",
        email: "dean.academics@campus-sync.com",
        password: "admin123",
        phone: "9876543220",
        designation: "Dean Academic Affairs",
        department: "Academic Affairs",
        officeRoom: "Admin Block A-102",
      });
    }

    // 3. Faculty & Specialized Staff
    const staffData = [
      {
        name: "Mrs. Sunita Rao",
        email: "librarian@campus-sync.com",
        password: "teacher123",
        responsibility: "Librarian",
        department: "Central Library",
        designation: "Head Librarian",
        qualification: "M.Lib.I.Sc",
        phone: "9876543231",
      },
      {
        name: "Prof. Vikram Malhotra",
        email: "exams@campus-sync.com",
        password: "teacher123",
        responsibility: "Exam Controller",
        department: "Examination Cell",
        designation: "Controller of Examinations",
        qualification: "Ph.D. Computer Engineering",
        phone: "9876543232",
      },
      {
        name: "Ms. Ananya Deshmukh",
        email: "events@campus-sync.com",
        password: "teacher123",
        responsibility: "Event Coordinator",
        department: "Student Affairs",
        designation: "Cultural Affairs Director",
        qualification: "MBA Event Management",
        phone: "9876543233",
      },
      {
        name: "Mr. Arvind Verma",
        email: "registrar@campus-sync.com",
        password: "teacher123",
        responsibility: "Student Registrar",
        department: "Academic Admissions",
        designation: "Chief Academic Registrar",
        qualification: "M.Com, PGDCA",
        phone: "9876543234",
      },
      {
        name: "Prof. Amit Kapoor",
        email: "prof.kapoor@campus-sync.com",
        password: "teacher123",
        responsibility: "Teacher",
        department: "Computer Science",
        designation: "Associate Professor",
        qualification: "Ph.D. Artificial Intelligence",
        phone: "9876543235",
      },
      {
        name: "Dr. Meenakshi Sundaram",
        email: "prof.sharma@campus-sync.com",
        password: "teacher123",
        responsibility: "Teacher",
        department: "Electronics & Communication",
        designation: "Assistant Professor",
        qualification: "Ph.D. Embedded Systems",
        phone: "9876543236",
      },
    ];

    for (const s of staffData) {
      const exists = await Teacher.findOne({ email: s.email });
      if (!exists) {
        await Teacher.create(s);
      }
    }

    // 4. Genuine Students across Batches
    const studentData = [
      {
        name: "Aarav Sharma",
        email: "aarav.sharma@campus-sync.com",
        rollno: "CS23A001",
        batch: "Batch 2023-27 CS-A",
        department: "Computer Science",
        degree: "B.Tech",
        specialization: "Artificial Intelligence & Machine Learning",
        durationYears: 4,
        feePerSemester: 55000,
        semester: "Semester 4",
        mobileno: "9876500001",
        password: "student123",
        gender: "Male",
        address: "Campus Hostel Block C, Room 204",
        city: "Tech City",
      },
      {
        name: "Diya Patel",
        email: "diya.patel@campus-sync.com",
        rollno: "CS23A002",
        batch: "Batch 2023-27 CS-A",
        department: "Computer Science",
        degree: "B.Tech",
        specialization: "Cyber Security & Digital Forensics",
        durationYears: 4,
        feePerSemester: 52000,
        semester: "Semester 4",
        mobileno: "9876500002",
        password: "student123",
        gender: "Female",
        address: "Campus Hostel Block B, Room 112",
        city: "Tech City",
      },
      {
        name: "Rohan Gupta",
        email: "rohan.gupta@campus-sync.com",
        rollno: "CS23A003",
        batch: "Batch 2023-27 CS-A",
        department: "Computer Science",
        degree: "B.Tech",
        specialization: "Data Science & Big Data",
        durationYears: 4,
        feePerSemester: 50000,
        semester: "Semester 4",
        mobileno: "9876500003",
        password: "student123",
        gender: "Male",
        address: "42 Sunrise Avenue",
        city: "Tech City",
      },
      {
        name: "Priya Nair",
        email: "priya.nair@campus-sync.com",
        rollno: "CS23B014",
        batch: "Batch 2023-27 CS-B",
        department: "Computer Science",
        degree: "B.Tech",
        specialization: "Cloud Computing & DevOps",
        durationYears: 4,
        feePerSemester: 50000,
        semester: "Semester 4",
        mobileno: "9876500004",
        password: "student123",
        gender: "Female",
        address: "15 Palm Grove",
        city: "Tech City",
      },
      {
        name: "Kartik Singh",
        email: "kartik.singh@campus-sync.com",
        rollno: "CS23B025",
        batch: "Batch 2023-27 CS-B",
        department: "Computer Science",
        degree: "B.Tech",
        specialization: "Core Computer Science",
        durationYears: 4,
        feePerSemester: 45000,
        semester: "Semester 4",
        mobileno: "9876500005",
        password: "student123",
        gender: "Male",
        address: "88 Silicon Residency",
        city: "Tech City",
      },
      {
        name: "Simran Kaur",
        email: "simran.kaur@campus-sync.com",
        rollno: "ME24A005",
        batch: "Batch 2024-28 ME",
        department: "Mechanical Engineering",
        degree: "B.Tech",
        specialization: "Robotics & Automation",
        durationYears: 4,
        feePerSemester: 46000,
        semester: "Semester 2",
        mobileno: "9876500006",
        password: "student123",
        gender: "Female",
        address: "Hostel Block A, Room 305",
        city: "Tech City",
      },
      {
        name: "Vivek Joshi",
        email: "vivek.joshi@campus-sync.com",
        rollno: "ME24A018",
        batch: "Batch 2024-28 ME",
        department: "Mechanical Engineering",
        degree: "B.Tech",
        specialization: "Core Mechanical Engineering",
        durationYears: 4,
        feePerSemester: 42000,
        semester: "Semester 2",
        mobileno: "9876500007",
        password: "student123",
        gender: "Male",
        address: "21 University Heights",
        city: "Tech City",
      },
    ];

    const seededStudents = [];
    for (const std of studentData) {
      let rec = await Student.findOne({ email: std.email });
      if (!rec) {
        rec = await Student.create(std);
      }
      seededStudents.push(rec);
    }

    // 5. Genuine Library Catalog
    const booksData = [
      { bookname: "Introduction to Algorithms (4th Edition)", author: "Thomas H. Cormen, Charles E. Leiserson", totalQuantity: 12, availableQuantity: 10 },
      { bookname: "Artificial Intelligence: A Modern Approach", author: "Stuart Russell & Peter Norvig", totalQuantity: 8, availableQuantity: 6 },
      { bookname: "Database System Concepts (7th Edition)", author: "Silberschatz, Korth, Sudarshan", totalQuantity: 15, availableQuantity: 14 },
      { bookname: "Computer Networks: A Systems Approach", author: "Andrew S. Tanenbaum & David J. Wetherall", totalQuantity: 10, availableQuantity: 8 },
      { bookname: "Operating System Concepts", author: "Abraham Silberschatz & Peter B. Galvin", totalQuantity: 10, availableQuantity: 9 },
      { bookname: "Clean Code: A Handbook of Agile Craftsmanship", author: "Robert C. Martin", totalQuantity: 6, availableQuantity: 5 },
    ];

    for (const b of booksData) {
      const exists = await Book.findOne({ bookname: b.bookname });
      if (!exists) {
        await Book.create(b);
      }
    }

    // 6. Genuine Events
    const now = new Date();
    const eventsData = [
      {
        name: "HackCampus 2026: 36-Hour Hackathon",
        description: "Annual university hackathon with challenges in Full Stack, AI & Web3. Total prize pool ₹1,50,000.",
        date: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
        targetAudience: "students",
        location: "Campus Innovation & Incubation Center",
      },
      {
        name: "Annual Tech Symposium & Robotics Expo",
        description: "Keynote lectures by industry experts from Google & Microsoft on Applied AI, followed by live robot arena battles.",
        date: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000),
        targetAudience: "all",
        location: "Dr. APJ Abdul Kalam Central Auditorium",
      },
      {
        name: "Tarang 2026 - Annual Cultural Fest",
        description: "Three days of music competitions, battle of bands, classical dance, theater, and celebrity live performance.",
        date: new Date(now.getTime() + 35 * 24 * 60 * 60 * 1000),
        targetAudience: "all",
        location: "University Open Air Amphitheatre",
      },
      {
        name: "Inter-Department Cricket Championship",
        description: "Annual 20-over league tournament across CS, ME, Civil and Electronics departments.",
        date: new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000),
        targetAudience: "all",
        location: "Campus Sports Complex Oval Ground",
      },
    ];

    for (const ev of eventsData) {
      const exists = await Events.findOne({ name: ev.name });
      if (!exists) {
        await Events.create(ev);
      }
    }

    // 7. Genuine Announcements for Batches and All
    const announcementsData = [
      {
        title: "Mid-Semester Examination Schedule - Batch 2023-27",
        category: "Exams",
        targetAudience: "batch",
        targetBatch: "Batch 2023-27 CS-A",
        announcement: "Mid-semester evaluations for Semester 4 begin from the 15th. Students must download admit cards from the portal.",
        createdBy: "Prof. Vikram Malhotra (Exam Controller)",
      },
      {
        title: "Central Library Clearance & Semester Returns",
        category: "Library",
        targetAudience: "all",
        announcement: "All students are requested to clear overdue library books before upcoming assessments to waive pending surcharges.",
        createdBy: "Mrs. Sunita Rao (Head Librarian)",
      },
      {
        title: "Fee Payment Portal Active for Spring Term",
        category: "Finance & Accounts",
        targetAudience: "all",
        announcement: "The online installment fee gateway is active. Students can verify receipts and complete tuition clearances via Razorpay UPI.",
        createdBy: "Accounts & Finance Department",
      },
      {
        title: "CAD/CAM Machine Safety Workshop - Batch 2024-28 ME",
        category: "Academic",
        targetAudience: "batch",
        targetBatch: "Batch 2024-28 ME",
        announcement: "Mandatory industrial safety orientation for Batch 2024-28 ME students this Friday at Central Mechanical Workshop.",
        createdBy: "Department of Mechanical Engineering",
      },
    ];

    for (const an of announcementsData) {
      const exists = await Announcement.findOne({ title: an.title });
      if (!exists) {
        await Announcement.create(an);
      }
    }

    // 8. Genuine Fee Records for Students
    if (seededStudents.length > 0) {
      const aarav = seededStudents[0];
      const diya = seededStudents[1];
      const rohan = seededStudents[2];

      const aaravFee = await Fee.findOne({ studentId: aarav._id });
      if (!aaravFee) {
        await Fee.create({
          studentId: aarav._id,
          amount: 45000,
          paymentId: `TXN_RZP_2026_${Math.floor(100000 + Math.random() * 900000)}`,
          academicYear: "2024-2025",
          semester: "Semester 4",
          paymentStatus: "completed",
          PaidAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        });
      }

      const diyaFee = await Fee.findOne({ studentId: diya._id });
      if (!diyaFee) {
        await Fee.create({
          studentId: diya._id,
          amount: 45000,
          paymentId: `TXN_RZP_2026_${Math.floor(100000 + Math.random() * 900000)}`,
          academicYear: "2024-2025",
          semester: "Semester 4",
          paymentStatus: "completed",
          PaidAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        });
      }

      const rohanFee = await Fee.findOne({ studentId: rohan._id });
      if (!rohanFee) {
        await Fee.create({
          studentId: rohan._id,
          amount: 22500,
          paymentId: `TXN_UPI_2026_${Math.floor(100000 + Math.random() * 900000)}`,
          academicYear: "2024-2025",
          semester: "Semester 4",
          paymentStatus: "completed",
          PaidAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        });
      }
    }

    // 9. Reset and Normalize Settings
    let settings = await SystemSettings.findOne({ key: "otp_settings" });
    if (!settings) {
      settings = new SystemSettings({ key: "otp_settings" });
    }
    settings.rolePermissions = DEFAULT_ROLE_PERMISSIONS;
    settings.secretOtp = settings.secretOtp || "454545";
    settings.sessionTimeoutDays = 7;
    settings.lateFeePerDay = 10;
    settings.markModified("rolePermissions");
    await settings.save();

    return res.status(200).json({
      success: true,
      message: "Campus demo dataset successfully seeded with genuine staff, batch-aligned students, events, announcements, and fee records!",
    });
  } catch (error) {
    console.error("Error seeding campus data:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Master Admin: Toggle user restriction / suspension status and module access
export const toggleRestrictUserMaster = async (req, res) => {
  try {
    const { userId, role, isRestricted, reason, blockedModules, autoFeeBlock } = req.body;
    if (!userId || !role) {
      return Response(res, 400, false, "User ID and role are required");
    }

    let Model = Student;
    if (role === "admin") Model = Admin;
    else if (role === "teacher") Model = Teacher;

    const user = await Model.findById(userId);
    if (!user) {
      return Response(res, 404, false, "Target user not found");
    }

    if (role === "admin" && user.email === SUPER_ADMIN_EMAIL) {
      return Response(res, 400, false, "Cannot restrict the Primary Super Admin account");
    }

    if (typeof isRestricted === "boolean") {
      user.isRestricted = Boolean(isRestricted);
    }
    if (reason !== undefined) {
      user.restrictionReason = reason || (user.isRestricted ? "Access restricted by administrator" : "");
    }

    if (role === "student") {
      if (Array.isArray(blockedModules)) {
        user.blockedModules = blockedModules;
      }
      if (typeof autoFeeBlock === "boolean") {
        user.autoFeeBlock = autoFeeBlock;
      }
    }

    await user.save();

    return Response(res, 200, true, `User account ${user.email} permissions updated successfully.`, {
      user: {
        _id: user._id,
        email: user.email,
        isRestricted: user.isRestricted,
        restrictionReason: user.restrictionReason,
        blockedModules: user.blockedModules || [],
        autoFeeBlock: Boolean(user.autoFeeBlock),
      },
    });
  } catch (error) {
    console.error("Error toggling user restriction:", error);
    return Response(res, 500, false, "Failed to update user restriction status", error.message);
  }
};

// Master Admin: Get Fee Rates configuration
export const getFeeRatesMaster = async (req, res) => {
  try {
    let settings = await SystemSettings.findOne({ key: "otp_settings" });
    if (!settings) {
      settings = await SystemSettings.create({ key: "otp_settings" });
    }
    return Response(res, 200, true, "Fee rates retrieved successfully", {
      feeRates: settings.feeRates || {},
      lateFeePerDay: settings.lateFeePerDay ?? 20,
      lateFeeFlatAfterDue: settings.lateFeeFlatAfterDue ?? 500,
      lateFeeGraceDays: settings.lateFeeGraceDays ?? 0,
    });
  } catch (error) {
    return Response(res, 500, false, "Failed to fetch fee rates", error.message);
  }
};

// Master Admin: Update Fee Rates & Degree Structures
export const updateFeeRatesMaster = async (req, res) => {
  try {
    const { feeRates, lateFeePerDay } = req.body;
    let settings = await SystemSettings.findOne({ key: "otp_settings" });
    if (!settings) {
      settings = await SystemSettings.create({ key: "otp_settings" });
    }

    if (feeRates && typeof feeRates === "object") {
      settings.feeRates = feeRates;
      settings.markModified("feeRates");
    }
    if (typeof lateFeePerDay === "number") {
      settings.lateFeePerDay = lateFeePerDay;
    }
    await settings.save();

    return Response(res, 200, true, "Fee rates & degree structures updated successfully", {
      feeRates: settings.feeRates,
      lateFeePerDay: settings.lateFeePerDay,
    });
  } catch (error) {
    return Response(res, 500, false, "Failed to update fee rates", error.message);
  }
};

// Master Admin: Reset Rate Limits for Superadmin IP or all rate limits
export const resetRateLimitMaster = async (req, res) => {
  try {
    // Strict authentication and superadmin check
    if (!req.user || req.role !== "admin" || !req.isSuperAdmin) {
      return Response(res, 403, false, "Forbidden: Only Super Administrator has authorization.");
    }

    // Derive client IP strictly from server request (not trusting arbitrary body input for IP)
    const clientIp = req.ip || req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress;
    const shouldResetAll = Boolean(req.body?.resetAll);

    if (shouldResetAll) {
      await resetAllRateLimits();
      return Response(res, 200, true, "All authentication and OTP rate limit locks cleared successfully across the server.", {
        scope: "all",
        requestedBy: req.user.email,
        timestamp: new Date().toISOString(),
      });
    }

    if (!clientIp) {
      return Response(res, 400, false, "Could not determine client network IP from request.");
    }

    await resetRateLimitForIp(clientIp);
    return Response(res, 200, true, `Rate limit successfully cleared for network IP: ${clientIp}`, {
      scope: "ip",
      ip: clientIp,
      requestedBy: req.user.email,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return Response(res, 500, false, "Failed to reset rate limits", error.message);
  }
};



