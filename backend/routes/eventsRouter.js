import express from "express";
import { getAllEvents, createEvents, countEvents } from "../controllers/eventsController.js";
import { isAuthenticated, requireStaffOrAdmin } from "../middlewares/auth.js";

const router = express.Router();

router.get('/getall', isAuthenticated, getAllEvents);
router.post('/', isAuthenticated, requireStaffOrAdmin, createEvents);
router.get('/count', isAuthenticated, countEvents);

export default router;


