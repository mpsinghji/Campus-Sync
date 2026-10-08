import React, { useState, useEffect, useMemo } from "react";
import AdminSidebar from "./Sidebar";
import axios from "axios";
import styled from "styled-components";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BACKEND_URL } from "../../constants/url";
import {
  BsCalendarPlus,
  BsClock,
  BsGeoAlt,
  BsCheckCircleFill,
  BsExclamationTriangleFill,
  BsCopy,
  BsTrash,
  BsPencilSquare,
  BsLightningFill,
  BsBook,
  BsSearch,
  BsTag,
  BsShieldCheck,
  BsArrowRight,
  BsX,
} from "react-icons/bs";

const Container = styled.div`
  display: flex;
  padding-left: 250px;
  min-height: 100vh;
  background-color: #f8fafc;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  box-sizing: border-box;

  *, *::before, *::after {
    box-sizing: border-box;
  }

  @media screen and (max-width: 768px) {
    padding-left: 0;
    flex-direction: column;
  }
`;

const Content = styled.div`
  flex: 1;
  padding: 24px 32px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;

  .title-group {
    h1 {
      font-size: 24px;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 4px 0;
      letter-spacing: -0.4px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    p {
      font-size: 13px;
      color: #64748b;
      margin: 0;
    }
  }

  .action-buttons {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }
`;

const PrimaryButton = styled.button`
  background: #0f766e;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 18px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  box-shadow: 0 2px 6px rgba(15, 118, 110, 0.25);

  &:hover {
    background: #0d655e;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled.button`
  background: white;
  color: #334155;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;

  &:hover {
    background: #f1f5f9;
  }
`;

const TabBar = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 10px;
`;

const TabItem = styled.button`
  background: ${(props) => (props.$active ? "#0f766e" : "transparent")};
  color: ${(props) => (props.$active ? "#ffffff" : "#475569")};
  font-weight: 700;
  font-size: 13px;
  padding: 8px 18px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${(props) => (props.$active ? "#0d655e" : "#f1f5f9")};
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 14px;
  margin-bottom: 20px;
`;

const StatCard = styled.div`
  background: white;
  padding: 14px 18px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
  display: flex;
  align-items: center;
  gap: 14px;

  .icon-wrap {
    width: 42px;
    height: 42px;
    border-radius: 10px;
    background: ${(props) => props.$bg || "#f0fdf4"};
    color: ${(props) => props.$color || "#0f766e"};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    flex-shrink: 0;
  }

  .info {
    .label {
      font-size: 11px;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }
    .value {
      font-size: 19px;
      font-weight: 800;
      color: #0f172a;
      margin-top: 1px;
    }
  }
`;

const FilterCard = styled.div`
  background: white;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  label {
    font-size: 12px;
    font-weight: 700;
    color: #475569;
    white-space: nowrap;
  }

  input,
  select {
    padding: 8px 12px;
    border-radius: 8px;
    border: 1px solid #cbd5e1;
    font-size: 13px;
    outline: none;
    background: white;
    transition: all 0.2s;

    &:focus {
      border-color: #0f766e;
      box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.12);
    }
  }
`;

const ExamGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 16px;
  margin-bottom: 30px;
`;

const ExamCard = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  padding: 18px 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
  position: relative;
  transition: all 0.2s;
  border-top: 4px solid #0f766e;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  &:hover {
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.06);
    transform: translateY(-2px);
  }

  .card-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 10px;

    .tag-cluster {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }

    .code-badge {
      font-size: 11px;
      font-weight: 800;
      color: #0f766e;
      background: #f0fdf4;
      padding: 3px 8px;
      border-radius: 6px;
      border: 1px solid #bbf7d0;
    }

    .batch-badge {
      font-size: 11px;
      font-weight: 700;
      color: #1e40af;
      background: #eff6ff;
      padding: 3px 8px;
      border-radius: 6px;
    }

    .time-status {
      font-size: 11px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 12px;
      color: white;
      background: ${(props) => props.$statusColor || "#0f766e"};
    }
  }

  .subject-name {
    font-size: 16px;
    font-weight: 800;
    color: #0f172a;
    margin-bottom: 8px;
    line-height: 1.3;
  }

  .meta-list {
    font-size: 13px;
    color: #475569;
    margin-bottom: 10px;
    display: flex;
    flex-direction: column;
    gap: 4px;

    .item {
      display: flex;
      align-items: center;
      gap: 6px;
    }
  }

  .instructions {
    background: #f8fafc;
    border-radius: 8px;
    padding: 8px 12px;
    font-size: 12px;
    color: #334155;
    margin-top: 6px;
    line-height: 1.4;
    border-left: 3px solid #cbd5e1;
  }

  .target-badge {
    margin-top: 8px;
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 11px;
    background: #fdf2f8;
    color: #be185d;
    font-weight: 600;
  }

  .card-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 14px;
    padding-top: 12px;
    border-top: 1px solid #f1f5f9;

    button {
      background: transparent;
      border: 1px solid #e2e8f0;
      padding: 5px 10px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 600;
      color: #475569;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      transition: all 0.15s;

      &:hover {
        background: #f8fafc;
        color: #0f172a;
      }

      &.clone-btn:hover {
        background: #eff6ff;
        color: #2563eb;
        border-color: #bfdbfe;
      }

      &.edit-btn:hover {
        background: #f0fdf4;
        color: #059669;
        border-color: #bbf7d0;
      }

      &.del-btn:hover {
        background: #fef2f2;
        color: #dc2626;
        border-color: #fecaca;
      }
    }
  }
`;

