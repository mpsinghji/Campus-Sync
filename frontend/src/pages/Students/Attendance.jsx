import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import styled from "styled-components";
import Cookies from "js-cookie";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BACKEND_URL } from "../../constants/url";
import {
  BsCalendarCheck,
  BsCheckCircleFill,
  BsXCircleFill,
  BsClockHistory,
  BsSearch,
  BsBook,
  BsChevronDown,
  BsChevronUp,
  BsShieldCheck,
  BsExclamationTriangleFill,
  BsArrowCounterclockwise,
  BsListUl,
  BsGrid3X3Gap,
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
  max-width: 1360px;
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
  gap: 12px;

  .title-area {
    h1 {
      font-size: 22px;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 4px 0;
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

  .view-toggle {
    display: inline-flex;
    background: #e2e8f0;
    padding: 3px;
    border-radius: 8px;
    gap: 2px;

    button {
      border: none;
      background: transparent;
      padding: 6px 14px;
      font-size: 12px;
      font-weight: 600;
      color: #475569;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s ease;

      &.active {
        background: #ffffff;
        color: #0f172a;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
      }

      &:hover:not(.active) {
        color: #1e293b;
      }
    }
  }
`;

// Compact, high-density stats strip (replaces bloated 160px cards)
const CompactStatsStrip = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 14px;
  margin-bottom: 18px;
`;

const MetricTile = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 14px 18px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
  display: flex;
  align-items: center;
  gap: 14px;

  .tile-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    background: ${(props) => props.$bg || "#eff6ff"};
    color: ${(props) => props.$color || "#2563eb"};
    flex-shrink: 0;
  }

  .tile-info {
    min-width: 0;

    .tile-val {
      font-size: 20px;
      font-weight: 700;
      color: #0f172a;
      line-height: 1.2;
      display: flex;
      align-items: baseline;
      gap: 6px;

      .sub-val {
        font-size: 12px;
        font-weight: 500;
        color: #64748b;
      }
    }

    .tile-lbl {
      font-size: 11px;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      margin-top: 2px;
    }
  }
`;

// Clean filter & search toolbar without overlapping bugs
const FilterToolbar = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
  margin-bottom: 18px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const SearchInputWrap = styled.div`
  position: relative;
  flex: 1 1 260px;
  max-width: 380px;
  min-width: 200px;

  svg {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
    font-size: 14px;
    pointer-events: none;
  }

  input {
    width: 100%;
    padding: 8px 12px 8px 36px;
    border-radius: 8px;
    border: 1px solid #cbd5e1;
    font-size: 13px;
    color: #0f172a;
    background: #f8fafc;
    outline: none;
    transition: all 0.2s;

    &:focus {
      border-color: #3b82f6;
      background: #ffffff;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    &::placeholder {
      color: #94a3b8;
    }
  }
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;

  select {
    padding: 8px 12px;
    border-radius: 8px;
    border: 1px solid #cbd5e1;
    font-size: 13px;
    color: #334155;
    background: #ffffff;
    outline: none;
    cursor: pointer;
    transition: border-color 0.2s;

    &:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
  }

  .counter-badge {
    font-size: 12px;
    color: #64748b;
    font-weight: 500;
    padding: 4px 8px;
    background: #f1f5f9;
    border-radius: 6px;
  }
`;

// Main Subject Ledger Table Card
const Card = styled.div`
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03);
  overflow: hidden;
`;

const SubjectTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;

  thead {
    background-color: #f8fafc;
    border-bottom: 1px solid #e2e8f0;

    th {
      padding: 12px 16px;
      font-size: 11px;
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      white-space: nowrap;
    }
  }

  tbody {
    tr.subject-row {
      border-bottom: 1px solid #f1f5f9;
      transition: background 0.12s;
      cursor: pointer;

      &:hover {
        background-color: #f8fafc;
      }

      td {
        padding: 14px 16px;
        font-size: 13px;
        color: #334155;
        vertical-align: middle;
      }
    }

    tr.expanded-row {
      background-color: #f8fafc;
      border-bottom: 1px solid #e2e8f0;

      td {
        padding: 14px 20px 18px 20px;
      }
    }
  }
`;

const SubjectNameCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;

  .name {
    font-size: 14px;
    font-weight: 600;
    color: #0f172a;
  }

  .meta {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: #64748b;

    span {
      background: #f1f5f9;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 500;
    }
  }
`;

const AttendanceMeter = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 140px;

  .percent-val {
    font-size: 14px;
    font-weight: 700;
    color: ${(props) =>
      props.$pct >= 75 ? "#059669" : props.$pct >= 65 ? "#d97706" : "#dc2626"};
    min-width: 42px;
  }

  .bar-track {
    flex: 1;
    height: 7px;
    background: #e2e8f0;
    border-radius: 10px;
    overflow: hidden;

    .bar-fill {
      height: 100%;
      width: ${(props) => Math.min(100, Math.max(0, props.$pct))}%;
      background: ${(props) =>
        props.$pct >= 75
          ? "linear-gradient(90deg, #10b981, #059669)"
          : props.$pct >= 65
          ? "linear-gradient(90deg, #f59e0b, #d97706)"
          : "linear-gradient(90deg, #ef4444, #dc2626)"};
      border-radius: 10px;
      transition: width 0.3s ease;
    }
  }
`;

const GuidanceBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;

  &.safe {
    background: #ecfdf5;
    color: #047857;
    border: 1px solid #a7f3d0;
  }

  &.warning {
    background: #fffbeb;
    color: #b45309;
    border: 1px solid #fde68a;
  }

  &.critical {
    background: #fef2f2;
    color: #b91c1c;
    border: 1px solid #fecaca;
  }
`;

const PillCount = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  background-color: ${(props) =>
    props.$type === "present"
      ? "#ecfdf5"
      : props.$type === "absent"
      ? "#fef2f2"
      : "#f1f5f9"};
  color: ${(props) =>
    props.$type === "present"
      ? "#059669"
      : props.$type === "absent"
      ? "#dc2626"
      : "#475569"};
  border: 1px solid
    ${(props) =>
      props.$type === "present"
        ? "#a7f3d0"
        : props.$type === "absent"
        ? "#fecaca"
        : "#e2e8f0"};
`;

// Collapsible Date Breakdown Tray
const DateBreakdownTray = styled.div`
  background: #ffffff;
  border-radius: 10px;
  padding: 14px 16px;
  border: 1px solid #e2e8f0;

  .tray-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    font-size: 12px;
    font-weight: 600;
    color: #475569;
  }

  .chips-container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    max-height: 200px;
    overflow-y: auto;
    padding-right: 4px;
  }
`;

const DateChip = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  background: ${(props) => (props.$present ? "#f0fdf4" : "#fef2f2")};
  color: ${(props) => (props.$present ? "#166534" : "#991b1b")};
  border: 1px solid ${(props) => (props.$present ? "#bbf7d0" : "#fecaca")};

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${(props) => (props.$present ? "#22c55e" : "#ef4444")};
  }
