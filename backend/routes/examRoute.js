import express from "express";
import { getAllExams, addExam, updateExam, deleteExam } from "../controllers/examController.js";

const router = express.Router();

router.get('/getall', getAllExams);
router.post('/', addExam);
router.put('/:id', updateExam);
router.delete('/:id', deleteExam);

export default router; 

