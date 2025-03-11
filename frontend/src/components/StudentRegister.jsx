import { useState } from "react";
import {
  RegisterContainer,
  FormContainer,
  InputField,
  SubmitButton,
} from "../styles/RegisterStyles";
import Sidebar from "../pages/Admin/Sidebar";
import styled, { createGlobalStyle } from "styled-components";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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

const StudentRegister = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rollno, setRollno] = useState("");
  const [mobileno, setMobileno] = useState("");
  const [gender, setGender] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (event) => {
    event.preventDefault();

    const userData = {
      email,
      password,
      role: "student",
      rollno,
      mobileno,
      gender,
      name,
    };

    setLoading(true);

    try {
      const response = await fetch(
        `${BACKEND_URL}api/v1/student/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        }
      );

      if (!response.ok) {
        if (response.status === 409 || message.userExists) {
          toast.error("Student already exists in the database.");
        } else {
          toast.error("An error occurred during registration.");
        }
      } else {
        toast.success("Student successfully registered!");
      }
    } catch (error) {
      toast.error("An error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ScrollLockStyle />
      <PageWrapper>
        <Sidebar />
        <ContentWrapper>
          <RegisterContainer>
            <h2>Register Student</h2>
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
              <InputField
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <InputField
                as="select"
                placeholder="Gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                required
              >
                <option value="" style={{backgroundColor:"grey" }}>Select Gender</option>
                <option value="male" style={{ backgroundColor:"#5d6d7e" }}>Male</option>
                <option value="female" style={{ backgroundColor:"#5d6d7e" }}>Female</option>
                <option value="other" style={{ backgroundColor:"#5d6d7e" }}>Other</option>
              </InputField>

              <InputField
                type="text"
                placeholder="Roll Number"
                value={rollno}
                onChange={(e) => setRollno(e.target.value)}
                required
              />
              <InputField
                type="text"
                placeholder="Mobile Number"
                value={mobileno}
                onChange={(e) => setMobileno(e.target.value)}
                required
              />
              <SubmitButton type="submit" disabled={loading}>
                {loading ? "Registering..." : "Register"}
              </SubmitButton>
            </FormContainer>
          </RegisterContainer>
        </ContentWrapper>
      </PageWrapper>
      <ToastContainer />
    </>
  );
};

export default StudentRegister;
