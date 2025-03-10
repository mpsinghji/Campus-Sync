import React, { useState, useEffect } from "react";
import AdminSidebar from "./Sidebar";
import {
  ExamContainer,
  SidebarContainer,
  Content,
  ExamHeader,
  ExamForm,
  FormLabel,
  FormInput,
  AddButton,
} from '../../styles/ExamStyles';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const AdminExam = () => {
  const [examData, setExamData] = useState([]);
  const [subjectName, setSubjectname] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [batch, setBatch] = useState('');
  const [date, setDate] = useState('');

  
  useEffect(() => {
    fetchExams();
    toast.success('Exams fetched successfully');
  }, []);

  const fetchExams = async () => {
    try {
      const response = await axios.get('https://campus-sync-ez7y.onrender.com/api/v1/exam/getall');
      if (Array.isArray(response.data.exams)) { 
        setExamData(response.data.exams.reverse());
      } else {
        toast.error('Unexpected data format received');
      }
    } catch (error) {
      toast.error('Error fetching exams');
    }
  };
  

  const handleAddExam = async (e) => {
    e.preventDefault();
    const newExam = { subjectName, subjectCode, batch, date } ;
    try {
      const response = await axios.post('https://campus-sync-ez7y.onrender.com/api/v1/exam', newExam);
      if (typeof response.data === 'object') {
        setExamData([...examData, response.data]);
        setSubjectname('');
        setSubjectCode('');
        setBatch('');
        setDate('');
        fetchExams();
      } else {
        toast.error('Error adding exam');
      }
    } catch (error) {
      toast.error('Error adding exam');
    }
  };
  return (
    <>
    <ExamContainer>
      <SidebarContainer>
        <AdminSidebar />
      </SidebarContainer>
      <Content>
        <ExamHeader>Exam Details</ExamHeader>
        <ExamForm onSubmit={handleAddExam}>
          <FormLabel>Subject Name:</FormLabel>
          <FormInput
            type="text"
            value={subjectName}
            onChange={(e) => setSubjectname(e.target.value)}
            required
            />
          <FormLabel>Subject Code:</FormLabel>
          <FormInput
            type="text"
            value={subjectCode}
            onChange={(e) => setSubjectCode(e.target.value)}
            required
            />
          <FormLabel>Batch:</FormLabel>
          <FormInput
            type="text"
            value={batch}
            onChange={(e) => setBatch(e.target.value)}
            required
            />
          <FormLabel>Date:</FormLabel>
          <FormInput
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            />
          <AddButton type="submit">Add Exam</AddButton>
        </ExamForm>
        <h3>Exam Details:</h3>
        <ul>
          {examData.map((exam,index) => (
            <li key={index} style={{ marginBottom: '10px', backgroundColor: '#f2f2f2', padding: '10px', borderRadius: '5px' }}>
              <p><strong>Subject Name:</strong> {exam.subjectName}</p>
              <p><strong>Subject Code:</strong> {exam.subjectCode}</p>
              <p><strong>Batch:</strong> {exam.batch}</p>
              <p><strong>Date:</strong> {new Date(exam.date).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      </Content>
    </ExamContainer>
    <ToastContainer />
  </>
  )
}

export default AdminExam