import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
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
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BACKEND_URL } from "../../constants/url";

export const AttendanceContainer = styled.div`
  display: flex;
  padding-left: 240px;

  @media screen and (max-width: 768px) {
    flex-direction: column;
    padding-left: 0;
  }
`;

const CheckAttendanceSection = () => {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]); // Add this line

  // Fetch students from the backend
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get(
          `${BACKEND_URL}api/v1/attendance/students`
        );
        console.log("Response Status:", response.status); // Log the status
        console.log("API Response:", response.data); // Log the data

        // Check if the data is an array
        if (Array.isArray(response.data)) {
          setStudents(response.data);
          // Set default attendance to "Present" for each student
          const initialAttendance = response.data.reduce((acc, student) => {
            acc[student._id] = "Present"; // Set default to "Present"
            return acc;
          }, {});
          setAttendance(initialAttendance);
        } else {
          console.error("Data is not an array:", response.data);
        }
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };

    fetchStudents();
    toast.success("Attendance Data fetched successfully!");
  }, []);

  // Handle checkbox changes
  const handleAttendanceChange = (studentId, status) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleDateChange = (event) => {
    const selectedDate = new Date(event.target.value);
    const formattedDate = selectedDate.toISOString().split("T")[0]; // Formats date to YYYY-MM-DD
    setDate(formattedDate);
  };

  // Submit attendance
  const handleSubmit = async () => {
    try {
      if (!date) {
        alert("Please select a date.");
        return;
      }
      // Send the attendance data to the server
      await axios.post(`${BACKEND_URL}api/v1/attendance/attendance`, {
        attendance,
        date,
      });
      toast.success("Attendance submitted successfully!");
    } catch (error) {
      console.error("Error submitting attendance:", error);
      toast.error("Failed to submit attendance.");
    }
  };

  return (
    <>
      <AttendanceContainer>
        <Sidebar />
        <Content>
          <AttendanceContent>
            <AttendanceHeader>Mark Attendance</AttendanceHeader>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontWeight: "bold", marginRight: "10px" }}>Select Date:</label>
              <input
                type="date"
                value={date}
                onChange={handleDateChange}
                required
                style={{
                  padding: "12px 16px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  fontSize: "16px",
                  outline: "none",
                  transition: "border-color 0.3s"
                }}
                onFocus={(e) => e.target.style.borderColor = "#007bff"}
                onBlur={(e) => e.target.style.borderColor = "#ccc"}
              />
            </div>

            <TableContainer>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHeaderCell>Roll Number</TableHeaderCell>
                    <TableHeaderCell>Name</TableHeaderCell>
                    <TableHeaderCell>Email</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                  </TableRow>
                </TableHeader>
                <tbody>
                  {Array.isArray(students) && students.length > 0 ? (
                    students.map((student) => (
                      <TableRow key={student._id}>
                        <TableCell>{student.rollno}</TableCell>
                        <TableCell>{student.name || "N/A"}</TableCell>
                        <TableCell>{student.email || "N/A"}</TableCell>
                        <TableCell>
                          <label style={{ marginRight: "15px", cursor: "pointer", color: "green", fontWeight: "bold" }}>
                            <input
                              type="radio"
                              name={`attendance-${student._id}`}
                              checked={attendance[student._id] === "Present"}
                              onChange={() => handleAttendanceChange(student._id, "Present")}
                              style={{ marginRight: "5px" }}
                            />
                            Present
                          </label>
                          <label style={{ cursor: "pointer", color: "red", fontWeight: "bold" }}>
                            <input
                              type="radio"
                              name={`attendance-${student._id}`}
                              checked={attendance[student._id] === "Absent"}
                              onChange={() => handleAttendanceChange(student._id, "Absent")}
                              style={{ marginRight: "5px" }}
                            />
                            Absent
                          </label>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan="4" style={{ textAlign: "center" }}>No students found.</TableCell>
                    </TableRow>
                  )}
                </tbody>
              </Table>
            </TableContainer>

            <SubmitButton onClick={handleSubmit} style={{ marginTop: "20px" }}>Submit Attendance</SubmitButton>
          </AttendanceContent>
        </Content>
      </AttendanceContainer>
      <ToastContainer />
    </>
  );
};

export default CheckAttendanceSection;
