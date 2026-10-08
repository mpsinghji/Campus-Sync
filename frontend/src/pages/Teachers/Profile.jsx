import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import axios from "axios";
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
  background: #ede9fe;
  color: #6d28d9;
  width: fit-content;
`;

const TeacherProfile = () => {
  const [profile, setProfile] = useState({
    name: "Faculty Member",
    email: "",
    phone: "",
    responsibility: "Teacher",
    department: "Academics",
    officeRoom: "",
    qualification: "",
    experience: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [savingPassword, setSavingPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Immediately initialize with cookie data so details are never blank
    try {
      const cookieData = Cookies.get("teacherData");
      if (cookieData) {
        const parsed = JSON.parse(cookieData);
        setProfile((prev) => ({
          ...prev,
          name: parsed.name || prev.name,
          email: parsed.email || prev.email,
          phone: parsed.phone || prev.phone,
          responsibility: parsed.responsibility || prev.responsibility,
          department: parsed.department || prev.department,
          officeRoom: parsed.officeRoom || prev.officeRoom,
          qualification: parsed.qualification || prev.qualification,
          experience: parsed.experience || prev.experience,
        }));
      }
    } catch (e) {
      console.error("Error reading teacherData cookie:", e);
    }

    // 2. Fetch fresh profile from backend
    const fetchProfile = async () => {
      try {
        const token =
          Cookies.get("teacherToken") ||
          localStorage.getItem("teacherToken");

        const headers = {};
        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await axios.get(`${BACKEND_URL}api/v1/teacher/profile`, {
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
        console.error("Error fetching teacher profile:", err);
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
        Cookies.get("teacherToken") ||
        localStorage.getItem("teacherToken");

      const headers = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await axios.post(
        `${BACKEND_URL}api/v1/teacher/change-password`,
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
          <h1>Faculty Profile & Account Settings</h1>
          <p>View your assigned institutional responsibilities and manage password security</p>
        </Header>

        {/* PROFILE INFORMATION CARD */}
        <Card>
          <CardTitle>👨‍🏫 Faculty Official Profile</CardTitle>
          <InfoGrid>
            <InfoItem>
              <span className="label">Full Name</span>
              <span className="value">{profile.name || "Faculty Member"}</span>
            </InfoItem>

            <InfoItem>
              <span className="label">Institutional Email</span>
              <span className="value">{profile.email || "—"}</span>
            </InfoItem>

            <InfoItem>
              <span className="label">Contact Phone</span>
              <span className="value">{profile.phone || "—"}</span>
            </InfoItem>

            <InfoItem>
              <span className="label">Designation / Responsibility</span>
              <span className="value">
                <Badge>{profile.responsibility || "Teacher"}</Badge>
              </span>
            </InfoItem>

            <InfoItem>
              <span className="label">Academic Department</span>
              <span className="value">{profile.department || "Academics"}</span>
            </InfoItem>

            <InfoItem>
              <span className="label">Office Room</span>
              <span className="value">{profile.officeRoom || "Faculty Block"}</span>
            </InfoItem>

            {profile.qualification && (
              <InfoItem>
                <span className="label">Highest Qualification</span>
                <span className="value">{profile.qualification}</span>
              </InfoItem>
            )}

            {profile.experience && (
              <InfoItem>
                <span className="label">Experience</span>
                <span className="value">{profile.experience}</span>
              </InfoItem>
            )}
          </InfoGrid>
        </Card>

        {/* PASSWORD CHANGE CARD */}
        <Card>
          <CardTitle>🔒 Change Password</CardTitle>
          <p style={{ fontSize: "13px", color: "#64748b", margin: "-6px 0 16px 0" }}>
            To update your security credentials, enter your current password followed by your new password.
          </p>

          <form onSubmit={handlePasswordChange}>
            <FormGroup>
              <label>Current Password</label>
              <input
                type="password"
                placeholder="Enter current password"
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
                placeholder="Enter new password (min. 6 characters)"
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

export default TeacherProfile;
