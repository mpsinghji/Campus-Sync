import mongoose from "mongoose";
import bcrypt from "bcrypt";

const teacherSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    employeeId: {
      type: String,
      default: "",
      trim: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    designation: {
      type: String,
      default: "Assistant Professor",
      trim: true,
    },
    department: {
      type: String,
      default: "Computer Science",
      trim: true,
    },
    subject: {
      type: String,
      default: "",
      trim: true,
    },
    qualification: {
      type: String,
      default: "M.Tech / Ph.D",
      trim: true,
    },
    experience: {
      type: String,
      default: "",
      trim: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "male",
    },
    dob: {
      type: String,
      default: "",
    },
    joiningDate: {
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
    role: {
      type: String,
      default: "teacher",
    },
    responsibility: {
      type: String,
      default: "Teacher",
      trim: true,
    },
    isRestricted: {
      type: Boolean,
      default: false,
    },
    restrictionReason: {
      type: String,
      default: "",
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

teacherSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

teacherSchema.methods.comparePassword = async function (password) {
  if (!password) return false;
  return await bcrypt.compare(password, this.password);
};

const Teacher = mongoose.model("Teacher", teacherSchema);
export default Teacher;
