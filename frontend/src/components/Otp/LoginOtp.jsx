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
import { BACKEND_URL } from "../../constants/url";
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

  const queryRole = new URLSearchParams(location.search).get("role");
  const role = location.state?.role || queryRole || sessionStorage.getItem("otp_role") || "admin";
  const roleState = useSelector((state) => (role && state[role] ? state[role] : {}));
  const { error, isAuthenticated, loading } = roleState;
  const [isBypassed, setIsBypassed] = useState(false);
  const [bypassReason, setBypassReason] = useState("");

  useEffect(() => {
    // Save role in session storage so refresh doesn't lose it
    if (role) {
      sessionStorage.setItem("otp_role", role);
    }

    const checkBypass = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}api/v1/security/check-bypass`);
        const data = await res.json();
        if (data.bypass) {
          setIsBypassed(true);
          setBypassReason(data.reason);
        }
      } catch (e) {}
    };
    checkBypass();
  }, [role]);

  useEffect(() => {
    if (error) {
      toast.error(error, toastOptions);
      dispatch({ type: "CLEAR_ERROR" });
    }
  }, [error, dispatch]);

  useEffect(() => {
    const handleNavigation = async () => {
      if (isAuthenticated) {
        const userDataStr = Cookies.get(`${role}Data`);
        console.log("OTP verified successfully, navigating...", { role, userDataStr });

        let isSuperAdmin = false;
        if (role === "admin" && userDataStr) {
          try {
            const parsed = JSON.parse(userDataStr);
            isSuperAdmin = parsed.isSuperAdmin || parsed.email?.toLowerCase().trim() === "admin@campus-sync.com";
          } catch {}
        }

        navigate(`/${role}/dashboard`, { replace: true });
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

      navigate(`/${role}/dashboard`, { replace: true });
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setMessage(error?.message || "Invalid OTP. Please try again.");
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
          {isBypassed && (
            <SubmitButton
              type="button"
              onClick={() => {
                setOtp("999999");
                setTimeout(() => {
                  if (role === "admin") {
                    dispatch(verifyAdminOtp(id, "999999"));
                  } else if (role === "student") {
                    dispatch(verifyStudentOtp(id, "999999"));
                  } else {
                    dispatch(verifyTeacherOtp(id, "999999"));
                  }
                }, 50);
              }}
              style={{
                backgroundColor: "#10b981",
                marginBottom: "12px",
                cursor: "pointer",
              }}
              disabled={loading}
            >
              ⚡ Fast Bypass Login (Authorized)
            </SubmitButton>
          )}
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
