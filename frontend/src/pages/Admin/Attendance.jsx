import React, { useState, useEffect, useMemo } from "react";
import AdminSidebar from "./Sidebar";
import {
  Content,
  AttendanceContent,
  AttendanceHeader,
  SubmitButton,
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableCell,
  TableContainer,
} from "../../styles/AttendanceStyles";
import styled from "styled-components";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { BACKEND_URL } from "../../constants/url";

export const AttendanceContainer = styled.div`
  display: flex;
  padding-left: 240px;

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

const FilterCard = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: center;
  background: #ffffff;
  padding: 18px 20px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin-bottom: 22px;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-size: 12px;
    font-weight: 700;
    color: #4a5568;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  input,
  select {
    padding: 9px 13px;
    border-radius: 8px;
    border: 1px solid #cbd5e0;
    font-size: 13px;
    outline: none;
    min-width: 160px;
    background: #fff;
    transition: border-color 0.2s;

    &:focus {
      border-color: #1abc9c;
      box-shadow: 0 0 0 3px rgba(26, 188, 156, 0.15);
    }
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 15px;
  margin-bottom: 22px;
`;

const StatCard = styled.div`
  background: #ffffff;
  padding: 16px 20px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border-left: 4px solid ${(props) => props.color || "#1ABC9C"};

  .label {
    font-size: 12px;
    color: #718096;
    font-weight: 600;
    text-transform: uppercase;
  }

  .value {
    font-size: 22px;
    font-weight: 700;
    color: #2d3748;
    margin-top: 4px;
  }
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: ${(props) => (props.status === "Present" ? "#DEF7EC" : "#FDE8E8")};
  color: ${(props) => (props.status === "Present" ? "#03543F" : "#9B1C1C")};
`;

const HealthBadge = styled.span`
  display: inline-block;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  background: ${(props) => {
    if (props.$health === "Good") return "#DEF7EC";
    if (props.$health === "Warning") return "#FEF08A";
    return "#FDE8E8";
  }};
  color: ${(props) => {
    if (props.$health === "Good") return "#03543F";
    if (props.$health === "Warning") return "#854D0E";
    return "#9B1C1C";
  }};
`;

const ActionRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  flex-wrap: wrap;
  gap: 10px;
`;

const QuickButton = styled.button`
  background: #edf2f7;
  color: #2d3748;
  border: 1px solid #cbd5e0;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #e2e8f0;
  }
`;

const ModalOverlay = styled.div`
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

const ModalBox = styled.div`
  background: white;
  border-radius: 14px;
  padding: 24px;
  width: 90%;
  max-width: 650px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
  position: relative;
`;

const PaginationBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  background: white;
  border-top: 1px solid #e2e8f0;
  border-radius: 0 0 10px 10px;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 13px;
  color: #64748b;

  .controls {
    display: flex;
    gap: 8px;
    align-items: center;

    button {
      padding: 6px 12px;
      border: 1px solid #cbd5e1;
      background: white;
      border-radius: 6px;
      font-size: 12px;
      cursor: pointer;
      font-weight: 600;

      &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      &:hover:not(:disabled) {
        background: #f1f5f9;
      }
    }
  }
