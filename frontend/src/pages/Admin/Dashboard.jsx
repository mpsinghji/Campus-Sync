import React, { useState, useEffect } from "react";
import AdminSidebar from "./Sidebar.jsx";
import Loading from "../../components/Loading/loading.jsx";
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

const AdminDashboard = () => {
  const [data, setData] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalAdmins: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {

    // const token = localStorage.getItem("admintoken");
    const token = Cookies.get("admintoken");
    if (!token) {
      toast.error("Invalid User. Please log in again.");
      setLoading(false);
      navigate("/choose-user");
      return;
    }

    const fetchData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/v1/admin/dashboard",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setData({
          totalStudents: response.data.totalStudents,
          totalTeachers: response.data.totalTeachers,
          totalAdmins: response.data.totalAdmins,
        });
        setLoading(false);
      } catch (err) {
        setLoading(false);
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

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <div>Error fetching data. Please try again later.</div>;
  }

  return (
    <AdminDashboardContainer>
      <AdminSidebar />
      <Content>
        <TopContent>
          <Section>
            <SectionTitle>OVERVIEW</SectionTitle>
          </Section>
        </TopContent>

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
