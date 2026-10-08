import React, { useState, useEffect } from "react";
import AdminSidebar from "./Sidebar";
import axios from "axios";
import styled from "styled-components";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
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
  background: ${(props) => (props.$isSuper ? "#fef3c7" : "#e0f2fe")};
  color: ${(props) => (props.$isSuper ? "#92400e" : "#0369a1")};
  width: fit-content;
`;

const AdminSettingProfile = () => {
  const [profile, setProfile] = useState({
    name: "Administrator",
    email: "",
    phone: "",
    designation: "Administrator",
    department: "Administration",
    officeRoom: "",
    address: "",
    isSuperAdmin: false,
    createdAt: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [savingPassword, setSavingPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Immediately initialize with cookie data so email and info are never blank
    try {
      const cookieData = Cookies.get("adminData");
      if (cookieData) {
        const parsed = JSON.parse(cookieData);
        setProfile((prev) => ({
          ...prev,
          name: parsed.name || prev.name,
          email: parsed.email || prev.email,
          phone: parsed.phone || prev.phone,
          designation: parsed.designation || prev.designation,
          department: parsed.department || prev.department,
          isSuperAdmin: parsed.isSuperAdmin || parsed.email === "admin@campus-sync.com",
        }));
      }
    } catch (e) {
      console.error("Error reading adminData cookie:", e);
    }

    // 2. Fetch fresh profile from backend with safe token
    const fetchProfile = async () => {
      try {
        const token =
          Cookies.get("adminToken") ||
          localStorage.getItem("adminToken");

        const headers = {};
        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await axios.get(`${BACKEND_URL}api/v1/admin/profile`, {
          headers,
          withCredentials: true,
        });

        if (res.data) {
          setProfile((prev) => ({
            ...prev,
            ...res.data,
            isSuperAdmin: res.data.isSuperAdmin || res.data.email === "admin@campus-sync.com",
          }));
        }
      } catch (err) {
        console.error("Error fetching fresh profile:", err);
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
        Cookies.get("adminToken") ||
        localStorage.getItem("adminToken");

      const headers = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await axios.post(
        `${BACKEND_URL}api/v1/admin/change-password`,
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
      <AdminSidebar />
      <Content>
        <Header>
          <h1>Administrator Profile & Settings</h1>
          <p>View your official institutional credentials and manage your account security</p>
        </Header>

        {/* PROFILE INFORMATION CARD */}
        <Card>
          <CardTitle>👤 Official Profile Details</CardTitle>
          <InfoGrid>
            <InfoItem>
              <span className="label">Full Name</span>
              <span className="value">{profile.name || "Administrator"}</span>
            </InfoItem>

            <InfoItem>
              <span className="label">Institutional Email</span>
              <span className="value">{profile.email || "admin@campus-sync.com"}</span>
            </InfoItem>

            <InfoItem>
              <span className="label">Designation / Role Title</span>
              <span className="value">{profile.designation || "Administrator"}</span>
            </InfoItem>

            <InfoItem>
              <span className="label">Department / Office</span>
              <span className="value">{profile.department || "Administration"}</span>
            </InfoItem>

            <InfoItem>
              <span className="label">Contact Phone</span>
              <span className="value">{profile.phone || "Not specified"}</span>
            </InfoItem>

            <InfoItem>
              <span className="label">Office / Room Location</span>
              <span className="value">{profile.officeRoom || "Main Admin Wing"}</span>
            </InfoItem>

            <InfoItem>
              <span className="label">Campus Location</span>
              <span className="value">{profile.address || "Main Administrative Building"}</span>
            </InfoItem>

            <InfoItem>
              <span className="label">Hierarchy Privilege</span>
              <Badge $isSuper={profile.isSuperAdmin}>
                {profile.isSuperAdmin ? "👑 Master Super Admin" : "🏛️ Institutional Administrator"}
              </Badge>
            </InfoItem>
          </InfoGrid>
        </Card>

        {/* CHANGE PASSWORD CARD */}
        <Card>
          <CardTitle>🔒 Change Password & Security</CardTitle>
          <p style={{ fontSize: "13px", color: "#64748b", marginTop: "-8px", marginBottom: "16px" }}>
            To update your login credentials, please provide your current password followed by your new password.
          </p>

          <form onSubmit={handlePasswordChange} style={{ maxWidth: "450px" }}>
            <FormGroup>
              <label>Current Password *</label>
              <input
                type="password"
                placeholder="Enter existing password"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData((p) => ({ ...p, currentPassword: e.target.value }))
                }
                required
              />
            </FormGroup>

            <FormGroup>
              <label>New Password * (Min 6 characters)</label>
              <input
                type="password"
                placeholder="Enter new strong password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData((p) => ({ ...p, newPassword: e.target.value }))
                }
                required
              />
            </FormGroup>

            <FormGroup>
              <label>Re-enter New Password *</label>
              <input
                type="password"
                placeholder="Confirm new password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData((p) => ({ ...p, confirmPassword: e.target.value }))
                }
                required
              />
            </FormGroup>

            <SubmitBtn type="submit" disabled={savingPassword}>
              {savingPassword ? "Updating..." : "✓ Update Password"}
            </SubmitBtn>
          </form>
        </Card>
      </Content>
      <ToastContainer />
    </Container>
  );
};

export default AdminSettingProfile;
