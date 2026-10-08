import React, { useState, useEffect, useMemo } from "react";
import AdminSidebar from "./Sidebar";
import styled from "styled-components";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;

  .title-group {
    h1 {
      font-size: 26px;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 6px 0;
      letter-spacing: -0.5px;
    }
    p {
      font-size: 14px;
      color: #64748b;
      margin: 0;
    }
  }

  .action-buttons {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }
`;

const PrimaryButton = styled.button`
  background: #0f766e;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  box-shadow: 0 2px 6px rgba(15, 118, 110, 0.25);

  &:hover {
    background: #0d655e;
    transform: translateY(-1px);
  }
`;

const SecondaryButton = styled.button`
  background: white;
  color: #334155;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;

  &:hover {
    background: #f1f5f9;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  background: white;
  padding: 18px 20px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
  display: flex;
  align-items: center;
  gap: 16px;

  .icon-wrap {
    width: 48px;
    height: 48px;
    border-radius: 10px;
    background: ${(props) => props.$bg || "#f0fdf4"};
    color: ${(props) => props.$color || "#0f766e"};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
  }

  .info {
    .label {
      font-size: 12px;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .value {
      font-size: 22px;
      font-weight: 800;
      color: #0f172a;
      margin-top: 2px;
    }
  }
`;

const FilterCard = styled.div`
  background: white;
  padding: 18px 20px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
  margin-bottom: 24px;
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  align-items: center;
`;

const FilterItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;

  label {
    font-size: 11px;
    font-weight: 700;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  select,
  input {
    padding: 8px 12px;
    border-radius: 8px;
    border: 1px solid #cbd5e1;
    font-size: 13px;
    outline: none;
    background: white;
    min-width: 150px;
    transition: all 0.2s;

    &:focus {
      border-color: #0f766e;
      box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.12);
    }
  }
`;

const ViewToggle = styled.div`
  display: flex;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 8px;
  margin-left: auto;

  button {
    background: ${(props) => (props.$active ? "white" : "transparent")};
    color: ${(props) => (props.$active ? "#0f766e" : "#64748b")};
    border: none;
    padding: 6px 14px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    box-shadow: ${(props) => (props.$active ? "0 1px 3px rgba(0,0,0,0.08)" : "none")};
    transition: all 0.2s;
  }
`;

// TIMETABLE MATRIX TABLE STYLES
const TableWrapper = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow-x: auto;
  margin-bottom: 30px;
`;

const MatrixTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 1100px;
  text-align: left;

  th {
    background: #f8fafc;
    color: #334155;
    font-size: 12px;
    font-weight: 700;
    padding: 14px 12px;
    border-bottom: 2px solid #e2e8f0;
    border-right: 1px solid #f1f5f9;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    white-space: nowrap;
  }

  td {
    padding: 10px;
    border-bottom: 1px solid #f1f5f9;
    border-right: 1px solid #f1f5f9;
    vertical-align: top;
    height: 110px;
  }

  td.day-header {
    background: #f8fafc;
    font-weight: 800;
    color: #0f172a;
    width: 110px;
    font-size: 13px;
    vertical-align: middle;
    text-align: center;
    border-right: 2px solid #e2e8f0;
  }
`;

const SlotPill = styled.div`
  background: ${(props) => {
    if (props.$type === "Practical Lab") return "#eff6ff";
    if (props.$type === "Tutorial") return "#fef3c7";
    if (props.$type === "Seminar") return "#fdf2f8";
    return "#f0fdf4";
  }};
  border-left: 4px solid
    ${(props) => {
      if (props.$type === "Practical Lab") return "#3b82f6";
      if (props.$type === "Tutorial") return "#f59e0b";
      if (props.$type === "Seminar") return "#ec4899";
      return "#0f766e";
    }};
  border-radius: 6px;
  padding: 8px 10px;
  margin-bottom: 6px;
  position: relative;
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);

    .delete-btn {
      opacity: 1;
    }
  }

  .course-title {
    font-size: 12px;
    font-weight: 700;
    color: #0f172a;
    line-height: 1.3;
    margin-bottom: 4px;
  }

  .meta-row {
    font-size: 11px;
    color: #475569;
    display: flex;
    justify-content: space-between;
    gap: 4px;
    margin-bottom: 3px;
  }

  .tag-row {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
    margin-top: 4px;

    span {
      font-size: 10px;
      font-weight: 700;
      padding: 1px 6px;
      border-radius: 4px;
      background: white;
      border: 1px solid rgba(0, 0, 0, 0.08);
      color: #334155;
    }
  }

  .delete-btn {
    position: absolute;
    top: 4px;
    right: 4px;
    background: #fee2e2;
    color: #b91c1c;
    border: none;
    border-radius: 4px;
    width: 20px;
    height: 20px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    opacity: 0;
    transition: opacity 0.2s;

    &:hover {
      background: #ef4444;
      color: white;
    }
  }
`;

// CARDS VIEW
const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
`;

const ClassCard = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  padding: 18px 20px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
  position: relative;
  border-left: 5px solid ${(props) => (props.$type === "Practical Lab" ? "#3b82f6" : "#0f766e")};

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 10px;

    .day-badge {
      font-size: 11px;
      font-weight: 800;
      background: #0f172a;
      color: white;
      padding: 2px 8px;
      border-radius: 4px;
      text-transform: uppercase;
    }

    .time-badge {
      font-size: 12px;
      font-weight: 700;
      color: #0f766e;
    }
  }

  .subject {
    font-size: 16px;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 8px;
  }

  .details {
    font-size: 13px;
    color: #475569;
    margin-bottom: 12px;
    line-height: 1.5;

    div {
      margin-bottom: 3px;
    }
  }

  .footer-tags {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 12px;
    border-top: 1px solid #f1f5f9;

    .badges {
      display: flex;
      gap: 6px;
      span {
        font-size: 11px;
        font-weight: 700;
        padding: 2px 8px;
        border-radius: 12px;
        background: #f1f5f9;
        color: #334155;
      }
    }

    button {
      background: none;
      border: none;
      color: #dc2626;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      &:hover {
        text-decoration: underline;
      }
    }
  }
`;

// MODAL STYLES
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalBox = styled.div`
  background: white;
  border-radius: 14px;
  padding: 28px;
  width: 90%;
  max-width: 620px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 800;
    color: #0f172a;
  }

  button {
    background: none;
    border: none;
    font-size: 20px;
    color: #94a3b8;
    cursor: pointer;
    &:hover {
      color: #0f172a;
    }
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-size: 12px;
    font-weight: 700;
    color: #475569;
  }

  input,
  select {
    padding: 10px 12px;
    border-radius: 8px;
    border: 1px solid #cbd5e1;
    font-size: 13px;
    outline: none;
    background: white;

    &:focus {
      border-color: #0f766e;
      box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.12);
    }
  }
`;

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const TIME_SLOTS = [
  "09:00 - 10:00 AM",
  "10:00 - 11:00 AM",
  "11:15 - 12:15 PM",
  "12:15 - 01:15 PM",
  "02:00 - 03:00 PM",
  "03:00 - 04:00 PM",
  "04:00 - 05:00 PM",
];

const PREDEFINED_SUBJECTS = [
  "Data Structures & Algorithms",
  "Database Management Systems (DBMS)",
  "Operating Systems",
  "Computer Networks",
  "Object Oriented Programming (Java)",
  "Theory of Computation",
  "Software Engineering & Architecture",
  "Artificial Intelligence & Machine Learning",
  "Web Technologies & Full Stack Lab",
  "Computer Organization & Architecture",
];

const INITIAL_SCHEDULES = [
  {
    id: "slot_1",
    day: "Monday",
    timeSlot: "09:00 - 10:00 AM",
    subject: "Data Structures & Algorithms",
    type: "Lecture",
    faculty: "Dr. Rajesh Sharma",
    room: "LH-101",
    section: "Section A",
    group: "All",
    department: "Computer Science",
  },
  {
    id: "slot_2",
    day: "Monday",
    timeSlot: "10:00 - 11:00 AM",
    subject: "Database Management Systems",
    type: "Lecture",
    faculty: "Prof. Meenakshi Sundaram",
    room: "LH-101",
    section: "Section A",
    group: "All",
    department: "Computer Science",
  },
  {
    id: "slot_3",
    day: "Monday",
    timeSlot: "11:15 - 12:15 PM",
    subject: "Web Technologies & Full Stack Lab",
    type: "Practical Lab",
    faculty: "Er. Amit Roy",
    room: "CS-Lab 2",
    section: "Section A",
    group: "Group 1",
    department: "Computer Science",
  },
  {
    id: "slot_4",
    day: "Monday",
    timeSlot: "02:00 - 03:00 PM",
    subject: "Computer Networks",
    type: "Lecture",
    faculty: "Dr. Vandana Rao",
    room: "LH-102",
    section: "Section A",
    group: "All",
    department: "Computer Science",
  },
  {
    id: "slot_5",
    day: "Tuesday",
    timeSlot: "09:00 - 10:00 AM",
    subject: "Operating Systems",
    type: "Lecture",
    faculty: "Dr. Harish Chandra",
    room: "LH-101",
    section: "Section A",
    group: "All",
    department: "Computer Science",
  },
  {
    id: "slot_6",
    day: "Tuesday",
    timeSlot: "10:00 - 11:00 AM",
    subject: "Data Structures & Algorithms",
    type: "Tutorial",
    faculty: "Dr. Rajesh Sharma",
    room: "Room 204",
    section: "Section A",
    group: "Group 2",
    department: "Computer Science",
  },
  {
    id: "slot_7",
    day: "Tuesday",
    timeSlot: "11:15 - 12:15 PM",
    subject: "Object Oriented Programming (Java)",
    type: "Lecture",
    faculty: "Prof. Anita Deshmukh",
    room: "LH-103",
    section: "Section B",
    group: "All",
    department: "Computer Science",
  },
  {
    id: "slot_8",
    day: "Wednesday",
    timeSlot: "09:00 - 10:00 AM",
    subject: "Theory of Computation",
    type: "Lecture",
    faculty: "Dr. Arvind Gupta",
    room: "LH-101",
    section: "Section A",
    group: "All",
    department: "Computer Science",
  },
  {
    id: "slot_9",
    day: "Wednesday",
    timeSlot: "11:15 - 12:15 PM",
    subject: "Software Engineering & Architecture",
    type: "Lecture",
    faculty: "Prof. Meenakshi Sundaram",
    room: "LH-102",
    section: "Section A",
    group: "All",
    department: "Computer Science",
  },
  {
    id: "slot_10",
    day: "Wednesday",
    timeSlot: "02:00 - 03:00 PM",
    subject: "Artificial Intelligence & Machine Learning",
    type: "Lecture",
    faculty: "Dr. Vikram Seth",
    room: "LH-104",
    section: "Section A",
    group: "All",
    department: "Computer Science",
  },
  {
    id: "slot_11",
    day: "Thursday",
    timeSlot: "10:00 - 11:00 AM",
    subject: "Computer Organization & Architecture",
    type: "Lecture",
    faculty: "Dr. Vandana Rao",
    room: "LH-101",
    section: "Section A",
    group: "All",
    department: "Computer Science",
  },
  {
    id: "slot_12",
    day: "Thursday",
    timeSlot: "02:00 - 03:00 PM",
    subject: "Operating Systems Lab",
    type: "Practical Lab",
    faculty: "Dr. Harish Chandra",
    room: "CS-Lab 1",
    section: "Section A",
    group: "Group 1",
    department: "Computer Science",
  },
  {
    id: "slot_13",
    day: "Friday",
    timeSlot: "09:00 - 10:00 AM",
    subject: "Artificial Intelligence & Machine Learning",
    type: "Seminar",
    faculty: "Dr. Vikram Seth",
    room: "Audi-2",
    section: "Section A",
    group: "All",
    department: "Computer Science",
  },
  {
    id: "slot_14",
    day: "Friday",
    timeSlot: "11:15 - 12:15 PM",
    subject: "Database Management Systems",
    type: "Practical Lab",
    faculty: "Prof. Meenakshi Sundaram",
    room: "CS-Lab 3",
    section: "Section A",
    group: "Group 2",
    department: "Computer Science",
  },
];

const AdminClasses = () => {
  const [schedules, setSchedules] = useState(() => {
    try {
      const saved = localStorage.getItem("campus_sync_timetables_v2");
      return saved ? JSON.parse(saved) : INITIAL_SCHEDULES;
    } catch {
      return INITIAL_SCHEDULES;
    }
  });

  const [viewMode, setViewMode] = useState("matrix"); // "matrix" | "cards"
  const [filterDay, setFilterDay] = useState("all");
  const [filterDepartment, setFilterDepartment] = useState("Computer Science");
  const [filterSection, setFilterSection] = useState("all");
  const [filterGroup, setFilterGroup] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    day: "Monday",
    timeSlot: TIME_SLOTS[0],
    subject: PREDEFINED_SUBJECTS[0],
    customSubject: "",
    type: "Lecture",
    faculty: "Dr. Rajesh Sharma",
    room: "LH-101",
    section: "Section A",
    group: "All",
    department: "Computer Science",
  });
  const [isCustomSubject, setIsCustomSubject] = useState(false);

  useEffect(() => {
    localStorage.setItem("campus_sync_timetables_v2", JSON.stringify(schedules));
  }, [schedules]);

  // Handle Form Submission (CRITICAL: e.preventDefault() prevents page redirect!)
  const handleAddSchedule = (e) => {
    e.preventDefault();

    const finalSubject = isCustomSubject ? formData.customSubject.trim() : formData.subject;

    if (!finalSubject) {
      toast.error("Please specify a course subject name.");
      return;
    }

    if (!formData.room.trim() || !formData.faculty.trim()) {
      toast.error("Please specify room/hall and faculty instructor.");
      return;
    }

    const newSlot = {
      id: `slot_${Date.now()}`,
      day: formData.day,
      timeSlot: formData.timeSlot,
      subject: finalSubject,
      type: formData.type,
      faculty: formData.faculty.trim(),
      room: formData.room.trim(),
      section: formData.section,
      group: formData.group,
      department: formData.department,
    };

    setSchedules((prev) => [newSlot, ...prev]);
    setIsModalOpen(false);
    toast.success(`Schedule period added: ${finalSubject} (${formData.day} ${formData.timeSlot})`);

    // Reset form
    setFormData({
      day: "Monday",
      timeSlot: TIME_SLOTS[0],
      subject: PREDEFINED_SUBJECTS[0],
      customSubject: "",
      type: "Lecture",
      faculty: "Dr. Rajesh Sharma",
      room: "LH-101",
      section: "Section A",
      group: "All",
      department: "Computer Science",
    });
    setIsCustomSubject(false);
  };

  const handleDeleteSlot = (id, subName) => {
    if (window.confirm(`Are you sure you want to remove "${subName}" from the schedule?`)) {
      setSchedules((prev) => prev.filter((s) => s.id !== id));
      toast.info(`Removed "${subName}" from timetable.`);
    }
  };

  const handleResetSchedule = () => {
    if (window.confirm("Reset timetable back to official University standard template?")) {
      setSchedules(INITIAL_SCHEDULES);
      toast.success("Timetable restored to institutional standard.");
    }
  };

  // Filtered schedules
  const filteredSchedules = useMemo(() => {
    return schedules.filter((s) => {
      if (filterDay !== "all" && s.day !== filterDay) return false;
      if (filterDepartment !== "all" && s.department !== filterDepartment) return false;
      if (filterSection !== "all" && s.section !== filterSection) return false;
      if (filterGroup !== "all" && s.group !== "All" && s.group !== filterGroup) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          s.subject.toLowerCase().includes(q) ||
          s.faculty.toLowerCase().includes(q) ||
          s.room.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [schedules, filterDay, filterDepartment, filterSection, filterGroup, searchQuery]);

  // Distinct rooms and faculty for stats
  const totalLectures = filteredSchedules.length;
  const uniqueRooms = new Set(filteredSchedules.map((s) => s.room)).size;
  const uniqueFaculty = new Set(filteredSchedules.map((s) => s.faculty)).size;

  return (
    <>
      <Container>
        <AdminSidebar />
        <Content>
          <Header>
            <div className="title-group">
              <h1>Academic Timetable & Class Schedules</h1>
              <p>
                Comprehensive university timetable manager. Allocate lecture halls, assign faculty, and coordinate section & group slots.
              </p>
            </div>
            <div className="action-buttons">
              <SecondaryButton onClick={handleResetSchedule}>
                🔄 Reset Default
              </SecondaryButton>
              
              <PrimaryButton onClick={() => setIsModalOpen(true)}>
                ➕ Add Schedule Slot
              </PrimaryButton>
            </div>
          </Header>

          {/* Quick Metrics */}
          <StatsGrid>
            <StatCard $bg="#f0fdf4" $color="#0f766e">
              <div className="icon-wrap">📅</div>
              <div className="info">
                <div className="label">Scheduled Periods</div>
                <div className="value">{totalLectures} Classes</div>
              </div>
            </StatCard>
            <StatCard $bg="#eff6ff" $color="#2563eb">
              <div className="icon-wrap">🏫</div>
              <div className="info">
                <div className="label">Active Halls & Labs</div>
                <div className="value">{uniqueRooms} Venues</div>
              </div>
            </StatCard>
            <StatCard $bg="#fef3c7" $color="#d97706">
              <div className="icon-wrap">👨‍🏫</div>
              <div className="info">
                <div className="label">Assigned Faculty</div>
                <div className="value">{uniqueFaculty} Professors</div>
              </div>
            </StatCard>
            <StatCard $bg="#fdf2f8" $color="#db2777">
              <div className="icon-wrap">🎓</div>
              <div className="info">
                <div className="label">Department Coverage</div>
                <div className="value">Computer Science</div>
              </div>
            </StatCard>
          </StatsGrid>

          {/* Filter Bar */}
          <FilterCard>
            <FilterItem>
              <label>Day of Week</label>
              <select value={filterDay} onChange={(e) => setFilterDay(e.target.value)}>
                <option value="all">All Days (Mon - Sat)</option>
                {DAYS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </FilterItem>

            <FilterItem>
              <label>Department</label>
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Information Technology">Information Technology</option>
                <option value="all">All Departments</option>
              </select>
            </FilterItem>

            <FilterItem>
              <label>Section</label>
              <select value={filterSection} onChange={(e) => setFilterSection(e.target.value)}>
                <option value="all">All Sections</option>
                <option value="Section A">Section A</option>
                <option value="Section B">Section B</option>
                <option value="Section C">Section C</option>
              </select>
            </FilterItem>

            <FilterItem>
              <label>Group</label>
              <select value={filterGroup} onChange={(e) => setFilterGroup(e.target.value)}>
                <option value="all">All Groups</option>
                <option value="Group 1">Group 1 (G1)</option>
                <option value="Group 2">Group 2 (G2)</option>
                <option value="Group 3">Group 3 (G3)</option>
              </select>
            </FilterItem>

            <FilterItem style={{ flex: 1, minWidth: "180px" }}>
              <label>Quick Search</label>
              <input
                type="text"
                placeholder="Search subject, faculty, or room..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </FilterItem>

            <ViewToggle $active={viewMode === "matrix"}>
              <button
                type="button"
                onClick={() => setViewMode("matrix")}
                style={{
                  background: viewMode === "matrix" ? "white" : "transparent",
                  color: viewMode === "matrix" ? "#0f766e" : "#64748b",
                }}
              >
                🗓️ Timetable Grid
              </button>
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                style={{
                  background: viewMode === "cards" ? "white" : "transparent",
                  color: viewMode === "cards" ? "#0f766e" : "#64748b",
                }}
              >
                📋 Schedule Cards
              </button>
            </ViewToggle>
          </FilterCard>

          {/* VIEW MODE 1: MATRIX GRID */}
          {viewMode === "matrix" ? (
            <TableWrapper>
              <MatrixTable>
                <thead>
                  <tr>
                    <th style={{ width: "110px", textAlign: "center" }}>Day</th>
                    {TIME_SLOTS.map((slot) => (
                      <th key={slot}>{slot}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(filterDay === "all" ? DAYS : [filterDay]).map((day) => {
                    const daySlots = filteredSchedules.filter((s) => s.day === day);

                    return (
                      <tr key={day}>
                        <td className="day-header">{day}</td>
                        {TIME_SLOTS.map((time) => {
                          const matchingPeriods = daySlots.filter((s) => s.timeSlot === time);

                          return (
                            <td key={time}>
                              {matchingPeriods.length > 0 ? (
                                matchingPeriods.map((slot) => (
                                  <SlotPill key={slot.id} $type={slot.type}>
                                    <button
                                      type="button"
                                      className="delete-btn"
                                      title="Remove slot"
                                      onClick={() => handleDeleteSlot(slot.id, slot.subject)}
                                    >
                                      ✕
                                    </button>
                                    <div className="course-title">{slot.subject}</div>
                                    <div className="meta-row">
                                      <span>👨‍🏫 {slot.faculty}</span>
                                      <span>🏫 {slot.room}</span>
                                    </div>
                                    <div className="tag-row">
                                      <span>{slot.type}</span>
                                      <span>{slot.section}</span>
                                      {slot.group !== "All" && <span>{slot.group}</span>}
                                    </div>
                                  </SlotPill>
                                ))
                              ) : (
                                <div
                                  style={{
                                    height: "100%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "#cbd5e1",
                                    fontSize: "12px",
                                    fontStyle: "italic",
                                  }}
                                >
                                  —
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </MatrixTable>
            </TableWrapper>
          ) : (
            /* VIEW MODE 2: CARDS GRID */
            <CardsGrid>
              {filteredSchedules.map((slot) => (
                <ClassCard key={slot.id} $type={slot.type}>
                  <div className="card-header">
                    <span className="day-badge">{slot.day}</span>
                    <span className="time-badge">⏰ {slot.timeSlot}</span>
                  </div>
                  <div className="subject">{slot.subject}</div>
                  <div className="details">
                    <div>
                      <strong>👨‍🏫 Instructor:</strong> {slot.faculty}
                    </div>
                    <div>
                      <strong>🏫 Room / Hall:</strong> {slot.room}
                    </div>
                    <div>
                      <strong>🏛️ Dept:</strong> {slot.department}
                    </div>
                  </div>
                  <div className="footer-tags">
                    <div className="badges">
                      <span>{slot.type}</span>
                      <span>{slot.section}</span>
                      {slot.group !== "All" && <span>{slot.group}</span>}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteSlot(slot.id, slot.subject)}
                    >
                      Remove
                    </button>
                  </div>
                </ClassCard>
              ))}
            </CardsGrid>
          )}

          {/* ADD SCHEDULE MODAL */}
          {isModalOpen && (
            <ModalOverlay>
              <ModalBox>
                <ModalHeader>
                  <h3>➕ Add Class Schedule Slot</h3>
                  <button type="button" onClick={() => setIsModalOpen(false)}>
                    ✕
                  </button>
                </ModalHeader>

                <form onSubmit={handleAddSchedule}>
                  <FormGrid>
                    <FormGroup>
                      <label>Day of Week *</label>
                      <select
                        value={formData.day}
                        onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                        required
                      >
                        {DAYS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </FormGroup>

                    <FormGroup>
                      <label>Time Slot *</label>
                      <select
                        value={formData.timeSlot}
                        onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                        required
                      >
                        {TIME_SLOTS.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </FormGroup>

                    <FormGroup>
                      <label>Course / Subject *</label>
                      <select
                        value={isCustomSubject ? "__custom__" : formData.subject}
                        onChange={(e) => {
                          if (e.target.value === "__custom__") {
                            setIsCustomSubject(true);
                          } else {
                            setIsCustomSubject(false);
                            setFormData({ ...formData, subject: e.target.value });
                          }
                        }}
                      >
                        {PREDEFINED_SUBJECTS.map((sub) => (
                          <option key={sub} value={sub}>
                            {sub}
                          </option>
                        ))}
                        <option value="__custom__">➕ Add Custom Subject</option>
                      </select>
                    </FormGroup>

                    {isCustomSubject && (
                      <FormGroup>
                        <label style={{ color: "#0f766e" }}>Custom Subject Name *</label>
                        <input
                          type="text"
                          placeholder="e.g. Distributed Cloud Computing"
                          value={formData.customSubject}
                          onChange={(e) =>
                            setFormData({ ...formData, customSubject: e.target.value })
                          }
                          required
                        />
                      </FormGroup>
                    )}

                    <FormGroup>
                      <label>Class Session Type *</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        required
                      >
                        <option value="Lecture">Lecture</option>
                        <option value="Practical Lab">Practical Lab</option>
                        <option value="Tutorial">Tutorial</option>
                        <option value="Seminar">Seminar</option>
                      </select>
                    </FormGroup>

                    <FormGroup>
                      <label>Faculty / Instructor *</label>
                      <input
                        type="text"
                        placeholder="e.g. Dr. Rajesh Sharma"
                        value={formData.faculty}
                        onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                        required
                      />
                    </FormGroup>

                    <FormGroup>
                      <label>Lecture Hall / Lab *</label>
                      <input
                        type="text"
                        placeholder="e.g. LH-101 or CS Lab 2"
                        value={formData.room}
                        onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                        required
                      />
                    </FormGroup>

                    <FormGroup>
                      <label>Section *</label>
                      <select
                        value={formData.section}
                        onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                      >
                        <option value="Section A">Section A</option>
                        <option value="Section B">Section B</option>
                        <option value="Section C">Section C</option>
                        <option value="All Sections">All Sections</option>
                      </select>
                    </FormGroup>

                    <FormGroup>
                      <label>Group *</label>
                      <select
                        value={formData.group}
                        onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                      >
                        <option value="All">All Groups (Whole Section)</option>
                        <option value="Group 1">Group 1 (G1)</option>
                        <option value="Group 2">Group 2 (G2)</option>
                        <option value="Group 3">Group 3 (G3)</option>
                      </select>
                    </FormGroup>
                  </FormGrid>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: "10px",
                      marginTop: "16px",
                    }}
                  >
                    <SecondaryButton type="button" onClick={() => setIsModalOpen(false)}>
                      Cancel
                    </SecondaryButton>
                    <PrimaryButton type="submit">✓ Save to Timetable</PrimaryButton>
                  </div>
                </form>
              </ModalBox>
            </ModalOverlay>
          )}
        </Content>
      </Container>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
};

export default AdminClasses;
