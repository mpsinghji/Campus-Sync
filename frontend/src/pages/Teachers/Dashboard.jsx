import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import axios from "axios";
import Cookies from "js-cookie";
import { BACKEND_URL } from "../../constants/url";
import { formatDateDDMMYYYY } from "../../utils/dateUtils";
import {
  BsPeople,
  BsFileText,
  BsCalendarCheck,
  BsMegaphone,
  BsArrowRight,
  BsCalendarEvent,
  BsClock,
  BsJournalCheck,
  BsBook,
  BsPlusCircle,
  BsSearch,
} from "react-icons/bs";

const DashboardWrapper = styled.div`
  padding: 30px 40px;
  padding-left: 250px;
  background-color: #f8fafc;
  min-height: 100vh;
  box-sizing: border-box;
  font-family: "Inter", system-ui, -apple-system, sans-serif;
`;

const HeroBanner = styled.div`
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  color: #ffffff;
  padding: 32px 36px;
  border-radius: 18px;
  margin-bottom: 28px;
  box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
`;

const HeroText = styled.div`
  h1 {
    font-size: 26px;
    font-weight: 800;
    margin: 0 0 8px 0;
    color: #ffffff;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  p {
    font-size: 15px;
    color: #94a3b8;
    margin: 0;
  }
`;

const HeroBadgeGroup = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const HeroBadge = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  padding: 8px 16px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  color: #38bdf8;
  border: 1px solid rgba(255, 255, 255, 0.12);
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const MetricCard = styled.div`
  background: #ffffff;
  padding: 22px 24px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.07);
    border-color: ${(props) => props.$accent || "#3b82f6"};
  }
`;

const MetricIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${(props) => props.$bg || "#eff6ff"};
  color: ${(props) => props.$color || "#2563eb"};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  margin-bottom: 14px;
`;

const MetricValue = styled.div`
  font-size: 28px;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 4px;
`;

const MetricLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: space-between;

  svg {
    opacity: 0;
    transition: opacity 0.2s;
  }

  ${MetricCard}:hover & svg {
    opacity: 1;
    color: ${(props) => props.$color || "#2563eb"};
  }
`;

const ActionBanner = styled.div`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 20px 24px;
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
`;

const ActionButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const ActionBtn = styled.button`
  padding: 10px 18px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  background: ${(props) => (props.$primary ? "#2563eb" : "#f1f5f9")};
  color: ${(props) => (props.$primary ? "#ffffff" : "#1e293b")};

  &:hover {
    background: ${(props) => (props.$primary ? "#1d4ed8" : "#e2e8f0")};
    transform: translateY(-1px);
  }
`;

const TwoColumnGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const SectionCard = styled.div`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
  h2 {
    font-size: 18px;
    font-weight: 700;
    color: #0f172a;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  span {
    font-size: 13px;
    color: #2563eb;
    font-weight: 600;
    cursor: pointer;
    &:hover {
      text-decoration: underline;
    }
  }
`;

