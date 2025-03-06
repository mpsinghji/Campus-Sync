import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useDispatch } from "react-redux";
import { checkAdminAuth } from "./redux/Actions/adminActions";
import { checkStudentAuth } from "./redux/Actions/studentActions";
import { checkTeacherAuth } from "./redux/Actions/teacherActions";
import Home from "./components/Home.jsx";
import ChooseUser from "./components/ChooseUser.jsx";
// import AboutMe from "./components/AboutMe.jsx";
import ErrorPage from "./components/Error/errorPage.jsx";

import AdminRegister from "./components/AdminRegister.jsx";
import StudentRegister from "./components/StudentRegister.jsx";
import TeacherRegister from "./components/TeacherRegister.jsx";

import AdminDashboard from "./pages/Admin/Dashboard.jsx";
import AdminAnnouncement from "./pages/Admin/Announcement.jsx";
import AdminAssignment from "./pages/Admin/Assignment.jsx";
import AdminAttendance from "./pages/Admin/Attendance.jsx";
import AdminClasses from "./pages/Admin/Classes.jsx";
import AdminEventCalender from "./pages/Admin/EventCalender.jsx";
import AdminExam from "./pages/Admin/Exam.jsx";
import AdminLibrary from "./pages/Admin/Library.jsx";
import AdminPerformance from "./pages/Admin/Performance.jsx";
import AdminSettingProfile from "./pages/Admin/SettingsProfile.jsx";
import Students from "./pages/Admin/Students.jsx";
import Teachers from "./pages/Admin/Teachers.jsx";

import StudentDashboard from "./pages/Students/Dashboard.jsx";
import StudentAssignments from "./pages/Students/Assignment.jsx";
import ExamSection from "./pages/Students/Exam.jsx";
import PerformanceSection from "./pages/Students/Performance.jsx";
import AttendanceSection from "./pages/Students/Attendance.jsx";
import LibrarySection from "./pages/Students/Library.jsx";
import Fees from "./pages/Students/Fees.jsx";
import AnnouncementSection from "./pages/Students/Announcement.jsx";
import ProfileSection from "./pages/Students/Profile.jsx";
import StudentEventSection from "./pages/Students/EventCalendar.jsx";

import TeacherDashboard from "../src/pages/Teachers/Dashboard";
import ClassSection from "../src/pages/Teachers/Classes";
import StudentSection from "../src/pages/Teachers/Students";
import CheckPerformanceSection from "../src/pages/Teachers/Performance";
import EventSection from "../src/pages/Teachers/Events";
import TeacherProfileSection from "../src/pages/Teachers/Profile";
import CheckAnnouncementSection from "../src/pages/Teachers/Announcement";
import AssignmentSection from "../src/pages/Teachers/Assignments";
import CheckAttendanceSection from "../src/pages/Teachers/Attendance";
import CheckExamSection from "../src/pages/Teachers/Exams";

