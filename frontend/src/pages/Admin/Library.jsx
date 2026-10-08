import React, { useState, useEffect, useMemo, useRef } from "react";
import AdminSidebar from "./Sidebar";
import axios from "axios";
import {
  Content,
  Title,
  AddBookForm,
  FormGroup,
  Label,
  Input,
  Button,
} from "../../styles/LibraryStyles";
import styled from "styled-components";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BACKEND_URL } from "../../constants/url";
import { formatDateDDMMYYYY, formatDateTimeDDMMYYYY } from "../../utils/dateUtils";

export const LibraryContainer = styled.div`
  display: flex;
  padding-left: 240px;
  font-family: "Inter", "Segoe UI", sans-serif;
  min-height: 100vh;
  background-color: #f8fafc;

  @media screen and (max-width: 768px) {
    flex-direction: column;
    padding-left: 0;
  }
`;

const TabContainer = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 25px;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 10px;
`;

const TabButton = styled.button`
  background: ${(props) => (props.active ? "#1ABC9C" : "transparent")};
  color: ${(props) => (props.active ? "#ffffff" : "#4A5568")};
  font-weight: 600;
  font-size: 15px;
  padding: 10px 22px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${(props) => (props.active ? "#16A085" : "#EDF2F7")};
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 15px;
  margin-bottom: 25px;
`;

const StatCard = styled.div`
  background: #ffffff;
  padding: 18px 20px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
  border-left: 4px solid ${(props) => props.color || "#1ABC9C"};

  .label {
    font-size: 13px;
    color: #64748b;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .value {
    font-size: 26px;
    font-weight: 700;
    color: #1e293b;
    margin-top: 6px;
  }
`;

const Card = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 22px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
  margin-bottom: 25px;
  border: 1px solid #e2e8f0;
`;

const TableContainer = styled.div`
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
  border: 1px solid #e2e8f0;
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
`;

const TableHeader = styled.thead`
  background-color: #f1f5f9;
  border-bottom: 2px solid #e2e8f0;
`;

const TableRow = styled.tr`
  border-bottom: 1px solid #edf2f7;
  transition: background-color 0.15s;
  &:hover {
    background-color: #f8fafc;
  }
`;

const TableHeaderCell = styled.th`
  padding: 14px 18px;
  font-size: 12px;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.6px;
`;

const TableCell = styled.td`
  padding: 14px 18px;
  font-size: 14px;
  color: #334155;
`;

const Badge = styled.span`
  display: inline-block;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: ${(props) =>
    props.type === "available"
      ? "#dcfce7"
      : props.type === "assigned"
      ? "#fef9c3"
      : props.type === "out"
      ? "#fee2e2"
      : "#f1f5f9"};
  color: ${(props) =>
    props.type === "available"
      ? "#15803d"
      : props.type === "assigned"
      ? "#854d0e"
      : props.type === "out"
      ? "#b91c1c"
      : "#475569"};
`;

const ActionBtn = styled.button`
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 600;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  background: ${(props) =>
    props.variant === "danger"
      ? "#ef4444"
      : props.variant === "warning"
      ? "#f59e0b"
      : props.variant === "secondary"
      ? "#64748b"
      : "#1ABC9C"};
  color: #ffffff;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:disabled {
    background: #cbd5e1;
    cursor: not-allowed;
    transform: none;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalBox = styled.div`
  background: #ffffff;
  border-radius: 14px;
  padding: 26px 30px;
  width: 90%;
  max-width: 560px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 12px;

  h3 {
    margin: 0;
    font-size: 20px;
    color: #1e293b;
    font-weight: 700;
  }

  button {
    background: transparent;
    border: none;
    font-size: 20px;
    cursor: pointer;
    color: #94a3b8;
    &:hover {
      color: #334155;
    }
  }
`;

const SearchInput = styled.input`
  padding: 10px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 14px;
  min-width: 240px;
  outline: none;
  &:focus {
    border-color: #1abc9c;
    box-shadow: 0 0 0 3px rgba(26, 188, 156, 0.15);
  }
`;

const StyledSelect = styled.select`
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  font-size: 14px;
  background: #fff;
  outline: none;
  &:focus {
    border-color: #1abc9c;
  }
`;

const SuggestionBox = styled.div`
  position: relative;
  width: 100%;
`;

const SuggestionList = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 50;
  list-style: none;
  margin: 4px 0 0;
  padding: 0;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
`;

const SuggestionItem = styled.li`
  padding: 10px 14px;
  font-size: 13px;
  cursor: pointer;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:hover {
    background-color: #f8fafc;
    color: #1abc9c;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const SelectedChip = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  padding: 8px 12px;
  border-radius: 8px;
  margin-top: 6px;
  font-size: 13px;
  color: #065f46;

  button {
    background: transparent;
    border: none;
    color: #047857;
    cursor: pointer;
    font-size: 14px;
    font-weight: 700;
  }
`;

const DuplicateNotice = styled.div`
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 15px;
  color: #92400e;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`;

