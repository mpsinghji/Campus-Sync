import Fee from "../models/feeModel.js";
import Student from "../models/studentModel.js";
import Fine from "../models/fineModel.js";
import { Announcement } from "../models/announcementSchema.js";

export const createFeeRecord = async (req, res) => {
  try {
    const { studentId, amount, paymentId, academicYear, semester, paymentStatus } = req.body;
    const newFee = await Fee.create({
      studentId,
      amount,
      paymentId: paymentId || `TXN_${Date.now()}`,
      academicYear: academicYear || "2024-2025",
      semester: semester || "Semester 1",
      paymentStatus: paymentStatus || "completed",
      PaidAt: new Date(),
    });
    res.status(201).json({
      success: true,
      fee: newFee,
      message: "Fee record created successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error creating fee record",
    });
  }
};

export const getFeeHistory = async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findById(studentId).select("-password -plainPasswordView");
    const feeHistory = await Fee.find({ studentId }).sort({ createdAt: -1 });
    const fines = await Fine.find({ student: studentId }).sort({ createdAt: -1 });

    const totalPaid = feeHistory
      .filter((f) => f.paymentStatus === "completed")
      .reduce((sum, f) => sum + (Number(f.amount) || 0), 0);

    const feePerSemester = student?.feePerSemester || 45000;
    const durationYears = student?.durationYears || 4;
    const totalSemesters = durationYears * 2;
    const totalProgramFee = feePerSemester * totalSemesters;
    const balance = Math.max(0, totalProgramFee - totalPaid);

    const semestersPaidCount = Math.min(totalSemesters, Math.floor(totalPaid / feePerSemester));
    const semestersPendingCount = totalSemesters - semestersPaidCount;

    let feeStatus = "Pending";
    if (totalPaid >= totalProgramFee) {
      feeStatus = "Paid";
    } else if (totalPaid > 0) {
      feeStatus = "Partial";
    }

    const totalFinesDue = fines
      .filter((fn) => fn.status === "Pending")
      .reduce((acc, fn) => acc + (Number(fn.amount) || 0), 0);

    res.status(200).json({
      success: true,
      student,
      feeHistory,
      fines,
      totalFinesDue,
      totalPaid,
      feePerSemester,
      totalSemesters,
      semestersPaidCount,
      semestersPendingCount,
      totalProgramFee,
      balance,
      feeStatus,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching fee history",
    });
  }
};

// Get all students along with their fee status, payment totals, and balance
export const getAllStudentsFeeStatus = async (req, res) => {
  try {
    const { batch, status, search, limit, page } = req.query;
    const STANDARD_FEE = 45000; // Standard term tuition fee

    const students = await Student.find().select("-password -plainPasswordView").sort({ rollno: 1, name: 1 });
    const allFees = await Fee.find({ paymentStatus: "completed" });

    // Group fees by studentId
    const feesByStudent = {};
    allFees.forEach((f) => {
      const sId = f.studentId ? f.studentId.toString() : null;
      if (sId) {
        if (!feesByStudent[sId]) feesByStudent[sId] = [];
        feesByStudent[sId].push(f);
      }
    });

    let studentFeeList = students.map((s) => {
      const sId = s._id.toString();
      const records = feesByStudent[sId] || [];
      const totalPaid = records.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

      const feePerSemester = s.feePerSemester ? s.feePerSemester : STANDARD_FEE;
      const durationYears = s.durationYears || 4;
      const totalSemesters = durationYears * 2;
      const totalFee = feePerSemester * totalSemesters; // Full degree total fee
      const balance = Math.max(0, totalFee - totalPaid);

      const semestersPaidCount = Math.min(totalSemesters, Math.floor(totalPaid / feePerSemester));
      const semestersPendingCount = totalSemesters - semestersPaidCount;

      let feeStatus = "Pending";
      if (totalPaid >= totalFee) {
        feeStatus = "Paid";
      } else if (totalPaid > 0) {
        feeStatus = "Partial";
      }

      return {
        _id: s._id,
        name: s.name,
        rollno: s.rollno,
        email: s.email,
        mobileno: s.mobileno,
        batch: s.batch || "Batch 2024",
        department: s.department || "Computer Science",
        semester: s.semester || "Semester 1",
        degree: s.degree || "B.Tech",
        specialization: s.specialization || "Core",
        durationYears,
        totalSemesters,
        feePerSemester,
        semestersPaidCount,
        semestersPendingCount,
        totalFee,
        totalPaid,
        balance,
        feeStatus,
        isRestricted: s.isRestricted || false,
        blockedModules: s.blockedModules || [],
        autoFeeBlock: s.autoFeeBlock || false,
        lastPaymentDate: records.length > 0 ? records[records.length - 1].PaidAt || records[records.length - 1].createdAt : null,
        paymentsCount: records.length,
      };
    });

    // Apply filters
    if (batch && batch !== "all") {
      studentFeeList = studentFeeList.filter((s) => s.batch.toLowerCase() === batch.toLowerCase());
    }

    if (status && status !== "all") {
      studentFeeList = studentFeeList.filter((s) => s.feeStatus.toLowerCase() === status.toLowerCase());
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      studentFeeList = studentFeeList.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.rollno.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q)
      );
    }

    // Summary metrics
    const totalStudents = studentFeeList.length;
    const paidCount = studentFeeList.filter((s) => s.feeStatus === "Paid").length;
    const partialCount = studentFeeList.filter((s) => s.feeStatus === "Partial").length;
    const pendingCount = studentFeeList.filter((s) => s.feeStatus === "Pending").length;
    const totalCollected = studentFeeList.reduce((acc, s) => acc + s.totalPaid, 0);
    const totalPending = studentFeeList.reduce((acc, s) => acc + s.balance, 0);

    res.status(200).json({
      success: true,
      students: studentFeeList,
      metrics: {
        totalStudents,
        paidCount,
        partialCount,
        pendingCount,
        totalCollected,
        totalPending,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching students fee status",
    });
  }
};

