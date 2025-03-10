import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import {
  Content,
  AttendanceContent,
  AttendanceHeader,
  AttendanceList,
  AttendanceItem,
  StudentName,
  CheckboxLabel,
  SubmitButton,
} from "../../styles/AttendanceStyles";
import styled from "styled-components";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
          "https://campus-sync-ez7y.onrender.com/api/v1/attendance/students"
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
      await axios.post("https://campus-sync-ez7y.onrender.com/api/v1/attendance/attendance", {
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
            <AttendanceHeader>Attendance</AttendanceHeader>

            <div>
              <label>Date:</label>
              <input
                type="date"
                value={date}
                onChange={handleDateChange}
                required
              />
            </div>

            <AttendanceList>
              {Array.isArray(students) && students.length > 0 ? (
                students.map((student) => (
                  <AttendanceItem key={student._id}>
                    <StudentName>{student.rollno}</StudentName>{" "}
                    {/* Displaying roll number */}
                    <CheckboxLabel>
                      <input
                        type="radio"
                        name={`attendance-${student._id}`}
                        checked={attendance[student._id] === "Present"}
                        onChange={() =>
                          handleAttendanceChange(student._id, "Present")
                        }
                      />
                      Present
                    </CheckboxLabel>
                    <CheckboxLabel>
                      <input
                        type="radio"
                        name={`attendance-${student._id}`}
                        checked={attendance[student._id] === "Absent"}
                        onChange={() =>
                          handleAttendanceChange(student._id, "Absent")
                        }
                      />
                      Absent
                    </CheckboxLabel>
                  </AttendanceItem>
                ))
              ) : (
                <p>No students found.</p>
              )}
            </AttendanceList>
            <SubmitButton onClick={handleSubmit}>Submit</SubmitButton>
          </AttendanceContent>
        </Content>
      </AttendanceContainer>
      <ToastContainer />
    </>
  );
};

export default CheckAttendanceSection;
