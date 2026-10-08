import React, { useState, useEffect, useMemo } from "react";
import AdminSidebar from "./Sidebar";
import axios from "axios";
import styled from "styled-components";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BACKEND_URL } from "../../constants/url";
import { formatDateDDMMYYYY } from "../../utils/dateUtils";

const Container = styled.div`
  display: flex;
  padding-left: 240px;
  min-height: 100vh;
  background-color: #f8fafc;
  font-family: "Inter", "Segoe UI", sans-serif;

  @media screen and (max-width: 768px) {
    padding-left: 0;
    flex-direction: column;
  }
`;

const Content = styled.div`
  flex: 1;
  padding: 30px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;

  .title-group {
    h1 {
      font-size: 26px;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 6px 0;
      letter-spacing: -0.5px;
    }
    p {
      font-size: 14px;
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
  padding: 10px 20px;
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
  gap: 12px;
  margin-bottom: 24px;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 12px;
`;

const TabItem = styled.button`
  background: ${(props) => (props.$active ? "#0f766e" : "transparent")};
  color: ${(props) => (props.$active ? "#ffffff" : "#475569")};
  font-weight: 700;
  font-size: 14px;
  padding: 10px 20px;
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
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  background: white;
  padding: 18px 20px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
  display: flex;
  align-items: center;
  gap: 16px;

  .icon-wrap {
    width: 48px;
    height: 48px;
    border-radius: 10px;
    background: ${(props) => props.$bg || "#f0fdf4"};
    color: ${(props) => props.$color || "#0f766e"};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
  }

  .info {
    .label {
      font-size: 12px;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .value {
      font-size: 22px;
      font-weight: 800;
      color: #0f172a;
      margin-top: 2px;
    }
  }
`;

const FilterCard = styled.div`
  background: white;
  padding: 16px 20px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
  margin-bottom: 24px;
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  align-items: center;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;

  label {
    font-size: 11px;
    font-weight: 700;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  input,
  select {
    padding: 8px 12px;
    border-radius: 8px;
    border: 1px solid #cbd5e1;
    font-size: 13px;
    outline: none;
    background: white;
    min-width: 160px;
    transition: all 0.2s;

    &:focus {
      border-color: #0f766e;
      box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.12);
    }
  }
`;

const AssignmentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 18px;
  margin-bottom: 30px;
`;

const AssignmentCard = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  padding: 22px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
  transition: all 0.2s;
  border-left: 5px solid #0f766e;
  display: flex;
  flex-direction: column;

  &:hover {
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.06);
    transform: translateY(-2px);
  }

  .title {
    font-size: 17px;
    font-weight: 800;
    color: #0f172a;
    margin-bottom: 8px;
    line-height: 1.3;
  }

  .pills {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 12px;

    span {
      font-size: 11px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 4px;
    }
    .dept {
      background: #f0fdf4;
      color: #0f766e;
    }
    .subject {
      background: #eff6ff;
      color: #1e40af;
    }
    .class {
      background: #fef3c7;
      color: #b45309;
    }
    .sec {
      background: #f1f5f9;
      color: #334155;
    }
    .due {
      background: #fff1f2;
      color: #be123c;
    }
  }

  .body {
    font-size: 13px;
    color: #475569;
    line-height: 1.6;
    margin-bottom: 16px;
    flex: 1;
    white-space: pre-wrap;
  }

  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 12px;
    border-top: 1px solid #f1f5f9;
    font-size: 12px;
    color: #94a3b8;

    .due-time {
      font-weight: 700;
      color: #e11d48;
    }
  }
`;

// SUBMISSIONS TABLE
const TableWrapper = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow-x: auto;
  margin-bottom: 30px;
