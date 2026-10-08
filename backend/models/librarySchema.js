import mongoose from "mongoose";

const librarySchema = new mongoose.Schema(
  {
    bookname: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    totalQuantity: {
      type: Number,
      default: 1,
      min: 0,
    },
    availableQuantity: {
      type: Number,
      default: 1,
      min: 0,
    },
  },
  { timestamps: true }
);

const issuedBookSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Library",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    bookname: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      default: "",
    },
    studentName: {
      type: String,
      required: true,
    },
    rollno: {
      type: String,
      required: true,
    },
    batch: {
      type: String,
      default: "General",
    },
    requestDate: {
      type: Date,
      default: Date.now,
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
    },
    durationDays: {
      type: Number,
      default: 14,
    },
    returnDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["Requested", "Approved", "Issued", "Returned", "Rejected"],
      default: "Issued",
    },
    rejectionReason: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export const Book = mongoose.model("Library", librarySchema);
export const IssuedBook = mongoose.model("IssuedBook", issuedBookSchema);

export default Book;
