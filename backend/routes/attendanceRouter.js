import express from "express";
import {
  getAllAttendance,
  getAggregatedAttendance,
  submitAttendance,
  getStudentAttendance,
  getStudentsForAttendance,
  getAttendanceBatches,
} from "../controllers/attendanceController.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// JWT token verification middleware
const verifyToken = (req, res, next) => {
  const token =
    req.headers.authorization?.split(" ")[1] ||
    req.headers.studenttoken ||
    req.headers["x-access-token"] ||
    req.cookies?.studentToken ||
    req.cookies?.token;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.student = decoded;
      return next();
    } catch (err) {
      if (req.query?.studentId) {
        req.student = { id: req.query.studentId, role: "student" };
        return next();
      }
      return res.status(403).json({ error: "Invalid token" });
    }
  }

  // Fallback: If no token header/cookie provided, allow studentId query param if present
  if (req.query?.studentId) {
    req.student = { id: req.query.studentId, role: "student" };
    return next();
  }

  return res.status(403).json({ error: "Token is required" });
};

// Fetch student list (supports ?batch= query param)
router.get("/students", getStudentsForAttendance);

// Fetch all distinct batches
router.get("/batches", getAttendanceBatches);

// Aggregated attendance summary per student (Large Scale View)
router.get("/aggregated", getAggregatedAttendance);

// Fetch all attendance records (supports ?date=&batch=&status=&search= query params)
router.get("/records", getAllAttendance);
router.get("/getall", getAllAttendance);
router.get("/", getAllAttendance);

// Student self attendance
router.get("/my-attendance", verifyToken, getStudentAttendance);

// Mark / Submit attendance
router.post("/attendance", submitAttendance);

export default router;