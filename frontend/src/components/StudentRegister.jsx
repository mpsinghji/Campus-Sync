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
  max-width: 1000px;
  margin: 0 auto;
`;

const HeaderTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 20px;
`;

const TabBar = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 8px;
`;

const TabBtn = styled.button`
  background: ${(props) => (props.active ? "#1ABC9C" : "transparent")};
  color: ${(props) => (props.active ? "#ffffff" : "#64748b")};
  font-weight: 600;
  font-size: 15px;
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${(props) => (props.active ? "#16A085" : "#e2e8f0")};
  }
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
  select,
  textarea {
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
  display: inline-flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: #16a085;
  }

  &:disabled {
    background: #cbd5e1;
    cursor: not-allowed;
  }
`;

const CodeArea = styled.textarea`
  width: 100%;
  height: 260px;
  font-family: "Courier New", Courier, monospace;
  font-size: 13px;
  padding: 14px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  background-color: #f8fafc;
  color: #1e293b;
  box-sizing: border-box;
  resize: vertical;
  line-height: 1.5;
`;

const ActionRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 10px;
`;

const SecondaryBtn = styled.button`
  background: #f1f5f9;
  color: #334155;
  font-weight: 600;
  font-size: 13px;
  padding: 8px 14px;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: #e2e8f0;
  }
`;

const StatusBox = styled.div`
  padding: 12px 16px;
  border-radius: 8px;
  background: ${(props) => (props.valid ? "#ecfdf5" : "#fff1f2")};
  color: ${(props) => (props.valid ? "#065f46" : "#9f1239")};
  border: 1px solid ${(props) => (props.valid ? "#a7f3d0" : "#fecdd3")};
  font-size: 13px;
  margin-top: 10px;
  margin-bottom: 15px;
`;

