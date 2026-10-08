import mongoose from "mongoose";

const timetableSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      required: true,
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    },
    timeSlot: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      default: "Lecture",
      trim: true,
    },
    faculty: {
      type: String,
      trim: true,
    },
    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
    },
    room: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    section: {
      type: String,
      default: "Section A",
      trim: true,
    },
    group: {
      type: String,
      default: "All",
      trim: true,
    },
    batch: {
      type: String,
      trim: true,
    },
    academicYear: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export const Timetable = mongoose.model("Timetable", timetableSchema);
export default Timetable;
