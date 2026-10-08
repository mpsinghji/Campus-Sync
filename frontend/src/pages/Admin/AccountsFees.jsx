import React, { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cookies from "js-cookie";
import { BACKEND_URL } from "../../constants/url";
import { formatDateDDMMYYYY } from "../../utils/dateUtils";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 28px 36px;
  padding-left: 286px;
  background-color: #f8fafc;
  min-height: 100vh;
  box-sizing: border-box;
  font-family: "Inter", "Segoe UI", sans-serif;

  @media screen and (max-width: 768px) {
    padding-left: 20px;
    padding-right: 20px;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;

  .title-area {
    h1 {
      font-size: 24px;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 6px 0;
    }
    p {
      font-size: 14px;
      color: #64748b;
      margin: 0;
    }
  }

  .action-area {
    display: flex;
    gap: 12px;
  }
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 18px;
  margin-bottom: 24px;
`;

const MetricCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 18px 22px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 4px;
    background: ${(props) => props.$borderColor || "#1abc9c"};
  }

  .title {
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    color: #64748b;
    letter-spacing: 0.5px;
    margin-bottom: 6px;
  }

  .value {
    font-size: 22px;
    font-weight: 700;
    color: #1e293b;
  }

  .subtitle {
    font-size: 12px;
    color: #94a3b8;
    margin-top: 4px;
  }
`;

const FilterBar = styled.div`
  background: white;
  border-radius: 12px;
  padding: 16px 20px;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;

  .left-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
  }

  input,
  select {
    padding: 9px 14px;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    font-size: 13px;
    outline: none;
    transition: all 0.2s;

    &:focus {
      border-color: #1abc9c;
      box-shadow: 0 0 0 3px rgba(26, 188, 156, 0.15);
    }
  }

  input {
    min-width: 260px;
  }
`;

const PrimaryButton = styled.button`
  background: #1abc9c;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 18px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;

  &:hover {
    background: #16a085;
  }
`;

const TableCard = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 13px;

  th {
    background: #f8fafc;
    color: #475569;
    font-weight: 600;
    padding: 14px 18px;
    border-bottom: 1px solid #e2e8f0;
    text-transform: uppercase;
    font-size: 11px;
    letter-spacing: 0.5px;
  }

  td {
    padding: 14px 18px;
    border-bottom: 1px solid #f1f5f9;
    color: #334155;
    vertical-align: middle;
  }

  tr:hover td {
    background: #f8fafc;
  }
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: ${(props) => {
    if (props.$status === "Paid") return "#dcfce7";
    if (props.$status === "Partial") return "#fef3c7";
    return "#fee2e2";
  }};
  color: ${(props) => {
    if (props.$status === "Paid") return "#166534";
    if (props.$status === "Partial") return "#92400e";
    return "#991b1b";
  }};
`;

const ActionBtn = styled.button`
  background: ${(props) => props.$bg || "#f1f5f9"};
  color: ${(props) => props.$color || "#334155"};
  border: 1px solid ${(props) => props.$borderColor || "transparent"};
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-right: 6px;

  &:hover {
    filter: brightness(0.95);
  }
`;

// Modal overlay that does NOT close on backdrop click
const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 14px;
  padding: 28px;
  width: 90%;
  max-width: 520px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
  border: 1px solid #e2e8f0;
  position: relative;

  .close-icon {
    position: absolute;
    top: 20px;
    right: 20px;
    background: #f1f5f9;
    border: none;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    font-size: 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #64748b;
    transition: all 0.2s;

    &:hover {
      background: #e2e8f0;
      color: #0f172a;
    }
  }

  h2 {
    font-size: 18px;
    font-weight: 700;
    color: #1e293b;
    margin: 0 0 6px 0;
  }

  p {
    font-size: 13px;
    color: #64748b;
    margin: 0 0 20px 0;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 14px;

    label {
      font-size: 12px;
      font-weight: 600;
      color: #475569;
    }

    input,
    select,
    textarea {
      padding: 10px 14px;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-size: 13px;
      outline: none;
      transition: all 0.2s;

      &:focus {
        border-color: #1abc9c;
        box-shadow: 0 0 0 3px rgba(26, 188, 156, 0.15);
      }
    }
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 22px;
  }
`;

const LargeModalContent = styled.div`
  background: white;
  border-radius: 16px;
  padding: 30px;
  width: 92%;
  max-width: 860px;
  max-height: 88vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border: 1px solid #e2e8f0;
  position: relative;

  .close-icon {
    position: absolute;
    top: 20px;
    right: 20px;
    background: #f1f5f9;
    border: none;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    font-size: 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #64748b;
    transition: all 0.2s;

    &:hover {
      background: #e2e8f0;
      color: #0f172a;
    }
  }
`;

const StudentInfoBanner = styled.div`
  background: #f8fafc;
  border-radius: 12px;
  padding: 16px 20px;
  border: 1px solid #e2e8f0;
  margin-bottom: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;

  .info-block {
    .label {
      font-size: 11px;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .val {
      font-size: 14px;
      font-weight: 700;
      color: #1e293b;
      margin-top: 2px;
    }
  }
`;

const LedgerSummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 14px;
  margin-bottom: 24px;
`;

const LedgerCard = styled.div`
  background: white;
  border-radius: 10px;
  padding: 14px 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

  .lbl {
    font-size: 11px;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
  }
  .val {
    font-size: 18px;
    font-weight: 800;
    color: ${(props) => props.$color || "#1e293b"};
    margin-top: 4px;
  }
  .sub {
    font-size: 11px;
    color: #94a3b8;
    margin-top: 2px;
  }
`;

const ReceiptModalContent = styled.div`
  background: white;
  border-radius: 14px;
  padding: 30px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border: 1px solid #cbd5e1;
  position: relative;
  font-family: "Inter", sans-serif;

  .close-icon {
    position: absolute;
    top: 16px;
    right: 16px;
    background: #f1f5f9;
    border: none;
    border-radius: 50%;
    width: 28px;
    height: 28px;
    font-size: 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #64748b;
  }

  .receipt-header {
    text-align: center;
    border-bottom: 2px dashed #cbd5e1;
    padding-bottom: 16px;
    margin-bottom: 16px;

    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
    }
    p {
      margin: 4px 0 0 0;
      font-size: 12px;
      color: #64748b;
    }
  }

  .receipt-row {
    display: flex;
    justify-content: space-between;
    padding: 6px 0;
    font-size: 13px;
    border-bottom: 1px solid #f1f5f9;

    .key {
      color: #64748b;
    }
    .val {
      font-weight: 600;
      color: #1e293b;
    }
  }

  .receipt-total {
    margin-top: 14px;
    padding-top: 12px;
    border-top: 2px solid #0f172a;
    display: flex;
    justify-content: space-between;
    font-size: 16px;
    font-weight: 800;
    color: #047857;
  }
`;

const AccountsFees = () => {
  const [students, setStudents] = useState([]);
  const [metrics, setMetrics] = useState({
    totalStudents: 0,
    paidCount: 0,
    partialCount: 0,
    pendingCount: 0,
    totalCollected: 0,
    totalPending: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [batchFilter, setBatchFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentPendingFines, setStudentPendingFines] = useState([]);
  const [studentPaidSemesters, setStudentPaidSemesters] = useState([]);
  const [paymentForm, setPaymentForm] = useState({
    studentId: "",
    paymentCategory: "semester", // "semester" | "fine"
    semester: "Semester 1",
    academicYear: "2024-2025",
    amount: "",
    fineId: "",
    fineType: "Library Late Return",
    isCustomFine: false,
    paymentMode: "Cash",
    remarks: "",
  });
  const [submittingPayment, setSubmittingPayment] = useState(false);

  const [activeTab, setActiveTab] = useState("tuition"); // "tuition" | "fines"

  // Pagination / Slicing state
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Fines state
  const [finesList, setFinesList] = useState([]);
  const [finesLoading, setFinesLoading] = useState(false);
  const [isCreateFineModalOpen, setIsCreateFineModalOpen] = useState(false);
  const [createFineForm, setCreateFineForm] = useState({
    studentId: "",
    fineType: "Library Late Return",
    amount: "",
    reason: "",
    dueDate: "",
  });
  const [submittingFine, setSubmittingFine] = useState(false);

  // Student Ledger / Fee History Modal State
  const [selectedStudentForHistory, setSelectedStudentForHistory] = useState(null);
  const [feeHistoryData, setFeeHistoryData] = useState(null);
  const [feeHistoryLoading, setFeeHistoryLoading] = useState(false);
  const [selectedReceiptForPrint, setSelectedReceiptForPrint] = useState(null);

  // Reminders sent cache to give visual feedback
  const [remindedStudents, setRemindedStudents] = useState({});

  // Reminder Purpose Modal State
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [reminderTargetStudent, setReminderTargetStudent] = useState(null);
  const [reminderPurpose, setReminderPurpose] = useState("pending_semester"); // "pending_semester" | "late_fee" | "fine" | "defaulter" | "custom"
  const [reminderSemester, setReminderSemester] = useState("Semester 1");
  const [reminderAmount, setReminderAmount] = useState("");
  const [reminderFineType, setReminderFineType] = useState("Library Late Return");
  const [reminderDeadline, setReminderDeadline] = useState("");
  const [reminderMessage, setReminderMessage] = useState("");
  const [submittingReminder, setSubmittingReminder] = useState(false);

  const generateReminderMessage = (student, purpose, semester, amount, fineType, deadline) => {
    if (!student) return "";
    const sName = student.name || "Student";
    const sRoll = student.rollno || "N/A";
    const amtStr = amount && Number(amount) > 0 ? `₹${Number(amount).toLocaleString()}` : "dues";
    const dateStr = deadline ? ` by ${deadline}` : " at the earliest";

    switch (purpose) {
      case "pending_semester":
        return `Dear ${sName} (${sRoll}), this is an official fee reminder from the Accounts Department to clear your pending tuition fee of ${amtStr} for ${semester}${dateStr}. Kindly settle your fee through the CampusSync student portal or at the accounts cash counter.`;
      case "late_fee":
        return `Dear ${sName} (${sRoll}), please be advised that an overdue late fee penalty of ${amtStr} has been levied on your student account due to delayed semester payment. Kindly settle this overdue late charge${dateStr} to maintain clear academic standing.`;
      case "fine":
        return `Dear ${sName} (${sRoll}), you have an outstanding institutional fine of ${amtStr} issued for "${fineType}". Please pay this fine${dateStr} through your student account or at the administrative counter.`;
      case "defaulter":
        return `URGENT DEFAULTER NOTICE: Dear ${sName} (${sRoll}), total pending dues of ${amtStr} remain unresolved on your account. Please clear all pending dues${dateStr} to prevent hold on examination clearance and issuance of hall tickets.`;
      case "custom":
        return `Dear ${sName} (${sRoll}), this is an administrative reminder from Accounts Department regarding your student account balance of ${amtStr}. Please contact the accounts office${dateStr}.`;
      default:
        return `Dear ${sName} (${sRoll}), this is an official reminder from Accounts to clear your pending dues of ${amtStr}${dateStr}.`;
    }
  };

  const handleOpenReminderModal = (student) => {
    setReminderTargetStudent(student);
    const purpose = "pending_semester";
    const sem = student.semester || "Semester 1";
    const amt = student.balance || 45000;
    const fine = "Library Late Return";
    const dead = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];

    setReminderPurpose(purpose);
    setReminderSemester(sem);
    setReminderAmount(amt);
    setReminderFineType(fine);
    setReminderDeadline(dead);
    setReminderMessage(generateReminderMessage(student, purpose, sem, amt, fine, dead));
    setIsReminderModalOpen(true);
  };

  const handleSendReminderSubmit = async (e) => {
    e.preventDefault();
    if (!reminderTargetStudent) return;

    setSubmittingReminder(true);
    try {
      let purposeTitle = "Pending Tuition Fee";
      if (reminderPurpose === "late_fee") purposeTitle = "Overdue Late Fee";
      else if (reminderPurpose === "fine") purposeTitle = `Institutional Fine (${reminderFineType})`;
      else if (reminderPurpose === "defaulter") purposeTitle = "Defaulter Warning Notice";
      else if (reminderPurpose === "custom") purposeTitle = "Accounts Circular";

      const res = await axios.post(`${BACKEND_URL}api/v1/fee/send-reminder`, {
        studentId: reminderTargetStudent._id,
        email: reminderTargetStudent.email,
        title: `Fee Notice: ${purposeTitle}`,
        purpose: purposeTitle,
        amount: Number(reminderAmount) || 0,
        message: reminderMessage,
      });

      if (res.data?.success) {
        toast.success(`Fee notice (${purposeTitle}) dispatched to ${reminderTargetStudent.name}!`);
        setRemindedStudents((prev) => ({
          ...prev,
          [reminderTargetStudent._id]: true,
        }));
        setIsReminderModalOpen(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send fee reminder.");
    } finally {
      setSubmittingReminder(false);
    }
  };

  const fetchFinesData = async () => {
    setFinesLoading(true);
    try {
      const res = await axios.get(`${BACKEND_URL}api/v1/fine/all`);
      if (res.data?.success) {
        setFinesList(res.data.fines || []);
      }
    } catch (err) {
      console.warn("Error fetching campus fines:", err.message);
    } finally {
      setFinesLoading(false);
    }
  };

  const handleOpenStudentFeeHistory = async (student) => {
    setSelectedStudentForHistory(student);
    setFeeHistoryLoading(true);
    setFeeHistoryData(null);
    try {
      const [histRes, fineRes] = await Promise.all([
        axios.get(`${BACKEND_URL}api/v1/fee/history/${student._id}`),
        axios.get(`${BACKEND_URL}api/v1/fine/student/${student._id}`).catch(() => ({ data: { fines: [] } })),
      ]);

      if (histRes.data?.success) {
        setFeeHistoryData({
          ...histRes.data,
          studentFines: fineRes.data?.fines || [],
        });
      } else {
        toast.error("Failed to load student fee history.");
      }
    } catch (err) {
      console.error("Error fetching student fee history:", err);
      toast.error("Failed to load fee history records.");
    } finally {
      setFeeHistoryLoading(false);
    }
  };

  const handleCreateFineSubmit = async (e) => {
    e.preventDefault();
    if (!createFineForm.studentId || !createFineForm.amount || Number(createFineForm.amount) <= 0) {
      toast.error("Please select a student and enter a valid fine amount.");
      return;
    }

    setSubmittingFine(true);
    try {
      const adminData = Cookies.get("adminData");
      const issuedBy = adminData ? JSON.parse(adminData)?.name || "Accounts Dept" : "Accounts Dept";

      const res = await axios.post(`${BACKEND_URL}api/v1/fine/create`, {
        ...createFineForm,
        issuedBy,
      });

      if (res.data?.success) {
        toast.success("Institutional fine issued successfully!");
        setIsCreateFineModalOpen(false);
        setCreateFineForm({
          studentId: "",
          fineType: "Library Late Return",
          amount: "",
          reason: "",
          dueDate: "",
        });
        fetchFinesData();
      } else {
        toast.error(res.data?.message || "Failed to create fine.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error issuing fine.");
    } finally {
      setSubmittingFine(false);
    }
  };

  const handleSettleFine = async (fineId) => {
    try {
      const res = await axios.post(`${BACKEND_URL}api/v1/fine/pay/${fineId}`, {
        paymentMode: "Cash / Accounts Settlement",
      });
      if (res.data?.success) {
        toast.success("Fine marked as settled!");
        fetchFinesData();
        if (selectedStudentForHistory) {
          handleOpenStudentFeeHistory(selectedStudentForHistory);
        }
      }
    } catch (err) {
      toast.error("Error settling fine.");
    }
  };

  const handleWaiveFine = async (fineId) => {
    const reason = window.prompt("Enter reason for waiving fine:", "Administrative waiver");
    if (reason === null) return;
    try {
      const res = await axios.post(`${BACKEND_URL}api/v1/fine/waive/${fineId}`, {
        reason,
      });
      if (res.data?.success) {
        toast.success("Fine waived successfully!");
        fetchFinesData();
        if (selectedStudentForHistory) {
          handleOpenStudentFeeHistory(selectedStudentForHistory);
        }
      }
    } catch (err) {
      toast.error("Error waiving fine.");
    }
  };

  const fetchFeeData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${BACKEND_URL}api/v1/fee/all-students-status?batch=${batchFilter}&status=${statusFilter}&search=${encodeURIComponent(
          search
        )}`
      );
      if (res.data?.success) {
        setStudents(res.data.students || []);
        if (res.data.metrics) {
          setMetrics(res.data.metrics);
        }
      }
    } catch (err) {
      console.error("Error fetching fee data:", err);
      toast.error("Failed to load fee records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeeData();
    fetchFinesData();
  }, [batchFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchFeeData();
  };

  const handleSendReminder = (student) => {
    handleOpenReminderModal(student);
  };

  const fetchStudentContext = async (studentId) => {
    if (!studentId) {
      setStudentPendingFines([]);
      setStudentPaidSemesters([]);
      return;
    }
    try {
      const [finesRes, histRes] = await Promise.all([
        axios.get(`${BACKEND_URL}api/v1/fine/student/${studentId}`).catch(() => ({ data: { fines: [] } })),
        axios.get(`${BACKEND_URL}api/v1/fee/history/${studentId}`).catch(() => ({ data: { feeHistory: [] } })),
      ]);
      if (finesRes.data?.fines) {
        setStudentPendingFines(finesRes.data.fines.filter((f) => f.status === "Pending"));
      }
      if (histRes.data?.feeHistory) {
        const paidSems = histRes.data.feeHistory
          .filter((f) => f.paymentStatus === "completed")
          .map((f) => f.semester);
        setStudentPaidSemesters(paidSems);
      }
    } catch (e) {
      console.warn("Could not prefetch student fee context:", e.message);
    }
  };

  const openPaymentModal = (student, presetCategory = "semester", presetSem = null, presetFine = null) => {
    setSelectedStudent(student);
    const sId = student ? student._id : "";
    const targetCategory = presetCategory || "semester";
    const targetSem = presetSem || student?.semester || "Semester 1";
    const targetYear = student?.batch || "2024-2025";
    const targetAmount = targetCategory === "fine"
      ? (presetFine ? presetFine.amount : "")
      : (student?.feePerSemester || 45000);

    setPaymentForm({
      studentId: sId,
      paymentCategory: targetCategory,
      semester: targetSem,
      academicYear: targetYear,
      amount: targetAmount,
      fineId: presetFine?._id || "",
      fineType: presetFine?.fineType || "Library Late Return",
      isCustomFine: !presetFine && targetCategory === "fine",
      paymentMode: "Cash",
      remarks: targetCategory === "fine"
        ? (presetFine ? `Fine settlement: ${presetFine.fineType}` : "Institutional campus fine settlement")
        : `Tuition fee payment for ${targetSem} recorded at accounts desk`,
    });

    setIsPaymentModalOpen(true);
    if (sId) {
      fetchStudentContext(sId);
    } else {
      setStudentPendingFines([]);
      setStudentPaidSemesters([]);
    }
  };

  const handleStudentSelectInModal = (studentId) => {
    const s = students.find((item) => item._id === studentId);
    setSelectedStudent(s || null);

    const feeAmt = s?.feePerSemester || 45000;
    const sem = s?.semester || "Semester 1";
    const batch = s?.batch || "2024-2025";

    setPaymentForm((prev) => ({
      ...prev,
      studentId,
      amount: prev.paymentCategory === "semester" ? feeAmt : prev.amount,
      semester: sem,
      academicYear: batch,
      remarks: prev.paymentCategory === "semester"
        ? `Tuition fee payment for ${sem} recorded at accounts desk`
        : prev.remarks,
    }));

    fetchStudentContext(studentId);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!paymentForm.studentId || !paymentForm.amount || Number(paymentForm.amount) <= 0) {
      toast.error("Please enter a valid payment amount.");
      return;
    }

    setSubmittingPayment(true);
    try {
      const res = await axios.post(`${BACKEND_URL}api/v1/fee/record-payment`, paymentForm);
      if (res.data?.success) {
        toast.success(res.data.message || "Payment recorded successfully!");
        setIsPaymentModalOpen(false);
        fetchFeeData();
        fetchFinesData();

        // Immediately open authentic printable receipt
        const targetStudent = selectedStudent || students.find((s) => s._id === paymentForm.studentId);
        const receiptData = {
          ...(res.data.fee || {}),
          paymentMode: paymentForm.paymentMode,
          student: {
            name: targetStudent?.name,
            rollno: targetStudent?.rollno,
            department: targetStudent?.department,
            batch: targetStudent?.batch,
          },
          semester: paymentForm.paymentCategory === "fine"
            ? (paymentForm.fineType ? `Fine: ${paymentForm.fineType}` : "Campus Fine Settlement")
            : paymentForm.semester,
          academicYear: paymentForm.academicYear,
          amount: Number(paymentForm.amount),
          PaidAt: new Date(),
        };
        setSelectedReceiptForPrint(receiptData);
      } else {
        toast.error(res.data?.message || "Failed to record payment.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error recording payment.");
    } finally {
      setSubmittingPayment(false);
    }
  };

  return (
    <Container>
      <Header>
        <div className="title-area">
          <h1>Accounts & Fee Management</h1>
          <p>Supervise student tuition payments, issue gentle fee reminders, and record offline settlements.</p>
        </div>
        <div className="action-area">
          <PrimaryButton onClick={() => openPaymentModal(null)}>
            <span>+</span> Record Offline Payment
          </PrimaryButton>
        </div>
      </Header>

      {/* NAVIGATION TABS */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "22px", borderBottom: "2px solid #e2e8f0", paddingBottom: "10px" }}>
        <button
          type="button"
          onClick={() => setActiveTab("tuition")}
          style={{
            background: activeTab === "tuition" ? "#0f766e" : "#f1f5f9",
            color: activeTab === "tuition" ? "#ffffff" : "#475569",
            fontWeight: 700,
            fontSize: "14px",
            padding: "9px 20px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          🎓 Tuition & Semester Accounts ({students.length})
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab("fines");
            fetchFinesData();
          }}
          style={{
            background: activeTab === "fines" ? "#0f766e" : "#f1f5f9",
            color: activeTab === "fines" ? "#ffffff" : "#475569",
            fontWeight: 700,
            fontSize: "14px",
            padding: "9px 20px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          ⚖️ Institutional Fines & Penalties ({finesList.length})
        </button>
      </div>

      {activeTab === "tuition" ? (
        <>
          {/* KPI METRICS */}
          <MetricsGrid>
            <MetricCard $borderColor="#10b981">
              <div className="title">Total Collections</div>
              <div className="value">₹{metrics.totalCollected.toLocaleString()}</div>
              <div className="subtitle">{metrics.paidCount} fully paid accounts</div>
            </MetricCard>

            <MetricCard $borderColor="#f59e0b">
              <div className="title">Outstanding Dues</div>
              <div className="value">₹{metrics.totalPending.toLocaleString()}</div>
              <div className="subtitle">{metrics.pendingCount + metrics.partialCount} pending/partial balances</div>
            </MetricCard>

            <MetricCard $borderColor="#3b82f6">
              <div className="title">Enrolled Students</div>
              <div className="value">{metrics.totalStudents}</div>
              <div className="subtitle">Under accounts management</div>
            </MetricCard>

            <MetricCard $borderColor="#ef4444">
              <div className="title">Fee Defaulters</div>
              <div className="value">{metrics.pendingCount}</div>
              <div className="subtitle">Zero payments recorded</div>
            </MetricCard>
          </MetricsGrid>

          {/* FILTER CONTROLS */}
          <FilterBar>
            <div className="left-filters">
              <form onSubmit={handleSearchSubmit} style={{ display: "inline-block" }}>
                <input
                  type="text"
                  placeholder="🔍 Search student by name, roll no, email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </form>

              <select value={batchFilter} onChange={(e) => { setBatchFilter(e.target.value); setCurrentPage(1); }}>
                <option value="all">All Batches</option>
                <option value="Batch 2024">Batch 2024</option>
                <option value="Batch 2025">Batch 2025</option>
                <option value="Batch 2023">Batch 2023</option>
                <option value="Batch 2022">Batch 2022</option>
              </select>

              <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}>
                <option value="all">All Fee Statuses</option>
                <option value="Paid">Fully Paid</option>
                <option value="Partial">Partially Paid</option>
                <option value="Pending">Payment Pending</option>
              </select>

              {/* Slicing / Page Size Selector */}
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(e.target.value === "all" ? "all" : parseInt(e.target.value, 10));
                  setCurrentPage(1);
                }}
                style={{ minWidth: "120px" }}
              >
                <option value={10}>Show 10</option>
                <option value={25}>Show 25</option>
                <option value={50}>Show 50</option>
                <option value="all">Show All</option>
              </select>
            </div>

            <ActionBtn onClick={fetchFeeData} $bg="#f8fafc" $borderColor="#cbd5e1">
              🔄 Refresh
            </ActionBtn>
          </FilterBar>

          {/* STUDENTS FEE TABLE */}
          <TableCard>
            <Table>
              <thead>
                <tr>
                  <th>Student Details</th>
                  <th>Batch / Dept</th>
                  <th>Program Fee</th>
                  <th>Amount Paid</th>
                  <th>Balance Due</th>
                  <th>Fee Status</th>
                  <th>Cleared Terms</th>
                  <th>Accounts Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                      Loading fee records...
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                      No students found matching current filters.
                    </td>
                  </tr>
                ) : (
                  (pageSize === "all"
                    ? students
                    : students.slice((currentPage - 1) * pageSize, currentPage * pageSize)
                  ).map((student) => (
                    <tr key={student._id}>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleOpenStudentFeeHistory(student)}
                          style={{
                            background: "none",
                            border: "none",
                            padding: 0,
                            fontSize: "14px",
                            fontWeight: 700,
                            color: "#0f766e",
                            cursor: "pointer",
                            textAlign: "left",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                          title="Click to view complete fee history and previous receipts"
                        >
                          <span style={{ textDecoration: "underline" }}>{student.name}</span>
                          <span style={{ fontSize: "11px", background: "#ccfbf1", color: "#0f766e", padding: "1px 6px", borderRadius: "10px", fontWeight: 700 }}>
                            Ledger 📄
                          </span>
                        </button>
                        <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                          {student.rollno} • {student.email}
                        </div>
                      </td>
                      <td>
                        <div>{student.batch}</div>
                        <div style={{ fontSize: "12px", color: "#64748b" }}>
                          {student.department} ({student.semester})
                        </div>
                      </td>
                      <td>₹{student.totalFee.toLocaleString()}</td>
                      <td style={{ color: "#166534", fontWeight: 600 }}>
                        ₹{student.totalPaid.toLocaleString()}
                      </td>
                      <td
                        style={{
                          color: student.balance > 0 ? "#991b1b" : "#166534",
                          fontWeight: 600,
                        }}
                      >
                        ₹{student.balance.toLocaleString()}
                      </td>
                      <td>
                        <StatusBadge $status={student.feeStatus}>{student.feeStatus}</StatusBadge>
                      </td>
                      <td style={{ fontSize: "12px", color: "#475569" }}>
                        {student.balance === 0 ? (
                          <span style={{ color: "#10b981", fontWeight: 700 }}>✓ All 8 Semesters</span>
                        ) : student.semestersPaidCount > 0 ? (
                          <span>{student.semestersPaidCount} / {student.totalSemesters || 8} Semesters</span>
                        ) : (
                          <span style={{ color: "#ef4444", fontWeight: 600 }}>0 / {student.totalSemesters || 8} (Pending)</span>
                        )}
                      </td>
                      <td>
                        {student.balance > 0 ? (
                          <>
                            <ActionBtn
                              $bg={remindedStudents[student._id] ? "#f1f5f9" : "#eff6ff"}
                              $color={remindedStudents[student._id] ? "#64748b" : "#1d4ed8"}
                              $borderColor={remindedStudents[student._id] ? "#cbd5e1" : "#bfdbfe"}
                              onClick={() => handleSendReminder(student)}
                              disabled={remindedStudents[student._id]}
                            >
                              {remindedStudents[student._id] ? "✓ Reminder Sent" : "🔔 Send Reminder"}
                            </ActionBtn>
                            <ActionBtn
                              $bg="#ecfdf5"
                              $color="#047857"
                              $borderColor="#a7f3d0"
                              onClick={() => openPaymentModal(student)}
                            >
                              💵 Record Payment
                            </ActionBtn>
                          </>
                        ) : (
                          <span style={{ fontSize: "12px", color: "#10b981", fontWeight: 600 }}>
                            ✓ Cleared
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>

            {/* Pagination Controls */}
            {pageSize !== "all" && students.length > pageSize && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "16px 20px",
                  borderTop: "1px solid #e2e8f0",
                  flexWrap: "wrap",
                  gap: "10px",
                }}
              >
                <div style={{ fontSize: "13px", color: "#64748b" }}>
                  Showing {(currentPage - 1) * pageSize + 1} to{" "}
                  {Math.min(currentPage * pageSize, students.length)} of {students.length} students
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <ActionBtn
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    $bg={currentPage === 1 ? "#f1f5f9" : "#ffffff"}
                    $color={currentPage === 1 ? "#94a3b8" : "#1e293b"}
                  >
                    ← Previous
                  </ActionBtn>
                  <span style={{ fontSize: "13px", fontWeight: 700, padding: "8px 12px", color: "#0f766e" }}>
                    Page {currentPage} of {Math.ceil(students.length / pageSize) || 1}
                  </span>
                  <ActionBtn
                    onClick={() =>
                      setCurrentPage((p) =>
                        Math.min(Math.ceil(students.length / pageSize) || 1, p + 1)
                      )
                    }
                    disabled={currentPage >= Math.ceil(students.length / pageSize)}
                    $bg={currentPage >= Math.ceil(students.length / pageSize) ? "#f1f5f9" : "#ffffff"}
                    $color={currentPage >= Math.ceil(students.length / pageSize) ? "#94a3b8" : "#1e293b"}
                  >
                    Next →
                  </ActionBtn>
                </div>
              </div>
            )}
          </TableCard>
        </>
      ) : (
        /* INSTITUTIONAL FINES TAB */
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#1e293b", margin: "0 0 4px 0" }}>
                Campus Fines & Miscellaneous Levies
              </h2>
              <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
                Track and levy library overdues, sports equipment damages, lab property violations, and disciplinary penalties.
              </p>
            </div>
            <PrimaryButton onClick={() => setIsCreateFineModalOpen(true)}>
              <span>⚡</span> Issue New Fine / Penalty
            </PrimaryButton>
          </div>

          <MetricsGrid>
            <MetricCard $borderColor="#ef4444">
              <div className="title">Total Fines Levied</div>
              <div className="value">
                ₹{finesList.reduce((acc, f) => acc + (f.amount || 0), 0).toLocaleString()}
              </div>
              <div className="subtitle">{finesList.length} total fines issued</div>
            </MetricCard>

            <MetricCard $borderColor="#10b981">
              <div className="title">Collected Fines</div>
              <div className="value">
                ₹{finesList.filter((f) => f.status === "Paid").reduce((acc, f) => acc + (f.amount || 0), 0).toLocaleString()}
              </div>
              <div className="subtitle">{finesList.filter((f) => f.status === "Paid").length} settled fines</div>
            </MetricCard>

            <MetricCard $borderColor="#f59e0b">
              <div className="title">Outstanding Fine Dues</div>
              <div className="value">
                ₹{finesList.filter((f) => f.status === "Pending").reduce((acc, f) => acc + (f.amount || 0), 0).toLocaleString()}
              </div>
              <div className="subtitle">{finesList.filter((f) => f.status === "Pending").length} pending payments</div>
            </MetricCard>
          </MetricsGrid>

          <TableCard>
            <Table>
              <thead>
                <tr>
                  <th>Student Details</th>
                  <th>Fine Category</th>
                  <th>Amount</th>
                  <th>Reason / Details</th>
                  <th>Issued Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {finesLoading ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                      Loading campus fines...
                    </td>
                  </tr>
                ) : finesList.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                      No institutional fines recorded on campus.
                    </td>
                  </tr>
                ) : (
                  finesList.map((fine) => (
                    <tr key={fine._id}>
                      <td>
                        <div style={{ fontWeight: 700, color: "#1e293b" }}>
                          {fine.student?.name || "Student"}
                        </div>
                        <div style={{ fontSize: "12px", color: "#64748b" }}>
                          {fine.student?.rollno} • {fine.student?.department}
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            background: "#fef3c7",
                            color: "#b45309",
                            padding: "3px 8px",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: 700,
                          }}
                        >
                          {fine.fineType}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700, color: "#dc2626" }}>
                        ₹{Number(fine.amount).toLocaleString()}
                      </td>
                      <td style={{ fontSize: "13px", color: "#475569", maxWidth: "220px" }}>
                        {fine.reason}
                      </td>
                      <td style={{ fontSize: "12px", color: "#64748b" }}>
                        {formatDateDDMMYYYY(fine.createdAt)}
                      </td>
                      <td style={{ fontSize: "12px", color: "#64748b" }}>
                        {fine.dueDate ? formatDateDDMMYYYY(fine.dueDate) : "Immediate"}
                      </td>
                      <td>
                        <StatusBadge $status={fine.status}>{fine.status}</StatusBadge>
                      </td>
                      <td>
                        {fine.status === "Pending" ? (
                          <div style={{ display: "flex", gap: "6px" }}>
                            <ActionBtn
                              $bg="#ecfdf5"
                              $color="#047857"
                              $borderColor="#a7f3d0"
                              onClick={() => openPaymentModal(fine.student, "fine", null, fine)}
                            >
                              💵 Record Settlement
                            </ActionBtn>
                            <ActionBtn
                              $bg="#f1f5f9"
                              $color="#475569"
                              $borderColor="#cbd5e1"
                              onClick={() => handleWaiveFine(fine._id)}
                            >
                              Waive
                            </ActionBtn>
                          </div>
                        ) : (
                          <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
                            {fine.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </TableCard>
        </>
      )}

      {/* STUDENT FEE HISTORY / LEDGER MODAL (Does NOT close on backdrop click) */}
      {selectedStudentForHistory && (
        <ModalBackdrop>
          <LargeModalContent>
            <button
              className="close-icon"
              onClick={() => {
                setSelectedStudentForHistory(null);
                setFeeHistoryData(null);
              }}
            >
              ✕
            </button>
            <div style={{ marginBottom: "18px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", margin: "0 0 4px 0" }}>
                📜 Student Fee Ledger & Payment Records
              </h2>
              <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
                Comprehensive financial audit trail and past tuition receipts for {selectedStudentForHistory.name}.
              </p>
            </div>

            {/* Student Profile Overview */}
            <StudentInfoBanner>
              <div className="info-block">
                <div className="label">Student Name & Roll</div>
                <div className="val">{selectedStudentForHistory.name} ({selectedStudentForHistory.rollno})</div>
              </div>
              <div className="info-block">
                <div className="label">Degree & Program</div>
                <div className="val">
                  {feeHistoryData?.student?.degree || selectedStudentForHistory.degree || "B.Tech"} - {feeHistoryData?.student?.specialization || selectedStudentForHistory.specialization || "Core"}
                </div>
              </div>
              <div className="info-block">
                <div className="label">Department & Batch</div>
                <div className="val">
                  {selectedStudentForHistory.department} • {selectedStudentForHistory.batch}
                </div>
              </div>
              <div className="info-block">
                <div className="label">Contact Email</div>
                <div className="val">{selectedStudentForHistory.email}</div>
              </div>
            </StudentInfoBanner>

            {feeHistoryLoading ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                Loading financial records...
              </div>
            ) : (
              <>
                {/* Financial Ledger Metric Cards */}
                <LedgerSummaryGrid>
                  <LedgerCard>
                    <div className="lbl">Term Fee Rate</div>
                    <div className="val">
                      ₹{(feeHistoryData?.feePerSemester || selectedStudentForHistory.totalFee).toLocaleString()}
                    </div>
                    <div className="sub">Per semester rate</div>
                  </LedgerCard>
                  <LedgerCard>
                    <div className="lbl">Total Program Fee</div>
                    <div className="val" style={{ color: "#3b82f6" }}>
                      ₹{(feeHistoryData?.totalProgramFee || selectedStudentForHistory.totalFee * 8).toLocaleString()}
                    </div>
                    <div className="sub">Full program tuition</div>
                  </LedgerCard>
                  <LedgerCard>
                    <div className="lbl">Total Paid to Date</div>
                    <div className="val" style={{ color: "#059669" }}>
                      ₹{(feeHistoryData?.totalPaid ?? selectedStudentForHistory.totalPaid).toLocaleString()}
                    </div>
                    <div className="sub">Verified settlements</div>
                  </LedgerCard>
                  {(() => {
                    const outstanding = feeHistoryData?.balance !== undefined 
                      ? feeHistoryData.balance 
                      : (feeHistoryData?.totalProgramFee ? Math.max(0, feeHistoryData.totalProgramFee - (feeHistoryData.totalPaid || 0)) : selectedStudentForHistory.balance);
                    const semPaid = feeHistoryData?.semestersPaidCount ?? (feeHistoryData?.feeHistory?.filter(f => f.paymentStatus === "completed").length || 0);
                    const totalSems = feeHistoryData?.totalSemesters || 8;
                    return (
                      <>
                        <LedgerCard>
                          <div className="lbl">Outstanding Balance</div>
                          <div className="val" style={{ color: outstanding > 0 ? "#dc2626" : "#059669" }}>
                            ₹{outstanding.toLocaleString()}
                          </div>
                          <div className="sub">{outstanding > 0 ? "Pending collection" : "Zero dues"}</div>
                        </LedgerCard>
                        <LedgerCard>
                          <div className="lbl">Semesters Cleared</div>
                          <div className="val" style={{ color: semPaid >= totalSems ? "#059669" : "#0284c7" }}>
                            {semPaid} / {totalSems} Semesters
                          </div>
                          <div className="sub">{semPaid >= totalSems ? "Fully cleared" : `${totalSems - semPaid} Semesters pending`}</div>
                        </LedgerCard>
                      </>
                    );
                  })()}
                </LedgerSummaryGrid>

                {/* History Table */}
                <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#1e293b", marginBottom: "12px" }}>
                  Previous Payment Transactions & Invoices ({(feeHistoryData?.feeHistory || []).length})
                </h3>

                {(feeHistoryData?.feeHistory || []).length === 0 ? (
                  <div
                    style={{
                      background: "#fffbeb",
                      border: "1px solid #fef3c7",
                      borderRadius: "8px",
                      padding: "20px",
                      textAlign: "center",
                      color: "#b45309",
                      fontSize: "14px",
                    }}
                  >
                    ⚠️ No previous payments have been recorded for this student yet. Pending due is ₹{(feeHistoryData?.balance || selectedStudentForHistory.balance).toLocaleString()}.
                  </div>
                ) : (
                  <div style={{ overflowX: "auto", border: "1px solid #e2e8f0", borderRadius: "10px" }}>
                    <Table>
                      <thead>
                        <tr>
                          <th>Transaction / Reference</th>
                          <th>Academic Term</th>
                          <th>Amount Paid</th>
                          <th>Payment Mode</th>
                          <th>Date & Time</th>
                          <th>Status</th>
                          <th>Receipt</th>
                        </tr>
                      </thead>
                      <tbody>
                        {feeHistoryData.feeHistory.map((fee) => (
                          <tr key={fee._id}>
                            <td style={{ fontFamily: "monospace", fontWeight: 700, color: "#0f766e" }}>
                              {fee.paymentId || fee._id}
                            </td>
                            <td>
                              <div>{fee.semester || "Semester 1"}</div>
                              <div style={{ fontSize: "11px", color: "#64748b" }}>{fee.academicYear || "2024-2025"}</div>
                            </td>
                            <td style={{ fontWeight: 700, color: "#15803d" }}>
                              ₹{Number(fee.amount).toLocaleString()}
                            </td>
                            <td>{fee.paymentMode || "Online Gateway"}</td>
                            <td style={{ fontSize: "12px", color: "#64748b" }}>
                              {new Date(fee.PaidAt || fee.createdAt).toLocaleString()}
                            </td>
                            <td>
                              <StatusBadge $status={fee.paymentStatus === "completed" ? "Paid" : "Pending"}>
                                {fee.paymentStatus || "completed"}
                              </StatusBadge>
                            </td>
                            <td>
                              <ActionBtn
                                onClick={() =>
                                  setSelectedReceiptForPrint({
                                    ...fee,
                                    student: selectedStudentForHistory,
                                  })
                                }
                                $bg="#ecfdf5"
                                $color="#047857"
                                $borderColor="#a7f3d0"
                              >
                                🧾 Receipt
                              </ActionBtn>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}

                {/* Institutional Fines & Penalties */}
                <div style={{ marginTop: "24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#1e293b", margin: 0 }}>
                      ⚖️ Institutional Fines & Other Campus Dues ({(feeHistoryData?.studentFines || []).length})
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setCreateFineForm({
                          studentId: selectedStudentForHistory._id,
                          fineType: "Library Late Return",
                          amount: "",
                          reason: "",
                          dueDate: "",
                        });
                        setIsCreateFineModalOpen(true);
                      }}
                      style={{
                        background: "#f1f5f9",
                        color: "#0f766e",
                        border: "1px solid #cbd5e1",
                        borderRadius: "6px",
                        padding: "5px 12px",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      + Issue Fine to this Student
                    </button>
                  </div>

                  {(feeHistoryData?.studentFines || []).length === 0 ? (
                    <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "14px", color: "#166534", fontSize: "13px" }}>
                      ✓ No library, sports, property damage, or disciplinary fines on record for this student.
                    </div>
                  ) : (
                    <div style={{ overflowX: "auto", border: "1px solid #e2e8f0", borderRadius: "10px" }}>
                      <Table>
                        <thead>
                          <tr>
                            <th>Fine Type</th>
                            <th>Amount</th>
                            <th>Reason / Violation</th>
                            <th>Date Levied</th>
                            <th>Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {feeHistoryData.studentFines.map((fine) => (
                            <tr key={fine._id}>
                              <td style={{ fontWeight: 600 }}>{fine.fineType}</td>
                              <td style={{ fontWeight: 700, color: "#dc2626" }}>₹{Number(fine.amount).toLocaleString()}</td>
                              <td style={{ fontSize: "13px", color: "#475569" }}>{fine.reason}</td>
                              <td style={{ fontSize: "12px", color: "#64748b" }}>{formatDateDDMMYYYY(fine.createdAt)}</td>
                              <td><StatusBadge $status={fine.status}>{fine.status}</StatusBadge></td>
                              <td>
                                {fine.status === "Pending" ? (
                                  <div style={{ display: "flex", gap: "6px" }}>
                                    <ActionBtn
                                      $bg="#ecfdf5"
                                      $color="#047857"
                                      $borderColor="#a7f3d0"
                                      onClick={() => openPaymentModal(selectedStudentForHistory, "fine", null, fine)}
                                    >
                                      💵 Settle Fine
                                    </ActionBtn>
                                    <ActionBtn
                                      $bg="#f1f5f9"
                                      $color="#475569"
                                      $borderColor="#cbd5e1"
                                      onClick={() => handleWaiveFine(fine._id)}
                                    >
                                      Waive
                                    </ActionBtn>
                                  </div>
                                ) : (
                                  <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>{fine.status}</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "24px" }}>
                  <ActionBtn
                    onClick={() => {
                      setSelectedStudentForHistory(null);
                      setFeeHistoryData(null);
                    }}
                    $bg="#f1f5f9"
                    $color="#475569"
                  >
                    Close Ledger
                  </ActionBtn>

                  <PrimaryButton
                    onClick={() => {
                      const studentToPay = selectedStudentForHistory;
                      setSelectedStudentForHistory(null);
                      openPaymentModal(studentToPay);
                    }}
                  >
                    💵 Record New Payment for Student
                  </PrimaryButton>
                </div>
              </>
            )}
          </LargeModalContent>
        </ModalBackdrop>
      )}

      {/* PRINTABLE RECEIPT MODAL */}
      {selectedReceiptForPrint && (
        <ModalBackdrop>
          <ReceiptModalContent>
            <button
              className="close-icon"
              onClick={() => setSelectedReceiptForPrint(null)}
            >
              ✕
            </button>
            <div className="receipt-header">
              <h3>CAMPUS-SYNC UNIVERSITY</h3>
              <p>Official Fee Payment Acknowledgment & Receipt</p>
              <div style={{ fontSize: "11px", color: "#0f766e", fontWeight: 700, marginTop: "4px" }}>
                Verified Official Digital Transaction
              </div>
            </div>

            <div className="receipt-row">
              <span className="key">Receipt / Txn Ref:</span>
              <span className="val" style={{ fontFamily: "monospace" }}>{selectedReceiptForPrint.paymentId || selectedReceiptForPrint._id}</span>
            </div>
            <div className="receipt-row">
              <span className="key">Payment Date:</span>
              <span className="val">{new Date(selectedReceiptForPrint.PaidAt || selectedReceiptForPrint.createdAt).toLocaleString()}</span>
            </div>
            <div className="receipt-row">
              <span className="key">Student Name:</span>
              <span className="val">{selectedReceiptForPrint.student?.name}</span>
            </div>
            <div className="receipt-row">
              <span className="key">Roll Number:</span>
              <span className="val">{selectedReceiptForPrint.student?.rollno}</span>
            </div>
            <div className="receipt-row">
              <span className="key">Department / Branch:</span>
              <span className="val">{selectedReceiptForPrint.student?.department}</span>
            </div>
            <div className="receipt-row">
              <span className="key">Batch / Academic Year:</span>
              <span className="val">{selectedReceiptForPrint.academicYear || selectedReceiptForPrint.student?.batch}</span>
            </div>
            <div className="receipt-row">
              <span className="key">Semester:</span>
              <span className="val">{selectedReceiptForPrint.semester || "Semester 1"}</span>
            </div>
            <div className="receipt-row">
              <span className="key">Payment Mode:</span>
              <span className="val">{selectedReceiptForPrint.paymentMode || "Online Gateway"}</span>
            </div>
            <div className="receipt-row">
              <span className="key">Payment Status:</span>
              <span className="val" style={{ color: "#166534", fontWeight: 700 }}>VERIFIED & SETTLED ✓</span>
            </div>

            <div className="receipt-total">
              <span>Amount Paid:</span>
              <span>₹{Number(selectedReceiptForPrint.amount).toLocaleString()}</span>
            </div>

            <div style={{ marginTop: "24px", display: "flex", justifyContent: "space-between", gap: "10px" }}>
              <ActionBtn
                onClick={() => setSelectedReceiptForPrint(null)}
                $bg="#f1f5f9"
                $color="#475569"
                style={{ flex: 1, justifyContent: "center" }}
              >
                Close
              </ActionBtn>
              <PrimaryButton
                onClick={() => window.print()}
                style={{ flex: 1, justifyContent: "center" }}
              >
                🖨️ Print Receipt
              </PrimaryButton>
            </div>
          </ReceiptModalContent>
        </ModalBackdrop>
      )}

      {/* RECORD PAYMENT MODAL (Does NOT close on backdrop click) */}
      {isPaymentModalOpen && (
        <ModalBackdrop>
          <ModalContent style={{ maxWidth: "600px", maxHeight: "90vh", overflowY: "auto" }}>
            <button className="close-icon" onClick={() => setIsPaymentModalOpen(false)}>
              ✕
            </button>
            <h2>Record Fee Payment & Settlement</h2>
            <p>
              Record student fee deposit, tuition semester installment, or campus fine settlement.
            </p>

            <form onSubmit={handlePaymentSubmit}>
              {/* Selected Student Banner or Dropdown */}
              {selectedStudent ? (
                <div
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "10px",
                    padding: "12px 16px",
                    marginBottom: "16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800, color: "#0f172a", fontSize: "15px" }}>
                      {selectedStudent.name}{" "}
                      <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
                        ({selectedStudent.rollno})
                      </span>
                    </div>
                    <div style={{ fontSize: "12px", color: "#475569", marginTop: "3px" }}>
                      {selectedStudent.degree || "B.Tech"} • {selectedStudent.department} • {selectedStudent.batch}
                    </div>
                    <div style={{ fontSize: "12px", color: "#059669", fontWeight: 700, marginTop: "2px" }}>
                      Rate: ₹{(selectedStudent.feePerSemester || 45000).toLocaleString()}/semester • Balance: ₹{(selectedStudent.balance || 0).toLocaleString()}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStudent(null);
                      setPaymentForm({ ...paymentForm, studentId: "" });
                      setStudentPendingFines([]);
                      setStudentPaidSemesters([]);
                    }}
                    style={{
                      background: "#e2e8f0",
                      border: "none",
                      borderRadius: "6px",
                      padding: "6px 12px",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#334155",
                      cursor: "pointer",
                    }}
                  >
                    Change Student
                  </button>
                </div>
              ) : (
                <div className="form-group">
                  <label>Select Student</label>
                  <select
                    value={paymentForm.studentId}
                    onChange={(e) => handleStudentSelectInModal(e.target.value)}
                    required
                  >
                    <option value="">-- Choose Student to Record Payment --</option>
                    {students.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name} ({s.rollno}) — {s.department} • Balance: ₹{s.balance.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Payment Purpose / Category Selector */}
              <div style={{ marginBottom: "18px" }}>
                <label
                  style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    color: "#334155",
                    display: "block",
                    marginBottom: "8px",
                  }}
                >
                  What is this payment for? (Payment Purpose)
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <button
                    type="button"
                    style={{
                      padding: "12px 14px",
                      borderRadius: "10px",
                      border:
                        paymentForm.paymentCategory === "semester"
                          ? "2px solid #2563eb"
                          : "1px solid #cbd5e1",
                      background:
                        paymentForm.paymentCategory === "semester" ? "#eff6ff" : "#ffffff",
                      color:
                        paymentForm.paymentCategory === "semester" ? "#1d4ed8" : "#475569",
                      fontWeight: "700",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      fontSize: "13px",
                      transition: "all 0.15s ease",
                    }}
                    onClick={() => {
                      const feeAmt = selectedStudent?.feePerSemester || 45000;
                      setPaymentForm({
                        ...paymentForm,
                        paymentCategory: "semester",
                        amount: feeAmt,
                        remarks: `Tuition fee payment for ${paymentForm.semester} recorded at accounts desk`,
                      });
                    }}
                  >
                    🎓 Semester Tuition Fee
                  </button>
                  <button
                    type="button"
                    style={{
                      padding: "12px 14px",
                      borderRadius: "10px",
                      border:
                        paymentForm.paymentCategory === "fine"
                          ? "2px solid #d97706"
                          : "1px solid #cbd5e1",
                      background:
                        paymentForm.paymentCategory === "fine" ? "#fffbeb" : "#ffffff",
                      color:
                        paymentForm.paymentCategory === "fine" ? "#b45309" : "#475569",
                      fontWeight: "700",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      fontSize: "13px",
                      transition: "all 0.15s ease",
                    }}
                    onClick={() => {
                      const firstFine = studentPendingFines[0];
                      setPaymentForm({
                        ...paymentForm,
                        paymentCategory: "fine",
                        fineId: firstFine?._id || "",
                        fineType: firstFine?.fineType || "Library Late Return",
                        amount: firstFine ? firstFine.amount : "",
                        isCustomFine: !firstFine,
                        remarks: firstFine
                          ? `Fine settlement: ${firstFine.fineType} (${firstFine.reason || "due"})`
                          : "Institutional campus fine settlement",
                      });
                    }}
                  >
                    ⚖️ Institutional Fine / Penalty
                    {studentPendingFines.length > 0 && (
                      <span
                        style={{
                          background: "#dc2626",
                          color: "#ffffff",
                          padding: "1px 6px",
                          borderRadius: "10px",
                          fontSize: "11px",
                        }}
                      >
                        {studentPendingFines.length}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* 1. SEMESTER TUITION FEE FIELDS */}
              {paymentForm.paymentCategory === "semester" && (
                <div
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "10px",
                    padding: "14px",
                    marginBottom: "16px",
                  }}
                >
                  <div className="form-group" style={{ marginBottom: "12px" }}>
                    <label>Which Semester are you recording payment for?</label>
                    <select
                      value={paymentForm.semester}
                      onChange={(e) => {
                        const semVal = e.target.value;
                        setPaymentForm({
                          ...paymentForm,
                          semester: semVal,
                          remarks: `Tuition fee payment for ${semVal} recorded at accounts desk`,
                        });
                      }}
                      required
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => {
                        const sTitle = `Semester ${num}`;
                        const isPaid = studentPaidSemesters.some((ps) => {
                          const cleanPs = (ps || "").toLowerCase().replace(/[^a-z0-9]/g, "");
                          return cleanPs === `semester${num}`;
                        });
                        return (
                          <option key={num} value={sTitle}>
                            {sTitle} {isPaid ? "✓ (Cleared in records)" : "(Pending Tuition)"}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Academic Year / Batch Cycle</label>
                    <input
                      type="text"
                      value={paymentForm.academicYear}
                      onChange={(e) =>
                        setPaymentForm({ ...paymentForm, academicYear: e.target.value })
                      }
                      placeholder="e.g. 2024-2025"
                      required
                    />
                  </div>
                </div>
              )}

              {/* 2. INSTITUTIONAL FINE / PENALTY FIELDS */}
              {paymentForm.paymentCategory === "fine" && (
                <div
                  style={{
                    background: "#fffbeb",
                    border: "1px solid #fef3c7",
                    borderRadius: "10px",
                    padding: "14px",
                    marginBottom: "16px",
                  }}
                >
                  <label
                    style={{
                      fontSize: "12px",
                      fontWeight: "700",
                      color: "#92400e",
                      display: "block",
                      marginBottom: "8px",
                    }}
                  >
                    Which fine or penalty are you settling?
                  </label>

                  {studentPendingFines.length > 0 ? (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                        marginBottom: "12px",
                      }}
                    >
                      {studentPendingFines.map((f) => {
                        const isSelected =
                          paymentForm.fineId === f._id && !paymentForm.isCustomFine;
                        return (
                          <label
                            key={f._id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                              padding: "10px 14px",
                              borderRadius: "8px",
                              border: isSelected ? "2px solid #d97706" : "1px solid #fed7aa",
                              background: isSelected ? "#fef3c7" : "#ffffff",
                              cursor: "pointer",
                              fontSize: "13px",
                            }}
                          >
                            <input
                              type="radio"
                              name="fineSelection"
                              checked={isSelected}
                              onChange={() =>
                                setPaymentForm({
                                  ...paymentForm,
                                  fineId: f._id,
                                  fineType: f.fineType,
                                  amount: f.amount,
                                  isCustomFine: false,
                                  remarks: `Settlement for fine: ${f.fineType} (${f.reason || "due"})`,
                                })
                              }
                            />
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: "700", color: "#78350f" }}>
                                {f.fineType} — ₹{Number(f.amount).toLocaleString()}
                              </div>
                              <div style={{ fontSize: "11px", color: "#92400e" }}>
                                {f.reason || "Campus fine"} • Due:{" "}
                                {f.dueDate
                                  ? formatDateDDMMYYYY(f.dueDate)
                                  : "Immediate"}
                              </div>
                            </div>
                          </label>
                        );
                      })}

                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          padding: "10px 14px",
                          borderRadius: "8px",
                          border: paymentForm.isCustomFine
                            ? "2px solid #2563eb"
                            : "1px solid #cbd5e1",
                          background: paymentForm.isCustomFine ? "#eff6ff" : "#ffffff",
                          cursor: "pointer",
                          fontSize: "13px",
                        }}
                      >
                        <input
                          type="radio"
                          name="fineSelection"
                          checked={paymentForm.isCustomFine}
                          onChange={() =>
                            setPaymentForm({
                              ...paymentForm,
                              fineId: "",
                              isCustomFine: true,
                              amount: "",
                              remarks: "Direct institutional fine settlement",
                            })
                          }
                        />
                        <span style={{ fontWeight: "600", color: "#1e293b" }}>
                          ✍️ Other / New Unlisted Fine Penalty
                        </span>
                      </label>
                    </div>
                  ) : (
                    <div
                      style={{
                        background: "#ffffff",
                        border: "1px solid #fde68a",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        fontSize: "12px",
                        color: "#92400e",
                        marginBottom: "12px",
                      }}
                    >
                      ℹ️ Student currently has 0 pending recorded fines. Record a manual campus fine settlement below:
                    </div>
                  )}

                  {(paymentForm.isCustomFine || studentPendingFines.length === 0) && (
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Fine Classification</label>
                      <select
                        value={paymentForm.fineType}
                        onChange={(e) =>
                          setPaymentForm({
                            ...paymentForm,
                            fineType: e.target.value,
                            remarks: `Settlement for fine: ${e.target.value}`,
                          })
                        }
                      >
                        <option value="Library Late Return">📚 Library Late Return</option>
                        <option value="Lab Equipment Damage">🔬 Lab Equipment Damage / Breakage</option>
                        <option value="Sports Equipment Penalty">🏏 Sports Equipment Damage / Loss</option>
                        <option value="Hostel Maintenance & Mess Due">🏢 Hostel Maintenance & Mess Due</option>
                        <option value="ID Card / Certificate Re-issue">🪪 ID Card / Certificate Re-issue Fee</option>
                        <option value="Examination Resit Fine">📝 Examination Resit / Late Form Fine</option>
                        <option value="Disciplinary Fine">⚠️ Disciplinary / Conduct Fine</option>
                        <option value="Other Institutional Penalty">⚖️ Other Institutional Penalty</option>
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* Amount Received Input */}
              <div className="form-group">
                <label>Amount Received (₹)</label>
                <input
                  type="number"
                  min="1"
                  placeholder="Enter amount (e.g. 45000)"
                  value={paymentForm.amount}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, amount: e.target.value })
                  }
                  required
                />
              </div>

              {/* Payment Mode Selection */}
              <div className="form-group">
                <label>Payment Mode</label>
                <select
                  value={paymentForm.paymentMode}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, paymentMode: e.target.value })
                  }
                >
                  <option value="Cash">Cash (Receipt Issued)</option>
                  <option value="Cheque">Cheque Deposit</option>
                  <option value="Bank Transfer">NEFT / RTGS / IMPS</option>
                  <option value="UPI">UPI / QR Code Transfer</option>
                  <option value="Demand Draft">Demand Draft (DD)</option>
                </select>
              </div>

              {/* Remarks / Transaction Note */}
              <div className="form-group">
                <label>Remarks / Transaction Note</label>
                <input
                  type="text"
                  placeholder="e.g. Paid in cash at accounts counter"
                  value={paymentForm.remarks}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, remarks: e.target.value })
                  }
                />
              </div>

              <div className="modal-actions">
                <ActionBtn
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  $bg="#f1f5f9"
                  $color="#475569"
                >
                  Cancel
                </ActionBtn>
                <PrimaryButton type="submit" disabled={submittingPayment}>
                  {submittingPayment ? "Recording..." : "Confirm & Save Payment"}
                </PrimaryButton>
              </div>
            </form>
          </ModalContent>
        </ModalBackdrop>
      )}

      {/* ISSUE INSTITUTIONAL FINE MODAL (Does NOT close on backdrop click) */}
      {isCreateFineModalOpen && (
        <ModalBackdrop>
          <ModalContent>
            <button className="close-icon" onClick={() => setIsCreateFineModalOpen(false)}>
              ✕
            </button>
            <h2>Issue Institutional Fine / Penalty</h2>
            <p>Levy a campus fee for library delay, sports equipment, lab damage, or disciplinary penalty.</p>

            <form onSubmit={handleCreateFineSubmit}>
              <div className="form-group">
                <label>Select Student</label>
                <select
                  value={createFineForm.studentId}
                  onChange={(e) => setCreateFineForm({ ...createFineForm, studentId: e.target.value })}
                  required
                >
                  <option value="">-- Choose Student --</option>
                  {students.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.rollno}) - {s.department}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Fine Category</label>
                <select
                  value={createFineForm.fineType}
                  onChange={(e) => setCreateFineForm({ ...createFineForm, fineType: e.target.value })}
                >
                  <option value="Library Late Return">Library Late Return</option>
                  <option value="Book Replacement">Lost Book / Replacement</option>
                  <option value="Lab Equipment Damage">Lab Equipment Damage</option>
                  <option value="Campus Property Damage">Campus Property Damage</option>
                  <option value="Sports Equipment Fine">Sports Equipment Fine</option>
                  <option value="ID Card Reissue">ID Card Reissue Fee</option>
                  <option value="Hostel Penalty">Hostel / Hall Violation Penalty</option>
                  <option value="Disciplinary Fine">Disciplinary Fine</option>
                  <option value="Other Institutional Fine">Other Institutional Fine</option>
                </select>
              </div>

              <div className="form-group">
                <label>Fine Amount (₹)</label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 500"
                  value={createFineForm.amount}
                  onChange={(e) => setCreateFineForm({ ...createFineForm, amount: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Reason / Specific Violation Details</label>
                <input
                  type="text"
                  placeholder="e.g. Book 'Digital Design' returned 25 days overdue"
                  value={createFineForm.reason}
                  onChange={(e) => setCreateFineForm({ ...createFineForm, reason: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Settlement Due Date (Optional)</label>
                <input
                  type="date"
                  value={createFineForm.dueDate}
                  onChange={(e) => setCreateFineForm({ ...createFineForm, dueDate: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <ActionBtn
                  type="button"
                  onClick={() => setIsCreateFineModalOpen(false)}
                  $bg="#f1f5f9"
                  $color="#475569"
                >
                  Cancel
                </ActionBtn>
                <PrimaryButton type="submit" disabled={submittingFine}>
                  {submittingFine ? "Issuing..." : "Confirm & Issue Fine"}
                </PrimaryButton>
              </div>
            </form>
          </ModalContent>
        </ModalBackdrop>
      )}

      {/* REMINDER PURPOSE SELECTION MODAL (Does NOT close on backdrop click) */}
      {isReminderModalOpen && reminderTargetStudent && (
        <ModalBackdrop>
          <ModalContent>
            <button className="close-icon" onClick={() => setIsReminderModalOpen(false)}>
              ✕
            </button>
            <h2>🔔 Send Official Accounts Notice / Reminder</h2>
            <p>
              Select the specific reminder purpose, customize penalty amount and due date, and dispatch to the student's dashboard & email.
            </p>

            <div
              style={{
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: "8px",
                padding: "12px 16px",
                marginBottom: "18px",
                fontSize: "13px",
                color: "#166534",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              <div>
                <strong>Student:</strong> {reminderTargetStudent.name} ({reminderTargetStudent.rollno}) •{" "}
                <span>{reminderTargetStudent.department || "Computer Science"}</span>
              </div>
              <div>
                <strong>Total Balance:</strong> ₹{(reminderTargetStudent.balance || 0).toLocaleString()}
              </div>
            </div>

            <form onSubmit={handleSendReminderSubmit}>
              {/* Select Purpose */}
              <div className="form-group">
                <label>Reminder Purpose *</label>
                <select
                  value={reminderPurpose}
                  onChange={(e) => {
                    const newPurp = e.target.value;
                    setReminderPurpose(newPurp);
                    setReminderMessage(
                      generateReminderMessage(
                        reminderTargetStudent,
                        newPurp,
                        reminderSemester,
                        reminderAmount,
                        reminderFineType,
                        reminderDeadline
                      )
                    );
                  }}
                  required
                >
                  <option value="pending_semester">🎓 Pending Semester Tuition Fee</option>
                  <option value="late_fee">⏳ Overdue Late Fee Surcharge</option>
                  <option value="fine">⚠️ Institutional Fine / Property Penalty</option>
                  <option value="defaulter">🚨 Urgent Defaulter Warning (Exam Hold)</option>
                  <option value="custom">📝 Custom Administrative Notice</option>
                </select>
              </div>

              {/* Dynamic Inputs based on purpose */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
                {reminderPurpose === "pending_semester" && (
                  <div className="form-group">
                    <label>Semester</label>
                    <select
                      value={reminderSemester}
                      onChange={(e) => {
                        const newSem = e.target.value;
                        setReminderSemester(newSem);
                        setReminderMessage(
                          generateReminderMessage(
                            reminderTargetStudent,
                            reminderPurpose,
                            newSem,
                            reminderAmount,
                            reminderFineType,
                            reminderDeadline
                          )
                        );
                      }}
                    >
                      <option value="Semester 1">Semester 1</option>
                      <option value="Semester 2">Semester 2</option>
                      <option value="Semester 3">Semester 3</option>
                      <option value="Semester 4">Semester 4</option>
                      <option value="Semester 5">Semester 5</option>
                      <option value="Semester 6">Semester 6</option>
                      <option value="Semester 7">Semester 7</option>
                      <option value="Semester 8">Semester 8</option>
                    </select>
                  </div>
                )}

                {reminderPurpose === "fine" && (
                  <div className="form-group">
                    <label>Fine Category</label>
                    <select
                      value={reminderFineType}
                      onChange={(e) => {
                        const newFine = e.target.value;
                        setReminderFineType(newFine);
                        setReminderMessage(
                          generateReminderMessage(
                            reminderTargetStudent,
                            reminderPurpose,
                            reminderSemester,
                            reminderAmount,
                            newFine,
                            reminderDeadline
                          )
                        );
                      }}
                    >
                      <option value="Library Late Return">Library Late Return</option>
                      <option value="Book Replacement">Lost Book / Replacement</option>
                      <option value="Lab Equipment Damage">Lab Equipment Damage</option>
                      <option value="Campus Property Damage">Campus Property Damage</option>
                      <option value="Sports Equipment Fine">Sports Equipment Fine</option>
                      <option value="Disciplinary Fine">Disciplinary Fine</option>
                      <option value="ID Card Reissue">ID Card Reissue Fee</option>
                    </select>
                  </div>
                )}

                <div className="form-group">
                  <label>
                    {reminderPurpose === "late_fee"
                      ? "Late Fee Amount (₹)"
                      : reminderPurpose === "fine"
                      ? "Fine Amount (₹)"
                      : "Due Amount (₹)"}
                  </label>
                  <input
                    type="number"
                    value={reminderAmount}
                    onChange={(e) => {
                      const newAmt = e.target.value;
                      setReminderAmount(newAmt);
                      setReminderMessage(
                        generateReminderMessage(
                          reminderTargetStudent,
                          reminderPurpose,
                          reminderSemester,
                          newAmt,
                          reminderFineType,
                          reminderDeadline
                        )
                      );
                    }}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Settlement Deadline Date</label>
                  <input
                    type="date"
                    value={reminderDeadline}
                    onChange={(e) => {
                      const newDead = e.target.value;
                      setReminderDeadline(newDead);
                      setReminderMessage(
                        generateReminderMessage(
                          reminderTargetStudent,
                          reminderPurpose,
                          reminderSemester,
                          reminderAmount,
                          reminderFineType,
                          newDead
                        )
                      );
                    }}
                  />
                </div>
              </div>

              {/* Editable Message Textarea */}
              <div className="form-group">
                <label>Official Notice Message (Auto-generated & Editable)</label>
                <textarea
                  rows={4}
                  value={reminderMessage}
                  onChange={(e) => setReminderMessage(e.target.value)}
                  required
                />
              </div>

              <div className="modal-actions">
                <ActionBtn
                  type="button"
                  onClick={() => setIsReminderModalOpen(false)}
                  $bg="#f1f5f9"
                  $color="#475569"
                >
                  Cancel
                </ActionBtn>
                <PrimaryButton type="submit" disabled={submittingReminder}>
                  {submittingReminder ? "Sending..." : "🚀 Dispatch Notice to Student"}
                </PrimaryButton>
              </div>
            </form>
          </ModalContent>
        </ModalBackdrop>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </Container>
  );
};

export default AccountsFees;
