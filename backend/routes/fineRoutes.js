import express from "express";
import {
  createFine,
  getAllFines,
  getStudentFines,
  payFine,
  waiveFine,
} from "../controllers/fineController.js";

const router = express.Router();

router.post("/create", createFine);
router.get("/all", getAllFines);
router.get("/student/:studentId", getStudentFines);
router.post("/pay/:fineId", payFine);
router.post("/waive/:fineId", waiveFine);

export default router;
