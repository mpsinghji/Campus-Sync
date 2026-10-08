import mongoose from "mongoose";
import bcrypt from "bcrypt";

const studentSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    rollno: {
      type: String,
      required: [true, "Roll number is required"],
      unique: true,
      trim: true,
    },
    mobileno: {
      type: String,
      required: [true, "Mobile number is required"],
      trim: true,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    batch: {
      type: String,
      default: "Batch 2024",
      trim: true,
    },
    department: {
      type: String,
      default: "Computer Science",
      trim: true,
    },
    semester: {
      type: String,
      default: "Semester 1",
      trim: true,
    },
    section: {
      type: String,
      default: "A",
      trim: true,
    },
    group: {
      type: String,
      default: "G1",
      trim: true,
    },
    gender: {
      enum: ["male", "female", "other"],
      type: String,
      default: "male",
    },
    dob: {
      type: String,
      default: "",
    },
    bloodGroup: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    city: {
      type: String,
      default: "",
    },
    state: {
      type: String,
      default: "",
    },
    pincode: {
      type: String,
      default: "",
    },
    guardianName: {
      type: String,
      default: "",
    },
    guardianPhone: {
      type: String,
      default: "",
    },
    admissionDate: {
      type: String,
      default: "",
    },
    degree: {
      type: String,
      default: "B.Tech",
      trim: true,
    },
    specialization: {
      type: String,
      default: "Core Computer Science",
      trim: true,
    },
    durationYears: {
      type: Number,
      default: 4,
    },
    feePerSemester: {
      type: Number,
      default: 45000,
    },
    role: {
      type: String,
      default: "student",
    },
    isRestricted: {
      type: Boolean,
      default: false,
    },
    restrictionReason: {
      type: String,
      default: "",
    },
    blockedModules: {
      type: [String],
      default: [], // e.g. ["dashboard", "assignments", "exams", "attendance", "library", "announcements", "events"]
    },
    autoFeeBlock: {
      type: Boolean,
      default: false, // If true, automatically restricts non-fee modules when fee is overdue
    },
    otp: {
      type: String,
    },
    otpExpire: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Hash password before saving
studentSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
studentSchema.methods.comparePassword = async function (password) {
  if (!password) return false;
  return await bcrypt.compare(password, this.password);
};

const Student = mongoose.model("Student", studentSchema);
export default Student;
