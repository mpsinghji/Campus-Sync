import Attendance from "../models/attendanceSchema.js";
import Student from "../models/studentModel.js";
import { handleValidationError } from "../middlewares/errorHandler.js";

// Fetch students, optionally filtered by batch, department, or section
export const getStudentsForAttendance = async (req, res, next) => {
  try {
    const { batch, department, section, group } = req.query;
    const filter = {};
    if (batch && batch !== "all") {
      filter.batch = batch;
    }
    if (department && department !== "all") {
      filter.department = department;
    }
    if (section && section !== "all") {
      filter.section = section;
    }
    if (group && group !== "all") {
      filter.group = group;
    }

    const students = await Student.find(filter, {
      _id: 1,
      rollno: 1,
      name: 1,
      email: 1,
      batch: 1,
      department: 1,
      section: 1,
      group: 1,
      degree: 1,
    }).sort({ rollno: 1 });

    res.status(200).json(students);
  } catch (err) {
    next(err);
  }
};

// Fetch distinct batches
export const getAttendanceBatches = async (req, res, next) => {
  try {
    const batches = await Student.distinct("batch");
    res.status(200).json({
      success: true,
      batches: batches.filter(Boolean),
    });
  } catch (err) {
    next(err);
  }
};

// Submit / Upsert Attendance with extra fields: department, subject, group, section
export const submitAttendance = async (req, res, next) => {
  const { attendance, date, batch, department, subject, group, section } = req.body;

  try {
    if (!attendance || typeof attendance !== "object") {
      return res.status(400).json({ error: "Invalid attendance data provided" });
    }

    const targetDate = date || new Date().toISOString().split("T")[0];
    const sub = subject?.trim() || "General Academics";
    const grp = group?.trim() || "G1";
    const sec = section?.trim() || "A";
    const dept = department?.trim() || "Computer Science";

    const records = [];
    for (const [studentId, status] of Object.entries(attendance)) {
      let studentBatch = batch;
      if (!studentBatch || studentBatch === "all") {
        const s = await Student.findById(studentId);
        studentBatch = s?.batch || "General";
      }

      const updated = await Attendance.findOneAndUpdate(
        { student: studentId, date: targetDate, subject: sub },
        {
          student: studentId,
          status,
          date: targetDate,
          batch: studentBatch,
          department: dept,
          subject: sub,
          group: grp,
          section: sec,
        },
        { upsert: true, new: true }
      );
      records.push(updated);
    }

    res.status(200).json({
      success: true,
      message: `Attendance marked successfully for ${records.length} students!`,
      records,
    });
  } catch (err) {
    next(err);
  }
};

// Fetch attendance records with rich filters (by date, batch, student, status)
export const getAllAttendance = async (req, res, next) => {
  try {
    const { date, batch, status, search } = req.query;

    const filter = {};
    if (date) {
      filter.date = date;
    }
    if (batch && batch !== "all") {
      filter.batch = batch;
    }
    if (status && status !== "all") {
      filter.status = status;
    }

    let records = await Attendance.find(filter)
      .populate("student", "name rollno email batch mobileno")
      .sort({ date: -1 });

    // Optional student search filter by name or rollno
    if (search) {
      const q = search.toLowerCase();
      records = records.filter(
        (r) =>
          r.student &&
          (r.student.name?.toLowerCase().includes(q) ||
            r.student.rollno?.toLowerCase().includes(q))
      );
    }

    // Calculate summary statistics
    const totalCount = records.length;
    const presentCount = records.filter((r) => r.status === "Present").length;
    const absentCount = records.filter((r) => r.status === "Absent").length;
    const percentage = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

    res.status(200).json({
      success: true,
      attendanceRecords: records,
      stats: {
        total: totalCount,
        present: presentCount,
        absent: absentCount,
        percentage,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Student's own attendance
export const getStudentAttendance = async (req, res, next) => {
  try {
    const studentId = req.student?.id || req.student?._id || req.query?.studentId;
    if (!studentId) {
      return res.status(400).json({ success: false, message: "Student ID is required" });
    }

    const attendanceRecords = await Attendance.find({ student: studentId }).sort({ date: -1, createdAt: -1 });

    const totalCount = attendanceRecords.length;
    const presentCount = attendanceRecords.filter((r) => r.status === "Present").length;
    const absentCount = attendanceRecords.filter((r) => r.status === "Absent").length;
    const percentage = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

    res.status(200).json({
      success: true,
      attendanceRecords,
      stats: {
        total: totalCount,
        present: presentCount,
        absent: absentCount,
        percentage,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Aggregated Attendance Ledger for Large Scale View
export const getAggregatedAttendance = async (req, res, next) => {
  try {
    const { batch, department, subject, group, section, search } = req.query;

    const studentFilter = {};
    if (batch && batch !== "all") studentFilter.batch = batch;
    if (department && department !== "all") studentFilter.department = department;
    if (section && section !== "all") studentFilter.section = section;
    if (group && group !== "all") studentFilter.group = group;

    const students = await Student.find(studentFilter, {
      _id: 1,
      name: 1,
      rollno: 1,
      email: 1,
      batch: 1,
      department: 1,
      section: 1,
      group: 1,
      degree: 1,
    }).sort({ rollno: 1 });

    const attendanceFilter = {};
    if (batch && batch !== "all") attendanceFilter.batch = batch;
    if (department && department !== "all") attendanceFilter.department = department;
    if (subject && subject !== "all") attendanceFilter.subject = subject;
    if (group && group !== "all") attendanceFilter.group = group;
    if (section && section !== "all") attendanceFilter.section = section;

    const allRecords = await Attendance.find(attendanceFilter).sort({ date: -1 });

    // Group records by student ID
    const recordsByStudent = {};
    for (const rec of allRecords) {
      if (!rec.student) continue;
      const sId = rec.student.toString();
      if (!recordsByStudent[sId]) recordsByStudent[sId] = [];
      recordsByStudent[sId].push(rec);
    }

    let aggregated = students.map((s) => {
      const sId = s._id.toString();
      const sRecs = recordsByStudent[sId] || [];
      const totalClasses = sRecs.length;
      const presentCount = sRecs.filter((r) => r.status === "Present").length;
      const absentCount = sRecs.filter((r) => r.status === "Absent").length;
      const percentage = totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 100;
      let health = "Good";
      if (percentage < 60) health = "Critical";
      else if (percentage < 75) health = "Warning";

      return {
        _id: s._id,
        name: s.name,
        rollno: s.rollno,
        email: s.email,
        batch: s.batch,
        department: s.department,
        section: s.section || "A",
        group: s.group || "G1",
        totalClasses,
        presentCount,
        absentCount,
        percentage,
        health,
        records: sRecs.map((r) => ({
          _id: r._id,
          date: r.date,
          status: r.status,
          subject: r.subject || "General",
          batch: r.batch,
          group: r.group,
          section: r.section,
        })),
      };
    });

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      aggregated = aggregated.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.rollno.toLowerCase().includes(q) ||
          a.email.toLowerCase().includes(q)
      );
    }

    const totalStudents = aggregated.length;
    const goodCount = aggregated.filter((a) => a.health === "Good").length;
    const warningCount = aggregated.filter((a) => a.health === "Warning").length;
    const criticalCount = aggregated.filter((a) => a.health === "Critical").length;

    res.status(200).json({
      success: true,
      aggregated,
      stats: {
        totalStudents,
        goodCount,
        warningCount,
        criticalCount,
      },
    });
  } catch (err) {
    next(err);
  }
};