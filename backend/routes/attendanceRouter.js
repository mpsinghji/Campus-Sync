import express from "express";
import {
  getAllAttendance,
  getAggregatedAttendance,
  submitAttendance,
  getStudentAttendance,
  getStudentsForAttendance,
  getAttendanceBatches,
} from "../controllers/attendanceController.js";
import { isAuthenticated, authorizeRoles } from "../middlewares/auth.js";

const router = express.Router();

// Fetch student list (supports ?batch= query param)
router.get("/students", isAuthenticated, authorizeRoles("admin", "teacher"), getStudentsForAttendance);

// Fetch all distinct batches
router.get("/batches", isAuthenticated, getAttendanceBatches);

// Aggregated attendance summary per student (Large Scale View)
router.get("/aggregated", isAuthenticated, authorizeRoles("admin", "teacher"), getAggregatedAttendance);

// Fetch all attendance records (supports ?date=&batch=&status=&search= query params)
router.get("/records", isAuthenticated, authorizeRoles("admin", "teacher"), getAllAttendance);
router.get("/getall", isAuthenticated, authorizeRoles("admin", "teacher"), getAllAttendance);
router.get("/", isAuthenticated, authorizeRoles("admin", "teacher"), getAllAttendance);

// Student self attendance (or authorized admin/teacher lookup)
router.get("/my-attendance", isAuthenticated, getStudentAttendance);

// Mark / Submit attendance
router.post("/attendance", isAuthenticated, authorizeRoles("admin", "teacher"), submitAttendance);

export default router;