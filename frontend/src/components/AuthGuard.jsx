import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { checkAdminAuth } from '../redux/Actions/adminActions';
import { checkStudentAuth } from '../redux/Actions/studentActions';
import { checkTeacherAuth } from '../redux/Actions/teacherActions';
import Loading from './Loading/loading';

const AuthGuard = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const path = location.pathname;

  useEffect(() => {
    const checkAuth = async () => {
      // Check for admin routes
      if (path.startsWith('/admin')) {
        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) {
          navigate('/choose-user');
          return;
        }
        await dispatch(checkAdminAuth());
        return;
      }

      // Check for student routes
      if (path.startsWith('/student')) {
        const studentToken = localStorage.getItem('studentToken');
        if (!studentToken) {
          navigate('/choose-user');
          return;
        }
        await dispatch(checkStudentAuth());
        return;
      }

      // Check for teacher routes
      if (path.startsWith('/teacher')) {
        const teacherToken = localStorage.getItem('teacherToken');
        if (!teacherToken) {
          navigate('/choose-user');
          return;
        }
        await dispatch(checkTeacherAuth());
        return;
      }
    };

    checkAuth();
  }, [path, dispatch, navigate]);

  return <>{children}</>;
};

export default AuthGuard; 