import express from "express";
import Student from "../models/studentModel.js";
import {
  studentLogin,
  studentRegister,
  getAllStudents,
  getStudentDirectory,
  deleteStudent,
  getStudentProfile,
  getStudentCount,
  verifyStudentLoginOtp,

  resendStudentLoginOtp,
  updateStudentProfile,
  updateStudent,
  changeStudentPassword,
  getAllBatches,
  bulkRegisterStudents,
} from "../controllers/studentController.js";
import { validateUserRegistration } from "../middlewares/userValidator.js";
import { validateOtp } from "../middlewares/otpValidator.js";
import { isAuthenticated, authorizeRoles, requireAdmin } from "../middlewares/auth.js";
import { authLimiter, otpLimiter } from "../middlewares/rateLimiter.js";

const studentRoute = express.Router();

studentRoute.post("/register", validateUserRegistration, studentRegister);
studentRoute.post("/bulk-register", isAuthenticated, requireAdmin, bulkRegisterStudents);

studentRoute.post("/login", authLimiter, studentLogin);

studentRoute.get("/batches", getAllBatches);

studentRoute.get("/directory", isAuthenticated, getStudentDirectory);
studentRoute.get("/getall", isAuthenticated, authorizeRoles("admin", "teacher"), getAllStudents);

studentRoute.get("/", isAuthenticated, authorizeRoles("admin", "teacher"), async (req, res) => {
  try {
    const students = await Student.find({}, "rollno email mobileno name batch");
    res.status(200).json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Profile endpoints (literal paths BEFORE parametric /:id paths)
studentRoute.get("/profile", isAuthenticated, getStudentProfile);
studentRoute.put("/profile", isAuthenticated, updateStudentProfile);
studentRoute.post("/change-password", isAuthenticated, changeStudentPassword);

// Parametric student administration routes
studentRoute.delete("/:id", isAuthenticated, requireAdmin, deleteStudent);
studentRoute.put("/:id", isAuthenticated, requireAdmin, updateStudent);

studentRoute.get("/count", isAuthenticated, authorizeRoles("admin", "teacher"), getStudentCount);

studentRoute.post("/login/verify/:id", otpLimiter, validateOtp, verifyStudentLoginOtp);

studentRoute.get("/login/resend/:id", otpLimiter, resendStudentLoginOtp);
studentRoute.get("/resend-otp/:id", otpLimiter, resendStudentLoginOtp);

export default studentRoute;
