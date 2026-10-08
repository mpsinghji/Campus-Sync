import express from "express";
import {
  getTimetables,
  createTimetable,
  updateTimetable,
  deleteTimetable,
} from "../controllers/timetableController.js";
import { isAuthenticated, requireAdmin } from "../middlewares/auth.js";

const timetableRoute = express.Router();

timetableRoute.get("/", isAuthenticated, getTimetables);
timetableRoute.post("/", isAuthenticated, requireAdmin, createTimetable);
timetableRoute.put("/:id", isAuthenticated, requireAdmin, updateTimetable);
timetableRoute.delete("/:id", isAuthenticated, requireAdmin, deleteTimetable);

export default timetableRoute;
