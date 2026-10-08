import express from "express";
import { getAllAnnouncements, createAnnouncement, countAnnouncements } from "../controllers/announcementController.js";
import { isAuthenticated, requireStaffOrAdmin } from "../middlewares/auth.js";

const router = express.Router();

router.get('/getall', isAuthenticated, getAllAnnouncements);
router.post('/', isAuthenticated, requireStaffOrAdmin, createAnnouncement);
router.get('/count', isAuthenticated, countAnnouncements);

export default router; 