`;

const CS_SUBJECTS = [
  "Data Structures & Algorithms",
  "Database Management Systems (DBMS)",
  "Operating Systems",
  "Computer Networks",
  "Object Oriented Programming (Java/C++)",
  "Software Engineering & Architecture",
  "Theory of Computation",
  "Artificial Intelligence & Machine Learning",
  "Web Technologies & Full Stack Development",
  "Cyber Security & Cryptography",
  "Cloud Computing & Distributed Systems",
  "Computer Organization & Architecture",
  "Discrete Mathematics & Graph Theory",
];

const AdminAttendance = () => {
  const [activeTab, setActiveTab] = useState("mark"); // "mark" | "view"
  const [viewSubMode, setViewSubMode] = useState("aggregated"); // "aggregated" | "sessions"

  // MARK ATTENDANCE STATE
  const [allStudents, setAllStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("all");
  const [attendance, setAttendance] = useState({});
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [department, setDepartment] = useState("Computer Science"); // All students under CS for now
  
  // Subject state (Pre-defined CS subjects + Custom entry)
  const [selectedSubject, setSelectedSubject] = useState(CS_SUBJECTS[0]);
  const [isCustomSubject, setIsCustomSubject] = useState(false);
  const [customSubject, setCustomSubject] = useState("");

  // Separate Section & Group fields
  const [selectedSection, setSelectedSection] = useState(""); // empty initially until user chooses
  const [selectedGroup, setSelectedGroup] = useState("");     // empty initially until user chooses

  const [markSortBy, setMarkSortBy] = useState("rollno-asc"); // "rollno-asc" | "rollno-desc" | "name-asc" | "name-desc"
  const [markPageSize, setMarkPageSize] = useState(25);
  const [markCurrentPage, setMarkCurrentPage] = useState(1);
  const [submittingMark, setSubmittingMark] = useState(false);

  // VIEW ATTENDANCE (AGGREGATED & SESSIONS) STATE
  const [aggregatedData, setAggregatedData] = useState([]);
  const [aggStats, setAggStats] = useState({ totalStudents: 0, goodCount: 0, warningCount: 0, criticalCount: 0 });
  const [loadingAggregated, setLoadingAggregated] = useState(false);
  const [aggSearch, setAggSearch] = useState("");
  const [aggBatch, setAggBatch] = useState("all");
  const [aggDepartment, setAggDepartment] = useState("all");
  const [aggSubject, setAggSubject] = useState("all");
  const [aggSection, setAggSection] = useState("all");
  const [aggGroup, setAggGroup] = useState("all");
  const [aggPageSize, setAggPageSize] = useState(15);
  const [aggCurrentPage, setAggCurrentPage] = useState(1);

  // Detail Modal for Student Attendance History
  const [selectedStudentLogs, setSelectedStudentLogs] = useState(null);

  // Raw Sessions state
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [filterDate, setFilterDate] = useState("");
  const [filterBatch, setFilterBatch] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchStudent, setSearchStudent] = useState("");
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [stats, setStats] = useState({ total: 0, present: 0, absent: 0, percentage: 0 });

  const effectiveSubject = isCustomSubject ? customSubject.trim() : selectedSubject;

  // 1. Fetch all students & distinct batches
  const fetchStudents = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}api/v1/attendance/students`);
      if (Array.isArray(response.data)) {
        setAllStudents(response.data);
        const uniqueBatches = Array.from(
          new Set(response.data.map((s) => s.batch).filter(Boolean))
        );
        setBatches(uniqueBatches);

        const initial = response.data.reduce((acc, student) => {
          acc[student._id] = "Present";
          return acc;
        }, {});
        setAttendance(initial);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // 2. Fetch Aggregated Attendance
  const fetchAggregatedData = async () => {
    setLoadingAggregated(true);
    try {
      const params = {};
      if (aggBatch !== "all") params.batch = aggBatch;
      if (aggDepartment !== "all") params.department = aggDepartment;
      if (aggSubject !== "all") params.subject = aggSubject;
      if (aggSection !== "all") params.section = aggSection;
      if (aggGroup !== "all") params.group = aggGroup;
      if (aggSearch.trim()) params.search = aggSearch.trim();

      const res = await axios.get(`${BACKEND_URL}api/v1/attendance/aggregated`, { params });
      if (res.data?.success) {
        setAggregatedData(res.data.aggregated || []);
        setAggStats(res.data.stats || { totalStudents: 0, goodCount: 0, warningCount: 0, criticalCount: 0 });
      }
    } catch (err) {
      console.error("Error fetching aggregated attendance:", err);
      toast.error("Failed to load aggregated attendance records.");
    } finally {
      setLoadingAggregated(false);
    }
  };

  // 3. Fetch Raw Records
  const fetchRecords = async () => {
    setLoadingRecords(true);
    try {
      const params = {};
      if (filterDate) params.date = filterDate;
      if (filterBatch !== "all") params.batch = filterBatch;
      if (filterStatus !== "all") params.status = filterStatus;
      if (searchStudent.trim()) params.search = searchStudent.trim();

      const response = await axios.get(`${BACKEND_URL}api/v1/attendance/records`, { params });
      if (response.data.success) {
        setAttendanceRecords(response.data.attendanceRecords || []);
        setStats(response.data.stats || { total: 0, present: 0, absent: 0, percentage: 0 });
      }
    } catch (error) {
      console.error("Error fetching attendance records:", error);
      toast.error("Failed to fetch attendance records.");
    } finally {
      setLoadingRecords(false);
    }
  };

  useEffect(() => {
    if (activeTab === "view") {
      if (viewSubMode === "aggregated") {
        fetchAggregatedData();
      } else {
        fetchRecords();
      }
    }
  }, [activeTab, viewSubMode, aggBatch, aggDepartment, aggSubject, aggSection, aggGroup, aggSearch, filterDate, filterBatch, filterStatus, searchStudent]);

  // Clean string helper for flexible matching
  const cleanStr = (val) => (val || "").toString().toLowerCase().trim();

  // Strict filtered students for marking:
  // USER REQUIREMENT: All students are under Computer Science. Only show them when both Group and Section separately match!
  const sortedAndFilteredStudents = useMemo(() => {
    if (!selectedSection || !selectedGroup) {
      return []; // Do not display until both Section and Group are selected
    }

    let list = allStudents;

    // Filter department (Computer Science)
    if (department && department !== "all") {
      list = list.filter((s) => !s.department || cleanStr(s.department) === cleanStr(department));
    }

    if (selectedBatch !== "all") {
      list = list.filter((s) => s.batch === selectedBatch);
    }

    // Match Section (e.g. "Section A" matches "A" or "Section A")
    const targetSec = cleanStr(selectedSection).replace(/^section\s*/, "");
    list = list.filter((s) => {
      const sSec = cleanStr(s.section).replace(/^section\s*/, "");
      return sSec === targetSec;
    });

    // Match Group (e.g. "Group 1" or "G1" matches "G1", "1", "Group 1")
    const targetGrp = cleanStr(selectedGroup).replace(/^group\s*/, "").replace(/^g/, "");
    list = list.filter((s) => {
      const sGrp = cleanStr(s.group).replace(/^group\s*/, "").replace(/^g/, "");
      return sGrp === targetGrp;
    });

    const sorted = [...list].sort((a, b) => {
      if (markSortBy === "rollno-asc") {
        return (a.rollno || "").localeCompare(b.rollno || "", undefined, { numeric: true });
      }
      if (markSortBy === "rollno-desc") {
        return (b.rollno || "").localeCompare(a.rollno || "", undefined, { numeric: true });
      }
      if (markSortBy === "name-asc") {
        return (a.name || "").localeCompare(b.name || "");
      }
      if (markSortBy === "name-desc") {
        return (b.name || "").localeCompare(a.name || "");
      }
      return 0;
    });

    return sorted;
  }, [allStudents, selectedBatch, department, selectedSection, selectedGroup, markSortBy]);

  // Paginated students for marking
  const paginatedMarkStudents = useMemo(() => {
    if (markPageSize === "all") return sortedAndFilteredStudents;
    const start = (markCurrentPage - 1) * Number(markPageSize);
    return sortedAndFilteredStudents.slice(start, start + Number(markPageSize));
  }, [sortedAndFilteredStudents, markPageSize, markCurrentPage]);

  // Paginated aggregated records
  const paginatedAggregatedData = useMemo(() => {
    if (aggPageSize === "all") return aggregatedData;
    const start = (aggCurrentPage - 1) * Number(aggPageSize);
    return aggregatedData.slice(start, start + Number(aggPageSize));
  }, [aggregatedData, aggPageSize, aggCurrentPage]);

  const handleAttendanceChange = (studentId, status) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const setAllStatus = (status) => {
    const updated = { ...attendance };
    sortedAndFilteredStudents.forEach((s) => {
      updated[s._id] = status;
    });
    setAttendance(updated);
  };

  // Submit attendance
  const handleSubmitAttendance = async () => {
    try {
      if (!date) {
        toast.error("Please select a date.");
        return;
      }
      if (!effectiveSubject) {
        toast.error("Please specify a course subject.");
        return;
      }
      if (!selectedSection) {
        toast.error("Please select an academic Section.");
        return;
      }
      if (!selectedGroup) {
        toast.error("Please select an academic Group.");
        return;
      }
      if (sortedAndFilteredStudents.length === 0) {
        toast.error("No students match the selected Section and Group.");
        return;
      }

      setSubmittingMark(true);
      const attendancePayload = {};
      sortedAndFilteredStudents.forEach((s) => {
        attendancePayload[s._id] = attendance[s._id] || "Present";
      });

      const res = await axios.post(`${BACKEND_URL}api/v1/attendance/attendance`, {
        attendance: attendancePayload,
        date,
        batch: selectedBatch,
        department,
        subject: effectiveSubject,
        section: selectedSection,
        group: selectedGroup,
      });

      if (res.data?.success) {
        toast.success(
          `Attendance successfully saved for ${sortedAndFilteredStudents.length} students (${effectiveSubject} - ${selectedSection} / ${selectedGroup})!`
        );
      }
    } catch (error) {
      console.error("Error submitting attendance:", error);
      toast.error("Failed to submit attendance.");
    } finally {
      setSubmittingMark(false);
    }
  };

  return (
    <>
      <AttendanceContainer>
        <AdminSidebar />
        <Content>
          <AttendanceContent>
            <AttendanceHeader>Comprehensive Attendance Management</AttendanceHeader>

            {/* Navigation Tabs */}
            <TabContainer>
              <TabButton
                active={activeTab === "mark"}
                onClick={() => setActiveTab("mark")}
              >
                📝 Mark Session Attendance
              </TabButton>
              <TabButton
                active={activeTab === "view"}
                onClick={() => setActiveTab("view")}
              >
                📊 High-Scale Attendance Ledger & Analytics
              </TabButton>
            </TabContainer>

            {/* TAB 1: MARK ATTENDANCE */}
            {activeTab === "mark" && (
              <>
                <FilterCard>
                  <FilterGroup>
                    <label>Session Date</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                    />
                  </FilterGroup>

                  <FilterGroup>
                    <label>Department (Default CS)</label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                    >
                      <option value="Computer Science">Computer Science (Active)</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="Mechanical Engineering">Mechanical Engineering</option>
                      <option value="Electronics & Communication">Electronics & Comm.</option>
                      <option value="Civil Engineering">Civil Engineering</option>
                      <option value="Electrical Engineering">Electrical Engineering</option>
                    </select>
                  </FilterGroup>

                  <FilterGroup style={{ minWidth: "220px" }}>
                    <label>Course / Subject</label>
                    <select
                      value={isCustomSubject ? "__custom__" : selectedSubject}
                      onChange={(e) => {
                        if (e.target.value === "__custom__") {
                          setIsCustomSubject(true);
                        } else {
                          setIsCustomSubject(false);
                          setSelectedSubject(e.target.value);
                        }
                      }}
                    >
                      {CS_SUBJECTS.map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                      <option value="__custom__">➕ Add My Own Subject (Custom)</option>
                    </select>
                  </FilterGroup>

                  {isCustomSubject && (
                    <FilterGroup style={{ minWidth: "200px" }}>
                      <label style={{ color: "#0f766e" }}>Custom Subject Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Distributed Computing"
                        value={customSubject}
                        onChange={(e) => setCustomSubject(e.target.value)}
                        required
                        style={{ borderColor: "#0f766e" }}
                      />
                    </FilterGroup>
                  )}

                  <FilterGroup>
                    <label style={{ color: "#0f766e" }}>Section *</label>
                    <select
                      value={selectedSection}
                      onChange={(e) => {
                        setSelectedSection(e.target.value);
                        setMarkCurrentPage(1);
                      }}
                      required
                    >
                      <option value="">-- Choose Section --</option>
                      <option value="Section A">Section A</option>
                      <option value="Section B">Section B</option>
                      <option value="Section C">Section C</option>
                      <option value="Section D">Section D</option>
                    </select>
                  </FilterGroup>

                  <FilterGroup>
                    <label style={{ color: "#0f766e" }}>Group *</label>
                    <select
                      value={selectedGroup}
                      onChange={(e) => {
                        setSelectedGroup(e.target.value);
                        setMarkCurrentPage(1);
                      }}
                      required
                    >
                      <option value="">-- Choose Group --</option>
                      <option value="Group 1">Group 1 (G1)</option>
                      <option value="Group 2">Group 2 (G2)</option>
                      <option value="Group 3">Group 3 (G3)</option>
                      <option value="Group 4">Group 4 (G4)</option>
                    </select>
                  </FilterGroup>

                  <FilterGroup>
                    <label>Academic Batch</label>
                    <select
                      value={selectedBatch}
                      onChange={(e) => {
                        setSelectedBatch(e.target.value);
                        setMarkCurrentPage(1);
                      }}
                    >
                      <option value="all">All Batches</option>
                      {batches.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </FilterGroup>

                  <FilterGroup>
                    <label>Sort By</label>
                    <select
                      value={markSortBy}
                      onChange={(e) => setMarkSortBy(e.target.value)}
                    >
                      <option value="rollno-asc">Roll No (Low to High)</option>
                      <option value="rollno-desc">Roll No (High to Low)</option>
                      <option value="name-asc">Student Name (A → Z)</option>
                      <option value="name-desc">Student Name (Z → A)</option>
                    </select>
                  </FilterGroup>

                  <FilterGroup>
                    <label>Page Size</label>
                    <select
                      value={markPageSize}
                      onChange={(e) => {
                        setMarkPageSize(e.target.value);
                        setMarkCurrentPage(1);
                      }}
                    >
                      <option value="15">15 per page</option>
                      <option value="25">25 per page</option>
                      <option value="50">50 per page</option>
                      <option value="all">Show All</option>
                    </select>
                  </FilterGroup>
                </FilterCard>

                {/* USER REQUIREMENT: Show students ONLY when their group and section separately are asked and matched */}
                {!selectedSection || !selectedGroup ? (
                  <div
                    style={{
                      background: "#f0fdf4",
                      border: "2px dashed #0f766e",
                      borderRadius: "14px",
                      padding: "44px 24px",
                      textAlign: "center",
                      margin: "24px 0",
                    }}
                  >
                    <div style={{ fontSize: "42px", marginBottom: "12px" }}>🎯</div>
                    <h3
                      style={{
                        margin: "0 0 8px 0",
                        color: "#0f766e",
                        fontSize: "18px",
                        fontWeight: 700,
                      }}
                    >
                      Select Both Section & Group to Load Students
                    </h3>
                    <p
                      style={{
                        margin: "0 auto",
                        color: "#334155",
                        fontSize: "14px",
                        maxWidth: "600px",
                        lineHeight: 1.6,
                      }}
                    >
                      All enrolled students currently belong to <strong>Computer Science</strong>. To avoid data clutter, select both an individual <strong>Section</strong> (e.g. Section A) and <strong>Group</strong> (e.g. Group 1) above. Student rosters will appear only when both match.
                    </p>
                  </div>
                ) : sortedAndFilteredStudents.length === 0 ? (
                  <div
                    style={{
                      background: "#fffbeb",
                      border: "1px solid #fef3c7",
                      borderRadius: "14px",
                      padding: "44px 24px",
                      textAlign: "center",
                      margin: "24px 0",
                    }}
                  >
                    <div style={{ fontSize: "42px", marginBottom: "12px" }}>🔍</div>
                    <h3
                      style={{
                        margin: "0 0 8px 0",
                        color: "#92400e",
                        fontSize: "18px",
                        fontWeight: 700,
                      }}
                    >
                      No Computer Science Students Found in {selectedSection} • {selectedGroup}
                    </h3>
                    <p
                      style={{
                        margin: "0 auto",
                        color: "#b45309",
                        fontSize: "14px",
                        maxWidth: "560px",
                      }}
                    >
                      No enrolled student records currently match both {selectedSection} and {selectedGroup}. You can manage and allocate sections in Master Control or select another section/group.
                    </p>
                  </div>
                ) : (
                  <>
                    <ActionRow>
                      <span style={{ color: "#475569", fontSize: "14px", fontWeight: 600 }}>
                        Enrolled Cohort: <strong>{sortedAndFilteredStudents.length} Students</strong> | Course:{" "}
                        <strong style={{ color: "#0f766e" }}>{effectiveSubject}</strong> ({selectedSection} • {selectedGroup})
                      </span>
                      <div style={{ display: "flex", gap: "10px" }}>
                        <QuickButton onClick={() => setAllStatus("Present")}>
                          ✓ Mark Entire Class Present
                        </QuickButton>
                        <QuickButton onClick={() => setAllStatus("Absent")}>
                          ✕ Mark Entire Class Absent
                        </QuickButton>
                      </div>
                    </ActionRow>

                    <TableContainer>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHeaderCell>Roll Number</TableHeaderCell>
                            <TableHeaderCell>Student Name</TableHeaderCell>
                            <TableHeaderCell>Dept & Section</TableHeaderCell>
                            <TableHeaderCell>Batch</TableHeaderCell>
                            <TableHeaderCell>Email</TableHeaderCell>
                            <TableHeaderCell>Attendance Status</TableHeaderCell>
                          </TableRow>
                        </TableHeader>
                        <tbody>
                          {paginatedMarkStudents.map((student) => (
                            <TableRow key={student._id}>
                              <TableCell style={{ fontWeight: 700, color: "#0f766e" }}>{student.rollno}</TableCell>
                              <TableCell style={{ fontWeight: 600 }}>{student.name || "N/A"}</TableCell>
                              <TableCell>
                                <span style={{ fontWeight: 600 }}>{student.department || department}</span>
                                <span style={{ marginLeft: "6px", background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px", fontSize: "11px" }}>
                                  Sec {student.section || "A"} • {student.group || "G1"}
                                </span>
                              </TableCell>
                              <TableCell>
                                <span
                                  style={{
                                    background: "#edf2f7",
                                    padding: "3px 8px",
                                    borderRadius: "4px",
                                    fontSize: "12px",
                                    fontWeight: 600,
                                  }}
                                >
                                  {student.batch || "General"}
                                </span>
                              </TableCell>
                              <TableCell style={{ color: "#64748b", fontSize: "12px" }}>{student.email || "N/A"}</TableCell>
                              <TableCell>
                                <label
                                  style={{
                                    marginRight: "18px",
                                    cursor: "pointer",
                                    color: "#059669",
                                    fontWeight: "bold",
                                  }}
                                >
                                  <input
                                    type="radio"
                                    name={`attendance-${student._id}`}
                                    checked={attendance[student._id] === "Present"}
                                    onChange={() =>
                                      handleAttendanceChange(student._id, "Present")
                                    }
                                    style={{ marginRight: "5px" }}
                                  />
                                  Present
                                </label>
                                <label
                                  style={{
                                    cursor: "pointer",
                                    color: "#DC2626",
                                    fontWeight: "bold",
                                  }}
                                >
                                  <input
                                    type="radio"
                                    name={`attendance-${student._id}`}
                                    checked={attendance[student._id] === "Absent"}
                                    onChange={() =>
                                      handleAttendanceChange(student._id, "Absent")
                                    }
                                    style={{ marginRight: "5px" }}
                                  />
                                  Absent
                                </label>
                              </TableCell>
                            </TableRow>
                          ))}
                        </tbody>
                      </Table>

                      {markPageSize !== "all" && sortedAndFilteredStudents.length > Number(markPageSize) && (
                        <PaginationBar>
                          <span>
                            Showing {(markCurrentPage - 1) * Number(markPageSize) + 1} to{" "}
                            {Math.min(markCurrentPage * Number(markPageSize), sortedAndFilteredStudents.length)} of{" "}
                            {sortedAndFilteredStudents.length} students
                          </span>
                          <div className="controls">
                            <button
                              type="button"
                              disabled={markCurrentPage <= 1}
                              onClick={() => setMarkCurrentPage((p) => p - 1)}
                            >
                              ← Previous
                            </button>
                            <span>
                              Page {markCurrentPage} of {Math.ceil(sortedAndFilteredStudents.length / Number(markPageSize))}
                            </span>
                            <button
                              type="button"
                              disabled={markCurrentPage >= Math.ceil(sortedAndFilteredStudents.length / Number(markPageSize))}
                              onClick={() => setMarkCurrentPage((p) => p + 1)}
                            >
                              Next →
                            </button>
                          </div>
                        </PaginationBar>
                      )}
                    </TableContainer>

                    <SubmitButton
                      onClick={handleSubmitAttendance}
                      disabled={submittingMark}
                      style={{ marginTop: "20px" }}
                    >
                      {submittingMark
                        ? "Saving Attendance..."
                        : `✓ Submit Attendance (${date} • ${effectiveSubject} • ${selectedSection} / ${selectedGroup})`}
                    </SubmitButton>
                  </>
                )}
              </>
            )}

            {/* TAB 2: VIEW ATTENDANCE & FILTERS */}
            {activeTab === "view" && (
              <>
                {/* SUB-VIEW TOGGLE */}
                <div style={{ display: "flex", gap: "10px", marginBottom: "18px" }}>
                  <button
                    type="button"
                    onClick={() => setViewSubMode("aggregated")}
                    style={{
                      background: viewSubMode === "aggregated" ? "#0f766e" : "#f1f5f9",
                      color: viewSubMode === "aggregated" ? "#ffffff" : "#475569",
                      fontWeight: 700,
                      fontSize: "13px",
                      padding: "8px 18px",
                      borderRadius: "6px",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    📈 Aggregated Student Ledger (High-Scale Overview)
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewSubMode("sessions")}
                    style={{
                      background: viewSubMode === "sessions" ? "#0f766e" : "#f1f5f9",
                      color: viewSubMode === "sessions" ? "#ffffff" : "#475569",
                      fontWeight: 700,
                      fontSize: "13px",
                      padding: "8px 18px",
                      borderRadius: "6px",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    📅 Raw Session Logs (Date-wise)
                  </button>
                </div>

                {viewSubMode === "aggregated" ? (
                  <>
                    {/* Stats Summary Cards for Aggregated View */}
                    <StatsGrid>
                      <StatCard color="#1ABC9C">
                        <div className="label">Total Students</div>
                        <div className="value">{aggStats.totalStudents}</div>
                      </StatCard>
                      <StatCard color="#059669">
                        <div className="label">Good Standing (&gt;75%)</div>
                        <div className="value">{aggStats.goodCount}</div>
                      </StatCard>
                      <StatCard color="#F59E0B">
                        <div className="label">Borderline (60-75%)</div>
                        <div className="value">{aggStats.warningCount}</div>
                      </StatCard>
                      <StatCard color="#DC2626">
                        <div className="label">Defaulters (&lt;60%)</div>
                        <div className="value">{aggStats.criticalCount}</div>
                      </StatCard>
                    </StatsGrid>

                    {/* High-Scale Filters */}
                    <FilterCard>
                      <FilterGroup style={{ flex: 1 }}>
                        <label>Search Student</label>
                        <input
                          type="text"
                          placeholder="Search name, roll no, or email..."
                          value={aggSearch}
                          onChange={(e) => {
                            setAggSearch(e.target.value);
                            setAggCurrentPage(1);
                          }}
                        />
                      </FilterGroup>

                      <FilterGroup>
                        <label>Filter Batch</label>
                        <select
                          value={aggBatch}
                          onChange={(e) => {
                            setAggBatch(e.target.value);
                            setAggCurrentPage(1);
                          }}
                        >
                          <option value="all">All Batches</option>
                          {batches.map((b) => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </select>
                      </FilterGroup>

                      <FilterGroup>
                        <label>Department</label>
                        <select
                          value={aggDepartment}
                          onChange={(e) => {
                            setAggDepartment(e.target.value);
                            setAggCurrentPage(1);
                          }}
                        >
                          <option value="all">All Departments</option>
                          <option value="Computer Science">Computer Science</option>
                          <option value="Information Technology">Information Technology</option>
                          <option value="Mechanical Engineering">Mechanical Engineering</option>
                          <option value="Electronics & Communication">Electronics & Comm.</option>
                          <option value="Civil Engineering">Civil Engineering</option>
                          <option value="Electrical Engineering">Electrical Engineering</option>
                        </select>
                      </FilterGroup>

                      <FilterGroup>
                        <label>Subject</label>
                        <input
                          type="text"
                          placeholder="Filter by subject..."
                          value={aggSubject === "all" ? "" : aggSubject}
                          onChange={(e) => {
                            setAggSubject(e.target.value || "all");
                            setAggCurrentPage(1);
                          }}
                        />
                      </FilterGroup>

                      <FilterGroup>
                        <label>Section</label>
                        <select
                          value={aggSection}
                          onChange={(e) => {
                            setAggSection(e.target.value);
                            setAggCurrentPage(1);
                          }}
                        >
                          <option value="all">All Sections</option>
                          <option value="Section A">Section A</option>
                          <option value="Section B">Section B</option>
                          <option value="Section C">Section C</option>
                          <option value="Section D">Section D</option>
                        </select>
                      </FilterGroup>

                      <FilterGroup>
                        <label>Group</label>
                        <select
                          value={aggGroup}
                          onChange={(e) => {
                            setAggGroup(e.target.value);
                            setAggCurrentPage(1);
                          }}
                        >
                          <option value="all">All Groups</option>
                          <option value="Group 1">Group 1 (G1)</option>
                          <option value="Group 2">Group 2 (G2)</option>
                          <option value="Group 3">Group 3 (G3)</option>
                          <option value="Group 4">Group 4 (G4)</option>
                        </select>
                      </FilterGroup>

                      <FilterGroup>
                        <label>Page Size</label>
                        <select
                          value={aggPageSize}
                          onChange={(e) => {
                            setAggPageSize(e.target.value);
                            setAggCurrentPage(1);
                          }}
                        >
                          <option value="15">15 per page</option>
                          <option value="25">25 per page</option>
                          <option value="50">50 per page</option>
                          <option value="all">Show All</option>
                        </select>
                      </FilterGroup>
                    </FilterCard>

                    {/* Aggregated Table */}
                    <TableContainer>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHeaderCell>Roll No</TableHeaderCell>
                            <TableHeaderCell>Student</TableHeaderCell>
                            <TableHeaderCell>Dept & Group</TableHeaderCell>
                            <TableHeaderCell>Batch</TableHeaderCell>
                            <TableHeaderCell>Classes Held</TableHeaderCell>
                            <TableHeaderCell>Attended</TableHeaderCell>
                            <TableHeaderCell>Absent</TableHeaderCell>
                            <TableHeaderCell>Rate (%)</TableHeaderCell>
                            <TableHeaderCell>Health</TableHeaderCell>
                            <TableHeaderCell>Audit Trail</TableHeaderCell>
                          </TableRow>
                        </TableHeader>
                        <tbody>
                          {loadingAggregated ? (
                            <TableRow>
                              <TableCell colSpan="10" style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                                Aggregating large-scale attendance data...
                              </TableCell>
                            </TableRow>
                          ) : paginatedAggregatedData.length > 0 ? (
                            paginatedAggregatedData.map((s) => (
                              <TableRow key={s._id}>
                                <TableCell style={{ fontWeight: 700, color: "#0f766e" }}>{s.rollno}</TableCell>
                                <TableCell>
                                  <div style={{ fontWeight: 600 }}>{s.name}</div>
                                  <div style={{ fontSize: "11px", color: "#64748b" }}>{s.email}</div>
                                </TableCell>
                                <TableCell>
                                  {s.department || "General"} • {s.group || "A"}
                                </TableCell>
                                <TableCell>
                                  <span style={{ background: "#edf2f7", padding: "2px 6px", borderRadius: "4px", fontSize: "11px" }}>
                                    {s.batch}
                                  </span>
                                </TableCell>
                                <TableCell style={{ fontWeight: 600 }}>{s.totalClasses}</TableCell>
                                <TableCell style={{ fontWeight: 700, color: "#16a34a" }}>{s.presentCount}</TableCell>
                                <TableCell style={{ fontWeight: 700, color: "#dc2626" }}>{s.absentCount}</TableCell>
                                <TableCell>
                                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                    <div
                                      style={{
                                        width: "50px",
                                        height: "6px",
                                        background: "#e2e8f0",
                                        borderRadius: "3px",
                                        overflow: "hidden",
                                      }}
                                    >
                                      <div
                                        style={{
                                          width: `${s.percentage}%`,
                                          height: "100%",
                                          background: s.percentage >= 75 ? "#16a34a" : s.percentage >= 60 ? "#d97706" : "#dc2626",
                                        }}
                                      />
                                    </div>
                                    <span style={{ fontWeight: 700, fontSize: "12px" }}>{s.percentage}%</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <HealthBadge $health={s.health}>{s.health}</HealthBadge>
                                </TableCell>
                                <TableCell>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedStudentLogs(s)}
                                    style={{
                                      background: "#f1f5f9",
                                      color: "#0f766e",
                                      border: "1px solid #cbd5e1",
                                      borderRadius: "6px",
                                      padding: "4px 10px",
                                      fontSize: "12px",
                                      fontWeight: 600,
                                      cursor: "pointer",
                                    }}
                                  >
                                    📜 View Logs ({s.records?.length || 0})
                                  </button>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan="10" style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                                No students match the filter criteria.
                              </TableCell>
                            </TableRow>
                          )}
                        </tbody>
                      </Table>

                      {aggPageSize !== "all" && aggregatedData.length > Number(aggPageSize) && (
                        <PaginationBar>
                          <span>
                            Showing {(aggCurrentPage - 1) * Number(aggPageSize) + 1} to{" "}
                            {Math.min(aggCurrentPage * Number(aggPageSize), aggregatedData.length)} of{" "}
                            {aggregatedData.length} students
                          </span>
                          <div className="controls">
                            <button
                              type="button"
                              disabled={aggCurrentPage <= 1}
                              onClick={() => setAggCurrentPage((p) => p - 1)}
                            >
                              ← Previous
                            </button>
                            <span>
                              Page {aggCurrentPage} of {Math.ceil(aggregatedData.length / Number(aggPageSize))}
                            </span>
                            <button
                              type="button"
                              disabled={aggCurrentPage >= Math.ceil(aggregatedData.length / Number(aggPageSize))}
                              onClick={() => setAggCurrentPage((p) => p + 1)}
                            >
                              Next →
                            </button>
                          </div>
                        </PaginationBar>
                      )}
                    </TableContainer>
                  </>
                ) : (
                  <>
                    {/* Stats Summary Cards for Raw Records */}
                    <StatsGrid>
                      <StatCard color="#1ABC9C">
                        <div className="label">Total Records</div>
                        <div className="value">{stats.total}</div>
                      </StatCard>
                      <StatCard color="#059669">
                        <div className="label">Total Present</div>
                        <div className="value">{stats.present}</div>
                      </StatCard>
                      <StatCard color="#DC2626">
                        <div className="label">Total Absent</div>
                        <div className="value">{stats.absent}</div>
                      </StatCard>
                      <StatCard color="#3B82F6">
                        <div className="label">Attendance Rate</div>
                        <div className="value">{stats.percentage}%</div>
                      </StatCard>
                    </StatsGrid>

                    {/* Filters */}
                    <FilterCard>
                      <FilterGroup>
                        <label>Filter Date</label>
                        <input
                          type="date"
                          value={filterDate}
                          onChange={(e) => setFilterDate(e.target.value)}
                        />
                      </FilterGroup>

                      <FilterGroup>
                        <label>Filter Batch</label>
                        <select
                          value={filterBatch}
                          onChange={(e) => setFilterBatch(e.target.value)}
                        >
                          <option value="all">All Batches</option>
                          {batches.map((b) => (
                            <option key={b} value={b}>
                              {b}
                            </option>
                          ))}
                        </select>
                      </FilterGroup>

                      <FilterGroup>
                        <label>Status</label>
                        <select
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                        >
                          <option value="all">All Statuses</option>
                          <option value="Present">Present Only</option>
                          <option value="Absent">Absent Only</option>
                        </select>
                      </FilterGroup>

                      <FilterGroup style={{ flex: 1 }}>
                        <label>Search Student</label>
                        <input
                          type="text"
                          placeholder="Search name or roll no..."
                          value={searchStudent}
                          onChange={(e) => setSearchStudent(e.target.value)}
                        />
                      </FilterGroup>

                      {(filterDate || filterBatch !== "all" || filterStatus !== "all" || searchStudent) && (
                        <QuickButton
                          style={{ marginTop: "18px" }}
                          onClick={() => {
                            setFilterDate("");
                            setFilterBatch("all");
                            setFilterStatus("all");
                            setSearchStudent("");
                          }}
                        >
                          Clear Filters
                        </QuickButton>
                      )}
                    </FilterCard>

                    {/* Records Table */}
                    <TableContainer>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHeaderCell>Date</TableHeaderCell>
                            <TableHeaderCell>Roll Number</TableHeaderCell>
                            <TableHeaderCell>Student Name</TableHeaderCell>
                            <TableHeaderCell>Subject</TableHeaderCell>
                            <TableHeaderCell>Batch</TableHeaderCell>
                            <TableHeaderCell>Status</TableHeaderCell>
                          </TableRow>
                        </TableHeader>
                        <tbody>
                          {loadingRecords ? (
                            <TableRow>
                              <TableCell colSpan="6" style={{ textAlign: "center", padding: "30px" }}>
                                Loading attendance records...
                              </TableCell>
                            </TableRow>
                          ) : attendanceRecords.length > 0 ? (
                            attendanceRecords.map((record) => (
                              <TableRow key={record._id}>
                                <TableCell style={{ fontWeight: 600 }}>{record.date}</TableCell>
                                <TableCell>{record.student?.rollno || "N/A"}</TableCell>
                                <TableCell>{record.student?.name || "N/A"}</TableCell>
                                <TableCell>{record.subject || "General"}</TableCell>
                                <TableCell>
                                  <span
                                    style={{
                                      background: "#EDF2F7",
                                      padding: "3px 8px",
                                      borderRadius: "4px",
                                      fontSize: "12px",
                                    }}
                                  >
                                    {record.batch || record.student?.batch || "General"}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <StatusBadge status={record.status}>{record.status}</StatusBadge>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan="6" style={{ textAlign: "center", padding: "30px" }}>
                                No attendance records match your current filter.
                              </TableCell>
                            </TableRow>
                          )}
                        </tbody>
                      </Table>
                    </TableContainer>
                  </>
                )}
              </>
            )}

            {/* AUDIT LOG MODAL FOR SINGLE STUDENT SESSIONS */}
            {selectedStudentLogs && (
              <ModalOverlay>
                <ModalBox>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: "18px", color: "#1e293b" }}>
                        Attendance Sessions: {selectedStudentLogs.name}
                      </h3>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>
                        Roll No: {selectedStudentLogs.rollno} | Rate: {selectedStudentLogs.percentage}% ({selectedStudentLogs.presentCount}/{selectedStudentLogs.totalClasses} classes)
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedStudentLogs(null)}
                      style={{
                        background: "#f1f5f9",
                        border: "none",
                        borderRadius: "50%",
                        width: "30px",
                        height: "30px",
                        cursor: "pointer",
                        fontWeight: "bold",
                      }}
                    >
                      ✕
                    </button>
                  </div>

                  {(!selectedStudentLogs.records || selectedStudentLogs.records.length === 0) ? (
                    <div style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                      No individual date records logged for this student.
                    </div>
                  ) : (
                    <div style={{ maxHeight: "360px", overflowY: "auto" }}>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHeaderCell>Date</TableHeaderCell>
                            <TableHeaderCell>Subject</TableHeaderCell>
                            <TableHeaderCell>Group</TableHeaderCell>
                            <TableHeaderCell>Status</TableHeaderCell>
                          </TableRow>
                        </TableHeader>
                        <tbody>
                          {selectedStudentLogs.records.map((r, i) => (
                            <TableRow key={r._id || i}>
                              <TableCell style={{ fontWeight: 600 }}>{r.date}</TableCell>
                              <TableCell>{r.subject || "General"}</TableCell>
                              <TableCell>{r.group || "A"}</TableCell>
                              <TableCell>
                                <StatusBadge status={r.status}>{r.status}</StatusBadge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  )}

                  <div style={{ textAlign: "right", marginTop: "16px" }}>
                    <QuickButton onClick={() => setSelectedStudentLogs(null)}>
                      Close Logs
                    </QuickButton>
                  </div>
                </ModalBox>
              </ModalOverlay>
            )}
          </AttendanceContent>
        </Content>
      </AttendanceContainer>
      <ToastContainer />
    </>
  );
};

export default AdminAttendance;