`;

// Fallback date-wise table styling
const DateWiseTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;

  thead {
    background-color: #f8fafc;
    border-bottom: 1px solid #e2e8f0;

    th {
      padding: 12px 16px;
      font-size: 11px;
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  }

  tbody {
    tr {
      border-bottom: 1px solid #f1f5f9;

      &:hover {
        background-color: #f8fafc;
      }

      td {
        padding: 12px 16px;
        font-size: 13px;
        color: #334155;
      }
    }
  }
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background-color: ${(props) => (props.$present ? "#ecfdf5" : "#fef2f2")};
  color: ${(props) => (props.$present ? "#059669" : "#dc2626")};
  border: 1px solid ${(props) => (props.$present ? "#a7f3d0" : "#fecaca")};
`;

const EmptyState = styled.div`
  padding: 50px 20px;
  text-align: center;
  color: #64748b;

  .icon {
    font-size: 38px;
    color: #94a3b8;
    margin-bottom: 10px;
  }

  h3 {
    font-size: 15px;
    font-weight: 600;
    color: #334155;
    margin: 0 0 4px 0;
  }

  p {
    font-size: 13px;
    margin: 0;
  }
`;

const Attendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [stats, setStats] = useState({ total: 0, present: 0, absent: 0, percentage: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("lowest"); // lowest | highest | name | most
  const [viewMode, setViewMode] = useState("subject"); // "subject" (default) | "datewise"
  const [expandedSubject, setExpandedSubject] = useState(null);

  const fetchAttendance = async () => {
    try {
      setLoading(true);

      // Parse student token and ID
      let token = Cookies.get("studentToken") || localStorage.getItem("studentToken") || "";
      let studentId = "";

      const raw = Cookies.get("studentData") || localStorage.getItem("studentData");
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          const u = parsed.user || parsed;
          studentId = u._id || u.id || "";
          if (!token && (parsed.token || u.token)) {
            token = parsed.token || u.token;
          }
        } catch (e) {
          console.warn("Could not parse studentData:", e);
        }
      }

      const headers = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
        headers["studenttoken"] = token;
      }

      const queryUrl = studentId
        ? `${BACKEND_URL}api/v1/attendance/my-attendance?studentId=${studentId}`
        : `${BACKEND_URL}api/v1/attendance/my-attendance`;

      const response = await axios.get(queryUrl, {
        headers,
        withCredentials: true,
      });

      if (response.data?.success) {
        const records = response.data.attendanceRecords || [];
        setAttendanceData(records);
        if (response.data.stats) {
          setStats(response.data.stats);
        } else {
          const total = records.length;
          const present = records.filter((r) => r.status === "Present").length;
          const absent = records.filter((r) => r.status === "Absent").length;
          const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
          setStats({ total, present, absent, percentage });
        }
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
      toast.error("Could not fetch attendance records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  // Aggregated Subject-Wise Attendance Summary (The core user request)
  const subjectSummaries = useMemo(() => {
    const map = {};

    attendanceData.forEach((rec) => {
      const subName = (rec.subject && rec.subject.trim()) || "General Academics";
      if (!map[subName]) {
        map[subName] = {
          subject: subName,
          department: rec.department || "Computer Science",
          batch: rec.batch || "",
          section: rec.section || "",
          group: rec.group || "",
          total: 0,
          present: 0,
          absent: 0,
          records: [],
        };
      }
      map[subName].total += 1;
      if (rec.status === "Present") {
        map[subName].present += 1;
      } else {
        map[subName].absent += 1;
      }
      map[subName].records.push(rec);
    });

    const list = Object.values(map).map((item) => {
      const percentage = item.total > 0 ? Math.round((item.present / item.total) * 100) : 0;

      // Smart Attendance Margin & Guidance
      let advice = "";
      let adviceType = "safe"; // safe | warning | critical

      if (percentage >= 75) {
        // Can miss formula: (present) / (total + m) >= 0.75  =>  m <= present / 0.75 - total
        const canMiss = Math.floor(item.present / 0.75 - item.total);
        if (canMiss > 0) {
          advice = `Can safely miss next ${canMiss} class${canMiss > 1 ? "es" : ""}`;
          adviceType = "safe";
        } else {
          advice = "On margin (cannot miss next class)";
          adviceType = "warning";
        }
      } else {
        // Must attend formula: (present + k) / (total + k) >= 0.75 => k >= 3*total - 4*present
        const need = Math.ceil(3 * item.total - 4 * item.present);
        if (need > 0) {
          advice = `Must attend next ${need} class${need > 1 ? "es" : ""} to reach 75%`;
          adviceType = percentage < 60 ? "critical" : "warning";
        } else {
          advice = "Attend next class";
          adviceType = "warning";
        }
      }

      return {
        ...item,
        percentage,
        advice,
        adviceType,
      };
    });

    // Filtering
    let filtered = list.filter((item) => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.subject.toLowerCase().includes(q) ||
        item.department.toLowerCase().includes(q);

      let matchStatus = true;
      if (statusFilter === "safe") {
        matchStatus = item.percentage >= 75;
      } else if (statusFilter === "risk") {
        matchStatus = item.percentage < 75;
      }

      return matchSearch && matchStatus;
    });

    // Sorting
    filtered.sort((a, b) => {
      if (sortBy === "lowest") return a.percentage - b.percentage;
      if (sortBy === "highest") return b.percentage - a.percentage;
      if (sortBy === "name") return a.subject.localeCompare(b.subject);
      if (sortBy === "most") return b.total - a.total;
      return 0;
    });

    return filtered;
  }, [attendanceData, search, statusFilter, sortBy]);

  // Filtered date-wise records (if user toggles to raw Date-Wise ledger)
  const filteredDateRecords = useMemo(() => {
    return attendanceData.filter((item) => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        (item.subject && item.subject.toLowerCase().includes(q)) ||
        (item.date && item.date.toLowerCase().includes(q)) ||
        (item.department && item.department.toLowerCase().includes(q));

      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "safe" && item.status === "Present") ||
        (statusFilter === "risk" && item.status === "Absent") ||
        item.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [attendanceData, search, statusFilter]);

  // Overall subjects health counts
  const totalSubjectsCount = useMemo(() => {
    const s = new Set();
    attendanceData.forEach((r) => r.subject && s.add(r.subject.trim()));
    return s.size || 1;
  }, [attendanceData]);

  const safeSubjectsCount = useMemo(() => {
    return subjectSummaries.filter((s) => s.percentage >= 75).length;
  }, [subjectSummaries]);

  const toggleExpand = (subName) => {
    setExpandedSubject(expandedSubject === subName ? null : subName);
  };

  return (
    <Container>
      <Sidebar />
      <ToastContainer position="top-right" autoClose={3000} />
      <Content>
        {/* Header & View Switcher */}
        <Header>
          <div className="title-area">
            <h1>
              <BsCalendarCheck style={{ color: "#2563eb" }} /> Attendance Ledger
            </h1>
            <p>Subject-wise lecture attendance, eligibility status, and requirement guidance</p>
          </div>

          <div className="view-toggle">
            <button
              className={viewMode === "subject" ? "active" : ""}
              onClick={() => setViewMode("subject")}
              title="View aggregated subject-wise attendance"
            >
              <BsGrid3X3Gap /> Subject Breakdown
            </button>
            <button
              className={viewMode === "datewise" ? "active" : ""}
              onClick={() => setViewMode("datewise")}
              title="View chronological raw date history"
            >
              <BsListUl /> Date History
            </button>
          </div>
        </Header>

        {/* Compact, High-Density KPI Strip */}
        <CompactStatsStrip>
          <MetricTile
            $bg={stats.percentage >= 75 ? "#ecfdf5" : "#fef2f2"}
            $color={stats.percentage >= 75 ? "#059669" : "#dc2626"}
          >
            <div className="tile-icon">
              {stats.percentage >= 75 ? <BsCheckCircleFill /> : <BsClockHistory />}
            </div>
            <div className="tile-info">
              <div className="tile-val">
                {stats.percentage}%
                <span className="sub-val">
                  {stats.percentage >= 75 ? "Eligible" : "Shortage"}
                </span>
              </div>
              <div className="tile-lbl">Overall Attendance</div>
            </div>
          </MetricTile>

          <MetricTile $bg="#eff6ff" $color="#2563eb">
            <div className="tile-icon">
              <BsBook />
            </div>
            <div className="tile-info">
              <div className="tile-val">
                {stats.present}
                <span className="sub-val">/ {stats.total} classes</span>
              </div>
              <div className="tile-lbl">Attended (Present)</div>
            </div>
          </MetricTile>

          <MetricTile $bg="#fff1f2" $color="#e11d48">
            <div className="tile-icon">
              <BsXCircleFill />
            </div>
            <div className="tile-info">
              <div className="tile-val">{stats.absent}</div>
              <div className="tile-lbl">Missed (Absent)</div>
            </div>
          </MetricTile>

          <MetricTile $bg="#f8fafc" $color="#475569">
            <div className="tile-icon">
              <BsShieldCheck />
            </div>
            <div className="tile-info">
              <div className="tile-val">
                {safeSubjectsCount}
                <span className="sub-val">/ {totalSubjectsCount} subjects</span>
              </div>
              <div className="tile-lbl">Subjects ≥ 75% Criteria</div>
            </div>
          </MetricTile>
        </CompactStatsStrip>

        {/* Clean Filter and Search Toolbar (No overlap, proper flex boundaries) */}
        <FilterToolbar>
          <SearchInputWrap>
            <BsSearch />
            <input
              type="text"
              placeholder={
                viewMode === "subject"
                  ? "Search by subject name or dept..."
                  : "Search by subject, date, or dept..."
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </SearchInputWrap>

          <FilterGroup>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Attendance Levels</option>
              <option value="safe">Eligible (≥ 75%)</option>
              <option value="risk">Shortage Risk (&lt; 75%)</option>
            </select>

            {viewMode === "subject" && (
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="lowest">Lowest Attendance First</option>
                <option value="highest">Highest Attendance First</option>
                <option value="name">Subject Name (A-Z)</option>
                <option value="most">Most Lectures Held</option>
              </select>
            )}

            <span className="counter-badge">
              {viewMode === "subject"
                ? `${subjectSummaries.length} Subject${subjectSummaries.length === 1 ? "" : "s"}`
                : `${filteredDateRecords.length} Record${filteredDateRecords.length === 1 ? "" : "s"}`}
            </span>

            <button
              onClick={fetchAttendance}
              title="Refresh Attendance"
              style={{
                border: "1px solid #cbd5e1",
                background: "#ffffff",
                padding: "8px 10px",
                borderRadius: "8px",
                cursor: "pointer",
                color: "#475569",
                display: "flex",
                alignItems: "center",
              }}
            >
              <BsArrowCounterclockwise />
            </button>
          </FilterGroup>
        </FilterToolbar>

        {/* Subject-Wise Primary View */}
        {viewMode === "subject" ? (
          <Card>
            {loading ? (
              <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
                Loading subject attendance...
              </div>
            ) : subjectSummaries.length === 0 ? (
              <EmptyState>
                <div className="icon">
                  <BsBook />
                </div>
                <h3>No Subject Attendance Records</h3>
                <p>
                  {attendanceData.length === 0
                    ? "Attendance has not been recorded by faculty yet."
                    : "No subjects matched your filter criteria."}
                </p>
              </EmptyState>
            ) : (
              <SubjectTable>
                <thead>
                  <tr>
                    <th style={{ width: "36px" }}>#</th>
                    <th>Subject</th>
                    <th>Classes Held</th>
                    <th>Attended</th>
                    <th>Missed</th>
                    <th>Attendance %</th>
                    <th>Eligibility & Guidance</th>
                    <th style={{ textAlign: "right" }}>Logs</th>
                  </tr>
                </thead>
                <tbody>
                  {subjectSummaries.map((sub, idx) => {
                    const isExpanded = expandedSubject === sub.subject;
                    return (
                      <React.Fragment key={sub.subject || idx}>
                        <tr
                          className="subject-row"
                          onClick={() => toggleExpand(sub.subject)}
                        >
                          <td style={{ fontWeight: 600, color: "#64748b" }}>
                            {idx + 1}
                          </td>
                          <td>
                            <SubjectNameCell>
                              <div className="name">{sub.subject}</div>
                              <div className="meta">
                                <span>{sub.department}</span>
                                {sub.batch && <span>{sub.batch}</span>}
                                {sub.section && <span>Sec {sub.section}</span>}
                                {sub.group && <span>Grp {sub.group}</span>}
                              </div>
                            </SubjectNameCell>
                          </td>
                          <td>
                            <span style={{ fontWeight: 700, color: "#0f172a" }}>
                              {sub.total}
                            </span>{" "}
                            <span style={{ fontSize: "12px", color: "#64748b" }}>
                              held
                            </span>
                          </td>
                          <td>
                            <PillCount $type="present">
                              <BsCheckCircleFill style={{ fontSize: "11px" }} />
                              {sub.present} Attended
                            </PillCount>
                          </td>
                          <td>
                            <PillCount $type="absent">
                              <BsXCircleFill style={{ fontSize: "11px" }} />
                              {sub.absent} Missed
                            </PillCount>
                          </td>
                          <td>
                            <AttendanceMeter $pct={sub.percentage}>
                              <span className="percent-val">
                                {sub.percentage}%
                              </span>
                              <div className="bar-track">
                                <div className="bar-fill" />
                              </div>
                            </AttendanceMeter>
                          </td>
                          <td>
                            <GuidanceBadge className={sub.adviceType}>
                              {sub.adviceType === "safe" ? (
                                <BsShieldCheck />
                              ) : (
                                <BsExclamationTriangleFill />
                              )}
                              {sub.advice}
                            </GuidanceBadge>
                          </td>
                          <td style={{ textAlign: "right", color: "#64748b" }}>
                            <button
                              type="button"
                              style={{
                                border: "1px solid #cbd5e1",
                                background: isExpanded ? "#f1f5f9" : "#ffffff",
                                padding: "4px 8px",
                                borderRadius: "6px",
                                fontSize: "12px",
                                fontWeight: 600,
                                color: "#334155",
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                            >
                              {isExpanded ? (
                                <>
                                  Close <BsChevronUp />
                                </>
                              ) : (
                                <>
                                  {sub.records.length} Dates <BsChevronDown />
                                </>
                              )}
                            </button>
                          </td>
                        </tr>

                        {/* Collapsible Date History for this Subject */}
                        {isExpanded && (
                          <tr className="expanded-row">
                            <td colSpan={8}>
                              <DateBreakdownTray>
                                <div className="tray-header">
                                  <span>
                                    Lecture History for <strong>{sub.subject}</strong> ({sub.records.length} sessions)
                                  </span>
                                  <span style={{ fontSize: "11px", color: "#64748b" }}>
                                    Click any session to view details
                                  </span>
                                </div>
                                <div className="chips-container">
                                  {sub.records.map((r, rIdx) => (
                                    <DateChip
                                      key={r._id || rIdx}
                                      $present={r.status === "Present"}
                                      title={`Date: ${r.date} | Status: ${r.status}`}
                                    >
                                      <span className="dot" />
                                      <strong>{r.date}</strong>: {r.status}
                                      {r.group && ` (${r.group})`}
                                    </DateChip>
                                  ))}
                                </div>
                              </DateBreakdownTray>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </SubjectTable>
            )}
          </Card>
        ) : (
          /* Chronological Date-Wise Fallback Tab */
          <Card>
            {loading ? (
              <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
                Loading attendance history...
              </div>
            ) : filteredDateRecords.length === 0 ? (
              <EmptyState>
                <div className="icon">
                  <BsCalendarCheck />
                </div>
                <h3>No Date Records Found</h3>
                <p>No date entries match your query.</p>
              </EmptyState>
            ) : (
              <DateWiseTable>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Date</th>
                    <th>Subject</th>
                    <th>Department & Batch</th>
                    <th>Class / Section</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDateRecords.map((item, index) => {
                    const isPresent = item.status === "Present";
                    return (
                      <tr key={item._id || index}>
                        <td style={{ fontWeight: 600, color: "#64748b" }}>
                          {index + 1}
                        </td>
                        <td style={{ fontWeight: 600, color: "#0f172a" }}>
                          {item.date}
                        </td>
                        <td>
                          <strong style={{ color: "#0f172a" }}>
                            {item.subject || "General Academics"}
                          </strong>
                        </td>
                        <td>
                          <span
                            style={{
                              background: "#f1f5f9",
                              padding: "3px 8px",
                              borderRadius: "6px",
                              fontSize: "12px",
                              color: "#475569",
                              marginRight: "4px",
                            }}
                          >
                            {item.department || "Computer Science"}
                          </span>
                          {item.batch && (
                            <span
                              style={{
                                background: "#f1f5f9",
                                padding: "3px 8px",
                                borderRadius: "6px",
                                fontSize: "12px",
                                color: "#475569",
                              }}
                            >
                              {item.batch}
                            </span>
                          )}
                        </td>
                        <td>
                          <span
                            style={{
                              background: "#f1f5f9",
                              padding: "3px 8px",
                              borderRadius: "6px",
                              fontSize: "12px",
                              color: "#475569",
                              marginRight: "4px",
                            }}
                          >
                            {item.section || "Sec A"}
                          </span>
                          {item.group && (
                            <span
                              style={{
                                background: "#f1f5f9",
                                padding: "3px 8px",
                                borderRadius: "6px",
                                fontSize: "12px",
                                color: "#475569",
                              }}
                            >
                              {item.group}
                            </span>
                          )}
                        </td>
                        <td>
                          <StatusBadge $present={isPresent}>
                            {isPresent ? <BsCheckCircleFill /> : <BsXCircleFill />}
                            {item.status}
                          </StatusBadge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </DateWiseTable>
            )}
          </Card>
        )}
      </Content>
    </Container>
  );
};

export default Attendance;