export const ACADEMIC_PROGRAMS = {
  "B.Tech": {
    durationYears: 4,
    departments: {
      "Computer Science & Engineering (CSE)": [
        { name: "Artificial Intelligence & Machine Learning (AI & ML)", fee: 55000 },
        { name: "Data Science & Big Data Analytics", fee: 52000 },
        { name: "Cyber Security & Digital Forensics", fee: 50000 },
        { name: "Cloud Computing & DevOps", fee: 48000 },
        { name: "Core Computer Science & Engineering", fee: 45000 },
      ],
      "Mechanical Engineering (ME)": [
        { name: "Robotics & Industrial Automation", fee: 48000 },
        { name: "Electric Vehicles (EV) & Smart Mobility", fee: 46000 },
        { name: "Mechatronics & Embedded Systems", fee: 45000 },
        { name: "Core Mechanical Engineering", fee: 42000 },
      ],
      "Electronics & Communication (ECE)": [
        { name: "VLSI Design & Semiconductor Tech", fee: 50000 },
        { name: "IoT & Smart Sensor Networks", fee: 47000 },
        { name: "5G & Wireless Communications", fee: 46000 },
        { name: "Core Electronics & Communication", fee: 43000 },
      ],
      "Civil Engineering (CE)": [
        { name: "Structural Engineering & BIM Modeling", fee: 44000 },
        { name: "Smart City Infrastructure & GIS", fee: 42000 },
        { name: "Core Civil Engineering", fee: 40000 },
      ],
      "Electrical & Electronics Engineering (EEE)": [
        { name: "Renewable Energy & Smart Grids", fee: 46000 },
        { name: "EV Powertrain & Battery Management", fee: 47000 },
        { name: "Core Electrical Engineering", fee: 42000 },
      ],
    },
  },
  "M.Tech": {
    durationYears: 2,
    departments: {
      "Computer Science & Engineering (CSE)": [
        { name: "Advanced AI & Neural Computing", fee: 60000 },
        { name: "Cyber Security & Cryptography", fee: 58000 },
        { name: "Cloud & Distributed Computing", fee: 56000 },
      ],
      "Mechanical Engineering (ME)": [
        { name: "Advanced CAD/CAM & Thermal Systems", fee: 52000 },
        { name: "Robotics & CIM", fee: 54000 },
      ],
    },
  },
  "BCA": {
    durationYears: 3,
    departments: {
      "Computer Applications": [
        { name: "Full Stack Web & Mobile App Development", fee: 42000 },
        { name: "Cloud Infrastructure & Cyber Security", fee: 40000 },
        { name: "General Computer Applications", fee: 38000 },
      ],
    },
  },
  "MCA": {
    durationYears: 2,
    departments: {
      "Computer Applications": [
        { name: "Enterprise Software Architecture", fee: 50000 },
        { name: "AI & Big Data Analytics", fee: 52000 },
        { name: "Cloud & Security Engineering", fee: 48000 },
      ],
    },
  },
  "BBA": {
    durationYears: 3,
    departments: {
      "Management Studies": [
        { name: "Digital Marketing & E-Commerce", fee: 38000 },
        { name: "Banking & Financial Services", fee: 38000 },
        { name: "Human Resource Analytics", fee: 36000 },
        { name: "General Business Administration", fee: 35000 },
      ],
    },
  },
  "MBA": {
    durationYears: 2,
    departments: {
      "Management Studies": [
        { name: "FinTech & Investment Banking", fee: 60000 },
        { name: "Business Analytics & AI Management", fee: 58000 },
        { name: "Marketing Strategy & Brand Growth", fee: 55000 },
        { name: "Global Supply Chain & Operations", fee: 52000 },
      ],
    },
  },
  "B.Sc": {
    durationYears: 3,
    departments: {
      "Science & Information Technology": [
        { name: "Data Science & Applied Statistics", fee: 36000 },
        { name: "Applied Computer Science", fee: 34000 },
        { name: "Information Technology", fee: 32000 },
        { name: "Physics & Electronics", fee: 30000 },
        { name: "Biotechnology & Bioinformatics", fee: 35000 },
      ],
    },
  },
  "M.Sc": {
    durationYears: 2,
    departments: {
      "Science & Computing": [
        { name: "Data Science & Machine Intelligence", fee: 42000 },
        { name: "Applied Mathematics & Computing", fee: 38000 },
        { name: "Biotechnology & Genetic Engineering", fee: 40000 },
      ],
    },
  },
  "B.Com": {
    durationYears: 3,
    departments: {
      "Commerce & Finance": [
        { name: "Accounting & Taxation", fee: 30000 },
        { name: "Banking & Financial Services", fee: 32000 },
        { name: "International Business & Trade", fee: 34000 },
      ],
    },
  },
  "M.Com": {
    durationYears: 2,
    departments: {
      "Commerce & Finance": [
        { name: "Corporate Accounting & Finance", fee: 36000 },
        { name: "International Trade & Taxation", fee: 38000 },
      ],
    },
  },
  "BA": {
    durationYears: 3,
    departments: {
      "Humanities & Social Sciences": [
        { name: "Economics & Public Policy", fee: 28000 },
        { name: "Journalism & Mass Communication", fee: 32000 },
        { name: "English Literature & Linguistics", fee: 26000 },
        { name: "Political Science & International Relations", fee: 28000 },
      ],
    },
  },
  "MA": {
    durationYears: 2,
    departments: {
      "Humanities & Social Sciences": [
        { name: "Applied Economics", fee: 32000 },
        { name: "Mass Communication & Media Studies", fee: 36000 },
        { name: "Public Administration", fee: 30000 },
      ],
    },
  },
  "B.Pharm": {
    durationYears: 4,
    departments: {
      "Pharmacy & Pharmaceutical Sciences": [
        { name: "Pharmaceutical Chemistry & Analysis", fee: 48000 },
        { name: "Clinical Pharmacology", fee: 50000 },
        { name: "Pharmaceutics & Drug Delivery", fee: 48000 },
      ],
    },
  },
  "M.Pharm": {
    durationYears: 2,
    departments: {
      "Pharmacy & Pharmaceutical Sciences": [
        { name: "Advanced Pharmaceutics", fee: 55000 },
        { name: "Pharmacology & Toxicology", fee: 56000 },
      ],
    },
  },
  "B.Arch": {
    durationYears: 5,
    departments: {
      "Architecture & Urban Planning": [
        { name: "Sustainable Architecture & Green Design", fee: 52000 },
        { name: "Urban Design & Smart Cities", fee: 50000 },
        { name: "Interior & Spatial Architecture", fee: 48000 },
      ],
    },
  },
  "LLB": {
    durationYears: 3,
    departments: {
      "School of Law": [
        { name: "Corporate & Cyber Law", fee: 38000 },
        { name: "Constitutional & Criminal Jurisprudence", fee: 36000 },
      ],
    },
  },
  "BA LLB": {
    durationYears: 5,
    departments: {
      "School of Law": [
        { name: "Integrated Corporate & Commercial Law", fee: 45000 },
        { name: "Intellectual Property & International Law", fee: 46000 },
      ],
    },
  },
  "LLM": {
    durationYears: 1,
    departments: {
      "School of Law": [
        { name: "International Commercial Arbitration", fee: 50000 },
        { name: "Corporate Law & Governance", fee: 48000 },
      ],
    },
  },
  "B.Des": {
    durationYears: 4,
    departments: {
      "Design & Visual Arts": [
        { name: "User Experience (UI/UX) & Interaction Design", fee: 54000 },
        { name: "Industrial & Product Design", fee: 50000 },
        { name: "Fashion Communication & Styling", fee: 48000 },
      ],
    },
  },
  "Ph.D": {
    durationYears: 3,
    departments: {
      "Doctoral Research Studies": [
        { name: "Computer Science & Artificial Intelligence", fee: 35000 },
        { name: "Engineering & Applied Sciences", fee: 32000 },
        { name: "Management & Social Sciences", fee: 30000 },
      ],
    },
  },
};

