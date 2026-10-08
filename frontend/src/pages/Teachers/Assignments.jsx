import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import axios from 'axios';
import {
    PageContainer,
    SidebarContainer,
    ContentContainer,
    FormContainer,
    AssignmentForm,
    Input,
    Textarea,
    Button,
    AssignmentList,
    AssignmentCard,
    Title,
    Description,
} from '../../styles/AdminAssignmentsStyles.js';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BACKEND_URL } from '../../constants/url';
import { formatDateDDMMYYYY } from '../../utils/dateUtils';

const TeacherAssignments = () => {
    const [newAssignment, setNewAssignment] = useState({
        title: '',
        subject: '',
        department: 'Computer Science',
        className: 'Semester 1',
        section: 'A',
        batch: 'all',
        targetAudience: 'cohort',
        targetStudentEmail: '',
        targetStudentRollno: '',
        dueDate: '',
        description: '',
    });
    const [assignments, setAssignments] = useState([]);

    useEffect(() => {
        fetchAssignments();
    }, []);

    const fetchAssignments = async () => {
        try {
            const response = await axios.get(`${BACKEND_URL}api/v1/assignments/getall`);
            setAssignments((response.data.assignments || []).reverse());
        } catch (error) {
            toast.error('Error fetching assignments');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewAssignment((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddAssignment = async (e) => {
        e.preventDefault();
        if (!newAssignment.title || !newAssignment.description) {
            toast.error('Please fill out assignment title and instructions.');
            return;
        }

        if (newAssignment.targetAudience === 'single_student' && !newAssignment.targetStudentEmail && !newAssignment.targetStudentRollno) {
            toast.error('Please specify target student email or roll number.');
            return;
        }

        try {
            const response = await axios.post(`${BACKEND_URL}api/v1/assignments/add`, newAssignment);
            if (response.data.success) {
                toast.success('Course assignment published successfully!');
                setNewAssignment({
                    title: '',
                    subject: '',
                    department: 'Computer Science',
                    className: 'Semester 1',
                    section: 'A',
                    batch: 'all',
                    targetAudience: 'cohort',
                    targetStudentEmail: '',
                    targetStudentRollno: '',
                    dueDate: '',
                    description: '',
                }); 
                fetchAssignments();  
            }
        } catch (error) {
            console.error('Error adding assignment:', error);
            toast.error('Failed to create assignment');
        }
    };

    return (
        <>
        <PageContainer>
            <SidebarContainer>
                <Sidebar />
            </SidebarContainer>
            <ContentContainer>
                <h1>Faculty Assignment Desk</h1>
                <p style={{ color: "#64748b", fontSize: "14px", marginTop: "-10px", marginBottom: "20px" }}>
                    Issue subject homework, problem sets, and term projects specifying department, class, and section.
                </p>

                <FormContainer>
                    <AssignmentForm onSubmit={handleAddAssignment}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px", width: "100%", marginBottom: "12px" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "4px" }}>
                                    Assignment Title *
                                </label>
                                <Input
                                    type="text"
                                    name="title"
                                    value={newAssignment.title}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Operating System Threading Lab"
                                    required
                                />
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "4px" }}>
                                    Course / Subject *
                                </label>
                                <Input
                                    type="text"
                                    name="subject"
                                    value={newAssignment.subject}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Operating Systems"
                                />
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "4px" }}>
                                    Department *
                                </label>
                                <select
                                    name="department"
                                    value={newAssignment.department}
                                    onChange={handleInputChange}
                                    style={{
                                        width: "100%",
                                        padding: "10px",
                                        borderRadius: "8px",
                                        border: "1px solid #cbd5e1",
                                        fontSize: "14px",
                                        outline: "none",
                                        background: "white",
                                    }}
                                >
                                    <option value="Computer Science">Computer Science</option>
                                    <option value="Information Technology">Information Technology</option>
                                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                                    <option value="Electronics & Communication">Electronics & Comm.</option>
                                    <option value="Civil Engineering">Civil Engineering</option>
                                    <option value="Electrical Engineering">Electrical Engineering</option>
                                    <option value="Management Studies">Management Studies</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "4px" }}>
                                    Class / Term Level *
                                </label>
                                <select
                                    name="className"
                                    value={newAssignment.className}
                                    onChange={handleInputChange}
                                    style={{
                                        width: "100%",
                                        padding: "10px",
                                        borderRadius: "8px",
                                        border: "1px solid #cbd5e1",
                                        fontSize: "14px",
                                        outline: "none",
                                        background: "white",
                                    }}
                                >
                                    <option value="Semester 1">Semester 1 (1st Year)</option>
                                    <option value="Semester 2">Semester 2 (1st Year)</option>
                                    <option value="Semester 3">Semester 3 (2nd Year)</option>
                                    <option value="Semester 4">Semester 4 (2nd Year)</option>
                                    <option value="Semester 5">Semester 5 (3rd Year)</option>
                                    <option value="Semester 6">Semester 6 (3rd Year)</option>
                                    <option value="Semester 7">Semester 7 (Final Year)</option>
                                    <option value="Semester 8">Semester 8 (Final Year)</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "4px" }}>
                                    Batch Cohort *
                                </label>
                                <select
                                    name="batch"
                                    value={newAssignment.batch}
                                    onChange={handleInputChange}
                                    style={{
                                        width: "100%",
                                        padding: "10px",
                                        borderRadius: "8px",
                                        border: "1px solid #cbd5e1",
                                        fontSize: "14px",
                                        outline: "none",
                                        background: "white",
                                    }}
                                >
                                    <option value="all">Target All Batches</option>
                                    <option value="Batch 2024">Batch 2024</option>
                                    <option value="Batch 2025">Batch 2025</option>
                                    <option value="Batch 2023">Batch 2023</option>
                                    <option value="Batch 2022">Batch 2022</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "4px" }}>
                                    Section / Group *
                                </label>
                                <select
                                    name="section"
                                    value={newAssignment.section}
                                    onChange={handleInputChange}
                                    style={{
                                        width: "100%",
                                        padding: "10px",
                                        borderRadius: "8px",
                                        border: "1px solid #cbd5e1",
                                        fontSize: "14px",
                                        outline: "none",
                                        background: "white",
                                    }}
                                >
                                    <option value="All Sections">All Sections</option>
                                    <option value="Section A">Section A</option>
                                    <option value="Section B">Section B</option>
                                    <option value="Section C">Section C</option>
                                    <option value="Group 1">Group 1</option>
                                    <option value="Group 2">Group 2</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "4px" }}>
                                    Submission Due Date
                                </label>
                                <Input
                                    type="date"
                                    name="dueDate"
                                    value={newAssignment.dueDate}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "4px" }}>
                                    Target Audience *
                                </label>
                                <select
                                    name="targetAudience"
                                    value={newAssignment.targetAudience}
                                    onChange={handleInputChange}
                                    style={{
                                        width: "100%",
                                        padding: "10px",
                                        borderRadius: "8px",
                                        border: "1px solid #cbd5e1",
                                        fontSize: "14px",
                                        outline: "none",
                                        background: "white",
                                    }}
                                >
                                    <option value="cohort">Whole Class / Cohort</option>
                                    <option value="single_student">Specific Student Only</option>
                                </select>
                            </div>

                            {newAssignment.targetAudience === 'single_student' && (
                                <>
                                    <div>
                                        <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#0284c7", marginBottom: "4px" }}>
                                            Student Email
                                        </label>
                                        <Input
                                            type="email"
                                            name="targetStudentEmail"
                                            value={newAssignment.targetStudentEmail}
                                            onChange={handleInputChange}
                                            placeholder="student@example.com"
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#0284c7", marginBottom: "4px" }}>
                                            Or Student Roll No
                                        </label>
                                        <Input
                                            type="text"
                                            name="targetStudentRollno"
                                            value={newAssignment.targetStudentRollno}
                                            onChange={handleInputChange}
                                            placeholder="e.g. CS2024-001"
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "4px" }}>
                            Assignment Instructions & Criteria *
                        </label>
                        <Textarea
                            name="description"
                            value={newAssignment.description}
                            onChange={handleInputChange}
                            placeholder="Provide detailed submission requirements, rubric, format..."
                            required
                        />
                        <Button type="submit">Publish Assignment to Students</Button>
                    </AssignmentForm>
                </FormContainer>

                <AssignmentList>
                    {assignments.map((assignment) => (
                        <AssignmentCard key={assignment._id}>
                            <Title>{assignment.title}</Title>
                            
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", margin: "10px 0 14px 0" }}>
                                {assignment.targetAudience === 'single_student' || assignment.targetStudentEmail ? (
                                    <span style={{ background: "#fdf4ff", color: "#86198f", border: "1px solid #f5d0fe", padding: "3px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: 700 }}>
                                        🎯 Specific Student: {assignment.targetStudentEmail || assignment.targetStudentRollno || 'Individual'}
                                    </span>
                                ) : (
                                    <span style={{ background: "#f0fdf4", color: "#166534", padding: "3px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: 700 }}>
                                        👥 Entire Cohort
                                    </span>
                                )}
                                <span style={{ background: "#ecfdf5", color: "#065f46", padding: "3px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: 700 }}>
                                    🏛️ {assignment.department || "Computer Science"}
                                </span>
                                <span style={{ background: "#eff6ff", color: "#1e40af", padding: "3px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: 700 }}>
                                    📚 {assignment.subject || "Coursework"}
                                </span>
                                <span style={{ background: "#fef3c7", color: "#92400e", padding: "3px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: 700 }}>
                                    🎓 {assignment.className || "Class"}
                                </span>
                                <span style={{ background: "#f1f5f9", color: "#334155", padding: "3px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: 600 }}>
                                    👥 {assignment.batch === 'all' || !assignment.batch ? 'All Batches' : assignment.batch} • Sec: {assignment.section || "A"}
                                </span>
                                {assignment.dueDate && (
                                    <span style={{ background: "#fff1f2", color: "#9f1239", padding: "3px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: 700 }}>
                                        ⏰ Due: {formatDateDDMMYYYY(assignment.dueDate)}
                                    </span>
                                )}
                            </div>

                            <Description>{assignment.description}</Description>
                        </AssignmentCard>
                    ))}
                </AssignmentList>
            </ContentContainer>
        </PageContainer>
        <ToastContainer />
        </>
    );
};

export default TeacherAssignments;