import express from "express";
import {
  teacherLogin,
  teacherRegister,
  getAllTeachers,
  deleteTeacher,
  getTeacherProfile,
  verifyTeacherLoginOtp,
  resendTeacherLoginOtp
} from "../controllers/teacherController.js";
import { validateUserRegistration } from "../middlewares/userValidator.js";

const teacherRoute = express.Router();

teacherRoute.post("/register", validateUserRegistration, teacherRegister);

teacherRoute.post("/login", teacherLogin);

teacherRoute.get("/getall", getAllTeachers);

teacherRoute.delete("/:id", deleteTeacher);

teacherRoute.get("/profile", getTeacherProfile);

teacherRoute.post("/login/verify/:id", verifyTeacherLoginOtp);

teacherRoute.get("/login/resend/:id", resendTeacherLoginOtp);

export default teacherRoute;
