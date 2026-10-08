import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
      index: true,
    },
    assignmentTitle: {
      type: String,
      trim: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    studentRollno: {
      type: String,
      trim: true,
    },
    studentName: {
      type: String,
      trim: true,
    },
    subject: {
      type: String,
      trim: true,
      default: "General",
    },
    fileUrl: {
      type: String,
      required: true,
      trim: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    score: {
      type: Number,
      min: 0,
    },
    totalMarks: {
      type: Number,
      default: 100,
    },
    status: {
      type: String,
      enum: ["Submitted", "Graded", "Pending Review"],
      default: "Submitted",
    },
    remarks: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

export const Submission = mongoose.model("Submission", submissionSchema);
export default Submission;
