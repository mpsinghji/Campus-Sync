import { Events } from "../models/eventsSchema.js";

export const createEvents = async (req, res, next) => {
  const { name, description, date, targetAudience, batch, section, location, targetEmails } = req.body;

  try {
    if (!name || !description || !date) {
      return res.status(400).json({ error: "Please Fill the Form Completely!" });
    }

    let parsedEmails = [];
    if (typeof targetEmails === "string") {
      parsedEmails = targetEmails.split(/[,;\s]+/).map((e) => e.trim().toLowerCase()).filter(Boolean);
    } else if (Array.isArray(targetEmails)) {
      parsedEmails = targetEmails.map((e) => e.trim().toLowerCase()).filter(Boolean);
    }

    const newEvent = await Events.create({
      name,
      description,
      date,
      targetAudience: targetAudience || "all",
      targetEmails: parsedEmails,
      batch: batch || "",
      section: section || "",
      location: location || "Main Campus Auditorium",
    });

    res.status(201).json({
      success: true,
      message: "Event is Created!",
      event: newEvent,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllEvents = async (req, res, next) => {
  try {
    const { role, batch, section, email } = req.query;
    const cleanEmail = (email || "").toLowerCase().trim();

    let filter = {};
    if (role === "student") {
      const orConditions = [
        { targetAudience: "all" },
        { targetAudience: "students" },
      ];
      if (batch) {
        orConditions.push({ targetAudience: "batch", batch });
      }
      if (batch && section) {
        orConditions.push({ targetAudience: "section", batch, section });
      }
      if (cleanEmail) {
        orConditions.push({ targetAudience: "bunch_emails", targetEmails: cleanEmail });
      }
      filter = { $or: orConditions };
    } else if (role === "teacher") {
      const orConditions = [
        { targetAudience: "all" },
        { targetAudience: "teachers" },
      ];
      if (cleanEmail) {
        orConditions.push({ targetAudience: "bunch_emails", targetEmails: cleanEmail });
      }
      filter = { $or: orConditions };
    }

    const events = await Events.find(filter).sort({ date: 1 });
    res.status(200).json({
      success: true,
      events,
    });
  } catch (err) {
    next(err);
  }
};

export const countEvents = async (req, res) => {
  try {
    const count = await Events.countDocuments();
    res.status(200).json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};