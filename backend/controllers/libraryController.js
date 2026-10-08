import { Book, IssuedBook } from "../models/librarySchema.js";
import Student from "../models/studentModel.js";
import { SystemSettings } from "../models/systemSettingsModel.js";

// Add a new book with total quantity / stock (prevents duplicate entries)
export const createBook = async (req, res, next) => {
  const { bookname, author, totalQuantity } = req.body;
  try {
    if (!bookname || !author) {
      return res.status(400).json({ success: false, message: "Please provide book title and author!" });
    }

    const trimmedTitle = bookname.trim();
    const trimmedAuthor = author.trim();

    // Check if book already exists (case-insensitive)
    const existingBook = await Book.findOne({
      bookname: { $regex: new RegExp(`^${trimmedTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, "i") },
      author: { $regex: new RegExp(`^${trimmedAuthor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, "i") },
    });

    if (existingBook) {
      return res.status(409).json({
        success: false,
        duplicate: true,
        existingBook,
        message: `Book "${existingBook.bookname}" by "${existingBook.author}" is already listed in inventory with ${existingBook.totalQuantity} copies (Available: ${existingBook.availableQuantity}). Please edit its quantity instead of adding a duplicate.`,
      });
    }

    const quantity = parseInt(totalQuantity, 10) > 0 ? parseInt(totalQuantity, 10) : 1;

    const book = await Book.create({
      bookname: trimmedTitle,
      author: trimmedAuthor,
      totalQuantity: quantity,
      availableQuantity: quantity,
    });

    res.status(201).json({
      success: true,
      message: "New book added to library inventory!",
      book,
    });
  } catch (err) {
    next(err);
  }
};

// Fetch all books with stock status
export const getAllBooks = async (req, res, next) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });

    const formattedBooks = books.map((b) => ({
      _id: b._id,
      bookname: b.bookname,
      author: b.author,
      totalQuantity: b.totalQuantity ?? 1,
      availableQuantity: b.availableQuantity ?? (b.totalQuantity ?? 1),
      assignedCount: Math.max(0, (b.totalQuantity ?? 1) - (b.availableQuantity ?? (b.totalQuantity ?? 1))),
    }));

    res.status(200).json({
      success: true,
      books: formattedBooks,
    });
  } catch (err) {
    next(err);
  }
};

// Update book details and total quantity
export const updateBook = async (req, res, next) => {
  const { id } = req.params;
  const { bookname, author, totalQuantity } = req.body;

  try {
    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ success: false, message: "Book not found!" });
    }

    if (bookname) book.bookname = bookname.trim();
    if (author) book.author = author.trim();

    if (totalQuantity !== undefined) {
      const newTotal = parseInt(totalQuantity, 10);
      if (isNaN(newTotal) || newTotal < 0) {
        return res.status(400).json({ success: false, message: "Total quantity must be a non-negative number!" });
      }

      // Calculate how many copies are currently issued
      const issuedCount = await IssuedBook.countDocuments({ book: book._id, status: "Issued" });

      if (newTotal < issuedCount) {
        return res.status(400).json({
          success: false,
          message: `Cannot decrease stock to ${newTotal}. There are currently ${issuedCount} copies assigned to students!`,
        });
      }

      book.totalQuantity = newTotal;
      book.availableQuantity = newTotal - issuedCount;
    }

    await book.save();

    res.status(200).json({
      success: true,
      message: `Book "${book.bookname}" updated successfully!`,
      book,
    });
  } catch (err) {
    next(err);
  }
};

// Quick stock increase
export const addStock = async (req, res, next) => {
  const { id } = req.params;
  const { additionalQuantity } = req.body;

  try {
    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ success: false, message: "Book not found!" });
    }

    const addCount = parseInt(additionalQuantity, 10);
    if (isNaN(addCount) || addCount <= 0) {
      return res.status(400).json({ success: false, message: "Please specify a positive number of copies to add." });
    }

    book.totalQuantity = (book.totalQuantity || 0) + addCount;
    book.availableQuantity = (book.availableQuantity || 0) + addCount;
    await book.save();

    res.status(200).json({
      success: true,
      message: `Added ${addCount} copies to "${book.bookname}". Total stock is now ${book.totalQuantity}.`,
      book,
    });
  } catch (err) {
    next(err);
  }
};

