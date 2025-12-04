
import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminSidebar from "./Sidebar";
import styled from "styled-components";
import { ToastContainer, toast } from "react-toastify";
import { BACKEND_URL } from "../../constants/url";
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

const SearchInput = styled.input`
  padding: 12px 16px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 16px;
  width: 300px;
  outline: none;
  transition: border-color 0.3s;
  &:focus {
    border-color: #007bff;
  }
`;

const StyledSelect = styled.select`
  padding: 12px 16px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 16px;
  width: 200px;
  outline: none;
  cursor: pointer;
  transition: border-color 0.3s;
  &:focus {
    border-color: #007bff;
  }
`;

const ActionButton = styled.button`
  padding: 8px 16px;
  margin-right: 8px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: white;
  background-color: ${(props) => (props.$remove ? "#e74c3c" : "#3498db")};
  transition: background-color 0.2s;
  &:hover {
    background-color: ${(props) => (props.$remove ? "#c0392b" : "#2980b9")};
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 40px;
  border-radius: 12px;
  width: 450px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  &:focus {
    border-color: #007bff;
    outline: none;
  }
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 30px;
`;

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

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
      `Are you sure you want to remove teacher ${teacherEmail}?`
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
    });
  };

  const handleModalClose = () => {
    setEditingTeacher(null);
    setFormData({
      name: "",
      email: "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
        toast.success("Teacher updated successfully");
        handleModalClose();
      }
    } catch (error) {
      console.error("Error updating teacher:", error);
      toast.error("Failed to update teacher");
    }
  };

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedTeachers = React.useMemo(() => {
    let sortableTeachers = [...teachers];
    if (sortConfig.key) {
      sortableTeachers.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableTeachers;
  }, [teachers, sortConfig]);

  const filteredTeachers = sortedTeachers.filter(
    (teacher) =>
      teacher.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ paddingLeft: "250px" }}>
      <AttendanceContainer>
        <AdminSidebar />
        <Content>
          <AttendanceContent>
            <AttendanceHeader>Teachers</AttendanceHeader>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '20px', marginBottom: '20px' }}>
              <SearchInput
                type="text"
                placeholder="Search by Name or Email"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <StyledSelect
                onChange={(e) => handleSort(e.target.value)}
                value={sortConfig.key || ""}
              >
                <option value="" disabled>Sort By</option>
                <option value="name">Name</option>
                <option value="email">Email</option>
              </StyledSelect>
            </div>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <TableContainer>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHeaderCell>Name</TableHeaderCell>
                      <TableHeaderCell>Email</TableHeaderCell>
                      <TableHeaderCell>Actions</TableHeaderCell>
                    </TableRow>
                  </TableHeader>
                  <tbody>
                    {filteredTeachers.length > 0 ? (
                      filteredTeachers.map((teacher) => (
                        <TableRow key={teacher._id}>
                          <TableCell>{teacher.name || "N/A"}</TableCell>
                          <TableCell>{teacher.email}</TableCell>
                          <TableData>
                            <ActionButton onClick={() => handleEditClick(teacher)}>
                              Edit
                            </ActionButton>
                            <ActionButton
                              $remove
                              onClick={() =>
                                removeTeacher(teacher._id, teacher.email)
                              }
                            >
                              Remove
                            </ActionButton>
                          </TableData>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan="3" style={{ textAlign: "center" }}>
                          No teachers found.
                        </TableCell>
                      </TableRow>
                    )}
                  </tbody>
                </Table>
              </TableContainer>
            )}
          </AttendanceContent>
        </Content>
      </AttendanceContainer>

      {editingTeacher && (
        <ModalOverlay>
          <ModalContent>
            <h3>Edit Teacher</h3>
            <FormGroup>
              <Label>Name</Label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </FormGroup>
            <FormGroup>
              <Label>Email</Label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </FormGroup>
            <ModalActions>
              <ActionButton $remove onClick={handleModalClose}>
                Cancel
              </ActionButton>
              <ActionButton onClick={handleUpdate}>Save</ActionButton>
            </ModalActions>
          </ModalContent>
        </ModalOverlay>
      )}
      <ToastContainer />
    </div>
  );
};

export default Teachers;
