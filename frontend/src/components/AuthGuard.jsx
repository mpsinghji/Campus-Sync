import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { checkAdminAuth } from '../redux/Actions/adminActions';
import { checkStudentAuth } from '../redux/Actions/studentActions';
import { checkTeacherAuth } from '../redux/Actions/teacherActions';
import Loading from './Loading/loading';
import Cookies from 'js-cookie';

const AuthGuard = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const path = location.pathname;
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        
        // Check for admin routes
        if (path.startsWith('/admin')) {
          const adminData = Cookies.get('adminData');
          if (!adminData) {
            navigate('/choose-user');
            return;
          }
          try {
            await dispatch(checkAdminAuth());
            setIsLoading(false);
            return;
          } catch (error) {
            console.error('Admin auth check failed:', error);
            navigate('/choose-user');
            return;
          }
        }

        // Check for student routes
        if (path.startsWith('/student')) {
          const studentData = Cookies.get('studentData');
          if (!studentData) {
            navigate('/choose-user');
            return;
          }
          try {
            await dispatch(checkStudentAuth());
            setIsLoading(false);
            return;
          } catch (error) {
            console.error('Student auth check failed:', error);
            navigate('/choose-user');
            return;
          }
        }

        // Check for teacher routes
        if (path.startsWith('/teacher')) {
          const teacherData = Cookies.get('teacherData');
          if (!teacherData) {
            navigate('/choose-user');
            return;
          }
          try {
            await dispatch(checkTeacherAuth());
            setIsLoading(false);
            return;
          } catch (error) {
            console.error('Teacher auth check failed:', error);
            navigate('/choose-user');
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
  }, [path, dispatch, navigate]);

  if (isLoading) {
    return <Loading />;
  }

  return <>{children}</>;
};

export default AuthGuard; 