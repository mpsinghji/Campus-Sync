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
} from "../controllers/adminController.js";
import { isAuthenticated } from "../middlewares/auth.js";
import { validateUserRegistration } from "../middlewares/userValidator.js";
import { validateOtp } from "../middlewares/otpValidator.js";

const adminRoute = express.Router();

adminRoute.post("/register", validateUserRegistration, adminRegister);
adminRoute.post("/login", adminLogin);
adminRoute.get("/dashboard", getDashboardData);
adminRoute.get("/profile", isAuthenticated, getAdminProfile);
adminRoute.post("/change-password", isAuthenticated, changeAdminPassword);
adminRoute.post("/login/verify/:id", validateOtp, verifyAdminLoginOtp);
adminRoute.get("/login/resend/:id", resendAdminLoginOtp);
adminRoute.post("/logout", adminLogout);

// Master Admin Endpoints
adminRoute.get("/master/all-users", getAllUsersMaster);
adminRoute.put("/master/user/:role/:id", updateUserMaster);
adminRoute.delete("/master/user/:role/:id", deleteUserMaster);
adminRoute.post("/master/reset-password", resetPasswordMaster);
adminRoute.put("/master/toggle-restrict-user", toggleRestrictUserMaster);
adminRoute.get("/master/fee-rates", getFeeRatesMaster);
adminRoute.put("/master/fee-rates", updateFeeRatesMaster);
adminRoute.get("/master/role-permissions", getRolePermissionsMaster);
adminRoute.put("/master/role-permissions", updateRolePermissionsMaster);
adminRoute.post("/master/seed-campus-data", seedCampusDataMaster);

export default adminRoute;