import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import LoginOtpPage from "./components/Otp/LoginOtp.jsx";
import Payment from "./payment/payment.jsx";
import PaymentSuccess from "./payment/paymentSuccess.jsx";
import AttendanceGraph from "./components/Analysis/Attendance.jsx";
import PaymentGraph from "./components/Analysis/paymentDisplay.jsx";
import ActivityGraph from "./components/Analysis/Activitycount.jsx";
import UserAnalysis from "./components/Analysis/userAnalysis.jsx";
import AuthGuard from './components/AuthGuard';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Check authentication for all user types on app initialization
    dispatch(checkAdminAuth());
    dispatch(checkStudentAuth());
    dispatch(checkTeacherAuth());
  }, [dispatch]);

  return (
    <Router>
      <Routes>
        <Route path="*" element={<ErrorPage />} />
        <Route path="/" element={<Home />} />
        <Route path="/choose-user" element={<ChooseUser />} />
        {/* <Route path="/about-me" element={<AboutMe />} /> */}


        {/* <Route path="/login/resend/:id" element={<LoginOtpPage />} /> */}
        <Route path="/otp/:id" element={<LoginOtpPage />} />

        {/* Add the Admin Register route here */}
        <Route exact path="/admin-register" element={<AdminRegister />} />
        <Route exact path="/teacher-register" element={<TeacherRegister />} />
        <Route exact path="/student-register" element={<StudentRegister />} />

        {/* All dashboard routes */}
        <Route exact path="/admin/dashboard" element={<AuthGuard><AdminDashboard /></AuthGuard>} />
        <Route exact path="/student/dashboard" element={<AuthGuard><StudentDashboard /></AuthGuard>} />
        <Route exact path="/teacher/dashboard" element={<AuthGuard><TeacherDashboard /></AuthGuard>} />

        {/* Admin Section */}

        <Route path="/admin/user-graph" element={<AuthGuard><UserAnalysis /></AuthGuard>} />
        <Route path="/admin/attendance-graph" element={<AuthGuard><AttendanceGraph /></AuthGuard>} />
        <Route path="/admin/payment-graph" element={<AuthGuard><PaymentGraph /></AuthGuard>} />
        <Route path="/admin/activity-graph" element={<AuthGuard><ActivityGraph /></AuthGuard>} />
        <Route exact path="/admin/Announcement" element={<AuthGuard><AdminAnnouncement /></AuthGuard>} />
        <Route exact path="/admin/Assignment" element={<AuthGuard><AdminAssignment /></AuthGuard>} />
        <Route exact path="/admin/Attendance" element={<AuthGuard><AdminAttendance /></AuthGuard>} />
        <Route exact path="/admin/Classes" element={<AuthGuard><AdminClasses /></AuthGuard>} />
        <Route exact path="/admin/EventCalender" element={<AuthGuard><AdminEventCalender /></AuthGuard>} />
        <Route exact path="/admin/Exam" element={<AuthGuard><AdminExam /></AuthGuard>} />
        <Route exact path="/admin/Library" element={<AuthGuard><AdminLibrary /></AuthGuard>} />
        <Route exact path="/admin/Performance" element={<AuthGuard><AdminPerformance /></AuthGuard>} />
        <Route exact path="/admin/Profile" element={<AuthGuard><AdminSettingProfile /></AuthGuard>} />
        <Route exact path="/admin/Students" element={<AuthGuard><Students /></AuthGuard>} />
        <Route exact path="/admin/Teachers" element={<AuthGuard><Teachers /></AuthGuard>} />

        {/* Student Dashboard routes */}
        <Route exact path="/student/assignments" element={<AuthGuard><StudentAssignments /></AuthGuard>} />
        <Route exact path="/student/exams" element={<AuthGuard><ExamSection /></AuthGuard>} />
        <Route exact path="/student/performance" element={<AuthGuard><PerformanceSection /></AuthGuard>} />
        <Route exact path="/student/attendance" element={<AuthGuard><AttendanceSection /></AuthGuard>} />
        <Route exact path="/student/library" element={<AuthGuard><LibrarySection /></AuthGuard>} />
        <Route exact path="/student/fees" element={<AuthGuard><Fees /></AuthGuard>} />
        <Route exact path="/student/communication" element={<AuthGuard><AnnouncementSection /></AuthGuard>} />
        <Route exact path="/student/EventCalendar" element={<AuthGuard><StudentEventSection /></AuthGuard>} />
        <Route exact path="/student/settings" element={<AuthGuard><ProfileSection /></AuthGuard>} />
        <Route path="/payment" element={<AuthGuard><Payment /></AuthGuard>} />
        <Route path="/payment-success" element={<AuthGuard><PaymentSuccess /></AuthGuard>} />

        {/* Teachers sections here */}
        <Route exact path="/teacher/classes" element={<AuthGuard><ClassSection /></AuthGuard>} />
        <Route exact path="/teacher/students" element={<AuthGuard><StudentSection /></AuthGuard>} />
        <Route exact path="/teacher/assignments" element={<AuthGuard><AssignmentSection /></AuthGuard>} />
        <Route exact path="/teacher/exams" element={<AuthGuard><CheckExamSection /></AuthGuard>} />
        <Route exact path="/teacher/performance" element={<AuthGuard><CheckPerformanceSection /></AuthGuard>} />
        <Route exact path="/teacher/attendance" element={<AuthGuard><CheckAttendanceSection /></AuthGuard>} />
        <Route exact path="/teacher/communication" element={<AuthGuard><CheckAnnouncementSection /></AuthGuard>} />
        <Route exact path="/teacher/events" element={<AuthGuard><EventSection /></AuthGuard>} />
        <Route exact path="/teacher/settings" element={<AuthGuard><TeacherProfileSection /></AuthGuard>} />
      </Routes>
    </Router>
  );
}

export default App;
