import { useState } from "react";
import Sidebar from "../pages/Admin/Sidebar";
import styled from "styled-components";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BACKEND_URL } from "../constants/url";

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

const HeaderTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
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
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
  margin-top: 15px;
  margin-bottom: 12px;
  padding-bottom: 6px;
  border-bottom: 1px solid #f1f5f9;
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

const TeacherRegister = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    employeeId: "",
    designation: "Assistant Professor",
    responsibility: "Teacher",
    department: "Computer Science",
    subject: "",
    qualification: "M.Tech / Ph.D",
    experience: "3 Years",
    gender: "male",
    dob: "",
    joiningDate: new Date().toISOString().split("T")[0],
    bloodGroup: "",
    address: "",
    city: "",
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "responsibility") {
      let desig = formData.designation;
      let dept = formData.department;
      let subj = formData.subject;
      let qual = formData.qualification;
      let exp = formData.experience;

      if (value === "Librarian") {
        desig = "Head Librarian";
        dept = "Library & Information Resources";
        subj = "Library Science & Cataloging";
        qual = "M.Lib.I.Sc";
        exp = "4 Years";
      } else if (value === "Exam Controller") {
        desig = "Examination Controller";
        dept = "Examination & Evaluation Cell";
        subj = "Examination Operations";
        qual = "Ph.D / Professor";
        exp = "8 Years";
      } else if (value === "Event Coordinator") {
        desig = "Events Coordinator";
        dept = "Student Welfare & Affairs";
        subj = "Campus Events Management";
        qual = "Master Degree";
        exp = "3 Years";
      } else if (value === "Student Registrar") {
        desig = "Admissions Registrar";
        dept = "Academic Registrar Office";
        subj = "Admissions & Student Records";
        qual = "Master Degree";
        exp = "5 Years";
      } else if (value === "Accounts / Finance Officer") {
        desig = "Finance & Accounts Officer";
        dept = "Accounts & Financial Services";
        subj = "Fee Management & Campus Accounts";
        qual = "M.Com / MBA Finance";
        exp = "5 Years";
      } else if (value === "Teacher") {
        desig = "Assistant Professor";
        dept = "Computer Science";
        subj = "Computer Science & Engineering";
        qual = "M.Tech / Ph.D";
        exp = "3 Years";
      }

      setFormData((prev) => ({
        ...prev,
        responsibility: value,
        designation: desig,
        department: dept,
        subject: subj,
        qualification: qual,
        experience: exp,
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Please enter teacher's full name.");
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

    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}api/v1/teacher/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, role: "teacher" }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.message || "Registration failed.");
      } else {
        toast.success(`Faculty member ${formData.name} successfully registered!`);
        setFormData({
          name: "",
          email: "",
          password: "",
          phone: "",
          employeeId: "",
          designation: "Assistant Professor",
          department: "Computer Science",
          subject: "",
          qualification: "M.Tech / Ph.D",
          experience: "",
          gender: "male",
          dob: "",
          joiningDate: new Date().toISOString().split("T")[0],
          bloodGroup: "",
          address: "",
          city: "",
        });
      }
    } catch (error) {
      toast.error("An error occurred during faculty registration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Sidebar />
      <Content>
        <HeaderTitle>Faculty & Teacher Registration</HeaderTitle>
        <FormCard>
          <form onSubmit={handleRegister}>
            {/* Account & Contact */}
            <SectionHeader>🔑 Account & Contact Information</SectionHeader>
            <Grid>
              <FormGroup>
                <label>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Dr. Priya Verma"
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
                  placeholder="teacher@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>
              <FormGroup>
                <label>Login Password *</label>
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
                <label>Phone / Mobile *</label>
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

            {/* Employment Details */}
            <SectionHeader>🏛️ Academic & Employment Information</SectionHeader>
            <Grid>
              <FormGroup>
                <label>Employee ID / Faculty ID</label>
                <input
                  type="text"
                  name="employeeId"
                  placeholder="e.g. FAC-2024-042"
                  value={formData.employeeId}
                  onChange={handleInputChange}
                />
              </FormGroup>
              <FormGroup>
                <label>Designation</label>
                <select
                  name="designation"
                  value={formData.designation}
                  onChange={handleInputChange}
                >
                  <option value="Assistant Professor">Assistant Professor</option>
                  <option value="Associate Professor">Associate Professor</option>
                  <option value="Professor">Professor</option>
                  <option value="Head of Department (HOD)">Head of Department (HOD)</option>
                  <option value="Lecturer">Lecturer</option>
                  <option value="Adjunct Faculty">Adjunct Faculty</option>
                  <option value="Head Librarian">Head Librarian</option>
                  <option value="Examination Controller">Examination Controller</option>
                  <option value="Events Coordinator">Events Coordinator</option>
                  <option value="Admissions Registrar">Admissions Registrar</option>
                  <option value="Finance & Accounts Officer">Finance & Accounts Officer</option>
                </select>
              </FormGroup>
              <FormGroup>
                <label>Staff Responsibility Category *</label>
                <select
                  name="responsibility"
                  value={formData.responsibility}
                  onChange={handleInputChange}
                >
                  <option value="Teacher">Standard Faculty / Teacher</option>
                  <option value="Librarian">Librarian In-Charge</option>
                  <option value="Exam Controller">Examination In-Charge</option>
                  <option value="Event Coordinator">Event & Activity Coordinator</option>
                  <option value="Student Registrar">Student Registrar / Admissions</option>
                  <option value="Accounts / Finance Officer">Accounts & Finance Officer</option>
                </select>
              </FormGroup>
              <FormGroup>
                <label>Department</label>
                <input
                  type="text"
                  name="department"
                  placeholder="e.g. Computer Science & Engineering"
                  value={formData.department}
                  onChange={handleInputChange}
                />
              </FormGroup>
              <FormGroup>
                <label>Primary Subjects / Courses Taught</label>
                <input
                  type="text"
                  name="subject"
                  placeholder="e.g. Data Structures, Database Systems"
                  value={formData.subject}
                  onChange={handleInputChange}
                />
              </FormGroup>
              <FormGroup>
                <label>Highest Qualification</label>
                <input
                  type="text"
                  name="qualification"
                  placeholder="e.g. Ph.D in Computer Science, M.Tech"
                  value={formData.qualification}
                  onChange={handleInputChange}
                />
              </FormGroup>
              <FormGroup>
                <label>Teaching Experience</label>
                <input
                  type="text"
                  name="experience"
                  placeholder="e.g. 5 Years"
                  value={formData.experience}
                  onChange={handleInputChange}
                />
              </FormGroup>
              <FormGroup>
                <label>Joining Date</label>
                <input
                  type="date"
                  name="joiningDate"
                  value={formData.joiningDate}
                  onChange={handleInputChange}
                />
              </FormGroup>
            </Grid>

            {/* Personal Details */}
            <SectionHeader>👤 Personal Profile</SectionHeader>
            <Grid>
              <FormGroup>
                <label>Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </FormGroup>
              <FormGroup>
                <label>Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleInputChange}
                />
              </FormGroup>
              <FormGroup>
                <label>Blood Group</label>
                <input
                  type="text"
                  name="bloodGroup"
                  placeholder="e.g. B+, O+"
                  value={formData.bloodGroup}
                  onChange={handleInputChange}
                />
              </FormGroup>
              <FormGroup>
                <label>City</label>
                <input
                  type="text"
                  name="city"
                  placeholder="e.g. Mumbai, Chandigarh"
                  value={formData.city}
                  onChange={handleInputChange}
                />
              </FormGroup>
              <FormGroup style={{ gridColumn: "span 2" }}>
                <label>Residential Address</label>
                <input
                  type="text"
                  name="address"
                  placeholder="Full street address"
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </FormGroup>
            </Grid>

            <SubmitBtn type="submit" disabled={loading}>
              {loading ? "Registering Faculty..." : "✓ Register Faculty Member"}
            </SubmitBtn>
          </form>
        </FormCard>
      </Content>
      <ToastContainer />
    </Container>
  );
};

export default TeacherRegister;
