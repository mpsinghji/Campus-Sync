import React, { useEffect, useState, useMemo } from "react";
import Sidebar from "./Sidebar";
import styled from "styled-components";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import Cookies from "js-cookie";
import { BACKEND_URL } from "../../constants/url";
import {
  BsCalendarEvent,
  BsClock,
  BsGeoAlt,
  BsFileEarmarkText,
  BsCheckCircleFill,
  BsExclamationCircleFill,
  BsHourglassSplit,
  BsPrinter,
  BsSearch,
  BsFilter,
  BsBook,
  BsAward,
} from "react-icons/bs";

// Mapping of departments to their core academic subjects
const SUBJECTS_BY_DEPT = {
  "Computer Science": [
    "Data Structures & Algorithms",
    "Operating Systems",
    "Database Management Systems",
    "Computer Networks",
    "Software Engineering",
    "Machine Learning",
    "Web Technologies",
    "Discrete Mathematics",
  ],
  "Electronics": [
    "Digital Electronics",
    "Analog Circuits",
    "Microprocessors",
    "Signal Processing",
    "Embedded Systems",
    "VLSI Design",
  ],
  "Mechanical": [
    "Thermodynamics",
    "Fluid Mechanics",
    "Manufacturing Technology",
    "Engineering Mechanics",
    "Machine Design",
  ],
  "Civil": [
    "Structural Analysis",
    "Geotechnical Engineering",
    "Highway Engineering",
    "Environmental Engineering",
    "Construction Management",
  ],
  "Information Technology": [
    "Cloud Computing",
    "Cyber Security",
    "Data Science",
    "Mobile Application Development",
    "Internet of Things",
    "Artificial Intelligence",
  ],
};

const Container = styled.div`
  display: flex;
  padding-left: 250px;
  min-height: 100vh;
  background-color: #f8fafc;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  box-sizing: border-box;

  @media screen and (max-width: 900px) {
    padding-left: 0;
    flex-direction: column;
  }
`;

const Content = styled.div`
  flex: 1;
  padding: 32px 36px;
  width: 100%;
  box-sizing: border-box;
`;

const HeaderSection = styled.div`
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
      display: flex;
      align-items: center;
      gap: 10px;
    }

    p {
      font-size: 14px;
      color: #64748b;
      margin: 0;
    }
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 26px;
`;

const StatCard = styled.div`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 18px 20px;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.03);
  display: flex;
  align-items: center;
  gap: 14px;

  .icon-box {
    width: 46px;
    height: 46px;
    border-radius: 12px;
    background: ${(props) => props.$bg || "#ecfdf5"};
    color: ${(props) => props.$color || "#059669"};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
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
      line-height: 1.2;
    }
    .subtext {
      font-size: 11px;
      color: #94a3b8;
    }
  }
`;

const Toolbar = styled.div`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 14px 18px;
  margin-bottom: 22px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);

  .tabs-group {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .search-box {
    position: relative;
    min-width: 260px;

    input {
      width: 100%;
      padding: 9px 12px 9px 34px;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-size: 13px;
      outline: none;
      box-sizing: border-box;

      &:focus {
        border-color: #059669;
        box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.15);
      }
    }

    svg {
      position: absolute;
      left: 11px;
      top: 11px;
      color: #94a3b8;
      font-size: 14px;
    }
  }
`;

const TabButton = styled.button`
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: ${(props) => (props.$active ? "#0f766e" : "#f1f5f9")};
  color: ${(props) => (props.$active ? "#ffffff" : "#475569")};

  &:hover {
    background: ${(props) => (props.$active ? "#0d655e" : "#e2e8f0")};
  }

  .count-badge {
    background: ${(props) => (props.$active ? "rgba(255, 255, 255, 0.2)" : "#cbd5e1")};
    color: ${(props) => (props.$active ? "#ffffff" : "#334155")};
    padding: 2px 7px;
    border-radius: 12px;
    font-size: 11px;
  }
`;

const ExamGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 20px;
`;

const ExamCard = styled.div`
  background: #ffffff;
  border: 1px solid ${(props) => (props.$isImminent ? "#fca5a5" : "#e2e8f0")};
  border-radius: 14px;
  padding: 22px;
  box-shadow: 0 3px 10px rgba(15, 23, 42, 0.04);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 16px;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;

  ${(props) =>
    props.$isImminent &&
    `
    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 4px;
      height: 100%;
      background: #ef4444;
    }
  `}

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 22px rgba(15, 23, 42, 0.08);
    border-color: #0f766e;
  }

  .card-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10px;

    .subject-info {
      .subject-code {
        font-family: monospace;
        font-size: 11px;
        font-weight: 700;
        background: #f1f5f9;
        color: #475569;
        padding: 3px 8px;
        border-radius: 4px;
        display: inline-block;
        margin-bottom: 6px;
      }

      h3 {
        font-size: 17px;
        font-weight: 800;
        color: #0f172a;
        margin: 0;
        line-height: 1.3;
      }
    }

    .countdown-pill {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 700;
      white-space: nowrap;
      background: ${(props) =>
        props.$isImminent
          ? "#fee2e2"
          : props.$isPast
          ? "#f1f5f9"
          : "#ecfdf5"};
      color: ${(props) =>
        props.$isImminent
          ? "#dc2626"
          : props.$isPast
          ? "#64748b"
          : "#059669"};
      border: 1px solid
        ${(props) =>
          props.$isImminent
            ? "#fca5a5"
            : props.$isPast
            ? "#e2e8f0"
            : "#a7f3d0"};
    }
  }

  .meta-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    background: #f8fafc;
    border: 1px solid #f1f5f9;
    border-radius: 10px;
    padding: 12px;

    .meta-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: #334155;

      svg {
        color: #0f766e;
        font-size: 14px;
        flex-shrink: 0;
      }

      .meta-label {
        color: #64748b;
        font-size: 11px;
        display: block;
      }

      .meta-val {
        font-weight: 700;
      }
    }
  }

  .description {
    font-size: 13px;
    color: #64748b;
    line-height: 1.5;
    margin: 0;
  }

  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid #f1f5f9;
    padding-top: 12px;
    font-size: 12px;

    .type-badge {
      font-weight: 600;
      color: #0369a1;
      background: #e0f2fe;
      padding: 3px 8px;
      border-radius: 4px;
    }

    button.hall-ticket-btn {
      background: none;
      border: none;
      color: #0f766e;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 4px;

      &:hover {
        text-decoration: underline;
      }
    }
  }
`;

const EmptyState = styled.div`
  background: #ffffff;
  border: 1px dashed #cbd5e1;
  border-radius: 14px;
  padding: 48px 24px;
  text-align: center;
  color: #64748b;
  margin-top: 20px;

  .icon {
    font-size: 40px;
    color: #94a3b8;
    margin-bottom: 12px;
  }

  h3 {
    font-size: 18px;
    font-weight: 700;
    color: #1e293b;
    margin: 0 0 6px 0;
  }

  p {
    font-size: 13px;
    margin: 0;
  }
