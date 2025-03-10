import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminSidebar from "./Sidebar";
import {
  StudentsContainer,
  Content,
  StudentsContent,
  StudentsHeader,
  StudentList,
  StudentItem,
  RemoveButton,
} from "../../styles/StudentsStyles";
import { ToastContainer, toast } from "react-toastify";

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get(
          "https://campus-sync-ez7y.onrender.com/api/v1/student/getall"
        );
        console.log("Response Status:", response.status);
        console.log("API Response:", response.data);

        if (response.data && response.data.students) {
          setStudents(response.data.students);
        } else {
          console.error("Students data not found:", response.data);
          toast.error("Failed to load students data");
        }
      } catch (error) {
        console.error("Error fetching students:", error);
        toast.error("Error fetching students data");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const removeStudent = async (studentId, studentEmail) => {

    const confirmed = window.confirm(`Are you sure you want to remove student ${studentEmail}?`);
    if (!confirmed) {
      return; 
    }


    try {
      const response = await axios.delete(`https://campus-sync-ez7y.onrender.com/api/v1/student/${studentId}`);
      console.log("Response:", response);
      setStudents(students.filter(student => student._id !== studentId));


      toast.success("Student removed successfully", { autoClose: 2000 });
    } catch (error) {
      console.error("Error removing student:", error);
      toast.error("Error removing student");
    }
  };

  return (
    <>
      <StudentsContainer>
        <AdminSidebar />
        <Content>
          <StudentsContent>
            <StudentsHeader>Students</StudentsHeader>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <StudentList>
                {students.length > 0 ? (
                  students.map((student) => (
                    <StudentItem key={student._id}>
                      <span>{student.name} - {student.email}</span>
                      <RemoveButton onClick={() => removeStudent(student._id, student.email)}>
                        Remove
                      </RemoveButton>
                    </StudentItem>
                  ))
                ) : (
                  <p>No students found.</p>
                )}
              </StudentList>
            )}
          </StudentsContent>
        </Content>
      </StudentsContainer>
      <ToastContainer />
    </>
  );
};

export default Students;
