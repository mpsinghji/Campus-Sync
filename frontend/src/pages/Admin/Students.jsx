import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import AdminSidebar from "./Sidebar";
import styled from "styled-components";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BACKEND_URL } from "../../constants/url";
import { BsSearch } from "react-icons/bs";
import {
  AttendanceContainer,
  Content,
  AttendanceContent,
  AttendanceHeader,
  TableContainer,
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableCell,
  TableData,
} from "../../styles/AttendanceStyles";

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  margin-bottom: 22px;
  flex-wrap: wrap;
`;

const SearchInput = styled.input`
  padding: 10px 16px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 14px;
  width: 280px;
  outline: none;
  transition: all 0.2s;
  &:focus {
    border-color: #1abc9c;
    box-shadow: 0 0 0 3px rgba(26, 188, 156, 0.15);
  }
`;

const StyledSelect = styled.select`
  padding: 10px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 13px;
  outline: none;
  cursor: pointer;
  background: white;
  transition: border-color 0.2s;
  &:focus {
    border-color: #1abc9c;
  }
`;

const ActionButton = styled.button`
  padding: 6px 12px;
  margin-right: 6px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  color: white;
  background-color: ${(props) => (props.$remove ? "#e74c3c" : props.$bg || "#3498db")};
  transition: all 0.2s;
  &:hover {
    filter: brightness(0.9);
  }
`;

const PrimaryLink = styled(Link)`
  background: #0f766e;
  color: white;
  text-decoration: none;
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: background 0.2s;
  &:hover {
    background: #0d9488;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(15, 23, 42, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 30px;
  border-radius: 14px;
  width: 90%;
  max-width: 540px;
  max-height: 88vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.25);
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
  label {
    display: block;
    margin-bottom: 6px;
    font-size: 12px;
    font-weight: 700;
    color: #475569;
    text-transform: uppercase;
  }
  input,
  select {
    width: 100%;
    box-sizing: border-box;
    padding: 9px 12px;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    font-size: 13px;
    outline: none;
    &:focus {
      border-color: #1abc9c;
    }
  }
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 24px;
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

