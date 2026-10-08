import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    announcement: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      default: "Campus Announcement",
    },
    category: {
      type: String,
      default: "General",
    },
    targetAudience: {
      type: String,
      enum: ["all", "students", "teachers", "admins", "batch", "single_student", "single_teacher", "bunch_emails"],
      default: "all",
    },
    targetBatch: {
      type: String,
      default: "",
    },
    targetEmail: {
      type: String,
      default: "",
    },
    targetEmails: {
      type: [String],
      default: [],
    },
    targetRollno: {
      type: String,
      default: "",
    },
    createdBy: {
      type: String,
      default: "Institutional Admin",
    },
  },
  { timestamps: true }
);

export const Announcement = mongoose.model("Announcement", announcementSchema);
export default Announcement;






