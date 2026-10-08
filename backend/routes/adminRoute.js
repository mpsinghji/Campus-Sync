import express from "express";
import {
  adminRegister,
  adminLogin,
  getDashboardData,
  getAdminProfile,
  verifyAdminLoginOtp,
  resendAdminLoginOtp,
  adminLogout,
  changeAdminPassword,
  getAllUsersMaster,
  updateUserMaster,
  deleteUserMaster,
  getRolePermissionsMaster,
  updateRolePermissionsMaster,
  resetPasswordMaster,
  seedCampusDataMaster,
  toggleRestrictUserMaster,
  getFeeRatesMaster,
  updateFeeRatesMaster,
  resetRateLimitMaster,
} from "../controllers/adminController.js";
import { isAuthenticated, requireAdmin, requireSuperAdmin } from "../middlewares/auth.js";
import { validateUserRegistration } from "../middlewares/userValidator.js";
import { validateOtp } from "../middlewares/otpValidator.js";
import { authLimiter, otpLimiter } from "../middlewares/rateLimiter.js";

const adminRoute = express.Router();

// Public auth endpoints
adminRoute.post("/login", authLimiter, adminLogin);
adminRoute.post("/login/verify/:id", otpLimiter, validateOtp, verifyAdminLoginOtp);
adminRoute.get("/login/resend/:id", otpLimiter, resendAdminLoginOtp);
adminRoute.get("/resend-otp/:id", otpLimiter, resendAdminLoginOtp);
adminRoute.post("/logout", adminLogout);

// Protected Admin Endpoints (Admins & Superadmin)
adminRoute.post("/register", isAuthenticated, requireAdmin, validateUserRegistration, adminRegister);
adminRoute.get("/dashboard", isAuthenticated, requireAdmin, getDashboardData);
adminRoute.get("/profile", isAuthenticated, requireAdmin, getAdminProfile);
adminRoute.post("/change-password", isAuthenticated, requireAdmin, changeAdminPassword);

// Protected Master Admin Endpoints (Strictly Superadmin Only)
adminRoute.get("/master/all-users", isAuthenticated, requireSuperAdmin, getAllUsersMaster);
adminRoute.put("/master/user/:role/:id", isAuthenticated, requireSuperAdmin, updateUserMaster);
adminRoute.delete("/master/user/:role/:id", isAuthenticated, requireSuperAdmin, deleteUserMaster);
adminRoute.post("/master/reset-password", isAuthenticated, requireSuperAdmin, resetPasswordMaster);
adminRoute.put("/master/toggle-restrict-user", isAuthenticated, requireSuperAdmin, toggleRestrictUserMaster);
adminRoute.get("/master/fee-rates", isAuthenticated, requireSuperAdmin, getFeeRatesMaster);
adminRoute.put("/master/fee-rates", isAuthenticated, requireSuperAdmin, updateFeeRatesMaster);
adminRoute.get("/master/role-permissions", isAuthenticated, requireSuperAdmin, getRolePermissionsMaster);
adminRoute.put("/master/role-permissions", isAuthenticated, requireSuperAdmin, updateRolePermissionsMaster);
adminRoute.post("/master/seed-campus-data", isAuthenticated, requireSuperAdmin, seedCampusDataMaster);
adminRoute.post("/master/rate-limit/reset", isAuthenticated, requireSuperAdmin, resetRateLimitMaster);

export default adminRoute;
