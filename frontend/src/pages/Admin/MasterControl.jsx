import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import axios from "axios";
import Cookies from "js-cookie";
import { ToastContainer, toast } from "react-toastify";
import { BACKEND_URL } from "../../constants/url";
import QuickVaultNotes from "../../components/Admin/QuickVaultNotes";
import IpSecurityCenter from "../../components/Admin/IpSecurityCenter";
import {
  BsShieldLock,
  BsShieldCheck,
  BsPeople,
  BsPersonBadge,
  BsKey,
  BsEye,
  BsEyeSlash,
  BsPencilSquare,
  BsTrash,
  BsSliders,
  BsToggleOn,
  BsToggleOff,
  BsCheckCircleFill,
  BsClipboard,
  BsSearch,
  BsBuilding,
  BsBook,
  BsCalendarEvent,
  BsCashCoin,
  BsGrid3X3GapFill,
  BsArrowRightShort,
  BsShieldShaded,
} from "react-icons/bs";

const SUPER_ADMIN_EMAIL = "admin@campus-sync.com";

// Main layout container: exactly 286px padding-left aligns flush with 250px sidebar (36px gutter)
const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 32px 40px;
  padding-left: 286px;
  min-height: 100vh;
  background-color: #f8fafc;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  box-sizing: border-box;

  @media screen and (max-width: 900px) {
    padding-left: 20px;
    padding-right: 20px;
  }
`;

const Content = styled.div`
  width: 100%;
  max-width: 1350px;
  margin: 0 auto;
`;

const TopHeaderBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 20px;
  background: #ffffff;
  padding: 22px 28px;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.04);
`;

const TitleSection = styled.div`
  .super-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #ecfdf5;
    color: #059669;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    padding: 3px 10px;
    border-radius: 20px;
    border: 1px solid #a7f3d0;
    margin-bottom: 8px;
  }

  h1 {
    font-size: 24px;
    font-weight: 800;
    color: #0f172a;
    margin: 0 0 4px 0;
    display: flex;
    align-items: center;
    gap: 10px;
    letter-spacing: -0.3px;
  }

  p {
    font-size: 13px;
    color: #64748b;
    margin: 0;
    font-weight: 500;
  }
`;

const ControlsGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
`;

// Simple modern ON/OFF switch container
const ToggleControlCard = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 8px 16px;
  border-radius: 12px;

  .label-box {
    display: flex;
    flex-direction: column;

    .title {
      font-size: 12px;
      font-weight: 700;
      color: #1e293b;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }

    .status-text {
      font-size: 11px;
      font-weight: 600;
      color: ${(props) => (props.$active ? "#059669" : "#dc2626")};
    }
  }
`;

const ToggleSwitch = styled.button`
  width: 52px;
  height: 28px;
  border-radius: 16px;
  background-color: ${(props) => (props.$active ? "#10b981" : "#94a3b8")};
  border: none;
  cursor: pointer;
  position: relative;
  transition: background-color 0.25s ease;
  outline: none;
  padding: 0;
  display: flex;
  align-items: center;

  .thumb {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background-color: #ffffff;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    transform: ${(props) => (props.$active ? "translateX(26px)" : "translateX(3px)")};
    transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
`;

const SecretKeyPill = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  padding: 8px 14px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  color: #334155;

  strong {
    color: #0f172a;
    font-family: monospace;
    font-size: 14px;
    background: #ffffff;
    padding: 2px 6px;
    border-radius: 4px;
    border: 1px solid #e2e8f0;
  }

  button {
    background: none;
    border: none;
    color: #64748b;
    cursor: pointer;
    padding: 2px;
    display: flex;
    align-items: center;
    transition: color 0.15s;

    &:hover {
      color: #0f172a;
    }
  }
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const MetricCard = styled.div`
  background: #ffffff;
  padding: 18px 22px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
  border: 1px solid #e2e8f0;
  border-top: 4px solid ${(props) => props.$color || "#1abc9c"};

  .label {
    font-size: 12px;
    color: #64748b;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .value {
    font-size: 28px;
    font-weight: 800;
    color: #0f172a;
    margin-top: 4px;
  }

  .sub {
    font-size: 11px;
    color: #94a3b8;
    margin-top: 4px;
  }
`;


const FilterSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
  flex-wrap: wrap;
  gap: 14px;
`;

const CategoryPills = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`;

const CategoryPill = styled.button`
  background: ${(props) => (props.$active ? "#0f172a" : "#ffffff")};
  color: ${(props) => (props.$active ? "#ffffff" : "#475569")};
  border: 1px solid ${(props) => (props.$active ? "#0f172a" : "#cbd5e1")};
  padding: 7px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    border-color: #0f172a;
  }
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 8px 14px;
  min-width: 280px;

  input {
    border: none;
    outline: none;
    font-size: 13px;
    width: 100%;
    color: #1e293b;
    background: transparent;

    &::placeholder {
      color: #94a3b8;
    }
  }

  svg {
    color: #94a3b8;
  }
`;

const TableCard = styled.div`
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.03);
  overflow-x: auto;
`;

const PaginationBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  flex-wrap: wrap;
  gap: 12px;

  .slice-info {
    font-size: 13px;
    color: #64748b;
    strong {
      color: #0f172a;
    }
  }

  .slice-controls {
    display: flex;
    align-items: center;
    gap: 6px;
  }
