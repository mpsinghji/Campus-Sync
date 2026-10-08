import express from "express";
import {
  createFeeRecord,
  getFeeHistory,
  getAllStudentsFeeStatus,
  sendFeeReminder,
  recordOfflinePayment,
  getPaymentAnalytics,
} from "../controllers/feeController.js";
import { isAuthenticated, requireAdmin } from "../middlewares/auth.js";

const router = express.Router();

router.get("/analytics", isAuthenticated, requireAdmin, getPaymentAnalytics);
router.get("/history/:studentId", isAuthenticated, getFeeHistory);
router.get("/all-students-status", isAuthenticated, requireAdmin, getAllStudentsFeeStatus);
router.post("/create", isAuthenticated, requireAdmin, createFeeRecord);
router.post("/send-reminder", isAuthenticated, requireAdmin, sendFeeReminder);
router.post("/record-payment", isAuthenticated, requireAdmin, recordOfflinePayment);

export default router;