import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
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
} from "../styles/ChooseUserStyles";
import { createGlobalStyle } from "styled-components";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../context/authContext.jsx";
import { adminLogin } from "../redux/Actions/adminActions";
import { studentLogin } from "../redux/Actions/studentActions";
import { teacherLogin } from "../redux/Actions/teacherActions";
import Cookies from "js-cookie";

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
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("admin");
  const { setIsAuthenticated, setUserRole } = useAuth();
  const [_id, setUserId] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const roleUrls = {
      admin: "http://localhost:5000/api/v1/admin/login",
      student: "http://localhost:5000/api/v1/student/login",
      teacher: "http://localhost:5000/api/v1/teacher/login",
    };

    try {
      const response = await axios.post(roleUrls[role], { email, password });
      console.log("Response: ", response.data);

      const userId = response.data.data.adminId;
      console.log(userId);

      setUserId(userId);
      setUserRole(role);
      console.log(response);

      const tokenKey = `${role}token`;
      const token =
        response.data?.data?.[tokenKey] ||
        response.data?.data?.data?.[tokenKey];

      if (!token) {
        throw new Error("Token not found in response");
      }

      Cookies.set(tokenKey, token, { expires: 1, secure: true });
      setIsAuthenticated(true);
      if (role === "admin") dispatch(adminLogin(email, password));
      else if (role === "student") dispatch(studentLogin(email, password));
      else if (role === "teacher") dispatch(teacherLogin(email, password));

      // Redirect to OTP verification page
      navigate(`/otp/${userId}`, { state: { role } });
      
    } catch (error) {
      console.log(error);
      toast.error(
        error.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelection = (selectedRole) => {
    setRole(selectedRole);
    console.log("Selected Role:", selectedRole);
  };

  return (
    <>
      <GlobalStyle />
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
              disabled={loading || !email || !password}
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
