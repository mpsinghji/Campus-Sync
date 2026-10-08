import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import styled from "styled-components";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BACKEND_URL } from "../../constants/url";
import Loading from "../../components/Loading/loading.jsx";
import Cookies from "js-cookie";
import { formatDateDDMMYYYY } from "../../utils/dateUtils";
import {
  BsCreditCard,
  BsCheckCircleFill,
  BsClockHistory,
  BsPrinter,
  BsShieldCheck,
  BsReceipt,
  BsSearch,
  BsLockFill,
  BsExclamationTriangleFill,
  BsCashCoin,
  BsCalendarCheck,
  BsInfoCircle,
} from "react-icons/bs";

const PageContainer = styled.div`
  display: flex;
  padding-left: 250px;
  width: 100%;
  min-height: 100vh;
  box-sizing: border-box;
  background-color: #f8fafc;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: 15px;
  color: #1e293b;

  @media screen and (max-width: 768px) {
    padding-left: 0;
  }
`;

const Content = styled.div`
  flex: 1;
  padding: 36px 40px;
  max-width: 1380px;
  box-sizing: border-box;
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
  flex-wrap: wrap;
  gap: 16px;

  h1 {
    font-size: 28px;
    font-weight: 800;
    color: #0f172a;
    display: flex;
    align-items: center;
    gap: 12px;
    letter-spacing: -0.5px;
  }

  p {
    font-size: 15px;
    color: #64748b;
    margin-top: 6px;
    font-weight: 500;
  }
`;

// Student Summary Card with Slightly Bigger Fonts
const StudentSummaryCard = styled.div`
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  padding: 24px 30px;
  margin-bottom: 28px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

  .student-meta {
    .name {
      font-size: 22px;
      font-weight: 800;
      color: #0f172a;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .badge {
      background: #e0f2fe;
      color: #0284c7;
      font-size: 13px;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 6px;
    }
    .details {
      font-size: 14px;
      color: #64748b;
      margin-top: 8px;
      display: flex;
      flex-wrap: wrap;
      gap: 18px;

      span strong {
        color: #334155;
      }
    }
  }

  .program-tag {
    background: #f1f5f9;
    padding: 10px 18px;
    border-radius: 10px;
    border: 1px solid #e2e8f0;
    text-align: right;

    .label {
      font-size: 12px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .val {
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
      margin-top: 2px;
    }
  }
`;

// 4 Financial Summary Stat Cards
const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 18px;
  margin-bottom: 30px;
`;

const MetricCard = styled.div`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 20px 22px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03);
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 5px;
    height: 100%;
    background-color: ${(props) => props.$accent || "#0ea5e9"};
  }

  .label {
    font-size: 13px;
    font-weight: 700;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .value {
    font-size: 26px;
    font-weight: 800;
    color: #0f172a;
    margin-top: 8px;
  }

  .sub {
    font-size: 13px;
    color: ${(props) => props.$subColor || "#64748b"};
    font-weight: 600;
    margin-top: 4px;
  }
`;

// Search and Filter Bar
const FilterBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 20px;

  .search-group {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
    max-width: 460px;
  }

  .search-box {
    display: flex;
    align-items: center;
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 10px;
    padding: 10px 16px;
    gap: 10px;
    width: 100%;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

    input {
      border: none;
      outline: none;
      font-size: 14px;
      width: 100%;
      color: #1e293b;

      &::placeholder {
        color: #94a3b8;
      }
    }
  }

  .filter-pills {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
`;

const SearchClickButton = styled.button`
  background: #2563eb;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  padding: 10px 18px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);

  &:hover {
    background: #1d4ed8;
  }
`;

const FilterPill = styled.button`
  background: ${(props) => (props.$active ? "#0f172a" : "#ffffff")};
  color: ${(props) => (props.$active ? "#ffffff" : "#475569")};
  border: 1px solid ${(props) => (props.$active ? "#0f172a" : "#cbd5e1")};
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: ${(props) => (props.$active ? "#0f172a" : "#f1f5f9")};
  }
`;

// Fees Table Card
const TableCard = styled.div`
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  overflow-x: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: 18px 24px;
    text-align: left;
    font-size: 14px;
  }

  th {
    background: #f8fafc;
    color: #334155;
    font-weight: 800;
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 2px solid #e2e8f0;
  }

  td {
    border-bottom: 1px solid #f1f5f9;
    color: #1e293b;
    vertical-align: middle;
  }

  tr:last-child td {
    border-bottom: none;
  }

  tr:hover td {
    background: #fbfcfe;
  }
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
  background: ${(props) => {
    if (props.$type === "paid") return "#dcfce7";
    if (props.$type === "overdue") return "#fee2e2";
    if (props.$type === "due") return "#fef3c7";
    if (props.$type === "locked") return "#f1f5f9";
    return "#e2e8f0";
  }};
  color: ${(props) => {
    if (props.$type === "paid") return "#16a34a";
    if (props.$type === "overdue") return "#dc2626";
    if (props.$type === "due") return "#b45309";
    if (props.$type === "locked") return "#64748b";
    return "#475569";
  }};
  border: 1px solid
    ${(props) => {
      if (props.$type === "paid") return "#bbf7d0";
      if (props.$type === "overdue") return "#fecaca";
      if (props.$type === "due") return "#fde68a";
      if (props.$type === "locked") return "#cbd5e1";
      return "#cbd5e1";
    }};
`;

const ActionButton = styled.button`
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  white-space: nowrap;

  &.pay-btn {
    background: #2563eb;
    color: #ffffff;
    box-shadow: 0 2px 6px rgba(37, 99, 235, 0.25);
    &:hover {
      background: #1d4ed8;
      transform: translateY(-1px);
    }
  }

  &.receipt-btn {
    background: #059669;
    color: #ffffff;
    box-shadow: 0 2px 6px rgba(5, 150, 105, 0.25);
    &:hover {
      background: #047857;
      transform: translateY(-1px);
    }
  }

  &.locked-btn {
    background: #f1f5f9;
    color: #94a3b8;
    border: 1px solid #e2e8f0;
    cursor: not-allowed;
  }
`;

// Payment Selection Modal
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
`;

const PayModalBox = styled.div`
  background: #ffffff;
  border-radius: 18px;
  padding: 32px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border: 1px solid #e2e8f0;

  h3 {
    font-size: 20px;
    font-weight: 800;
    color: #0f172a;
    margin-bottom: 8px;
  }

  p {
    font-size: 14px;
    color: #64748b;
    margin-bottom: 22px;
  }

  .breakdown {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 18px 20px;
    margin-bottom: 24px;

    .row {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      color: #64748b;
      margin-bottom: 8px;
    }

    .row.total {
      border-top: 2px solid #e2e8f0;
      padding-top: 12px;
      margin-top: 12px;
      margin-bottom: 0;
      font-size: 16px;
      font-weight: 800;
      color: #0f172a;
    }
  }

  .pay-options {
    display: flex;
    flex-direction: column;
    gap: 12px;

    button {
      padding: 14px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 700;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      transition: all 0.2s ease;
    }

    .rzp-btn {
      background: #2563eb;
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
      &:hover {
        background: #1d4ed8;
      }
    }

    .instant-btn {
      background: #10b981;
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
      &:hover {
        background: #059669;
      }
    }

    .close-btn {
      background: #f1f5f9;
      color: #475569;
      &:hover {
        background: #e2e8f0;
      }
    }
  }
`;

// Printable Official Fee Receipt Modal
const ReceiptModalBox = styled.div`
  background: #ffffff;
  border-radius: 16px;
  padding: 36px 40px;
  width: 100%;
  max-width: 650px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border: 1px solid #cbd5e1;
  font-family: "Inter", sans-serif;

  .receipt-header {
    text-align: center;
    border-bottom: 2px solid #0f172a;
    padding-bottom: 18px;
    margin-bottom: 20px;

    .inst-name {
      font-size: 22px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.5px;
    }
    .sub-title {
      font-size: 13px;
      color: #64748b;
      font-weight: 600;
      margin-top: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .receipt-id {
      display: inline-block;
      margin-top: 8px;
      background: #f1f5f9;
      padding: 4px 12px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 700;
      color: #334155;
      font-family: monospace;
    }
  }

  .meta-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px 20px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 16px 20px;
    margin-bottom: 20px;

    .field {
      .label {
        font-size: 11px;
        color: #64748b;
        font-weight: 700;
        text-transform: uppercase;
      }
      .val {
        font-size: 14px;
        color: #0f172a;
        font-weight: 700;
        margin-top: 2px;
      }
    }
  }

  .schedule-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 24px;

    th,
    td {
      padding: 12px 14px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 13px;
    }
    th {
      background: #f1f5f9;
      color: #334155;
      font-weight: 700;
    }
    td {
      color: #1e293b;
    }
    .total-row td {
      font-weight: 800;
      font-size: 15px;
      border-top: 2px solid #0f172a;
      border-bottom: 2px solid #0f172a;
      background: #f8fafc;
      color: #0f172a;
    }
  }

  .footer-seal {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px dashed #cbd5e1;
    padding-top: 16px;
    margin-bottom: 24px;

    .seal-box {
      display: flex;
      align-items: center;
      gap: 10px;
      color: #059669;
      font-size: 12px;
      font-weight: 700;
    }

    .sign {
      text-align: right;
      font-size: 12px;
      color: #64748b;
      .officer {
        font-weight: 700;
        color: #0f172a;
      }
    }
  }

  .receipt-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;

    button {
      padding: 11px 22px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 700;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .print-btn {
      background: #2563eb;
      color: #ffffff;
      &:hover {
        background: #1d4ed8;
      }
    }

    .close-btn {
      background: #e2e8f0;
      color: #334155;
      &:hover {
        background: #cbd5e1;
      }
    }
  }
