import express from "express";
import {
  getMyResults,
  getAllResults,
  createResult,
  updateResult,
  deleteResult,
  getResultAnalytics,
} from "../controllers/resultController.js";
import { isAuthenticated, authorizeRoles } from "../middlewares/auth.js";

const resultRoute = express.Router();

resultRoute.get("/my-results", isAuthenticated, authorizeRoles("student"), getMyResults);
resultRoute.get("/analytics", isAuthenticated, authorizeRoles("admin", "teacher"), getResultAnalytics);
resultRoute.get("/", isAuthenticated, authorizeRoles("admin", "teacher"), getAllResults);
resultRoute.post("/", isAuthenticated, authorizeRoles("admin", "teacher"), createResult);
resultRoute.put("/:id", isAuthenticated, authorizeRoles("admin", "teacher"), updateResult);
resultRoute.delete("/:id", isAuthenticated, authorizeRoles("admin", "teacher"), deleteResult);

export default resultRoute;
