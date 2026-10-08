import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import Cookies from "js-cookie";
import { BACKEND_URL } from "../../constants/url";
import Loading from "../../components/Loading/loading.jsx";
import { formatDateDDMMYYYY } from "../../utils/dateUtils";
import {
  BsBook,
  BsCalendarEvent,
  BsCheckCircleFill,
  BsCreditCard,
  BsFileText,
  BsMegaphone,
  BsPersonBadge,
  BsClockHistory,
  BsExclamationTriangleFill,
  BsArrowRight,
} from "react-icons/bs";

const Container = styled.div`
  display: flex;
  padding-left: 250px;
  width: 100%;
  min-height: 100vh;
  box-sizing: border-box;
  background-color: #f8fafc;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

  @media screen and (max-width: 768px) {
    padding-left: 0;
  }
`;

const ContentWrapper = styled.div`
  flex: 1;
  padding: 30px 36px;
  max-width: 1400px;
  box-sizing: border-box;
`;

// Hero Greeting Card
const HeroBanner = styled.div`
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border-radius: 16px;
  padding: 26px 30px;
  color: #ffffff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.12);
  flex-wrap: wrap;
  gap: 16px;

  .left-col {
    .greeting {
      font-size: 24px;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .meta-pills {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 8px;
    }
  }

  .date-badge {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.15);
    padding: 8px 16px;
    border-radius: 10px;
    font-size: 13px;
    color: #cbd5e1;
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const Pill = styled.span`
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.18);
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  color: #e2e8f0;
`;

// Metrics Row
const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 18px;
  margin-bottom: 24px;
`;

const MetricCard = styled.div`
  background: #ffffff;
  border-radius: 14px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  .top-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .icon-box {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      background: ${(props) => props.$bg || "#e0f2fe"};
      color: ${(props) => props.$color || "#0284c7"};
    }

    .badge {
      font-size: 11px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 20px;
      background: ${(props) => props.$badgeBg || "#f1f5f9"};
      color: ${(props) => props.$badgeColor || "#475569"};
    }
  }

  .value {
    font-size: 26px;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 4px;
  }

  .label {
    font-size: 13px;
    font-weight: 600;
    color: #64748b;
  }
`;

// Quick Actions Bar
const QuickActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 14px;
  margin-bottom: 28px;
`;

const QuickActionBtn = styled.button`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  padding: 14px 16px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0,0,0,0.03);

  &:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
    color: #0f172a;
    transform: translateY(-1px);
  }

  .icon {
    font-size: 18px;
    color: ${(props) => props.$color || "#1abc9c"};
  }

  .arrow {
    margin-left: auto;
    color: #94a3b8;
    font-size: 14px;
  }
`;

// Alert Boxes
const AlertBanner = styled.div`
  background: ${(props) => (props.$danger ? "#fef2f2" : "#fffbeb")};
  border: 1px solid ${(props) => (props.$danger ? "#fecaca" : "#fde68a")};
  border-radius: 12px;
  padding: 14px 18px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  color: ${(props) => (props.$danger ? "#991b1b" : "#92400e")};
  font-size: 13px;
  flex-wrap: wrap;

  .message {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 500;
  }

  button {
    background: ${(props) => (props.$danger ? "#dc2626" : "#d97706")};
    color: #ffffff;
    border: none;
    padding: 6px 14px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
  }
`;

// Content Columns
const ColumnsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 22px;

  @media screen and (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`;

const SectionCard = styled.div`
  background: #ffffff;
  border-radius: 14px;
  padding: 22px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f1f5f9;

    h3 {
      font-size: 16px;
      font-weight: 700;
      color: #1e293b;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    button {
      background: none;
      border: none;
      color: #1abc9c;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;

      &:hover {
        text-decoration: underline;
      }
    }
  }
`;

