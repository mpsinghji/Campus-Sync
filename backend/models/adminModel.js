import mongoose from "mongoose";
import bcrypt from "bcrypt";

const adminSchema = new mongoose.Schema(
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
    name: {
      type: String,
      default: "Admin",
      trim: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    designation: {
      type: String,
      default: "Administrator",
      trim: true,
    },
    department: {
      type: String,
      default: "Administration",
      trim: true,
    },
    officeRoom: {
      type: String,
      default: "",
      trim: true,
    },
    address: {
      type: String,
      default: "",
      trim: true,
    },
    role: {
      type: String,
      default: "admin",
    },
    isSuperAdmin: {
      type: Boolean,
      default: false,
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

adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

adminSchema.methods.comparePassword = async function (password) {
  if (!password) return false;
  return await bcrypt.compare(password, this.password);
};

const Admin = mongoose.model("Admin", adminSchema);
export default Admin;
