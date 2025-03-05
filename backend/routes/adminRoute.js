import express from "express";
import {
  adminRegister,
  adminLogin,
  getDashboardData,
  getAdminProfile,
  verifyAdminLoginOtp,
  resendAdminLoginOtp,
} from "../controllers/adminController.js";
import { validateUserRegistration } from "../middlewares/userValidator.js";
import { validateOtp } from "../middlewares/otpValidator.js";

const adminRoute = express.Router();

adminRoute.post("/register", validateUserRegistration, adminRegister);

adminRoute.post("/login", adminLogin);

adminRoute.get("/dashboard", getDashboardData);

adminRoute.get("/profile", getAdminProfile);

adminRoute.post("/login/verify/:id", validateOtp, verifyAdminLoginOtp);

adminRoute.get("/login/resend/:id", resendAdminLoginOtp);

export default adminRoute;
