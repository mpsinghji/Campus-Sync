import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "./Sidebar";
import {
  ProfileContainer,
  SidebarContainer,
  Content,
  ProfileHeader,
  ProfileDetails,
  ProfileLabel,
  ProfileInfo,
  EditButton,
} from '../../styles/SettingsProfileStyles';
import Loading from "../../components/Loading/loading";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Cookies from "js-cookie";
import axios from "axios";
import { BACKEND_URL } from "../../constants/url";

const AdminSettingProfile = () => {
  const [adminInfo, setAdminInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    qualification: '',
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadAdminProfile = async () => {
      try {
        // Get admin data from cookie
        const adminDataCookie = Cookies.get("adminData");
        
        if (!adminDataCookie) {
          navigate('/choose-user');
          return;
        }

        // Parse admin data to get token
        const adminData = JSON.parse(adminDataCookie);
        if (!adminData.token) {
          navigate('/choose-user');
          return;
        }

        // Fetch latest admin data from API
        const response = await axios.get(`${BACKEND_URL}api/v1/admin/profile`, {
          withCredentials: true
        });

        if (response.data) {
          setAdminInfo({
            name: response.data.name || '',
            email: response.data.email || '',
            phone: response.data.phone || '',
            address: response.data.address || '',
            qualification: response.data.qualification || '',
          });
          toast.success("Admin profile fetched successfully");
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error loading admin profile:", error);
        if (error.response?.status === 401) {
          // Clear invalid data and redirect
          Cookies.remove('adminData', { path: '/' });
          navigate('/choose-user');
        } else {
          toast.error("Failed to load admin profile");
        }
      } finally {
        setLoading(false);
      }
    };

    loadAdminProfile();
  }, [navigate]);

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <ProfileContainer>
        <SidebarContainer>
          <AdminSidebar />
        </SidebarContainer>
        <Content>
          <ProfileHeader>Profile Details</ProfileHeader>
          <ProfileDetails>
            <ProfileLabel>Name:</ProfileLabel>
            <ProfileInfo>{adminInfo.name || 'Not provided'}</ProfileInfo>
            <ProfileLabel>Email:</ProfileLabel>
            <ProfileInfo>{adminInfo.email || 'Not provided'}</ProfileInfo>
            <ProfileLabel>Phone:</ProfileLabel>
            <ProfileInfo>{adminInfo.phone || 'Not provided'}</ProfileInfo>
            <ProfileLabel>Address:</ProfileLabel>
            <ProfileInfo>{adminInfo.address || 'Not provided'}</ProfileInfo>
            <ProfileLabel>Qualification:</ProfileLabel>
            <ProfileInfo>{adminInfo.qualification || 'Not provided'}</ProfileInfo>
          </ProfileDetails>
          <EditButton>Edit Profile</EditButton>
        </Content>
      </ProfileContainer>
      <ToastContainer />
    </>
  );
};

export default AdminSettingProfile;
