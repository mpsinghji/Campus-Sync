import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ChooseUserContainer,
  RoleSelector,
  RoleTab,
  UserSection,
  Title,
  Button,
  InputField,
  Spinner,
  Circle,
  MarqueeContainer,
  MarqueeText
} from "../styles/ChooseUserStyles";
import { createGlobalStyle } from "styled-components";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { adminLogin } from "../redux/Actions/adminActions";
import { studentLogin } from "../redux/Actions/studentActions";
import { teacherLogin } from "../redux/Actions/teacherActions";
import toastOptions from "../constants/toast.js";

export const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: "Arial", sans-serif;
    background: #ecf0f1;
    overflow: hidden;
    height: 100vh;
    width: 100vw;
  }

  html, body {
    height: 100%;
    width: 100%;
  }
`;

const ChooseUser = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("admin");
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Check for role-specific tokens on component mount
  useEffect(() => {
    const checkExistingSession = () => {
      const path = location.pathname;
      const adminToken = localStorage.getItem('adminToken');
      const studentToken = localStorage.getItem('studentToken');
      const teacherToken = localStorage.getItem('teacherToken');

      // If we're coming from a specific role's page, check that role's token
      if (path.includes('/student/')) {
        if (studentToken) {
          navigate('/student/dashboard');
        }
        setRole('student');
      } else if (path.includes('/teacher/')) {
        if (teacherToken) {
          navigate('/teacher/dashboard');
        }
        setRole('teacher');
      } else if (path.includes('/admin/')) {
        if (adminToken) {
          navigate('/admin/dashboard');
        }
        setRole('admin');
      }
    };

    checkExistingSession();
  }, [navigate, location.pathname]);

  const userState = useSelector((state) => {
    switch (role) {
      case "admin":
        return state.admin;
      case "student":
        return state.student;
      case "teacher":
        return state.teacher;
      default:
        return {};
    }
  });

  const { loading, error, message, id } = userState;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (role === "admin") {
      dispatch(adminLogin(email, password));
    } else if (role === "student") {
      dispatch(studentLogin(email, password));
    } else {
      dispatch(teacherLogin(email, password));
    }
  };

  const handleRoleSelection = (selectedRole) => {
    setRole(selectedRole);
    console.log("Selected Role:", selectedRole);
  };

  useEffect(() => {
    if (error) {
      toast.error(error, toastOptions);
      dispatch({ type: "CLEAR_ERROR" });
    }
    if (message) {
      toast.success(message, toastOptions);
      dispatch({ type: "CLEAR_MESSAGE" });
      navigate(`/otp/${id}`, { state: { role } });
    }
  }, [message, error, navigate, dispatch, role, id]);

  return (
    <>
      <GlobalStyle />
      <MarqueeContainer>
        <MarqueeText>
          To login to the system, please contact the admin at <a href="mailto:manpreet.singhcomet@gmail.com">manpreet.singhcomet@gmail.com</a>
        </MarqueeText>
      </MarqueeContainer>
      <ChooseUserContainer>
        <div className="overlay"></div>
        <Title>Login</Title>
        <RoleSelector>
          <RoleTab
            className={role === "admin" ? "active" : ""}
            onClick={() => handleRoleSelection("admin")}
          >
            Admin
          </RoleTab>
          <RoleTab
            className={role === "student" ? "active" : ""}
            onClick={() => handleRoleSelection("student")}
          >
            Student
          </RoleTab>
          <RoleTab
            className={role === "teacher" ? "active" : ""}
            onClick={() => handleRoleSelection("teacher")}
          >
            Teacher
          </RoleTab>
        </RoleSelector>

        <UserSection className={role}>
          <form onSubmit={handleSubmit}>
            <div>
              <label>Email:</label>
              <InputField
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label>Password:</label>
              <InputField
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button
              as="button"
              type="submit"
            >
              {loading ? (
                <Spinner>
                  <Circle />
                </Spinner>
              ) : (
                "Login"
              )}
            </Button>
          </form>
        </UserSection>
      </ChooseUserContainer>
      <ToastContainer />
    </>
  );
};

export default ChooseUser;
