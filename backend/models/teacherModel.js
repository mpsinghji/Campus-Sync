import mongoose from "mongoose";
import bcrypt from "bcrypt";

const teacherSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: "teacher",
  },
  otp: {
    type: String,
  },
  otpExpire: {
    type: Date,
  },
});

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