const FeedList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const FeedItem = styled.div`
  padding: 14px 16px;
  border-radius: 10px;
  background: #f8fafc;
  border: 1px solid #edf2f7;
  transition: all 0.2s ease;

  &:hover {
    background: #ffffff;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    border-color: #e2e8f0;
  }

  .item-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;

    .title {
      font-size: 14px;
      font-weight: 700;
      color: #1e293b;
    }

    .badge {
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 6px;
      font-weight: 600;
      background: #e2e8f0;
      color: #475569;
    }
  }

  .desc {
    font-size: 12px;
    color: #64748b;
    line-height: 1.5;
    margin-bottom: 6px;
  }

  .meta {
    font-size: 11px;
    color: #94a3b8;
    display: flex;
    gap: 12px;
  }
`;

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Student Profile Context
  const [student, setStudent] = useState({
    name: "Enrolled Student",
    rollno: "CS23A001",
    batch: "Batch 2023-27 CS-A",
    department: "Computer Science",
    semester: "Semester 4",
    email: "",
  });

  // Dynamic Dashboard Metrics
  const [assignmentCount, setAssignmentCount] = useState(0);
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [libraryData, setLibraryData] = useState({ totalAssigned: 0, overdueCount: 0, totalLateFee: 0 });
  const [feeStatus, setFeeStatus] = useState("Paid");
  const [attendanceRate, setAttendanceRate] = useState("88%");

  useEffect(() => {
    // 1. Load active student data from cookies or localStorage
    try {
      const raw = Cookies.get("studentData");
      if (raw) {
        const parsed = JSON.parse(raw);
        const u = parsed.user || parsed.student || parsed;
        if (u) {
          const blocked = u.blockedModules || [];
          if (blocked.includes("dashboard")) {
            navigate("/student/fees");
            return;
          }

          setStudent({
            _id: u._id || u.id,
            name: u.name || "Student",
            rollno: u.rollno || "N/A",
            batch: u.batch || "Batch 2023-27 CS-A",
            department: u.department || "Computer Science",
            semester: u.semester || "Semester 4",
            email: u.email || "",
            blockedModules: blocked,
            autoFeeBlock: Boolean(u.autoFeeBlock),
          });
        }
      }
    } catch (e) {
      console.warn("Could not parse studentData cookie:", e);
    }
  }, [navigate]);

  useEffect(() => {
    const fetchDashboardDetails = async () => {
      try {
        setLoading(true);

        // Student details from cookie or local state for filtered announcements
        let studentEmail = student.email || "";
        let studentRollno = student.rollno || "";
        let studentBatch = student.batch || "";

        try {
          const raw = Cookies.get("studentData") || localStorage.getItem("studentData");
          if (raw) {
            const parsed = JSON.parse(raw);
            const u = parsed.user || parsed;
            if (!studentEmail) studentEmail = u.email || "";
            if (!studentRollno) studentRollno = u.rollno || "";
            if (!studentBatch) studentBatch = u.batch || "";
          }
        } catch {}

        const annQuery = new URLSearchParams({
          role: "student",
          email: studentEmail,
          rollno: studentRollno,
          batch: studentBatch,
        });

        // Fetch counts & lists in parallel
        const [assignRes, annRes, eventRes] = await Promise.all([
          axios.get(`${BACKEND_URL}api/v1/assignments/count`).catch(() => ({ data: { count: 0 } })),
          axios.get(`${BACKEND_URL}api/v1/announcements/getall?${annQuery.toString()}`).catch(() => ({ data: { announcements: [] } })),
          axios.get(`${BACKEND_URL}api/v1/events/getall`).catch(() => ({ data: { events: [] } })),
        ]);

        setAssignmentCount(assignRes.data?.count ?? 0);
        setAnnouncements(annRes.data?.announcements || []);
        setEvents(eventRes.data?.events || []);

        // Fetch student-specific library, fee, and attendance data
        const studentId = student._id;
        if (studentId) {
          try {
            const token = Cookies.get("studentToken") || localStorage.getItem("studentToken") || "";
            const attRes = await axios.get(
              `${BACKEND_URL}api/v1/attendance/my-attendance?studentId=${studentId}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  studenttoken: token,
                },
                withCredentials: true,
              }
            );
            if (attRes.data?.stats && attRes.data.stats.total > 0) {
              setAttendanceRate(`${attRes.data.stats.percentage}%`);
            } else if (attRes.data?.stats) {
              setAttendanceRate("0%");
            }
          } catch {}

          try {
            const libRes = await axios.get(`${BACKEND_URL}api/v1/library/student/${studentId}`);
            if (libRes.data?.success) {
              setLibraryData({
                totalAssigned: libRes.data.totalAssigned || 0,
                overdueCount: libRes.data.overdueCount || 0,
                totalLateFee: libRes.data.totalLateFee || 0,
              });
            }
          } catch {}

          try {
            const feeRes = await axios.get(`${BACKEND_URL}student-fees/${studentId}`);
            if (feeRes.data?.data) {
              const d = feeRes.data.data;
              if (d.paidFees > 0) {
                setFeeStatus("Paid ✓");
              } else if (d.pendingFees > 0) {
                setFeeStatus("Pending");
              } else {
                setFeeStatus("Verified");
              }
            }
          } catch {}
        }
      } catch (err) {
        console.error("Student dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardDetails();
  }, [student._id]);

  if (loading) return <Loading />;

  return (
    <Container>
      <ContentWrapper>
        {/* Hero Greeting Section */}
        <HeroBanner>
          <div className="left-col">
            <div className="greeting">
              <span>👋 Welcome back, {student.name}!</span>
            </div>
            <div className="meta-pills">
              <Pill>🎓 {student.batch}</Pill>
              <Pill>🆔 Roll No: {student.rollno}</Pill>
              <Pill>🏛️ {student.department}</Pill>
              <Pill>📖 {student.semester}</Pill>
            </div>
          </div>
          <div className="date-badge">
            <BsCalendarEvent />
            <span>Academic Term 2026</span>
          </div>
        </HeroBanner>

        {/* Library Overdue Notification */}
        {libraryData.overdueCount > 0 && (
          <AlertBanner $danger={true}>
            <div className="message">
              <BsExclamationTriangleFill />
              <span>
                <strong>Action Needed:</strong> You have {libraryData.overdueCount} library book(s) past the scheduled return date (Accrued fine: ₹{libraryData.totalLateFee}). Please return them to the library counter.
              </span>
            </div>
            <button onClick={() => navigate("/student/library")}>View Loan Details</button>
          </AlertBanner>
        )}

        {/* Metrics Grid */}
        <MetricsGrid>
          <MetricCard
            $bg="#e0e7ff"
            $color="#4f46e5"
            $badgeBg="#eef2ff"
            $badgeColor="#4338ca"
            onClick={() => navigate("/student/assignments")}
          >
            <div className="top-row">
              <div className="icon-box">
                <BsFileText />
              </div>
              <span className="badge">Active</span>
            </div>
            <div className="value">{assignmentCount}</div>
            <div className="label">Assignments & Submissions</div>
          </MetricCard>

          <MetricCard
            $bg="#dcfce7"
            $color="#16a34a"
            $badgeBg="#f0fdf4"
            $badgeColor="#15803d"
            onClick={() => navigate("/student/attendance")}
          >
            <div className="top-row">
              <div className="icon-box">
                <BsCheckCircleFill />
              </div>
              <span className="badge">Satisfactory</span>
            </div>
            <div className="value">{attendanceRate}</div>
            <div className="label">Attendance Attendance Rate</div>
          </MetricCard>

          <MetricCard
            $bg="#fef3c7"
            $color="#d97706"
            $badgeBg="#fffbeb"
            $badgeColor="#b45309"
            onClick={() => navigate("/student/library")}
          >
            <div className="top-row">
              <div className="icon-box">
                <BsBook />
              </div>
              <span className="badge">
                {libraryData.overdueCount > 0 ? "Overdue" : "In Hand"}
              </span>
            </div>
            <div className="value">{libraryData.totalAssigned}</div>
            <div className="label">Active Borrowed Books</div>
          </MetricCard>

          <MetricCard
            $bg="#ccfbf1"
            $color="#0d9488"
            $badgeBg="#f0fdfa"
            $badgeColor="#0f766e"
            onClick={() => navigate("/student/fees")}
          >
            <div className="top-row">
              <div className="icon-box">
                <BsCreditCard />
              </div>
              <span className="badge">Receipt Active</span>
            </div>
            <div className="value" style={{ fontSize: "20px" }}>{feeStatus}</div>
            <div className="label">Tuition Fee Status</div>
          </MetricCard>
        </MetricsGrid>

        {/* Quick Action Navigation Buttons */}
        <QuickActionsGrid>
          <QuickActionBtn $color="#1abc9c" onClick={() => navigate("/student/library")}>
            <BsBook className="icon" />
            <span>Apply to Borrow Books</span>
            <BsArrowRight className="arrow" />
          </QuickActionBtn>

          <QuickActionBtn $color="#3b82f6" onClick={() => navigate("/student/fees")}>
            <BsCreditCard className="icon" />
            <span>Pay Fees & Print Receipt</span>
            <BsArrowRight className="arrow" />
          </QuickActionBtn>

          <QuickActionBtn $color="#8b5cf6" onClick={() => navigate("/student/assignments")}>
            <BsFileText className="icon" />
            <span>View Assignments</span>
            <BsArrowRight className="arrow" />
          </QuickActionBtn>

          <QuickActionBtn $color="#f59e0b" onClick={() => navigate("/student/EventCalendar")}>
            <BsCalendarEvent className="icon" />
            <span>Campus Event Calendar</span>
            <BsArrowRight className="arrow" />
          </QuickActionBtn>
        </QuickActionsGrid>

        {/* Feed Columns: Announcements & Events */}
        <ColumnsGrid>
          {/* Announcements Feed */}
          <SectionCard>
            <div className="section-header">
              <h3>
                <BsMegaphone style={{ color: "#0ea5e9" }} /> Campus Announcements
              </h3>
              <button onClick={() => navigate("/student/communication")}>View All</button>
            </div>
            <FeedList>
              {announcements.length > 0 ? (
                announcements.slice(0, 4).map((item) => (
                  <FeedItem key={item._id}>
                    <div className="item-top">
                      <span className="title">{item.title || "Announcement"}</span>
                      <span className="badge">{item.category || "General"}</span>
                    </div>
                    <div className="desc">{item.announcement}</div>
                    <div className="meta">
                      <span>👤 {item.createdBy || "Administration"}</span>
                      <span>📅 {item.createdAt ? formatDateDDMMYYYY(item.createdAt) : item.date ? formatDateDDMMYYYY(item.date) : "Recent Notice"}</span>
                    </div>
                  </FeedItem>
                ))
              ) : (
                <div style={{ textAlign: "center", padding: "20px", color: "#94a3b8", fontSize: "13px" }}>
                  No active announcements for your batch at this time.
                </div>
              )}
            </FeedList>
          </SectionCard>

          {/* Upcoming Events Feed */}
          <SectionCard>
            <div className="section-header">
              <h3>
                <BsCalendarEvent style={{ color: "#ec4899" }} /> Upcoming Campus Events
              </h3>
              <button onClick={() => navigate("/student/EventCalendar")}>Full Schedule</button>
            </div>
            <FeedList>
              {events.length > 0 ? (
                events.slice(0, 4).map((ev) => (
                  <FeedItem key={ev._id}>
                    <div className="item-top">
                      <span className="title">{ev.name}</span>
                      <span className="badge" style={{ background: "#fdf2f8", color: "#db2777" }}>
                        {formatDateDDMMYYYY(ev.date)}
                      </span>
                    </div>
                    <div className="desc">{ev.description}</div>
                    <div className="meta">
                      <span>📍 {ev.location || "Campus Main Hall"}</span>
                      <span>🎯 Audience: {ev.targetAudience || "All Students"}</span>
                    </div>
                  </FeedItem>
                ))
              ) : (
                <div style={{ textAlign: "center", padding: "20px", color: "#94a3b8", fontSize: "13px" }}>
                  No upcoming campus events scheduled right now.
                </div>
              )}
            </FeedList>
          </SectionCard>
        </ColumnsGrid>
      </ContentWrapper>
    </Container>
  );
};

export default StudentDashboard;
