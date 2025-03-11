import { useState } from "react";
import {
  RegisterContainer,
  FormContainer,
  InputField,
  SubmitButton,
} from "../styles/RegisterStyles";
import Sidebar from "../pages/Admin/Sidebar";
import styled, { createGlobalStyle } from "styled-components";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { message } from "../../../backend/utils/message";
import { BACKEND_URL } from "../constants/url";

const ScrollLockStyle = createGlobalStyle`
  html, body {
    margin: 0;
    padding: 0;
    height: 100%;
    overflow: hidden;
  }
`;

const PageWrapper = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
`;

const ContentWrapper = styled.div`
  flex: 1;
  background-color: #ecf0f1;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const TeacherRegister = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);


  const handleRegister = async (event) => {
    event.preventDefault();
  
    if (!email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
  
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }
  
    const userData = { email, password };
  
    setLoading(true);
  
    try {
      const response = await fetch(`${BACKEND_URL}api/v1/teacher/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });
      
  
      let result = null;
  
      // Check if the response has a JSON content type
      if (response.headers.get("content-type")?.includes("application/json")) {
        result = await response.json();
      }
  
      if (!response.ok) {
        const errorMessage = result?.message || "An error occurred during registration.";
        toast.error(errorMessage);
        return;
      }
  
      toast.success(result?.message || "teacher successfully registered!");
    } catch (error) {
      console.error("Error during registration:", error);
      toast.error("An unexpected error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <>
    <ScrollLockStyle/>
    <PageWrapper>
      <Sidebar />
      <ContentWrapper>
        <RegisterContainer>
          <h2>Register as Teacher</h2>
          <FormContainer onSubmit={handleRegister}>
            <InputField
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <InputField
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <SubmitButton type="submit" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </SubmitButton>
          </FormContainer>
        </RegisterContainer>
      </ContentWrapper>
    </PageWrapper>
    <ToastContainer/>
    </>
  );
};

export default TeacherRegister;
