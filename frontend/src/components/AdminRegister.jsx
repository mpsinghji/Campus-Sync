import { useState } from "react";
import AdminSidebar from "../pages/Admin/Sidebar";
import styled from "styled-components";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BACKEND_URL } from "../constants/url";
import Cookies from "js-cookie";

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
  max-width: 860px;
  margin: 0 auto;
`;

const HeaderTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: #64748b;
  margin-bottom: 20px;
`;

const FormCard = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 28px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
`;

const SectionHeader = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: #1e293b;
  margin-top: 15px;
  margin-bottom: 12px;
  padding-bottom: 6px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-size: 13px;
    font-weight: 600;
    color: #475569;
  }

  input,
  select {
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
  font-size: 15px;
  font-weight: 600;
  padding: 12px 28px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 20px;

  &:hover {
    background: #16a085;
  }

  &:disabled {
    background: #cbd5e1;
    cursor: not-allowed;
  }
`;

const AdminRegister = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    designation: "Administrator",
    department: "Administration",
    officeRoom: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);

  // Check current logged-in user hierarchy
  const adminEmail = (() => {
    try {
      const cookie = Cookies.get("adminData");
      if (cookie) {
        const parsed = JSON.parse(cookie);
        return parsed.email || "";
      }
    } catch {
      return "";
    }
    return "";
  })();

  const isSuperAdmin = adminEmail.toLowerCase().trim() === "admin@campus-sync.com";

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Hierarchy lock: Non-superadmin cannot select "Super Admin" designation
    if (name === "designation" && value === "Super Admin" && !isSuperAdmin) {
      toast.warning("Hierarchy Lock: Only Master Super Admin can assign Super Admin privilege.");
      return;
    }

    if (name === "designation") {
      let dept = formData.department;
      let room = formData.officeRoom;
      let addr = formData.address;

      if (value === "Accounts / Finance Officer") {
        dept = "Finance & Accounts Department";
        room = "Finance Wing Room 105";
        addr = "Administrative Building, Ground Floor";
      } else if (value === "Academic Registrar") {
        dept = "Office of Academic Registrar";
        room = "Academic Block Admin-101";
        addr = "Main Administrative Complex";
      } else if (value === "Dean of Academics") {
        dept = "Academic & Faculty Affairs";
        room = "Senate Building Room 205";
        addr = "Senate Complex";
      } else if (value === "Examination Controller") {
        dept = "Controller of Examinations Cell";
        room = "Exam Wing Block-B";
        addr = "Central Examination Building";
      } else if (value === "Student Affairs Coordinator") {
        dept = "Student Affairs & Campus Life";
        room = "Student Centre 104";
        addr = "Student Activities Complex";
      } else if (value === "Administrator") {
        dept = "Central Administration";
        room = "Admin Block Room 204";
        addr = "Main Administrative Building";
      } else if (value === "Super Admin") {
        dept = "Root Executive Administration";
        room = "Master Suite Room 1";
        addr = "Central Campus Headquarters";
      }

      setFormData((prev) => ({
        ...prev,
        designation: value,
        department: dept,
        officeRoom: room,
        address: addr,
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (event) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Please enter admin full name.");
      return;
    }

    if (!formData.email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    // Hierarchy lock check on frontend
    if (formData.designation === "Super Admin" && !isSuperAdmin) {
      toast.error("Forbidden: You do not have permissions to register Super Admin accounts.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}api/v1/admin/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-email": adminEmail,
        },
        body: JSON.stringify({
          ...formData,
          role: "admin",
          adminRequesterEmail: adminEmail,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result?.message || "An error occurred during registration.");
        return;
      }

      toast.success(result?.message || "Admin successfully registered!");
      setFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
        designation: "Administrator",
        department: "Administration",
        officeRoom: "",
        address: "",
      });
    } catch (error) {
      toast.error("An unexpected error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <AdminSidebar />
      <Content>
        <HeaderTitle>Register Administrator Account</HeaderTitle>
        <Subtitle>Provision administrator accounts with departmental designations and access controls</Subtitle>

        <FormCard>
          <form onSubmit={handleRegister}>
            {/* Account Credentials */}
            <SectionHeader>🔑 Account Credentials</SectionHeader>
            <Grid>
              <FormGroup>
                <label>Admin Full Name *</label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Dr. Rajesh Sharma"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>
              <FormGroup>
                <label>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  placeholder="admin@institution.edu"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>
              <FormGroup>
                <label>Password *</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>
              <FormGroup>
                <label>Official Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="e.g. 9876543210"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>
            </Grid>

            {/* Administrative Role */}
            <SectionHeader>🏛️ Administrative Designation & Office</SectionHeader>
            <Grid>
              <FormGroup>
                <label>Designation / Role Title</label>
                <select
                  name="designation"
                  value={formData.designation}
                  onChange={handleInputChange}
                >
                  <option value="Administrator">Administrator</option>
                  <option value="Accounts / Finance Officer">Accounts / Finance Officer</option>
                  {isSuperAdmin && (
                    <option value="Super Admin">👑 Super Admin (Master Privilege)</option>
                  )}
                  <option value="Academic Registrar">Academic Registrar</option>
                  <option value="Dean of Academics">Dean of Academics</option>
                  <option value="Examination Controller">Examination Controller</option>
                  <option value="Student Affairs Coordinator">Student Affairs Coordinator</option>
                </select>
              </FormGroup>
              <FormGroup>
                <label>Department / Office</label>
                <input
                  type="text"
                  name="department"
                  placeholder="e.g. Central Administration, Academic Affairs"
                  value={formData.department}
                  onChange={handleInputChange}
                />
              </FormGroup>
              <FormGroup>
                <label>Office / Room Number</label>
                <input
                  type="text"
                  name="officeRoom"
                  placeholder="e.g. Admin Block Room 204"
                  value={formData.officeRoom}
                  onChange={handleInputChange}
                />
              </FormGroup>
              <FormGroup>
                <label>Official Address / Campus Location</label>
                <input
                  type="text"
                  name="address"
                  placeholder="e.g. Main Administrative Building, Campus 1"
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </FormGroup>
            </Grid>

            <SubmitBtn type="submit" disabled={loading}>
              {loading ? "Registering Admin..." : "✓ Register Administrator"}
            </SubmitBtn>
          </form>
        </FormCard>
      </Content>
      <ToastContainer />
    </Container>
  );
};

export default AdminRegister;
