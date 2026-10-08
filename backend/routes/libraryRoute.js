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

const router = express.Router();

router.get("/getall", getAllBooks);
router.post("/books", createBook);
router.put("/books/:id", updateBook);
router.delete("/books/:id", deleteBook);
router.patch("/books/:id/add-stock", addStock);

// Assign / issue book directly to student
router.post("/assign", assignBook);

// Student apply / request to borrow book
router.post("/request", requestBorrowBook);

// Librarian approve / reject request
router.put("/approve-request/:requestId", approveBorrowRequest);
router.put("/reject-request/:requestId", rejectBorrowRequest);

// Return book
router.put("/return/:issueId", returnBook);

// Get all assigned books
router.get("/assigned", getAssignedBooks);

// Get student specific books and overdue reminder
router.get("/student/:studentId", getStudentLibraryBooks);

export default router;