const Library = () => {
  const [activeTab, setActiveTab] = useState("catalog"); // "catalog" | "assigned"
  const [books, setBooks] = useState([]);
  const [assignedBooks, setAssignedBooks] = useState([]);
  const [students, setStudents] = useState([]);

  // Add Book Form state
  const [newTitle, setNewTitle] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [newQuantity, setNewQuantity] = useState(1);
  const [addingBook, setAddingBook] = useState(false);

  // Edit Book Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editAuthor, setEditAuthor] = useState("");
  const [editQuantity, setEditQuantity] = useState(1);
  const [savingEdit, setSavingEdit] = useState(false);

  // Assign Book Modal state
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignBatchFilter, setAssignBatchFilter] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentSearchInput, setStudentSearchInput] = useState("");
  const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState(false);

  const [selectedBook, setSelectedBook] = useState(null);
  const [bookSearchInput, setBookSearchInput] = useState("");
  const [isBookDropdownOpen, setIsBookDropdownOpen] = useState(false);

  const [assignDuration, setAssignDuration] = useState(14);
  const [assigning, setAssigning] = useState(false);

  // Search & filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [assignedSearch, setAssignedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [assignedBatchFilter, setAssignedBatchFilter] = useState("all");

  // Student Borrow Requests state
  const [borrowRequests, setBorrowRequests] = useState([]);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  // Library Fines & Overdue state
  const [libraryFines, setLibraryFines] = useState([]);
  const [loadingFines, setLoadingFines] = useState(false);

  // Reminder Modal state
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [reminderTargetBook, setReminderTargetBook] = useState(null);
  const [reminderCustomMessage, setReminderCustomMessage] = useState("");
  const [reminderTitle, setReminderTitle] = useState("");
  const [sendingReminder, setSendingReminder] = useState(false);

  // Direct Announcement to Student Modal state
  const [isDirectAnnounceModalOpen, setIsDirectAnnounceModalOpen] = useState(false);
  const [directStudentEmail, setDirectStudentEmail] = useState("");
  const [directStudentRoll, setDirectStudentRoll] = useState("");
  const [directNoticeTitle, setDirectNoticeTitle] = useState("");
  const [directNoticeBody, setDirectNoticeBody] = useState("");
  const [sendingDirectNotice, setSendingDirectNotice] = useState(false);

  const studentDropdownRef = useRef(null);
  const bookDropdownRef = useRef(null);

  const fetchBooks = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}api/v1/library/getall`);
      setBooks(response.data.books || []);
    } catch (error) {
      console.error("Error fetching books:", error);
    }
  };

  const fetchAssignedBooks = async () => {
    try {
      const params = {};
      if (statusFilter !== "all") params.status = statusFilter;
      if (assignedBatchFilter !== "all") params.batch = assignedBatchFilter;
      if (assignedSearch.trim()) params.search = assignedSearch.trim();

      const response = await axios.get(`${BACKEND_URL}api/v1/library/assigned`, { params });
      setAssignedBooks(response.data.issuedBooks || []);
      if (response.data.pendingRequestsCount !== undefined) {
        setPendingRequestsCount(response.data.pendingRequestsCount);
      }
    } catch (error) {
      console.error("Error fetching assigned books:", error);
    }
  };

  const fetchBorrowRequests = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}api/v1/library/assigned?status=Requested`);
      const reqs = response.data.issuedBooks || [];
      setBorrowRequests(reqs);
      setPendingRequestsCount(response.data.pendingRequestsCount ?? reqs.length);
    } catch (error) {
      console.error("Error fetching borrow requests:", error);
    }
  };

  const handleApproveRequest = async (requestId) => {
    try {
      const res = await axios.put(`${BACKEND_URL}api/v1/library/approve-request/${requestId}`);
      toast.success(res.data.message || "Borrow request approved & book issued!");
      fetchBooks();
      fetchBorrowRequests();
      if (activeTab === "assigned") fetchAssignedBooks();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve request.");
    }
  };

  const handleRejectRequest = async (requestId) => {
    const reason = window.prompt("Reason for rejecting borrow request (optional):", "Copies currently reserved or unavailable.");
    if (reason === null) return;

    try {
      const res = await axios.put(`${BACKEND_URL}api/v1/library/reject-request/${requestId}`, { reason });
      toast.info(res.data.message || "Borrow request rejected.");
      fetchBooks();
      fetchBorrowRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reject request.");
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}api/v1/attendance/students`);
      setStudents(response.data || []);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const fetchLibraryFines = async () => {
    setLoadingFines(true);
    try {
      const res = await axios.get(`${BACKEND_URL}api/v1/fine/all?fineType=Library%20Late%20Return`);
      setLibraryFines(res.data?.fines || []);
    } catch (e) {
      console.error("Error fetching library fines:", e);
    } finally {
      setLoadingFines(false);
    }
  };

  const openReminderModal = (bookRecord) => {
    setReminderTargetBook(bookRecord);
    const sName = bookRecord.studentName || bookRecord.student?.name || "Student";
    const bName = bookRecord.bookname || "Book";
    const dueFormatted = formatDateDDMMYYYY(bookRecord.dueDate);
    const overdueFee = bookRecord.calculatedLateFee || 0;

    setReminderTitle(`Library Due Notice: Return "${bName}"`);
    if (bookRecord.isOverdue) {
      setReminderCustomMessage(
        `Dear ${sName}, your borrowed library book "${bName}" is currently OVERDUE (Due date: ${dueFormatted}). Outstanding late penalty: ₹${overdueFee}. Please return it to the library desk immediately to avoid further disciplinary action.`
      );
    } else {
      setReminderCustomMessage(
        `Dear ${sName}, this is a gentle reminder from the library that your borrowed book "${bName}" is due for return on ${dueFormatted}. Please return or renew on time.`
      );
    }
    setIsReminderModalOpen(true);
  };

  const submitReminder = async (e) => {
    e.preventDefault();
    if (!reminderCustomMessage.trim()) {
      toast.error("Please provide a reminder message.");
      return;
    }
    setSendingReminder(true);
    try {
      const targetEmail = reminderTargetBook?.student?.email || reminderTargetBook?.email || "";
      const targetRoll = reminderTargetBook?.rollno || reminderTargetBook?.student?.rollno || "";

      await axios.post(`${BACKEND_URL}api/v1/announcements`, {
        title: reminderTitle || "Library Notice",
        announcement: reminderCustomMessage.trim(),
        category: "Library",
        targetAudience: "single_student",
        targetEmail,
        targetRollno: targetRoll,
        createdBy: "Chief Librarian (Library Desk)",
      });

      toast.success(`Reminder notice dispatched to ${reminderTargetBook?.studentName || "student"}!`);
      setIsReminderModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send reminder.");
    } finally {
      setSendingReminder(false);
    }
  };

  const handleLevyOfficialFine = async (record) => {
    try {
      const studentId = record.student?._id || record.student;
      if (!studentId) {
        toast.error("Student ID reference not found for this issue.");
        return;
      }
      const amount = record.calculatedLateFee || 50;
      const res = await axios.post(`${BACKEND_URL}api/v1/fine/create`, {
        studentId,
        fineType: "Library Late Return",
        amount,
        reason: `Overdue return of book '${record.bookname}' (${record.overdueDays || 1} days overdue)`,
        leviedBy: "Central Library",
      });
      toast.success(res.data?.message || `Fine of ₹${amount} successfully levied!`);
      fetchLibraryFines();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to levy fine.");
    }
  };

  const submitDirectNotice = async (e) => {
    e.preventDefault();
    if (!directStudentEmail && !directStudentRoll) {
      toast.error("Please enter student email or roll number.");
      return;
    }
    if (!directNoticeBody.trim()) {
      toast.error("Please write the announcement message.");
      return;
    }
    setSendingDirectNotice(true);
    try {
      await axios.post(`${BACKEND_URL}api/v1/announcements`, {
        title: directNoticeTitle.trim() || "Library Circular",
        announcement: directNoticeBody.trim(),
        category: "Library",
        targetAudience: "single_student",
        targetEmail: directStudentEmail.trim().toLowerCase(),
        targetRollno: directStudentRoll.trim(),
        createdBy: "Chief Librarian",
      });

      toast.success("Direct library notice sent to student!");
      setIsDirectAnnounceModalOpen(false);
      setDirectStudentEmail("");
      setDirectStudentRoll("");
      setDirectNoticeTitle("");
      setDirectNoticeBody("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send announcement.");
    } finally {
      setSendingDirectNotice(false);
    }
  };

  useEffect(() => {
    fetchBooks();
    fetchStudents();
    fetchBorrowRequests();
    fetchLibraryFines();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (studentDropdownRef.current && !studentDropdownRef.current.contains(event.target)) {
        setIsStudentDropdownOpen(false);
      }
      if (bookDropdownRef.current && !bookDropdownRef.current.contains(event.target)) {
        setIsBookDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (activeTab === "assigned" || activeTab === "fines") {
      fetchAssignedBooks();
      if (activeTab === "fines") fetchLibraryFines();
    }
  }, [activeTab, statusFilter, assignedBatchFilter, assignedSearch]);

  // Overall Stock Statistics
  const stockStats = useMemo(() => {
    const totalTitles = books.length;
    const totalStock = books.reduce((acc, b) => acc + (b.totalQuantity || 1), 0);
    const availableStock = books.reduce((acc, b) => acc + (b.availableQuantity || 0), 0);
    const assignedStock = totalStock - availableStock;

    return { totalTitles, totalStock, availableStock, assignedStock };
  }, [books]);

  // Unique batches from student list
  const availableBatches = useMemo(() => {
    const batches = new Set();
    students.forEach((s) => {
      if (s.batch) batches.add(s.batch);
    });
    return Array.from(batches).sort();
  }, [students]);

  // Live duplicate detection while typing in Add Book form
  const potentialDuplicate = useMemo(() => {
    if (!newTitle.trim()) return null;
    const t = newTitle.trim().toLowerCase();
    const a = newAuthor.trim().toLowerCase();

    return books.find((b) => {
      const bTitle = b.bookname?.trim().toLowerCase();
      const bAuthor = b.author?.trim().toLowerCase();
      if (a) {
        return bTitle === t && bAuthor === a;
      }
      return bTitle === t;
    });
  }, [newTitle, newAuthor, books]);

  // Handle adding new book
  const handleAddBook = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAuthor.trim()) {
      toast.error("Please provide both title and author.");
      return;
    }

    setAddingBook(true);
    try {
      const response = await axios.post(`${BACKEND_URL}api/v1/library/books`, {
        bookname: newTitle.trim(),
        author: newAuthor.trim(),
        totalQuantity: parseInt(newQuantity, 10) || 1,
      });

      toast.success(response.data.message || "Book added to stock!");
      setNewTitle("");
      setNewAuthor("");
      setNewQuantity(1);
      fetchBooks();
    } catch (error) {
      if (error.response?.data?.duplicate) {
        toast.warn(error.response.data.message, { autoClose: 6000 });
      } else {
        toast.error(error.response?.data?.message || "Error adding book.");
      }
    } finally {
      setAddingBook(false);
    }
  };

  // Open Edit Book modal
  const handleOpenEditModal = (book) => {
    setEditingBook(book);
    setEditTitle(book.bookname);
    setEditAuthor(book.author);
    setEditQuantity(book.totalQuantity || 1);
    setIsEditModalOpen(true);
  };

  // Submit Edit Book
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingBook) return;

    setSavingEdit(true);
    try {
      const response = await axios.put(`${BACKEND_URL}api/v1/library/books/${editingBook._id}`, {
        bookname: editTitle.trim(),
        author: editAuthor.trim(),
        totalQuantity: parseInt(editQuantity, 10),
      });

      toast.success(response.data.message || "Book updated successfully!");
      setIsEditModalOpen(false);
      setEditingBook(null);
      fetchBooks();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update book.");
    } finally {
      setSavingEdit(false);
    }
  };

  // Delete Book
  const handleDeleteBook = async (book) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${book.bookname}" by ${book.author}? This will remove it from the catalog.`
    );
    if (!confirmDelete) return;

    try {
      const response = await axios.delete(`${BACKEND_URL}api/v1/library/books/${book._id}`);
      toast.success(response.data.message || "Book removed from inventory!");
      fetchBooks();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete book.");
    }
  };

  // Open assign modal (pre-fills book if provided)
  const openAssignModal = (book = null) => {
    setSelectedBook(book);
    setBookSearchInput(book ? `${book.bookname} (${book.author})` : "");
    setSelectedStudent(null);
    setStudentSearchInput("");
    setAssignDuration(14);
    setIsAssignModalOpen(true);
  };

  // Filtered students for assign suggestion
  const filteredStudentsForAssign = useMemo(() => {
    return students.filter((s) => {
      const matchesBatch =
        assignBatchFilter === "all" || (s.batch && s.batch === assignBatchFilter);
      if (!matchesBatch) return false;

      if (!studentSearchInput.trim()) return true;
      const q = studentSearchInput.toLowerCase();
      return (
        s.name?.toLowerCase().includes(q) ||
        s.rollno?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q)
      );
    });
  }, [students, assignBatchFilter, studentSearchInput]);

  // Filtered books for assign suggestion
  const filteredBooksForAssign = useMemo(() => {
    return books.filter((b) => {
      const hasStock = (b.availableQuantity || 0) > 0;
      if (!hasStock) return false;

      if (!bookSearchInput.trim()) return true;
      const q = bookSearchInput.toLowerCase();
      return (
        b.bookname?.toLowerCase().includes(q) ||
        b.author?.toLowerCase().includes(q)
      );
    });
  }, [books, bookSearchInput]);

  // Submit book assignment
  const handleAssignBook = async (e) => {
    e.preventDefault();
    if (!selectedBook) {
      toast.error("Please search and select a book to assign.");
      return;
    }
    if (!selectedStudent) {
      toast.error("Please search and select a student.");
      return;
    }

    setAssigning(true);
    try {
      const response = await axios.post(`${BACKEND_URL}api/v1/library/assign`, {
        bookId: selectedBook._id,
        studentId: selectedStudent._id,
        durationDays: parseInt(assignDuration, 10) || 14,
      });

      toast.success(response.data.message || "Book assigned successfully!");
      setIsAssignModalOpen(false);
      setSelectedBook(null);
      setSelectedStudent(null);
      fetchBooks();
      if (activeTab === "assigned") fetchAssignedBooks();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to assign book.");
    } finally {
      setAssigning(false);
    }
  };

  // Return book
  const handleReturnBook = async (issueId) => {
    try {
      const response = await axios.put(`${BACKEND_URL}api/v1/library/return/${issueId}`);
      toast.success(response.data.message || "Book marked as returned!");
      fetchBooks();
      fetchAssignedBooks();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to return book.");
    }
  };

  // Filtered books catalog
  const filteredBooks = useMemo(() => {
    if (!searchQuery.trim()) return books;
    const q = searchQuery.toLowerCase();
    return books.filter(
      (b) =>
        b.bookname?.toLowerCase().includes(q) ||
        b.author?.toLowerCase().includes(q)
    );
  }, [books, searchQuery]);

  const overdueBooks = useMemo(() => {
    return assignedBooks.filter(
      (b) => b.isOverdue || (b.status === "Issued" && new Date(b.dueDate) < new Date())
    );
  }, [assignedBooks]);

  return (
    <>
      <LibraryContainer>
        <AdminSidebar />
        <Content>
          <Title>Library Management & Book Inventory</Title>

          {/* Metric Overview Cards */}
          <StatsGrid>
            <StatCard color="#1ABC9C">
              <div className="label">Total Titles</div>
              <div className="value">{stockStats.totalTitles}</div>
            </StatCard>
            <StatCard color="#3B82F6">
              <div className="label">Total Stock / Copies</div>
              <div className="value">{stockStats.totalStock}</div>
            </StatCard>
            <StatCard color="#10B981">
              <div className="label">Available In Stock</div>
              <div className="value">{stockStats.availableStock}</div>
            </StatCard>
            <StatCard color="#F59E0B">
              <div className="label">Currently Assigned</div>
              <div className="value">{stockStats.assignedStock}</div>
            </StatCard>
          </StatsGrid>

          {/* Tabs */}
          <TabContainer style={{ display: "flex", flexWrap: "wrap", alignItems: "center" }}>
            <TabButton
              active={activeTab === "catalog"}
              onClick={() => setActiveTab("catalog")}
            >
              📚 Books Catalog & Stock
            </TabButton>
            <TabButton
              active={activeTab === "assigned"}
              onClick={() => setActiveTab("assigned")}
            >
              📋 Assigned Books & Loans
            </TabButton>
            <TabButton
              active={activeTab === "requests"}
              onClick={() => {
                setActiveTab("requests");
                fetchBorrowRequests();
              }}
            >
              📥 Borrow Requests {pendingRequestsCount > 0 && `(${pendingRequestsCount})`}
            </TabButton>
            <TabButton
              active={activeTab === "fines"}
              onClick={() => {
                setActiveTab("fines");
                fetchLibraryFines();
              }}
            >
              💰 Library Fines & Overdue ({overdueBooks.length})
            </TabButton>
            <button
              type="button"
              onClick={() => setIsDirectAnnounceModalOpen(true)}
              style={{
                marginLeft: "auto",
                background: "#4f46e5",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                padding: "8px 16px",
                fontWeight: 600,
                fontSize: "13px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: "0 2px 6px rgba(79, 70, 229, 0.25)",
              }}
            >
              📢 Notice to Student
            </button>
          </TabContainer>

          {/* TAB 1: BOOKS CATALOG */}
          {activeTab === "catalog" && (
            <>
              {/* Add New Book Form */}
              <Card>
                <h3 style={{ marginTop: 0, marginBottom: "15px", color: "#1e293b", fontWeight: 700 }}>
                  + Add Book to Inventory
                </h3>

                {potentialDuplicate && (
                  <DuplicateNotice>
                    <div>
                      <strong>⚠️ Book already listed:</strong> "{potentialDuplicate.bookname}" by {potentialDuplicate.author} is already in the library with <strong>{potentialDuplicate.totalQuantity} copies</strong> ({potentialDuplicate.availableQuantity} available).
                    </div>
                    <ActionBtn
                      type="button"
                      variant="warning"
                      onClick={() => handleOpenEditModal(potentialDuplicate)}
                    >
                      Update Stock Instead
                    </ActionBtn>
                  </DuplicateNotice>
                )}

                <AddBookForm onSubmit={handleAddBook}>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                      gap: "15px",
                      marginBottom: "15px",
                    }}
                  >
                    <FormGroup>
                      <Label htmlFor="title">Book Title:</Label>
                      <Input
                        type="text"
                        id="title"
                        placeholder="e.g. Introduction to Algorithms"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        required
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label htmlFor="author">Author:</Label>
                      <Input
                        type="text"
                        id="author"
                        placeholder="e.g. Thomas H. Cormen"
                        value={newAuthor}
                        onChange={(e) => setNewAuthor(e.target.value)}
                        required
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label htmlFor="quantity">Quantity in Stock:</Label>
                      <Input
                        type="number"
                        id="quantity"
                        min="1"
                        value={newQuantity}
                        onChange={(e) => setNewQuantity(e.target.value)}
                        required
                      />
                    </FormGroup>
                  </div>
                  <Button type="submit" disabled={addingBook}>
                    {addingBook ? "Adding Book..." : "+ Add Book to Inventory"}
                  </Button>
                </AddBookForm>
              </Card>

              {/* Catalog Search & Actions */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "15px",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                <SearchInput
                  type="text"
                  placeholder="🔍 Search title or author..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <ActionBtn onClick={() => openAssignModal()}>
                  + Assign Book to Student
                </ActionBtn>
              </div>

              {/* Books Catalog Table */}
              <TableContainer>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHeaderCell>Book Title</TableHeaderCell>
                      <TableHeaderCell>Author</TableHeaderCell>
                      <TableHeaderCell>Total Stock</TableHeaderCell>
                      <TableHeaderCell>Available</TableHeaderCell>
                      <TableHeaderCell>Currently Assigned</TableHeaderCell>
                      <TableHeaderCell>Actions</TableHeaderCell>
                    </TableRow>
                  </TableHeader>
                  <tbody>
                    {filteredBooks.length > 0 ? (
                      filteredBooks.map((book) => {
                        const isAvailable = (book.availableQuantity || 0) > 0;
                        return (
                          <TableRow key={book._id}>
                            <TableCell style={{ fontWeight: 600, color: "#1e293b" }}>
                              {book.bookname}
                            </TableCell>
                            <TableCell>{book.author}</TableCell>
                            <TableCell style={{ fontWeight: 600 }}>{book.totalQuantity || 1}</TableCell>
                            <TableCell>
                              <Badge type={isAvailable ? "available" : "out"}>
                                {book.availableQuantity || 0} in stock
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge type="assigned">
                                {book.assignedCount || 0} issued
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div style={{ display: "flex", gap: "8px" }}>
                                <ActionBtn
                                  onClick={() => openAssignModal(book)}
                                  disabled={!isAvailable}
                                  title={!isAvailable ? "Book is out of stock" : "Assign to student"}
                                >
                                  Assign
                                </ActionBtn>
                                <ActionBtn
                                  variant="warning"
                                  onClick={() => handleOpenEditModal(book)}
                                  title="Edit stock quantity and details"
                                >
                                  Edit Stock
                                </ActionBtn>
                                <ActionBtn
                                  variant="danger"
                                  onClick={() => handleDeleteBook(book)}
                                  title="Delete book"
                                >
                                  Delete
                                </ActionBtn>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan="6" style={{ textAlign: "center", padding: "35px", color: "#64748b" }}>
                          No books found matching search.
                        </TableCell>
                      </TableRow>
                    )}
                  </tbody>
                </Table>
              </TableContainer>
            </>
          )}

          {/* TAB 2: ASSIGNED BOOKS TRACKING */}
          {activeTab === "assigned" && (
            <>
              {/* Filters */}
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  marginBottom: "20px",
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <SearchInput
                  type="text"
                  placeholder="🔍 Search book, student, roll no..."
                  value={assignedSearch}
                  onChange={(e) => setAssignedSearch(e.target.value)}
                />

                <StyledSelect
                  value={assignedBatchFilter}
                  onChange={(e) => setAssignedBatchFilter(e.target.value)}
                >
                  <option value="all">🎓 All Batches</option>
                  {availableBatches.map((b) => (
                    <option key={b} value={b}>
                      Batch: {b}
                    </option>
                  ))}
                </StyledSelect>

                <StyledSelect
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Status: All</option>
                  <option value="Issued">Currently Issued</option>
                  <option value="Returned">Returned</option>
                </StyledSelect>

                <ActionBtn style={{ marginLeft: "auto" }} onClick={() => openAssignModal()}>
                  + Assign Book
                </ActionBtn>
              </div>

              {/* Assigned Books Table */}
              <TableContainer>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHeaderCell>Book Title</TableHeaderCell>
                      <TableHeaderCell>Student Name</TableHeaderCell>
                      <TableHeaderCell>Roll No</TableHeaderCell>
                      <TableHeaderCell>Batch</TableHeaderCell>
                      <TableHeaderCell>Issue Date</TableHeaderCell>
                      <TableHeaderCell>Due Date</TableHeaderCell>
                      <TableHeaderCell>Status</TableHeaderCell>
                      <TableHeaderCell>Action</TableHeaderCell>
                    </TableRow>
                  </TableHeader>
                  <tbody>
                    {assignedBooks.length > 0 ? (
                      assignedBooks.map((item) => {
                        const dueDateObj = new Date(item.dueDate);
                        const isOverdue =
                          item.status === "Issued" && dueDateObj < new Date();

                        return (
                          <TableRow key={item._id}>
                            <TableCell style={{ fontWeight: 600, color: "#1e293b" }}>
                              {item.bookname}
                            </TableCell>
                            <TableCell>{item.studentName || item.student?.name || "N/A"}</TableCell>
                            <TableCell>{item.rollno || item.student?.rollno || "N/A"}</TableCell>
                            <TableCell>
                              <span
                                style={{
                                  background: "#f1f5f9",
                                  padding: "3px 8px",
                                  borderRadius: "6px",
                                  fontSize: "12px",
                                  fontWeight: 500,
                                }}
                              >
                                {item.batch || item.student?.batch || "General"}
                              </span>
                            </TableCell>
                            <TableCell>
                              {formatDateDDMMYYYY(item.issueDate)}
                            </TableCell>
                            <TableCell>
                              {formatDateDDMMYYYY(item.dueDate)}
                              <span style={{ fontSize: "12px", color: "#64748b", marginLeft: "6px" }}>
                                ({item.durationDays || 14}d)
                              </span>
                              {isOverdue && (
                                <Badge type="out" style={{ marginLeft: "6px" }}>
                                  ⚠️ Overdue ({item.overdueDays || Math.max(1, Math.ceil((Date.now() - dueDateObj.getTime()) / (1000 * 60 * 60 * 24)))}d) • ₹{item.calculatedLateFee || (Math.max(1, Math.ceil((Date.now() - dueDateObj.getTime()) / (1000 * 60 * 60 * 24))) * 10)} Late Fee
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge type={item.status === "Issued" ? "assigned" : "available"}>
                                {item.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                                {item.status === "Issued" ? (
                                  <>
                                    <ActionBtn
                                      variant="danger"
                                      onClick={() => handleReturnBook(item._id)}
                                      style={{ padding: "6px 10px", fontSize: "12px" }}
                                    >
                                      Mark Returned
                                    </ActionBtn>
                                    <button
                                      type="button"
                                      onClick={() => openReminderModal(item)}
                                      title="Send Return / Due Reminder to Student"
                                      style={{
                                        background: "#fef3c7",
                                        color: "#b45309",
                                        border: "1px solid #fde68a",
                                        borderRadius: "6px",
                                        padding: "6px 10px",
                                        fontSize: "12px",
                                        fontWeight: 600,
                                        cursor: "pointer",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "4px",
                                      }}
                                    >
                                      🔔 Remind
                                    </button>
                                  </>
                                ) : (
                                  <span style={{ color: "#15803d", fontSize: "13px", fontWeight: 600 }}>
                                    ✓ Returned
                                  </span>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan="8" style={{ textAlign: "center", padding: "35px", color: "#64748b" }}>
                          No assigned books match your filters.
                        </TableCell>
                      </TableRow>
                    )}
                  </tbody>
                </Table>
              </TableContainer>
            </>
          )}

          {/* TAB 3: STUDENT BORROW REQUESTS */}
          {activeTab === "requests" && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <h3 style={{ margin: 0, color: "#1e293b", fontWeight: 700, fontSize: "16px" }}>
                    📥 Student Borrow Applications ({borrowRequests.length})
                  </h3>
                  <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748b" }}>
                    Review student loan applications. Approving will assign the book and decrement current library stock.
                  </p>
                </div>
                <ActionBtn type="button" variant="secondary" onClick={fetchBorrowRequests}>
                  🔄 Refresh Requests
                </ActionBtn>
              </div>

              <TableContainer>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHeaderCell>Student Info</TableHeaderCell>
                      <TableHeaderCell>Batch</TableHeaderCell>
                      <TableHeaderCell>Requested Book</TableHeaderCell>
                      <TableHeaderCell>Requested Duration</TableHeaderCell>
                      <TableHeaderCell>Date Applied</TableHeaderCell>
                      <TableHeaderCell>Available Stock</TableHeaderCell>
                      <TableHeaderCell>Actions</TableHeaderCell>
                    </TableRow>
                  </TableHeader>
                  <tbody>
                    {borrowRequests.length > 0 ? (
                      borrowRequests.map((req) => {
                        const bookAvailable = req.book?.availableQuantity ?? 1;
                        return (
                          <TableRow key={req._id}>
                            <TableCell>
                              <strong>{req.studentName}</strong>
                              <div style={{ fontSize: "12px", color: "#64748b" }}>Roll: {req.rollno}</div>
                            </TableCell>
                            <TableCell>{req.batch || "General"}</TableCell>
                            <TableCell>
                              <strong>{req.bookname}</strong>
                              <div style={{ fontSize: "12px", color: "#64748b" }}>By {req.author}</div>
                            </TableCell>
                            <TableCell>{req.durationDays || 14} Days</TableCell>
                            <TableCell>{formatDateDDMMYYYY(req.requestDate || req.createdAt)}</TableCell>
                            <TableCell>
                              <span style={{ fontWeight: 600, color: bookAvailable > 0 ? "#059669" : "#dc2626" }}>
                                {bookAvailable > 0 ? `✓ ${bookAvailable} in stock` : "Out of stock"}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div style={{ display: "flex", gap: "8px" }}>
                                <ActionBtn
                                  type="button"
                                  variant="primary"
                                  disabled={bookAvailable <= 0}
                                  onClick={() => handleApproveRequest(req._id)}
                                  title="Approve borrow request and issue book"
                                >
                                  ✓ Approve
                                </ActionBtn>
                                <ActionBtn
                                  type="button"
                                  variant="danger"
                                  onClick={() => handleRejectRequest(req._id)}
                                  title="Decline request"
                                >
                                  ✕ Reject
                                </ActionBtn>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                          No pending borrow applications from students.
                        </TableCell>
                      </TableRow>
                    )}
                  </tbody>
                </Table>
              </TableContainer>
            </>
          )}

          {/* TAB 4: LIBRARY FINES & OVERDUE STUDENTS */}
          {activeTab === "fines" && (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                  flexWrap: "wrap",
                  gap: "10px",
                }}
              >
                <div>
                  <h3 style={{ margin: 0, color: "#1e293b", fontWeight: 700, fontSize: "18px" }}>
                    💰 Library Overdue Students & Fines Registry
                  </h3>
                  <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748b" }}>
                    Monitor late book returns, dispatch direct reminder notices to students, and manage institutional library fines.
                  </p>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <ActionBtn type="button" variant="secondary" onClick={() => { fetchAssignedBooks(); fetchLibraryFines(); }}>
                    🔄 Refresh Fine Data
                  </ActionBtn>
                  <button
                    type="button"
                    onClick={() => setIsDirectAnnounceModalOpen(true)}
                    style={{
                      background: "#4f46e5",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "8px",
                      padding: "8px 16px",
                      fontWeight: 600,
                      fontSize: "13px",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    📢 Notice to Student
                  </button>
                </div>
              </div>

              {/* Quick Fines Metric Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "15px",
                  marginBottom: "25px",
                }}
              >
                <StatCard color="#dc2626">
                  <div className="label">Students with Overdue Books</div>
                  <div className="value" style={{ color: "#dc2626" }}>
                    {overdueBooks.length}
                  </div>
                </StatCard>
                <StatCard color="#ea580c">
                  <div className="label">Accruing Late Return Fees</div>
                  <div className="value" style={{ color: "#ea580c" }}>
                    ₹{overdueBooks.reduce((sum, b) => sum + (b.calculatedLateFee || 0), 0)}
                  </div>
                </StatCard>
                <StatCard color="#2563eb">
                  <div className="label">Official Invoiced Library Fines</div>
                  <div className="value" style={{ color: "#2563eb" }}>
                    {libraryFines.length} (₹{libraryFines.reduce((sum, f) => sum + (Number(f.amount) || 0), 0)})
                  </div>
                </StatCard>
              </div>

              {/* Section 1: Active Overdue Borrowers */}
              <Card style={{ padding: "20px", marginBottom: "25px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                  <h4 style={{ margin: 0, color: "#991b1b", fontSize: "15px", fontWeight: 700 }}>
                    ⚠️ Active Overdue Book Borrowers ({overdueBooks.length})
                  </h4>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>
                    Late fee accumulates daily per institutional policy
                  </span>
                </div>

                <TableContainer>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHeaderCell>Book Title</TableHeaderCell>
                        <TableHeaderCell>Student Details</TableHeaderCell>
                        <TableHeaderCell>Batch & Dept</TableHeaderCell>
                        <TableHeaderCell>Due Date</TableHeaderCell>
                        <TableHeaderCell>Overdue Days</TableHeaderCell>
                        <TableHeaderCell>Accrued Fee</TableHeaderCell>
                        <TableHeaderCell>Immediate Action</TableHeaderCell>
                      </TableRow>
                    </TableHeader>
                    <tbody>
                      {overdueBooks.length > 0 ? (
                        overdueBooks.map((item) => (
                          <TableRow key={item._id}>
                            <TableCell style={{ fontWeight: 600, color: "#1e293b" }}>
                              {item.bookname}
                            </TableCell>
                            <TableCell>
                              <strong>{item.studentName || item.student?.name || "Student"}</strong>
                              <div style={{ fontSize: "12px", color: "#64748b" }}>
                                Roll: {item.rollno || item.student?.rollno || "N/A"} • {item.student?.email || item.email || ""}
                              </div>
                            </TableCell>
                            <TableCell>
                              <span style={{ background: "#f1f5f9", padding: "2px 8px", borderRadius: "6px", fontSize: "12px" }}>
                                {item.batch || item.student?.batch || "General"}
                              </span>
                            </TableCell>
                            <TableCell style={{ color: "#dc2626", fontWeight: 600 }}>
                              {formatDateDDMMYYYY(item.dueDate)}
                            </TableCell>
                            <TableCell>
                              <span style={{ background: "#fee2e2", color: "#b91c1c", padding: "3px 8px", borderRadius: "6px", fontWeight: 700, fontSize: "12px" }}>
                                {item.overdueDays || 1} Days Late
                              </span>
                            </TableCell>
                            <TableCell style={{ fontWeight: 700, color: "#dc2626", fontSize: "14px" }}>
                              ₹{item.calculatedLateFee || 50}
                            </TableCell>
                            <TableCell>
                              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                                <button
                                  type="button"
                                  onClick={() => openReminderModal(item)}
                                  style={{
                                    background: "#fef3c7",
                                    color: "#b45309",
                                    border: "1px solid #fde68a",
                                    borderRadius: "6px",
                                    padding: "5px 10px",
                                    fontSize: "12px",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                  }}
                                >
                                  🔔 Send Reminder
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleLevyOfficialFine(item)}
                                  title="Add official fine invoice to student accounts billing"
                                  style={{
                                    background: "#fee2e2",
                                    color: "#dc2626",
                                    border: "1px solid #fecaca",
                                    borderRadius: "6px",
                                    padding: "5px 10px",
                                    fontSize: "12px",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                  }}
                                >
                                  ⚖️ Invoice Fine
                                </button>
                                <ActionBtn
                                  variant="danger"
                                  style={{ padding: "5px 10px", fontSize: "12px" }}
                                  onClick={() => handleReturnBook(item._id)}
                                >
                                  Mark Returned
                                </ActionBtn>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} style={{ textAlign: "center", padding: "30px", color: "#16a34a", fontWeight: 600 }}>
                            🎉 Great news! There are currently no overdue book borrowers in the system.
                          </TableCell>
                        </TableRow>
                      )}
                    </tbody>
                  </Table>
                </TableContainer>
              </Card>

              {/* Section 2: Official Levied Library Fines */}
              <Card style={{ padding: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                  <h4 style={{ margin: 0, color: "#1e293b", fontSize: "15px", fontWeight: 700 }}>
                    📋 Recorded Institutional Library Fines ({libraryFines.length})
                  </h4>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>
                    Recorded in Financial Billing Portal
                  </span>
                </div>

                <TableContainer>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHeaderCell>Student Name</TableHeaderCell>
                        <TableHeaderCell>Roll No</TableHeaderCell>
                        <TableHeaderCell>Fine Amount</TableHeaderCell>
                        <TableHeaderCell>Reason / Description</TableHeaderCell>
                        <TableHeaderCell>Status</TableHeaderCell>
                        <TableHeaderCell>Date Levied</TableHeaderCell>
                      </TableRow>
                    </TableHeader>
                    <tbody>
                      {libraryFines.length > 0 ? (
                        libraryFines.map((f) => (
                          <TableRow key={f._id}>
                            <TableCell style={{ fontWeight: 600 }}>
                              {f.studentName || f.student?.name || "Student"}
                            </TableCell>
                            <TableCell>{f.rollno || f.student?.rollno || "N/A"}</TableCell>
                            <TableCell style={{ fontWeight: 700, color: f.status === "Paid" ? "#15803d" : "#dc2626" }}>
                              ₹{f.amount}
                            </TableCell>
                            <TableCell style={{ fontSize: "13px", color: "#475569" }}>
                              {f.reason}
                            </TableCell>
                            <TableCell>
                              <span
                                style={{
                                  background: f.status === "Paid" ? "#dcfce7" : f.status === "Waived" ? "#f1f5f9" : "#fee2e2",
                                  color: f.status === "Paid" ? "#15803d" : f.status === "Waived" ? "#475569" : "#b91c1c",
                                  padding: "3px 8px",
                                  borderRadius: "6px",
                                  fontSize: "12px",
                                  fontWeight: 700,
                                }}
                              >
                                {f.status}
                              </span>
                            </TableCell>
                            <TableCell>
                              {formatDateDDMMYYYY(f.createdAt)}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                            No formal library fines recorded yet.
                          </TableCell>
                        </TableRow>
                      )}
                    </tbody>
                  </Table>
                </TableContainer>
              </Card>
            </>
          )}

          {/* EDIT BOOK MODAL - ONLY CLOSES ON CLOSE ICON OR CANCEL */}
          {isEditModalOpen && editingBook && (
            <ModalOverlay>
              <ModalBox onClick={(e) => e.stopPropagation()}>
                <ModalHeader>
                  <h3>Edit Book & Stock Quantity</h3>
                  <button onClick={() => setIsEditModalOpen(false)}>✕</button>
                </ModalHeader>

                <form onSubmit={handleSaveEdit}>
                  <FormGroup>
                    <Label>Book Title:</Label>
                    <Input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      required
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Author:</Label>
                    <Input
                      type="text"
                      value={editAuthor}
                      onChange={(e) => setEditAuthor(e.target.value)}
                      required
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Total Stock Quantity:</Label>
                    <Input
                      type="number"
                      min={editingBook.assignedCount || 0}
                      value={editQuantity}
                      onChange={(e) => setEditQuantity(e.target.value)}
                      required
                    />
                    <small style={{ color: "#64748b", marginTop: "4px", display: "block" }}>
                      Currently issued: {editingBook.assignedCount || 0}. Total stock cannot be less than issued copies.
                    </small>
                  </FormGroup>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: "10px",
                      marginTop: "20px",
                    }}
                  >
                    <ActionBtn
                      type="button"
                      variant="secondary"
                      onClick={() => setIsEditModalOpen(false)}
                    >
                      Cancel
                    </ActionBtn>
                    <ActionBtn type="submit" disabled={savingEdit}>
                      {savingEdit ? "Saving..." : "Save Changes"}
                    </ActionBtn>
                  </div>
                </form>
              </ModalBox>
            </ModalOverlay>
          )}

          {/* ASSIGN BOOK MODAL - ONLY CLOSES ON CLOSE ICON OR CANCEL */}
          {isAssignModalOpen && (
            <ModalOverlay>
              <ModalBox onClick={(e) => e.stopPropagation()}>
                <ModalHeader>
                  <h3>Assign Book to Student</h3>
                  <button onClick={() => setIsAssignModalOpen(false)}>✕</button>
                </ModalHeader>

                <form onSubmit={handleAssignBook}>
                  {/* Select Book with Search / Suggest */}
                  <FormGroup style={{ position: "relative" }}>
                    <Label>Select Book (Type to Search):</Label>
                    {selectedBook ? (
                      <SelectedChip>
                        <span>
                          📖 <strong>{selectedBook.bookname}</strong> by {selectedBook.author} ({selectedBook.availableQuantity} available)
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedBook(null);
                            setBookSearchInput("");
                          }}
                        >
                          ✕
                        </button>
                      </SelectedChip>
                    ) : (
                      <SuggestionBox ref={bookDropdownRef}>
                        <Input
                          type="text"
                          placeholder="Type book title or author..."
                          value={bookSearchInput}
                          onChange={(e) => {
                            setBookSearchInput(e.target.value);
                            setIsBookDropdownOpen(true);
                          }}
                          onFocus={() => setIsBookDropdownOpen(true)}
                        />
                        {isBookDropdownOpen && (
                          <SuggestionList>
                            {filteredBooksForAssign.length > 0 ? (
                              filteredBooksForAssign.slice(0, 10).map((b) => (
                                <SuggestionItem
                                  key={b._id}
                                  onClick={() => {
                                    setSelectedBook(b);
                                    setIsBookDropdownOpen(false);
                                  }}
                                >
                                  <div>
                                    <strong>{b.bookname}</strong>
                                    <span style={{ color: "#64748b", marginLeft: "6px" }}>
                                      by {b.author}
                                    </span>
                                  </div>
                                  <Badge type="available">
                                    {b.availableQuantity} in stock
                                  </Badge>
                                </SuggestionItem>
                              ))
                            ) : (
                              <SuggestionItem style={{ color: "#94a3b8" }}>
                                No available books matching "{bookSearchInput}"
                              </SuggestionItem>
                            )}
                          </SuggestionList>
                        )}
                      </SuggestionBox>
                    )}
                  </FormGroup>

                  {/* Batch Filter for Students */}
                  <FormGroup>
                    <Label>Filter Students by Batch:</Label>
                    <StyledSelect
                      style={{ width: "100%" }}
                      value={assignBatchFilter}
                      onChange={(e) => {
                        setAssignBatchFilter(e.target.value);
                        setSelectedStudent(null);
                      }}
                    >
                      <option value="all">🎓 All Batches ({students.length} students)</option>
                      {availableBatches.map((b) => {
                        const count = students.filter((s) => s.batch === b).length;
                        return (
                          <option key={b} value={b}>
                            Batch: {b} ({count} students)
                          </option>
                        );
                      })}
                    </StyledSelect>
                  </FormGroup>

                  {/* Select Student with Search / Suggest */}
                  <FormGroup style={{ position: "relative" }}>
                    <Label>Select Student (Type name or roll no):</Label>
                    {selectedStudent ? (
                      <SelectedChip>
                        <span>
                          👤 <strong>{selectedStudent.name}</strong> (Roll: {selectedStudent.rollno}) — {selectedStudent.batch || "General"}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedStudent(null);
                            setStudentSearchInput("");
                          }}
                        >
                          ✕
                        </button>
                      </SelectedChip>
                    ) : (
                      <SuggestionBox ref={studentDropdownRef}>
                        <Input
                          type="text"
                          placeholder="Type student name, roll number, or email..."
                          value={studentSearchInput}
                          onChange={(e) => {
                            setStudentSearchInput(e.target.value);
                            setIsStudentDropdownOpen(true);
                          }}
                          onFocus={() => setIsStudentDropdownOpen(true)}
                        />
                        {isStudentDropdownOpen && (
                          <SuggestionList>
                            {filteredStudentsForAssign.length > 0 ? (
                              filteredStudentsForAssign.slice(0, 10).map((s) => (
                                <SuggestionItem
                                  key={s._id}
                                  onClick={() => {
                                    setSelectedStudent(s);
                                    setIsStudentDropdownOpen(false);
                                  }}
                                >
                                  <div>
                                    <strong>{s.name}</strong>
                                    <span style={{ color: "#64748b", marginLeft: "6px" }}>
                                      Roll: {s.rollno}
                                    </span>
                                  </div>
                                  <span
                                    style={{
                                      fontSize: "12px",
                                      background: "#f1f5f9",
                                      padding: "2px 6px",
                                      borderRadius: "4px",
                                    }}
                                  >
                                    {s.batch || "General"}
                                  </span>
                                </SuggestionItem>
                              ))
                            ) : (
                              <SuggestionItem style={{ color: "#94a3b8" }}>
                                No students found matching search.
                              </SuggestionItem>
                            )}
                          </SuggestionList>
                        )}
                      </SuggestionBox>
                    )}
                  </FormGroup>

                  {/* Duration Days */}
                  <FormGroup>
                    <Label>Duration (Loan Period in Days):</Label>
                    <Input
                      type="number"
                      min="1"
                      max="365"
                      value={assignDuration}
                      onChange={(e) => setAssignDuration(e.target.value)}
                      required
                    />
                    <small style={{ color: "#64748b", marginTop: "4px", display: "block" }}>
                      Due date: {formatDateDDMMYYYY(new Date(Date.now() + (parseInt(assignDuration, 10) || 14) * 24 * 60 * 60 * 1000))}
                    </small>
                  </FormGroup>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: "10px",
                      marginTop: "20px",
                    }}
                  >
                    <ActionBtn
                      type="button"
                      variant="secondary"
                      onClick={() => setIsAssignModalOpen(false)}
                    >
                      Cancel
                    </ActionBtn>
                    <ActionBtn type="submit" disabled={assigning}>
                      {assigning ? "Assigning Book..." : "Confirm & Assign"}
                    </ActionBtn>
                  </div>
                </form>
              </ModalBox>
            </ModalOverlay>
          )}

          {/* REMINDER MODAL FOR BORROWED / OVERDUE BOOK */}
          {isReminderModalOpen && reminderTargetBook && (
            <ModalOverlay onClick={() => setIsReminderModalOpen(false)}>
              <ModalBox onClick={(e) => e.stopPropagation()} style={{ maxWidth: "560px" }}>
                <ModalHeader>
                  <h3>🔔 Send Book Return Reminder to Student</h3>
                  <button onClick={() => setIsReminderModalOpen(false)}>✕</button>
                </ModalHeader>

                <form onSubmit={submitReminder}>
                  <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "8px", marginBottom: "16px", border: "1px solid #e2e8f0" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "13px" }}>
                      <div><strong>Student:</strong> {reminderTargetBook.studentName || reminderTargetBook.student?.name}</div>
                      <div><strong>Roll No:</strong> {reminderTargetBook.rollno || reminderTargetBook.student?.rollno}</div>
                      <div><strong>Book:</strong> {reminderTargetBook.bookname}</div>
                      <div><strong>Due Date:</strong> {formatDateDDMMYYYY(reminderTargetBook.dueDate)}</div>
                      {reminderTargetBook.isOverdue && (
                        <div style={{ gridColumn: "1 / -1", color: "#dc2626", fontWeight: 700 }}>
                          ⚠️ Overdue: {reminderTargetBook.overdueDays || 1} days • Late Penalty: ₹{reminderTargetBook.calculatedLateFee || 0}
                        </div>
                      )}
                    </div>
                  </div>

                  <FormGroup>
                    <Label>Notice Title:</Label>
                    <Input
                      type="text"
                      value={reminderTitle}
                      onChange={(e) => setReminderTitle(e.target.value)}
                      required
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Custom Reminder Message (Delivered as Student Notification & Announcement):</Label>
                    <textarea
                      rows={5}
                      style={{
                        width: "100%",
                        padding: "10px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "8px",
                        fontSize: "13px",
                        fontFamily: "inherit",
                        boxSizing: "border-box",
                        resize: "vertical",
                      }}
                      value={reminderCustomMessage}
                      onChange={(e) => setReminderCustomMessage(e.target.value)}
                      required
                    />
                  </FormGroup>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px" }}>
                    <button
                      type="button"
                      onClick={() => setIsReminderModalOpen(false)}
                      style={{
                        padding: "9px 18px",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        background: "#fff",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={sendingReminder}
                      style={{
                        padding: "9px 18px",
                        borderRadius: "8px",
                        border: "none",
                        background: "#f59e0b",
                        color: "#fff",
                        cursor: "pointer",
                        fontWeight: 700,
                      }}
                    >
                      {sendingReminder ? "Sending..." : "🚀 Dispatch Reminder Notice"}
                    </button>
                  </div>
                </form>
              </ModalBox>
            </ModalOverlay>
          )}

          {/* DIRECT ANNOUNCEMENT TO SPECIFIC STUDENT MODAL */}
          {isDirectAnnounceModalOpen && (
            <ModalOverlay onClick={() => setIsDirectAnnounceModalOpen(false)}>
              <ModalBox onClick={(e) => e.stopPropagation()} style={{ maxWidth: "560px" }}>
                <ModalHeader>
                  <h3>📢 Send Targeted Library Notice to Student</h3>
                  <button onClick={() => setIsDirectAnnounceModalOpen(false)}>✕</button>
                </ModalHeader>

                <form onSubmit={submitDirectNotice}>
                  <FormGroup>
                    <Label>Target Student Email *:</Label>
                    <Input
                      type="email"
                      placeholder="e.g. demo30262@gmail.com"
                      value={directStudentEmail}
                      onChange={(e) => setDirectStudentEmail(e.target.value)}
                      required
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Student Roll Number (Optional):</Label>
                    <Input
                      type="text"
                      placeholder="e.g. CS2024001"
                      value={directStudentRoll}
                      onChange={(e) => setDirectStudentRoll(e.target.value)}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Notice / Circular Title *:</Label>
                    <Input
                      type="text"
                      placeholder="e.g. Special Library Notice regarding Reserve Books"
                      value={directNoticeTitle}
                      onChange={(e) => setDirectNoticeTitle(e.target.value)}
                      required
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Announcement Message *:</Label>
                    <textarea
                      rows={5}
                      style={{
                        width: "100%",
                        padding: "10px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "8px",
                        fontSize: "13px",
                        fontFamily: "inherit",
                        boxSizing: "border-box",
                        resize: "vertical",
                      }}
                      placeholder="Type the message for this student..."
                      value={directNoticeBody}
                      onChange={(e) => setDirectNoticeBody(e.target.value)}
                      required
                    />
                  </FormGroup>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px" }}>
                    <button
                      type="button"
                      onClick={() => setIsDirectAnnounceModalOpen(false)}
                      style={{
                        padding: "9px 18px",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        background: "#fff",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={sendingDirectNotice}
                      style={{
                        padding: "9px 18px",
                        borderRadius: "8px",
                        border: "none",
                        background: "#4f46e5",
                        color: "#fff",
                        cursor: "pointer",
                        fontWeight: 700,
                      }}
                    >
                      {sendingDirectNotice ? "Publishing..." : "✓ Send Notice to Student"}
                    </button>
                  </div>
                </form>
              </ModalBox>
            </ModalOverlay>
          )}
        </Content>
      </LibraryContainer>
      <ToastContainer />
    </>
  );
};

export default Library;
