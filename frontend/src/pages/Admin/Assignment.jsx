import React, { useState, useEffect } from 'react';
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
import AdminSidebar from './Sidebar';



const AdminAssignments = () => {
    const [newAssignment, setNewAssignment] = useState({ title: '', description: '' });
    const [assignments, setAssignments] = useState([]);

    useEffect(() => {
        fetchAssignments();
        toast.success('Assignments fetched successfully');
    }, []);

    const fetchAssignments = async () => {
        try {
            const response = await axios.get('https://campus-sync-ez7y.onrender.com/api/v1/assignments/getall');
            setAssignments(response.data.assignments.reverse());
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
            toast.error('Please fill out all fields.');
            return;
        }

        try {
            const response = await axios.post('https://campus-sync-ez7y.onrender.com/api/v1/assignments/add', newAssignment);
            if (response.data.success) {
                toast.success('Announcement sent successfully');
                setNewAssignment({ title: '', description: '' });
                fetchAssignments(); 
            }
        } catch (error) {
            toast.error('Error sending announcement');
        }
    };

    return (
        <>
        <PageContainer>
            <SidebarContainer>
                <AdminSidebar /> 
            </SidebarContainer>
            <ContentContainer>
                <h1>Admin Assignments</h1>

                <FormContainer>
                    <AssignmentForm onSubmit={handleAddAssignment}>
                        <Input
                            type="text"
                            name="title"
                            value={newAssignment.title}
                            onChange={handleInputChange}
                            placeholder="Assignment Title"
                        />
                        <Textarea
                            name="description"
                            value={newAssignment.description}
                            onChange={handleInputChange}
                            placeholder="Assignment Description"
                        />
                        <Button type="submit">Add Assignment</Button>
                    </AssignmentForm>
                </FormContainer>

                <AssignmentList>
                    {assignments.map((assignment) => (
                        <AssignmentCard key={assignment._id}>
                            <Title>{assignment.title}</Title>
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

export default AdminAssignments;