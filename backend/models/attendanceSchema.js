import mongoose from "mongoose";
const attendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  status: {
    type: String,
    enum: ["Present", "Absent"],
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  batch: {
    type: String,
    default: "General",
  },
  department: {
    type: String,
    default: "Computer Science",
  },
  subject: {
    type: String,
    default: "General Academics",
  },
  group: {
    type: String,
    default: "G1",
  },
  section: {
    type: String,
    default: "A",
  },
}, { timestamps: true });

export default mongoose.model("Attendance", attendanceSchema);