// RESULTS TABLE STYLES
const TableWrapper = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03);
  overflow-x: auto;
  margin-bottom: 30px;
`;

const DataTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 900px;
  text-align: left;

  th {
    background: #f8fafc;
    color: #475569;
    font-size: 11px;
    font-weight: 700;
    padding: 12px 16px;
    border-bottom: 2px solid #e2e8f0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  td {
    padding: 12px 16px;
    border-bottom: 1px solid #f1f5f9;
    font-size: 13px;
    color: #1e293b;
    vertical-align: middle;
  }

  tr:hover td {
    background: #f8fafc;
  }
`;

const GradeBadge = styled.span`
  display: inline-block;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 800;
  background: ${(props) => {
    if (props.$grade === "O" || props.$grade === "A+") return "#dcfce7";
    if (props.$grade === "A" || props.$grade === "B+") return "#e0f2fe";
    if (props.$grade === "B" || props.$grade === "C") return "#fef3c7";
    return "#fee2e2";
  }};
  color: ${(props) => {
    if (props.$grade === "O" || props.$grade === "A+") return "#15803d";
    if (props.$grade === "A" || props.$grade === "B+") return "#0369a1";
    if (props.$grade === "B" || props.$grade === "C") return "#b45309";
    return "#b91c1c";
  }};
`;

const StatusPill = styled.span`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  background: ${(props) => (props.$pass ? "#ecfdf5" : "#fef2f2")};
  color: ${(props) => (props.$pass ? "#059669" : "#dc2626")};
`;

// MODAL STYLES
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalBox = styled.div`
  background: white;
  border-radius: 14px;
  padding: 24px 28px;
  width: 100%;
  max-width: 680px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;

  .header-left {
    h3 {
      margin: 0 0 2px 0;
      font-size: 18px;
      font-weight: 800;
      color: #0f172a;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    p {
      margin: 0;
      font-size: 12px;
      color: #64748b;
    }
  }

  button {
    background: none;
    border: none;
    font-size: 22px;
    color: #94a3b8;
    cursor: pointer;
    &:hover {
      color: #0f172a;
    }
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 14px;
  margin-bottom: 16px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-size: 12px;
    font-weight: 700;
    color: #475569;
    display: flex;
    justify-content: space-between;

    span.hint {
      font-weight: 400;
      color: #94a3b8;
    }
  }

  input,
  select,
  textarea {
    padding: 9px 12px;
    border-radius: 8px;
    border: 1px solid #cbd5e1;
    font-size: 13px;
    outline: none;
    background: white;
    width: 100%;

    &:focus {
      border-color: #0f766e;
      box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.12);
    }
  }
`;

// Interactive Preset Section Elements (Makes scheduling 10x easier)
const PresetsSection = styled.div`
  background: #f8fafc;
  border-radius: 10px;
  padding: 12px 14px;
  border: 1px solid #e2e8f0;
  margin-bottom: 16px;

  .preset-title {
    font-size: 11px;
    font-weight: 700;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    margin-bottom: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .preset-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
`;

const CourseChip = styled.button`
  border: 1px solid ${(props) => (props.$active ? "#0f766e" : "#cbd5e1")};
  background: ${(props) => (props.$active ? "#f0fdf4" : "#ffffff")};
  color: ${(props) => (props.$active ? "#0f766e" : "#334155")};
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: ${(props) => (props.$active ? "700" : "500")};
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  transition: all 0.15s;

  &:hover {
    border-color: #0f766e;
    background: #f0fdf4;
    color: #0f766e;
  }

  .code-pill {
    background: ${(props) => (props.$active ? "#0f766e" : "#f1f5f9")};
    color: ${(props) => (props.$active ? "#ffffff" : "#64748b")};
    padding: 1px 5px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 700;
  }
`;

const SlotButton = styled.button`
  border: 1px solid ${(props) => (props.$active ? "#0f766e" : "#cbd5e1")};
  background: ${(props) => (props.$active ? "#f0fdf4" : "#ffffff")};
  color: ${(props) => (props.$active ? "#0f766e" : "#334155")};
  padding: 7px 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: ${(props) => (props.$active ? "700" : "500")};
  cursor: pointer;
  display: inline-flex;
  flex-direction: column;
  gap: 2px;
  text-align: left;
  transition: all 0.15s;
  flex: 1 1 120px;

  &:hover {
    border-color: #0f766e;
    background: #f0fdf4;
  }

  .slot-label {
    font-weight: 700;
    font-size: 12px;
  }

  .slot-time {
    font-size: 11px;
    color: ${(props) => (props.$active ? "#0f766e" : "#64748b")};
  }
`;

const TagChip = styled.button`
  border: 1px solid ${(props) => (props.$active ? "#0f766e" : "#cbd5e1")};
  background: ${(props) => (props.$active ? "#f0fdf4" : "#ffffff")};
  color: ${(props) => (props.$active ? "#0f766e" : "#475569")};
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: all 0.15s;

  &:hover {
    border-color: #0f766e;
    color: #0f766e;
  }
`;

const ConflictAlert = styled.div`
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 12px;
  color: #b45309;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;

  svg {
    font-size: 16px;
    flex-shrink: 0;
  }
`;

// STANDARD POPULAR COURSES PRESETS FOR QUICK AUTO-FILL
const STANDARD_COURSES = [
  { name: "Data Structures & Algorithms", code: "CS-301" },
  { name: "Database Management Systems", code: "CS-302" },
  { name: "Operating Systems", code: "CS-303" },
  { name: "Computer Networks", code: "CS-304" },
  { name: "Software Engineering", code: "CS-305" },
  { name: "Artificial Intelligence & ML", code: "CS-306" },
  { name: "Theory of Computation", code: "CS-307" },
  { name: "Web & Full-Stack Tech", code: "CS-308" },
  { name: "Cloud & Distributed Systems", code: "CS-309" },
  { name: "Cybersecurity & Cryptography", code: "CS-310" },
];

