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
import Cookies from "js-cookie";
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

    // Clear any stale tokens/cookies from past sessions before authenticating
    localStorage.removeItem("adminToken");
    localStorage.removeItem("teacherToken");
    localStorage.removeItem("studentToken");
    Cookies.remove("adminToken", { path: "/" });
    Cookies.remove("teacherToken", { path: "/" });
    Cookies.remove("studentToken", { path: "/" });
    Cookies.remove("adminData", { path: "/" });
    Cookies.remove("teacherData", { path: "/" });
    Cookies.remove("studentData", { path: "/" });

    try {
      if (email.toLowerCase().trim() === "admin@campus-sync.com") {
        toast.error("User doesn't exist", toastOptions);
        return;
      }

      let res;
      if (role === "admin") {
        res = await dispatch(adminLogin(email, password));
      } else if (role === "student") {
        res = await dispatch(studentLogin(email, password));
      } else {
        res = await dispatch(teacherLogin(email, password));
      }

      console.log("Login dispatch completed, result:", res);

      if (res && res.bypassOtp) {
        toast.success(res.message || "Login successful!", toastOptions);
        if (role === "admin") {
          navigate("/admin/dashboard", { replace: true });
        } else if (role === "teacher") {
          navigate("/teacher/dashboard", { replace: true });
        } else if (role === "student") {
          navigate("/student/dashboard", { replace: true });
        }
        return;
      }

      const targetId = res?.data || res?.id;
      if (res && !res.bypassOtp && targetId) {
        sessionStorage.setItem("otp_role", role);
        console.log(`Navigating to OTP verification: /otp/${targetId}?role=${role}`);
        navigate(`/otp/${targetId}?role=${role}`, { state: { role } });
        return;
      }
    } catch (err) {
      console.error("Login submission error:", err);
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
  }, [error, dispatch]);

  return (
    <>
      <GlobalStyle />
      <MarqueeContainer style={{ position: "relative" }}>
        <MarqueeText>
          To login to the system, please contact the admin at <a href="mailto:manpreet.singhcomet@gmail.com">manpreet.singhcomet@gmail.com</a>
        </MarqueeText>
        {/* Invisible secret trigger at extreme right of the titlebar */}
        <div
          onClick={() => navigate("/superadmin-login")}
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "50px",
            height: "100%",
            background: "transparent",
            border: "none",
            outline: "none",
            cursor: "default",
            zIndex: 1002,
            opacity: 0,
            userSelect: "none"
          }}
          aria-hidden="true"
        />
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
