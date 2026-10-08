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
  max-width: 580px;
  max-height: 88vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.25);
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  @media screen and (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 14px;
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

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    employeeId: "",
    designation: "Assistant Professor",
    department: "Computer Science",
    subject: "",
    qualification: "M.Tech / Ph.D",
    experience: "",
    responsibility: "Teacher",
  });

  // Slicing / Pagination state
  const [pageSize, setPageSize] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState("name-asc");

  const toggleRestrictTeacher = async (teacher) => {
    const nextRestricted = !teacher.isRestricted;
    const actionWord = nextRestricted ? "restrict" : "unrestrict";
    let reason = "";
    if (nextRestricted) {
      const promptReason = window.prompt(
        `Enter restriction reason for teacher ${teacher.name || teacher.email}:`,
        "Administrative restriction"
      );
      if (promptReason === null) return;
      reason = promptReason || "Administrative restriction";
    }

    try {
      await axios.put(`${BACKEND_URL}api/v1/admin/master/toggle-restrict-user`, {
        userId: teacher._id,
        role: "teacher",
        isRestricted: nextRestricted,
        reason,
      });
      toast.success(`Teacher ${actionWord}ed successfully`);
      fetchTeachers();
    } catch (e) {
      toast.error(`Failed to ${actionWord} teacher`);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}api/v1/teacher/getall`);
      if (response.data && response.data.teachers) {
        setTeachers(response.data.teachers);
      } else {
        toast.error("Failed to load teachers data");
      }
    } catch (error) {
      console.error("Error fetching teachers:", error);
      toast.error("Error fetching teachers data");
    } finally {
      setLoading(false);
    }
  };

  const removeTeacher = async (teacherId, teacherEmail) => {
    const confirmed = window.confirm(
      `Are you sure you want to remove faculty member ${teacherEmail}?`
    );
    if (!confirmed) return;

    try {
      await axios.delete(`${BACKEND_URL}api/v1/teacher/${teacherId}`);
      setTeachers(teachers.filter((teacher) => teacher._id !== teacherId));
      toast.success("Teacher removed successfully");
    } catch (error) {
      console.error("Error removing teacher:", error);
      toast.error("Error removing teacher");
    }
  };

  const handleEditClick = (teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.name || "",
      email: teacher.email || "",
      phone: teacher.phone || "",
      employeeId: teacher.employeeId || "",
      designation: teacher.designation || "Assistant Professor",
      department: teacher.department || "Computer Science",
      subject: teacher.subject || "",
      qualification: teacher.qualification || "M.Tech / Ph.D",
      experience: teacher.experience || "",
      responsibility: teacher.responsibility || "Teacher",
    });
  };

  const handleModalClose = () => {
    setEditingTeacher(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    try {
      const response = await axios.put(
        `${BACKEND_URL}api/v1/teacher/${editingTeacher._id}`,
        formData
      );
      if (response.data.success) {
        setTeachers(
          teachers.map((teacher) =>
            teacher._id === editingTeacher._id ? response.data.teacher : teacher
          )
        );
        toast.success("Faculty member updated successfully with phone & profile details!");
        handleModalClose();
      }
    } catch (error) {
      console.error("Error updating teacher:", error);
      toast.error("Failed to update teacher");
    }
  };

  // Filtered & Sorted Teachers
  const filteredAndSortedTeachers = useMemo(() => {
    let list = [...teachers];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.name?.toLowerCase().includes(q) ||
          t.email?.toLowerCase().includes(q) ||
          t.phone?.includes(q) ||
          t.employeeId?.toLowerCase().includes(q)
      );
    }

    if (departmentFilter !== "all") {
      list = list.filter((t) => t.department === departmentFilter);
    }

    list.sort((a, b) => {
      if (sortKey === "name-asc") return (a.name || "").localeCompare(b.name || "");
      if (sortKey === "name-desc") return (b.name || "").localeCompare(a.name || "");
      if (sortKey === "dept-asc") return (a.department || "").localeCompare(b.department || "");
      return 0;
    });

    return list;
  }, [teachers, searchQuery, departmentFilter, sortKey]);

  // Paginated Sliced Teachers
  const paginatedTeachers = useMemo(() => {
    if (pageSize === "all") return filteredAndSortedTeachers;
    const start = (currentPage - 1) * Number(pageSize);
    return filteredAndSortedTeachers.slice(start, start + Number(pageSize));
  }, [filteredAndSortedTeachers, pageSize, currentPage]);

  const uniqueDepartments = useMemo(() => {
    return Array.from(new Set(teachers.map((t) => t.department).filter(Boolean)));
  }, [teachers]);

  return (
    <div style={{ paddingLeft: "250px" }}>
      <AttendanceContainer>
        <AdminSidebar />
        <Content>
          <AttendanceContent>
            <TopBar>
              <div>
                <AttendanceHeader style={{ margin: 0 }}>Faculty & Teacher Directory</AttendanceHeader>
                <div style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
                  Manage faculty profiles, phone numbers, designations, and system credentials.
                </div>
              </div>
              <PrimaryLink to="/teacher-register">
                <span>+</span> Register New Faculty
              </PrimaryLink>
            </TopBar>

            <TopBar style={{ background: "#ffffff", padding: "14px 18px", borderRadius: "10px", boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                <SearchInput
                  type="text"
                  placeholder="Search Name, Phone, Email, Emp ID..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                />
                <StyledSelect
                  value={departmentFilter}
                  onChange={(e) => {
                    setDepartmentFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="all">All Departments ({teachers.length})</option>
                  {uniqueDepartments.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </StyledSelect>
                <StyledSelect
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value)}
                >
                  <option value="name-asc">Sort: Name (A → Z)</option>
                  <option value="name-desc">Sort: Name (Z → A)</option>
                  <option value="dept-asc">Sort: Department</option>
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
              <p style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>Loading faculty profiles...</p>
            ) : (
              <TableContainer>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHeaderCell>Faculty & Emp ID</TableHeaderCell>
                      <TableHeaderCell>Phone & Email</TableHeaderCell>
                      <TableHeaderCell>Designation & Role</TableHeaderCell>
                      <TableHeaderCell>Department & Course</TableHeaderCell>
                      <TableHeaderCell>Qualification</TableHeaderCell>
                      <TableHeaderCell>Status</TableHeaderCell>
                      <TableHeaderCell>Actions</TableHeaderCell>
                    </TableRow>
                  </TableHeader>
                  <tbody>
                    {paginatedTeachers.length > 0 ? (
                      paginatedTeachers.map((teacher) => (
                        <TableRow key={teacher._id}>
                          <TableCell>
                            <div style={{ fontWeight: 700, color: "#1e293b" }}>{teacher.name || "N/A"}</div>
                            <div style={{ fontSize: "11px", color: "#0f766e", fontWeight: 600 }}>
                              {teacher.employeeId ? `Emp: ${teacher.employeeId}` : "ID Pending"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div style={{ fontWeight: 600, color: "#0369a1" }}>
                              {teacher.phone ? `📞 ${teacher.phone}` : "No phone saved"}
                            </div>
                            <div style={{ fontSize: "12px", color: "#64748b" }}>{teacher.email}</div>
                          </TableCell>
                          <TableCell>
                            <div style={{ fontWeight: 600 }}>{teacher.designation || "Professor"}</div>
                            <span
                              style={{
                                background: "#eff6ff",
                                color: "#2563eb",
                                padding: "2px 6px",
                                borderRadius: "4px",
                                fontSize: "11px",
                                fontWeight: 700,
                              }}
                            >
                              {teacher.responsibility || "Teacher"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div style={{ fontWeight: 600 }}>{teacher.department || "Academics"}</div>
                            <div style={{ fontSize: "11px", color: "#64748b" }}>{teacher.subject || "General"}</div>
                          </TableCell>
                          <TableCell>
                            <div style={{ fontSize: "12px" }}>{teacher.qualification || "M.Tech / Ph.D"}</div>
                            <div style={{ fontSize: "11px", color: "#64748b" }}>
                              {teacher.experience ? `${teacher.experience} Exp` : ""}
                            </div>
                          </TableCell>
                          <TableCell>
                            {teacher.isRestricted ? (
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
                                title={teacher.restrictionReason || "Login suspended"}
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
                            <ActionButton onClick={() => handleEditClick(teacher)} $bg="#0f766e">
                              ✏️ Edit
                            </ActionButton>
                            {teacher.isRestricted ? (
                              <ActionButton
                                $bg="#10b981"
                                onClick={() => toggleRestrictTeacher(teacher)}
                                title="Restore teacher login access"
                              >
                                Unrestrict
                              </ActionButton>
                            ) : (
                              <ActionButton
                                $bg="#f59e0b"
                                onClick={() => toggleRestrictTeacher(teacher)}
                                title="Restrict teacher from logging in"
                              >
                                Restrict
                              </ActionButton>
                            )}
                            <ActionButton
                              $remove
                              onClick={() => removeTeacher(teacher._id, teacher.email)}
                            >
                              Remove
                            </ActionButton>
                          </TableData>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan="7" style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                          No faculty members match your search filter.
                        </TableCell>
                      </TableRow>
                    )}
                  </tbody>
                </Table>

                {pageSize !== "all" && filteredAndSortedTeachers.length > Number(pageSize) && (
                  <PaginationBar>
                    <span>
                      Showing {(currentPage - 1) * Number(pageSize) + 1} to{" "}
                      {Math.min(currentPage * Number(pageSize), filteredAndSortedTeachers.length)} of{" "}
                      {filteredAndSortedTeachers.length} faculty members
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
                        Page {currentPage} of {Math.ceil(filteredAndSortedTeachers.length / Number(pageSize))}
                      </span>
                      <button
                        type="button"
                        disabled={currentPage >= Math.ceil(filteredAndSortedTeachers.length / Number(pageSize))}
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

      {/* EDIT FACULTY MODAL WITH COMPLETE MANAGEMENT FIELDS */}
      {editingTeacher && (
        <ModalOverlay>
          <ModalContent>
            <h3 style={{ margin: "0 0 6px 0", fontSize: "18px", color: "#1e293b" }}>
              Edit Faculty Profile & Contact Information
            </h3>
            <p style={{ margin: "0 0 20px 0", fontSize: "13px", color: "#64748b" }}>
              Update institutional records for {editingTeacher.name}.
            </p>

            <FormGrid>
              <FormGroup>
                <label>Faculty Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>
              <FormGroup>
                <label>Institutional Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>
              <FormGroup>
                <label>Phone / Contact Number</label>
                <input
                  type="text"
                  name="phone"
                  placeholder="e.g. +91 9876543210"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </FormGroup>
              <FormGroup>
                <label>Employee ID</label>
                <input
                  type="text"
                  name="employeeId"
                  placeholder="e.g. EMP-2024-042"
                  value={formData.employeeId}
                  onChange={handleInputChange}
                />
              </FormGroup>
              <FormGroup>
                <label>Designation</label>
                <select
                  name="designation"
                  value={formData.designation}
                  onChange={handleInputChange}
                >
                  <option value="Professor">Professor</option>
                  <option value="Associate Professor">Associate Professor</option>
                  <option value="Assistant Professor">Assistant Professor</option>
                  <option value="Head of Department (HOD)">Head of Department (HOD)</option>
                  <option value="Dean">Dean</option>
                  <option value="Visiting Lecturer">Visiting Lecturer</option>
                </select>
              </FormGroup>
              <FormGroup>
                <label>Department</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Electronics & Communication">Electronics & Communication</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="Electrical Engineering">Electrical Engineering</option>
                  <option value="Management Studies">Management Studies</option>
                  <option value="Applied Sciences">Applied Sciences</option>
                </select>
              </FormGroup>
              <FormGroup>
                <label>Primary Subject / Specialization</label>
                <input
                  type="text"
                  name="subject"
                  placeholder="e.g. Operating Systems"
                  value={formData.subject}
                  onChange={handleInputChange}
                />
              </FormGroup>
              <FormGroup>
                <label>Highest Qualification</label>
                <input
                  type="text"
                  name="qualification"
                  placeholder="e.g. Ph.D (Computer Science)"
                  value={formData.qualification}
                  onChange={handleInputChange}
                />
              </FormGroup>
              <FormGroup>
                <label>Years of Experience</label>
                <input
                  type="text"
                  name="experience"
                  placeholder="e.g. 8 Years"
                  value={formData.experience}
                  onChange={handleInputChange}
                />
              </FormGroup>
              <FormGroup>
                <label>Role / Responsibility</label>
                <select
                  name="responsibility"
                  value={formData.responsibility}
                  onChange={handleInputChange}
                >
                  <option value="Teacher">Teacher / Faculty</option>
                  <option value="Course Coordinator">Course Coordinator</option>
                  <option value="Lab Incharge">Lab Incharge</option>
                  <option value="Exam Invigilator">Exam Invigilator</option>
                </select>
              </FormGroup>
            </FormGrid>

            <ModalActions>
              <ActionButton $remove onClick={handleModalClose}>
                Cancel
              </ActionButton>
              <ActionButton onClick={handleUpdate} $bg="#0f766e">
                Save Faculty Details
              </ActionButton>
            </ModalActions>
          </ModalContent>
        </ModalOverlay>
      )}
      <ToastContainer />
    </div>
  );
};

export default Teachers;
