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
import Cookies from 'js-cookie';

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
  const [isResending, setIsResending] = useState(false);
  const dispatch = useDispatch();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { role } = location.state || {};
  const { error, isAuthenticated, loading } = useSelector(state => state[role]);

  useEffect(() => {
    if (!role) {
      console.log("No role found in location state");
      toast.error("Please login first", toastOptions);
      navigate("/");
      return;
    }

    if (error) {
      dispatch({ type: "CLEAR_ERROR" });
    }
  }, [error, dispatch, navigate, role]);

  useEffect(() => {
    const handleNavigation = async () => {
      if (isAuthenticated) {
        const userData = Cookies.get(`${role}Data`);
        console.log("Navigation check:", {
          isAuthenticated,
          role,
          userData,
          path: `/${role}/dashboard`
        });

        if (userData) {
          console.log("Navigating to dashboard");
          // Add a small delay to ensure state is updated
          await new Promise(resolve => setTimeout(resolve, 100));

          try {
            navigate(`/${role}/dashboard`, { replace: true });
          } catch (navError) {
            console.error("Navigation error:", navError);
            // Try again after a delay
            await new Promise(resolve => setTimeout(resolve, 500));
            navigate(`/${role}/dashboard`, { replace: true });
          }
        } else {
          console.log("No user data found in cookies, retrying...");
          // Retry checking for cookie
          setTimeout(() => {
            const retryUserData = Cookies.get(`${role}Data`);
            if (retryUserData) {
              console.log("User data found on retry, navigating...");
              navigate(`/${role}/dashboard`, { replace: true });
            } else {
              console.error("Failed to find user data after retry");
            }
          }, 500);
        }
      }
    };

    handleNavigation();
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
      setMessage("OTP must contain 6 digits");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setMessage("OTP must contain only numbers");
      return;
    }

    setMessage("");
    try {
      console.log("Verifying OTP for role:", role);
      if (role === "admin") {
        await dispatch(verifyAdminOtp(id, otp));
      } else if (role === "student") {
        await dispatch(verifyStudentOtp(id, otp));
      } else {
        await dispatch(verifyTeacherOtp(id, otp));
      }
      console.log("OTP verification completed");

      // Add a small delay before navigation
      await new Promise(resolve => setTimeout(resolve, 500));

      // Force navigation if not already navigated
      const userData = Cookies.get(`${role}Data`);
      if (userData) {
        try {
          navigate(`/${role}/dashboard`, { replace: true });
        } catch (navError) {
          console.error("Navigation error:", navError);
          // Try again after a delay
          await new Promise(resolve => setTimeout(resolve, 500));
          navigate(`/${role}/dashboard`, { replace: true });
        }
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setMessage("Invalid OTP. Please try again.");
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) {
      return;
    }

    try {
      setIsResending(true);
      if (role === "admin") {
        await dispatch(resendAdminOtp(id));
      } else if (role === "student") {
        await dispatch(resendStudentOtp(id));
      } else {
        await dispatch(resendTeacherOtp(id));
      }
      setCountdown(60); // 60 seconds cooldown
    } catch (error) {
      console.error("Error resending OTP:", error);
    } finally {
      setIsResending(false);
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
        <ResendLink onClick={handleResendOtp} disabled={countdown > 0 || isResending}>
          {isResending ? "Resending..." : countdown > 0 ? `Resend OTP in ${countdown}s` : "Resend OTP"}
        </ResendLink>
      </LoginBox>
    </LoginPageContainer>
  );
};

export default LoginOtpPage;
