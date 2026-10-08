import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { checkAdminAuth } from '../redux/Actions/adminActions';
import { checkStudentAuth } from '../redux/Actions/studentActions';
import { checkTeacherAuth } from '../redux/Actions/teacherActions';
import Loading from './Loading/loading';
import Cookies from 'js-cookie';

// Keep in-memory cache of verified sessions so internal tab navigation is instant
const verifiedRoles = {
  admin: false,
  student: false,
  teacher: false,
};

export const resetAuthVerification = () => {
  verifiedRoles.admin = false;
  verifiedRoles.student = false;
  verifiedRoles.teacher = false;
};

const getRoleFromPath = (pathname) => {
  const p = pathname.toLowerCase();
  if (
    p.startsWith('/admin') ||
    p.startsWith('/master-control') ||
    p.startsWith('/super-admin') ||
    p.includes('admin-register') ||
    p.includes('student-register') ||
    p.includes('teacher-register')
  ) {
    return 'admin';
  }
  if (p.startsWith('/student') || p.startsWith('/payment')) return 'student';
  if (p.startsWith('/teacher')) return 'teacher';
  return null;
};

const AuthGuard = ({ role: propRole, children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const path = location.pathname;

  const currentRole = propRole || getRoleFromPath(path);

  // If already verified for this role in memory and cookie exists, do not show loading screen
  const isAlreadyVerified = Boolean(
    currentRole &&
      verifiedRoles[currentRole] &&
      Cookies.get(`${currentRole}Data`)
  );

  const [isLoading, setIsLoading] = useState(!isAlreadyVerified);

  useEffect(() => {
    const checkAuth = async () => {
      const targetRole = propRole || getRoleFromPath(path);

      if (!targetRole) {
        setIsLoading(false);
        return;
      }

      try {
        if (targetRole === 'admin') {
          const isMasterRoute =
            path.toLowerCase().startsWith('/master-control') ||
            path.toLowerCase().startsWith('/super-admin') ||
            path.toLowerCase().startsWith('/admin/master-control');

          const adminData = Cookies.get('adminData');

          if (!adminData) {
            verifiedRoles.admin = false;
            navigate(isMasterRoute ? '/superadmin-login' : '/choose-user', { replace: true });
            return;
          }

          let parsedAdmin = null;
          try {
            parsedAdmin = JSON.parse(adminData);
          } catch {}

          const isSuperAdmin =
            parsedAdmin?.isSuperAdmin === true ||
            parsedAdmin?.email?.toLowerCase().trim() === 'admin@campus-sync.com';

          // Strictly prevent non-superadmin from entering Master Control or OTP Settings
          if (isMasterRoute && !isSuperAdmin) {
            navigate('/admin/dashboard', { replace: true });
            return;
          }

          if (path.toLowerCase().startsWith('/admin/otp-settings') && !isSuperAdmin) {
            navigate('/admin/dashboard', { replace: true });
            return;
          }

          if (verifiedRoles.admin) {
            setIsLoading(false);
            return;
          }

          try {
            await dispatch(checkAdminAuth());
            verifiedRoles.admin = true;
            setIsLoading(false);
            return;
          } catch (error) {
            console.error('Admin auth check failed:', error);
            verifiedRoles.admin = false;
            navigate(isMasterRoute ? '/superadmin-login' : '/choose-user', { replace: true });
            return;
          }
        }

        if (targetRole === 'student') {
          const studentData = Cookies.get('studentData');
          if (!studentData) {
            verifiedRoles.student = false;
            navigate('/choose-user', { replace: true });
            return;
          }

          let parsedStudent = null;
          try {
            parsedStudent = JSON.parse(studentData);
          } catch {}

          // Module restriction check for students
          const blocked = parsedStudent?.blockedModules || parsedStudent?.user?.blockedModules || [];
          const currentModule = path.split('/')[2]?.toLowerCase();
          if (currentModule && blocked.includes(currentModule)) {
            navigate('/student/dashboard', { replace: true });
            return;
          }

          if (verifiedRoles.student) {
            setIsLoading(false);
            return;
          }
          try {
            await dispatch(checkStudentAuth());
            verifiedRoles.student = true;
            setIsLoading(false);
            return;
          } catch (error) {
            console.error('Student auth check failed:', error);
            verifiedRoles.student = false;
            navigate('/choose-user', { replace: true });
            return;
          }
        }

        if (targetRole === 'teacher') {
          const teacherData = Cookies.get('teacherData');
          if (!teacherData) {
            verifiedRoles.teacher = false;
            navigate('/choose-user', { replace: true });
            return;
          }

          let parsedTeacher = null;
          try {
            parsedTeacher = JSON.parse(teacherData);
          } catch {}

          // Strict role boundary enforcement for staff under teacher hierarchy
          const resp = (parsedTeacher?.responsibility || parsedTeacher?.user?.responsibility || '').toLowerCase();
          const p = path.toLowerCase();

          if (resp.includes('librarian')) {
            const allowed = ['/teacher/dashboard', '/teacher/library', '/teacher/communication', '/teacher/settings'];
            if (!allowed.some(route => p === route || p.startsWith(route + '/'))) {
              navigate('/teacher/dashboard', { replace: true });
              return;
            }
          } else if (resp.includes('exam')) {
            const allowed = ['/teacher/dashboard', '/teacher/exams', '/teacher/performance', '/teacher/communication', '/teacher/settings'];
            if (!allowed.some(route => p === route || p.startsWith(route + '/'))) {
              navigate('/teacher/dashboard', { replace: true });
              return;
            }
          } else if (resp.includes('event')) {
            const allowed = ['/teacher/dashboard', '/teacher/events', '/teacher/communication', '/teacher/settings'];
            if (!allowed.some(route => p === route || p.startsWith(route + '/'))) {
              navigate('/teacher/dashboard', { replace: true });
              return;
            }
          } else if (resp.includes('registrar')) {
            const allowed = ['/teacher/dashboard', '/teacher/students', '/teacher/classes', '/teacher/communication', '/teacher/settings'];
            if (!allowed.some(route => p === route || p.startsWith(route + '/'))) {
              navigate('/teacher/dashboard', { replace: true });
              return;
            }
          } else {
            // Regular teaching faculty - NEVER allowed in library management
            if (p.startsWith('/teacher/library')) {
              navigate('/teacher/dashboard', { replace: true });
              return;
            }
          }

          if (verifiedRoles.teacher) {
            setIsLoading(false);
            return;
          }
          try {
            await dispatch(checkTeacherAuth());
            verifiedRoles.teacher = true;
            setIsLoading(false);
            return;
          } catch (error) {
            console.error('Teacher auth check failed:', error);
            verifiedRoles.teacher = false;
            navigate('/choose-user', { replace: true });
            return;
          }
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Auth check failed:', error);
        navigate('/choose-user');
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [path, propRole, dispatch, navigate]);

  if (isLoading) {
    return <Loading />;
  }

  return children ? children : <Outlet />;
};

export default AuthGuard;