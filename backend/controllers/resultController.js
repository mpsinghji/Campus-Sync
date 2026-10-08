import { Result } from "../models/resultModel.js";
import Student from "../models/studentModel.js";

// Student accesses their own genuine results
export const getMyResults = async (req, res) => {
  try {
    const studentId = req.user?._id;
    if (!studentId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const results = await Result.find({ studentId }).sort({ semester: 1, subjectCode: 1 });

    if (results.length === 0) {
      return res.status(200).json({
        success: true,
        results: [],
        summary: null,
        message: "No academic performance records are available yet.",
      });
    }

    let totalPoints = 0;
    let totalCredits = 0;
    let totalMarks = 0;
    let totalMaxMarks = 0;

    results.forEach((r) => {
      const cred = r.credits || 3;
      totalPoints += (r.gradePoints || 0) * cred;
      totalCredits += cred;
      totalMarks += r.marksObtained || 0;
      totalMaxMarks += r.totalMarks || 100;
    });

    const gpa = totalCredits > 0 ? Number((totalPoints / totalCredits).toFixed(2)) : 0;
    const percentage = totalMaxMarks > 0 ? Number(((totalMarks / totalMaxMarks) * 100).toFixed(1)) : 0;

    // Group by semester
    const semesterMap = {};
    results.forEach((r) => {
      const sem = r.semester || "Semester 1";
      if (!semesterMap[sem]) {
        semesterMap[sem] = { semester: sem, subjects: [], points: 0, credits: 0 };
      }
      semesterMap[sem].subjects.push(r);
      const cred = r.credits || 3;
      semesterMap[sem].points += (r.gradePoints || 0) * cred;
      semesterMap[sem].credits += cred;
    });

    const semesterBreakdown = Object.values(semesterMap).map((s) => ({
      semester: s.semester,
      subjects: s.subjects,
      sgpa: s.credits > 0 ? Number((s.points / s.credits).toFixed(2)) : 0,
    }));

    res.status(200).json({
      success: true,
      results,
      summary: {
        gpa,
        percentage,
        totalCredits,
        totalSubjects: results.length,
        semesterBreakdown,
      },
    });
  } catch (error) {
    console.error("Error fetching my results:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin and Teacher view all results
export const getAllResults = async (req, res) => {
  try {
    const { studentId, rollno, department, semester, subjectCode } = req.query;
    const filter = {};

    if (studentId) filter.studentId = studentId;
    if (rollno) filter.studentRollno = new RegExp(rollno.trim(), "i");
    if (department && department !== "all") filter.department = department;
    if (semester && semester !== "all") filter.semester = semester;
    if (subjectCode) filter.subjectCode = new RegExp(subjectCode.trim(), "i");

    const results = await Result.find(filter)
      .populate("studentId", "name rollno department batch email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: results.length,
      results,
    });
  } catch (error) {
    console.error("Error fetching all results:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create a new academic result
export const createResult = async (req, res) => {
  try {
    const {
      studentId,
      studentRollno,
      studentName,
      department,
      semester,
      academicYear,
      examId,
      examName,
      subjectCode,
      subjectName,
      marksObtained,
      totalMarks,
      credits,
      grade,
      remarks,
    } = req.body;

    if (!subjectCode || !subjectName || marksObtained === undefined) {
      return res.status(400).json({
        success: false,
        message: "subjectCode, subjectName, and marksObtained are required.",
      });
    }

    let finalStudentId = studentId;
    let finalRoll = studentRollno;
    let finalName = studentName;
    let finalDept = department;

    if (studentId) {
      const student = await Student.findById(studentId);
      if (student) {
        finalRoll = student.rollno;
        finalName = student.name;
        finalDept = student.department || finalDept;
      }
    } else if (studentRollno) {
      const student = await Student.findOne({ rollno: studentRollno.trim() });
      if (student) {
        finalStudentId = student._id;
        finalName = student.name;
        finalDept = student.department || finalDept;
      } else {
        return res.status(404).json({
          success: false,
          message: `Student with roll number ${studentRollno} not found.`,
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Either studentId or studentRollno is required.",
      });
    }

    const result = new Result({
      studentId: finalStudentId,
      studentRollno: finalRoll,
      studentName: finalName,
      department: finalDept || "Computer Science",
      semester: semester || "Semester 1",
      academicYear: academicYear || "2024-2025",
      examId: examId || undefined,
      examName: examName || "Semester Examination",
      subjectCode: subjectCode.trim(),
      subjectName: subjectName.trim(),
      marksObtained: Number(marksObtained),
      totalMarks: Number(totalMarks) || 100,
      credits: Number(credits) || 3,
      grade: grade || undefined,
      remarks: remarks || "",
      enteredBy: req.user?._id,
    });

    await result.save();

    res.status(201).json({
      success: true,
      message: "Result recorded successfully",
      result,
    });
  } catch (error) {
    console.error("Error creating result:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update result
export const updateResult = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Result.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: "Result record not found" });
    }

    res.status(200).json({
      success: true,
      message: "Result updated successfully",
      result: updated,
    });
  } catch (error) {
    console.error("Error updating result:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete result
export const deleteResult = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Result.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Result record not found" });
    }

    res.status(200).json({
      success: true,
      message: "Result deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting result:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Genuine Result Analytics (Department averages, toppers, semester trends)
export const getResultAnalytics = async (req, res) => {
  try {
    const results = await Result.find();

    if (results.length === 0) {
      return res.status(200).json({
        success: true,
        totalResultsCount: 0,
        departmentAverages: [],
        toppers: [],
        semesterTrends: [],
        overallAveragePercentage: 0,
        message: "No result records found in database.",
      });
    }

    // 1. Department averages
    const deptMap = {};
    results.forEach((r) => {
      const dept = r.department || "General";
      if (!deptMap[dept]) {
        deptMap[dept] = { dept, totalMarks: 0, totalMax: 0, count: 0 };
      }
      deptMap[dept].totalMarks += r.marksObtained;
      deptMap[dept].totalMax += r.totalMarks;
      deptMap[dept].count += 1;
    });

    const departmentAverages = Object.values(deptMap).map((d) => ({
      department: d.dept,
      averagePercentage: Number(((d.totalMarks / d.totalMax) * 100).toFixed(1)),
      averageGpa: Number((((d.totalMarks / d.totalMax) * 10).toFixed(2))),
      totalStudentsTested: d.count,
    }));

    // 2. Student Toppers (calculate genuine GPA per student)
    const studentMap = {};
    results.forEach((r) => {
      const sid = r.studentId?.toString() || r.studentRollno;
      if (!studentMap[sid]) {
        studentMap[sid] = {
          name: r.studentName || "Student",
          rollno: r.studentRollno || "N/A",
          department: r.department || "General",
          totalPoints: 0,
          totalCredits: 0,
        };
      }
      const cred = r.credits || 3;
      studentMap[sid].totalPoints += (r.gradePoints || 0) * cred;
      studentMap[sid].totalCredits += cred;
    });

    const toppers = Object.values(studentMap)
      .map((s) => ({
        name: s.name,
        rollno: s.rollno,
        department: s.department,
        gpa: s.totalCredits > 0 ? Number((s.totalPoints / s.totalCredits).toFixed(2)) : 0,
      }))
      .sort((a, b) => b.gpa - a.gpa)
      .slice(0, 5);

    // 3. Semester trends
    const semMap = {};
    results.forEach((r) => {
      const sem = r.semester || "Semester 1";
      if (!semMap[sem]) {
        semMap[sem] = { semester: sem, totalMarks: 0, totalMax: 0, count: 0 };
      }
      semMap[sem].totalMarks += r.marksObtained;
      semMap[sem].totalMax += r.totalMarks;
      semMap[sem].count += 1;
    });

    const semesterTrends = Object.values(semMap).map((s) => ({
      semester: s.semester,
      averagePercentage: Number(((s.totalMarks / s.totalMax) * 100).toFixed(1)),
      count: s.count,
    }));

    const totalMarksAll = results.reduce((sum, r) => sum + r.marksObtained, 0);
    const totalMaxAll = results.reduce((sum, r) => sum + r.totalMarks, 0);
    const overallAveragePercentage =
      totalMaxAll > 0 ? Number(((totalMarksAll / totalMaxAll) * 100).toFixed(1)) : 0;

    res.status(200).json({
      success: true,
      totalResultsCount: results.length,
      departmentAverages,
      toppers,
      semesterTrends,
      overallAveragePercentage,
    });
  } catch (error) {
    console.error("Error calculating result analytics:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
