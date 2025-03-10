import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import Loading from '../../components/Loading/loading';
import axios from 'axios';
import { ProfileContainer, SidebarContainer, Content, ProfileHeader, ProfileDetails, ProfileLabel, ProfileInfo, EditButton } from '../../styles/SettingsProfileStyles';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

const TeacherProfileSection = () => {
  const [teacherInfo, setTeacherInfo] = useState({
    email: "",
    name: "",
    phone: "",
    address: "",
    qualification: "",
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeacherProfile = async () => {
      try {
        const teacherData = Cookies.get('teacherData');
        if (!teacherData) {
          toast.error('No teacher data found. Please log in again.');
          navigate('/choose-user');
          return;
        }

        const { token } = JSON.parse(teacherData);
        if (!token) {
          toast.error('No token found. Please log in again.');
          navigate('/choose-user');
          return;
        }

        const response = await axios.get(
          "http://localhost:5000/api/v1/teacher/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            withCredentials: true
          }
        );

        if (response.data) {
          setTeacherInfo(response.data);
        } else {
          toast.error('No profile data received');
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching teacher profile:", error);
        if (error.response?.status === 401) {
          toast.error('Session expired. Please log in again.');
          navigate('/choose-user');
        } else {
          toast.error("Failed to fetch profile. Please try again later.");
        }
        setLoading(false);
      }
    };

    fetchTeacherProfile();
  }, [navigate]);

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
          <ProfileHeader>Profile Details</ProfileHeader>
          <ProfileDetails>
            <ProfileLabel>Name:</ProfileLabel>
            <ProfileInfo>{teacherInfo.name}</ProfileInfo>
            <ProfileLabel>Email:</ProfileLabel>
            <ProfileInfo>{teacherInfo.email}</ProfileInfo>
            <ProfileLabel>Phone:</ProfileLabel>
            <ProfileInfo>{teacherInfo.phone}</ProfileInfo>
            <ProfileLabel>Address:</ProfileLabel>
            <ProfileInfo>{teacherInfo.address}</ProfileInfo>
            <ProfileLabel>Qualification:</ProfileLabel>
            <ProfileInfo>{teacherInfo.qualification}</ProfileInfo>
          </ProfileDetails>
          <EditButton>Edit Profile</EditButton>
        </Content>
      </ProfileContainer>
      <ToastContainer />
    </>
  );
};

export default TeacherProfileSection;
