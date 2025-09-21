import express from "express";
import { createFeeRecord,getFeeHistory } from "../controllers/feeController.js";

const router = express.Router();

router.post("/create",createFeeRecord);
router.get("/history/:studentId",getFeeHistory);

export default router;