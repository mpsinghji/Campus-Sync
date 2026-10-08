import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Home from "./components/Home.jsx";
import ChooseUser from "./components/ChooseUser.jsx";
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
import OtpSettings from "./pages/Admin/OtpSettings.jsx";
import MasterControl from "./pages/Admin/MasterControl.jsx";
import AccountsFees from "./pages/Admin/AccountsFees.jsx";


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
import StudentDirectory from "./pages/Students/Directory.jsx";

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

import LoginOtpPage from "./components/Otp/LoginOtp.jsx";
import Payment from "./payment/payment.jsx";
import PaymentSuccess from "./payment/paymentSuccess.jsx";
import AttendanceGraph from "./components/Analysis/Attendance.jsx";
import PaymentGraph from "./components/Analysis/paymentDisplay.jsx";
import ActivityGraph from "./components/Analysis/Activitycount.jsx";
import UserAnalysis from "./components/Analysis/userAnalysis.jsx";
import AuthGuard from './components/AuthGuard';
import DashboardLayout from './components/Layout/DashboardLayout';

import SuperAdminLogin from "./pages/SuperAdmin/SuperAdminLogin.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="*" element={<ErrorPage />} />
        <Route path="/" element={<Home />} />
        <Route path="/choose-user" element={<ChooseUser />} />
        <Route path="/superadmin-login" element={<SuperAdminLogin />} />
        <Route path="/superadmin/login" element={<SuperAdminLogin />} />
        <Route path="/otp/:id" element={<LoginOtpPage />} />

        {/* Admin Portal with persistent sidebar layout & auth */}
        <Route element={<AuthGuard role="admin"><DashboardLayout role="admin" /></AuthGuard>}>
          <Route exact path="/admin/dashboard" element={<AdminDashboard />} />
          <Route exact path="/superadmin/dashboard" element={<AdminDashboard />} />
          <Route exact path="/superadmin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route exact path="/admin/user-graph" element={<UserAnalysis />} />
          <Route exact path="/admin/attendance-graph" element={<AttendanceGraph />} />
          <Route exact path="/admin/payment-graph" element={<PaymentGraph />} />
          <Route exact path="/admin/activity-graph" element={<ActivityGraph />} />
          <Route exact path="/admin/Announcement" element={<AdminAnnouncement />} />
          <Route exact path="/admin/Assignment" element={<AdminAssignment />} />
          <Route exact path="/admin/Attendance" element={<AdminAttendance />} />
          <Route exact path="/admin/Classes" element={<AdminClasses />} />
          <Route exact path="/admin/EventCalender" element={<AdminEventCalender />} />
          <Route exact path="/admin/Exam" element={<AdminExam />} />
          <Route exact path="/admin/Library" element={<AdminLibrary />} />
          <Route exact path="/admin/Performance" element={<AdminPerformance />} />
          <Route exact path="/admin/Profile" element={<AdminSettingProfile />} />
          <Route exact path="/admin/otp-settings" element={<OtpSettings />} />
          <Route exact path="/master-control" element={<MasterControl />} />
          <Route exact path="/super-admin" element={<MasterControl />} />
          <Route exact path="/admin/master-control" element={<MasterControl />} />
          <Route exact path="/admin/accounts-fees" element={<AccountsFees />} />
          <Route exact path="/admin/Students" element={<Students />} />
          <Route exact path="/admin/Teachers" element={<Teachers />} />
          <Route exact path="/admin-register" element={<AdminRegister />} />
          <Route exact path="/teacher-register" element={<TeacherRegister />} />
          <Route exact path="/student-register" element={<StudentRegister />} />
        </Route>

        {/* Student Portal with persistent sidebar layout & auth */}
        <Route element={<AuthGuard role="student"><DashboardLayout role="student" /></AuthGuard>}>
          <Route exact path="/student/dashboard" element={<StudentDashboard />} />
          <Route exact path="/student/assignments" element={<StudentAssignments />} />
          <Route exact path="/student/exams" element={<ExamSection />} />
          <Route exact path="/student/performance" element={<PerformanceSection />} />
          <Route exact path="/student/attendance" element={<AttendanceSection />} />
          <Route exact path="/student/library" element={<LibrarySection />} />
          <Route exact path="/student/fees" element={<Fees />} />
          <Route exact path="/student/communication" element={<AnnouncementSection />} />
          <Route exact path="/student/EventCalendar" element={<StudentEventSection />} />
          <Route exact path="/student/directory" element={<StudentDirectory />} />
          <Route exact path="/student/settings" element={<ProfileSection />} />
        </Route>

        {/* Standalone Student Routes without persistent sidebar */}
        <Route path="/payment" element={<AuthGuard role="student"><Payment /></AuthGuard>} />
        <Route path="/payment-success" element={<AuthGuard role="student"><PaymentSuccess /></AuthGuard>} />

        {/* Teacher Portal with persistent sidebar layout & auth */}
        <Route element={<AuthGuard role="teacher"><DashboardLayout role="teacher" /></AuthGuard>}>
          <Route exact path="/teacher/dashboard" element={<TeacherDashboard />} />
          <Route exact path="/teacher/classes" element={<ClassSection />} />
          <Route exact path="/teacher/students" element={<StudentSection />} />
          <Route exact path="/teacher/assignments" element={<AssignmentSection />} />
          <Route exact path="/teacher/exams" element={<CheckExamSection />} />
          <Route exact path="/teacher/performance" element={<CheckPerformanceSection />} />
          <Route exact path="/teacher/attendance" element={<CheckAttendanceSection />} />
          <Route exact path="/teacher/communication" element={<CheckAnnouncementSection />} />
          <Route exact path="/teacher/events" element={<EventSection />} />
          <Route exact path="/teacher/library" element={<AdminLibrary />} />
          <Route exact path="/teacher/settings" element={<TeacherProfileSection />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