// Send automated or purpose-specific fee reminder to student
export const sendFeeReminder = async (req, res) => {
  try {
    const { studentId, message, purpose, amount, title } = req.body;
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const reminderTitle = title || (purpose ? `Accounts Notice: ${purpose}` : "Fee Payment Reminder");
    const formattedAmount = amount && Number(amount) > 0 ? ` of ₹${Number(amount).toLocaleString()}` : "";
    const reminderMsg =
      message ||
      `Dear ${student.name} (${student.rollno}), this is an official reminder from Accounts Department regarding ${purpose || "pending dues"}${formattedAmount}. Kindly clear this at your earliest convenience.`;

    // Create targeted announcement for this student so it appears in their dashboard
    await Announcement.create({
      announcement: reminderMsg,
      title: reminderTitle,
      category: "Finance & Accounts",
      targetAudience: "single_student",
      targetEmail: student.email,
      targetRollno: student.rollno,
      createdBy: "Accounts Department",
    });

    res.status(200).json({
      success: true,
      message: `Official notice (${reminderTitle}) sent successfully to ${student.name} (${student.email})`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to send fee reminder",
    });
  }
};

// Record manual / offline fee payment by Accounts Officer
export const recordOfflinePayment = async (req, res) => {
  try {
    const {
      studentId,
      amount,
      paymentMode,
      remarks,
      academicYear,
      semester,
      paymentCategory, // "semester" | "fine"
      fineId,
      fineType,
    } = req.body;

    if (!studentId || !amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: "Valid student and amount are required." });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found." });
    }

    const txnId = `OFFLINE_${(paymentMode || "CASH").toUpperCase()}_${Date.now()}`;

    // 1. If this is an institutional fine settlement
    if (paymentCategory === "fine") {
      let settledFine;
      if (fineId) {
        settledFine = await Fine.findByIdAndUpdate(
          fineId,
          {
            status: "Paid",
            paidAt: new Date(),
            paymentMode: paymentMode || "Cash",
            paymentId: txnId,
          },
          { new: true }
        );
      } else {
        settledFine = await Fine.create({
          student: student._id,
          studentName: student.name,
          rollno: student.rollno,
          fineType: fineType || "Other Institutional Fine",
          amount: Number(amount),
          reason: remarks || "Direct fine settlement recorded at accounts counter",
          status: "Paid",
          paidAt: new Date(),
          paymentMode: paymentMode || "Cash",
          paymentId: txnId,
          leviedBy: "Accounts Officer",
        });
      }

      // Record in Fee ledger so it produces a genuine receipt
      const newFee = await Fee.create({
        studentId,
        amount: Number(amount),
        paymentId: txnId,
        academicYear: academicYear || student.batch || "2024-2025",
        semester: fineType ? `Fine: ${fineType}` : "Institutional Fine Settlement",
        paymentStatus: "completed",
        PaidAt: new Date(),
      });

      return res.status(201).json({
        success: true,
        message: `Institutional fine of ₹${amount} settled successfully for ${student.name} (${student.rollno})`,
        fee: newFee,
        fine: settledFine,
      });
    }

    // 2. Otherwise, this is a Semester Tuition Fee payment
    const targetSemester = semester || "Semester 1";
    const targetYear = academicYear || student.batch || "2024-2025";

    const newFee = await Fee.create({
      studentId,
      amount: Number(amount),
      paymentId: txnId,
      academicYear: targetYear,
      semester: targetSemester,
      paymentStatus: "completed",
      PaidAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: `Tuition payment for ${targetSemester} (₹${amount}) recorded successfully for ${student.name} (${student.rollno})!`,
      fee: newFee,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error recording offline payment",
    });
  }
};

