import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminSidebar from "./Sidebar";
import {
  TeachersContainer,
  Content,
  TeachersContent,
  TeachersHeader,
  TeacherList,
  TeacherItem,
  RemoveButton
} from '../../styles/TeachersStyles';
import { ToastContainer, toast } from "react-toastify";
import { BACKEND_URL } from "../../constants/url";
const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await axios.get(
          `${BACKEND_URL}api/v1/teacher/getall`
        );
        console.log("Response Status:", response.status);
        console.log("API Response:", response.data);

        if (response.data && response.data.teachers) {
          setTeachers(response.data.teachers); // Correcting the variable name to 'teachers'
        } else {
          console.error("Teachers data not found:", response.data);
          toast.error("Failed to load teachers data");
        }
      } catch (error) {
        console.error("Error fetching teachers:", error);
        toast.error("Error fetching teachers data");
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers(); // Corrected to fetch teachers instead of students
  }, []);

  const removeTeacher = async (teacherId, teacherEmail) => {
    // Confirm removal
    const confirmed = window.confirm(`Are you sure you want to remove teacher ${teacherEmail}?`);
    if (!confirmed) {
      return; // If user cancels, do nothing
    }

    try {
      const response = await axios.delete(`${BACKEND_URL}api/v1/teacher/${teacherId}`);
      console.log("Response:", response);
      setTeachers(teachers.filter(teacher => teacher._id !== teacherId)); // Corrected to update 'teachers' state

      // Success toast
      toast.success("Teacher removed successfully", { autoClose: 2000 });
    } catch (error) {
      console.error("Error removing teacher:", error);
      toast.error("Error removing teacher");
    }
  };

  return (
    <>
      <TeachersContainer>
        <AdminSidebar />
        <Content>
          <TeachersContent>
            <TeachersHeader>Teachers</TeachersHeader>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <TeacherList>
                {teachers.length > 0 ? (
                  teachers.map((teacher) => (
                    <TeacherItem key={teacher._id}>
                      <span>{teacher.name} - {teacher.email}</span>
                      <RemoveButton onClick={() => removeTeacher(teacher._id, teacher.email)}>
                        Remove
                      </RemoveButton>
                    </TeacherItem>
                  ))
                ) : (
                  <p>No teachers found.</p>
                )}
              </TeacherList>
            )}
          </TeachersContent>
        </Content>
      </TeachersContainer>
      <ToastContainer />
    </>
  );
};

export default Teachers;
