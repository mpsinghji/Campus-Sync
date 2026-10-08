import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled, { createGlobalStyle } from "styled-components";
import axios from "axios";
import Cookies from "js-cookie";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import toastOptions from "../../constants/toast";
import { BACKEND_URL } from "../../constants/url";
import { BsEye, BsEyeSlash } from "react-icons/bs";

const GlobalStyle = createGlobalStyle`
  html, body, #root {
    margin: 0 !important;
    padding: 0 !important;
    width: 100% !important;
    height: 100% !important;
    overflow: hidden !important;
    background-color: #0b1120 !important;
  }
  * {
    box-sizing: border-box;
  }
`;

const PageContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #0b1120;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  margin: 0;
  padding: 16px;
  box-sizing: border-box;
  overflow: hidden;
`;

const Card = styled.div`
  background: #111827;
  border: 1px solid #1f2937;
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
  padding: 32px 28px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
  box-sizing: border-box;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #f9fafb;
  margin: 0 0 6px 0;
  text-align: center;
`;

const Subtitle = styled.p`
  font-size: 13px;
  color: #9ca3af;
  margin: 0 0 24px 0;
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-size: 13px;
    font-weight: 600;
    color: #d1d5db;
  }

  .input-wrapper {
    position: relative;
    display: flex;
    align-items: center;

    input {
      width: 100%;
      padding: 10px 14px;
      padding-right: ${(props) => (props.$hasToggle ? "40px" : "14px")};
      background: #1f2937;
      border: 1px solid #374151;
      border-radius: 8px;
      color: #f9fafb;
      font-size: 14px;
      outline: none;
      box-sizing: border-box;
      transition: border-color 0.2s;

      &:focus {
        border-color: #10b981;
      }

      &::placeholder {
        color: #6b7280;
      }
    }

    button.toggle-btn {
      position: absolute;
      right: 10px;
      background: none;
      border: none;
      color: #9ca3af;
      cursor: pointer;
      display: flex;
      align-items: center;
      font-size: 15px;

      &:hover {
        color: #f3f4f6;
      }
    }
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 11px;
  background: #10b981;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 6px;

  &:hover {
    background: #059669;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const TextButton = styled.button`
  background: none;
  border: none;
  color: #9ca3af;
  font-size: 13px;
  cursor: pointer;
  margin-top: 14px;
  width: 100%;
  text-align: center;

  &:hover {
    color: #f3f4f6;
    text-decoration: underline;
  }
`;

const SuperAdminLogin = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = Login credentials, 2 = Secret Code verification
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [secretCode, setSecretCode] = useState("");
  const [configuredSecretCode, setConfiguredSecretCode] = useState("454545");
  const [loading, setLoading] = useState(false);
  const [pendingAdminData, setPendingAdminData] = useState(null);
  const [rateLimitCountdown, setRateLimitCountdown] = useState(0);

  useEffect(() => {
    let timer;
    if (rateLimitCountdown > 0) {
      timer = setInterval(() => {
        setRateLimitCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [rateLimitCountdown]);

  // Fetch active secret code from backend on mount
  const fetchMasterCode = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}api/v1/security/otp-settings`);
      if (res.data?.settings?.secretOtp) {
        const code = String(res.data.settings.secretOtp).trim();
        setConfiguredSecretCode(code);
        return code;
      }
    } catch (e) {
      console.warn("Could not fetch OTP settings:", e);
    }
    return configuredSecretCode || "454545";
  };

  useEffect(() => {
    fetchMasterCode();
  }, []);

  // Step 1: Verify Credentials
  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    if (rateLimitCountdown > 0) {
      toast.warn("Rate limit active. Please wait before retrying.", toastOptions);
      return;
    }
    if (!email || !password) {
      toast.error("Please enter email and password", toastOptions);
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `${BACKEND_URL}api/v1/admin/login`,
        { email: email.trim(), password },
        { withCredentials: true }
      );

      if (res.data?.success) {
        setPendingAdminData(res.data);
        await fetchMasterCode();
        setStep(2);
      } else {
        toast.error(res.data?.message || "Invalid credentials", toastOptions);
      }
    } catch (err) {
      if (err.response?.status === 429) {
        const retryAfter = err.response?.data?.retryAfter || err.response?.headers?.["retry-after"] || 900;
        const secs = Number(retryAfter) || 900;
        setRateLimitCountdown(secs);
        const timeMsg = secs >= 60 ? ` (approx. ${Math.ceil(secs / 60)} minute${Math.ceil(secs / 60) > 1 ? "s" : ""} remaining)` : ` (approx. ${secs} second${secs > 1 ? "s" : ""} remaining)`;
        toast.error(`Too many login attempts from this network. Please wait before trying again.${timeMsg}`, {
          ...toastOptions,
          autoClose: 8000,
        });
      } else {
        toast.error(err.response?.data?.message || "Authentication failed", toastOptions);
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Secret Code verification
  const handleSecretCodeSubmit = (e) => {
    e.preventDefault();
    const cleanInput = secretCode.trim();

    if (!cleanInput) {
      toast.error("Please enter your secret code", toastOptions);
      return;
    }

    const expectedCode = (configuredSecretCode || "454545").trim();
    const isMatch = cleanInput === expectedCode;

    if (!isMatch) {
      toast.error("Incorrect secret code", toastOptions);
      return;
    }

    setLoading(true);
    const token = pendingAdminData?.token || localStorage.getItem("adminToken") || Cookies.get("adminToken");
    const adminUser = pendingAdminData?.user || pendingAdminData?.admin || {
      name: "Super Admin",
      email: email.trim(),
      role: "admin",
      isSuperAdmin: true,
      designation: "Super Administrator",
    };

    const fullSessionData = {
      ...adminUser,
      token,
      user: adminUser,
      isSuperAdmin: true,
    };

    if (token) {
      localStorage.setItem("adminToken", token);
      Cookies.set("adminToken", token, { expires: 7, path: "/" });
    }
    Cookies.set("adminData", JSON.stringify(fullSessionData), { expires: 7, path: "/" });

    toast.success("Login successful!", toastOptions);
    setTimeout(() => {
      navigate("/admin/dashboard", { replace: true });
    }, 300);
  };

  return (
    <>
      <GlobalStyle />
      <PageContainer>
        <Card>
        {step === 1 ? (
          <>
            <Title>Super Admin Login</Title>
            <Subtitle>Enter your administrator credentials to continue</Subtitle>

            <Form onSubmit={handleCredentialsSubmit}>
              <FormGroup>
                <label>Email</label>
                <div className="input-wrapper">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                    required
                    autoFocus
                  />
                </div>
              </FormGroup>

              <FormGroup $hasToggle={true}>
                <label>Password</label>
                <div className="input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                  />
                  <button
                    type="button"
                    className="toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <BsEyeSlash /> : <BsEye />}
                  </button>
                </div>
              </FormGroup>

              {rateLimitCountdown > 0 && (
                <div
                  style={{
                    background: "rgba(239, 68, 68, 0.12)",
                    border: "1px solid rgba(239, 68, 68, 0.4)",
                    borderRadius: "8px",
                    padding: "10px 14px",
                    color: "#fca5a5",
                    fontSize: "12px",
                    lineHeight: "1.4",
                  }}
                >
                  🔒 <strong>Too many login attempts from this network.</strong>
                  <div style={{ marginTop: "4px", color: "#f87171" }}>
                    Please wait before trying again ({rateLimitCountdown >= 60 ? `${Math.ceil(rateLimitCountdown / 60)}m` : `${rateLimitCountdown}s`} remaining).
                  </div>
                </div>
              )}

              <SubmitButton type="submit" disabled={loading || rateLimitCountdown > 0}>
                {loading
                  ? "Verifying..."
                  : rateLimitCountdown > 0
                  ? `Rate Limited (${rateLimitCountdown}s)`
                  : "Continue"}
              </SubmitButton>
            </Form>
          </>
        ) : (
          <>
            <Title>Enter Secret Code</Title>
            <Subtitle>Enter your 6-digit secret code to authenticate</Subtitle>

            <Form onSubmit={handleSecretCodeSubmit}>
              <FormGroup>
                <label>Secret Code</label>
                <div className="input-wrapper">
                  <input
                    type="password"
                    maxLength={10}
                    value={secretCode}
                    onChange={(e) => setSecretCode(e.target.value)}
                    placeholder="Enter secret code"
                    required
                    autoFocus
                  />
                </div>
              </FormGroup>

              <SubmitButton type="submit" disabled={loading}>
                {loading ? "Verifying..." : "Verify & Login"}
              </SubmitButton>

              <TextButton type="button" onClick={() => setStep(1)}>
                Back to Login
              </TextButton>
            </Form>
          </>
        )}

        <TextButton type="button" onClick={() => navigate("/choose-user")}>
          Return to Portal
        </TextButton>
        <ToastContainer />
      </Card>
    </PageContainer>
    </>
  );
};

export default SuperAdminLogin;