const ALL_MODULES = [
  { id: "dashboard", label: "Student Dashboard", desc: "Main landing overview and metrics" },
  { id: "assignments", label: "Assignments & Homework", desc: "Viewing homework and submitting files" },
  { id: "exams", label: "Exams & Grades", desc: "Examination schedule and grade cards" },
  { id: "attendance", label: "Attendance Portal", desc: "Viewing attendance percentage & records" },
  { id: "library", label: "Library Catalog & Borrowing", desc: "Browsing books and borrowing requests" },
  { id: "announcements", label: "Broadcast Announcements", desc: "Campus notices and circulars" },
  { id: "events", label: "Events & Calendar", desc: "Campus event schedules" },
];

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("all");
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    rollno: "",
    mobileno: "",
    gender: "",
    batch: "",
  });

  // Module Restrictions Modal State
  const [moduleRestrictStudent, setModuleRestrictStudent] = useState(null);
  const [selectedBlockedModules, setSelectedBlockedModules] = useState([]);
  const [autoFeeBlock, setAutoFeeBlock] = useState(false);
  const [savingRestrictions, setSavingRestrictions] = useState(false);

  // Pagination / Slicing
  const [pageSize, setPageSize] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState("rollno-asc");

  const batches = useMemo(() => {
    return Array.from(new Set(students.map((s) => s.batch).filter(Boolean)));
  }, [students]);

  const toggleRestrictStudent = async (student) => {
    const nextRestricted = !student.isRestricted;
    const actionWord = nextRestricted ? "restrict" : "unrestrict";
    let reason = "";
    if (nextRestricted) {
      const promptReason = window.prompt(
        `Enter restriction reason for student ${student.name || student.email}:`,
        "Administrative restriction"
      );
      if (promptReason === null) return;
      reason = promptReason || "Administrative restriction";
    }

    try {
      await axios.put(`${BACKEND_URL}api/v1/admin/master/toggle-restrict-user`, {
        userId: student._id,
        role: "student",
        isRestricted: nextRestricted,
        reason,
      });
      toast.success(`Student ${actionWord}ed successfully`);
      fetchStudents();
    } catch (e) {
      toast.error(`Failed to ${actionWord} student`);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}api/v1/student/getall`);
      if (response.data && response.data.students) {
        setStudents(response.data.students);
      } else {
        toast.error("Failed to load students data");
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Error fetching students data");
    } finally {
      setLoading(false);
    }
  };

  const removeStudent = async (studentId, studentEmail) => {
    const confirmed = window.confirm(
      `Are you sure you want to remove student ${studentEmail}?`
    );
    if (!confirmed) return;

    try {
      await axios.delete(`${BACKEND_URL}api/v1/student/${studentId}`);
      setStudents(students.filter((student) => student._id !== studentId));
      toast.success("Student removed successfully");
    } catch (error) {
      console.error("Error removing student:", error);
      toast.error("Error removing student");
    }
  };

  const handleEditClick = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name || "",
      email: student.email || "",
      rollno: student.rollno || "",
      mobileno: student.mobileno || "",
      gender: student.gender || "",
      batch: student.batch || "Batch 2024",
    });
  };

  const handleModalClose = () => {
    setEditingStudent(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    try {
      const response = await axios.put(
        `${BACKEND_URL}api/v1/student/${editingStudent._id}`,
        formData
      );
      if (response.data.success) {
        setStudents(
          students.map((student) =>
            student._id === editingStudent._id ? response.data.student : student
          )
        );
        toast.success("Student updated successfully");
        handleModalClose();
      }
    } catch (error) {
      console.error("Error updating student:", error);
      toast.error("Failed to update student");
    }
  };

  // Open Module Restrictions Modal
  const openModuleRestrictionsModal = (student) => {
    setModuleRestrictStudent(student);
    setSelectedBlockedModules(student.blockedModules || []);
    setAutoFeeBlock(Boolean(student.autoFeeBlock));
  };

  const handleModuleToggle = (modId) => {
    if (selectedBlockedModules.includes(modId)) {
      setSelectedBlockedModules(selectedBlockedModules.filter((m) => m !== modId));
    } else {
      setSelectedBlockedModules([...selectedBlockedModules, modId]);
    }
  };

  const handleApplyFeeDefaulterPreset = () => {
    // Block everything except fees
    setSelectedBlockedModules(ALL_MODULES.map((m) => m.id));
    setAutoFeeBlock(true);
    toast.info("Applied Fee Defaulter preset: All academic modules blocked (Fees Portal only)");
  };

  const handleClearAllBlocksPreset = () => {
    setSelectedBlockedModules([]);
    setAutoFeeBlock(false);
    toast.info("Cleared all module restrictions.");
  };

  const handleSaveModuleRestrictions = async () => {
    if (!moduleRestrictStudent) return;
    setSavingRestrictions(true);
    try {
      const res = await axios.put(`${BACKEND_URL}api/v1/admin/master/toggle-restrict-user`, {
        userId: moduleRestrictStudent._id,
        role: "student",
        blockedModules: selectedBlockedModules,
        autoFeeBlock,
      });

      if (res.data?.success) {
        toast.success(`Module restrictions updated for ${moduleRestrictStudent.name}!`);
        setModuleRestrictStudent(null);
        fetchStudents();
      } else {
        toast.error("Failed to update module restrictions.");
      }
    } catch (err) {
      console.error("Error updating module restrictions:", err);
      toast.error("Error updating module restrictions");
    } finally {
      setSavingRestrictions(false);
    }
  };

  // Filtered & Sorted Students
  const filteredAndSortedStudents = useMemo(() => {
    let list = [...students];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) =>
          s.name?.toLowerCase().includes(q) ||
          s.rollno?.toLowerCase().includes(q) ||
          s.email?.toLowerCase().includes(q) ||
          s.batch?.toLowerCase().includes(q)
      );
    }

    if (selectedBatch !== "all") {
      list = list.filter((s) => s.batch === selectedBatch);
    }

    list.sort((a, b) => {
      if (sortKey === "rollno-asc") return (a.rollno || "").localeCompare(b.rollno || "", undefined, { numeric: true });
      if (sortKey === "rollno-desc") return (b.rollno || "").localeCompare(a.rollno || "", undefined, { numeric: true });
      if (sortKey === "name-asc") return (a.name || "").localeCompare(b.name || "");
      if (sortKey === "name-desc") return (b.name || "").localeCompare(a.name || "");
      return 0;
    });

    return list;
  }, [students, searchQuery, selectedBatch, sortKey]);

  // Paginated Sliced Students
  const paginatedStudents = useMemo(() => {
    if (pageSize === "all") return filteredAndSortedStudents;
    const start = (currentPage - 1) * Number(pageSize);
    return filteredAndSortedStudents.slice(start, start + Number(pageSize));
  }, [filteredAndSortedStudents, pageSize, currentPage]);

  return (
    <div style={{ paddingLeft: "250px" }}>
      <AttendanceContainer>
        <AdminSidebar />
        <Content>
          <AttendanceContent>
            <TopBar>
              <div>
                <AttendanceHeader style={{ margin: 0 }}>Student Directory & Access Controls</AttendanceHeader>
                <div style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
                  Manage student records, batch assignments, and granular portal module restrictions for fee defaulters.
                </div>
              </div>
              <PrimaryLink to="/student-register">
                <span>+</span> Register New Student
              </PrimaryLink>
            </TopBar>

            <TopBar style={{ background: "#ffffff", padding: "14px 18px", borderRadius: "10px", boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                <SearchInput
                  type="text"
                  placeholder="Search Name, Roll No, Email, Batch..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                />
                <StyledSelect
                  value={selectedBatch}
                  onChange={(e) => {
                    setSelectedBatch(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="all">All Batches ({students.length})</option>
                  {batches.map((batch) => (
                    <option key={batch} value={batch}>{batch}</option>
                  ))}
                </StyledSelect>
                <StyledSelect
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value)}
                >
                  <option value="rollno-asc">Sort: Roll No (1 → N)</option>
                  <option value="rollno-desc">Sort: Roll No (N → 1)</option>
                  <option value="name-asc">Sort: Name (A → Z)</option>
                  <option value="name-desc">Sort: Name (Z → A)</option>
                </StyledSelect>
              </div>

              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 700 }}>SHOW:</span>
                <StyledSelect
                  style={{ width: "110px" }}
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="10">10 / page</option>
                  <option value="15">15 / page</option>
                  <option value="25">25 / page</option>
                  <option value="50">50 / page</option>
                  <option value="all">Show All</option>
                </StyledSelect>
              </div>
            </TopBar>

            {loading ? (
              <p style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>Loading students...</p>
            ) : (
              <TableContainer>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHeaderCell>Roll No</TableHeaderCell>
                      <TableHeaderCell>Student Name</TableHeaderCell>
                      <TableHeaderCell>Batch & Dept</TableHeaderCell>
                      <TableHeaderCell>Email & Phone</TableHeaderCell>
                      <TableHeaderCell>Module Restrictions</TableHeaderCell>
                      <TableHeaderCell>Status</TableHeaderCell>
                      <TableHeaderCell>Actions</TableHeaderCell>
                    </TableRow>
                  </TableHeader>
                  <tbody>
                    {paginatedStudents.length > 0 ? (
                      paginatedStudents.map((student) => (
                        <TableRow key={student._id}>
                          <TableCell style={{ fontWeight: 700, color: "#0f766e" }}>{student.rollno}</TableCell>
                          <TableCell style={{ fontWeight: 600 }}>{student.name}</TableCell>
                          <TableCell>
                            <span
                              style={{
                                background: "#EDF2F7",
                                padding: "3px 8px",
                                borderRadius: "4px",
                                fontSize: "12px",
                                fontWeight: 600,
                              }}
                            >
                              {student.batch || "General"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div style={{ fontSize: "12px" }}>{student.email}</div>
                            <div style={{ fontSize: "11px", color: "#64748b" }}>{student.mobileno || "No mobile"}</div>
                          </TableCell>
                          <TableCell>
                            {(student.blockedModules && student.blockedModules.length > 0) ? (
                              <span
                                style={{
                                  background: "#fef3c7",
                                  color: "#b45309",
                                  border: "1px solid #fde68a",
                                  padding: "3px 8px",
                                  borderRadius: "6px",
                                  fontSize: "11px",
                                  fontWeight: 700,
                                }}
                                title={student.blockedModules.join(", ")}
                              >
                                🛡️ {student.blockedModules.length} Modules Blocked
                              </span>
                            ) : (
                              <span
                                style={{
                                  background: "#ecfdf5",
                                  color: "#047857",
                                  border: "1px solid #a7f3d0",
                                  padding: "3px 8px",
                                  borderRadius: "6px",
                                  fontSize: "11px",
                                  fontWeight: 600,
                                }}
                              >
                                ✓ Full Access
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            {student.isRestricted ? (
                              <span
                                style={{
                                  background: "#fee2e2",
                                  color: "#dc2626",
                                  border: "1px solid #fecaca",
                                  padding: "3px 8px",
                                  borderRadius: "4px",
                                  fontSize: "12px",
                                  fontWeight: 700,
                                }}
                                title={student.restrictionReason || "Login suspended"}
                              >
                                🚫 Restricted
                              </span>
                            ) : (
                              <span
                                style={{
                                  background: "#dcfce7",
                                  color: "#16a34a",
                                  border: "1px solid #bbf7d0",
                                  padding: "3px 8px",
                                  borderRadius: "4px",
                                  fontSize: "12px",
                                  fontWeight: 700,
                                }}
                              >
                                🟢 Active
                              </span>
                            )}
                          </TableCell>
                          <TableData>
                            <ActionButton
                              $bg="#0f766e"
                              onClick={() => openModuleRestrictionsModal(student)}
                              title="Block specific portal sections (Defaulter Lock)"
                            >
                              🛡️ Permissions
                            </ActionButton>
                            <ActionButton onClick={() => handleEditClick(student)}>
                              Edit
                            </ActionButton>
                            {student.isRestricted ? (
                              <ActionButton
                                $bg="#10b981"
                                onClick={() => toggleRestrictStudent(student)}
                                title="Restore student login access"
                              >
                                Unrestrict
                              </ActionButton>
                            ) : (
                              <ActionButton
                                $bg="#f59e0b"
                                onClick={() => toggleRestrictStudent(student)}
                                title="Restrict student from logging in"
                              >
                                Restrict
                              </ActionButton>
                            )}
                            <ActionButton
                              $remove
                              onClick={() =>
                                removeStudent(student._id, student.email)
                              }
                            >
                              Remove
                            </ActionButton>
                          </TableData>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan="7" style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                          No students match the current filter.
                        </TableCell>
                      </TableRow>
                    )}
                  </tbody>
                </Table>

                {pageSize !== "all" && filteredAndSortedStudents.length > Number(pageSize) && (
                  <PaginationBar>
                    <span>
                      Showing {(currentPage - 1) * Number(pageSize) + 1} to{" "}
                      {Math.min(currentPage * Number(pageSize), filteredAndSortedStudents.length)} of{" "}
                      {filteredAndSortedStudents.length} students
                    </span>
                    <div className="controls">
                      <button
                        type="button"
                        disabled={currentPage <= 1}
                        onClick={() => setCurrentPage((p) => p - 1)}
                      >
                        ← Previous
                      </button>
                      <span>
                        Page {currentPage} of {Math.ceil(filteredAndSortedStudents.length / Number(pageSize))}
                      </span>
                      <button
                        type="button"
                        disabled={currentPage >= Math.ceil(filteredAndSortedStudents.length / Number(pageSize))}
                        onClick={() => setCurrentPage((p) => p + 1)}
                      >
                        Next →
                      </button>
                    </div>
                  </PaginationBar>
                )}
              </TableContainer>
            )}
          </AttendanceContent>
        </Content>
      </AttendanceContainer>

      {/* MODULE RESTRICTION MODAL */}
      {moduleRestrictStudent && (
        <ModalOverlay>
          <ModalContent>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "18px", color: "#1e293b" }}>
                  🛡️ Manage Portal Access & Restrictions
                </h3>
                <div style={{ fontSize: "13px", color: "#64748b", marginTop: "2px" }}>
                  {moduleRestrictStudent.name} (Roll: {moduleRestrictStudent.rollno})
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModuleRestrictStudent(null)}
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

            <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "16px" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "8px", textTransform: "uppercase" }}>
                Quick Presets
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <ActionButton
                  type="button"
                  $bg="#dc2626"
                  onClick={handleApplyFeeDefaulterPreset}
                >
                  🚨 Fee Defaulter Mode (Block All Except Fees)
                </ActionButton>
                <ActionButton
                  type="button"
                  $bg="#10b981"
                  onClick={handleClearAllBlocksPreset}
                >
                  🟢 Grant Full Access (Clear Blocks)
                </ActionButton>
              </div>
            </div>

            <div style={{ fontSize: "13px", fontWeight: 700, color: "#334155", marginBottom: "10px" }}>
              Select Modules to Block for this Student:
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "260px", overflowY: "auto", paddingRight: "4px" }}>
              {ALL_MODULES.map((mod) => {
                const isBlocked = selectedBlockedModules.includes(mod.id);
                return (
                  <label
                    key={mod.id}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "10px",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: `1px solid ${isBlocked ? "#fecaca" : "#e2e8f0"}`,
                      background: isBlocked ? "#fef2f2" : "#ffffff",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isBlocked}
                      onChange={() => handleModuleToggle(mod.id)}
                      style={{ marginTop: "3px" }}
                    />
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: isBlocked ? "#dc2626" : "#1e293b" }}>
                        {isBlocked ? "🚫 " : "✓ "} {mod.label}
                      </div>
                      <div style={{ fontSize: "11px", color: "#64748b" }}>{mod.desc}</div>
                    </div>
                  </label>
                );
              })}
            </div>

            <div style={{ marginTop: "16px", padding: "10px", background: "#f0fdf4", borderRadius: "8px", border: "1px solid #bbf7d0", fontSize: "12px", color: "#166534" }}>
              💡 If Dashboard or Academic modules are blocked, the student will be prevented from accessing them and redirected directly to the Fees payment portal.
            </div>

            <ModalActions>
              <ActionButton $remove onClick={() => setModuleRestrictStudent(null)}>
                Cancel
              </ActionButton>
              <ActionButton
                $bg="#0f766e"
                disabled={savingRestrictions}
                onClick={handleSaveModuleRestrictions}
              >
                {savingRestrictions ? "Saving..." : "Save Module Restrictions"}
              </ActionButton>
            </ModalActions>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* EDIT STUDENT MODAL */}
      {editingStudent && (
        <ModalOverlay>
          <ModalContent>
            <h3>Edit Student</h3>
            <FormGroup>
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </FormGroup>
            <FormGroup>
              <label>Roll No</label>
              <input
                type="text"
                name="rollno"
                value={formData.rollno}
                onChange={handleInputChange}
              />
            </FormGroup>
            <FormGroup>
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </FormGroup>
            <FormGroup>
              <label>Mobile No</label>
              <input
                type="text"
                name="mobileno"
                value={formData.mobileno}
                onChange={handleInputChange}
              />
            </FormGroup>
            <FormGroup>
              <label>Gender</label>
              <StyledSelect
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                style={{ width: "100%" }}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </StyledSelect>
            </FormGroup>
            <FormGroup>
              <label>Batch / Class</label>
              <input
                type="text"
                name="batch"
                placeholder="e.g. Batch 2024, CSE-A"
                value={formData.batch}
                onChange={handleInputChange}
              />
            </FormGroup>
            <ModalActions>
              <ActionButton $remove onClick={handleModalClose}>
                Cancel
              </ActionButton>
              <ActionButton onClick={handleUpdate} $bg="#0f766e">Save</ActionButton>
            </ModalActions>
          </ModalContent>
        </ModalOverlay>
      )}
      <ToastContainer />
    </div>
  );
};

export default Students;
