import express from "express";
import {
  adminRegister,
  adminLogin,
  getDashboardData,
  getAdminProfile,
  verifyAdminLoginOtp,
  resendAdminLoginOtp,
  adminLogout
} from "../controllers/adminController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const adminRoute = express.Router();

adminRoute.post("/register", validateUserRegistration, adminRegister);

adminRoute.post("/login", adminLogin);

adminRoute.get("/dashboard", getDashboardData);

adminRoute.get("/profile", isAuthenticated, getAdminProfile);

adminRoute.post("/login/verify/:id", validateOtp, verifyAdminLoginOtp);

adminRoute.get("/login/resend/:id", resendAdminLoginOtp);

adminRoute.post("/logout", adminLogout);

export default adminRoute;