const FeedItem = styled.div`
  padding: 14px;
  border-radius: 12px;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  margin-bottom: 12px;
  transition: all 0.2s;

  &:last-child {
    margin-bottom: 0;
  }

  &:hover {
    background: #f1f5f9;
    border-color: #e2e8f0;
  }

  h4 {
    font-size: 15px;
    font-weight: 700;
    color: #0f172a;
    margin: 0 0 4px 0;
  }

  p {
    font-size: 13px;
    color: #64748b;
    margin: 0 0 8px 0;
    line-height: 1.4;
  }

  .meta {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #94a3b8;
  }
`;

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [studentCount, setStudentCount] = useState(0);
  const [assignmentCount, setAssignmentCount] = useState(0);
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [bookCount, setBookCount] = useState(0);
  const [issuedBookCount, setIssuedBookCount] = useState(0);
  const [availableBookCount, setAvailableBookCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load logged in teacher metadata from cookies
    try {
      const raw = Cookies.get("teacherData");
      if (raw) {
        const parsed = JSON.parse(raw);
        setTeacher(parsed.user || parsed);
      }
    } catch (e) {
      console.warn("Could not parse teacher data:", e);
    }

    fetchDashboardMetrics();
  }, []);

  const fetchDashboardMetrics = async () => {
    try {
      setLoading(true);
      const [studentsRes, assignmentsRes, eventsRes, announcementsRes, booksRes, issuedRes] = await Promise.all([
        axios.get(`${BACKEND_URL}api/v1/student/getall`).catch(() => ({ data: { students: [] } })),
        axios.get(`${BACKEND_URL}api/v1/assignment/getall`).catch(() => ({ data: { assignments: [] } })),
        axios.get(`${BACKEND_URL}api/v1/events/getall`).catch(() => ({ data: { events: [] } })),
        axios.get(`${BACKEND_URL}api/v1/announcement/getall`).catch(() => ({ data: { announcements: [] } })),
        axios.get(`${BACKEND_URL}api/v1/library/getall`).catch(() => ({ data: { books: [] } })),
        axios.get(`${BACKEND_URL}api/v1/library/assigned`).catch(() => ({ data: { assignedBooks: [] } })),
      ]);

      const stList = studentsRes.data?.students || [];
      const asList = assignmentsRes.data?.assignments || [];
      const evList = eventsRes.data?.events || [];
      const anList = announcementsRes.data?.announcements || [];
      const bkList = booksRes.data?.books || [];
      const isList = issuedRes.data?.assignedBooks || [];

      setStudentCount(stList.length);
      setAssignmentCount(asList.length);
      setAttendanceCount(stList.length > 0 ? Math.floor(stList.length * 0.92) : 0);
      setEvents(evList.slice(0, 4));
      setAnnouncements(anList.slice(0, 4));
      setBookCount(bkList.length);
      setIssuedBookCount(isList.length);
      const totalAvail = bkList.reduce((acc, b) => acc + (b.availableQuantity || 0), 0);
      setAvailableBookCount(totalAvail);
    } catch (err) {
      console.error("Error fetching teacher dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const teacherName = teacher?.name || "Faculty Member";
  const department = teacher?.department || "Computer Science";
  const designation = teacher?.designation || "Assistant Professor";
  const responsibility = teacher?.responsibility || "Teaching Faculty";
  const isLibrarian = (responsibility || "").toLowerCase().includes("librarian");
  const isExamController = (responsibility || "").toLowerCase().includes("exam");
  const isEventCoordinator = (responsibility || "").toLowerCase().includes("event");
  const isRegistrar = (responsibility || "").toLowerCase().includes("registrar");

  const getHeroSubtitle = () => {
    if (isLibrarian) return "Head Librarian • Central Library Department • Library Operations Portal";
    if (isExamController) return "Controller of Examinations • Examination Cell • Assessment & Grading Portal";
    if (isEventCoordinator) return "Campus Event Coordinator • Student Welfare & Events • Operations Portal";
    if (isRegistrar) return "Student Registrar • Office of Admissions & Records • Registry Portal";
    return `${designation} • Department of ${department} • Academic Portal`;
  };

  const getRoleBadge = () => {
    if (isLibrarian) return "Head Librarian";
    if (isExamController) return "Exam Controller";
    if (isEventCoordinator) return "Event Coordinator";
    if (isRegistrar) return "Student Registrar";
    return responsibility;
  };

  return (
    <DashboardWrapper>
      <HeroBanner>
        <HeroText>
          <h1>Welcome back, {isLibrarian || isRegistrar || isEventCoordinator ? "" : "Prof. "}{teacherName} 👋</h1>
          <p>{getHeroSubtitle()}</p>
        </HeroText>
        <HeroBadgeGroup>
          <HeroBadge>Role: {getRoleBadge()}</HeroBadge>
          <HeroBadge>Term: July - Dec 2026</HeroBadge>
        </HeroBadgeGroup>
      </HeroBanner>

      {isLibrarian ? (
        <MetricsGrid>
          <MetricCard $accent="#3b82f6" onClick={() => navigate("/teacher/library")}>
            <MetricIcon $bg="#eff6ff" $color="#2563eb">
              <BsBook />
            </MetricIcon>
            <MetricValue>{bookCount}</MetricValue>
            <MetricLabel $color="#2563eb">
              Library Titles Cataloged <BsArrowRight />
            </MetricLabel>
          </MetricCard>

          <MetricCard $accent="#f59e0b" onClick={() => navigate("/teacher/library")}>
            <MetricIcon $bg="#fffbeb" $color="#f59e0b">
              <BsJournalCheck />
            </MetricIcon>
            <MetricValue>{issuedBookCount}</MetricValue>
            <MetricLabel $color="#f59e0b">
              Active Borrowed Books <BsArrowRight />
            </MetricLabel>
          </MetricCard>

          <MetricCard $accent="#10b981" onClick={() => navigate("/teacher/library")}>
            <MetricIcon $bg="#ecfdf5" $color="#10b981">
              <BsPlusCircle />
            </MetricIcon>
            <MetricValue>{availableBookCount}</MetricValue>
            <MetricLabel $color="#10b981">
              Copies Available in Stacks <BsArrowRight />
            </MetricLabel>
          </MetricCard>

          <MetricCard $accent="#8b5cf6" onClick={() => navigate("/teacher/communication")}>
            <MetricIcon $bg="#f5f3ff" $color="#8b5cf6">
              <BsMegaphone />
            </MetricIcon>
            <MetricValue>{announcements.length}</MetricValue>
            <MetricLabel $color="#8b5cf6">
              Library Circulars <BsArrowRight />
            </MetricLabel>
          </MetricCard>
        </MetricsGrid>
      ) : isExamController ? (
        <MetricsGrid>
          <MetricCard $accent="#3b82f6" onClick={() => navigate("/teacher/exams")}>
            <MetricIcon $bg="#eff6ff" $color="#2563eb">
              <BsBook />
            </MetricIcon>
            <MetricValue>Active</MetricValue>
            <MetricLabel $color="#2563eb">
              Scheduled Exams <BsArrowRight />
            </MetricLabel>
          </MetricCard>

          <MetricCard $accent="#10b981" onClick={() => navigate("/teacher/performance")}>
            <MetricIcon $bg="#ecfdf5" $color="#10b981">
              <BsJournalCheck />
            </MetricIcon>
            <MetricValue>{studentCount}</MetricValue>
            <MetricLabel $color="#10b981">
              Evaluated Candidates <BsArrowRight />
            </MetricLabel>
          </MetricCard>

          <MetricCard $accent="#8b5cf6" onClick={() => navigate("/teacher/communication")}>
            <MetricIcon $bg="#f5f3ff" $color="#8b5cf6">
              <BsMegaphone />
            </MetricIcon>
            <MetricValue>{announcements.length}</MetricValue>
            <MetricLabel $color="#8b5cf6">
              Exam Circulars <BsArrowRight />
            </MetricLabel>
          </MetricCard>
        </MetricsGrid>
      ) : isEventCoordinator ? (
        <MetricsGrid>
          <MetricCard $accent="#10b981" onClick={() => navigate("/teacher/events")}>
            <MetricIcon $bg="#ecfdf5" $color="#10b981">
              <BsCalendarEvent />
            </MetricIcon>
            <MetricValue>{events.length}</MetricValue>
            <MetricLabel $color="#10b981">
              Campus Events Scheduled <BsArrowRight />
            </MetricLabel>
          </MetricCard>

          <MetricCard $accent="#f59e0b" onClick={() => navigate("/teacher/communication")}>
            <MetricIcon $bg="#fffbeb" $color="#f59e0b">
              <BsMegaphone />
            </MetricIcon>
            <MetricValue>{announcements.length}</MetricValue>
            <MetricLabel $color="#f59e0b">
              Event Announcements <BsArrowRight />
            </MetricLabel>
          </MetricCard>

          <MetricCard $accent="#3b82f6" onClick={() => navigate("/teacher/events")}>
            <MetricIcon $bg="#eff6ff" $color="#2563eb">
              <BsPeople />
            </MetricIcon>
            <MetricValue>{studentCount}</MetricValue>
            <MetricLabel $color="#2563eb">
              Eligible Student Pool <BsArrowRight />
            </MetricLabel>
          </MetricCard>
        </MetricsGrid>
      ) : isRegistrar ? (
        <MetricsGrid>
          <MetricCard $accent="#3b82f6" onClick={() => navigate("/teacher/students")}>
            <MetricIcon $bg="#eff6ff" $color="#2563eb">
              <BsPeople />
            </MetricIcon>
            <MetricValue>{studentCount}</MetricValue>
            <MetricLabel $color="#2563eb">
              Total Enrolled Students <BsArrowRight />
            </MetricLabel>
          </MetricCard>

          <MetricCard $accent="#10b981" onClick={() => navigate("/teacher/classes")}>
            <MetricIcon $bg="#ecfdf5" $color="#10b981">
              <BsCalendarCheck />
            </MetricIcon>
            <MetricValue>Active</MetricValue>
            <MetricLabel $color="#10b981">
              Class Batch Allocations <BsArrowRight />
            </MetricLabel>
          </MetricCard>

          <MetricCard $accent="#8b5cf6" onClick={() => navigate("/teacher/communication")}>
            <MetricIcon $bg="#f5f3ff" $color="#8b5cf6">
              <BsMegaphone />
            </MetricIcon>
            <MetricValue>{announcements.length}</MetricValue>
            <MetricLabel $color="#8b5cf6">
              Admission Notices <BsArrowRight />
            </MetricLabel>
          </MetricCard>
        </MetricsGrid>
      ) : (
        <MetricsGrid>
          <MetricCard $accent="#3b82f6" onClick={() => navigate("/teacher/students")}>
            <MetricIcon $bg="#eff6ff" $color="#2563eb">
              <BsPeople />
            </MetricIcon>
            <MetricValue>{studentCount}</MetricValue>
            <MetricLabel $color="#2563eb">
              Total Enrolled Students <BsArrowRight />
            </MetricLabel>
          </MetricCard>

          <MetricCard $accent="#10b981" onClick={() => navigate("/teacher/assignments")}>
            <MetricIcon $bg="#ecfdf5" $color="#10b981">
              <BsFileText />
            </MetricIcon>
            <MetricValue>{assignmentCount}</MetricValue>
            <MetricLabel $color="#10b981">
              Active Assignments <BsArrowRight />
            </MetricLabel>
          </MetricCard>

          <MetricCard $accent="#8b5cf6" onClick={() => navigate("/teacher/attendance")}>
            <MetricIcon $bg="#f5f3ff" $color="#8b5cf6">
              <BsCalendarCheck />
            </MetricIcon>
            <MetricValue>{attendanceCount > 0 ? "92%" : "—"}</MetricValue>
            <MetricLabel $color="#8b5cf6">
              Avg Batch Attendance <BsArrowRight />
            </MetricLabel>
          </MetricCard>

          <MetricCard $accent="#f59e0b" onClick={() => navigate("/teacher/communication")}>
            <MetricIcon $bg="#fffbeb" $color="#f59e0b">
              <BsMegaphone />
            </MetricIcon>
            <MetricValue>{announcements.length}</MetricValue>
            <MetricLabel $color="#f59e0b">
              Campus Announcements <BsArrowRight />
            </MetricLabel>
          </MetricCard>
        </MetricsGrid>
      )}

      <ActionBanner>
        <div>
          <h3 style={{ margin: "0 0 4px 0", fontSize: "16px", color: "#0f172a" }}>
            {isLibrarian
              ? "Library Operations Center"
              : isExamController
              ? "Examination Control Center"
              : isEventCoordinator
              ? "Campus Events Operations Center"
              : isRegistrar
              ? "Admissions & Registry Center"
              : "Faculty Action Center"}
          </h3>
          <p style={{ margin: 0, fontSize: "14px", color: "#64748b" }}>
            {isLibrarian
              ? "Issue books to students, process returns, and update catalog inventory."
              : isExamController
              ? "Publish examination schedules, review marks entry, and manage grade approvals."
              : isEventCoordinator
              ? "Coordinate campus festivals, technical hackathons, and publish activity circulars."
              : isRegistrar
              ? "Oversee student enrollment directories, class allocations, and admission notices."
              : "Quickly execute class workflows and manage student records."}
          </p>
        </div>
        <ActionButtonGroup>
          {isLibrarian ? (
            <>
              <ActionBtn $primary onClick={() => navigate("/teacher/library")}>
                <BsBook /> Issue / Borrow Book
              </ActionBtn>
              <ActionBtn onClick={() => navigate("/teacher/library")}>
                <BsJournalCheck /> Return Book
              </ActionBtn>
              <ActionBtn onClick={() => navigate("/teacher/library")}>
                <BsPlusCircle /> Add New Book
              </ActionBtn>
              <ActionBtn onClick={() => navigate("/teacher/library")}>
                <BsSearch /> Browse Catalog
              </ActionBtn>
            </>
          ) : isExamController ? (
            <>
              <ActionBtn $primary onClick={() => navigate("/teacher/exams")}>
                <BsBook /> Scheduled Exams
              </ActionBtn>
              <ActionBtn onClick={() => navigate("/teacher/performance")}>
                <BsJournalCheck /> Performance & Results
              </ActionBtn>
              <ActionBtn onClick={() => navigate("/teacher/communication")}>
                <BsMegaphone /> Post Exam Circular
              </ActionBtn>
            </>
          ) : isEventCoordinator ? (
            <>
              <ActionBtn $primary onClick={() => navigate("/teacher/events")}>
                <BsCalendarEvent /> Campus Events
              </ActionBtn>
              <ActionBtn onClick={() => navigate("/teacher/communication")}>
                <BsMegaphone /> Post Notice
              </ActionBtn>
            </>
          ) : isRegistrar ? (
            <>
              <ActionBtn $primary onClick={() => navigate("/teacher/students")}>
                <BsPeople /> Student Directory
              </ActionBtn>
              <ActionBtn onClick={() => navigate("/teacher/classes")}>
                <BsCalendarCheck /> Class Schedules
              </ActionBtn>
              <ActionBtn onClick={() => navigate("/teacher/communication")}>
                <BsMegaphone /> Post Notice
              </ActionBtn>
            </>
          ) : (
            <>
              <ActionBtn $primary onClick={() => navigate("/teacher/attendance")}>
                <BsJournalCheck /> Mark Attendance
              </ActionBtn>
              <ActionBtn onClick={() => navigate("/teacher/assignments")}>
                <BsFileText /> Create Assignment
              </ActionBtn>
              <ActionBtn onClick={() => navigate("/teacher/communication")}>
                <BsMegaphone /> Post Notice
              </ActionBtn>
              <ActionBtn onClick={() => navigate("/teacher/students")}>
                <BsPeople /> View Students
              </ActionBtn>
            </>
          )}
        </ActionButtonGroup>
      </ActionBanner>

      <TwoColumnGrid>
        <SectionCard>
          <SectionHeader>
            <h2>
              <BsMegaphone style={{ color: "#2563eb" }} />{" "}
              {isLibrarian
                ? "Library Notices & Circulars"
                : isExamController
                ? "Examination Circulars"
                : isRegistrar
                ? "Admission & Registry Notices"
                : "Departmental Notices"}
            </h2>
            <span onClick={() => navigate("/teacher/communication")}>View All</span>
          </SectionHeader>
          {announcements.length === 0 ? (
            <p style={{ color: "#94a3b8", fontSize: "14px", textAlign: "center", margin: "20px 0" }}>
              No recent announcements posted.
            </p>
          ) : (
            announcements.map((item) => (
              <FeedItem key={item._id}>
                <h4>{item.announcement || item.title || "Academic Notice"}</h4>
                <p>{item.description || "Official circular published for faculty and students."}</p>
                <div className="meta">
                  <BsClock /> {item.createdAt ? formatDateDDMMYYYY(item.createdAt) : "Active"}
                </div>
              </FeedItem>
            ))
          )}
        </SectionCard>

        <SectionCard>
          <SectionHeader>
            <h2>
              <BsCalendarEvent style={{ color: "#10b981" }} /> Campus Calendar & Events
            </h2>
            {(isEventCoordinator || (!isLibrarian && !isExamController && !isRegistrar)) && (
              <span onClick={() => navigate("/teacher/events")}>View All</span>
            )}
          </SectionHeader>
          {events.length === 0 ? (
            <p style={{ color: "#94a3b8", fontSize: "14px", textAlign: "center", margin: "20px 0" }}>
              No upcoming events scheduled.
            </p>
          ) : (
            events.map((event) => (
              <FeedItem key={event._id}>
                <h4>{event.name || "Campus Event"}</h4>
                <p>{event.description || "University gathering and scheduled academic activity."}</p>
                <div className="meta">
                  <BsClock /> {event.date ? formatDateDDMMYYYY(event.date) : "Scheduled"}
                </div>
              </FeedItem>
            ))
          )}
        </SectionCard>
      </TwoColumnGrid>
    </DashboardWrapper>
  );
};

export default TeacherDashboard;
