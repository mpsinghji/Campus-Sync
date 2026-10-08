import express from "express";
import {
  createFine,
  getAllFines,
  getStudentFines,
  payFine,
  waiveFine,
} from "../controllers/fineController.js";
import { isAuthenticated, requireAdmin, requireStaffOrAdmin } from "../middlewares/auth.js";

const router = express.Router();

router.post("/create", isAuthenticated, requireStaffOrAdmin, createFine);
router.get("/all", isAuthenticated, requireStaffOrAdmin, getAllFines);
router.get("/student/:studentId", isAuthenticated, getStudentFines);
router.post("/pay/:fineId", isAuthenticated, payFine);
router.post("/waive/:fineId", isAuthenticated, requireAdmin, waiveFine);

export default router;
