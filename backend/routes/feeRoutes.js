import express from "express";
import {
  createFeeRecord,
  getFeeHistory,
  getAllStudentsFeeStatus,
  sendFeeReminder,
  recordOfflinePayment,
} from "../controllers/feeController.js";

const router = express.Router();

router.post("/create", createFeeRecord);
router.get("/history/:studentId", getFeeHistory);
router.get("/all-students-status", getAllStudentsFeeStatus);
router.post("/send-reminder", sendFeeReminder);
router.post("/record-payment", recordOfflinePayment);

export default router;