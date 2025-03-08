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
    const loadAdminProfile = () => {
      try {
        // Get admin data from cookie
        const adminDataCookie = Cookies.get("adminData");
        
        if (!adminDataCookie) {
          navigate('/choose-user');
          return;
        }

        // Parse and set admin data from cookie
        const adminData = JSON.parse(adminDataCookie);
        setAdminInfo({
          name: adminData.name || '',
          email: adminData.email || '',
          phone: adminData.phone || '',
          address: adminData.address || '',
          qualification: adminData.qualification || '',
        });
        toast.success("Admin profile fetched successfully");
        
        setLoading(false);
      } catch (error) {
        console.error("Error loading admin profile:", error);
        navigate('/choose-user');
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
