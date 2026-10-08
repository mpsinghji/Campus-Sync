import mongoose from "mongoose";

const fineSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    rollno: {
      type: String,
      required: true,
    },
    fineType: {
      type: String,
      enum: [
        "Library Late Return",
        "Laboratory Damage",
        "Campus / Property Damage",
        "Sports Equipment Fine",
        "ID Card Reissue Fee",
        "Late Fee Penalty",
        "Hostel Disciplinary Fine",
        "Other Institutional Fine",
      ],
      default: "Library Late Return",
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Paid", "Waived"],
      default: "Pending",
    },
    leviedBy: {
      type: String,
      default: "Accounts Administration",
    },
    dueDate: {
      type: Date,
      default: () => new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days default
    },
    paymentId: {
      type: String,
      default: "",
    },
    paidAt: {
      type: Date,
    },
    paymentMode: {
      type: String,
      default: "",
    },
    waiveReason: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Fine = mongoose.model("Fine", fineSchema);
export default Fine;