// Delete a book from inventory
export const deleteBook = async (req, res, next) => {
  const { id } = req.params;

  try {
    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ success: false, message: "Book not found!" });
    }

    // Check if copies are currently assigned
    const activeIssues = await IssuedBook.countDocuments({ book: id, status: "Issued" });
    if (activeIssues > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete book while ${activeIssues} copies are currently issued to students. Mark them as returned first.`,
      });
    }

    await Book.findByIdAndDelete(id);
    await IssuedBook.deleteMany({ book: id });

    res.status(200).json({
      success: true,
      message: `Book "${book.bookname}" deleted from library inventory.`,
    });
  } catch (err) {
    next(err);
  }
};

// Assign / Issue book to student
export const assignBook = async (req, res, next) => {
  const { bookId, studentId, durationDays, dueDate: customDueDate } = req.body;

  try {
    if (!bookId || !studentId) {
      return res.status(400).json({ success: false, message: "Book and Student are required!" });
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ success: false, message: "Book not found!" });
    }

    if (book.availableQuantity <= 0) {
      return res.status(400).json({ success: false, message: "Book is currently out of stock!" });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found!" });
    }

    const days = parseInt(durationDays, 10) > 0 ? parseInt(durationDays, 10) : 14;
    const computedDueDate = customDueDate
      ? new Date(customDueDate)
      : new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    const issuedRecord = await IssuedBook.create({
      book: book._id,
      student: student._id,
      bookname: book.bookname,
      author: book.author,
      studentName: student.name,
      rollno: student.rollno,
      batch: student.batch || "General",
      issueDate: new Date(),
      dueDate: computedDueDate,
      durationDays: days,
      status: "Issued",
    });

    // Decrement available stock
    book.availableQuantity = Math.max(0, book.availableQuantity - 1);
    await book.save();

    res.status(201).json({
      success: true,
      message: `"${book.bookname}" assigned to ${student.name} for ${days} days!`,
      issuedRecord,
    });
  } catch (err) {
    next(err);
  }
};

// Return an issued book
export const returnBook = async (req, res, next) => {
  const { issueId } = req.params;

  try {
    const record = await IssuedBook.findById(issueId);
    if (!record) {
      return res.status(404).json({ success: false, message: "Issue record not found!" });
    }

    if (record.status === "Returned") {
      return res.status(400).json({ success: false, message: "This book has already been marked as returned." });
    }

    record.status = "Returned";
    record.returnDate = new Date();
    await record.save();

    // Increment available book stock
    const book = await Book.findById(record.book);
    if (book) {
      book.availableQuantity = Math.min(book.totalQuantity, book.availableQuantity + 1);
      await book.save();
    }

    res.status(200).json({
      success: true,
      message: `Book "${record.bookname}" successfully marked as returned!`,
      record,
    });
  } catch (err) {
    next(err);
  }
};

// Fetch all assigned / issued books with optional status & batch filters, including automatic late fee calculation
export const getAssignedBooks = async (req, res, next) => {
  try {
    const { status, search, batch } = req.query;

    const filter = {};
    if (status && status !== "all") {
      filter.status = status;
    }
    if (batch && batch !== "all") {
      filter.batch = batch;
    }

    let records = await IssuedBook.find(filter)
      .populate("book", "bookname author totalQuantity availableQuantity")
      .populate("student", "name rollno email batch mobileno")
      .sort({ createdAt: -1 });

    if (search) {
      const q = search.toLowerCase();
      records = records.filter(
        (r) =>
          r.bookname?.toLowerCase().includes(q) ||
          r.studentName?.toLowerCase().includes(q) ||
          r.rollno?.toLowerCase().includes(q) ||
          r.batch?.toLowerCase().includes(q)
      );
    }

    const now = new Date();
    const settings = await SystemSettings.findOne({ key: "otp_settings" });
    const lateFeePerDay = settings?.lateFeePerDay || 10;

    const enrichedRecords = records.map((r) => {
      const obj = r.toObject();
      const isOverdue = obj.status === "Issued" && new Date(obj.dueDate) < now;
      let overdueDays = 0;
      let calculatedLateFee = 0;

      if (isOverdue) {
        const diffMs = now.getTime() - new Date(obj.dueDate).getTime();
        overdueDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        calculatedLateFee = overdueDays * (obj.lateFeePerDay || lateFeePerDay);
      }

      obj.isOverdue = isOverdue;
      obj.overdueDays = overdueDays;
      obj.calculatedLateFee = calculatedLateFee;
      return obj;
    });

    const totalOverdueCount = enrichedRecords.filter((r) => r.isOverdue).length;
    const totalLateFeesPending = enrichedRecords.reduce((acc, r) => acc + (r.calculatedLateFee || 0), 0);
    const pendingRequestsCount = await IssuedBook.countDocuments({ status: "Requested" });

    res.status(200).json({
      success: true,
      issuedBooks: enrichedRecords,
      totalOverdueCount,
      totalLateFeesPending,
      pendingRequestsCount,
    });
  } catch (err) {
    next(err);
  }
};

export const getStudentLibraryBooks = async (req, res, next) => {
  const { studentId } = req.params;

  try {
    if (req.role === "student" && req.user?._id?.toString() !== studentId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are only authorized to view your own library books.",
      });
    }

    if (!studentId) {
      return res.status(400).json({ success: false, message: "Student ID required" });
    }

    const records = await IssuedBook.find({ student: studentId })
      .populate("book", "bookname author")
      .sort({ createdAt: -1 });

    const now = new Date();
    const settings = await SystemSettings.findOne({ key: "otp_settings" });
    const lateFeePerDay = settings?.lateFeePerDay || 10;

    let overdueCount = 0;
    let totalLateFee = 0;

    const enriched = records.map((r) => {
      const obj = r.toObject();
      const isOverdue = obj.status === "Issued" && new Date(obj.dueDate) < now;
      let overdueDays = 0;
      let calculatedLateFee = 0;

      if (isOverdue) {
        const diffMs = now.getTime() - new Date(obj.dueDate).getTime();
        overdueDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        calculatedLateFee = overdueDays * (obj.lateFeePerDay || lateFeePerDay);
        overdueCount++;
        totalLateFee += calculatedLateFee;
      }

      obj.isOverdue = isOverdue;
      obj.overdueDays = overdueDays;
      obj.calculatedLateFee = calculatedLateFee;
      return obj;
    });

    return res.status(200).json({
      success: true,
      totalAssigned: enriched.filter((b) => b.status === "Issued").length,
      pendingRequestsCount: enriched.filter((b) => b.status === "Requested").length,
      overdueCount,
      totalLateFee,
      books: enriched,
    });
  } catch (err) {
    next(err);
  }
};

// Student applies / requests to borrow a book
export const requestBorrowBook = async (req, res, next) => {
  const { bookId, studentId, durationDays } = req.body;

  try {
    if (!bookId || !studentId) {
      return res.status(400).json({ success: false, message: "Book and Student IDs are required." });
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ success: false, message: "Book not found." });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student account not found." });
    }

    // Check if student already has a pending or active copy of this book
    const existing = await IssuedBook.findOne({
      book: bookId,
      student: studentId,
      status: { $in: ["Requested", "Issued"] },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: existing.status === "Requested"
          ? "You already have a pending borrow request for this book. Please await librarian approval."
          : "You currently have an active borrowed copy of this book.",
      });
    }

    const days = parseInt(durationDays, 10) > 0 ? parseInt(durationDays, 10) : 14;

    const requestRecord = await IssuedBook.create({
      book: book._id,
      student: student._id,
      bookname: book.bookname,
      author: book.author,
      studentName: student.name,
      rollno: student.rollno,
      batch: student.batch || "General",
      durationDays: days,
      requestDate: new Date(),
      status: "Requested",
    });

    res.status(201).json({
      success: true,
      message: `Borrow request for "${book.bookname}" submitted successfully! Waiting for librarian approval.`,
      requestRecord,
    });
  } catch (err) {
    next(err);
  }
};

// Librarian / Admin approves a borrow request
export const approveBorrowRequest = async (req, res, next) => {
  const { requestId } = req.params;

  try {
    const record = await IssuedBook.findById(requestId);
    if (!record) {
      return res.status(404).json({ success: false, message: "Borrow request not found." });
    }

    if (record.status !== "Requested") {
      return res.status(400).json({
        success: false,
        message: `This request cannot be approved as its current status is "${record.status}".`,
      });
    }

    const book = await Book.findById(record.book);
    if (!book) {
      return res.status(404).json({ success: false, message: "Associated book not found in inventory." });
    }

    if (book.availableQuantity <= 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot approve request: "${book.bookname}" is currently out of stock (0 available).`,
      });
    }

    const days = record.durationDays || 14;
    const now = new Date();
    const dueDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    record.status = "Issued";
    record.issueDate = now;
    record.dueDate = dueDate;
    await record.save();

    // Decrement available copies
    book.availableQuantity = Math.max(0, book.availableQuantity - 1);
    await book.save();

    res.status(200).json({
      success: true,
      message: `Request approved! "${book.bookname}" issued to ${record.studentName} for ${days} days (Due: ${dueDate.toLocaleDateString()}).`,
      record,
    });
  } catch (err) {
    next(err);
  }
};

// Librarian / Admin rejects a borrow request
export const rejectBorrowRequest = async (req, res, next) => {
  const { requestId } = req.params;
  const { reason } = req.body;

  try {
    const record = await IssuedBook.findById(requestId);
    if (!record) {
      return res.status(404).json({ success: false, message: "Borrow request not found." });
    }

    if (record.status !== "Requested") {
      return res.status(400).json({
        success: false,
        message: `Request is not in Requested status (Current: ${record.status}).`,
      });
    }

    record.status = "Rejected";
    record.rejectionReason = reason || "Declined by Library Administration";
    await record.save();

    res.status(200).json({
      success: true,
      message: `Borrow request for "${record.bookname}" has been rejected.`,
      record,
    });
  } catch (err) {
    next(err);
  }
};
