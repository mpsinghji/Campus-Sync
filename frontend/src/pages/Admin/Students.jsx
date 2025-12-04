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

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    rollno: "",
    mobileno: "",
    gender: "",
  });

  const [sortConfig, setSortConfig] = useState({ key: 'rollno', direction: 'ascending' });

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
    });
  };

  const handleModalClose = () => {
    setEditingStudent(null);
    setFormData({
      name: "",
      email: "",
      rollno: "",
      mobileno: "",
      gender: "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
      } else {
        toast.error("Failed to update student");
      }
    } catch (error) {
      console.error("Error updating student:", error);
      toast.error("Failed to update student");
    }
  };

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedStudents = React.useMemo(() => {
    let sortableStudents = [...students];
    if (sortConfig.key) {
      sortableStudents.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        // Handle numeric sorting for rollno if it looks like a number
        if (sortConfig.key === 'rollno') {
          const numA = parseInt(valA, 10);
          const numB = parseInt(valB, 10);
          if (!isNaN(numA) && !isNaN(numB)) {
            valA = numA;
            valB = numB;
          }
        }

        if (valA < valB) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (valA > valB) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableStudents;
  }, [students, sortConfig]);

  const filteredStudents = sortedStudents.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollno.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ paddingLeft: "250px" }}>
      <AttendanceContainer>
        <AdminSidebar />
        <Content>
          <AttendanceContent>
            <AttendanceHeader>Students</AttendanceHeader>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '20px', marginBottom: '20px' }}>
              <SearchInput
                type="text"
                placeholder="Search by Name, Roll No, or Email"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <StyledSelect
                onChange={(e) => handleSort(e.target.value)}
                value={sortConfig.key || ""}
              >
                <option value="" disabled>Sort By</option>
                <option value="name">Name</option>
                <option value="rollno">Roll No</option>
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
                      <TableHeaderCell>Roll No</TableHeaderCell>
                      <TableHeaderCell>Name</TableHeaderCell>
                      <TableHeaderCell>Email</TableHeaderCell>
                      <TableHeaderCell>Mobile No</TableHeaderCell>
                      <TableHeaderCell>Actions</TableHeaderCell>
                    </TableRow>
                  </TableHeader>
                  <tbody>
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((student) => (
                        <TableRow key={student._id}>
                          <TableCell>{student.rollno}</TableCell>
                          <TableCell>{student.name}</TableCell>
                          <TableCell>{student.email}</TableCell>
                          <TableCell>{student.mobileno}</TableCell>
                          <TableData>
                            <ActionButton onClick={() => handleEditClick(student)}>
                              Edit
                            </ActionButton>
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
                        <TableCell colSpan="5" style={{ textAlign: "center" }}>
                          No students found.
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

      {editingStudent && (
        <ModalOverlay>
          <ModalContent>
            <h3>Edit Student</h3>
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
              <Label>Roll No</Label>
              <Input
                type="text"
                name="rollno"
                value={formData.rollno}
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
            <FormGroup>
              <Label>Mobile No</Label>
              <Input
                type="text"
                name="mobileno"
                value={formData.mobileno}
                onChange={handleInputChange}
              />
            </FormGroup>
            <FormGroup>
              <Label>Gender</Label>
              <StyledSelect
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                style={{ width: '100%' }}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </StyledSelect>
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

export default Students;
