import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  ExamContainer,
  SidebarContainer,
  Content,
  ExamHeader,
  ExamResultsContainer,
  ExamSubject,
  ExamResult,
} from '../../styles/ExamStyles';
import axios from 'axios';

const ExamSection = () => {
  const [exam, setExam] = useState([]);

  useEffect(() => {
    fetchExams();
    toast.success('Data fetched successfully');
  }, []);

  const fetchExams = async () => {
    try {
      const response = await axios.get('https://campus-sync-ez7y.onrender.com/api/v1/exam/getall');
      if (Array.isArray(response.data.exams)) {
        setExam(response.data.exams.reverse());
      } else {
        toast.error('Unexpected data format received');
      }
    } catch (error) {
      console.log(error);
      toast.error('Error fetching exams');
    }
  };

  const formatDateToLocal = (date) => {
    const localDate = new Date(date);
    const day = String(localDate.getDate()).padStart(2, '0'); // Adds leading zero if needed
    const month = String(localDate.getMonth() + 1).padStart(2, '0'); // Adds leading zero and months are 0-indexed
    const year = localDate.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <>
      <ExamContainer>
        <SidebarContainer>
          <Sidebar />
        </SidebarContainer>
        <Content>
          <ExamHeader>Exams</ExamHeader>
          <ExamResultsContainer>
            {exam.length > 0 ? (
              <div>
                {exam.map((exam, index) => (
                  <div key={index}>
                    <ExamSubject>{exam.subjectName}</ExamSubject>
                    <ExamResult>Date: {formatDateToLocal(exam.date)}</ExamResult> {/* Display the formatted date */}
                  </div>
                ))}
              </div>
            ) : (
              <p>No exams found.</p>
            )}
          </ExamResultsContainer>
        </Content>
      </ExamContainer>
      <ToastContainer />
    </>
  );
};

export default ExamSection;
