import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import {
  StudentsContainer,
  Content,
  StudentsContent,
  StudentsHeader,
  StudentList,
  StudentItem,
  StudentInfo,
  NoStudentsMessage,
} from "../../styles/StudentsStyles";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BACKEND_URL } from "../../constants/url";

const StudentSection = () => {
  const [students, setStudents] = useState([]); // Initialize as an empty array
  const [loading, setLoading] = useState(true); // Track loading state
  const [error, setError] = useState(null); // Track errors

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}api/v1/student`);
        const data = await response.json();

        // Check if `data` is an array
        if (Array.isArray(data)) {
          setStudents(data);
        } else {
          setError("Data fetched is not an array.");
        }
      } catch (err) {
        setError("Failed to fetch students.");
      } finally {
        setLoading(false); // Set loading to false once fetch completes
      }
    };

    fetchStudents();
    toast.success("Students Fetched Successfully");
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Display loading message while fetching data
  }

  if (error) {
    return <div>Error: {error}</div>; // Display error message
  }

  return (
    <>
      <Sidebar />
      <StudentsContainer>
        <Content>
          <StudentsContent>
            <StudentsHeader>Students</StudentsHeader>
            {students.length > 0 ? (
              <StudentList>
                {students.map((student) => (
                  <StudentItem key={student._id}>
                    <StudentInfo>
                      <div>
                        <span className="label">Roll Number:</span>{" "}
                        {student.rollno}
                      </div>
                      <div>
                        <span className="label">Email:</span> {student.email}
                      </div>
                      <div>
                        <span className="label">Phone:</span> {student.mobileno}
                      </div>
                    </StudentInfo>
                  </StudentItem>
                ))}
              </StudentList>
            ) : (
              <NoStudentsMessage>No students found.</NoStudentsMessage>
            )}
          </StudentsContent>
        </Content>
      </StudentsContainer>
      <ToastContainer />
    </>
  );
};

export default StudentSection;