const AcademicSummaryCard = styled.div`
  background: linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%);
  border: 1px solid #bbf7d0;
  border-radius: 10px;
  padding: 16px 20px;
  margin-top: 10px;
  margin-bottom: 20px;
  grid-column: 1 / -1;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    font-weight: 700;
    color: #0f766e;
    font-size: 14px;
  }

  .badge-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 12px;
  }

  .badge-item {
    background: white;
    padding: 10px 14px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 1px 3px rgba(0,0,0,0.03);

    .lbl {
      font-size: 11px;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .val {
      font-size: 15px;
      font-weight: 700;
      color: #0f172a;
      margin-top: 2px;
    }
    .sub {
      font-size: 11px;
      color: #10b981;
      font-weight: 600;
    }
  }
`;

const SAMPLE_JSON_TEMPLATE = [
  {
    name: "Aarav Sharma",
    email: "aarav.sharma@example.com",
    password: "studentpassword123",
    rollno: "CS2024-001",
    mobileno: "9876543210",
    degree: "B.Tech",
    department: "Computer Science & Engineering (CSE)",
    specialization: "Artificial Intelligence & Machine Learning (AI & ML)",
    durationYears: 4,
    feePerSemester: 55000,
    batch: "Batch 2024-2028",
    semester: "Semester 1",
    section: "A",
    gender: "male",
    dob: "2005-04-12",
    bloodGroup: "B+",
    guardianName: "Rajesh Sharma",
    guardianPhone: "9876543200",
    address: "Flat 402, Green Avenue",
    city: "New Delhi",
  },
  {
    name: "Diya Patel",
    email: "diya.patel@example.com",
    password: "studentpassword123",
    rollno: "CS2024-002",
    mobileno: "9876543211",
    degree: "B.Tech",
    department: "Computer Science & Engineering (CSE)",
    specialization: "Data Science & Big Data Analytics",
    durationYears: 4,
    feePerSemester: 52000,
    batch: "Batch 2024-2028",
    semester: "Semester 1",
    section: "A",
    gender: "female",
    dob: "2005-09-21",
    bloodGroup: "O+",
    guardianName: "Sanjay Patel",
    guardianPhone: "9876543201",
    address: "B-12 Sunrise Towers",
    city: "Ahmedabad",
  },
];

