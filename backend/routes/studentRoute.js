import express from "express";
import Student from "../models/studentModel.js";
import {
  studentLogin,
  studentRegister,
  getAllStudents,
  deleteStudent,
  getStudentProfile,
  getStudentCount,
  verifyStudentLoginOtp,
  resendStudentLoginOtp
} from "../controllers/studentController.js";
import { validateUserRegistration } from "../middlewares/userValidator.js";

const studentRoute = express.Router();

studentRoute.post("/register", validateUserRegistration, studentRegister);

studentRoute.post("/login", studentLogin);

studentRoute.get("/getall", getAllStudents);

studentRoute.delete("/:id", deleteStudent);

studentRoute.get("/", async (req, res) => {
  try {
    const students = await Student.find({}, "rollno email mobileno");
    res.status(200).json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

studentRoute.get("/profile", getStudentProfile);

studentRoute.get("/count", getStudentCount);

studentRoute.post("/login/verify/:id", verifyStudentLoginOtp);

studentRoute.get("/login/resend/:id", resendStudentLoginOtp);



export default studentRoute;
