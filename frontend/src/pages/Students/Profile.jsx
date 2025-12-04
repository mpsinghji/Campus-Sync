import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import styled from 'styled-components';
import Loading from '../../components/Loading/loading';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { BACKEND_URL } from '../../constants/url';

const ProfileContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f4f6f8;
`;

const SidebarContainer = styled.div`
  flex: 0 0 250px;
`;

const Content = styled.div`
  flex: 1;
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ProfileHeader = styled.h1`
  font-size: 32px;
  color: #1a252f;
  margin-bottom: 30px;
`;

const ProfileCard = styled.div`
  background-color: #1a252f;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 600px;
  color: #02fdd3;
`;

const ProfileDetail = styled.div`
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
  color: #02fdd3;
`;

const Value = styled.div`
  font-size: 18px;
  color: #ecf0f1;
  padding: 10px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
`;

const Input = styled.input`
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #34495e;
  background-color: #2c3e50;
  color: #ecf0f1;
  font-size: 16px;
  outline: none;
  &:focus {
    border-color: #02fdd3;
  }
`;

const Select = styled.select`
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #34495e;
  background-color: #2c3e50;
  color: #ecf0f1;
  font-size: 16px;
  outline: none;
  &:focus {
    border-color: #02fdd3;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
`;

const Button = styled.button`
  padding: 10px 20px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: background-color 0.3s;
`;

const EditButton = styled(Button)`
  background-color: #02fdd3;
  color: #1a252f;
  &:hover {
    background-color: #02d4b1;
  }
`;

const SaveButton = styled(Button)`
  background-color: #2ecc71;
  color: white;
  &:hover {
    background-color: #27ae60;
  }
`;

const CancelButton = styled(Button)`
  background-color: #e74c3c;
  color: white;
  &:hover {
    background-color: #c0392b;
  }
`;

const ProfileSection = () => {
  const [studentProfile, setStudentProfile] = useState({
    name: '',
    rollno: '',
    gender: '',
    mobileno: '',
    email: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudentProfile = async () => {
      try {
        const studentData = Cookies.get('studentData');
        if (!studentData) {
          toast.error('No student data found. Please log in again.');
          navigate('/choose-user');
          return;
        }

        const { token } = JSON.parse(studentData);
        if (!token) {
          toast.error('No token found. Please log in again.');
          navigate('/choose-user');
          return;
        }

        const response = await axios.get(
          `${BACKEND_URL}api/v1/student/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            withCredentials: true
          }
        );

        if (response.data) {
          setStudentProfile(response.data);
        } else {
          toast.error('No profile data received');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching student profile:', error);
        if (error.response?.status === 401) {
          toast.error('Session expired. Please log in again.');
          navigate('/choose-user');
        } else {
          toast.error('Failed to fetch profile. Please try again later.');
        }
        setLoading(false);
      }
    };

    fetchStudentProfile();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStudentProfile({ ...studentProfile, [name]: value });
  };

  const handleSave = async () => {
    try {
      const studentData = Cookies.get('studentData');
      const { token } = JSON.parse(studentData);

      await axios.put(
        `${BACKEND_URL}api/v1/student/profile`,
        studentProfile,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );
      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <ProfileContainer>
        <SidebarContainer>
          <Sidebar />
        </SidebarContainer>
        <Content>
          <ProfileHeader>Profile</ProfileHeader>
          <ProfileCard>
            <ProfileDetail>
              <Label>Name:</Label>
              {isEditing ? (
                <Input
                  type="text"
                  name="name"
                  value={studentProfile.name}
                  onChange={handleInputChange}
                />
              ) : (
                <Value>{studentProfile.name}</Value>
              )}
            </ProfileDetail>

            <ProfileDetail>
              <Label>Roll No:</Label>
              <Value>{studentProfile.rollno}</Value> {/* Roll No is usually not editable */}
            </ProfileDetail>

            <ProfileDetail>
              <Label>Email:</Label>
              {isEditing ? (
                <Input
                  type="email"
                  name="email"
                  value={studentProfile.email}
                  onChange={handleInputChange}
                />
              ) : (
                <Value>{studentProfile.email}</Value>
              )}
            </ProfileDetail>

            <ProfileDetail>
              <Label>Mobile No:</Label>
              {isEditing ? (
                <Input
                  type="text"
                  name="mobileno"
                  value={studentProfile.mobileno}
                  onChange={handleInputChange}
                />
              ) : (
                <Value>{studentProfile.mobileno}</Value>
              )}
            </ProfileDetail>

            <ProfileDetail>
              <Label>Gender:</Label>
              {isEditing ? (
                <Select
                  name="gender"
                  value={studentProfile.gender}
                  onChange={handleInputChange}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </Select>
              ) : (
                <Value>{studentProfile.gender}</Value>
              )}
            </ProfileDetail>


          </ProfileCard>
        </Content>
      </ProfileContainer>
      <ToastContainer />
    </>
  );
};

export default ProfileSection;
