import express from "express";
import {
  getAllBooks,
  createBook,
  updateBook,
  deleteBook,
  addStock,
  assignBook,
  returnBook,
  getAssignedBooks,
  getStudentLibraryBooks,
  requestBorrowBook,
  approveBorrowRequest,
  rejectBorrowRequest,
} from "../controllers/libraryController.js";
import { isAuthenticated, requireStaffOrAdmin } from "../middlewares/auth.js";

const router = express.Router();

router.get("/getall", isAuthenticated, getAllBooks);
router.post("/books", isAuthenticated, requireStaffOrAdmin, createBook);
router.put("/books/:id", isAuthenticated, requireStaffOrAdmin, updateBook);
router.delete("/books/:id", isAuthenticated, requireStaffOrAdmin, deleteBook);
router.patch("/books/:id/add-stock", isAuthenticated, requireStaffOrAdmin, addStock);

// Assign / issue book directly to student
router.post("/assign", isAuthenticated, requireStaffOrAdmin, assignBook);

// Student apply / request to borrow book
router.post("/request", isAuthenticated, requestBorrowBook);

// Librarian approve / reject request
router.put("/approve-request/:requestId", isAuthenticated, requireStaffOrAdmin, approveBorrowRequest);
router.put("/reject-request/:requestId", isAuthenticated, requireStaffOrAdmin, rejectBorrowRequest);

// Return book
router.put("/return/:issueId", isAuthenticated, requireStaffOrAdmin, returnBook);

// Get all assigned books
router.get("/assigned", isAuthenticated, requireStaffOrAdmin, getAssignedBooks);

// Get student specific books and overdue reminder
router.get("/student/:studentId", isAuthenticated, getStudentLibraryBooks);

export default router;