`;

const StudentExamSection = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentInfo, setStudentInfo] = useState({
    name: "Student",
    department: "Computer Science",
    batch: "Batch 2023",
    email: "",
    section: "A",
  });
  const [activeTab, setActiveTab] = useState("upcoming"); // 'upcoming' | 'past' | 'all'
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Read student cookie details to filter accurate exams
    const studentCookie = Cookies.get("studentData");
    if (studentCookie) {
      try {
        const parsed = JSON.parse(studentCookie);
        setStudentInfo({
          name: parsed.name || "Student",
          department: parsed.department || "Computer Science",
          batch: parsed.batch || "Batch 2023",
          email: (parsed.email || "").toLowerCase().trim(),
          section: parsed.section || "A",
        });
      } catch (e) {
        console.error("Error parsing studentData cookie:", e);
      }
    }
    fetchExams();
  }, []);

  const fetchExams = async () => {
    setLoading(true);
    try {
      let batch = "";
      const cookie = Cookies.get("studentData");
      if (cookie) {
        try {
          batch = JSON.parse(cookie)?.batch || "";
        } catch (e) {}
      }

      const res = await axios.get(
        `${BACKEND_URL}api/v1/exam/getall?batch=${encodeURIComponent(batch)}`
      );

      if (Array.isArray(res.data?.exams)) {
        setExams(res.data.exams);
      }
    } catch (err) {
      console.error("Error fetching exams:", err);
      toast.error("Error fetching exams schedule");
    } finally {
      setLoading(false);
    }
  };

  // Filter exams that are strictly meant for this student!
  const studentApplicableExams = useMemo(() => {
    const dept = studentInfo.department || "Computer Science";
    const deptSubjects = SUBJECTS_BY_DEPT[dept] || [];
    const studentEmail = (studentInfo.email || "").toLowerCase().trim();

    return exams.filter((exam) => {
      // 1. If exam has targeted emails, verify student is in list
      if (Array.isArray(exam.targetEmails) && exam.targetEmails.length > 0) {
        const hasEmail = exam.targetEmails.some(
          (e) => String(e).toLowerCase().trim() === studentEmail
        );
        if (hasEmail) return true;
      }

      // 2. Check batch match
      if (exam.batch && exam.batch !== "all" && exam.batch !== studentInfo.batch) {
        return false;
      }

      // 3. Check subject match against student's department
      if (deptSubjects.length > 0) {
        const subName = exam.subjectName || "";
        const matchesDept = deptSubjects.some(
          (ds) =>
            ds.toLowerCase().trim() === subName.toLowerCase().trim() ||
            subName.toLowerCase().includes(ds.toLowerCase())
        );
        return matchesDept;
      }

      return true;
    });
  }, [exams, studentInfo]);

  // Separate upcoming vs past
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  const classifiedExams = useMemo(() => {
    const upcomingList = [];
    const pastList = [];

    studentApplicableExams.forEach((ex) => {
      const examDate = new Date(ex.date).getTime();
      if (examDate >= startOfToday) {
        upcomingList.push(ex);
      } else {
        pastList.push(ex);
      }
    });

    // Sort upcoming ascending (nearest first)
    upcomingList.sort((a, b) => new Date(a.date) - new Date(b.date));
    // Sort past descending (most recent first)
    pastList.sort((a, b) => new Date(b.date) - new Date(a.date));

    return { upcomingList, pastList };
  }, [studentApplicableExams, startOfToday]);

  const displayedExams = useMemo(() => {
    let list = [];
    if (activeTab === "upcoming") {
      list = classifiedExams.upcomingList;
    } else if (activeTab === "past") {
      list = classifiedExams.pastList;
    } else {
      list = [...classifiedExams.upcomingList, ...classifiedExams.pastList];
    }

    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (e) =>
        e.subjectName?.toLowerCase().includes(q) ||
        e.subjectCode?.toLowerCase().includes(q) ||
        e.description?.toLowerCase().includes(q)
    );
  }, [classifiedExams, activeTab, searchQuery]);

  const nextExam = classifiedExams.upcomingList[0];
  const daysUntilNext = nextExam
    ? Math.max(
        0,
        Math.ceil((new Date(nextExam.date) - new Date()) / (1000 * 60 * 60 * 24))
      )
    : null;

  const formatDate = (d) => {
    if (!d) return "TBA";
    const dateObj = new Date(d);
    if (isNaN(dateObj.getTime())) return String(d);
    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = dateObj.getFullYear();
    const weekday = dateObj.toLocaleDateString("en-US", { weekday: "short" });
    return `${weekday}, ${day}/${month}/${year}`;
  };

  const getCountdownLabel = (d) => {
    const dateObj = new Date(d);
    const diffDays = Math.ceil((dateObj - new Date()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return "Completed";
    if (diffDays === 0) return "🔥 Today";
    if (diffDays === 1) return "⚡ Tomorrow";
    return `In ${diffDays} days`;
  };

  const handlePrintTimetable = () => {
    window.print();
  };

  return (
    <Container>
      <Sidebar />
      <Content>
        <HeaderSection>
          <div className="title-group">
            <h1>
              <BsCalendarEvent style={{ color: "#0f766e" }} /> Examinations & Datesheet
            </h1>
            <p>
              Academic timetable tailored for <strong>{studentInfo.department}</strong> ({studentInfo.batch})
            </p>
          </div>

          <div className="actions">
            <button
              onClick={handlePrintTimetable}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "#ffffff",
                border: "1px solid #cbd5e1",
                padding: "8px 14px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
                color: "#334155",
              }}
            >
              <BsPrinter /> Print Schedule
            </button>
          </div>
        </HeaderSection>

        {/* Dynamic Metric Tiles */}
        <StatsGrid>
          <StatCard $bg="#ecfdf5" $color="#059669">
            <div className="icon-box">
              <BsHourglassSplit />
            </div>
            <div className="info">
              <div className="label">Upcoming Exams</div>
              <div className="value">{classifiedExams.upcomingList.length}</div>
              <div className="subtext">Scheduled for your branch</div>
            </div>
          </StatCard>

          <StatCard $bg="#eff6ff" $color="#2563eb">
            <div className="icon-box">
              <BsClock />
            </div>
            <div className="info">
              <div className="label">Next Examination</div>
              <div className="value">
                {daysUntilNext !== null ? (daysUntilNext === 0 ? "Today" : `In ${daysUntilNext} Days`) : "None"}
              </div>
              <div className="subtext">{nextExam?.subjectName || "All completed"}</div>
            </div>
          </StatCard>

          <StatCard $bg="#fef3c7" $color="#d97706">
            <div className="icon-box">
              <BsBook />
            </div>
            <div className="info">
              <div className="label">Your Curriculum</div>
              <div className="value">{studentInfo.department.split(" ")[0]}</div>
              <div className="subtext">{studentInfo.batch} • Section {studentInfo.section}</div>
            </div>
          </StatCard>

          <StatCard $bg="#f5f3ff" $color="#7c3aed">
            <div className="icon-box">
              <BsAward />
            </div>
            <div className="info">
              <div className="label">Exam Clearance</div>
              <div className="value">Eligible</div>
              <div className="subtext">Academic standing verified</div>
            </div>
          </StatCard>
        </StatsGrid>

        {/* Toolbar & Filter Tabs */}
        <Toolbar>
          <div className="tabs-group">
            <TabButton
              $active={activeTab === "upcoming"}
              onClick={() => setActiveTab("upcoming")}
            >
              🔥 Upcoming Exams (About to Come)
              <span className="count-badge">
                {classifiedExams.upcomingList.length}
              </span>
            </TabButton>

            <TabButton
              $active={activeTab === "past"}
              onClick={() => setActiveTab("past")}
            >
              📜 Past / Completed Exams
              <span className="count-badge">{classifiedExams.pastList.length}</span>
            </TabButton>

            <TabButton
              $active={activeTab === "all"}
              onClick={() => setActiveTab("all")}
            >
              All Applicable
              <span className="count-badge">
                {studentApplicableExams.length}
              </span>
            </TabButton>
          </div>

          <div className="search-box">
            <BsSearch />
            <input
              type="text"
              placeholder="Search subject or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </Toolbar>

        {/* Responsive Cards Grid */}
        {loading ? (
          <EmptyState>
            <div className="icon">⏳</div>
            <h3>Loading examination schedule...</h3>
            <p>Fetching datesheet for your department</p>
          </EmptyState>
        ) : displayedExams.length > 0 ? (
          <ExamGrid>
            {displayedExams.map((exam, idx) => {
              const diffDays = Math.ceil(
                (new Date(exam.date) - new Date()) / (1000 * 60 * 60 * 24)
              );
              const isImminent = diffDays >= 0 && diffDays <= 7;
              const isPast = diffDays < 0;

              return (
                <ExamCard
                  key={exam._id || idx}
                  $isImminent={isImminent}
                  $isPast={isPast}
                >
                  <div className="card-top">
                    <div className="subject-info">
                      <span className="subject-code">
                        {exam.subjectCode || "EXAM101"}
                      </span>
                      <h3>{exam.subjectName}</h3>
                    </div>
                    <span className="countdown-pill">
                      {getCountdownLabel(exam.date)}
                    </span>
                  </div>

                  <div className="meta-grid">
                    <div className="meta-item">
                      <BsCalendarEvent />
                      <div>
                        <span className="meta-label">DATE</span>
                        <span className="meta-val">{formatDate(exam.date)}</span>
                      </div>
                    </div>

                    <div className="meta-item">
                      <BsClock />
                      <div>
                        <span className="meta-label">SESSION</span>
                        <span className="meta-val">10:00 AM - 1:00 PM</span>
                      </div>
                    </div>

                    <div className="meta-item">
                      <BsGeoAlt />
                      <div>
                        <span className="meta-label">VENUE</span>
                        <span className="meta-val">Hall B-204</span>
                      </div>
                    </div>

                    <div className="meta-item">
                      <BsFileEarmarkText />
                      <div>
                        <span className="meta-label">MAX MARKS</span>
                        <span className="meta-val">
                          {exam.description?.includes("30") ? "30 Marks" : "70 Marks"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="description">
                    {exam.description ||
                      `Regular examination for ${exam.subjectName}. Please report 30 minutes prior to exam commencement.`}
                  </p>

                  <div className="card-footer">
                    <span className="type-badge">
                      {exam.description?.includes("Mid-Term")
                        ? "Mid-Term Examination"
                        : "End-Semester Examination"}
                    </span>
                  </div>
                </ExamCard>
              );
            })}
          </ExamGrid>
        ) : (
          <EmptyState>
            <div className="icon">🎉</div>
            <h3>No upcoming exams scheduled</h3>
            <p>
              There are no examinations pending for {studentInfo.department} in this category.
            </p>
          </EmptyState>
        )}
      </Content>
      <ToastContainer />
    </Container>
  );
};

export default StudentExamSection;
