import Exam from "../models/examSchema.js";
import { handleValidationError } from "../middlewares/errorHandler.js";

export const addExam = async (req, res, next) => {
  const { subjectName, subjectCode, batch, date, targetEmails, description } = req.body;
  try {
    if (!subjectName || !subjectCode || !batch || !date) {
      handleValidationError("Please fill out all fields!", 400);
    }
    let parsedEmails = [];
    if (Array.isArray(targetEmails)) {
      parsedEmails = targetEmails;
    } else if (typeof targetEmails === "string" && targetEmails.trim()) {
      parsedEmails = targetEmails
        .split(/[\s,;]+/)
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);
    }

    const exam = await Exam.create({
      subjectName,
      subjectCode,
      batch,
      date,
      targetEmails: parsedEmails,
      description: description || "",
    });

    res.status(200).json({
      success: true,
      message: "A new exam has been added!",
      exam,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllExams = async (req, res, next) => {
  try {
    const { batch, email } = req.query;
    let filter = {};
    if (batch && batch !== "all") {
      filter = { $or: [{ batch }, { batch: "all" }, { batch: "" }, { batch: null }] };
    }
    if (email) {
      filter = {
        $or: [
          { targetEmails: { $size: 0 } },
          { targetEmails: { $in: [email.toLowerCase().trim()] } },
          { batch: batch || "all" },
        ],
      };
    }
    const exams = await Exam.find(filter).sort({ date: 1 });
    res.status(200).json({
      success: true,
      exams,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteExam = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Exam.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Exam not found" });
    }
    res.status(200).json({ success: true, message: "Exam schedule deleted successfully" });
  } catch (err) {
    next(err);
  }
};

export const updateExam = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { subjectName, subjectCode, batch, date, targetEmails, description } = req.body;
    let parsedEmails = [];
    if (Array.isArray(targetEmails)) {
      parsedEmails = targetEmails;
    } else if (typeof targetEmails === "string" && targetEmails.trim()) {
      parsedEmails = targetEmails
        .split(/[\s,;]+/)
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);
    }

    const updated = await Exam.findByIdAndUpdate(
      id,
      {
        subjectName,
        subjectCode,
        batch,
        date,
        targetEmails: parsedEmails,
        description,
      },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ success: false, message: "Exam not found" });
    }
    res.status(200).json({ success: true, message: "Exam schedule updated successfully", exam: updated });
  } catch (err) {
    next(err);
  }
};

