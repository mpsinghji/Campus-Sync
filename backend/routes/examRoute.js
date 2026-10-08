import express from "express";
import { getAllExams, addExam, updateExam, deleteExam } from "../controllers/examController.js";
import { isAuthenticated, requireStaffOrAdmin } from "../middlewares/auth.js";

const router = express.Router();

router.get('/getall', isAuthenticated, getAllExams);
router.post('/', isAuthenticated, requireStaffOrAdmin, addExam);
router.put('/:id', isAuthenticated, requireStaffOrAdmin, updateExam);
router.delete('/:id', isAuthenticated, requireStaffOrAdmin, deleteExam);

export default router; 

