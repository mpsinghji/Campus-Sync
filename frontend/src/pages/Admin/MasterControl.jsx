import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import axios from "axios";
import Cookies from "js-cookie";
import { ToastContainer, toast } from "react-toastify";
import { BACKEND_URL } from "../../constants/url";
import QuickVaultNotes from "../../components/Admin/QuickVaultNotes";
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

const TabBar = styled.div`
  display: flex;
  gap: 8px;
  background: #e2e8f0;
  padding: 4px;
  border-radius: 10px;
  margin-bottom: 22px;
  width: fit-content;
  flex-wrap: wrap;
`;

const TabButton = styled.button`
  padding: 10px 20px;
  font-size: 13px;
  font-weight: 700;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${(props) => (props.$active ? "#ffffff" : "transparent")};
  color: ${(props) => (props.$active ? "#0f172a" : "#64748b")};
  box-shadow: ${(props) => (props.$active ? "0 2px 6px rgba(0,0,0,0.06)" : "none")};

  &:hover {
    color: #0f172a;
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
  const [activeTab, setActiveTab] = useState("users"); // "users" | "matrix" | "security"
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
  const [lateFeeFlatAfterDue, setLateFeeFlatAfterDue] = useState(500);
  const [lateFeeGraceDays, setLateFeeGraceDays] = useState(7);
  const [lateFeePerDay, setLateFeePerDay] = useState(10);
  const [updatingOtpSwitch, setUpdatingOtpSwitch] = useState(false);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [userPage, setUserPage] = useState(1);
  const userPageSize = 10;

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
    Administrator: { dashboard: true, users: true, academics: true, services: true, master: false, settings: true },
    Teacher: { dashboard: true, users: false, academics: true, services: false, master: false, settings: true },
    Librarian: { dashboard: true, users: false, academics: false, services: true, master: false, settings: true },
    ExamController: { dashboard: true, users: false, academics: true, services: false, master: false, settings: true },
    EventCoordinator: { dashboard: true, users: false, academics: false, services: true, master: false, settings: true },
    StudentRegistrar: { dashboard: true, users: true, academics: false, services: false, master: false, settings: true },
    Student: { dashboard: true, users: false, academics: true, services: true, master: false, settings: true },
  };
  const [roleMatrix, setRoleMatrix] = useState(defaultMatrix);
  const [savingMatrix, setSavingMatrix] = useState(false);

  // Fee Rates Configuration State
  const [feeRates, setFeeRates] = useState({});
  const [lateFeeInput, setLateFeeInput] = useState(10);
  const [savingFeeRates, setSavingFeeRates] = useState(false);
  const [newDeptKey, setNewDeptKey] = useState("");
  const [newDeptRate, setNewDeptRate] = useState(45000);
  const [newDeptYears, setNewDeptYears] = useState(4);

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
        setLateFeeFlatAfterDue(s.lateFeeFlatAfterDue || 500);
        setLateFeeGraceDays(s.lateFeeGraceDays || 7);
        setLateFeePerDay(s.lateFeePerDay || 10);
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
    } catch (e) {}
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
        toast.success("⚡ OTP Bypass turned ON! All users can login directly without OTP.");
      } else {
        toast.info("🛡️ OTP Bypass turned OFF! 6-digit OTP verification is now enforced.");
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
            <h1>👑 Super Admin Master Control</h1>
            <p>Direct user management, real password inspection & sidebar access matrix.</p>
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

        {/* SuperAdmin Quick Notes & Universal Passwords Vault with Role Slices */}
        <QuickVaultNotes />

        {/* Metric Summary Cards */}
        <MetricsGrid>
          <MetricCard $color="#10b981">
            <div className="label">Total System Users</div>
            <div className="value">{usersData.counts.totalUsers}</div>
            <div className="sub">Accounts across all roles</div>
          </MetricCard>

          <MetricCard $color="#6366f1">
            <div className="label">Administrators</div>
            <div className="value">{usersData.counts.totalAdmins}</div>
            <div className="sub">System & Department Admins</div>
          </MetricCard>

          <MetricCard $color="#0ea5e9">
            <div className="label">Faculty & Staff</div>
            <div className="value">{usersData.counts.totalTeachers}</div>
            <div className="sub">Teachers, Librarians, Controllers</div>
          </MetricCard>

          <MetricCard $color="#8b5cf6">
            <div className="label">Registered Students</div>
            <div className="value">{usersData.counts.totalStudents}</div>
            <div className="sub">Active enrolled students</div>
          </MetricCard>
        </MetricsGrid>

        {/* Tab Selection */}
        <TabBar>
          <TabButton
            $active={activeTab === "users"}
            onClick={() => setActiveTab("users")}
          >
            <BsPeople /> Universal Users & Passwords
          </TabButton>
          <TabButton
            $active={activeTab === "matrix"}
            onClick={() => setActiveTab("matrix")}
          >
            <BsSliders /> Role Sidebar Access Matrix
          </TabButton>
          <TabButton
            $active={activeTab === "security"}
            onClick={() => setActiveTab("security")}
          >
            <BsShieldLock /> Security & System Parameters
          </TabButton>
          <TabButton
            $active={activeTab === "feeRates"}
            onClick={() => setActiveTab("feeRates")}
          >
            <BsCashCoin /> Degree & Batch Fee Structures
          </TabButton>
        </TabBar>

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
                                  🚫 Restricted
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
                                🔑 Reset
                              </ActionBtn>
                              {user.email !== SUPER_ADMIN_EMAIL && (
                                user.isRestricted ? (
                                  <ActionBtn
                                    $unrestrict
                                    onClick={() => handleToggleRestrictUser(user)}
                                    title="Restore user login access"
                                  >
                                    🟢 Unrestrict
                                  </ActionBtn>
                                ) : (
                                  <ActionBtn
                                    $restrict
                                    onClick={() => handleToggleRestrictUser(user)}
                                    title="Block / Restrict user login access"
                                  >
                                    🚫 Restrict
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
          <MatrixCard>
            <MatrixHeader>
              <div>
                <h3>🛡️ Role Sidebar Access & Visibility Matrix</h3>
                <p>
                  Configure precisely which sections and links appear on each role's sidebar. Changes reflect in real-time.
                </p>
              </div>
              <PrimarySaveButton onClick={handleSaveMatrix} disabled={savingMatrix}>
                <BsCheckCircleFill />
                {savingMatrix ? "Saving Matrix..." : "Save Sidebar Permissions"}
              </PrimarySaveButton>
            </MatrixHeader>

            <TableCard>
              <MatrixTable>
                <thead>
                  <tr>
                    <th>Role Hierarchy</th>
                    <th>Dashboard</th>
                    <th>Users & Directory</th>
                    <th>Academics (Attendance/Exams)</th>
                    <th>Campus Services (Library/Fees)</th>
                    <th>Settings & Profile</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { key: "Administrator", name: "Administrator" },
                    { key: "Teacher", name: "Teaching Faculty" },
                    { key: "Librarian", name: "Librarian" },
                    { key: "ExamController", name: "Exam Controller" },
                    { key: "EventCoordinator", name: "Event Coordinator" },
                    { key: "StudentRegistrar", name: "Student Registrar" },
                    { key: "Student", name: "Student" },
                  ].map((roleItem) => {
                    const perms = roleMatrix[roleItem.key] || {};
                    return (
                      <tr key={roleItem.key}>
                        <td>{roleItem.name}</td>
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
                            checked={Boolean(perms.academics)}
                            onChange={() => handleToggleMatrixCheckbox(roleItem.key, "academics")}
                          />
                        </td>
                        <td>
                          <input
                            type="checkbox"
                            checked={Boolean(perms.services)}
                            onChange={() => handleToggleMatrixCheckbox(roleItem.key, "services")}
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
            </TableCard>
          </MatrixCard>
        )}

        {/* TAB 3: System Rules & Parameters */}
        {activeTab === "security" && (
          <MatrixCard>
            <MatrixHeader>
              <div>
                <h3>⚡ System Security Parameters & Global Overrides</h3>
                <p>Configure session lifespans, late fee calculations, and master bypass settings.</p>
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
                    lateFeeFlatAfterDue: parseInt(lateFeeFlatAfterDue, 10) || 0,
                    lateFeeGraceDays: parseInt(lateFeeGraceDays, 10) || 0,
                    lateFeePerDay: parseInt(lateFeePerDay, 10) || 0,
                  });
                  toast.success("Security & policy parameters successfully saved!");
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

                <FormGroup>
                  <label>Late Fee Flat Penalty After Due Date (₹)</label>
                  <input
                    type="number"
                    min={0}
                    max={10000}
                    value={lateFeeFlatAfterDue}
                    onChange={(e) => setLateFeeFlatAfterDue(e.target.value)}
                    required
                  />
                  <small style={{ color: "#64748b", fontSize: "11px" }}>
                    Flat surcharge applied to student tuition once the term due date passes.
                  </small>
                </FormGroup>

                <FormGroup>
                  <label>Late Fee Grace Period (Days)</label>
                  <input
                    type="number"
                    min={0}
                    max={60}
                    value={lateFeeGraceDays}
                    onChange={(e) => setLateFeeGraceDays(e.target.value)}
                    required
                  />
                  <small style={{ color: "#64748b", fontSize: "11px" }}>
                    Days of leeway after term due date before late fees are triggered.
                  </small>
                </FormGroup>

                <FormGroup>
                  <label>Per-Day Overdue Fine (₹ / Day)</label>
                  <input
                    type="number"
                    min={0}
                    max={500}
                    value={lateFeePerDay}
                    onChange={(e) => setLateFeePerDay(e.target.value)}
                    required
                  />
                  <small style={{ color: "#64748b", fontSize: "11px" }}>
                    Daily fine calculated on overdue library book loans.
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
        )}

        {/* TAB 4: Degree & Batch Fee Structures */}
        {activeTab === "feeRates" && (
          <MatrixCard>
            <MatrixHeader>
              <div>
                <h3>🎓 Degree & Batch Fee Rates & Structure Configuration</h3>
                <p>
                  Configure official fee rates per semester, degree duration (years), and start month for departments and batches.
                </p>
              </div>
              <PrimarySaveButton onClick={handleSaveFeeRates} disabled={savingFeeRates}>
                <BsCheckCircleFill /> {savingFeeRates ? "Saving Rates..." : "Save Fee Structures"}
              </PrimarySaveButton>
            </MatrixHeader>

            <TableCard style={{ marginTop: "16px", marginBottom: "24px" }}>
              <Table>
                <thead>
                  <tr>
                    <th>Department / Degree Program</th>
                    <th>Fee Rate / Semester (INR)</th>
                    <th>Duration (Years)</th>
                    <th>Total Semesters</th>
                    <th>Total Degree Fee (INR)</th>
                    <th>Start Month</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(feeRates).map((dept) => {
                    const item = feeRates[dept] || {};
                    const rate = typeof item === "object" ? Number(item.ratePerSemester) || 45000 : Number(item) || 45000;
                    const years = typeof item === "object" ? Number(item.durationYears) || 4 : 4;
                    const month = typeof item === "object" ? item.startMonth || "July" : "July";
                    const totalTerms = years * 2;
                    const totalProgram = rate * totalTerms;

                    return (
                      <tr key={dept}>
                        <td>
                          <div style={{ fontWeight: 800, color: "#0f172a" }}>{dept}</div>
                        </td>
                        <td>
                          <input
                            type="number"
                            min={1000}
                            step={1000}
                            value={rate}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setFeeRates((prev) => ({
                                ...prev,
                                [dept]: {
                                  ...(typeof prev[dept] === "object" ? prev[dept] : {}),
                                  ratePerSemester: val,
                                  durationYears: years,
                                  startMonth: month,
                                },
                              }));
                            }}
                            style={{
                              padding: "6px 10px",
                              border: "1px solid #cbd5e1",
                              borderRadius: "6px",
                              width: "120px",
                              fontWeight: 700,
                            }}
                          />
                        </td>
                        <td>
                          <select
                            value={years}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setFeeRates((prev) => ({
                                ...prev,
                                [dept]: {
                                  ...(typeof prev[dept] === "object" ? prev[dept] : {}),
                                  ratePerSemester: rate,
                                  durationYears: val,
                                  startMonth: month,
                                },
                              }));
                            }}
                            style={{
                              padding: "6px 10px",
                              border: "1px solid #cbd5e1",
                              borderRadius: "6px",
                              fontWeight: 600,
                            }}
                          >
                            <option value={2}>2 Years (4 Terms)</option>
                            <option value={3}>3 Years (6 Terms)</option>
                            <option value={4}>4 Years (8 Terms)</option>
                            <option value={5}>5 Years (10 Terms)</option>
                          </select>
                        </td>
                        <td>
                          <span style={{ fontWeight: 700, color: "#2563eb" }}>{totalTerms} Semesters</span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 800, color: "#0f172a" }}>₹{totalProgram.toLocaleString()}</span>
                        </td>
                        <td>
                          <select
                            value={month}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFeeRates((prev) => ({
                                ...prev,
                                [dept]: {
                                  ...(typeof prev[dept] === "object" ? prev[dept] : {}),
                                  ratePerSemester: rate,
                                  durationYears: years,
                                  startMonth: val,
                                },
                              }));
                            }}
                            style={{
                              padding: "6px 10px",
                              border: "1px solid #cbd5e1",
                              borderRadius: "6px",
                            }}
                          >
                            <option value="July">July (Autumn Batch)</option>
                            <option value="January">January (Spring Batch)</option>
                          </select>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <ActionBtn
                            $danger
                            onClick={() => {
                              const next = { ...feeRates };
                              delete next[dept];
                              setFeeRates(next);
                            }}
                          >
                            <BsTrash /> Remove
                          </ActionBtn>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </TableCard>

            {/* Add New Program Rate Box */}
            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "20px",
                marginTop: "16px",
              }}
            >
              <h4 style={{ margin: "0 0 12px", fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>
                ➕ Add New Program / Batch Fee Structure
              </h4>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "flex-end" }}>
                <div style={{ flex: 1, minWidth: "180px" }}>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#475569", display: "block", marginBottom: "4px" }}>
                    Program / Batch Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Artificial Intelligence or Batch 2026-30"
                    value={newDeptKey}
                    onChange={(e) => setNewDeptKey(e.target.value)}
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "8px" }}
                  />
                </div>
                <div style={{ width: "160px" }}>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#475569", display: "block", marginBottom: "4px" }}>
                    Rate / Semester (INR)
                  </label>
                  <input
                    type="number"
                    min={1000}
                    step={1000}
                    value={newDeptRate}
                    onChange={(e) => setNewDeptRate(Number(e.target.value))}
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "8px" }}
                  />
                </div>
                <div style={{ width: "140px" }}>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#475569", display: "block", marginBottom: "4px" }}>
                    Duration (Years)
                  </label>
                  <select
                    value={newDeptYears}
                    onChange={(e) => setNewDeptYears(Number(e.target.value))}
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "8px" }}
                  >
                    <option value={2}>2 Years</option>
                    <option value={3}>3 Years</option>
                    <option value={4}>4 Years</option>
                    <option value={5}>5 Years</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!newDeptKey.trim()) {
                      toast.error("Please enter a program name or batch label.");
                      return;
                    }
                    setFeeRates((prev) => ({
                      ...prev,
                      [newDeptKey.trim()]: {
                        ratePerSemester: Number(newDeptRate) || 45000,
                        durationYears: Number(newDeptYears) || 4,
                        startMonth: "July",
                      },
                    }));
                    toast.success(`Added ${newDeptKey.trim()} to structures.`);
                    setNewDeptKey("");
                    setNewDeptRate(45000);
                  }}
                  style={{
                    background: "#0f172a",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "9px 18px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Add Structure
                </button>
              </div>
            </div>
          </MatrixCard>
        )}
      </Content>

      {/* Direct Reset Password Modal */}
      {resetModalUser && (
        <ModalOverlay onClick={() => setResetModalUser(null)}>
          <ModalBox onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: "0 0 6px" }}>
              🔑 Reset Real Password
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
                  ⚡ Generate Quick Password
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
              ✏️ Edit User Profile
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