const StudentRegister = () => {
  const [activeTab, setActiveTab] = useState("single"); // "single" | "bulk"

  const currentYear = new Date().getFullYear();
  const initialDegree = "B.Tech";
  const initialDept = "Computer Science & Engineering (CSE)";
  const initialSpecObj = ACADEMIC_PROGRAMS[initialDegree].departments[initialDept][0];
  const initialDuration = ACADEMIC_PROGRAMS[initialDegree].durationYears;

  // Single Student Registration State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    rollno: "",
    mobileno: "",
    degree: initialDegree,
    department: initialDept,
    specialization: initialSpecObj.name,
    durationYears: initialDuration,
    feePerSemester: initialSpecObj.fee,
    batch: `Batch ${currentYear}-${currentYear + initialDuration}`,
    semester: "Semester 1",
    section: "A",
    gender: "male",
    dob: "",
    bloodGroup: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    guardianName: "",
    guardianPhone: "",
    admissionDate: new Date().toISOString().split("T")[0],
  });
  const [loading, setLoading] = useState(false);

  // Bulk Upload State
  const [jsonText, setJsonText] = useState(
    JSON.stringify(SAMPLE_JSON_TEMPLATE, null, 2)
  );
  const [bulkBatch, setBulkBatch] = useState("Batch 2024-2028");
  const [bulkLoading, setBulkLoading] = useState(false);

  // Validate JSON preview
  let parsedStudents = [];
  let jsonError = null;
  try {
    const parsed = JSON.parse(jsonText);
    if (Array.isArray(parsed)) {
      parsedStudents = parsed;
    } else {
      jsonError = "JSON must be an array of student objects ([{ ... }, { ... }]).";
    }
  } catch (err) {
    jsonError = `JSON Syntax Error: ${err.message}`;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "batch") {
      setFormData((prev) => ({
        ...prev,
        batch: value,
        semester: prev.semester || "Semester 1",
        section: prev.section || "A",
      }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDegreeChange = (newDegree) => {
    const prog = ACADEMIC_PROGRAMS[newDegree];
    if (!prog) return;
    const depts = Object.keys(prog.departments);
    const newDept = depts[0] || "";
    const specs = prog.departments[newDept] || [];
    const newSpec = specs[0] || { name: "", fee: 45000 };
    const dur = prog.durationYears;
    const newBatch = `Batch ${currentYear}-${currentYear + dur}`;

    setFormData((prev) => ({
      ...prev,
      degree: newDegree,
      department: newDept,
      specialization: newSpec.name,
      durationYears: dur,
      feePerSemester: newSpec.fee,
      batch: newBatch,
      semester: "Semester 1",
    }));
  };

  const handleDepartmentChange = (newDept) => {
    const prog = ACADEMIC_PROGRAMS[formData.degree];
    if (!prog) return;
    const specs = prog.departments[newDept] || [];
    const newSpec = specs[0] || { name: "", fee: 45000 };

    setFormData((prev) => ({
      ...prev,
      department: newDept,
      specialization: newSpec.name,
      feePerSemester: newSpec.fee,
    }));
  };

  const handleSpecializationChange = (newSpecName) => {
    const prog = ACADEMIC_PROGRAMS[formData.degree];
    if (!prog) return;
    const specs = prog.departments[formData.department] || [];
    const foundSpec = specs.find((s) => s.name === newSpecName);

    setFormData((prev) => ({
      ...prev,
      specialization: newSpecName,
      feePerSemester: foundSpec ? foundSpec.fee : prev.feePerSemester,
    }));
  };

  const handleSingleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}api/v1/student/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, role: "student" }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Registration failed.");
      } else {
        toast.success(`Student ${formData.name} registered successfully!`);
        setFormData({
          name: "",
          email: "",
          password: "",
          rollno: "",
          mobileno: "",
          degree: formData.degree,
          department: formData.department,
          specialization: formData.specialization,
          durationYears: formData.durationYears,
          feePerSemester: formData.feePerSemester,
          batch: formData.batch,
          semester: "Semester 1",
          section: formData.section,
          gender: "male",
          dob: "",
          bloodGroup: "",
          address: "",
          city: "",
          state: "",
          pincode: "",
          guardianName: "",
          guardianPhone: "",
          admissionDate: new Date().toISOString().split("T")[0],
        });
      }
    } catch (error) {
      toast.error("Network error during registration.");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUpload = async () => {
    if (jsonError || parsedStudents.length === 0) {
      toast.error("Please provide valid JSON containing student data.");
      return;
    }

    setBulkLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}api/v1/student/bulk-register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          students: parsedStudents,
          defaultBatch: bulkBatch,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Bulk registration failed.");
      } else {
        const info = data.data || {};
        toast.success(
          `Batch upload complete: ${info.registeredCount || parsedStudents.length} registered, ${info.skippedCount || 0} skipped.`
        );
      }
    } catch (error) {
      toast.error("Failed to upload student batch.");
    } finally {
      setBulkLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setJsonText(event.target.result);
      toast.info(`Loaded file: ${file.name}`);
    };
    reader.readAsText(file);
  };

  const handleDownloadSample = () => {
    const blob = new Blob([JSON.stringify(SAMPLE_JSON_TEMPLATE, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "students_batch_template.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentProgram = ACADEMIC_PROGRAMS[formData.degree] || ACADEMIC_PROGRAMS["B.Tech"];
  const availableDepartments = Object.keys(currentProgram.departments);
  const availableSpecializations = currentProgram.departments[formData.department] || [];
  const totalSemesters = (formData.durationYears || 4) * 2;
  const totalProgramTuition = (formData.feePerSemester || 45000) * totalSemesters;

  return (
    <Container>
      <Sidebar />
      <Content>
        <HeaderTitle>Student Registration Portal</HeaderTitle>

        <TabBar>
          <TabBtn
            active={activeTab === "single"}
            onClick={() => setActiveTab("single")}
          >
            👤 Individual Student Registration
          </TabBtn>
          <TabBtn
            active={activeTab === "bulk"}
            onClick={() => setActiveTab("bulk")}
          >
            📁 Bulk Batch Upload (JSON)
          </TabBtn>
        </TabBar>

        {/* TAB 1: INDIVIDUAL REGISTRATION */}
        {activeTab === "single" && (
          <FormCard>
            <form onSubmit={handleSingleRegister}>
              {/* Account & Basic */}
              <SectionHeader>🔑 Account & Contact Credentials</SectionHeader>
              <Grid>
                <FormGroup>
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="e.g. Aarav Sharma"
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
                    placeholder="student@example.com"
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
                  <label>Mobile Number *</label>
                  <input
                    type="tel"
                    name="mobileno"
                    placeholder="10-digit mobile number"
                    value={formData.mobileno}
                    onChange={handleInputChange}
                    required
                  />
                </FormGroup>
              </Grid>

              {/* Hierarchical Academic Structure */}
              <SectionHeader>🎓 Degree, Department & Specialization Architecture</SectionHeader>
              <Grid>
                {/* 1. DEGREE SELECTION */}
                <FormGroup>
                  <label>1. Degree Program *</label>
                  <select
                    name="degree"
                    value={formData.degree}
                    onChange={(e) => handleDegreeChange(e.target.value)}
                    required
                  >
                    {Object.keys(ACADEMIC_PROGRAMS).map((deg) => (
                      <option key={deg} value={deg}>
                        {deg} ({ACADEMIC_PROGRAMS[deg].durationYears} Years)
                      </option>
                    ))}
                  </select>
                </FormGroup>

                {/* 2. DEPARTMENT SELECTION */}
                <FormGroup>
                  <label>2. Department / Discipline *</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={(e) => handleDepartmentChange(e.target.value)}
                    required
                  >
                    {availableDepartments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </FormGroup>

                {/* 3. SPECIALIZATION SELECTION */}
                <FormGroup style={{ gridColumn: "span 2" }}>
                  <label>3. Specialization / Concentration *</label>
                  <select
                    name="specialization"
                    value={formData.specialization}
                    onChange={(e) => handleSpecializationChange(e.target.value)}
                    required
                  >
                    {availableSpecializations.map((spec) => (
                      <option key={spec.name} value={spec.name}>
                        {spec.name} — (Rate: ₹{spec.fee.toLocaleString()}/sem)
                      </option>
                    ))}
                  </select>
                </FormGroup>

                {/* Fee Rate & Calculated Duration */}
                <FormGroup>
                  <label>Term Fee Rate (₹ / Semester) *</label>
                  <input
                    type="number"
                    name="feePerSemester"
                    value={formData.feePerSemester}
                    onChange={handleInputChange}
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <label>Calculated Duration (Years)</label>
                  <input
                    type="number"
                    name="durationYears"
                    value={formData.durationYears}
                    onChange={handleInputChange}
                    min={1}
                    max={6}
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <label>Auto-Calculated Batch / Year *</label>
                  <input
                    type="text"
                    name="batch"
                    placeholder="e.g. Batch 2024-2028"
                    value={formData.batch}
                    onChange={handleInputChange}
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <label>Roll Number *</label>
                  <input
                    type="text"
                    name="rollno"
                    placeholder="e.g. CS2024-001"
                    value={formData.rollno}
                    onChange={handleInputChange}
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <label>Current Semester</label>
                  <select
                    name="semester"
                    value={formData.semester}
                    onChange={handleInputChange}
                  >
                    {Array.from({ length: totalSemesters }, (_, i) => `Semester ${i + 1}`).map(
                      (sem) => (
                        <option key={sem} value={sem}>
                          {sem}
                        </option>
                      )
                    )}
                  </select>
                </FormGroup>

                <FormGroup>
                  <label>Section</label>
                  <input
                    type="text"
                    name="section"
                    placeholder="e.g. A, B, C"
                    value={formData.section}
                    onChange={handleInputChange}
                  />
                </FormGroup>

                <FormGroup>
                  <label>Admission Date</label>
                  <input
                    type="date"
                    name="admissionDate"
                    value={formData.admissionDate}
                    onChange={handleInputChange}
                  />
                </FormGroup>

                {/* DYNAMIC ACADEMIC & FEE SUMMARY CARD */}
                <AcademicSummaryCard>
                  <div className="card-header">
                    <span>⚡ Calculated Academic Matrix & Fee Schedule</span>
                    <span>Status: Dynamic Rate Matched</span>
                  </div>
                  <div className="badge-grid">
                    <div className="badge-item">
                      <div className="lbl">Degree & Duration</div>
                      <div className="val">{formData.degree}</div>
                      <div className="sub">{formData.durationYears} Years ({totalSemesters} Semesters)</div>
                    </div>
                    <div className="badge-item">
                      <div className="lbl">Term Fee Rate</div>
                      <div className="val">₹{Number(formData.feePerSemester).toLocaleString()}</div>
                      <div className="sub">Per Semester Billing</div>
                    </div>
                    <div className="badge-item">
                      <div className="lbl">Total Program Tuition</div>
                      <div className="val" style={{ color: "#047857" }}>
                        ₹{totalProgramTuition.toLocaleString()}
                      </div>
                      <div className="sub">{totalSemesters} installments</div>
                    </div>
                    <div className="badge-item">
                      <div className="lbl">Batch Cohort</div>
                      <div className="val">{formData.batch}</div>
                      <div className="sub">Current: {formData.semester} ({formData.section})</div>
                    </div>
                  </div>
                </AcademicSummaryCard>
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
                    placeholder="e.g. O+, A+, B+"
                    value={formData.bloodGroup}
                    onChange={handleInputChange}
                  />
                </FormGroup>
                <FormGroup>
                  <label>City</label>
                  <input
                    type="text"
                    name="city"
                    placeholder="e.g. New Delhi"
                    value={formData.city}
                    onChange={handleInputChange}
                  />
                </FormGroup>
                <FormGroup>
                  <label>State</label>
                  <input
                    type="text"
                    name="state"
                    placeholder="e.g. Delhi, Punjab"
                    value={formData.state}
                    onChange={handleInputChange}
                  />
                </FormGroup>
                <FormGroup>
                  <label>Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    placeholder="e.g. 110001"
                    value={formData.pincode}
                    onChange={handleInputChange}
                  />
                </FormGroup>
              </Grid>

              {/* Guardian Info */}
              <SectionHeader>👨‍👩‍👦 Parent / Guardian Information</SectionHeader>
              <Grid>
                <FormGroup>
                  <label>Guardian Name</label>
                  <input
                    type="text"
                    name="guardianName"
                    placeholder="Father's or Mother's Name"
                    value={formData.guardianName}
                    onChange={handleInputChange}
                  />
                </FormGroup>
                <FormGroup>
                  <label>Guardian Contact Phone</label>
                  <input
                    type="tel"
                    name="guardianPhone"
                    placeholder="Guardian mobile number"
                    value={formData.guardianPhone}
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
                {loading ? "Registering Student..." : "✓ Register Student"}
              </SubmitBtn>
            </form>
          </FormCard>
        )}

        {/* TAB 2: BULK BATCH UPLOAD (JSON) */}
        {activeTab === "bulk" && (
          <FormCard>
            <ActionRow>
              <div>
                <h3 style={{ margin: "0 0 4px 0", color: "#1e293b" }}>
                  Upload Entire Batch via JSON
                </h3>
                <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
                  Paste a JSON array of students or upload a .json file directly.
                </p>
              </div>

              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <SecondaryBtn onClick={handleDownloadSample}>
                  📥 Download Template
                </SecondaryBtn>
                <label>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    style={{ display: "none" }}
                  />
                  <SecondaryBtn as="span">📁 Upload .JSON File</SecondaryBtn>
                </label>
              </div>
            </ActionRow>

            <Grid style={{ marginTop: "15px", marginBottom: "15px" }}>
              <FormGroup>
                <label>Default Batch for this Upload:</label>
                <input
                  type="text"
                  placeholder="e.g. Batch 2024-2028"
                  value={bulkBatch}
                  onChange={(e) => setBulkBatch(e.target.value)}
                />
              </FormGroup>
            </Grid>

            <FormGroup>
              <label>JSON Data:</label>
              <CodeArea
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                placeholder="Paste JSON array here..."
              />
            </FormGroup>

            {jsonError ? (
              <StatusBox valid={false}>❌ {jsonError}</StatusBox>
            ) : (
              <StatusBox valid={true}>
                ✅ Valid JSON! Detected <strong>{parsedStudents.length}</strong> student records ready to upload.
              </StatusBox>
            )}

            <SubmitBtn
              onClick={handleBulkUpload}
              disabled={bulkLoading || !!jsonError || parsedStudents.length === 0}
            >
              {bulkLoading
                ? "Uploading Batch..."
                : `🚀 Upload ${parsedStudents.length} Students to System`}
            </SubmitBtn>
          </FormCard>
        )}
      </Content>
      <ToastContainer />
    </Container>
  );
};

export default StudentRegister;
