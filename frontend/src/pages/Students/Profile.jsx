import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import styled from "styled-components";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../../constants/url";

const Container = styled.div`
  display: flex;
  padding-left: 240px;
  min-height: 100vh;
  background-color: #f8fafc;
  font-family: "Inter", "Segoe UI", sans-serif;

  @media screen and (max-width: 768px) {
    padding-left: 0;
    flex-direction: column;
  }
`;

const Content = styled.div`
  flex: 1;
  padding: 30px;
  max-width: 900px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 25px;

  h1 {
    font-size: 24px;
    font-weight: 700;
    color: #1e293b;
    margin: 0 0 6px 0;
  }

  p {
    font-size: 14px;
    color: #64748b;
    margin: 0;
  }
`;

const Card = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 26px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
  border: 1px solid #e2e8f0;
  margin-bottom: 25px;
`;

const CardTitle = styled.h2`
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 18px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f1f5f9;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  .label {
    font-size: 12px;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .value {
    font-size: 14px;
    font-weight: 600;
    color: #1e293b;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;

  label {
    font-size: 13px;
    font-weight: 600;
    color: #475569;
  }

  input {
    padding: 10px 14px;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s;

    &:focus {
      border-color: #1abc9c;
      box-shadow: 0 0 0 3px rgba(26, 188, 156, 0.15);
    }
  }
`;

const SubmitBtn = styled.button`
  background: #1abc9c;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 22px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #16a085;
  }

  &:disabled {
    background: #cbd5e1;
    cursor: not-allowed;
  }
`;

const Badge = styled.span`
  display: inline-block;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: #e0f2fe;
  color: #0369a1;
  width: fit-content;
`;

const StudentProfile = () => {
  const [profile, setProfile] = useState({
    name: "Student",
    rollno: "",
    email: "",
    mobileno: "",
    gender: "male",
    batch: "Batch 2024",
    department: "Computer Science",
    semester: "Semester 1",
    section: "A",
    address: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [savingPassword, setSavingPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Immediately initialize with cookie/localStorage so details are never blank
    try {
      const cookieData = Cookies.get("studentData");
      if (cookieData) {
        const parsed = JSON.parse(cookieData);
        setProfile((prev) => ({
          ...prev,
          name: parsed.name || prev.name,
          rollno: parsed.rollno || prev.rollno,
          email: parsed.email || prev.email,
          mobileno: parsed.mobileno || prev.mobileno,
          batch: parsed.batch || prev.batch,
          department: parsed.department || prev.department,
          semester: parsed.semester || prev.semester,
          section: parsed.section || prev.section,
        }));
      }
    } catch (e) {
      console.error("Error reading studentData cookie:", e);
    }

    // 2. Fetch fresh profile from backend
    const fetchProfile = async () => {
      try {
        const token =
          Cookies.get("studentToken") ||
          localStorage.getItem("studentToken");

        const headers = {};
        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await axios.get(`${BACKEND_URL}api/v1/student/profile`, {
          headers,
          withCredentials: true,
        });

        if (res.data) {
          setProfile((prev) => ({
            ...prev,
            ...res.data,
          }));
        }
      } catch (err) {
        console.error("Error fetching student profile:", err);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (!passwordData.currentPassword) {
      toast.error("Please enter your current password.");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long.");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New password and confirm password do not match.");
      return;
    }

    setSavingPassword(true);
    try {
      const token =
        Cookies.get("studentToken") ||
        localStorage.getItem("studentToken");

      const headers = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await axios.post(
        `${BACKEND_URL}api/v1/student/change-password`,
        passwordData,
        {
          headers,
          withCredentials: true,
        }
      );

      if (res.data?.success) {
        toast.success(res.data.message || "Password updated successfully!");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        toast.error(res.data?.message || "Failed to update password.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error updating password.");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <Container>
      <Sidebar />
      <Content>
        <Header>
          <h1>Student Profile & Account Settings</h1>
          <p>View your enrolled academic profile and manage account security</p>
        </Header>

        {/* PROFILE INFORMATION CARD */}
        <Card>
          <CardTitle>🎓 Student Academic Profile</CardTitle>
          <InfoGrid>
            <InfoItem>
              <span className="label">Full Name</span>
              <span className="value">{profile.name || "Student"}</span>
            </InfoItem>

            <InfoItem>
              <span className="label">Roll Number</span>
              <span className="value">{profile.rollno || "—"}</span>
            </InfoItem>

            <InfoItem>
              <span className="label">Email Address</span>
              <span className="value">{profile.email || "—"}</span>
            </InfoItem>

            <InfoItem>
              <span className="label">Mobile Phone</span>
              <span className="value">{profile.mobileno || "—"}</span>
            </InfoItem>

            <InfoItem>
              <span className="label">Academic Batch</span>
              <span className="value">
                <Badge>{profile.batch || "Batch 2024"}</Badge>
              </span>
            </InfoItem>

            <InfoItem>
              <span className="label">Department</span>
              <span className="value">{profile.department || "Computer Science"}</span>
            </InfoItem>

            <InfoItem>
              <span className="label">Semester & Section</span>
              <span className="value">
                {profile.semester || "Semester 1"} • Section {profile.section || "A"}
              </span>
            </InfoItem>

            <InfoItem>
              <span className="label">Gender</span>
              <span className="value" style={{ textTransform: "capitalize" }}>
                {profile.gender || "—"}
              </span>
            </InfoItem>

            {profile.address && (
              <InfoItem style={{ gridColumn: "1 / -1" }}>
                <span className="label">Campus / Residential Address</span>
                <span className="value">{profile.address}</span>
              </InfoItem>
            )}
          </InfoGrid>
        </Card>

        {/* PASSWORD CHANGE CARD */}
        <Card>
          <CardTitle>🔒 Change Password</CardTitle>
          <p style={{ fontSize: "13px", color: "#64748b", margin: "-6px 0 16px 0" }}>
            To protect your account, enter your current password followed by your new password.
          </p>

          <form onSubmit={handlePasswordChange}>
            <FormGroup>
              <label>Current Password</label>
              <input
                type="password"
                placeholder="Enter your current password"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, currentPassword: e.target.value })
                }
                required
              />
            </FormGroup>

            <FormGroup>
              <label>New Password</label>
              <input
                type="password"
                placeholder="Enter new secure password (min. 6 characters)"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, newPassword: e.target.value })
                }
                required
              />
            </FormGroup>

            <FormGroup>
              <label>Re-enter New Password</label>
              <input
                type="password"
                placeholder="Re-enter new password to confirm"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                }
                required
              />
            </FormGroup>

            <SubmitBtn type="submit" disabled={savingPassword}>
              {savingPassword ? "Updating Password..." : "Update Password"}
            </SubmitBtn>
          </form>
        </Card>
      </Content>
      <ToastContainer position="top-right" autoClose={3000} />
    </Container>
  );
};

export default StudentProfile;

