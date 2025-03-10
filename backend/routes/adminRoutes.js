import express from "express";
import {
  adminLogin,
  verifyAdminOtp,
  resendAdminOtp,
  adminLogout,
  updateProfile
} from "../controllers/adminController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

// Public routes
router.post("/login", adminLogin);
router.post("/login/verify/:id", verifyAdminOtp);
router.get("/login/resend/:id", resendAdminOtp);
router.post("/logout", adminLogout);

// Protected routes
router.put("/profile", isAuthenticated, updateProfile);

export default router; 