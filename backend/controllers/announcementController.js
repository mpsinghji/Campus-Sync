import {Announcement} from "../models/announcementSchema.js";
import { handleValidationError } from "../middlewares/errorHandler.js";

export const createAnnouncement = async (req, res, next) => {
  try {
    const {
      announcement,
      title,
      category,
      targetAudience,
      targetBatch,
      targetEmail,
      targetEmails,
      targetRollno,
      createdBy,
    } = req.body;

    if (!announcement || !announcement.trim()) {
      return res.status(400).json({ success: false, message: "Announcement content is required" });
    }

    let parsedEmails = [];
    if (Array.isArray(targetEmails)) {
      parsedEmails = targetEmails.map((e) => String(e).trim().toLowerCase()).filter(Boolean);
    } else if (typeof targetEmails === "string" && targetEmails.trim()) {
      parsedEmails = targetEmails
        .split(/[\s,;]+/)
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);
    }

    const newAnnouncement = await Announcement.create({
      announcement: announcement.trim(),
      title: title ? title.trim() : "Campus Announcement",
      category: category || "General",
      targetAudience: targetAudience || "all",
      targetBatch: targetBatch ? targetBatch.trim() : "",
      targetEmail: targetEmail ? targetEmail.toLowerCase().trim() : "",
      targetEmails: parsedEmails,
      targetRollno: targetRollno ? targetRollno.trim() : "",
      createdBy: createdBy || "Administrator",
    });

    res.status(200).json({
      success: true,
      message: "Announcement Created Successfully!",
      announcement: newAnnouncement,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllAnnouncements = async (req, res, next) => {
  try {
    const { role, batch, email, rollno } = req.query;

    let filter = {};

    if (role === "admin" || role === "superadmin") {
      // Admins and Superadmins have full visibility
      filter = {};
    } else if (role === "student") {
      const cleanEmail = email ? email.toLowerCase().trim() : "";
      const cleanRollno = rollno ? String(rollno).trim() : "";
      const cleanBatch = batch ? String(batch).trim() : "";

      const orConditions = [
        { targetAudience: "all" },
        { targetAudience: "students" },
        { targetAudience: { $exists: false } },
        { targetAudience: null },
      ];

      if (cleanBatch) {
        const batchRegex = new RegExp(`^${cleanBatch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
        orConditions.push({ targetAudience: "batch", targetBatch: { $regex: batchRegex } });
      }

      if (cleanEmail) {
        const emailRegex = new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
        orConditions.push({ targetAudience: "single_student", targetEmail: { $regex: emailRegex } });
        orConditions.push({ targetEmails: { $elemMatch: { $regex: emailRegex } } });
      }

      if (cleanRollno) {
        const rollRegex = new RegExp(`^${cleanRollno.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
        orConditions.push({ targetAudience: "single_student", targetRollno: { $regex: rollRegex } });
      }

      filter = { $or: orConditions };
    } else if (role === "teacher") {
      const cleanEmail = email ? email.toLowerCase().trim() : "";

      const orConditions = [
        { targetAudience: "all" },
        { targetAudience: "teachers" },
        { targetAudience: { $exists: false } },
        { targetAudience: null },
      ];

      if (cleanEmail) {
        const emailRegex = new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
        orConditions.push({ targetAudience: "single_teacher", targetEmail: { $regex: emailRegex } });
        orConditions.push({ targetEmails: { $elemMatch: { $regex: emailRegex } } });
      }

      filter = { $or: orConditions };
    } else {
      // Default / public view: never expose single_student, single_teacher, bunch_emails, or staff-only notices
      filter = {
        targetAudience: {
          $nin: ["single_student", "single_teacher", "bunch_emails", "teachers", "admins"],
        },
      };
    }

    const announcements = await Announcement.find(filter).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      announcements,
    });
  } catch (err) {
    next(err);
  }
};

export const countAnnouncements = async (req, res) => {
  try {
    const count = await Announcement.countDocuments();
    res.status(200).json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};