import Fine from "../models/fineModel.js";
import Student from "../models/studentModel.js";

// Create / Levy new fine
export const createFine = async (req, res) => {
  try {
    const { studentId, fineType, amount, reason, dueDate, leviedBy } = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const fine = await Fine.create({
      student: student._id,
      studentName: student.name,
      rollno: student.rollno,
      fineType: fineType || "Library Late Return",
      amount: Number(amount),
      reason: reason || "Fine levied by administration",
      dueDate: dueDate ? new Date(dueDate) : undefined,
      leviedBy: leviedBy || "Accounts Desk",
      status: "Pending",
    });

    res.status(201).json({
      success: true,
      fine,
      message: `Fine of ₹${amount} successfully levied on ${student.name} (${student.rollno})`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all fines with filtering and search
export const getAllFines = async (req, res) => {
  try {
    const { status, fineType, search, limit, page } = req.query;

    const query = {};
    if (status && status !== "all") query.status = status;
    if (fineType && fineType !== "all") query.fineType = fineType;

    let fines = await Fine.find(query)
      .populate("student", "name rollno email batch department")
      .sort({ createdAt: -1 });

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      fines = fines.filter(
        (f) =>
          f.studentName?.toLowerCase().includes(q) ||
          f.rollno?.toLowerCase().includes(q) ||
          f.reason?.toLowerCase().includes(q)
      );
    }

    const totalFines = fines.length;
    const totalLevied = fines.reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
    const totalCollected = fines
      .filter((f) => f.status === "Paid")
      .reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
    const totalPending = fines
      .filter((f) => f.status === "Pending")
      .reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
    const totalWaived = fines
      .filter((f) => f.status === "Waived")
      .reduce((sum, f) => sum + (Number(f.amount) || 0), 0);

    // Apply pagination slice if requested
    const pageNum = parseInt(page, 10) || 1;
    const pageSize = parseInt(limit, 10) || 10;
    const startIndex = (pageNum - 1) * pageSize;
    const paginatedFines = fines.slice(startIndex, startIndex + pageSize);

    res.status(200).json({
      success: true,
      fines: paginatedFines,
      allFinesCount: totalFines,
      metrics: {
        totalFines,
        totalLevied,
        totalCollected,
        totalPending,
        totalWaived,
        pendingCount: fines.filter((f) => f.status === "Pending").length,
        paidCount: fines.filter((f) => f.status === "Paid").length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get fines for a specific student
export const getStudentFines = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (req.role === "student") {
      const authenticatedStudentId = req.user?._id?.toString() || req.user?.id?.toString();
      if (authenticatedStudentId !== studentId.toString()) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You are only authorized to view your own fine records.",
        });
      }
    } else if (req.role !== "admin" && req.role !== "teacher") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Unauthorized to access student fines.",
      });
    }

    const fines = await Fine.find({ student: studentId }).sort({ createdAt: -1 });

    const totalLevied = fines.reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
    const totalPending = fines
      .filter((f) => f.status === "Pending")
      .reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
    const totalPaid = fines
      .filter((f) => f.status === "Paid")
      .reduce((sum, f) => sum + (Number(f.amount) || 0), 0);

    res.status(200).json({
      success: true,
      fines,
      totalLevied,
      totalPending,
      totalPaid,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Settle / Pay Fine
export const payFine = async (req, res) => {
  try {
    const { fineId } = req.params;
    const { paymentMode, paymentId } = req.body;

    const fine = await Fine.findById(fineId);
    if (!fine) {
      return res.status(404).json({ success: false, message: "Fine record not found" });
    }

    fine.status = "Paid";
    fine.paidAt = new Date();
    fine.paymentMode = paymentMode || "Cash";
    fine.paymentId = paymentId || `FINE_TXN_${Date.now()}`;
    await fine.save();

    res.status(200).json({
      success: true,
      fine,
      message: `Fine of ₹${fine.amount} marked as Paid (${fine.paymentMode})`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Waive Fine (Admin privilege)
export const waiveFine = async (req, res) => {
  try {
    const { fineId } = req.params;
    const { waiveReason } = req.body;

    const fine = await Fine.findById(fineId);
    if (!fine) {
      return res.status(404).json({ success: false, message: "Fine record not found" });
    }

    fine.status = "Waived";
    fine.waiveReason = waiveReason || "Waived by institutional administrator";
    await fine.save();

    res.status(200).json({
      success: true,
      fine,
      message: `Fine of ₹${fine.amount} has been waived`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
