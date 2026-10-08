import React, { useState, useEffect } from "react";
import AdminSidebar from "./Sidebar.jsx";
import axios from "axios";
import { AdminDashboardContainer, Content, TopContent, BottomContent, Section, SectionTitle } from "../../styles/DashboardStyles.js";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import AttendanceGraph from "../../components/Analysis/Attendance.jsx";
import PaymentGraph from "../../components/Analysis/paymentDisplay.jsx";
import ActivityGraph from "../../components/Analysis/Activitycount.jsx";
import UserAnalysis from "../../components/Analysis/userAnalysis.jsx";
import Cookies from "js-cookie";
import styled from "styled-components";
import { BACKEND_URL } from "../../constants/url";

const SuperAdminBanner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  background: linear-gradient(135deg, #fef9c3 0%, #fef08a 100%);
  border: 1px solid #fde047;
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(234, 179, 8, 0.15);
  flex-wrap: wrap;
`;

const SuperAdminLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const CrownIcon = styled.span`
  font-size: 28px;
`;

const SuperAdminTitle = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: #854d0e;
`;

const SuperAdminDesc = styled.div`
  font-size: 13px;
  color: #a16207;
  margin-top: 2px;
`;

const MasterBtn = styled.button`
  background: #ca8a04;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 10px 18px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    background: #a16207;
    transform: translateY(-1px);
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
  width: 100%;
`;

const StatCard = styled.div`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border-color: #cbd5e1;
  }
`;

const StatIcon = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
`;

const StatInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const StatNumber = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.2;
`;

const StatLabel = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  margin-top: 2px;
`;

const AdminDashboard = () => {
  const [data, setData] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalAdmins: 0,
    breakdown: {
      librarians: 0,
      examControllers: 0,
      eventCoordinators: 0,
      studentRegistrars: 0,
      faculty: 0,
    },
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Check if logged-in admin is Super Admin
  const isSuperAdmin = (() => {
    try {
      const cookie = Cookies.get("adminData");
      if (cookie) {
        const parsed = JSON.parse(cookie);
        return parsed.email?.toLowerCase().trim() === "admin@campus-sync.com";
      }
    } catch {
      return false;
    }
    return false;
  })();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${BACKEND_URL}api/v1/admin/dashboard`,
          {
            headers: {
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );

        setData({
          totalStudents: response.data.totalStudents || 0,
          totalTeachers: response.data.totalTeachers || 0,
          totalAdmins: response.data.totalAdmins || 0,
          breakdown: response.data.breakdown || {
            librarians: 0,
            examControllers: 0,
            eventCoordinators: 0,
            studentRegistrars: 0,
            faculty: 0,
          },
        });
      } catch (err) {
        const status = err.response?.status;

        if (status === 401) {
          toast.error("Session expired. Redirecting to login...");
          setTimeout(() => {
            window.location.href = "/admin-signin";
          }, 2000);
        } else {
          toast.error("Failed to fetch data. Please try again later.");
        }
        setError(true);
      }
    };

    fetchData();
  }, [navigate]);

  if (error) {
    return <div>Error fetching data. Please try again later.</div>;
  }

  return (
    <AdminDashboardContainer>
      <Content>
        <TopContent>
          <Section>
            <SectionTitle>Campus Operations & Category Overview</SectionTitle>
          </Section>
        </TopContent>

        {/* Specialized Category Breakdown Grid */}
        <StatsGrid>
          <StatCard onClick={() => navigate("/admin/Teachers")}>
            <StatIcon style={{ background: "#e0f2fe", color: "#0284c7" }}>👨‍🏫</StatIcon>
            <StatInfo>
              <StatNumber>{data.breakdown?.faculty || 0}</StatNumber>
              <StatLabel>Teaching Faculty</StatLabel>
            </StatInfo>
          </StatCard>

          <StatCard onClick={() => navigate("/admin/Teachers")}>
            <StatIcon style={{ background: "#fef3c7", color: "#d97706" }}>📚</StatIcon>
            <StatInfo>
              <StatNumber>{data.breakdown?.librarians || 0}</StatNumber>
              <StatLabel>Librarians</StatLabel>
            </StatInfo>
          </StatCard>

          <StatCard onClick={() => navigate("/admin/Teachers")}>
            <StatIcon style={{ background: "#fee2e2", color: "#dc2626" }}>📝</StatIcon>
            <StatInfo>
              <StatNumber>{data.breakdown?.examControllers || 0}</StatNumber>
              <StatLabel>Exam Controllers</StatLabel>
            </StatInfo>
          </StatCard>

          <StatCard onClick={() => navigate("/admin/Teachers")}>
            <StatIcon style={{ background: "#f3e8ff", color: "#9333ea" }}>🎉</StatIcon>
            <StatInfo>
              <StatNumber>{data.breakdown?.eventCoordinators || 0}</StatNumber>
              <StatLabel>Event Coordinators</StatLabel>
            </StatInfo>
          </StatCard>

          <StatCard onClick={() => navigate("/admin/Teachers")}>
            <StatIcon style={{ background: "#ccfbf1", color: "#0d9488" }}>📋</StatIcon>
            <StatInfo>
              <StatNumber>{data.breakdown?.studentRegistrars || 0}</StatNumber>
              <StatLabel>Student Registrars</StatLabel>
            </StatInfo>
          </StatCard>

          <StatCard onClick={() => navigate("/admin/Students")}>
            <StatIcon style={{ background: "#dcfce7", color: "#16a34a" }}>🎓</StatIcon>
            <StatInfo>
              <StatNumber>{data.totalStudents || 0}</StatNumber>
              <StatLabel>Total Students</StatLabel>
            </StatInfo>
          </StatCard>

          <StatCard onClick={() => (isSuperAdmin ? navigate("/master-control") : navigate("/admin-register"))}>
            <StatIcon style={{ background: "#e2e8f0", color: "#475569" }}>🛡️</StatIcon>
            <StatInfo>
              <StatNumber>{data.totalAdmins || 0}</StatNumber>
              <StatLabel>Administrators</StatLabel>
            </StatInfo>
          </StatCard>
        </StatsGrid>

        <BottomContent>
          <UserAnalysis
            totalStudents={data.totalStudents}
            totalTeachers={data.totalTeachers}
            totalAdmins={data.totalAdmins}
          />
          <PaymentGraph />
        </BottomContent>
        <BottomContent>
          <AttendanceGraph />
          <ActivityGraph />
        </BottomContent>
      </Content>
    </AdminDashboardContainer>
  );
};

export default AdminDashboard;
