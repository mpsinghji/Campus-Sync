import express from 'express';
import {
  getAllAssignments,
  addAssignment,
  countAssignments,
  getAllSubmissions,
  submitAssignment,
  gradeSubmission,
} from '../controllers/assignmentController.js';
import { isAuthenticated, requireStaffOrAdmin } from '../middlewares/auth.js';

const router = express.Router();

router.get('/getall', isAuthenticated, getAllAssignments);
router.post('/add', isAuthenticated, requireStaffOrAdmin, addAssignment);
router.get('/count', isAuthenticated, countAssignments);

router.get('/submissions', isAuthenticated, getAllSubmissions);
router.post('/submit', isAuthenticated, submitAssignment);
router.put('/submissions/:id/grade', isAuthenticated, requireStaffOrAdmin, gradeSubmission);

export default router;