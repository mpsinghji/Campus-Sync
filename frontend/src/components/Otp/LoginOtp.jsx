import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import toastOptions from "../../constants/toast";
import { resendAdminOtp, verifyAdminOtp } from "../../redux/Actions/adminActions.js";
import { resendStudentOtp, verifyStudentOtp } from "../../redux/Actions/studentActions.js";
import { resendTeacherOtp, verifyTeacherOtp } from "../../redux/Actions/teacherActions.js";
import { LoginPageContainer, LoginBox, Heading, InputField, SubmitButton, Message, ResendLink } from "../../styles/LoginOtpStyles.js";

export const GlobalStyle = createGlobalStyle`
  html, body {
    margin: 0;
    padding: 0;
    height: 100%;
    overflow: hidden;
  }
`;

const LoginOtpPage = () => {
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(0);
  const dispatch = useDispatch();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { role } = location.state || {}; 
  const { message: otpMessage, error, isAuthenticated, loading } = useSelector(state => state[role]);

  useEffect(() => {
    if (!role) {
      toast.error("Please login first", toastOptions);
      navigate("/");
      return;
    }

    if (otpMessage) {
      toast.success(otpMessage, toastOptions);
      dispatch({ type: "CLEAR_MESSAGE" });
    }
    if (error) {
      toast.error(error, toastOptions);
      dispatch({ type: "CLEAR_ERROR" });
    }
  }, [otpMessage, error, dispatch, navigate, role]);

  useEffect(() => {
    if (isAuthenticated) {
      const token = localStorage.getItem(`${role}Token`);
      console.log("Navigation check:", { isAuthenticated, role, token });
      if (token) {
        console.log("Navigating to dashboard");
        navigate(`/${role}/dashboard`, { replace: true });
      } else {
        console.log("No token found in localStorage");
        toast.error("Authentication failed. Please try again.", toastOptions);
      }
    }
  }, [isAuthenticated, navigate, role]);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast.error("OTP must contain 6 digits", toastOptions);
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      toast.error("OTP must contain only numbers", toastOptions);
      return;
    }

    setMessage("");
    try {
      if(role === "admin"){
        await dispatch(verifyAdminOtp(id, otp));
      }else if(role === "student"){
        await dispatch(verifyStudentOtp(id, otp));
      }else{
        await dispatch(verifyTeacherOtp(id, otp));
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error("Failed to verify OTP. Please try again.", toastOptions);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) {
      toast.error(`Please wait ${countdown} seconds before requesting another OTP`, toastOptions);
      return;
    }
    
    try {
      if(role === "admin"){
        await dispatch(resendAdminOtp(id));
      }else if(role === "student"){
        await dispatch(resendStudentOtp(id));
      }else{
        await dispatch(resendTeacherOtp(id));
      }
      setCountdown(60); // 60 seconds cooldown
    } catch (error) {
      console.error("Error resending OTP:", error);
      toast.error("Failed to resend OTP. Please try again.", toastOptions);
    }
  };

  return (
    <LoginPageContainer>
      <GlobalStyle />
      <LoginBox>
        <Heading>Verify OTP</Heading>
        <form onSubmit={handleSubmit}>
          <InputField
            type="text"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={handleOtpChange}
            maxLength={6}
            pattern="[0-9]*"
            inputMode="numeric"
            disabled={loading}
          />
          {message && <Message>{message}</Message>}
          <SubmitButton type="submit" disabled={loading}>
            {loading ? "Verifying..." : "Verify OTP"}
          </SubmitButton>
        </form>
        <ResendLink onClick={handleResendOtp} disabled={countdown > 0 || loading}>
          {countdown > 0 ? `Resend OTP in ${countdown}s` : "Resend OTP"}
        </ResendLink>
      </LoginBox>
    </LoginPageContainer>
  );
};

export default LoginOtpPage;
