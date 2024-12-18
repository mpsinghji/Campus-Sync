import mongoose from "mongoose";
import bcrypt from "bcrypt";

const studentSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  rollno: {
    type: String,
    required: [true, "Roll number is required"],
    unique: true,
  },
  mobileno: {
    type: String,
    required: [true, "Mobile number is required"],
    unique: true,
  },
  gender: {
    enum: ["male", "female", "other"],
    type: String,
  },
  name: {
    type: String,
    required: [true, "Name is required"],
  },
  role: {
    type: String,
    default: "student",
  },
  otp: {
    type: String,
  },
  otpExpire: {
    type: Date,
  },
});

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