`;

const DataTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 950px;
  text-align: left;

  th {
    background: #f8fafc;
    color: #475569;
    font-size: 12px;
    font-weight: 700;
    padding: 14px 16px;
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

const ScoreBadge = styled.span`
  display: inline-block;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 800;
  background: ${(props) => (props.$score >= 80 ? "#dcfce7" : props.$score >= 60 ? "#fef3c7" : "#fee2e2")};
  color: ${(props) => (props.$score >= 80 ? "#15803d" : props.$score >= 60 ? "#b45309" : "#b91c1c")};
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
`;

const ModalBox = styled.div`
  background: white;
  border-radius: 14px;
  padding: 28px;
  width: 90%;
  max-width: 650px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 800;
    color: #0f172a;
  }

  button {
    background: none;
    border: none;
    font-size: 20px;
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
  gap: 16px;
  margin-bottom: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-size: 12px;
    font-weight: 700;
    color: #475569;
  }

  input,
  select,
  textarea {
    padding: 10px 12px;
    border-radius: 8px;
    border: 1px solid #cbd5e1;
    font-size: 13px;
    outline: none;
    background: white;

    &:focus {
      border-color: #0f766e;
      box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.12);
    }
  }
`;

const INITIAL_SUBMISSIONS = [
  {
    id: "sub_1",
    rollno: "CS2024001",
    studentName: "Aarav Sharma",
    assignmentTitle: "Lab Assignment 3: Red-Black Balanced Trees",
    subject: "Data Structures & Algorithms",
    submittedAt: "Yesterday at 4:30 PM",
    fileUrl: "assignment_aarav.pdf",
    score: 95,
    status: "Graded",
    remarks: "Clean implementation of tree rotations with edge case handling.",
  },
  {
    id: "sub_2",
    rollno: "CS2024002",
    studentName: "Diya Patel",
    assignmentTitle: "Lab Assignment 3: Red-Black Balanced Trees",
    subject: "Data Structures & Algorithms",
    submittedAt: "2 days ago",
    fileUrl: "diya_trees_v2.cpp",
    score: 98,
    status: "Graded",
    remarks: "Exceptional code quality and performance benchmarks.",
  },
  {
    id: "sub_3",
    rollno: "CS2024003",
    studentName: "Rohan Verma",
    assignmentTitle: "ER-Modeling & Normalization Case Study",
    subject: "Database Management Systems",
    submittedAt: "Today at 10:15 AM",
    fileUrl: "rohan_dbms.pdf",
    score: 82,
    status: "Graded",
    remarks: "Well structured schemas, minor redundancy in 3NF decomposition.",
  },
  {
    id: "sub_4",
    rollno: "CS2024004",
    studentName: "Ananya Iyer",
    assignmentTitle: "Process Synchronization & Semaphore Simulation",
    subject: "Operating Systems",
    submittedAt: "Today at 11:45 AM",
    fileUrl: "ananya_semaphore.c",
    score: 90,
    status: "Graded",
    remarks: "Mutex and deadlocks successfully simulated with POSIX threads.",
  },
];

const AdminAssignments = () => {
  const [activeTab, setActiveTab] = useState("courseworks"); // "courseworks" | "submissions"
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("Computer Science");
  const [filterSection, setFilterSection] = useState("all");

  // Create Assignment Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: "",
    subject: "Data Structures & Algorithms",
    department: "Computer Science",
    className: "Semester 1",
    section: "Section A",
    batch: "Batch 2024",
    dueDate: "",
    description: "",
    targetAudience: "all",
    targetStudentEmail: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Submissions State
  const [submissionsList, setSubmissionsList] = useState(() => {
    try {
      const saved = localStorage.getItem("campus_sync_assignment_submissions_v2");
      return saved ? JSON.parse(saved) : INITIAL_SUBMISSIONS;
    } catch {
      return INITIAL_SUBMISSIONS;
    }
  });

  useEffect(() => {
    localStorage.setItem(
      "campus_sync_assignment_submissions_v2",
      JSON.stringify(submissionsList)
    );
  }, [submissionsList]);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BACKEND_URL}api/v1/assignments/getall`);
      setAssignments((response.data?.assignments || []).reverse());
    } catch (error) {
      console.error("Error fetching assignments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAssignment((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!newAssignment.title || !newAssignment.description) {
      toast.error("Please provide assignment title and instructions.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.post(`${BACKEND_URL}api/v1/assignments/add`, newAssignment);
      if (response.data?.success) {
        toast.success("Assignment coursework published to students!");
        setIsModalOpen(false);
        setNewAssignment({
          title: "",
          subject: "Data Structures & Algorithms",
          department: "Computer Science",
          className: "Semester 1",
          section: "Section A",
          batch: "Batch 2024",
          dueDate: "",
          description: "",
          targetAudience: "all",
          targetStudentEmail: "",
        });
        fetchAssignments();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to publish assignment.");
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered assignments
  const filteredAssignments = useMemo(() => {
    return assignments.filter((a) => {
      if (filterDepartment !== "all" && a.department && a.department !== filterDepartment) return false;
      if (filterSection !== "all" && a.section && a.section !== filterSection) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          a.title?.toLowerCase().includes(q) ||
          a.subject?.toLowerCase().includes(q) ||
          a.description?.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [assignments, filterDepartment, filterSection, searchQuery]);

  // Filtered submissions
  const filteredSubmissions = useMemo(() => {
    return submissionsList.filter((s) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          s.rollno?.toLowerCase().includes(q) ||
          s.studentName?.toLowerCase().includes(q) ||
          s.assignmentTitle?.toLowerCase().includes(q) ||
          s.subject?.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [submissionsList, searchQuery]);

  return (
    <>
      <Container>
        <AdminSidebar />
        <Content>
          <Header>
            <div className="title-group">
              <h1>Coursework & Academic Assignments</h1>
              <p>
                Issue coursework problem sets, coordinate batch submission deadlines, and evaluate student work.
              </p>
            </div>
            <div className="action-buttons">
              <PrimaryButton onClick={() => setIsModalOpen(true)}>
                ➕ Create New Coursework
              </PrimaryButton>
            </div>
          </Header>

          {/* Navigation Tabs */}
          <TabBar>
            <TabItem
              $active={activeTab === "courseworks"}
              onClick={() => setActiveTab("courseworks")}
            >
              📋 Active Coursework Projects ({assignments.length})
            </TabItem>
            <TabItem
              $active={activeTab === "submissions"}
              onClick={() => setActiveTab("submissions")}
            >
              📥 Student Submissions & Evaluations ({submissionsList.length})
            </TabItem>
          </TabBar>

          {/* Stats Overview */}
          <StatsGrid>
            <StatCard $bg="#f0fdf4" $color="#0f766e">
              <div className="icon-wrap">📚</div>
              <div className="info">
                <div className="label">Active Projects</div>
                <div className="value">{assignments.length} Tasks</div>
              </div>
            </StatCard>
            <StatCard $bg="#eff6ff" $color="#2563eb">
              <div className="icon-wrap">📥</div>
              <div className="info">
                <div className="label">Submissions Logged</div>
                <div className="value">{submissionsList.length} Files</div>
              </div>
            </StatCard>
            <StatCard $bg="#fef3c7" $color="#d97706">
              <div className="icon-wrap">⭐</div>
              <div className="info">
                <div className="label">Average Score</div>
                <div className="value">
                  {submissionsList.length > 0
                    ? `${Math.round(
                        submissionsList.reduce((acc, curr) => acc + curr.score, 0) /
                          submissionsList.length
                      )}%`
                    : "N/A"}
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

          {/* Filter Bar */}
          <FilterCard>
            <FilterGroup style={{ flex: 1, minWidth: "220px" }}>
              <label>Search Assignment Registry</label>
              <input
                type="text"
                placeholder={
                  activeTab === "courseworks"
                    ? "Search assignment title, topic, or instructions..."
                    : "Search student name, roll number, or assignment..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </FilterGroup>

            <FilterGroup>
              <label>Department</label>
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Information Technology">Information Technology</option>
                <option value="all">All Departments</option>
              </select>
            </FilterGroup>

            <FilterGroup>
              <label>Section</label>
              <select
                value={filterSection}
                onChange={(e) => setFilterSection(e.target.value)}
              >
                <option value="all">All Sections</option>
                <option value="Section A">Section A</option>
                <option value="Section B">Section B</option>
                <option value="Section C">Section C</option>
              </select>
            </FilterGroup>
          </FilterCard>

          {/* TAB 1: COURSEWORKS GRID */}
          {activeTab === "courseworks" && (
            <>
              {loading ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                  Loading academic coursework...
                </div>
              ) : filteredAssignments.length > 0 ? (
                <AssignmentGrid>
                  {filteredAssignments.map((a) => (
                    <AssignmentCard key={a._id}>
                      <div className="title">{a.title}</div>
                      <div className="pills">
                        <span className="dept">🏛️ {a.department || "Computer Science"}</span>
                        <span className="subject">📚 {a.subject || "Coursework"}</span>
                        <span className="class">🎓 {a.className || "Semester 1"}</span>
                        <span className="sec">👥 {a.section || "Sec A"}</span>
                        {a.targetStudentEmail && (
                          <span style={{ background: "#fef3c7", color: "#b45309", padding: "3px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: 700 }}>
                            🎯 For: {a.targetStudentEmail}
                          </span>
                        )}
                        {a.dueDate && (
                          <span className="due">
                            ⏰ Due: {formatDateDDMMYYYY(a.dueDate)}
                          </span>
                        )}
                      </div>
                      <div className="body">{a.description}</div>
                      <div className="card-footer">
                        <span>Cohort: {a.batch === "all" || !a.batch ? "All Batches" : a.batch}</span>
                        {a.dueDate && (
                          <span className="due-time">
                            Deadline: {formatDateDDMMYYYY(a.dueDate)}
                          </span>
                        )}
                      </div>
                    </AssignmentCard>
                  ))}
                </AssignmentGrid>
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
                  <div style={{ fontSize: "36px", marginBottom: "10px" }}>📋</div>
                  <h3 style={{ margin: "0 0 6px 0", color: "#1e293b" }}>No Coursework Found</h3>
                  <p style={{ margin: 0, fontSize: "14px" }}>
                    Click "➕ Create New Coursework" above to issue a project to students.
                  </p>
                </div>
              )}
            </>
          )}

          {/* TAB 2: SUBMISSIONS & EVALUATIONS LEDGER */}
          {activeTab === "submissions" && (
            <TableWrapper>
              <DataTable>
                <thead>
                  <tr>
                    <th>Roll No</th>
                    <th>Student Name</th>
                    <th>Assignment Title</th>
                    <th>Course Subject</th>
                    <th>Submission Time</th>
                    <th>Score (100)</th>
                    <th>Status</th>
                    <th>Evaluation Feedback</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubmissions.length > 0 ? (
                    filteredSubmissions.map((s) => (
                      <tr key={s.id}>
                        <td style={{ fontWeight: 800, color: "#0f766e" }}>{s.rollno}</td>
                        <td style={{ fontWeight: 700 }}>{s.studentName}</td>
                        <td style={{ fontWeight: 600 }}>{s.assignmentTitle}</td>
                        <td>{s.subject}</td>
                        <td style={{ fontSize: "12px", color: "#64748b" }}>{s.submittedAt}</td>
                        <td>
                          <ScoreBadge $score={s.score}>{s.score}/100</ScoreBadge>
                        </td>
                        <td>
                          <span
                            style={{
                              background: "#dcfce7",
                              color: "#15803d",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              fontSize: "11px",
                              fontWeight: 700,
                            }}
                          >
                            ✓ {s.status}
                          </span>
                        </td>
                        <td style={{ fontSize: "12px", color: "#475569" }}>{s.remarks}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" style={{ textAlign: "center", padding: "36px", color: "#64748b" }}>
                        No student submissions match current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </DataTable>
            </TableWrapper>
          )}

          {/* CREATE ASSIGNMENT MODAL */}
          {isModalOpen && (
            <ModalOverlay>
              <ModalBox>
                <ModalHeader>
                  <h3>➕ Issue New Coursework Assignment</h3>
                  <button type="button" onClick={() => setIsModalOpen(false)}>
                    ✕
                  </button>
                </ModalHeader>

                <form onSubmit={handleCreateAssignment}>
                  <FormGrid>
                    <FormGroup>
                      <label>Assignment Title *</label>
                      <input
                        type="text"
                        name="title"
                        placeholder="e.g. Lab 4: B-Tree Indexing Implementation"
                        value={newAssignment.title}
                        onChange={handleInputChange}
                        required
                      />
                    </FormGroup>

                    <FormGroup>
                      <label>Course / Subject *</label>
                      <input
                        type="text"
                        name="subject"
                        value={newAssignment.subject}
                        onChange={handleInputChange}
                        required
                      />
                    </FormGroup>

                    <FormGroup>
                      <label>Department</label>
                      <select
                        name="department"
                        value={newAssignment.department}
                        onChange={handleInputChange}
                      >
                        <option value="Computer Science">Computer Science</option>
                        <option value="Information Technology">Information Technology</option>
                        <option value="Mechanical Engineering">Mechanical Engineering</option>
                        <option value="Electronics & Communication">Electronics & Comm.</option>
                      </select>
                    </FormGroup>

                    <FormGroup>
                      <label>Class Term Level</label>
                      <select
                        name="className"
                        value={newAssignment.className}
                        onChange={handleInputChange}
                      >
                        <option value="Semester 1">Semester 1 (1st Year)</option>
                        <option value="Semester 2">Semester 2 (1st Year)</option>
                        <option value="Semester 3">Semester 3 (2nd Year)</option>
                        <option value="Semester 4">Semester 4 (2nd Year)</option>
                        <option value="Semester 5">Semester 5 (3rd Year)</option>
                        <option value="Semester 6">Semester 6 (3rd Year)</option>
                        <option value="Semester 7">Semester 7 (Final Year)</option>
                        <option value="Semester 8">Semester 8 (Final Year)</option>
                      </select>
                    </FormGroup>

                    <FormGroup>
                      <label>Section</label>
                      <select
                        name="section"
                        value={newAssignment.section}
                        onChange={handleInputChange}
                      >
                        <option value="Section A">Section A</option>
                        <option value="Section B">Section B</option>
                        <option value="Section C">Section C</option>
                        <option value="All Sections">All Sections</option>
                      </select>
                    </FormGroup>

                    <FormGroup>
                      <label>Academic Batch</label>
                      <select
                        name="batch"
                        value={newAssignment.batch}
                        onChange={handleInputChange}
                      >
                        <option value="Batch 2024">Batch 2024</option>
                        <option value="Batch 2025">Batch 2025</option>
                        <option value="Batch 2023">Batch 2023</option>
                        <option value="all">All Batches</option>
                      </select>
                    </FormGroup>

                    <FormGroup>
                      <label>Submission Due Date *</label>
                      <input
                        type="date"
                        name="dueDate"
                        value={newAssignment.dueDate}
                        onChange={handleInputChange}
                        required
                      />
                    </FormGroup>

                    <FormGroup>
                      <label>Assignment Audience</label>
                      <select
                        name="targetAudience"
                        value={newAssignment.targetAudience}
                        onChange={handleInputChange}
                      >
                        <option value="all">Whole Class / Cohort</option>
                        <option value="particular_student">Specific Student Only</option>
                      </select>
                    </FormGroup>

                    {newAssignment.targetAudience === "particular_student" && (
                      <FormGroup style={{ gridColumn: "1 / -1" }}>
                        <label>Target Student Email / Roll No *</label>
                        <input
                          type="text"
                          name="targetStudentEmail"
                          placeholder="Enter student email (e.g. demo30262@gmail.com) or roll number"
                          value={newAssignment.targetStudentEmail}
                          onChange={handleInputChange}
                          required
                        />
                      </FormGroup>
                    )}
                  </FormGrid>

                  <FormGroup style={{ marginBottom: "20px" }}>
                    <label>Assignment Instructions & Problem Statement *</label>
                    <textarea
                      name="description"
                      rows={4}
                      placeholder="Specify requirements, deliverables, test cases, and grading rubric..."
                      value={newAssignment.description}
                      onChange={handleInputChange}
                      required
                    />
                  </FormGroup>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                    <SecondaryButton type="button" onClick={() => setIsModalOpen(false)}>
                      Cancel
                    </SecondaryButton>
                    <PrimaryButton type="submit" disabled={submitting}>
                      {submitting ? "Publishing..." : "✓ Publish Assignment to Class"}
                    </PrimaryButton>
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

export default AdminAssignments;