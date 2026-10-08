import express from "express";
import {
  teacherLogin,
  teacherRegister,
  getAllTeachers,
  getTeacherDirectory,
  deleteTeacher,
  getTeacherProfile,
  verifyTeacherLoginOtp,
  resendTeacherLoginOtp,
  updateTeacherProfile,
  updateTeacher,
  changeTeacherPassword,
} from "../controllers/teacherController.js";
import { validateUserRegistration } from "../middlewares/userValidator.js";
import { validateOtp } from "../middlewares/otpValidator.js";
import { isAuthenticated, requireAdmin } from "../middlewares/auth.js";
import { authLimiter, otpLimiter } from "../middlewares/rateLimiter.js";

const teacherRoute = express.Router();

teacherRoute.post("/register", isAuthenticated, requireAdmin, validateUserRegistration, teacherRegister);

teacherRoute.post("/login", authLimiter, teacherLogin);

teacherRoute.get("/directory", isAuthenticated, getTeacherDirectory);
teacherRoute.get("/getall", isAuthenticated, getAllTeachers);

// Profile endpoints (literal paths BEFORE parametric /:id paths)
teacherRoute.get("/profile", isAuthenticated, getTeacherProfile);
teacherRoute.put("/profile", isAuthenticated, updateTeacherProfile);
teacherRoute.post("/change-password", isAuthenticated, changeTeacherPassword);

// Parametric routes
teacherRoute.delete("/:id", isAuthenticated, requireAdmin, deleteTeacher);
teacherRoute.put("/:id", isAuthenticated, requireAdmin, updateTeacher);

teacherRoute.post("/login/verify/:id", otpLimiter, validateOtp, verifyTeacherLoginOtp);

teacherRoute.get("/login/resend/:id", otpLimiter, resendTeacherLoginOtp);
teacherRoute.get("/resend-otp/:id", otpLimiter, resendTeacherLoginOtp);

export default teacherRoute;
