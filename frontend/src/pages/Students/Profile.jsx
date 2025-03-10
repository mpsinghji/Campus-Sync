import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import {
  ProfileContainer,
  SidebarContainer,
  Content,
  ProfileHeader,
  ProfileInfo,
  ProfileDetail,
} from '../../styles/SettingsProfileStyles';
import Loading from '../../components/Loading/loading';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

const ProfileSection = () => {
  const [studentProfile, setStudentProfile] = useState({
    name: '',
    rollno: '',
    gender: '',
    mobileno: '',
    email: '',
  });
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
          'http://localhost:5000/api/v1/student/profile',
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
          <ProfileInfo>
            <ProfileDetail>
              <div style={{ fontWeight: 'bold' }}>Name:</div>
              <div>{studentProfile.name}</div>
            </ProfileDetail>
            <ProfileDetail>
              <div style={{ fontWeight: 'bold' }}>Roll. No. :</div>
              <div>{studentProfile.rollno}</div>
            </ProfileDetail>
            <ProfileDetail>
              <div style={{ fontWeight: 'bold' }}>Gender:</div>
              <div>{studentProfile.gender}</div>
            </ProfileDetail>
            <ProfileDetail>
              <div style={{ fontWeight: 'bold' }}>Mobile No. :</div>
              <div>{studentProfile.mobileno}</div>
            </ProfileDetail>
            <ProfileDetail>
              <div style={{ fontWeight: 'bold' }}>Email:</div>
              <div>{studentProfile.email}</div>
            </ProfileDetail>
          </ProfileInfo>
        </Content>
      </ProfileContainer>
      <ToastContainer />
    </>
  );
};

export default ProfileSection;
