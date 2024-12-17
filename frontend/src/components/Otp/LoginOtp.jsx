import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import toastOptions from "../../constants/toast";
import { resendAdminOtp, verifyAdminOtp } from "../../redux/Actions/adminActions.js";
import { LoginPageContainer, LoginBox, Heading, InputField, SubmitButton, Message } from "../../styles/LoginOtpStyles.js";

// Global styles to reset some default styles
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
  const dispatch = useDispatch();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { role } = location.state || {}; 
  // Corrected destructuring of state.userAuth
  const { loading: otpLoading, message: otpMessage, error, isAuthenticated } = useSelector(state => state.admin);

  useEffect(() => {
    if (otpMessage) {
      toast.success(otpMessage, toastOptions);
      dispatch({ type: "CLEAR_MESSAGE" });
    }
    if (error) {
      toast.error(error, toastOptions);
      dispatch({ type: "CLEAR_ERROR" });
    }
    if(isAuthenticated){
      navigate(`/${role}/dashboard`);
    }
  }, [otpMessage, error, navigate, dispatch, toastOptions, role, isAuthenticated]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast.error("OTP must contain 6 digits", toastOptions);
      return;
    }
    setMessage("");
    dispatch(verifyAdminOtp(id, otp));
  };

  const handleResendOtp = () => {
    dispatch(resendAdminOtp(id));
  };

  return (
    <LoginPageContainer>
      <GlobalStyle />
      <LoginBox>
        <Heading>Verify OTP</Heading>
        <form onSubmit={handleSubmit}>
          <InputField
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          {message && <Message>{message}</Message>}
          <SubmitButton type="submit" disabled={otpLoading}>
            {otpLoading ? "Verifying..." : "Submit OTP"}
          </SubmitButton>
        </form>
        <div onClick={handleResendOtp} style={{ cursor: "pointer",color: "blue",marginTop:"20px" }} disabled={otpLoading}>
          {otpLoading ? "Resending..." : "Resend OTP"}
        </div>
      </LoginBox>
    </LoginPageContainer>
  );
};

export default LoginOtpPage;
