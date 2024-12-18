import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
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

function App() {
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
        <Route exact path="/admin/dashboard" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route exact path="/student/dashboard" element={<ProtectedRoute roles={['student']}><StudentDashboard /></ProtectedRoute>} />
        <Route exact path="/teacher/dashboard" element={<ProtectedRoute roles={['teacher']}><TeacherDashboard /></ProtectedRoute>} />

        {/* Admin Section */}

        <Route path="/admin/user-graph" element={<ProtectedRoute roles={['admin']}><UserAnalysis /> </ProtectedRoute>} />
        <Route path="/admin/attendance-graph" element={<ProtectedRoute roles={['admin']}> <AttendanceGraph /> </ProtectedRoute> } />
        <Route path="/admin/payment-graph" element={<ProtectedRoute roles={['admin']}><PaymentGraph /> </ProtectedRoute>} />
        <Route path="/admin/activity-graph" element={<ProtectedRoute roles={['admin']}><ActivityGraph /> </ProtectedRoute> } />
        <Route exact path="/admin/Announcement" element={<ProtectedRoute roles={['admin']}><AdminAnnouncement /></ProtectedRoute>} />
        <Route exact path="/admin/Assignment" element={<ProtectedRoute roles={['admin']}><AdminAssignment /></ProtectedRoute>} />
        <Route exact path="/admin/Attendance" element={<ProtectedRoute roles={['admin']}><AdminAttendance /></ProtectedRoute>} />
        <Route exact path="/admin/Classes" element={<ProtectedRoute roles={['admin']}><AdminClasses /></ProtectedRoute>} />
        <Route exact path="/admin/EventCalender" element={<ProtectedRoute roles={['admin']}><AdminEventCalender /></ProtectedRoute>} />
        <Route exact path="/admin/Exam" element={<ProtectedRoute roles={['admin']}><AdminExam /></ProtectedRoute>} />
        <Route exact path="/admin/Library" element={<ProtectedRoute roles={['admin']}><AdminLibrary /></ProtectedRoute>} />
        <Route exact path="/admin/Performance" element={<ProtectedRoute roles={['admin']}><AdminPerformance /></ProtectedRoute>} />
        <Route exact path="/admin/Profile" element={<ProtectedRoute roles={['admin']}><AdminSettingProfile /></ProtectedRoute>} />
        <Route exact path="/admin/Students" element={<ProtectedRoute roles={['admin']}><Students /></ProtectedRoute>} />
        <Route exact path="/admin/Teachers" element={<ProtectedRoute roles={['admin']}><Teachers /></ProtectedRoute>} />

        {/* Student Dashboard routes */}
        <Route exact path="/student/assignments" element={<ProtectedRoute roles={['student']}><StudentAssignments /></ProtectedRoute>} />
        <Route exact path="/student/exams" element={<ProtectedRoute roles={['student']}><ExamSection /></ProtectedRoute>} />
        <Route exact path="/student/performance" element={<ProtectedRoute roles={['student']}><PerformanceSection /></ProtectedRoute>} />
        <Route exact path="/student/attendance" element={<ProtectedRoute roles={['student']}><AttendanceSection /></ProtectedRoute>} />
        <Route exact path="/student/library" element={<ProtectedRoute roles={['student']}><LibrarySection /></ProtectedRoute>} />
        <Route exact path="/student/fees" element={<ProtectedRoute roles={['student']}><Fees /></ProtectedRoute>} />
        <Route exact path="/student/communication" element={<ProtectedRoute roles={['student']}><AnnouncementSection /></ProtectedRoute>} />
        <Route exact path="/student/EventCalendar" element={<ProtectedRoute roles={['student']}><StudentEventSection /></ProtectedRoute>} />
        <Route exact path="/student/settings" element={<ProtectedRoute roles={['student']}><ProfileSection /></ProtectedRoute>} />
        <Route path="/payment" element={<ProtectedRoute roles={['student']}><Payment /> </ProtectedRoute>} />
        <Route path="/payment-success" element={<ProtectedRoute roles={['student']}> <PaymentSuccess /> </ProtectedRoute>} />

        {/* Teachers sections here */}
        <Route exact path="/teacher/classes" element={<ProtectedRoute roles={['teacher']}><ClassSection /></ProtectedRoute>} />
        <Route exact path="/teacher/students" element={<ProtectedRoute roles={['teacher']}><StudentSection /></ProtectedRoute>} />
        <Route exact path="/teacher/assignments" element={<ProtectedRoute roles={['teacher']}><AssignmentSection /></ProtectedRoute>} />
        <Route exact path="/teacher/exams" element={<ProtectedRoute roles={['teacher']}><CheckExamSection /></ProtectedRoute>} />
        <Route exact path="/teacher/performance" element={<ProtectedRoute roles={['teacher']}><CheckPerformanceSection /></ProtectedRoute>} />
        <Route exact path="/teacher/attendance" element={<ProtectedRoute roles={['teacher']}><CheckAttendanceSection /></ProtectedRoute>} />
        <Route exact path="/teacher/communication" element={<ProtectedRoute roles={['teacher']}><CheckAnnouncementSection /></ProtectedRoute>} />
        <Route exact path="/teacher/events" element={<ProtectedRoute roles={['teacher']}><EventSection /></ProtectedRoute>} />
        <Route exact path="/teacher/settings" element={<ProtectedRoute roles={['teacher']}><TeacherProfileSection /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