const STANDARD_SLOTS = [
  { id: "morning", label: "Morning Session", time: "09:30", info: "09:30 AM (3h)" },
  { id: "afternoon", label: "Afternoon Session", time: "14:00", info: "02:00 PM (3h)" },
  { id: "midterm", label: "Mid-Term Fast", time: "10:00", info: "10:00 AM (1.5h)" },
  { id: "evening", label: "Evening Session", time: "17:30", info: "05:30 PM (1.5h)" },
];

const STANDARD_VENUES = [
  "Exam Hall 1 (Block A, 2nd Flr)",
  "Exam Hall 2 (Block B, 1st Flr)",
  "Central Auditorium Hall",
  "Computer Lab 1 & 2 (Tech Wing)",
  "Seminar Hall 3 (Management)",
];

const STANDARD_RULES = [
  "Physical Student ID Card Mandatory",
  "Non-programmable Scientific Calculator (FX-991) Permitted",
  "Report at venue 30 minutes before commencement",
  "Mobile phones, smartwatches & bags strictly prohibited",
];

const AdminExam = () => {
  const [activeTab, setActiveTab] = useState("schedules"); // "schedules" | "results"
  const [examData, setExamData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [batchesList, setBatchesList] = useState(["Batch 2024", "Batch 2025", "Batch 2023", "Batch 2022"]);

  // Dynamically merge batches from database and attendance
  const allAvailableBatches = useMemo(() => {
    const list = new Set([...batchesList, ...examData.map((e) => e.batch).filter(Boolean)]);
    return Array.from(list);
  }, [batchesList, examData]);

  // Dynamically merge standard courses and existing courses in database
  const allCoursePresets = useMemo(() => {
    const map = new Map();
    STANDARD_COURSES.forEach((c) => map.set(c.name, c));
    examData.forEach((e) => {
      if (e.subjectName && !map.has(e.subjectName)) {
        map.set(e.subjectName, {
          name: e.subjectName,
          code: e.subjectCode || "EXAM",
        });
      }
    });
    return Array.from(map.values());
  }, [examData]);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBatch, setFilterBatch] = useState("all");

  // New / Edit Exam Modal state
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [editingExamId, setEditingExamId] = useState(null); // null = new, id = edit
  const [examDatePart, setExamDatePart] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState("morning");
  const [customTime, setCustomTime] = useState("09:30");

  const [newExam, setNewExam] = useState({
    subjectName: "",
    subjectCode: "",
    batch: "Batch 2024",
    targetEmails: "",
    description: "",
  });
  const [submittingExam, setSubmittingExam] = useState(false);

  // Results Registry State
  const [resultsList, setResultsList] = useState([]);

  // New Result Modal state
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [newResult, setNewResult] = useState({
    rollno: "",
    name: "",
    subject: "Data Structures & Algorithms",
    code: "CS-301",
    internal: 25,
    midTerm: 16,
    endTerm: 40,
  });

  const fetchResults = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}api/v1/results`, {
        withCredentials: true,
      });
      if (res.data?.success && Array.isArray(res.data.results)) {
        setResultsList(res.data.results);
      } else {
        setResultsList([]);
      }
    } catch (err) {
      console.error("Error fetching results:", err);
      setResultsList([]);
    }
  };

  useEffect(() => {
    fetchExams();
    fetchBatches();
    fetchResults();
  }, []);

  const fetchBatches = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}api/v1/attendance/batches`);
      if (res.data?.success && Array.isArray(res.data.batches) && res.data.batches.length > 0) {
        setBatchesList(Array.from(new Set([...res.data.batches, "Batch 2024", "Batch 2025"])));
      }
    } catch (err) {
      // Fallback already in place
    }
  };

  const fetchExams = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BACKEND_URL}api/v1/exam/getall`);
      if (Array.isArray(response.data?.exams)) {
        setExamData(response.data.exams.reverse());
      }
    } catch (error) {
      console.error("Error fetching exams:", error);
    } finally {
      setLoading(false);
    }
  };

  // Open clean new exam scheduler
  const openNewExamModal = () => {
    setEditingExamId(null);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split("T")[0];

    setExamDatePart(dateStr);
    setSelectedSlotId("morning");
    setCustomTime("09:30");
    setNewExam({
      subjectName: "",
      subjectCode: "",
      batch: "Batch 2024",
      targetEmails: "",
      description: "Exam Hall 1 (Block A, 2nd Flr) | Physical Student ID Card Mandatory",
    });
    setIsExamModalOpen(true);
  };

  // Open edit modal for an existing exam
  const handleEditExam = (exam) => {
    setEditingExamId(exam._id);
    let datePart = "";
    let timePart = "09:30";

    if (exam.date) {
      const d = new Date(exam.date);
      datePart = d.toISOString().split("T")[0];
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      timePart = `${hh}:${mm}`;
    }

    setExamDatePart(datePart);
    setCustomTime(timePart);

    const slotMatch = STANDARD_SLOTS.find((s) => s.time === timePart);
    setSelectedSlotId(slotMatch ? slotMatch.id : "custom");

    setNewExam({
      subjectName: exam.subjectName || "",
      subjectCode: exam.subjectCode || "",
      batch: exam.batch || "Batch 2024",
      targetEmails: Array.isArray(exam.targetEmails) ? exam.targetEmails.join(", ") : "",
      description: exam.description || "",
    });
    setIsExamModalOpen(true);
  };

  // Clone an existing exam for rapid scheduling of the next paper
  const handleCloneExam = (exam) => {
    setEditingExamId(null);
    let nextDateStr = "";
    if (exam.date) {
      const d = new Date(exam.date);
      d.setDate(d.getDate() + 2); // default 2 day gap
      nextDateStr = d.toISOString().split("T")[0];
    } else {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      nextDateStr = d.toISOString().split("T")[0];
    }

    setExamDatePart(nextDateStr);
    setSelectedSlotId("morning");
    setCustomTime("09:30");

    setNewExam({
      subjectName: "", // Clear subject so user can click next subject
      subjectCode: "",
      batch: exam.batch || "Batch 2024",
      targetEmails: Array.isArray(exam.targetEmails) ? exam.targetEmails.join(", ") : "",
      description: exam.description || "",
    });
    setIsExamModalOpen(true);
    toast.info("Exam template cloned! Pick the course and date for the next paper.");
  };

  // Delete an exam
  const handleDeleteExam = async (examId, subjectName) => {
    if (!window.confirm(`Are you sure you want to delete the examination schedule for "${subjectName}"?`)) {
      return;
    }

    try {
      await axios.delete(`${BACKEND_URL}api/v1/exam/${examId}`);
      toast.success(`Exam schedule for ${subjectName} deleted.`);
      fetchExams();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete exam");
    }
  };

  // Quick preset course auto-fill
  const handleSelectCourse = (course) => {
    setNewExam((prev) => ({
      ...prev,
      subjectName: course.name,
      subjectCode: course.code,
    }));
  };

  // Quick preset venue inserter
  const handleInsertVenue = (venue) => {
    setNewExam((prev) => {
      let desc = prev.description || "";
      // Replace existing venue or prepend
      const parts = desc.split("|").map((p) => p.trim());
      if (parts.length > 0 && STANDARD_VENUES.some((v) => parts[0].includes(v.split(" ")[0]))) {
        parts[0] = venue;
        return { ...prev, description: parts.join(" | ") };
      }
      return { ...prev, description: desc ? `${venue} | ${desc}` : venue };
    });
  };

  // Quick preset rule toggler
  const handleToggleRule = (rule) => {
    setNewExam((prev) => {
      const desc = prev.description || "";
      if (desc.includes(rule)) {
        const cleaned = desc.replace(rule, "").replace(/\s*\|\s*\|/g, " | ").trim();
        return { ...prev, description: cleaned };
      } else {
        return {
          ...prev,
          description: desc ? `${desc} | ${rule}` : rule,
        };
      }
    });
  };

  // Quick date jumper
  const handleSetDateOffset = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setExamDatePart(d.toISOString().split("T")[0]);
  };

  // Quick next monday jumper
  const handleSetNextMonday = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() + ((7 - day + 1) % 7 || 7);
    d.setDate(diff);
    setExamDatePart(d.toISOString().split("T")[0]);
  };

  // Computed ISO DateTime
  const computedDateTime = useMemo(() => {
    if (!examDatePart) return "";
    let timeStr = customTime;
    if (selectedSlotId !== "custom") {
      const slot = STANDARD_SLOTS.find((s) => s.id === selectedSlotId);
      if (slot) timeStr = slot.time;
    }
    return `${examDatePart}T${timeStr}:00`;
  }, [examDatePart, selectedSlotId, customTime]);

  // Conflict detection
  const conflictInfo = useMemo(() => {
    if (!examDatePart || !newExam.batch) return null;
    return examData.find((ex) => {
      if (editingExamId && ex._id === editingExamId) return false;
      const exDay = ex.date ? new Date(ex.date).toISOString().split("T")[0] : "";
      const sameBatch = ex.batch === newExam.batch || newExam.batch === "all" || ex.batch === "all";
      return exDay === examDatePart && sameBatch;
    });
  }, [examDatePart, newExam.batch, examData, editingExamId]);

  // Submit Exam (single or multi-rapid)
  const handleSubmitExam = async (andAddNext = false) => {
    if (!newExam.subjectName || !newExam.subjectCode || !examDatePart) {
      toast.error("Please provide Subject Name, Subject Code, and Exam Date.");
      return;
    }

    const payload = {
      ...newExam,
      date: computedDateTime,
    };

    setSubmittingExam(true);
    try {
      if (editingExamId) {
        await axios.put(`${BACKEND_URL}api/v1/exam/${editingExamId}`, payload);
        toast.success(`Exam schedule updated for ${newExam.subjectName}!`);
      } else {
        await axios.post(`${BACKEND_URL}api/v1/exam`, payload);
        toast.success(`Exam scheduled for ${newExam.subjectName}!`);
      }

      fetchExams();

      if (andAddNext) {
        // Multi-paper rapid mode: Advance date by 2 days, keep batch and venue, clear subject
        const currDate = new Date(examDatePart);
        currDate.setDate(currDate.getDate() + 2);
        setExamDatePart(currDate.toISOString().split("T")[0]);
        setNewExam((prev) => ({
          ...prev,
          subjectName: "",
          subjectCode: "",
        }));
        setEditingExamId(null);
        toast.info("Ready for next paper! Date advanced by 2 days.");
      } else {
        setIsExamModalOpen(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to schedule exam.");
    } finally {
      setSubmittingExam(false);
    }
  };

  const handleSaveResult = async (e) => {
    e.preventDefault();
    if (!newResult.rollno || !newResult.name) {
      toast.error("Please provide student Roll Number and Name.");
      return;
    }

    const intMark = Number(newResult.internal) || 0;
    const midMark = Number(newResult.midTerm) || 0;
    const endMark = Number(newResult.endTerm) || 0;
    const total = intMark + midMark + endMark;

    try {
      const payload = {
        studentRollno: newResult.rollno.trim().toUpperCase(),
        studentName: newResult.name.trim(),
        subjectName: newResult.subject,
        subjectCode: newResult.code || "EXAM",
        marksObtained: total,
        totalMarks: 100,
        remarks: `Internal: ${intMark}, Mid: ${midMark}, End: ${endMark}`,
      };

      const res = await axios.post(`${BACKEND_URL}api/v1/results`, payload, {
        withCredentials: true,
      });

      if (res.data?.success) {
        toast.success(`Academic result logged for ${newResult.name}!`);
        setIsResultModalOpen(false);
        fetchResults();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to record student result");
    }
  };

  // Filtered exams
  const filteredExams = useMemo(() => {
    return examData.filter((ex) => {
      if (filterBatch !== "all" && ex.batch && ex.batch !== filterBatch) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          ex.subjectName?.toLowerCase().includes(q) ||
          ex.subjectCode?.toLowerCase().includes(q) ||
          ex.batch?.toLowerCase().includes(q) ||
          ex.description?.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [examData, filterBatch, searchQuery]);

  // Filtered results
  const filteredResults = useMemo(() => {
    return resultsList.filter((res) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const roll = (res.studentRollno || res.rollno || "").toLowerCase();
        const name = (res.studentName || res.name || "").toLowerCase();
        const sub = (res.subjectName || res.subject || "").toLowerCase();
        if (!roll.includes(q) && !name.includes(q) && !sub.includes(q)) return false;
      }
      return true;
    });
  }, [resultsList, searchQuery]);

  // Helper for exam card time status
  const getExamTiming = (dateStr) => {
    if (!dateStr) return { date: "TBD", time: "10:00 AM", status: "Upcoming", color: "#0f766e" };
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const dateFormatted = `${day}/${month}/${year}`;
    const timeFormatted = d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const now = new Date();
    const diffDays = Math.ceil((d - now) / (1000 * 60 * 60 * 24));

    let status = "Upcoming";
    let color = "#0f766e";

    if (diffDays < 0) {
      status = "Concluded";
      color = "#64748b";
    } else if (diffDays === 0) {
      status = "Today";
      color = "#10b981";
    } else if (diffDays === 1) {
      status = "Tomorrow";
      color = "#f59e0b";
    } else if (diffDays <= 7) {
      status = `In ${diffDays}d`;
      color = "#2563eb";
    }

    return { date: dateFormatted, time: timeFormatted, status, color };
  };

  return (
    <>
      <Container>
        <AdminSidebar />
        <Content>
          <Header>
            <div className="title-group">
              <h1>
                <BsCalendarPlus style={{ color: "#0f766e" }} /> Examinations & Academic Results
              </h1>
              <p>
                Effortless examination scheduler, conflict-free datesheet builder, and grading registry.
              </p>
            </div>
            <div className="action-buttons">
              {activeTab === "schedules" ? (
                <PrimaryButton onClick={openNewExamModal}>
                  <BsLightningFill /> Quick Schedule Exam
                </PrimaryButton>
              ) : (
                <PrimaryButton onClick={() => setIsResultModalOpen(true)}>
                  ➕ Record Student Result
                </PrimaryButton>
              )}
            </div>
          </Header>

          {/* Navigation Tabs */}
          <TabBar>
            <TabItem
              $active={activeTab === "schedules"}
              onClick={() => setActiveTab("schedules")}
            >
              📅 Examination Schedules ({examData.length})
            </TabItem>
            <TabItem
              $active={activeTab === "results"}
              onClick={() => setActiveTab("results")}
            >
              🏆 Grading & Results Registry ({resultsList.length})
            </TabItem>
          </TabBar>

          {/* Stats Overview */}
          <StatsGrid>
            <StatCard $bg="#f0fdf4" $color="#0f766e">
              <div className="icon-wrap">📝</div>
              <div className="info">
                <div className="label">Scheduled Papers</div>
                <div className="value">{examData.length} Exams</div>
              </div>
            </StatCard>
            <StatCard $bg="#eff6ff" $color="#2563eb">
              <div className="icon-wrap">🎓</div>
              <div className="info">
                <div className="label">Evaluated Students</div>
                <div className="value">{resultsList.length} Records</div>
              </div>
            </StatCard>
            <StatCard $bg="#fef3c7" $color="#d97706">
              <div className="icon-wrap">⭐</div>
              <div className="info">
                <div className="label">Distinction Rate</div>
                <div className="value">
                  {resultsList.length > 0
                    ? `${Math.round(
                        (resultsList.filter((r) => r.grade === "O" || r.grade === "A+").length /
                          resultsList.length) *
                          100
                      )}%`
                    : "0%"}
                </div>
              </div>
            </StatCard>
            <StatCard $bg="#fdf2f8" $color="#db2777">
              <div className="icon-wrap">🏛️</div>
              <div className="info">
                <div className="label">Department</div>
                <div className="value">Computer Science</div>
              </div>
            </StatCard>
          </StatsGrid>

          {/* Search & Filter Bar */}
          <FilterCard>
            <FilterGroup style={{ flex: 1, minWidth: "220px" }}>
              <label>Search:</label>
              <input
                type="text"
                placeholder={
                  activeTab === "schedules"
                    ? "Search subject, code, venue, or batch..."
                    : "Search student roll no, name, or subject..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </FilterGroup>

            {activeTab === "schedules" && (
              <FilterGroup>
                <label>Batch:</label>
                <select
                  value={filterBatch}
                  onChange={(e) => setFilterBatch(e.target.value)}
                >
                  <option value="all">All Batches</option>
                  {allAvailableBatches.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </FilterGroup>
            )}
          </FilterCard>

          {/* TAB 1: EXAM SCHEDULES */}
          {activeTab === "schedules" && (
            <>
              {loading ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                  Loading examination schedules...
                </div>
              ) : filteredExams.length > 0 ? (
                <ExamGrid>
                  {filteredExams.map((exam, idx) => {
                    const timing = getExamTiming(exam.date);
                    return (
                      <ExamCard key={exam._id || idx} $statusColor={timing.color}>
                        <div>
                          <div className="card-top">
                            <div className="tag-cluster">
                              <span className="code-badge">{exam.subjectCode || "EXAM-101"}</span>
                              <span className="batch-badge">{exam.batch || "All Batches"}</span>
                            </div>
                            <span className="time-status" style={{ background: timing.color }}>
                              {timing.status}
                            </span>
                          </div>

                          <div className="subject-name">{exam.subjectName}</div>

                          <div className="meta-list">
                            <div className="item">
                              <BsCalendarPlus style={{ color: "#0f766e" }} />
                              <strong>{timing.date}</strong>
                              <span style={{ color: "#cbd5e1" }}>•</span>
                              <BsClock style={{ color: "#64748b" }} />
                              <span>{timing.time}</span>
                            </div>
                          </div>

                          {exam.description && (
                            <div className="instructions">
                              <strong>📍 Venue & Details:</strong> {exam.description}
                            </div>
                          )}

                          {exam.targetEmails && exam.targetEmails.length > 0 && (
                            <div className="target-badge">
                              🎯 Targeted Cohort ({exam.targetEmails.length} students)
                            </div>
                          )}
                        </div>

                        {/* Quick card action buttons: Clone, Edit, Delete */}
                        <div className="card-actions">
                          <button
                            type="button"
                            className="clone-btn"
                            onClick={() => handleCloneExam(exam)}
                            title="Clone batch, venue & rules to quickly schedule next paper"
                          >
                            <BsCopy /> Clone Next
                          </button>
                          <button
                            type="button"
                            className="edit-btn"
                            onClick={() => handleEditExam(exam)}
                            title="Edit this examination schedule"
                          >
                            <BsPencilSquare /> Edit
                          </button>
                          <button
                            type="button"
                            className="del-btn"
                            onClick={() => handleDeleteExam(exam._id, exam.subjectName)}
                            title="Delete this examination schedule"
                          >
                            <BsTrash />
                          </button>
                        </div>
                      </ExamCard>
                    );
                  })}
                </ExamGrid>
              ) : (
                <div
                  style={{
                    background: "white",
                    border: "1px dashed #cbd5e1",
                    borderRadius: "12px",
                    padding: "48px 24px",
                    textAlign: "center",
                    color: "#64748b",
                  }}
                >
                  <div style={{ fontSize: "36px", marginBottom: "10px" }}>📅</div>
                  <h3 style={{ margin: "0 0 6px 0", color: "#1e293b" }}>No Scheduled Exams Found</h3>
                  <p style={{ margin: "0 0 16px 0", fontSize: "14px" }}>
                    Schedule your first examination in seconds using pre-filled course templates.
                  </p>
                  <PrimaryButton onClick={openNewExamModal}>
                    <BsLightningFill /> Quick Schedule Exam
                  </PrimaryButton>
                </div>
              )}
            </>
          )}

          {/* TAB 2: RESULTS REGISTRY */}
          {activeTab === "results" && (
            <TableWrapper>
              <DataTable>
                <thead>
                  <tr>
                    <th>Roll Number</th>
                    <th>Student Name</th>
                    <th>Subject & Code</th>
                    <th>Internal (30)</th>
                    <th>Mid-Term (20)</th>
                    <th>End-Term (50)</th>
                    <th>Total (100)</th>
                    <th>Grade</th>
                    <th>SGPA</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.length > 0 ? (
                    filteredResults.map((r) => {
                      const totalMarks = r.marksObtained !== undefined ? r.marksObtained : r.total;
                      const gpa = r.gradePoints !== undefined ? r.gradePoints : (r.sgpa || 0);
                      const isPass = r.grade !== "F";
                      return (
                        <tr key={r._id || r.id}>
                          <td style={{ fontWeight: 800, color: "#0f766e" }}>{r.studentRollno || r.rollno}</td>
                          <td style={{ fontWeight: 700 }}>{r.studentName || r.name}</td>
                          <td>
                            <div>{r.subjectName || r.subject}</div>
                            <div style={{ fontSize: "11px", color: "#64748b" }}>{r.subjectCode || r.code}</div>
                          </td>
                          <td>{r.internal ?? "—"}</td>
                          <td>{r.midTerm ?? "—"}</td>
                          <td>{r.endTerm ?? "—"}</td>
                          <td style={{ fontWeight: 800 }}>{totalMarks}</td>
                          <td>
                            <GradeBadge $grade={r.grade}>{r.grade}</GradeBadge>
                          </td>
                          <td style={{ fontWeight: 700, color: "#0f172a" }}>{Number(gpa).toFixed(1)}</td>
                          <td>
                            <StatusPill $pass={isPass}>{isPass ? "Pass" : "Arrear"}</StatusPill>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="10" style={{ textAlign: "center", padding: "36px", color: "#64748b" }}>
                        No results records found. Click "➕ Record Student Result" to log marks.
                      </td>
                    </tr>
                  )}
                </tbody>
              </DataTable>
            </TableWrapper>
          )}

          {/* SMART EXAM SCHEDULER MODAL (Easy, fast, 1-click presets & conflict-free) */}
          {isExamModalOpen && (
            <ModalOverlay>
              <ModalBox>
                <ModalHeader>
                  <div className="header-left">
                    <h3>
                      <BsLightningFill style={{ color: "#0f766e" }} />
                      {editingExamId ? "Edit Examination Schedule" : "Smart Examination Scheduler"}
                    </h3>
                    <p>
                      {editingExamId
                        ? "Update exam dates, venues, or cohort instructions"
                        : "Pick a subject preset, time slot, and venue for 1-click scheduling"}
                    </p>
                  </div>
                  <button type="button" onClick={() => setIsExamModalOpen(false)}>
                    <BsX />
                  </button>
                </ModalHeader>

                {/* Conflict warning if same batch has exam on same day */}
                {conflictInfo && (
                  <ConflictAlert>
                    <BsExclamationTriangleFill />
                    <div>
                      <strong>Date Conflict Warning:</strong> {conflictInfo.batch} already has an exam scheduled for{" "}
                      <strong>{conflictInfo.subjectName}</strong> ({conflictInfo.subjectCode}) on this date!
                    </div>
                  </ConflictAlert>
                )}

                {/* 1-CLICK POPULAR SUBJECT PRESETS */}
                <PresetsSection>
                  <div className="preset-title">
                    <span>⚡ Quick Course Presets (Click to auto-fill)</span>
                    <span style={{ fontSize: "11px", color: "#94a3b8" }}>1-Click Fill</span>
                  </div>
                  <div className="preset-chips">
                    {allCoursePresets.map((course) => {
                      const isActive =
                        newExam.subjectName === course.name && newExam.subjectCode === course.code;
                      return (
                        <CourseChip
                          key={course.code + course.name}
                          type="button"
                          $active={isActive}
                          onClick={() => handleSelectCourse(course)}
                        >
                          <span className="code-pill">{course.code}</span>
                          <span>{course.name}</span>
                        </CourseChip>
                      );
                    })}
                  </div>
                </PresetsSection>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmitExam(false);
                  }}
                >
                  <FormGrid>
                    <FormGroup>
                      <label>Course / Subject Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Data Structures & Algorithms"
                        value={newExam.subjectName}
                        onChange={(e) => setNewExam({ ...newExam, subjectName: e.target.value })}
                        required
                      />
                    </FormGroup>

                    <FormGroup>
                      <label>Subject Code *</label>
                      <input
                        type="text"
                        placeholder="e.g. CS-301"
                        value={newExam.subjectCode}
                        onChange={(e) => setNewExam({ ...newExam, subjectCode: e.target.value })}
                        required
                      />
                    </FormGroup>

                    <FormGroup>
                      <label>Target Academic Batch *</label>
                      <select
                        value={newExam.batch}
                        onChange={(e) => setNewExam({ ...newExam, batch: e.target.value })}
                        required
                      >
                        {allAvailableBatches.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                        <option value="all">All Batches</option>
                      </select>
                    </FormGroup>

                    <FormGroup>
                      <label>
                        Exam Date *
                        <span className="hint">
                          <button
                            type="button"
                            onClick={() => handleSetDateOffset(1)}
                            style={{ border: "none", background: "none", color: "#0f766e", cursor: "pointer", fontSize: "11px", textDecoration: "underline", marginRight: "6px" }}
                          >
                            Tomorrow
                          </button>
                          <button
                            type="button"
                            onClick={handleSetNextMonday}
                            style={{ border: "none", background: "none", color: "#0f766e", cursor: "pointer", fontSize: "11px", textDecoration: "underline" }}
                          >
                            Next Mon
                          </button>
                        </span>
                      </label>
                      <input
                        type="date"
                        value={examDatePart}
                        onChange={(e) => setExamDatePart(e.target.value)}
                        required
                      />
                    </FormGroup>
                  </FormGrid>

                  {/* 1-CLICK TIME SESSION SLOTS */}
                  <FormGroup style={{ marginBottom: "16px" }}>
                    <label>Exam Session & Slot</label>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {STANDARD_SLOTS.map((slot) => (
                        <SlotButton
                          key={slot.id}
                          type="button"
                          $active={selectedSlotId === slot.id}
                          onClick={() => setSelectedSlotId(slot.id)}
                        >
                          <span className="slot-label">{slot.label}</span>
                          <span className="slot-time">{slot.info}</span>
                        </SlotButton>
                      ))}
                      <SlotButton
                        type="button"
                        $active={selectedSlotId === "custom"}
                        onClick={() => setSelectedSlotId("custom")}
                      >
                        <span className="slot-label">Custom Time</span>
                        <span className="slot-time">Pick manual hour</span>
                      </SlotButton>
                    </div>

                    {selectedSlotId === "custom" && (
                      <div style={{ marginTop: "8px" }}>
                        <input
                          type="time"
                          value={customTime}
                          onChange={(e) => setCustomTime(e.target.value)}
                          required
                        />
                      </div>
                    )}
                  </FormGroup>

                  {/* VENUE QUICK PICKS */}
                  <FormGroup style={{ marginBottom: "16px" }}>
                    <label>
                      Venue & Examination Room
                      <span className="hint">Click to insert</span>
                    </label>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "8px" }}>
                      {STANDARD_VENUES.map((venue) => (
                        <TagChip
                          key={venue}
                          type="button"
                          $active={newExam.description.includes(venue)}
                          onClick={() => handleInsertVenue(venue)}
                        >
                          <BsGeoAlt /> {venue}
                        </TagChip>
                      ))}
                    </div>
                  </FormGroup>

                  {/* GUIDELINES & INSTRUCTIONS QUICK TEMPLATES */}
                  <FormGroup style={{ marginBottom: "16px" }}>
                    <label>
                      Standard Guidelines & Rules
                      <span className="hint">Click to toggle template</span>
                    </label>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "8px" }}>
                      {STANDARD_RULES.map((rule) => {
                        const isIncluded = newExam.description.includes(rule);
                        return (
                          <TagChip
                            key={rule}
                            type="button"
                            $active={isIncluded}
                            onClick={() => handleToggleRule(rule)}
                          >
                            <BsShieldCheck /> {rule}
                          </TagChip>
                        );
                      })}
                    </div>
                    <textarea
                      rows={3}
                      placeholder="e.g. Exam Hall 1 (Block A) | Physical Student ID Card Mandatory"
                      value={newExam.description}
                      onChange={(e) => setNewExam({ ...newExam, description: e.target.value })}
                    />
                  </FormGroup>

                  <FormGroup style={{ marginBottom: "20px" }}>
                    <label>Target Student Emails (Optional - leave blank for whole batch)</label>
                    <input
                      type="text"
                      placeholder="e.g. student1@campus.com, student2@campus.com"
                      value={newExam.targetEmails}
                      onChange={(e) => setNewExam({ ...newExam, targetEmails: e.target.value })}
                    />
                  </FormGroup>

                  {/* ACTION BUTTONS WITH MULTI-PAPER RAPID BUILDER */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                    <SecondaryButton type="button" onClick={() => setIsExamModalOpen(false)}>
                      Cancel
                    </SecondaryButton>

                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                      {!editingExamId && (
                        <button
                          type="button"
                          disabled={submittingExam}
                          onClick={() => handleSubmitExam(true)}
                          style={{
                            background: "#0284c7",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            padding: "10px 16px",
                            fontSize: "13px",
                            fontWeight: 700,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                          title="Saves this exam and automatically advances date by 2 days for the next paper"
                        >
                          <BsLightningFill /> Schedule & Add Next Paper
                        </button>
                      )}

                      <PrimaryButton type="submit" disabled={submittingExam}>
                        {submittingExam ? "Saving..." : editingExamId ? "✓ Update Exam" : "✓ Publish Examination"}
                      </PrimaryButton>
                    </div>
                  </div>
                </form>
              </ModalBox>
            </ModalOverlay>
          )}

          {/* MODAL 2: ADD RESULT ENTRY */}
          {isResultModalOpen && (
            <ModalOverlay>
              <ModalBox>
                <ModalHeader>
                  <div className="header-left">
                    <h3>➕ Record Academic Result</h3>
                    <p>Log student grades and internal marks</p>
                  </div>
                  <button type="button" onClick={() => setIsResultModalOpen(false)}>
                    <BsX />
                  </button>
                </ModalHeader>

                <form onSubmit={handleSaveResult}>
                  <FormGrid>
                    <FormGroup>
                      <label>Student Roll Number *</label>
                      <input
                        type="text"
                        placeholder="e.g. CS2024007"
                        value={newResult.rollno}
                        onChange={(e) => setNewResult({ ...newResult, rollno: e.target.value })}
                        required
                      />
                    </FormGroup>

                    <FormGroup>
                      <label>Student Full Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Aryan Malhotra"
                        value={newResult.name}
                        onChange={(e) => setNewResult({ ...newResult, name: e.target.value })}
                        required
                      />
                    </FormGroup>

                    <FormGroup>
                      <label>Course / Subject *</label>
                      <input
                        type="text"
                        value={newResult.subject}
                        onChange={(e) => setNewResult({ ...newResult, subject: e.target.value })}
                        required
                      />
                    </FormGroup>

                    <FormGroup>
                      <label>Subject Code</label>
                      <input
                        type="text"
                        value={newResult.code}
                        onChange={(e) => setNewResult({ ...newResult, code: e.target.value })}
                        required
                      />
                    </FormGroup>

                    <FormGroup>
                      <label>Internal Assessment (Max 30)</label>
                      <input
                        type="number"
                        min="0"
                        max="30"
                        value={newResult.internal}
                        onChange={(e) => setNewResult({ ...newResult, internal: e.target.value })}
                        required
                      />
                    </FormGroup>

                    <FormGroup>
                      <label>Mid-Term Exam (Max 20)</label>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        value={newResult.midTerm}
                        onChange={(e) => setNewResult({ ...newResult, midTerm: e.target.value })}
                        required
                      />
                    </FormGroup>

                    <FormGroup>
                      <label>End-Term Examination (Max 50)</label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={newResult.endTerm}
                        onChange={(e) => setNewResult({ ...newResult, endTerm: e.target.value })}
                        required
                      />
                    </FormGroup>
                  </FormGrid>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                    <SecondaryButton type="button" onClick={() => setIsResultModalOpen(false)}>
                      Cancel
                    </SecondaryButton>
                    <PrimaryButton type="submit">✓ Log Academic Score</PrimaryButton>
                  </div>
                </form>
              </ModalBox>
            </ModalOverlay>
          )}
        </Content>
      </Container>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
};

export default AdminExam;