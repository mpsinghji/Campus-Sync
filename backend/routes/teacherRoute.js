import express from "express";
import {
  teacherLogin,
  teacherRegister,
  getAllTeachers,
  deleteTeacher,
  getTeacherProfile,
  verifyTeacherLoginOtp,
  resendTeacherLoginOtp,
  updateTeacherProfile,
  updateTeacher
} from "../controllers/teacherController.js";
import { validateUserRegistration } from "../middlewares/userValidator.js";
import { validateOtp } from "../middlewares/otpValidator.js";
import { isAuthenticated } from "../middlewares/auth.js"; // Assuming you have an auth middleware

const teacherRoute = express.Router();

teacherRoute.post("/register", validateUserRegistration, teacherRegister);

teacherRoute.post("/login", teacherLogin);

teacherRoute.get("/getall", getAllTeachers);

teacherRoute.delete("/:id", deleteTeacher);
teacherRoute.put("/:id", updateTeacher);

teacherRoute.get("/profile", getTeacherProfile);
teacherRoute.put("/profile", isAuthenticated, updateTeacherProfile);

teacherRoute.post("/login/verify/:id", validateOtp, verifyTeacherLoginOtp);

teacherRoute.get("/login/resend/:id", resendTeacherLoginOtp);

export default teacherRoute;
