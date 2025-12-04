import express from "express";
import Attendance from "../models/attendanceSchema.js";
import Student from "../models/studentModel.js"; // Assuming you have a Student model
import { getAllAttendance, markAttendance, getStudentAttendance } from "../controllers/attendanceController.js"; // Import controller functions
import jwt from "jsonwebtoken"; // Add JWT for token validation

const router = express.Router();

// JWT token verification middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1] || req.headers.studenttoken; // Check for studenttoken if no token in Authorization header
  if (!token) {
    return res.status(403).json({ error: "Token is required" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Invalid token" });
    }
    console.log("Decoded student info:", decoded);  // Log the decoded info
    req.student = decoded; // Attach decoded student info to request
    next();
  });
};




// Fetch student list
router.get("/students", async (req, res) => {
  try {
    const students = await Student.find({}, { _id: 1, rollno: 1, name: 1, email: 1 }) || [];
    res.json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ error: "Failed to fetch students" });
  }
});

// Fetch all attendance
router.get("/getall", async (req, res) => {
  try {
    const response = await Attendance.find({});
    res.status(200).json({ success: true, data: response });
  } catch (error) {
    console.error("Error fetching attendance data:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});


router.get("/my-attendance", verifyToken, getStudentAttendance);  // Use the controller method here


// Submit attendance
router.post("/attendance", async (req, res) => {
  const { attendance, date } = req.body; // Get the date and attendance from the request body

  try {
    // Format the date as DD-MM-YYYY
    const formattedDate = new Date(date); // Convert the date string to a Date object
    const day = String(formattedDate.getDate()).padStart(2, "0");
    const month = String(formattedDate.getMonth() + 1).padStart(2, "0");
    const year = formattedDate.getFullYear();
    const formattedDateString = `${day}-${month}-${year}`; // Format the date as DD-MM-YYYY

    // Loop through the attendance data and insert or update each record
    for (const [studentId, status] of Object.entries(attendance)) {
      await Attendance.findOneAndUpdate(
        { student: studentId, date: formattedDateString },  // Find existing attendance for the student and date
        { student: studentId, status, date: formattedDateString }, // If it exists, update it
        { upsert: true } // If it doesn't exist, insert a new document
      );
    }

    res.status(200).send("Attendance data submitted successfully!");
  } catch (error) {
    console.error("Error saving attendance:", error);
    res.status(500).json({ error: "Failed to save attendance" });
  }
});


router.get("/", getAllAttendance);  // Use the controller method here

router.post("/attendance", markAttendance);  // Use the controller method here


export default router;