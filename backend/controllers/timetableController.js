import { Timetable } from "../models/timetableModel.js";
import Teacher from "../models/teacherModel.js";
import Student from "../models/studentModel.js";

export const getTimetables = async (req, res) => {
  try {
    const { day, department, section, facultyId, mySchedule } = req.query;
    const filter = {};

    if (day && day !== "all") filter.day = day;
    if (department && department !== "all") filter.department = department;
    if (section && section !== "all") filter.section = section;
    if (facultyId) filter.facultyId = facultyId;

    // Role-specific scoping
    if (req.user?.role === "teacher" && (mySchedule === "true" || !department)) {
      filter.$or = [
        { facultyId: req.user._id },
        { faculty: req.user.name },
      ];
    } else if (req.user?.role === "student") {
      const student = await Student.findById(req.user._id);
      if (student) {
        if (student.department) filter.department = student.department;
        if (student.section) filter.section = student.section;
      }
    }

    const schedules = await Timetable.find(filter)
      .populate("facultyId", "name email department")
      .sort({ day: 1, timeSlot: 1 });

    res.status(200).json({
      success: true,
      count: schedules.length,
      schedules,
    });
  } catch (error) {
    console.error("Error fetching timetable:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createTimetable = async (req, res) => {
  try {
    const {
      day,
      timeSlot,
      subject,
      type,
      faculty,
      facultyId,
      room,
      department,
      section,
      group,
      batch,
      academicYear,
    } = req.body;

    if (!day || !timeSlot || !subject || !room || !department) {
      return res.status(400).json({
        success: false,
        message: "Day, timeSlot, subject, room, and department are required.",
      });
    }

    // Resolve faculty if facultyId provided
    let facultyName = faculty;
    if (facultyId) {
      const teacher = await Teacher.findById(facultyId);
      if (teacher) {
        facultyName = teacher.name;
      }
    }

    const timetable = new Timetable({
      day,
      timeSlot,
      subject,
      type: type || "Lecture",
      faculty: facultyName || "Unassigned",
      facultyId: facultyId || undefined,
      room,
      department,
      section: section || "Section A",
      group: group || "All",
      batch: batch || "",
      academicYear: academicYear || "",
    });

    await timetable.save();

    res.status(201).json({
      success: true,
      message: "Class schedule created successfully",
      timetable,
    });
  } catch (error) {
    console.error("Error creating timetable:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTimetable = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.facultyId) {
      const teacher = await Teacher.findById(updateData.facultyId);
      if (teacher) {
        updateData.faculty = teacher.name;
      }
    }

    const updated = await Timetable.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: "Timetable slot not found" });
    }

    res.status(200).json({
      success: true,
      message: "Schedule updated successfully",
      timetable: updated,
    });
  } catch (error) {
    console.error("Error updating timetable:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteTimetable = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Timetable.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Timetable slot not found" });
    }

    res.status(200).json({
      success: true,
      message: "Schedule deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting timetable:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