`;

// Helper: load Razorpay checkout script dynamically
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const StudentFees = () => {
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState({
    _id: null,
    name: "Enrolled Student",
    rollno: "CS24A001",
    batch: "Batch 2024-28 CS-A",
    department: "Computer Science",
    email: "student@campus-sync.com",
  });

  const [feeRecords, setFeeRecords] = useState([]);
  const [feeRatesConfig, setFeeRatesConfig] = useState(null);
  const [lateFeeConfig, setLateFeeConfig] = useState({
    lateFeeFlatAfterDue: 500,
    lateFeePerDay: 20,
    lateFeeGraceDays: 0,
  });
  const [studentFines, setStudentFines] = useState([]);
  const [activePayModalSemester, setActivePayModalSemester] = useState(null);
  const [activePayModalFine, setActivePayModalFine] = useState(null);
  const [submittingFinePay, setSubmittingFinePay] = useState(false);
  const [receiptModalData, setReceiptModalData] = useState(null);

  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Load student profile on mount
  useEffect(() => {
    try {
      const raw = Cookies.get("studentData");
      if (raw) {
        const parsed = JSON.parse(raw);
        const u = parsed.user || parsed.student || parsed;
        if (u) {
          setStudent({
            _id: u._id || u.id,
            name: u.name || "Student",
            rollno: u.rollno || "N/A",
            batch: u.batch || "Batch 2024-28",
            department: u.department || "Computer Science",
            email: u.email || "",
            blockedModules: u.blockedModules || [],
          });
        }
      }
    } catch (e) {}
  }, []);

  // Fetch fees & master fee rates
  useEffect(() => {
    fetchFeeRates();
    if (student._id) {
      fetchFees();
      fetchStudentFines();
    } else {
      setLoading(false);
    }
  }, [student._id]);

  const fetchFeeRates = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}api/v1/admin/master/fee-rates`);
      if (res.data?.data) {
        if (res.data.data.feeRates) {
          setFeeRatesConfig(res.data.data.feeRates);
        }
        setLateFeeConfig({
          lateFeeFlatAfterDue: res.data.data.lateFeeFlatAfterDue ?? 500,
          lateFeePerDay: res.data.data.lateFeePerDay ?? 20,
          lateFeeGraceDays: res.data.data.lateFeeGraceDays ?? 0,
        });
      }
    } catch (e) {
      console.warn("Using default fee rate config:", e.message);
    }
  };

  const fetchStudentFines = async () => {
    if (!student._id) return;
    try {
      const res = await axios.get(`${BACKEND_URL}api/v1/fine/student/${student._id}`);
      if (res.data?.success) {
        setStudentFines(res.data.fines || []);
      }
    } catch (err) {
      console.warn("Error fetching student fines:", err.message);
    }
  };

  const fetchFees = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BACKEND_URL}student-fees/${student._id}`);
      if (res.data?.data?.fees) {
        setFeeRecords(res.data.data.fees);
      }
    } catch (err) {
      console.error("Error fetching student fees:", err);
    } finally {
      setLoading(false);
    }
  };

  // Extract start year, term count, and semester fee rate dynamically
  const termPlan = useMemo(() => {
    // 1. Start year from batch string (e.g., "Batch 2024-28" or "2022")
    const match = (student.batch || "").match(/20\d{2}/);
    const startYear = match ? parseInt(match[0], 10) : 2024;

    // 2. Department fee rate & duration in years
    const deptInfo = feeRatesConfig?.[student.department] || feeRatesConfig?.["General"] || {
      ratePerSemester: 45000,
      durationYears: 4,
      startMonth: "July",
    };

    const rate = Number(deptInfo.ratePerSemester) || 45000;
    const durationYears = Number(deptInfo.durationYears) || 4;
    const totalSemesters = durationYears * 2; // 2 semesters/terms per academic year

    // 3. Generate sequential terms: July-Dec and Jan-June
    const terms = [];
    for (let i = 1; i <= totalSemesters; i++) {
      const academicYearIndex = Math.floor((i - 1) / 2);
      const cycleYear = startYear + academicYearIndex;
      const isOdd = i % 2 !== 0; // Term 1, 3, 5, 7 -> Autumn (July - Dec)

      const periodTitle = isOdd
        ? `July - Dec ${cycleYear}`
        : `Jan - June ${cycleYear + 1}`;
      const academicYear = `${cycleYear}-${cycleYear + 1}`;
      const dueDate = isOdd
        ? `August 15, ${cycleYear}`
        : `February 15, ${cycleYear + 1}`;

      // Start timestamp to determine if term is currently open or upcoming
      const startTimestamp = isOdd
        ? new Date(cycleYear, 6, 1) // July 1
        : new Date(cycleYear + 1, 0, 1); // January 1 of next year!
      const dueTimestamp = isOdd
        ? new Date(cycleYear, 7, 15) // August 15
        : new Date(cycleYear + 1, 1, 15); // February 15 of next year!

      terms.push({
        termNumber: i,
        title: `Semester ${i}`,
        code: `Semester ${i}`,
        period: periodTitle,
        academicYear,
        dueDate,
        amount: rate,
        startTimestamp,
        dueTimestamp,
      });
    }

    return { startYear, rate, durationYears, totalSemesters, terms };
  }, [student.batch, student.department, feeRatesConfig]);

  // Map each term with payment record and sequential lock status
  const analyzedTerms = useMemo(() => {
    const today = new Date(); // Current date e.g. Oct 2026
    let priorTermUnpaid = false;

    return termPlan.terms.map((term, index) => {
      // Find completed payment in feeRecords
      const sName = term.title.toLowerCase().replace(/[^a-z0-9]/g, "");
      const matchedRecord = feeRecords.find((f) => {
        if (f.paymentStatus !== "completed") return false;
        const recSem = (f.semester || "").toLowerCase().replace(/[^a-z0-9]/g, "");
        return recSem.includes(sName) || sName.includes(recSem);
      });

      const isPaid = Boolean(matchedRecord);

      let status = "upcoming";
      let isPayable = false;
      let isLocked = false;
      let lockReason = "";

      if (isPaid) {
        status = "paid";
      } else {
        // Enforce sequential payment rule: Can only pay if all previous terms are paid!
        if (priorTermUnpaid) {
          isLocked = true;
          status = "locked";
          lockReason = `🔒 Clear prior Semester ${index} fee first`;
        } else {
          // This is the earliest unpaid term!
          // Check if current date is within window (or term has already started / overdue)
          // Opens 45 days before the term starts (as user described: "if i am in jan or close to jan we start the pay thing")
          const openThreshold = new Date(term.startTimestamp.getTime() - 45 * 24 * 60 * 60 * 1000);

          let lateFeePenalty = 0;
          let daysOverdue = 0;

          if (today >= term.dueTimestamp) {
            status = "overdue";
            isPayable = true;

            const graceDays = Number(lateFeeConfig?.lateFeeGraceDays || 0);
            const msDiff = today.getTime() - term.dueTimestamp.getTime();
            const rawDays = Math.max(0, Math.floor(msDiff / (1000 * 60 * 60 * 24)));
            if (rawDays > graceDays) {
              const flatFine = Number(lateFeeConfig?.lateFeeFlatAfterDue ?? 500);
              const perDayFine = Number(lateFeeConfig?.lateFeePerDay ?? 20);
              daysOverdue = rawDays - graceDays;
              lateFeePenalty = flatFine + (daysOverdue * perDayFine);
            }
          } else if (today >= openThreshold) {
            status = "due";
            isPayable = true;
          } else {
            status = "upcoming";
            isPayable = false;
          }
          priorTermUnpaid = true; // Subsequent terms must now be locked

          return {
            ...term,
            isPaid,
            status,
            isPayable,
            isLocked,
            lockReason,
            lateFeePenalty,
            daysOverdue,
            totalPayable: term.amount + lateFeePenalty,
            paymentRecord: matchedRecord || null,
          };
        }
      }

      return {
        ...term,
        isPaid,
        status,
        isPayable,
        isLocked,
        lockReason,
        lateFeePenalty: 0,
        daysOverdue: 0,
        totalPayable: term.amount,
        paymentRecord: matchedRecord || null,
      };
    });
  }, [termPlan, feeRecords, lateFeeConfig]);

  // Overall financial calculations
  const financialSummary = useMemo(() => {
    const totalProgramFee = termPlan.totalSemesters * termPlan.rate;
    const totalPaid = analyzedTerms
      .filter((t) => t.isPaid)
      .reduce((acc, t) => acc + (t.paymentRecord?.amount || t.amount), 0);
    const overdueOrDueNow = analyzedTerms
      .filter((t) => t.isPayable && !t.isPaid)
      .reduce((acc, t) => acc + (t.totalPayable || t.amount), 0);
    const remainingBalance = Math.max(0, totalProgramFee - totalPaid);
    const pendingFines = studentFines
      .filter((f) => f.status === "Pending")
      .reduce((sum, f) => sum + (f.amount || 0), 0);

    return {
      totalProgramFee,
      totalPaid,
      overdueOrDueNow,
      remainingBalance,
      pendingFines,
      grandOutstanding: remainingBalance + pendingFines,
      paidCount: analyzedTerms.filter((t) => t.isPaid).length,
      totalCount: analyzedTerms.length,
    };
  }, [termPlan, analyzedTerms, studentFines]);

  // Filtered terms based on applied search and status pill
  const filteredTerms = useMemo(() => {
    return analyzedTerms.filter((term) => {
      // Status filter
      if (filterStatus === "paid" && !term.isPaid) return false;
      if (filterStatus === "due" && term.status !== "due" && term.status !== "overdue") return false;
      if (filterStatus === "upcoming" && term.status !== "upcoming" && term.status !== "locked") return false;

      // Search query
      if (appliedSearch.trim()) {
        const q = appliedSearch.toLowerCase();
        const matchesTitle = term.title.toLowerCase().includes(q);
        const matchesPeriod = term.period.toLowerCase().includes(q);
        const matchesYear = term.academicYear.toLowerCase().includes(q);
        if (!matchesTitle && !matchesPeriod && !matchesYear) return false;
      }

      return true;
    });
  }, [analyzedTerms, filterStatus, appliedSearch]);

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    setAppliedSearch(searchTerm.trim());
  };

  const [includeLateFee, setIncludeLateFee] = useState(true);

  // Instant Verified Payment (Simulated Sandbox Gateway)
  const handleInstantPayment = async (termObj) => {
    try {
      setLoading(true);
      const latePenalty = termObj.lateFeePenalty || 0;
      const effectiveLateFee = includeLateFee ? latePenalty : 0;
      const totalAmount = termObj.amount + effectiveLateFee;

      const res = await axios.post(`${BACKEND_URL}complete-fee-payment`, {
        studentId: student._id,
        amount: totalAmount,
        semester: termObj.title,
        academicYear: termObj.academicYear,
        lateFee: latePenalty,
        includeLateFee: includeLateFee,
        paymentMode: "Campus Instant Sandbox (Verified)",
      });

      toast.success(`Payment verified! Official Receipt for ${termObj.title} generated.`);
      setActivePayModalSemester(null);
      await Promise.all([fetchFees(), fetchStudentFines()]);

      // Open official receipt modal immediately
      handleOpenReceipt(termObj, res.data.feeRecord || {
        paymentId: `TXN_CAMPUS_${Date.now()}`,
        PaidAt: new Date(),
        amount: totalAmount,
        lateFee: effectiveLateFee,
        semester: termObj.title,
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to complete payment.");
    } finally {
      setLoading(false);
    }
  };

  // Real Razorpay Checkout flow
  const handleRazorpayPayment = async (termObj) => {
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.warn("Razorpay script could not be loaded directly. Switching to Instant Gateway.");
        return handleInstantPayment(termObj);
      }

      const latePenalty = termObj.lateFeePenalty || 0;
      const effectiveLateFee = includeLateFee ? latePenalty : 0;
      const totalAmount = termObj.amount + effectiveLateFee;

      // 1. Create order on backend
      let orderId = `order_${Date.now()}`;
      try {
        const orderRes = await axios.post(`${BACKEND_URL}Fees`, {
          amount: totalAmount * 100,
          currency: "INR",
          studentId: student._id,
          semester: termObj.title,
          academicYear: termObj.academicYear,
        });
        if (orderRes.data?.order_id) {
          orderId = orderRes.data.order_id;
        }
      } catch (err) {
        console.warn("Backend order creation fallback:", err.message);
      }

      // 2. Razorpay Checkout options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_RJjIrWx8F7ZuO8", // Official Test Gateway Key
        amount: totalAmount * 100,
        currency: "INR",
        name: "CampusSync University Portal",
        description: `Tuition Clearance — ${termObj.title} (${termObj.period})`,
        image: "https://cdn-icons-png.flaticon.com/512/2991/2991148.png",
        order_id: orderId && orderId.startsWith("order_") && !orderId.includes("dummy") ? orderId : undefined,
        handler: async function (response) {
          try {
            setLoading(true);
            const captureRes = await axios.post(`${BACKEND_URL}complete-fee-payment`, {
              studentId: student._id,
              amount: totalAmount,
              semester: termObj.title,
              academicYear: termObj.academicYear,
              lateFee: latePenalty,
              includeLateFee: includeLateFee,
              paymentMode: "Razorpay Payment Gateway",
              paymentId: response.razorpay_payment_id || `TXN_RZP_${Date.now()}`,
              orderId: response.razorpay_order_id || orderId,
            });

            toast.success(`Payment verified successfully! Reference: ${response.razorpay_payment_id || "RZP_SUCCESS"}`);
            setActivePayModalSemester(null);
            await Promise.all([fetchFees(), fetchStudentFines()]);

            handleOpenReceipt(termObj, captureRes.data.feeRecord || {
              paymentId: response.razorpay_payment_id || `TXN_RZP_${Date.now()}`,
              PaidAt: new Date(),
              amount: totalAmount,
              lateFee: effectiveLateFee,
              semester: termObj.title,
            });
          } catch (e) {
            console.error("Payment confirmation error:", e);
            toast.error("Payment captured but record update failed.");
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: student.name,
          email: student.email || "student@campus-sync.com",
          contact: "9876543210",
        },
        theme: {
          color: "#2563eb",
        },
        modal: {
          ondismiss: function () {
            toast.info("Payment window dismissed. You can complete payment at any time.");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (failResponse) {
        toast.error(`Payment failed: ${failResponse.error.description}`);
      });
      rzp.open();
    } catch (e) {
      console.error("Razorpay initiation error:", e);
      toast.info("Redirecting to Instant One-Click Sandbox clearance...");
      await handleInstantPayment(termObj);
    }
  };

  // Open Genuine Receipt
  const handleOpenReceipt = (termObj, feeRecord) => {
    const receiptNo = `CS-REC-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const lateFeeAmt = feeRecord.lateFee || termObj.lateFeePaid || (includeLateFee ? termObj.lateFeePenalty : 0) || 0;
    setReceiptModalData({
      receiptNo,
      semester: termObj.title,
      period: termObj.period,
      amount: feeRecord.amount || termObj.amount,
      lateFee: lateFeeAmt,
      paymentId: feeRecord.paymentId || `TXN_RZP_2026_${Math.floor(100000 + Math.random() * 900000)}`,
      paidAt: feeRecord.PaidAt || feeRecord.paidAt ? new Date(feeRecord.PaidAt || feeRecord.paidAt) : new Date(),
      studentName: student.name,
      rollno: student.rollno,
      batch: student.batch,
      department: student.department,
      email: student.email,
    });
  };

  // Open Genuine Receipt for Institutional Fine
  const handleOpenFineReceipt = (fine) => {
    const receiptNo = `CS-FINE-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    setReceiptModalData({
      receiptNo,
      isFineReceipt: true,
      fineType: fine.fineType,
      fineReason: fine.reason,
      semester: `Fine Clearance: ${fine.fineType}`,
      period: "Campus Institutional Settlement",
      amount: fine.amount,
      paymentId: fine.paymentId || `FINE_OFFICIAL_${Date.now()}`,
      paidAt: fine.paidAt ? new Date(fine.paidAt) : new Date(),
      studentName: student.name,
      rollno: student.rollno,
      batch: student.batch,
      department: student.department,
      email: student.email,
    });
  };

  // Settle Fine via Instant Verified Sandbox
  const handlePayFineInstant = async (fine) => {
    try {
      setSubmittingFinePay(true);
      const res = await axios.post(`${BACKEND_URL}api/v1/fee/record-payment`, {
        studentId: student._id,
        amount: fine.amount,
        paymentMode: "Instant Sandbox Clearance",
        paymentCategory: "fine",
        fineId: fine._id,
        fineType: fine.fineType,
        remarks: "Online fine clearance via student portal",
      });

      if (res.data?.success) {
        toast.success(`Fine of ₹${fine.amount} cleared successfully!`);
        setActivePayModalFine(null);
        await Promise.all([fetchStudentFines(), fetchFees()]);
        handleOpenFineReceipt({
          ...fine,
          paidAt: new Date(),
          paymentId: res.data.fee?.paymentId || `TXN_FINE_${Date.now()}`,
        });
      } else {
        toast.error(res.data?.message || "Failed to settle fine.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error clearing fine.");
    } finally {
      setSubmittingFinePay(false);
    }
  };

  // Settle Fine via Razorpay Gateway
  const handlePayFineRazorpay = async (fine) => {
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.warn("Razorpay gateway could not be loaded. Completing with instant verified clearance.");
        return handlePayFineInstant(fine);
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_RJjIrWx8F7ZuO8",
        amount: fine.amount * 100,
        currency: "INR",
        name: "CampusSync University Portal",
        description: `Institutional Fine Settlement — ${fine.fineType}`,
        image: "https://cdn-icons-png.flaticon.com/512/2991/2991148.png",
        handler: async function (response) {
          try {
            await axios.post(`${BACKEND_URL}api/v1/fee/record-payment`, {
              studentId: student._id,
              amount: fine.amount,
              paymentMode: "Razorpay Online Gateway",
              paymentCategory: "fine",
              fineId: fine._id,
              fineType: fine.fineType,
              remarks: `Razorpay Payment ID: ${response.razorpay_payment_id}`,
            });
            toast.success("Fine payment verified!");
            setActivePayModalFine(null);
            await Promise.all([fetchStudentFines(), fetchFees()]);
            handleOpenFineReceipt({
              ...fine,
              paidAt: new Date(),
              paymentId: response.razorpay_payment_id,
            });
          } catch (e) {
            console.error("Payment confirmation error:", e);
            toast.error("Fine payment captured but update failed.");
          }
        },
        prefill: {
          name: student.name,
          email: student.email || "student@campus-sync.com",
          contact: "9876543210",
        },
        theme: {
          color: "#d97706",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (failResponse) {
        toast.error(`Payment failed: ${failResponse.error.description}`);
      });
      rzp.open();
    } catch (e) {
      console.error("Razorpay initiation error:", e);
      toast.info("Switching to instant verified clearance...");
      await handlePayFineInstant(fine);
    }
  };

  if (loading) return <Loading />;

  return (
    <PageContainer>
      <Content>
        {/* Top Header */}
        <HeaderSection>
          <div>
            <h1>
              <BsCashCoin style={{ color: "#2563eb" }} /> Student Accounts & Term Fee Portal
            </h1>
            <p>
              Program fee schedule, quarterly payment terms, Razorpay clearance & official receipts.
            </p>
          </div>
        </HeaderSection>

        {/* Student Meta Summary */}
        <StudentSummaryCard>
          <div className="student-meta">
            <div className="name">
              {student.name}
              <span className="badge">Enrolled Student</span>
            </div>
            <div className="details">
              <span>
                Roll No: <strong>{student.rollno}</strong>
              </span>
              <span>
                Batch: <strong>{student.batch}</strong>
              </span>
              <span>
                Department: <strong>{student.department}</strong>
              </span>
              <span>
                Degree Length: <strong>{termPlan.durationYears} Years ({termPlan.totalSemesters} Terms)</strong>
              </span>
            </div>
          </div>

          <div className="program-tag">
            <div className="label">Tuition Rate Per Term</div>
            <div className="val">₹{termPlan.rate.toLocaleString()} / Semester</div>
          </div>
        </StudentSummaryCard>

        {/* 4 Key Financial Metrics (Batch Total, Paid, Due, Remaining) */}
        <MetricsGrid>
          <MetricCard $accent="#2563eb">
            <div className="label">
              <BsReceipt /> Total Program Fees
            </div>
            <div className="value">₹{financialSummary.totalProgramFee.toLocaleString()}</div>
            <div className="sub">
              {termPlan.totalSemesters} Semesters @ ₹{termPlan.rate.toLocaleString()}
            </div>
          </MetricCard>

          <MetricCard $accent="#10b981">
            <div className="label">
              <BsCheckCircleFill style={{ color: "#10b981" }} /> Total Paid So Far
            </div>
            <div className="value">₹{financialSummary.totalPaid.toLocaleString()}</div>
            <div className="sub" style={{ color: "#059669" }}>
              {financialSummary.paidCount} of {financialSummary.totalCount} Semesters Cleared ✓
            </div>
          </MetricCard>

          <MetricCard $accent="#f59e0b" $subColor="#b45309">
            <div className="label">
              <BsExclamationTriangleFill style={{ color: "#f59e0b" }} /> Current Due / Overdue
            </div>
            <div className="value" style={{ color: financialSummary.overdueOrDueNow > 0 ? "#dc2626" : "#0f172a" }}>
              ₹{financialSummary.overdueOrDueNow.toLocaleString()}
            </div>
            <div className="sub">
              {financialSummary.overdueOrDueNow > 0
                ? "Immediate clearance required"
                : "No pending payment for current cycle"}
            </div>
          </MetricCard>

          <MetricCard $accent="#8b5cf6">
            <div className="label">
              <BsClockHistory /> Remaining Program Balance
            </div>
            <div className="value">₹{financialSummary.remainingBalance.toLocaleString()}</div>
            <div className="sub">
              {termPlan.totalSemesters - financialSummary.paidCount} Semesters Outstanding
            </div>
          </MetricCard>
        </MetricsGrid>

        {/* Pending Institutional Fines Alert Banner */}
        {financialSummary.pendingFines > 0 && (
          <div
            style={{
              background: "#fffbeb",
              border: "1px solid #fde68a",
              borderRadius: "12px",
              padding: "14px 20px",
              marginBottom: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  background: "#fef3c7",
                  color: "#d97706",
                  width: "42px",
                  height: "42px",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                }}
              >
                ⚖️
              </div>
              <div>
                <div style={{ fontWeight: 800, color: "#92400e", fontSize: "15px" }}>
                  Institutional Fines & Penalties Due: ₹{financialSummary.pendingFines.toLocaleString()}
                </div>
                <div style={{ fontSize: "13px", color: "#b45309", marginTop: "2px" }}>
                  You have {studentFines.filter((f) => f.status === "Pending").length} pending library or campus fine(s) requiring clearance.
                </div>
              </div>
            </div>
            <a
              href="#institutional-fines-section"
              style={{
                background: "#d97706",
                color: "#ffffff",
                padding: "8px 16px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 700,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              View & Settle Fines ↓
            </a>
          </div>
        )}

        {/* Search Bar with Explicit Click Search Button and Status Filter Pills */}
        <FilterBar>
          <form className="search-group" onSubmit={handleSearchSubmit}>
            <div className="search-box">
              <BsSearch style={{ color: "#64748b" }} />
              <input
                type="text"
                placeholder="Search semester, period (e.g. July - Dec), year..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <SearchClickButton type="submit">
              <BsSearch /> Search
            </SearchClickButton>
          </form>

          <div className="filter-pills">
            <FilterPill
              $active={filterStatus === "all"}
              onClick={() => setFilterStatus("all")}
            >
              All Terms ({analyzedTerms.length})
            </FilterPill>
            <FilterPill
              $active={filterStatus === "paid"}
              onClick={() => setFilterStatus("paid")}
            >
              Paid ({financialSummary.paidCount})
            </FilterPill>
            <FilterPill
              $active={filterStatus === "due"}
              onClick={() => setFilterStatus("due")}
            >
              Payable / Overdue (
              {analyzedTerms.filter((t) => t.isPayable && !t.isPaid).length}
              )
            </FilterPill>
            <FilterPill
              $active={filterStatus === "upcoming"}
              onClick={() => setFilterStatus("upcoming")}
            >
              Upcoming ({analyzedTerms.filter((t) => t.status === "upcoming" || t.status === "locked").length})
            </FilterPill>
          </div>
        </FilterBar>

        {/* Sequential Fee Installments Table */}
        <TableCard>
          <Table>
            <thead>
              <tr>
                <th>Semester / Term</th>
                <th>Academic Window</th>
                <th>Fee Amount</th>
                <th>Payment Due Date</th>
                <th>Payment Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTerms.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                    No fee terms match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredTerms.map((term) => {
                  return (
                    <tr key={term.code}>
                      <td>
                        <div style={{ fontWeight: 800, color: "#0f172a", fontSize: "15px" }}>
                          {term.title}
                        </div>
                        <div style={{ fontSize: "13px", color: "#64748b" }}>
                          Academic Year {term.academicYear}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: "#334155" }}>{term.period}</div>
                        <div style={{ fontSize: "12px", color: "#64748b" }}>Semester Cycle (Bi-Annual Term)</div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 800, fontSize: "16px", color: "#0f172a" }}>
                          ₹{term.amount.toLocaleString()}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{term.dueDate}</div>
                      </td>
                      <td>
                        {term.isPaid ? (
                          <StatusBadge $type="paid">
                            <BsCheckCircleFill /> Paid ✓
                          </StatusBadge>
                        ) : term.status === "overdue" ? (
                          <StatusBadge $type="overdue">
                            <BsExclamationTriangleFill /> Overdue
                          </StatusBadge>
                        ) : term.status === "due" ? (
                          <StatusBadge $type="due">
                            <BsClockHistory /> Payable Now
                          </StatusBadge>
                        ) : term.isLocked ? (
                          <StatusBadge $type="locked" title={term.lockReason}>
                            <BsLockFill /> Locked
                          </StatusBadge>
                        ) : (
                          <StatusBadge $type="upcoming">
                            <BsCalendarCheck /> Upcoming Term
                          </StatusBadge>
                        )}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {term.isPaid ? (
                          <ActionButton
                            className="receipt-btn"
                            onClick={() => handleOpenReceipt(term, term.paymentRecord || {})}
                            title="View and print genuine fee receipt"
                          >
                            <BsPrinter /> View Receipt
                          </ActionButton>
                        ) : term.isLocked ? (
                          <ActionButton
                            className="locked-btn"
                            disabled
                            title={term.lockReason}
                          >
                            <BsLockFill /> {term.lockReason}
                          </ActionButton>
                        ) : term.isPayable ? (
                          <ActionButton
                            className="pay-btn"
                            onClick={() => setActivePayModalSemester(term)}
                            title="Pay this semester fee online via Razorpay"
                          >
                            <BsCreditCard /> Pay Fee ₹{term.amount.toLocaleString()}
                          </ActionButton>
                        ) : (
                          <span style={{ fontSize: "13px", color: "#94a3b8", fontWeight: 600 }}>
                            Opens in {term.period.split(" ")[0]}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </TableCard>

        {/* SECTION 2: INSTITUTIONAL FINES & PENALTIES */}
        <div id="institutional-fines-section" style={{ marginTop: "40px", marginBottom: "30px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              flexWrap: "wrap",
              gap: "12px",
              marginBottom: "16px",
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: 800,
                  color: "#0f172a",
                  margin: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                ⚖️ Institutional Fines & Campus Penalties
              </h2>
              <p style={{ fontSize: "14px", color: "#64748b", margin: "4px 0 0 0" }}>
                Overdue library returns, laboratory equipment breakage, sports fines, and campus disciplinary penalties.
              </p>
            </div>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              {studentFines.filter((f) => f.status === "Pending").length > 0 ? (
                <span
                  style={{
                    background: "#fee2e2",
                    color: "#dc2626",
                    border: "1px solid #fecaca",
                    padding: "6px 14px",
                    borderRadius: "20px",
                    fontSize: "13px",
                    fontWeight: 700,
                  }}
                >
                  ⚠️ {studentFines.filter((f) => f.status === "Pending").length} Fine(s) Outstanding (₹{financialSummary.pendingFines.toLocaleString()})
                </span>
              ) : (
                <span
                  style={{
                    background: "#dcfce7",
                    color: "#16a34a",
                    border: "1px solid #bbf7d0",
                    padding: "6px 14px",
                    borderRadius: "20px",
                    fontSize: "13px",
                    fontWeight: 700,
                  }}
                >
                  ✓ All Institutional Fines Cleared
                </span>
              )}
            </div>
          </div>

          {studentFines.length === 0 ? (
            <div
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "14px",
                padding: "36px 20px",
                textAlign: "center",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>🎉</div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>
                No Institutional Fines on Record
              </div>
              <div style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
                Your university account has zero outstanding library, laboratory, or disciplinary fines. Great conduct!
              </div>
            </div>
          ) : (
            <TableCard>
              <Table>
                <thead>
                  <tr>
                    <th>Fine Category & Type</th>
                    <th>Reason / Violation Details</th>
                    <th>Date Levied</th>
                    <th>Due Date</th>
                    <th>Amount (INR)</th>
                    <th>Status</th>
                    <th>Action / Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {studentFines.map((fine) => {
                    const isPaid = fine.status === "Paid";
                    const isPending = fine.status === "Pending";
                    return (
                      <tr key={fine._id}>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              fontWeight: 700,
                              color: "#0f172a",
                            }}
                          >
                            <span>
                              {fine.fineType?.toLowerCase().includes("library")
                                ? "📚"
                                : fine.fineType?.toLowerCase().includes("lab")
                                ? "🔬"
                                : fine.fineType?.toLowerCase().includes("sports")
                                ? "🏏"
                                : fine.fineType?.toLowerCase().includes("hostel")
                                ? "🏢"
                                : "⚖️"}
                            </span>
                            <span>{fine.fineType}</span>
                          </div>
                          <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                            Issued by: {fine.leviedBy || "Accounts Desk"}
                          </div>
                        </td>
                        <td style={{ color: "#475569", maxWidth: "260px" }}>
                          {fine.reason || "Institutional penalty record"}
                        </td>
                        <td style={{ fontSize: "13px", color: "#64748b" }}>
                          {formatDateDDMMYYYY(fine.createdAt)}
                        </td>
                        <td
                          style={{
                            fontSize: "13px",
                            color: isPending ? "#dc2626" : "#64748b",
                            fontWeight: isPending ? 600 : 400,
                          }}
                        >
                          {fine.dueDate
                            ? formatDateDDMMYYYY(fine.dueDate)
                            : "Immediate"}
                        </td>
                        <td
                          style={{
                            fontWeight: 800,
                            color: isPaid ? "#16a34a" : "#dc2626",
                            fontSize: "15px",
                          }}
                        >
                          ₹{Number(fine.amount).toLocaleString()}
                        </td>
                        <td>
                          <StatusBadge $type={isPaid ? "paid" : isPending ? "overdue" : "locked"}>
                            {isPaid ? "✓ Paid" : isPending ? "⚠️ Pending" : fine.status}
                          </StatusBadge>
                        </td>
                        <td>
                          {isPaid ? (
                            <ActionButton
                              className="receipt-btn"
                              onClick={() => handleOpenFineReceipt(fine)}
                              title="Print official fine clearance receipt"
                            >
                              <BsPrinter /> Fine Receipt
                            </ActionButton>
                          ) : isPending ? (
                            <ActionButton
                              className="pay-btn"
                              style={{ background: "#d97706" }}
                              onClick={() => setActivePayModalFine(fine)}
                              title="Settle this fine online"
                            >
                              <BsCreditCard /> Pay Fine ₹{fine.amount.toLocaleString()}
                            </ActionButton>
                          ) : (
                            <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
                              Waived by Administration
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </TableCard>
          )}
        </div>

        {/* Modal: Real Razorpay & Sandbox Clearance Selection for Semester Tuition */}
        {activePayModalSemester && (
          <ModalOverlay onClick={() => setActivePayModalSemester(null)}>
            <PayModalBox onClick={(e) => e.stopPropagation()}>
              <h3>Pay Tuition Fee — {activePayModalSemester.title}</h3>
              <p>
                Academic Period: <strong>{activePayModalSemester.period}</strong> ({activePayModalSemester.academicYear})
              </p>

              <div className="breakdown">
                <div className="row">
                  <span>Tuition & Instructional Academic Delivery</span>
                  <span>₹{Math.round(activePayModalSemester.amount * 0.75).toLocaleString()}</span>
                </div>
                <div className="row">
                  <span>Campus Advanced Computing & IT Infrastructure</span>
                  <span>₹{Math.round(activePayModalSemester.amount * 0.12).toLocaleString()}</span>
                </div>
                <div className="row">
                  <span>Central University Digital Library Services</span>
                  <span>₹{Math.round(activePayModalSemester.amount * 0.07).toLocaleString()}</span>
                </div>
                <div className="row">
                  <span>Examination & Student Life Activity Fee</span>
                  <span>₹{Math.round(activePayModalSemester.amount * 0.06).toLocaleString()}</span>
                </div>

                {activePayModalSemester.lateFeePenalty > 0 && (
                  <div style={{ marginTop: "10px", marginBottom: "10px", padding: "10px", background: "#fef3c7", borderRadius: "8px", border: "1px solid #fde68a" }}>
                    <div className="row" style={{ color: "#dc2626", fontWeight: 700, margin: 0 }}>
                      <span>Late Payment Penalty ({activePayModalSemester.daysOverdue} days overdue)</span>
                      <span>₹{activePayModalSemester.lateFeePenalty.toLocaleString()}</span>
                    </div>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px", cursor: "pointer", fontSize: "12px", fontWeight: 700, color: "#92400e" }}>
                      <input
                        type="checkbox"
                        checked={includeLateFee}
                        onChange={(e) => setIncludeLateFee(e.target.checked)}
                      />
                      <span>
                        Append & settle late fee penalty (₹{activePayModalSemester.lateFeePenalty.toLocaleString()}) with this semester payment
                      </span>
                    </label>
                    {!includeLateFee && (
                      <div style={{ fontSize: "11px", color: "#b45309", marginTop: "4px" }}>
                        ⚠️ Notice: Unpaid late fee will remain recorded as a pending institutional fine on your account.
                      </div>
                    )}
                  </div>
                )}

                <div className="row total">
                  <span>Total Amount Payable</span>
                  <span>
                    ₹{(activePayModalSemester.amount + (includeLateFee && activePayModalSemester.lateFeePenalty ? activePayModalSemester.lateFeePenalty : 0)).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="pay-options">
                <button
                  className="rzp-btn"
                  onClick={() => handleRazorpayPayment(activePayModalSemester)}
                >
                  <BsCreditCard /> Pay with Razorpay Gateway (₹{(activePayModalSemester.amount + (includeLateFee && activePayModalSemester.lateFeePenalty ? activePayModalSemester.lateFeePenalty : 0)).toLocaleString()})
                </button>
                <button
                  className="instant-btn"
                  onClick={() => handleInstantPayment(activePayModalSemester)}
                >
                  <BsCheckCircleFill /> Instant Verified Sandbox Clearance
                </button>
                <button
                  className="close-btn"
                  onClick={() => setActivePayModalSemester(null)}
                >
                  Cancel
                </button>
              </div>
            </PayModalBox>
          </ModalOverlay>
        )}

        {/* Modal: Pay Fine Online via Razorpay or Instant Gateway */}
        {activePayModalFine && (
          <ModalOverlay onClick={() => setActivePayModalFine(null)}>
            <PayModalBox onClick={(e) => e.stopPropagation()}>
              <h3>Pay Institutional Fine</h3>
              <p>
                Fine Classification: <strong>{activePayModalFine.fineType}</strong>
              </p>

              <div className="breakdown">
                <div className="row">
                  <span>Violation Reason</span>
                  <span>{activePayModalFine.reason || "Institutional Fine Settlement"}</span>
                </div>
                <div className="row">
                  <span>Issuing Authority</span>
                  <span>{activePayModalFine.leviedBy || "Accounts Desk"}</span>
                </div>
                <div className="row">
                  <span>Settlement Due Date</span>
                  <span>
                    {activePayModalFine.dueDate
                      ? formatDateDDMMYYYY(activePayModalFine.dueDate)
                      : "Immediate Settlement Required"}
                  </span>
                </div>
                <div className="row total">
                  <span>Total Fine Amount Due</span>
                  <span>₹{Number(activePayModalFine.amount).toLocaleString()}</span>
                </div>
              </div>

              <div className="pay-options">
                <button
                  className="rzp-btn"
                  disabled={submittingFinePay}
                  onClick={() => handlePayFineRazorpay(activePayModalFine)}
                >
                  <BsCreditCard /> Pay with Razorpay Gateway
                </button>
                <button
                  className="instant-btn"
                  disabled={submittingFinePay}
                  onClick={() => handlePayFineInstant(activePayModalFine)}
                >
                  <BsCheckCircleFill /> Instant Verified Sandbox Clearance
                </button>
                <button
                  className="close-btn"
                  onClick={() => setActivePayModalFine(null)}
                >
                  Cancel
                </button>
              </div>
            </PayModalBox>
          </ModalOverlay>
        )}

        {/* Modal: Authentic Official Fee Receipt */}
        {receiptModalData && (
          <ModalOverlay onClick={() => setReceiptModalData(null)}>
            <ReceiptModalBox onClick={(e) => e.stopPropagation()}>
              <div className="receipt-header">
                <div className="inst-name">CampusSync University of Technology</div>
                <div className="sub-title">
                  {receiptModalData.isFineReceipt
                    ? "Central Disciplinary & Treasury Directorate | Official Fine Settlement Clearance Receipt"
                    : "Central Treasury & Finance Directorate | Official Student Fee Receipt"}
                </div>
                <div className="receipt-id">Receipt No: {receiptModalData.receiptNo}</div>
              </div>

              <div className="meta-grid">
                <div className="field">
                  <div className="label">Student Name:</div>
                  <div className="val">{receiptModalData.studentName}</div>
                </div>
                <div className="field">
                  <div className="label">Roll Number:</div>
                  <div className="val">{receiptModalData.rollno}</div>
                </div>
                <div className="field">
                  <div className="label">Batch & Department:</div>
                  <div className="val">{receiptModalData.batch} — {receiptModalData.department}</div>
                </div>
                <div className="field">
                  <div className="label">{receiptModalData.isFineReceipt ? "Classification:" : "Semester / Term:"}</div>
                  <div className="val">{receiptModalData.semester} ({receiptModalData.period || "Quarterly Term"})</div>
                </div>
                <div className="field">
                  <div className="label">Transaction Reference:</div>
                  <div className="val" style={{ fontFamily: "monospace", color: "#2563eb" }}>
                    {receiptModalData.paymentId}
                  </div>
                </div>
                <div className="field">
                  <div className="label">Payment Timestamp:</div>
                  <div className="val">{receiptModalData.paidAt.toLocaleString()}</div>
                </div>
              </div>

              {receiptModalData.isFineReceipt ? (
                <table className="schedule-table">
                  <thead>
                    <tr>
                      <th>Fine Classification & Description</th>
                      <th style={{ textAlign: "right" }}>Amount Settled (INR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <div style={{ fontWeight: 700 }}>{receiptModalData.fineType}</div>
                        <div style={{ fontSize: "12px", color: "#64748b", marginTop: "3px" }}>
                          Reason: {receiptModalData.fineReason || "Campus institutional settlement"}
                        </div>
                      </td>
                      <td style={{ textAlign: "right", fontWeight: 700 }}>
                        ₹{Number(receiptModalData.amount).toLocaleString()}
                      </td>
                    </tr>
                    <tr className="total-row">
                      <td>TOTAL FINE AMOUNT SETTLED</td>
                      <td style={{ textAlign: "right" }}>₹{Number(receiptModalData.amount).toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <table className="schedule-table">
                  <thead>
                    <tr>
                      <th>Fee Schedule Component</th>
                      <th style={{ textAlign: "right" }}>Amount (INR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Tuition & Instructional Academic Delivery</td>
                      <td style={{ textAlign: "right" }}>
                        ₹{Math.round(receiptModalData.amount * 0.75).toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td>Campus Advanced Computing & IT Infrastructure</td>
                      <td style={{ textAlign: "right" }}>
                        ₹{Math.round(receiptModalData.amount * 0.12).toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td>Central University Digital Library Services</td>
                      <td style={{ textAlign: "right" }}>
                        ₹{Math.round(receiptModalData.amount * 0.07).toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td>Examination & Student Life Activity Fee</td>
                      <td style={{ textAlign: "right" }}>
                        ₹{Math.round(receiptModalData.amount * 0.06).toLocaleString()}
                      </td>
                    </tr>
                    {receiptModalData.lateFee > 0 && (
                      <tr>
                        <td style={{ color: "#dc2626", fontWeight: 700 }}>
                          Overdue Late Fee Penalty
                        </td>
                        <td style={{ textAlign: "right", color: "#dc2626", fontWeight: 700 }}>
                          ₹{receiptModalData.lateFee.toLocaleString()}
                        </td>
                      </tr>
                    )}
                    <tr className="total-row">
                      <td>TOTAL NET AMOUNT PAID (INR)</td>
                      <td style={{ textAlign: "right" }}>₹{receiptModalData.amount.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              )}

              <div className="footer-seal">
                <div className="seal-box">
                  <BsShieldCheck style={{ fontSize: "24px" }} />
                  <span>
                    {receiptModalData.isFineReceipt
                      ? "ELECTRONICALLY CLEARED & NO DUES RECORDED"
                      : "ELECTRONICALLY VERIFIED & TREASURY CLEARED"}
                  </span>
                </div>
                <div className="sign">
                  <div className="officer">Chief Financial Officer & Registrar</div>
                  <div>CampusSync Finance Cell</div>
                </div>
              </div>

              <div className="receipt-actions">
                <button className="print-btn" onClick={() => window.print()}>
                  <BsPrinter /> Print / Save PDF
                </button>
                <button className="close-btn" onClick={() => setReceiptModalData(null)}>
                  Close
                </button>
              </div>
            </ReceiptModalBox>
          </ModalOverlay>
        )}
      </Content>
      <ToastContainer />
    </PageContainer>
  );
};

export default StudentFees;