`;

const SliceBtn = styled.button`
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid ${(props) => (props.$active ? "#0f172a" : "#cbd5e1")};
  background: ${(props) => (props.$active ? "#0f172a" : "#ffffff")};
  color: ${(props) => (props.$active ? "#ffffff" : "#334155")};
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  opacity: ${(props) => (props.disabled ? 0.45 : 1)};
  transition: all 0.15s ease;

  &:hover:not(:disabled) {
    background: ${(props) => (props.$active ? "#0f172a" : "#f1f5f9")};
    border-color: ${(props) => (props.$active ? "#0f172a" : "#94a3b8")};
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 13px;

  th {
    background: #f8fafc;
    color: #475569;
    font-weight: 700;
    padding: 14px 18px;
    border-bottom: 1px solid #e2e8f0;
    text-transform: uppercase;
    font-size: 11px;
    letter-spacing: 0.5px;
    white-space: nowrap;
  }

  td {
    padding: 14px 18px;
    border-bottom: 1px solid #f1f5f9;
    color: #1e293b;
    vertical-align: middle;
  }

  tr:hover td {
    background: #fbfcfe;
  }
`;

const RoleBadge = styled.span`
  display: inline-block;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  background: ${(props) => {
    switch (props.$category) {
      case "admin":
        return "#ecfdf5";
      case "teacher":
        return "#eff6ff";
      case "student":
        return "#f5f3ff";
      default:
        return "#f1f5f9";
    }
  }};
  color: ${(props) => {
    switch (props.$category) {
      case "admin":
        return "#059669";
      case "teacher":
        return "#2563eb";
      case "student":
        return "#7c3aed";
      default:
        return "#475569";
    }
  }};
  border: 1px solid
    ${(props) => {
    switch (props.$category) {
      case "admin":
        return "#a7f3d0";
      case "teacher":
        return "#bfdbfe";
      case "student":
        return "#ddd6fe";
      default:
        return "#cbd5e1";
    }
  }};
`;

const ResponsibilityTag = styled.span`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  background: #fef3c7;
  color: #b45309;
  border: 1px solid #fde68a;
  margin-top: 3px;
`;

const PasswordBox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  .pass-text {
    font-family: monospace;
    font-size: 13px;
    background: #f1f5f9;
    padding: 3px 8px;
    border-radius: 6px;
    color: #0f172a;
    font-weight: 600;
    min-width: 90px;
  }

  .icon-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    color: #64748b;
    display: flex;
    align-items: center;
    border-radius: 4px;
    transition: all 0.15s;

    &:hover {
      background: #e2e8f0;
      color: #0f172a;
    }
  }

  .reset-btn {
    background: #f1f5f9;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 700;
    color: #334155;
    padding: 4px 8px;
    cursor: pointer;
    transition: all 0.15s;

    &:hover {
      background: #e2e8f0;
      color: #0f172a;
    }
  }
`;

const ActionBtn = styled.button`
  background: ${(props) => {
    if (props.$danger) return "#fee2e2";
    if (props.$restrict) return "#fef3c7";
    if (props.$unrestrict) return "#dcfce7";
    return "#f1f5f9";
  }};
  color: ${(props) => {
    if (props.$danger) return "#b91c1c";
    if (props.$restrict) return "#b45309";
    if (props.$unrestrict) return "#15803d";
    return "#334155";
  }};
  border: 1px solid ${(props) => {
    if (props.$danger) return "#fecaca";
    if (props.$restrict) return "#fde68a";
    if (props.$unrestrict) return "#bbf7d0";
    return "#cbd5e1";
  }};
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  transition: all 0.15s ease;

  &:hover {
    background: ${(props) => {
    if (props.$danger) return "#fecaca";
    if (props.$restrict) return "#fde68a";
    if (props.$unrestrict) return "#bbf7d0";
    return "#e2e8f0";
  }};
  }
`;

// Matrix styling for Role Sidebar Access
const MatrixCard = styled.div`
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  padding: 24px 28px;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.03);
`;

const MatrixHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 14px;

  h3 {
    font-size: 18px;
    font-weight: 700;
    color: #0f172a;
    margin: 0;
  }

  p {
    font-size: 13px;
    color: #64748b;
    margin: 4px 0 0 0;
  }
`;

const MatrixTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;

  th {
    background: #f8fafc;
    color: #475569;
    font-weight: 700;
    padding: 12px 14px;
    border-bottom: 1px solid #e2e8f0;
    text-align: center;
    font-size: 11px;
    text-transform: uppercase;

    &:first-child {
      text-align: left;
    }
  }

  td {
    padding: 14px;
    border-bottom: 1px solid #f1f5f9;
    text-align: center;
    vertical-align: middle;

    &:first-child {
      text-align: left;
      font-weight: 700;
      color: #0f172a;
    }
  }

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
    accent-color: #10b981;
  }
`;

const PrimarySaveButton = styled.button`
  background: #10b981;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 11px 22px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;

  &:hover {
    background: #059669;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

// Modal overlay & box
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
  z-index: 10000;
`;

const ModalBox = styled.div`
  background: #ffffff;
  border-radius: 14px;
  padding: 26px 30px;
  width: 90%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
  border: 1px solid #e2e8f0;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;

  label {
    font-size: 12px;
    font-weight: 700;
    color: #475569;
    text-transform: uppercase;
  }

  input,
  select {
    padding: 10px 12px;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    font-size: 13px;
    outline: none;
    color: #0f172a;

    &:focus {
      border-color: #10b981;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
    }
  }
`;

const MasterControl = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Active workspace dynamically synced with URL search param (?tab=overview|users|ipSecurity|matrix|security|feeRates)
  const activeTab = searchParams.get("tab") || "overview";
  const [loading, setLoading] = useState(true);
  const [usersData, setUsersData] = useState({
    admins: [],
    teachers: [],
    students: [],
    counts: { totalAdmins: 0, totalTeachers: 0, totalStudents: 0, totalUsers: 0 },
  });

  // Global OTP Switch & Settings State
  const [otpBypassActive, setOtpBypassActive] = useState(false);
  const [secretOtpCode, setSecretOtpCode] = useState("454545");
  const [sessionTimeoutDays, setSessionTimeoutDays] = useState(7);
  const [sessionTimeoutUnit, setSessionTimeoutUnit] = useState("days"); // "hours" | "days"
  const [sessionTimeoutValue, setSessionTimeoutValue] = useState(7);
  const [updatingOtpSwitch, setUpdatingOtpSwitch] = useState(false);
  const [resettingRateLimit, setResettingRateLimit] = useState(false);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState(() => searchParams.get("cat") || "all");
  const [searchQuery, setSearchQuery] = useState("");
  const [userPage, setUserPage] = useState(1);
  const userPageSize = 10;

  // Sync category if URL parameter specifies ?cat=
  useEffect(() => {
    const cat = searchParams.get("cat");
    if (cat) {
      setSelectedCategory(cat);
    }
  }, [searchParams]);

  // Direct Password Reset Modal State
  const [resetModalUser, setResetModalUser] = useState(null);
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [resettingPassword, setResettingPassword] = useState(false);

  // Edit User Modal State
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);

  // Role Sidebar Matrix State
  const defaultMatrix = {
    Administrator: {
      dashboard: true,
      users: true,
      users_studentsDir: true,
      users_facultyDir: true,
      users_registerStudent: true,
      users_registerFaculty: true,
      users_registerAdmin: true,
      academics: true,
      academics_attendance: true,
      academics_exams: true,
      academics_assignments: true,
      academics_classes: true,
      services: true,
      services_accountsFees: true,
      services_library: true,
      services_events: true,
      services_announcements: true,
      settings: true,
    },
    AccountsOfficer: {
      dashboard: true,
      users: true,
      users_studentsDir: true,
      users_facultyDir: true,
      users_registerStudent: false, // Accounts department explicitly cannot register any of the 3 roles
      users_registerFaculty: false,
      users_registerAdmin: false,
      academics: false, // Accounts department explicitly does not watch attendance, assignments, exams, classes
      academics_attendance: false,
      academics_exams: false,
      academics_assignments: false,
      academics_classes: false,
      services: true,
      services_accountsFees: true,
      services_library: false,
      services_events: false,
      services_announcements: true,
      settings: true,
    },
    StudentRegistrar: {
      dashboard: true,
      users: true,
      users_studentsDir: true,
      users_facultyDir: true,
      users_registerStudent: true,
      users_registerFaculty: false,
      users_registerAdmin: false,
      academics: false,
      academics_attendance: false,
      academics_exams: false,
      academics_assignments: false,
      academics_classes: false,
      services: true,
      services_accountsFees: false,
      services_library: false,
      services_events: false,
      services_announcements: true,
      settings: true,
    },
    ExamController: {
      dashboard: true,
      users: false,
      users_studentsDir: false,
      users_facultyDir: false,
      users_registerStudent: false,
      users_registerFaculty: false,
      users_registerAdmin: false,
      academics: true,
      academics_attendance: true,
      academics_exams: true,
      academics_assignments: false,
      academics_classes: false,
      services: true,
      services_accountsFees: false,
      services_library: false,
      services_events: false,
      services_announcements: true,
      settings: true,
    },
    Teacher: {
      dashboard: true,
      users: true,
      users_studentsDir: true,
      users_facultyDir: false,
      users_registerStudent: false,
      users_registerFaculty: false,
      users_registerAdmin: false,
      academics: true,
      academics_attendance: true,
      academics_exams: true,
      academics_assignments: true,
      academics_classes: true,
      services: true,
      services_accountsFees: false,
      services_library: false,
      services_events: false,
      services_announcements: true,
      settings: true,
    },
    Librarian: {
      dashboard: true,
      users: false,
      users_studentsDir: false,
      users_facultyDir: false,
      users_registerStudent: false,
      users_registerFaculty: false,
      users_registerAdmin: false,
      academics: false,
      academics_attendance: false,
      academics_exams: false,
      academics_assignments: false,
      academics_classes: false,
      services: true,
      services_accountsFees: false,
      services_library: true,
      services_events: false,
      services_announcements: true,
      settings: true,
    },
    EventCoordinator: {
      dashboard: true,
      users: false,
      users_studentsDir: false,
      users_facultyDir: false,
      users_registerStudent: false,
      users_registerFaculty: false,
      users_registerAdmin: false,
      academics: false,
      academics_attendance: false,
      academics_exams: false,
      academics_assignments: false,
      academics_classes: false,
      services: true,
      services_accountsFees: false,
      services_library: false,
      services_events: true,
      services_announcements: true,
      settings: true,
    },
    Student: {
      dashboard: true,
      users: false,
      users_studentsDir: false,
      users_facultyDir: false,
      users_registerStudent: false,
      users_registerFaculty: false,
      users_registerAdmin: false,
      academics: true,
      academics_attendance: true,
      academics_exams: true,
      academics_assignments: true,
      academics_classes: true,
      services: true,
      services_accountsFees: true,
      services_library: true,
      services_events: true,
      services_announcements: true,
      settings: true,
    },
  };

  const [roleMatrix, setRoleMatrix] = useState(defaultMatrix);
  const [savingMatrix, setSavingMatrix] = useState(false);
  const [activeMatrixRole, setActiveMatrixRole] = useState("AccountsOfficer");
  const [matrixViewMode, setMatrixViewMode] = useState("roleDetail"); // "roleDetail" | "masterTable"

  // Batch Year options (2020 through 2030)
  const BATCH_YEARS = [
    "2020", "2021", "2022", "2023", "2024",
    "2025", "2026", "2027", "2028", "2029", "2030",
  ];

  const CAMPUS_DEPARTMENTS = [
    "Computer Science & Engineering",
    "Information Technology",
    "Electronics & Communication Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Electrical & Electronics Engineering",
    "Computer Applications",
    "Management Studies",
    "Commerce & Finance",
    "Biotechnology & Life Sciences",
    "Sciences & Mathematics",
    "Humanities & Social Sciences",
  ];

  const STANDARD_COURSES = [
    "B.Tech Computer Science",
    "B.Tech Artificial Intelligence & ML",
    "B.Tech Information Technology",
    "B.Tech Electronics & Communication",
    "B.Tech Mechanical Engineering",
    "B.Tech Civil Engineering",
    "M.Tech Computer Science",
    "M.Tech VLSI & Embedded Systems",
    "BCA Cloud Computing & Fullstack",
    "MCA Advanced Software Systems",
    "BBA Business Analytics",
    "MBA Finance & Marketing",
    "B.Sc Computer Science",
    "B.Sc Biotechnology",
    "M.Sc Data Science & Analytics",
    "B.Com Honours & Financial Markets",
    "M.Com Accounting & Finance",
  ];

  // Fee Rates Configuration State
  const [feeRates, setFeeRates] = useState({});
  const [lateFeeInput, setLateFeeInput] = useState(10);
  const [savingFeeRates, setSavingFeeRates] = useState(false);

  // New Degree & Batch Fee Structure Form State
  const [feeFormDept, setFeeFormDept] = useState("Computer Science & Engineering");
  const [feeFormCourse, setFeeFormCourse] = useState("B.Tech Computer Science");
  const [feeFormBatch, setFeeFormBatch] = useState("2024");
  const [feeFormYears, setFeeFormYears] = useState(4);
  const [feeFormSemesters, setFeeFormSemesters] = useState(8);
  const [feeFormRate, setFeeFormRate] = useState(45000);
  const [feeFormIsSplit, setFeeFormIsSplit] = useState(false);
  const [feeFormSemesterRates, setFeeFormSemesterRates] = useState({
    1: 45000, 2: 45000, 3: 45000, 4: 45000,
    5: 45000, 6: 45000, 7: 45000, 8: 45000,
  });
  const [feeFormStartMonth, setFeeFormStartMonth] = useState("July (Autumn Batch)");
  const [expandedSplitRows, setExpandedSplitRows] = useState({});

  const jumpTo = (tab, category = null) => {
    const params = new URLSearchParams();
    params.set("tab", tab);
    if (category) {
      params.set("cat", category);
      setSelectedCategory(category);
    }
    setSearchParams(params);
  };

  useEffect(() => {
    fetchMasterUsers();
    fetchSecuritySettings();
    fetchRoleMatrix();
    fetchFeeRates();
  }, []);

  const fetchFeeRates = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}api/v1/admin/master/fee-rates`);
      if (res.data?.data?.feeRates) {
        setFeeRates(res.data.data.feeRates);
        setLateFeeInput(res.data.data.lateFeePerDay || 10);
      }
    } catch (e) {
      console.error("Error loading fee rates:", e);
    }
  };

  const handleSaveFeeRates = async () => {
    setSavingFeeRates(true);
    try {
      await axios.put(`${BACKEND_URL}api/v1/admin/master/fee-rates`, {
        feeRates,
        lateFeePerDay: Number(lateFeeInput),
      });
      toast.success("Degree and Batch fee rates updated successfully!");
    } catch (e) {
      toast.error("Failed to update fee rates.");
    } finally {
      setSavingFeeRates(false);
    }
  };

  // Duration in years changed -> update semesters and semester fee dictionary
  const handleDurationYearsChange = (years) => {
    const y = Number(years);
    const sems = y * 2;
    setFeeFormYears(y);
    setFeeFormSemesters(sems);
    setFeeFormSemesterRates((prev) => {
      const updated = {};
      for (let s = 1; s <= sems; s++) {
        updated[s] = prev[s] ?? feeFormRate;
      }
      return updated;
    });
  };

  // Base rate changed -> sync non-split semester rates
  const handleBaseRateChange = (rate) => {
    const r = Number(rate);
    setFeeFormRate(r);
    if (!feeFormIsSplit) {
      setFeeFormSemesterRates((prev) => {
        const updated = {};
        for (let s = 1; s <= feeFormSemesters; s++) {
          updated[s] = r;
        }
        return updated;
      });
    }
  };

  // Live calculated total degree fee
  const calculatedTotalFee = useMemo(() => {
    if (feeFormIsSplit) {
      let sum = 0;
      for (let s = 1; s <= feeFormSemesters; s++) {
        sum += Number(feeFormSemesterRates[s] ?? feeFormRate) || 0;
      }
      return sum;
    }
    return Number(feeFormRate) * Number(feeFormSemesters);
  }, [feeFormIsSplit, feeFormSemesters, feeFormSemesterRates, feeFormRate]);

  // Normalize fee item from backend or legacy flat numbers
  const normalizeFeeItem = (key, raw) => {
    if (typeof raw !== "object" || raw === null) {
      const rate = Number(raw) || 45000;
      return {
        key,
        department: key,
        course: key,
        batch: "2024",
        durationYears: 4,
        totalSemesters: 8,
        ratePerSemester: rate,
        isSplitPerSemester: false,
        semesterFeeRates: { 1: rate, 2: rate, 3: rate, 4: rate, 5: rate, 6: rate, 7: rate, 8: rate },
        totalDegreeFee: rate * 8,
        startMonth: "July (Autumn Batch)",
      };
    }

    const durationYears = Number(raw.durationYears) || 4;
    const totalSemesters = Number(raw.totalSemesters) || durationYears * 2;
    const ratePerSemester = Number(raw.ratePerSemester) || 45000;
    const isSplit = Boolean(raw.isSplitPerSemester);

    let semesterRates = raw.semesterFeeRates;
    if (!semesterRates || typeof semesterRates !== "object") {
      semesterRates = {};
      for (let s = 1; s <= totalSemesters; s++) {
        semesterRates[s] = ratePerSemester;
      }
    }

    let totalDegreeFee = 0;
    if (isSplit) {
      for (let s = 1; s <= totalSemesters; s++) {
        totalDegreeFee += Number(semesterRates[s] ?? ratePerSemester) || 0;
      }
    } else {
      totalDegreeFee = ratePerSemester * totalSemesters;
    }

    return {
      key,
      department: raw.department || key,
      course: raw.course || key,
      batch: raw.batch || "2024",
      durationYears,
      totalSemesters,
      ratePerSemester,
      isSplitPerSemester: isSplit,
      semesterFeeRates: semesterRates,
      totalDegreeFee,
      startMonth: raw.startMonth || "July (Autumn Batch)",
    };
  };

  const handleAddFeeStructure = () => {
    if (!feeFormDept.trim() || !feeFormCourse.trim()) {
      toast.error("Please specify both department and course name.");
      return;
    }

    const key = `${feeFormCourse} [Batch ${feeFormBatch}]`;
    const newStructure = {
      department: feeFormDept,
      course: feeFormCourse,
      batch: feeFormBatch,
      durationYears: Number(feeFormYears),
      totalSemesters: Number(feeFormSemesters),
      ratePerSemester: Number(feeFormRate),
      isSplitPerSemester: Boolean(feeFormIsSplit),
      semesterFeeRates: { ...feeFormSemesterRates },
      totalDegreeFee: calculatedTotalFee,
      startMonth: feeFormStartMonth,
    };

    setFeeRates((prev) => ({
      ...prev,
      [key]: newStructure,
    }));

    toast.success(`Fee structure added for ${feeFormCourse} (${feeFormBatch})! Click Save to apply.`);
  };

  const handleToggleRestrictUser = async (user) => {
    const nextRestricted = !user.isRestricted;
    const actionWord = nextRestricted ? "restrict" : "unrestrict";
    let reason = "";
    if (nextRestricted) {
      const promptReason = window.prompt(
        `Enter restriction reason for ${user.name || user.email}:`,
        "Administrative restriction"
      );
      if (promptReason === null) return;
      reason = promptReason || "Administrative restriction";
    }

    try {
      const res = await axios.put(
        `${BACKEND_URL}api/v1/admin/master/toggle-restrict-user`,
        {
          userId: user._id,
          role: user.userCategory,
          isRestricted: nextRestricted,
          reason,
        },
        {
          headers: { "x-admin-email": SUPER_ADMIN_EMAIL },
        }
      );
      toast.success(res.data.message || `User account ${actionWord}ed.`);
      fetchMasterUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${actionWord} user.`);
    }
  };

  const fetchMasterUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BACKEND_URL}api/v1/admin/master/all-users`, {
        headers: { "x-admin-email": SUPER_ADMIN_EMAIL },
      });
      if (res.data) {
        setUsersData(res.data);
      }
    } catch (err) {
      console.error("Error loading master users:", err);
      toast.error("Failed to load user directory.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSecuritySettings = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}api/v1/security/otp-settings`);
      if (res.data?.settings) {
        const s = res.data.settings;
        setOtpBypassActive(Boolean(s.bypassAll));
        setSecretOtpCode(s.secretOtp || "454545");
        setSessionTimeoutDays(s.sessionTimeoutDays || 7);
        setSessionTimeoutUnit(s.sessionTimeoutUnit || "days");
        setSessionTimeoutValue(s.sessionTimeoutValue || s.sessionTimeoutDays || 7);
      }
    } catch (e) {
      console.error("Error loading security settings:", e);
    }
  };

  const fetchRoleMatrix = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}api/v1/admin/master/role-permissions`);
      if (res.data?.rolePermissions && typeof res.data.rolePermissions === "object") {
        const merged = { ...defaultMatrix };
        Object.keys(res.data.rolePermissions).forEach((key) => {
          if (res.data.rolePermissions[key] && typeof res.data.rolePermissions[key] === "object" && !Array.isArray(res.data.rolePermissions[key])) {
            merged[key] = {
              ...(merged[key] || {}),
              ...res.data.rolePermissions[key],
            };
          }
        });
        setRoleMatrix(merged);
        localStorage.setItem("role_sidebar_permissions", JSON.stringify(merged));
      }
    } catch (e) { }
  };

  // Toggle Global OTP Bypass with simple ON/OFF switch
  const handleToggleOtpBypass = async () => {
    const nextState = !otpBypassActive;
    setUpdatingOtpSwitch(true);
    try {
      await axios.put(`${BACKEND_URL}api/v1/security/otp-settings`, {
        adminEmail: SUPER_ADMIN_EMAIL,
        bypassAll: nextState,
      });
      setOtpBypassActive(nextState);
      if (nextState) {
        toast.success("OTP Bypass turned ON! All users can login directly without OTP.");
      } else {
        toast.info("OTP Bypass turned OFF! 6-digit OTP verification is now enforced.");
      }
    } catch (err) {
      console.error("Failed to toggle OTP switch:", err);
      toast.error(err.response?.data?.message || "Failed to toggle OTP bypass.");
    } finally {
      setUpdatingOtpSwitch(false);
    }
  };

  const copySecretKey = () => {
    navigator.clipboard.writeText(secretOtpCode);
    toast.success("Secret OTP Code copied: " + secretOtpCode);
  };

  const togglePasswordVisibility = (userId) => {
    setRevealedPasswords((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  // Open Direct Reset Password Modal
  const handleOpenResetPassword = (user) => {
    setResetModalUser(user);
    setNewPasswordInput("");
  };

  const handleSaveResetPassword = async (e) => {
    e.preventDefault();
    if (!resetModalUser || !newPasswordInput.trim()) return;

    setResettingPassword(true);
    try {
      const res = await axios.post(
        `${BACKEND_URL}api/v1/admin/master/reset-password`,
        {
          role: resetModalUser.userCategory,
          id: resetModalUser._id,
          newPassword: newPasswordInput.trim(),
          adminRequesterEmail: SUPER_ADMIN_EMAIL,
        },
        {
          headers: { "x-admin-email": SUPER_ADMIN_EMAIL },
        }
      );

      toast.success(res.data.message || "Password successfully updated!");
      setResetModalUser(null);
      setNewPasswordInput("");
      fetchMasterUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setResettingPassword(false);
    }
  };

  // Open Edit User Modal
  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setEditFormData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || user.mobileno || "",
      designation: user.designation || "",
      responsibility: user.responsibility || (user.userCategory === "teacher" ? "Teacher" : ""),
      department: user.department || "",
      batch: user.batch || "",
      rollno: user.rollno || "",
      address: user.address || "",
      password: "",
    });
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    setSavingEdit(true);
    try {
      await axios.put(
        `${BACKEND_URL}api/v1/admin/master/user/${editingUser.userCategory}/${editingUser._id}`,
        editFormData,
        {
          headers: { "x-admin-email": SUPER_ADMIN_EMAIL },
        }
      );

      toast.success("User updated successfully!");
      setEditingUser(null);
      fetchMasterUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update user.");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteUser = async (user) => {
    if (user.email === SUPER_ADMIN_EMAIL) {
      toast.error("Super Admin account cannot be deleted!");
      return;
    }

    const confirm = window.confirm(
      `Permanently delete ${user.name || user.email} (${user.userCategory})? This cannot be undone.`
    );
    if (!confirm) return;

    try {
      await axios.delete(
        `${BACKEND_URL}api/v1/admin/master/user/${user.userCategory}/${user._id}`,
        {
          headers: { "x-admin-email": SUPER_ADMIN_EMAIL },
        }
      );
      toast.success("User permanently deleted.");
      fetchMasterUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete user.");
    }
  };

  // Save Role Sidebar Matrix
  const handleToggleMatrixCheckbox = (roleKey, moduleKey) => {
    setRoleMatrix((prev) => ({
      ...prev,
      [roleKey]: {
        ...(prev[roleKey] || {}),
        [moduleKey]: !prev[roleKey]?.[moduleKey],
      },
    }));
  };

  const handleQuickRoleSet = (roleKey, mode) => {
    if (mode === "resetDefault") {
      setRoleMatrix((prev) => ({
        ...prev,
        [roleKey]: { ...(defaultMatrix[roleKey] || {}) },
      }));
      toast.info(`Reset ${roleKey} permissions to recommended defaults.`);
      return;
    }

    const targetVal = mode === "enableAll";
    setRoleMatrix((prev) => {
      const current = { ...(prev[roleKey] || defaultMatrix[roleKey] || {}) };
      Object.keys(current).forEach((k) => {
        current[k] = targetVal;
      });
      return {
        ...prev,
        [roleKey]: current,
      };
    });
    toast.success(`${mode === "enableAll" ? "Enabled all" : "Revoked all optional"} permissions for ${roleKey}.`);
  };

  const handleSaveMatrix = async () => {
    setSavingMatrix(true);
    try {
      await axios.put(`${BACKEND_URL}api/v1/admin/master/role-permissions`, {
        adminEmail: SUPER_ADMIN_EMAIL,
        rolePermissions: roleMatrix,
      });
      localStorage.setItem("role_sidebar_permissions", JSON.stringify(roleMatrix));
      window.dispatchEvent(new Event("campus_sync_permissions_updated"));
      toast.success("Sidebar role access permissions updated successfully!");
    } catch (err) {
      toast.error("Failed to save sidebar permissions.");
    } finally {
      setSavingMatrix(false);
    }
  };

  // Filter combined user list
  const filteredUsers = useMemo(() => {
    let combined = [
      ...usersData.admins,
      ...usersData.teachers,
      ...usersData.students,
    ];

    if (selectedCategory === "admins") {
      combined = usersData.admins;
    } else if (selectedCategory === "teachers") {
      combined = usersData.teachers.filter(
        (t) => !t.responsibility || t.responsibility === "Teacher"
      );
    } else if (selectedCategory === "students") {
      combined = usersData.students;
    } else if (
      ["Librarian", "Exam Controller", "Event Coordinator", "Student Registrar"].includes(
        selectedCategory
      )
    ) {
      combined = usersData.teachers.filter(
        (t) => t.responsibility === selectedCategory
      );
    }

    if (!searchQuery.trim()) return combined;
    const q = searchQuery.toLowerCase();

    return combined.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.rollno?.toLowerCase().includes(q) ||
        u.department?.toLowerCase().includes(q) ||
        u.responsibility?.toLowerCase().includes(q)
    );
  }, [usersData, selectedCategory, searchQuery]);

  // Reset page when category or search changes
  useEffect(() => {
    setUserPage(1);
  }, [selectedCategory, searchQuery]);

  // Total pages and sliced users (10 entries per slice)
  const totalUserPages = Math.ceil(filteredUsers.length / userPageSize) || 1;
  const slicedUsers = useMemo(() => {
    if (filteredUsers.length <= userPageSize) return filteredUsers;
    const start = (userPage - 1) * userPageSize;
    return filteredUsers.slice(start, start + userPageSize);
  }, [filteredUsers, userPage, userPageSize]);

  return (
    <Container>
      <Content>
        {/* Top Control Bar with Simple ON/OFF Bypass Switch */}
        <TopHeaderBar>
          <TitleSection>
            <span className="super-badge">
              <BsShieldCheck /> Super Administrator Authority
            </span>
            <h1>Super Admin Master Control</h1>
          </TitleSection>

          <ControlsGroup>
            {/* Simple ON/OFF Switch for Global OTP Bypass */}
            <ToggleControlCard $active={otpBypassActive}>
              <div className="label-box">
                <span className="title">Global OTP Bypass</span>
                <span className="status-text">
                  {otpBypassActive ? "ON (Direct Login)" : "OFF (OTP Required)"}
                </span>
              </div>
              <ToggleSwitch
                $active={otpBypassActive}
                onClick={handleToggleOtpBypass}
                disabled={updatingOtpSwitch}
                title="Click to toggle OTP requirement globally"
              >
                <div className="thumb" />
              </ToggleSwitch>
            </ToggleControlCard>

            {/* Secret Master Key Pill */}
            <SecretKeyPill>
              <BsKey style={{ color: "#d97706" }} />
              Secret Key: <strong>{secretOtpCode}</strong>
              <button onClick={copySecretKey} title="Copy Secret OTP">
                <BsClipboard />
              </button>
            </SecretKeyPill>
          </ControlsGroup>
        </TopHeaderBar>

        {/* TAB 0: Executive Overview & Cockpit */}
        {activeTab === "overview" && (
          <>
            <MetricsGrid>
              <MetricCard
                $color="#10b981"
                onClick={() => jumpTo("users", "all")}
                style={{ cursor: "pointer" }}
                title="Click to view all accounts in directory"
              >
                <div className="label">Total System Users</div>
                <div className="value">{usersData.counts.totalUsers}</div>
                <div className="sub">Accounts across all roles</div>
                <div style={{ fontSize: "11px", fontWeight: "700", color: "#10b981", marginTop: "10px", display: "flex", alignItems: "center", gap: "4px" }}>
                  <BsArrowRightShort style={{ fontSize: "16px" }} /> View all accounts
                </div>
              </MetricCard>

              <MetricCard
                $color="#6366f1"
                onClick={() => jumpTo("users", "admins")}
                style={{ cursor: "pointer" }}
                title="Click to view administrators"
              >
                <div className="label">Administrators</div>
                <div className="value">{usersData.counts.totalAdmins}</div>
                <div className="sub">System & Department Admins</div>
                <div style={{ fontSize: "11px", fontWeight: "700", color: "#6366f1", marginTop: "10px", display: "flex", alignItems: "center", gap: "4px" }}>
                  <BsArrowRightShort style={{ fontSize: "16px" }} /> View administrators
                </div>
              </MetricCard>

              <MetricCard
                $color="#0ea5e9"
                onClick={() => jumpTo("users", "teachers")}
                style={{ cursor: "pointer" }}
                title="Click to view faculty and teachers"
              >
                <div className="label">Faculty & Staff</div>
                <div className="value">{usersData.counts.totalTeachers}</div>
                <div className="sub">Teachers, Librarians, Controllers</div>
                <div style={{ fontSize: "11px", fontWeight: "700", color: "#0ea5e9", marginTop: "10px", display: "flex", alignItems: "center", gap: "4px" }}>
                  <BsArrowRightShort style={{ fontSize: "16px" }} /> View faculty
                </div>
              </MetricCard>

              <MetricCard
                $color="#8b5cf6"
                onClick={() => jumpTo("users", "students")}
                style={{ cursor: "pointer" }}
                title="Click to view registered students"
              >
                <div className="label">Registered Students</div>
                <div className="value">{usersData.counts.totalStudents}</div>
                <div className="sub">Active enrolled students</div>
                <div style={{ fontSize: "11px", fontWeight: "700", color: "#8b5cf6", marginTop: "10px", display: "flex", alignItems: "center", gap: "4px" }}>
                  <BsArrowRightShort style={{ fontSize: "16px" }} /> View students
                </div>
              </MetricCard>
            </MetricsGrid>

            {/* SuperAdmin Quick Notes & Universal Passwords Vault */}
            <QuickVaultNotes />
          </>
        )}

        {/* TAB 1: Universal Users & Real Passwords */}
        {activeTab === "users" && (
          <>
            <FilterSection>
              <CategoryPills>
                <CategoryPill
                  $active={selectedCategory === "all"}
                  onClick={() => setSelectedCategory("all")}
                >
                  All ({usersData.counts.totalUsers})
                </CategoryPill>
                <CategoryPill
                  $active={selectedCategory === "admins"}
                  onClick={() => setSelectedCategory("admins")}
                >
                  Admins ({usersData.counts.totalAdmins})
                </CategoryPill>
                <CategoryPill
                  $active={selectedCategory === "teachers"}
                  onClick={() => setSelectedCategory("teachers")}
                >
                  Faculty (
                  {
                    usersData.teachers.filter(
                      (t) => !t.responsibility || t.responsibility === "Teacher"
                    ).length
                  }
                  )
                </CategoryPill>
                <CategoryPill
                  $active={selectedCategory === "Librarian"}
                  onClick={() => setSelectedCategory("Librarian")}
                >
                  Librarians (
                  {
                    usersData.teachers.filter(
                      (t) => t.responsibility === "Librarian"
                    ).length
                  }
                  )
                </CategoryPill>
                <CategoryPill
                  $active={selectedCategory === "Exam Controller"}
                  onClick={() => setSelectedCategory("Exam Controller")}
                >
                  Exam Controllers (
                  {
                    usersData.teachers.filter(
                      (t) => t.responsibility === "Exam Controller"
                    ).length
                  }
                  )
                </CategoryPill>
                <CategoryPill
                  $active={selectedCategory === "Event Coordinator"}
                  onClick={() => setSelectedCategory("Event Coordinator")}
                >
                  Coordinators (
                  {
                    usersData.teachers.filter(
                      (t) => t.responsibility === "Event Coordinator"
                    ).length
                  }
                  )
                </CategoryPill>
                <CategoryPill
                  $active={selectedCategory === "Student Registrar"}
                  onClick={() => setSelectedCategory("Student Registrar")}
                >
                  Registrars (
                  {
                    usersData.teachers.filter(
                      (t) => t.responsibility === "Student Registrar"
                    ).length
                  }
                  )
                </CategoryPill>
                <CategoryPill
                  $active={selectedCategory === "students"}
                  onClick={() => setSelectedCategory("students")}
                >
                  Students ({usersData.counts.totalStudents})
                </CategoryPill>
              </CategoryPills>

              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <SearchBox>
                  <BsSearch />
                  <input
                    type="text"
                    placeholder="Search name, email, roll no, department..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </SearchBox>
                <button
                  type="button"
                  onClick={() => toast.info(`Found ${filteredUsers.length} matching users`)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "#0f172a",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "10px",
                    padding: "10px 18px",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                >
                  <BsSearch /> Search
                </button>
              </div>
            </FilterSection>

            <TableCard>
              <Table>
                <thead>
                  <tr>
                    <th>User & Credentials</th>
                    <th>Role & Responsibility</th>
                    <th>Contact & Department</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: "center", padding: "40px" }}>
                        Loading master user hierarchy...
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                        No users match the selected category or search filter.
                      </td>
                    </tr>
                  ) : (
                    slicedUsers.map((user) => {
                      return (
                        <tr key={user._id}>
                          <td>
                            <div style={{ fontWeight: 700, color: "#0f172a" }}>
                              {user.name || "Unnamed Account"}
                            </div>
                            <div style={{ fontSize: "12px", color: "#64748b" }}>
                              {user.email}
                            </div>
                            {user.rollno && (
                              <div style={{ fontSize: "11px", color: "#0ea5e9", fontWeight: 600 }}>
                                Roll: {user.rollno}
                              </div>
                            )}
                          </td>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                              <RoleBadge $category={user.userCategory}>
                                {user.userCategory}
                              </RoleBadge>
                              {user.isRestricted && (
                                <span
                                  style={{
                                    background: "#fee2e2",
                                    color: "#dc2626",
                                    border: "1px solid #fecaca",
                                    padding: "2px 8px",
                                    borderRadius: "4px",
                                    fontSize: "11px",
                                    fontWeight: 700,
                                  }}
                                  title={user.restrictionReason || "Login suspended"}
                                >
                                  Restricted
                                </span>
                              )}
                            </div>
                            {user.responsibility && (
                              <div>
                                <ResponsibilityTag>{user.responsibility}</ResponsibilityTag>
                              </div>
                            )}
                          </td>
                          <td>
                            <div>{user.department || "General"}</div>
                            <div style={{ fontSize: "12px", color: "#64748b" }}>
                              {user.phone || user.mobileno || "No Phone"}
                            </div>
                            {user.batch && (
                              <div style={{ fontSize: "11px", color: "#64748b" }}>
                                {user.batch}
                              </div>
                            )}
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <div style={{ display: "inline-flex", gap: "8px" }}>
                              <ActionBtn
                                onClick={() => handleOpenResetPassword(user)}
                                title="Override / Reset Password for this user"
                              >
                                <BsKey /> Reset
                              </ActionBtn>
                              {user.email !== SUPER_ADMIN_EMAIL && (
                                user.isRestricted ? (
                                  <ActionBtn
                                    $unrestrict
                                    onClick={() => handleToggleRestrictUser(user)}
                                    title="Restore user login access"
                                  >
                                    Unrestrict
                                  </ActionBtn>
                                ) : (
                                  <ActionBtn
                                    $restrict
                                    onClick={() => handleToggleRestrictUser(user)}
                                    title="Block / Restrict user login access"
                                  >
                                    Restrict
                                  </ActionBtn>
                                )
                              )}
                              <ActionBtn onClick={() => handleOpenEdit(user)}>
                                <BsPencilSquare /> Edit
                              </ActionBtn>
                              {user.email !== SUPER_ADMIN_EMAIL && (
                                <ActionBtn $danger onClick={() => handleDeleteUser(user)}>
                                  <BsTrash /> Delete
                                </ActionBtn>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </Table>

              {filteredUsers.length > 10 && (
                <PaginationBar>
                  <div className="slice-info">
                    Showing <strong>{(userPage - 1) * userPageSize + 1}</strong> to{" "}
                    <strong>{Math.min(userPage * userPageSize, filteredUsers.length)}</strong> of{" "}
                    <strong>{filteredUsers.length}</strong> entries (Page {userPage} of {totalUserPages})
                  </div>
                  <div className="slice-controls">
                    <SliceBtn
                      onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                      disabled={userPage === 1}
                    >
                      ← Previous
                    </SliceBtn>
                    {Array.from({ length: totalUserPages }, (_, i) => i + 1).map((pg) => {
                      if (
                        totalUserPages > 7 &&
                        pg !== 1 &&
                        pg !== totalUserPages &&
                        Math.abs(pg - userPage) > 2
                      ) {
                        if (pg === 2 || pg === totalUserPages - 1) {
                          return <span key={pg} style={{ padding: "0 4px", color: "#94a3b8" }}>...</span>;
                        }
                        return null;
                      }
                      return (
                        <SliceBtn
                          key={pg}
                          $active={userPage === pg}
                          onClick={() => setUserPage(pg)}
                        >
                          {pg}
                        </SliceBtn>
                      );
                    })}
                    <SliceBtn
                      onClick={() => setUserPage((p) => Math.min(totalUserPages, p + 1))}
                      disabled={userPage === totalUserPages}
                    >
                      Next →
                    </SliceBtn>
                  </div>
                </PaginationBar>
              )}
            </TableCard>
          </>
        )}

        {/* TAB 2: Role Sidebar Access Matrix */}
        {activeTab === "matrix" && (
          <>
            <MatrixCard>
              <MatrixHeader>
                <div>
                  <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "#0f172a" }}>
                    Role Sidebar Access & Permissions Matrix
                  </h3>
                  <p style={{ margin: "4px 0 0", fontSize: "12.5px", color: "#64748b" }}>
                    Configure which menus and sub-links appear on each role's sidebar. Changes reflect in real time.
                  </p>
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <button
                    type="button"
                    onClick={() => setMatrixViewMode(matrixViewMode === "roleDetail" ? "masterTable" : "roleDetail")}
                    style={{
                      background: matrixViewMode === "masterTable" ? "#2563eb" : "#f1f5f9",
                      color: matrixViewMode === "masterTable" ? "#ffffff" : "#334155",
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                      padding: "8px 14px",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {matrixViewMode === "roleDetail" ? "View Master Table" : "Role Inspector"}
                  </button>
                  <PrimarySaveButton onClick={handleSaveMatrix} disabled={savingMatrix}>
                    <BsCheckCircleFill />
                    {savingMatrix ? "Saving..." : "Save Sidebar Permissions"}
                  </PrimarySaveButton>
                </div>
              </MatrixHeader>

              {/* Role Selection Navigation Pills (No Emojis) */}
              <div
                style={{
                  display: "flex",
                  gap: "6px",
                  flexWrap: "wrap",
                  padding: "8px",
                  background: "#f8fafc",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  marginBottom: "16px",
                }}
              >
                {[
                  { key: "AccountsOfficer", name: "Accounts & Finance" },
                  { key: "Administrator", name: "Administrator / Principal" },
                  { key: "StudentRegistrar", name: "Student Registrar" },
                  { key: "ExamController", name: "Exam Controller" },
                  { key: "Teacher", name: "Teaching Faculty" },
                  { key: "Librarian", name: "Head Librarian" },
                  { key: "EventCoordinator", name: "Event Coordinator" },
                  { key: "Student", name: "Student Portal" },
                ].map((r) => {
                  const isActive = activeMatrixRole === r.key && matrixViewMode === "roleDetail";
                  return (
                    <button
                      key={r.key}
                      type="button"
                      onClick={() => {
                        setActiveMatrixRole(r.key);
                        setMatrixViewMode("roleDetail");
                      }}
                      style={{
                        padding: "7px 14px",
                        borderRadius: "6px",
                        fontSize: "12.5px",
                        fontWeight: 600,
                        cursor: "pointer",
                        border: isActive ? "1.5px solid #10b981" : "1px solid #cbd5e1",
                        background: isActive ? "#ecfdf5" : "#ffffff",
                        color: isActive ? "#065f46" : "#334155",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {r.name}
                    </button>
                  );
                })}
              </div>

              {/* VIEW 1: Clean Granular Role Detail Inspector */}
              {matrixViewMode === "roleDetail" && (
                (() => {
                  const roleKey = activeMatrixRole;
                  const perms = roleMatrix[roleKey] || {};

                  const roleTitleMap = {
                    AccountsOfficer: "Accounts & Finance Officer",
                    Administrator: "Administrator / Principal",
                    StudentRegistrar: "Student Registrar / Admissions Desk",
                    ExamController: "Examination Controller Cell",
                    Teacher: "Teaching Faculty",
                    Librarian: "Head Librarian",
                    EventCoordinator: "Event Coordinator",
                    Student: "Student Portal",
                  };

                  return (
                    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                      {/* Active Role Header Bar (Simple title + small reset button, no theory, no emojis) */}
                      <div
                        style={{
                          background: "#ffffff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          padding: "12px 16px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: "8px",
                        }}
                      >
                        <h4 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>
                          {roleTitleMap[roleKey] || roleKey}
                        </h4>
                        <button
                          type="button"
                          onClick={() => handleQuickRoleSet(roleKey, "resetDefault")}
                          style={{
                            background: "#f8fafc",
                            border: "1px solid #cbd5e1",
                            borderRadius: "6px",
                            padding: "5px 12px",
                            fontSize: "12px",
                            fontWeight: 600,
                            cursor: "pointer",
                            color: "#475569",
                          }}
                        >
                          Reset to Default
                        </button>
                      </div>

                      {/* Granular Module Cards Grid */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "14px" }}>
                        {/* 1. Dashboard Module */}
                        <div
                          style={{
                            background: "#ffffff",
                            border: "1px solid #e2e8f0",
                            borderRadius: "8px",
                            padding: "14px",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                            <strong style={{ fontSize: "13.5px", color: "#0f172a" }}>Dashboard & Overview</strong>
                            <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>
                              <input
                                type="checkbox"
                                checked={Boolean(perms.dashboard)}
                                onChange={() => handleToggleMatrixCheckbox(roleKey, "dashboard")}
                              />
                              Visible
                            </label>
                          </div>
                          <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
                            Access to the primary role landing dashboard.
                          </p>
                        </div>

                        {/* 2. Users & Admissions Module */}
                        <div
                          style={{
                            background: "#ffffff",
                            border: "1px solid #e2e8f0",
                            borderRadius: "8px",
                            padding: "14px",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                            <strong style={{ fontSize: "13.5px", color: "#0f172a" }}>Users & Admissions</strong>
                            <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>
                              <input
                                type="checkbox"
                                checked={Boolean(perms.users)}
                                onChange={() => handleToggleMatrixCheckbox(roleKey, "users")}
                              />
                              Group Visible
                            </label>
                          </div>

                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            {[
                              { field: "users_studentsDir", label: "Students Directory" },
                              { field: "users_facultyDir", label: "Faculty Directory" },
                              { field: "users_registerStudent", label: "Register Student" },
                              { field: "users_registerFaculty", label: "Register Faculty" },
                              { field: "users_registerAdmin", label: "Register Admin" },
                            ].map((sub) => (
                              <label
                                key={sub.field}
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  padding: "7px 10px",
                                  borderRadius: "6px",
                                  background: "#f8fafc",
                                  border: "1px solid #e2e8f0",
                                  cursor: "pointer",
                                }}
                              >
                                <span style={{ fontSize: "12.5px", fontWeight: 600, color: "#1e293b" }}>
                                  {sub.label}
                                </span>
                                <input
                                  type="checkbox"
                                  checked={Boolean(perms[sub.field])}
                                  onChange={() => handleToggleMatrixCheckbox(roleKey, sub.field)}
                                />
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* 3. Academics Module */}
                        <div
                          style={{
                            background: "#ffffff",
                            border: "1px solid #e2e8f0",
                            borderRadius: "8px",
                            padding: "14px",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                            <strong style={{ fontSize: "13.5px", color: "#0f172a" }}>Academics</strong>
                            <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>
                              <input
                                type="checkbox"
                                checked={Boolean(perms.academics)}
                                onChange={() => handleToggleMatrixCheckbox(roleKey, "academics")}
                              />
                              Group Visible
                            </label>
                          </div>

                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            {[
                              { field: "academics_attendance", label: "Attendance Tracking" },
                              { field: "academics_exams", label: "Exams & Results" },
                              { field: "academics_assignments", label: "Assignments" },
                              { field: "academics_classes", label: "Class Schedules" },
                            ].map((sub) => (
                              <label
                                key={sub.field}
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  padding: "7px 10px",
                                  borderRadius: "6px",
                                  background: "#f8fafc",
                                  border: "1px solid #e2e8f0",
                                  cursor: "pointer",
                                }}
                              >
                                <span style={{ fontSize: "12.5px", fontWeight: 600, color: "#1e293b" }}>
                                  {sub.label}
                                </span>
                                <input
                                  type="checkbox"
                                  checked={Boolean(perms[sub.field])}
                                  onChange={() => handleToggleMatrixCheckbox(roleKey, sub.field)}
                                />
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* 4. Campus Operations Module */}
                        <div
                          style={{
                            background: "#ffffff",
                            border: "1px solid #e2e8f0",
                            borderRadius: "8px",
                            padding: "14px",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                            <strong style={{ fontSize: "13.5px", color: "#0f172a" }}>Campus Operations</strong>
                            <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>
                              <input
                                type="checkbox"
                                checked={Boolean(perms.services)}
                                onChange={() => handleToggleMatrixCheckbox(roleKey, "services")}
                              />
                              Group Visible
                            </label>
                          </div>

                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            {[
                              { field: "services_accountsFees", label: "Accounts & Fees" },
                              { field: "services_library", label: "Library Management" },
                              { field: "services_events", label: "Events & Calendar" },
                              { field: "services_announcements", label: "Announcements" },
                            ].map((sub) => (
                              <label
                                key={sub.field}
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  padding: "7px 10px",
                                  borderRadius: "6px",
                                  background: "#f8fafc",
                                  border: "1px solid #e2e8f0",
                                  cursor: "pointer",
                                }}
                              >
                                <span style={{ fontSize: "12.5px", fontWeight: 600, color: "#1e293b" }}>
                                  {sub.label}
                                </span>
                                <input
                                  type="checkbox"
                                  checked={Boolean(perms[sub.field])}
                                  onChange={() => handleToggleMatrixCheckbox(roleKey, sub.field)}
                                />
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* 5. Settings & Profile Module */}
                        <div
                          style={{
                            background: "#ffffff",
                            border: "1px solid #e2e8f0",
                            borderRadius: "8px",
                            padding: "14px",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                            <strong style={{ fontSize: "13.5px", color: "#0f172a" }}>Settings & Profile</strong>
                            <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>
                              <input
                                type="checkbox"
                                checked={Boolean(perms.settings)}
                                onChange={() => handleToggleMatrixCheckbox(roleKey, "settings")}
                              />
                              Visible
                            </label>
                          </div>
                          <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
                            Access to user profile and personal account settings.
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })()
              )}

              {/* VIEW 2: Master Comparison Grid */}
              {matrixViewMode === "masterTable" && (
                <TableCard>
                  <div style={{ overflowX: "auto" }}>
                    <MatrixTable>
                      <thead>
                        <tr>
                          <th>Role</th>
                          <th>Dashboard</th>
                          <th>Users</th>
                          <th>Students</th>
                          <th>Register</th>
                          <th>Academics</th>
                          <th>Attendance/Exams</th>
                          <th>Accounts/Fees</th>
                          <th>Library</th>
                          <th>Events/Notices</th>
                          <th>Settings</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { key: "AccountsOfficer", name: "Accounts & Finance" },
                          { key: "Administrator", name: "Administrator / Principal" },
                          { key: "StudentRegistrar", name: "Student Registrar" },
                          { key: "ExamController", name: "Exam Controller" },
                          { key: "Teacher", name: "Teaching Faculty" },
                          { key: "Librarian", name: "Head Librarian" },
                          { key: "EventCoordinator", name: "Event Coordinator" },
                          { key: "Student", name: "Student Portal" },
                        ].map((roleItem) => {
                          const perms = roleMatrix[roleItem.key] || {};
                          return (
                            <tr key={roleItem.key}>
                              <td>
                                <div style={{ fontWeight: 700, color: "#0f172a" }}>{roleItem.name}</div>
                              </td>
                              <td>
                                <input
                                  type="checkbox"
                                  checked={Boolean(perms.dashboard)}
                                  onChange={() => handleToggleMatrixCheckbox(roleItem.key, "dashboard")}
                                />
                              </td>
                              <td>
                                <input
                                  type="checkbox"
                                  checked={Boolean(perms.users)}
                                  onChange={() => handleToggleMatrixCheckbox(roleItem.key, "users")}
                                />
                              </td>
                              <td>
                                <input
                                  type="checkbox"
                                  checked={Boolean(perms.users_studentsDir)}
                                  onChange={() => handleToggleMatrixCheckbox(roleItem.key, "users_studentsDir")}
                                />
                              </td>
                              <td>
                                <input
                                  type="checkbox"
                                  checked={Boolean(perms.users_registerStudent || perms.users_registerFaculty || perms.users_registerAdmin)}
                                  onChange={() => {
                                    const next = !(perms.users_registerStudent || perms.users_registerFaculty || perms.users_registerAdmin);
                                    setRoleMatrix((prev) => ({
                                      ...prev,
                                      [roleItem.key]: {
                                        ...(prev[roleItem.key] || {}),
                                        users_registerStudent: next,
                                        users_registerFaculty: next,
                                        users_registerAdmin: next,
                                      },
                                    }));
                                  }}
                                />
                              </td>
                              <td>
                                <input
                                  type="checkbox"
                                  checked={Boolean(perms.academics)}
                                  onChange={() => handleToggleMatrixCheckbox(roleItem.key, "academics")}
                                />
                              </td>
                              <td>
                                <input
                                  type="checkbox"
                                  checked={Boolean(perms.academics_attendance && perms.academics_exams)}
                                  onChange={() => {
                                    const next = !(perms.academics_attendance && perms.academics_exams);
                                    setRoleMatrix((prev) => ({
                                      ...prev,
                                      [roleItem.key]: {
                                        ...(prev[roleItem.key] || {}),
                                        academics_attendance: next,
                                        academics_exams: next,
                                        academics_assignments: next,
                                        academics_classes: next,
                                      },
                                    }));
                                  }}
                                />
                              </td>
                              <td>
                                <input
                                  type="checkbox"
                                  checked={Boolean(perms.services_accountsFees)}
                                  onChange={() => handleToggleMatrixCheckbox(roleItem.key, "services_accountsFees")}
                                />
                              </td>
                              <td>
                                <input
                                  type="checkbox"
                                  checked={Boolean(perms.services_library)}
                                  onChange={() => handleToggleMatrixCheckbox(roleItem.key, "services_library")}
                                />
                              </td>
                              <td>
                                <input
                                  type="checkbox"
                                  checked={Boolean(perms.services_events && perms.services_announcements)}
                                  onChange={() => {
                                    const next = !(perms.services_events && perms.services_announcements);
                                    setRoleMatrix((prev) => ({
                                      ...prev,
                                      [roleItem.key]: {
                                        ...(prev[roleItem.key] || {}),
                                        services_events: next,
                                        services_announcements: next,
                                      },
                                    }));
                                  }}
                                />
                              </td>
                              <td>
                                <input
                                  type="checkbox"
                                  checked={Boolean(perms.settings)}
                                  onChange={() => handleToggleMatrixCheckbox(roleItem.key, "settings")}
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </MatrixTable>
                  </div>
                </TableCard>
              )}
            </MatrixCard>
          </>
        )}

        {/* TAB 3: System Rules & Parameters */}
        {activeTab === "security" && (
          <>
            <MatrixCard>
            <MatrixHeader>
              <div>
                <h3>System Security Parameters & Emergency Recovery</h3>
                <p>Configure universal master verification code, session lifespans, and emergency recovery controls.</p>
              </div>
            </MatrixHeader>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const val = parseInt(sessionTimeoutValue, 10) || 1;
                  const equivDays = sessionTimeoutUnit === "hours" ? Math.max(1, Math.ceil(val / 24)) : val;

                  await axios.put(`${BACKEND_URL}api/v1/security/otp-settings`, {
                    adminEmail: SUPER_ADMIN_EMAIL,
                    secretOtp: secretOtpCode.trim(),
                    sessionTimeoutUnit,
                    sessionTimeoutValue: val,
                    sessionTimeoutDays: equivDays,
                  });
                  toast.success("Security & system parameters successfully saved!");
                } catch (err) {
                  toast.error("Failed to save security settings.");
                }
              }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
                <FormGroup>
                  <label>Master Secret OTP Key</label>
                  <input
                    type="text"
                    value={secretOtpCode}
                    onChange={(e) => setSecretOtpCode(e.target.value)}
                    placeholder="e.g. 999999"
                    maxLength={10}
                    required
                  />
                  <small style={{ color: "#64748b", fontSize: "11px" }}>
                    Universal master verification code that authorizes any login immediately.
                  </small>
                </FormGroup>

                <FormGroup>
                  <label>Session Timeout Lifespan</label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input
                      type="number"
                      min={1}
                      max={sessionTimeoutUnit === "hours" ? 168 : 60}
                      value={sessionTimeoutValue}
                      onChange={(e) => setSessionTimeoutValue(e.target.value)}
                      style={{ flex: 1 }}
                      required
                    />
                    <select
                      value={sessionTimeoutUnit}
                      onChange={(e) => setSessionTimeoutUnit(e.target.value)}
                      style={{
                        padding: "10px 14px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "8px",
                        fontSize: "13px",
                        fontWeight: 600,
                        background: "#fff",
                      }}
                    >
                      <option value="hours">Hours</option>
                      <option value="days">Days</option>
                    </select>
                  </div>
                  <small style={{ color: "#64748b", fontSize: "11px" }}>
                    Duration logins remain authenticated before expiring (e.g. 1 hour or 7 days).
                  </small>
                </FormGroup>
              </div>

              <div style={{ marginTop: "24px" }}>
                <PrimarySaveButton type="submit">
                  <BsCheckCircleFill /> Save Security Parameters
                </PrimarySaveButton>
              </div>
            </form>
          </MatrixCard>
          </>
        )}

        {/* TAB 4: Degree & Batch Fee Structures */}
        {activeTab === "feeRates" && (
          <>
            <MatrixCard>
              <MatrixHeader>
                <div>
                  <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "#0f172a" }}>
                    Degree & Batch Fee Rates & Structure Configuration
                  </h3>
                  <p style={{ margin: "4px 0 0", fontSize: "12.5px", color: "#64748b" }}>
                    Configure tuition rates per semester, degree duration, batch years, and semester distributions.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSaveFeeRates}
                  disabled={savingFeeRates}
                  style={{
                    background: "#0f172a",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "6px",
                    padding: "7px 16px",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    cursor: savingFeeRates ? "not-allowed" : "pointer",
                    opacity: savingFeeRates ? 0.7 : 1,
                  }}
                >
                  {savingFeeRates ? "Saving..." : "Save Fee Structures"}
                </button>
              </MatrixHeader>

              {/* Add New Program / Batch Fee Structure Box */}
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  padding: "18px",
                  marginTop: "8px",
                  marginBottom: "20px",
                }}
              >
                <div style={{ marginBottom: "14px" }}>
                  <h4 style={{ margin: "0 0 2px", fontSize: "14.5px", fontWeight: 700, color: "#0f172a" }}>
                    Configure New Degree Program & Batch Fee Structure
                  </h4>
                  <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
                    Set up tuition rates, duration, batch year, and optional semester-wise variations.
                  </p>
                </div>

                {/* Clean Non-Overlapping Parameters Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "12px" }}>
                  {/* 1. Department */}
                  <div>
                    <label style={{ fontSize: "11.5px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                      Department
                    </label>
                    <input
                      type="text"
                      list="dept-options-list"
                      placeholder="e.g. Computer Science"
                      value={feeFormDept}
                      onChange={(e) => setFeeFormDept(e.target.value)}
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        padding: "7px 10px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "6px",
                        fontSize: "12.5px",
                      }}
                    />
                    <datalist id="dept-options-list">
                      {CAMPUS_DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept} />
                      ))}
                    </datalist>
                  </div>

                  {/* 2. Course / Degree Program */}
                  <div>
                    <label style={{ fontSize: "11.5px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                      Course / Degree Program
                    </label>
                    <input
                      type="text"
                      list="course-options-list"
                      placeholder="e.g. B.Tech Computer Science"
                      value={feeFormCourse}
                      onChange={(e) => setFeeFormCourse(e.target.value)}
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        padding: "7px 10px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "6px",
                        fontSize: "12.5px",
                      }}
                    />
                    <datalist id="course-options-list">
                      {STANDARD_COURSES.map((crs) => (
                        <option key={crs} value={crs} />
                      ))}
                    </datalist>
                  </div>

                  {/* 3. Batch (Clean Year List) */}
                  <div>
                    <label style={{ fontSize: "11.5px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                      Batch Cohort
                    </label>
                    <select
                      value={feeFormBatch}
                      onChange={(e) => setFeeFormBatch(e.target.value)}
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        padding: "7px 10px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "6px",
                        fontSize: "12.5px",
                        background: "#ffffff",
                      }}
                    >
                      {BATCH_YEARS.map((yr) => (
                        <option key={yr} value={yr}>
                          Batch {yr}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 4. Duration (Years) */}
                  <div>
                    <label style={{ fontSize: "11.5px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                      Duration (Years)
                    </label>
                    <select
                      value={feeFormYears}
                      onChange={(e) => handleDurationYearsChange(e.target.value)}
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        padding: "7px 10px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "6px",
                        fontSize: "12.5px",
                        background: "#ffffff",
                      }}
                    >
                      <option value={1}>1 Year (2 Semesters)</option>
                      <option value={2}>2 Years (4 Semesters)</option>
                      <option value={3}>3 Years (6 Semesters)</option>
                      <option value={4}>4 Years (8 Semesters)</option>
                      <option value={5}>5 Years (10 Semesters)</option>
                    </select>
                  </div>

                  {/* 5. Total Semesters */}
                  <div>
                    <label style={{ fontSize: "11.5px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                      Total Semesters
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={feeFormSemesters}
                      onChange={(e) => {
                        const sems = Math.max(1, Number(e.target.value) || 1);
                        setFeeFormSemesters(sems);
                        setFeeFormSemesterRates((prev) => {
                          const updated = {};
                          for (let s = 1; s <= sems; s++) {
                            updated[s] = prev[s] ?? feeFormRate;
                          }
                          return updated;
                        });
                      }}
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        padding: "7px 10px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "6px",
                        fontSize: "12.5px",
                        fontWeight: 600,
                      }}
                    />
                  </div>

                  {/* 6. Base Rate / Semester (INR) */}
                  <div>
                    <label style={{ fontSize: "11.5px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                      Fee Rate / Semester (INR)
                    </label>
                    <input
                      type="number"
                      min={1000}
                      step={1000}
                      value={feeFormRate}
                      onChange={(e) => handleBaseRateChange(e.target.value)}
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        padding: "7px 10px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "6px",
                        fontSize: "12.5px",
                        fontWeight: 600,
                      }}
                    />
                  </div>

                  {/* 7. Start Month */}
                  <div>
                    <label style={{ fontSize: "11.5px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                      Start Month
                    </label>
                    <select
                      value={feeFormStartMonth}
                      onChange={(e) => setFeeFormStartMonth(e.target.value)}
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        padding: "7px 10px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "6px",
                        fontSize: "12.5px",
                        background: "#ffffff",
                      }}
                    >
                      <option value="July (Autumn Batch)">July (Autumn)</option>
                      <option value="January (Spring Batch)">January (Spring)</option>
                    </select>
                  </div>

                  {/* 8. Total Calculated Degree Fee */}
                  <div>
                    <label style={{ fontSize: "11.5px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                      Total Degree Fee (Calculated)
                    </label>
                    <div
                      style={{
                        padding: "7px 10px",
                        background: "#f1f5f9",
                        border: "1px solid #cbd5e1",
                        borderRadius: "6px",
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "#0f172a",
                        boxSizing: "border-box",
                      }}
                    >
                      ₹{calculatedTotalFee.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Small Split Checkbox */}
                <div style={{ marginTop: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <input
                    type="checkbox"
                    id="smallSplitCheckbox"
                    checked={feeFormIsSplit}
                    onChange={(e) => {
                      const split = e.target.checked;
                      setFeeFormIsSplit(split);
                      if (split) {
                        setFeeFormSemesterRates((prev) => {
                          const updated = {};
                          for (let s = 1; s <= feeFormSemesters; s++) {
                            updated[s] = prev[s] ?? feeFormRate;
                          }
                          return updated;
                        });
                      }
                    }}
                    style={{ width: "15px", height: "15px", cursor: "pointer" }}
                  />
                  <label htmlFor="smallSplitCheckbox" style={{ fontSize: "12.5px", fontWeight: 600, color: "#334155", cursor: "pointer" }}>
                    Split fee differently per semester
                  </label>
                </div>

                {/* Dynamic Semester Fee Rates Breakdown (when checked) */}
                {feeFormIsSplit && (
                  <div style={{ marginTop: "10px", padding: "10px 12px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "6px" }}>
                    <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                      Semester Rates (Sem 1 to {feeFormSemesters}):
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "8px" }}>
                      {Array.from({ length: feeFormSemesters }, (_, i) => i + 1).map((s) => (
                        <div key={s}>
                          <label style={{ fontSize: "11px", color: "#64748b", display: "block", marginBottom: "2px" }}>
                            Sem {s} (INR)
                          </label>
                          <input
                            type="number"
                            min={1000}
                            step={500}
                            value={feeFormSemesterRates[s] ?? feeFormRate}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setFeeFormSemesterRates((prev) => ({
                                ...prev,
                                [s]: val,
                              }));
                            }}
                            style={{
                              width: "100%",
                              boxSizing: "border-box",
                              padding: "5px 8px",
                              border: "1px solid #cbd5e1",
                              borderRadius: "6px",
                              fontSize: "12px",
                              fontWeight: 600,
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Button */}
                <div style={{ marginTop: "14px", display: "flex", justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    onClick={handleAddFeeStructure}
                    style={{
                      background: "#0f172a",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "6px",
                      padding: "7px 16px",
                      fontWeight: 600,
                      fontSize: "12.5px",
                      cursor: "pointer",
                    }}
                  >
                    + Add Fee Structure
                  </button>
                </div>
              </div>

              {/* Table of Configured Fee Structures (Directly Readable, No Horizontal Scroll) */}
              <div style={{ marginBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>
                  Configured Degree Programs & Batch Fee Rates ({Object.keys(feeRates).length} Total)
                </h4>
              </div>

              <TableCard style={{ marginTop: "6px", marginBottom: "20px" }}>
                <Table>
                  <thead>
                    <tr>
                      <th>Program & Department</th>
                      <th>Duration</th>
                      <th>Fee / Semester</th>
                      <th>Total Degree Fee</th>
                      <th>Split Type</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(feeRates).length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: "center", padding: "24px", color: "#94a3b8" }}>
                          No fee structures configured yet.
                        </td>
                      </tr>
                    ) : (
                      Object.keys(feeRates).map((deptKey) => {
                        const item = normalizeFeeItem(deptKey, feeRates[deptKey]);
                        const isExpanded = Boolean(expandedSplitRows[deptKey]);

                        return (
                          <React.Fragment key={deptKey}>
                            <tr>
                              <td>
                                <div style={{ fontWeight: 700, color: "#0f172a" }}>{item.course}</div>
                                <div style={{ fontSize: "11.5px", color: "#64748b", marginTop: "2px" }}>
                                  {item.department} &bull; Batch {item.batch} &bull; Starts {item.startMonth}
                                </div>
                              </td>
                              <td>
                                <span style={{ fontWeight: 600, color: "#334155" }}>
                                  {item.durationYears} Yrs ({item.totalSemesters} Sem)
                                </span>
                              </td>
                              <td>
                                <input
                                  type="number"
                                  min={1000}
                                  step={1000}
                                  value={item.ratePerSemester}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    setFeeRates((prev) => {
                                      const existing = normalizeFeeItem(deptKey, prev[deptKey]);
                                      const nextSplitRates = { ...existing.semesterFeeRates };
                                      if (!existing.isSplitPerSemester) {
                                        for (let s = 1; s <= existing.totalSemesters; s++) {
                                          nextSplitRates[s] = val;
                                        }
                                      }
                                      let nextTotal = 0;
                                      if (existing.isSplitPerSemester) {
                                        for (let s = 1; s <= existing.totalSemesters; s++) {
                                          nextTotal += Number(nextSplitRates[s] || val);
                                        }
                                      } else {
                                        nextTotal = val * existing.totalSemesters;
                                      }
                                      return {
                                        ...prev,
                                        [deptKey]: {
                                          ...existing,
                                          ratePerSemester: val,
                                          semesterFeeRates: nextSplitRates,
                                          totalDegreeFee: nextTotal,
                                        },
                                      };
                                    });
                                  }}
                                  style={{
                                    padding: "5px 8px",
                                    border: "1px solid #cbd5e1",
                                    borderRadius: "6px",
                                    width: "95px",
                                    fontWeight: 600,
                                    fontSize: "12.5px",
                                  }}
                                />
                              </td>
                              <td>
                                <span style={{ fontWeight: 700, color: "#047857", fontSize: "13px" }}>
                                  ₹{item.totalDegreeFee.toLocaleString()}
                                </span>
                              </td>
                              <td>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedSplitRows((prev) => ({
                                      ...prev,
                                      [deptKey]: !prev[deptKey],
                                    }))
                                  }
                                  style={{
                                    padding: "4px 8px",
                                    borderRadius: "6px",
                                    border: "1px solid #cbd5e1",
                                    background: item.isSplitPerSemester ? "#f0fdf4" : "#ffffff",
                                    color: item.isSplitPerSemester ? "#166534" : "#475569",
                                    fontSize: "11.5px",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                  }}
                                >
                                  {item.isSplitPerSemester ? "Custom Split" : "Uniform"} ({isExpanded ? "Hide" : "Edit"})
                                </button>
                              </td>
                              <td style={{ textAlign: "right" }}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const next = { ...feeRates };
                                    delete next[deptKey];
                                    setFeeRates(next);
                                  }}
                                  style={{
                                    background: "transparent",
                                    border: "1px solid #fca5a5",
                                    borderRadius: "6px",
                                    padding: "4px 8px",
                                    color: "#dc2626",
                                    fontSize: "11.5px",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                  }}
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>

                            {/* Expandable Semester-by-Semester Fee Breakdown Drawer */}
                            {isExpanded && (
                              <tr style={{ background: "#f8fafc" }}>
                                <td colSpan={6} style={{ padding: "12px 16px" }}>
                                  <div
                                    style={{
                                      background: "#ffffff",
                                      border: "1px solid #e2e8f0",
                                      borderRadius: "8px",
                                      padding: "12px",
                                    }}
                                  >
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                                      <span style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a" }}>
                                        Semester Rates for {item.course} (Batch {item.batch}):
                                      </span>
                                      <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
                                        <input
                                          type="checkbox"
                                          checked={item.isSplitPerSemester}
                                          onChange={(e) => {
                                            const splitVal = e.target.checked;
                                            setFeeRates((prev) => {
                                              const existing = normalizeFeeItem(deptKey, prev[deptKey]);
                                              let nextTotal = 0;
                                              if (splitVal) {
                                                for (let s = 1; s <= existing.totalSemesters; s++) {
                                                  nextTotal += Number(existing.semesterFeeRates[s] || existing.ratePerSemester);
                                                }
                                              } else {
                                                nextTotal = existing.ratePerSemester * existing.totalSemesters;
                                              }
                                              return {
                                                ...prev,
                                                [deptKey]: {
                                                  ...existing,
                                                  isSplitPerSemester: splitVal,
                                                  totalDegreeFee: nextTotal,
                                                },
                                              };
                                            });
                                          }}
                                        />
                                        Split fee differently per semester
                                      </label>
                                    </div>

                                    <div
                                      style={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
                                        gap: "8px",
                                      }}
                                    >
                                      {Array.from({ length: item.totalSemesters }, (_, i) => i + 1).map((s) => (
                                        <div key={s} style={{ background: "#f8fafc", padding: "6px 8px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                                          <label style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", display: "block", marginBottom: "2px" }}>
                                            Sem {s}
                                          </label>
                                          <input
                                            type="number"
                                            min={1000}
                                            step={500}
                                            disabled={!item.isSplitPerSemester}
                                            value={item.semesterFeeRates[s] ?? item.ratePerSemester}
                                            onChange={(e) => {
                                              const newRate = Number(e.target.value);
                                              setFeeRates((prev) => {
                                                const existing = normalizeFeeItem(deptKey, prev[deptKey]);
                                                const updatedRates = {
                                                  ...existing.semesterFeeRates,
                                                  [s]: newRate,
                                                };
                                                let sum = 0;
                                                for (let k = 1; k <= existing.totalSemesters; k++) {
                                                  sum += Number(updatedRates[k] ?? existing.ratePerSemester);
                                                }
                                                return {
                                                  ...prev,
                                                  [deptKey]: {
                                                    ...existing,
                                                    isSplitPerSemester: true,
                                                    semesterFeeRates: updatedRates,
                                                    totalDegreeFee: sum,
                                                  },
                                                };
                                              });
                                            }}
                                            style={{
                                              width: "100%",
                                              boxSizing: "border-box",
                                              padding: "4px 6px",
                                              border: "1px solid #cbd5e1",
                                              borderRadius: "5px",
                                              fontSize: "12px",
                                              fontWeight: 600,
                                              background: item.isSplitPerSemester ? "#ffffff" : "#f1f5f9",
                                            }}
                                          />
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })
                    )}
                  </tbody>
                </Table>
              </TableCard>
            </MatrixCard>
          </>
        )}

        {/* TAB 5: Production IP Security & Firewall Operations */}
        {activeTab === "ipSecurity" && (
          <IpSecurityCenter />
        )}
      </Content>

      {/* Direct Reset Password Modal */}
      {resetModalUser && (
        <ModalOverlay onClick={() => setResetModalUser(null)}>
          <ModalBox onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: "0 0 6px" }}>
              Reset Real Password
            </h2>
            <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 18px" }}>
              Setting real password for: <strong>{resetModalUser.name}</strong> ({resetModalUser.email})
            </p>

            <form onSubmit={handleSaveResetPassword}>
              <FormGroup>
                <label>New Password</label>
                <input
                  type="text"
                  placeholder="Enter new password (min 4 chars)"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  required
                  autoFocus
                />
              </FormGroup>

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => setNewPasswordInput("campus@" + Math.floor(100 + Math.random() * 900))}
                  style={{
                    background: "#f1f5f9",
                    border: "1px solid #cbd5e1",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  Generate Quick Password
                </button>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
                <ActionBtn type="button" onClick={() => setResetModalUser(null)}>
                  Cancel
                </ActionBtn>
                <PrimarySaveButton type="submit" disabled={resettingPassword}>
                  {resettingPassword ? "Saving..." : "Update Password"}
                </PrimarySaveButton>
              </div>
            </form>
          </ModalBox>
        </ModalOverlay>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <ModalOverlay onClick={() => setEditingUser(null)}>
          <ModalBox onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: "0 0 6px" }}>
              Edit User Profile
            </h2>
            <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 18px" }}>
              Category: <strong>{editingUser.userCategory}</strong> ({editingUser.email})
            </p>

            <form onSubmit={handleSaveUser}>
              <FormGroup>
                <label>Full Name</label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  required
                />
              </FormGroup>

              <FormGroup>
                <label>Email Address</label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  required
                />
              </FormGroup>

              <FormGroup>
                <label>Phone / Mobile</label>
                <input
                  type="text"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                />
              </FormGroup>

              {editingUser.userCategory === "teacher" && (
                <FormGroup>
                  <label>Staff Responsibility</label>
                  <select
                    value={editFormData.responsibility}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, responsibility: e.target.value })
                    }
                  >
                    <option value="Teacher">Teaching Faculty</option>
                    <option value="Librarian">Librarian</option>
                    <option value="Exam Controller">Exam Controller</option>
                    <option value="Event Coordinator">Event Coordinator</option>
                    <option value="Student Registrar">Student Registrar</option>
                  </select>
                </FormGroup>
              )}

              <FormGroup>
                <label>Department</label>
                <input
                  type="text"
                  value={editFormData.department}
                  onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                />
              </FormGroup>

              {editingUser.userCategory === "student" && (
                <>
                  <FormGroup>
                    <label>Batch</label>
                    <input
                      type="text"
                      value={editFormData.batch}
                      onChange={(e) => setEditFormData({ ...editFormData, batch: e.target.value })}
                    />
                  </FormGroup>
                  <FormGroup>
                    <label>Roll Number</label>
                    <input
                      type="text"
                      value={editFormData.rollno}
                      onChange={(e) => setEditFormData({ ...editFormData, rollno: e.target.value })}
                    />
                  </FormGroup>
                </>
              )}

              <FormGroup>
                <label>New Password (Optional override)</label>
                <input
                  type="text"
                  placeholder="Leave blank to keep existing password"
                  value={editFormData.password}
                  onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                />
              </FormGroup>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
                <ActionBtn type="button" onClick={() => setEditingUser(null)}>
                  Cancel
                </ActionBtn>
                <PrimarySaveButton type="submit" disabled={savingEdit}>
                  {savingEdit ? "Saving..." : "Save Changes"}
                </PrimarySaveButton>
              </div>
            </form>
          </ModalBox>
        </ModalOverlay>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </Container>
  );
};

export default MasterControl;
