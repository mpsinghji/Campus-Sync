  import React, { useState, useEffect } from "react";
  import { useNavigate, useLocation, useParams,Link } from "react-router-dom";
  import { createGlobalStyle } from "styled-components";
  import { useDispatch, useSelector } from "react-redux";
  import { toast } from "react-toastify";
  import toastOptions from "../../constants/toast";
  import { resendAdminOtp, verifyAdminOtp } from "../../redux/Actions/adminActions.js";
  import { resendStudentOtp,verifyStudentOtp } from "../../redux/Actions/studentActions.js";
  import { resendTeacherOtp,verifyTeacherOtp } from "../../redux/Actions/teacherActions.js";
  import { LoginPageContainer, LoginBox, Heading, InputField, SubmitButton, Message } from "../../styles/LoginOtpStyles.js";

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
    const { message: otpMessage, error, isAuthenticated } = useSelector(state => state[role]);

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
      if(role === "admin"){
        dispatch(verifyAdminOtp(id, otp));
      }else if(role === "student"){
        dispatch(verifyStudentOtp(id, otp));
      }else{
        dispatch(verifyTeacherOtp(id, otp));
      }
    };

    const handleResendOtp = () => {
      if(role === "admin"){
        dispatch(resendAdminOtp(id));
      }else if(role === "student"){
        dispatch(resendStudentOtp(id));
      }else{
        dispatch(resendTeacherOtp(id));
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
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            {message && <Message>{message}</Message>}
            <SubmitButton type="submit" >Verify OTP
            </SubmitButton>
          </form>
          <div style={{ cursor: "pointer",color: "blue",marginTop:"20px" }}>
            <Link to={`/otp/${id}`} onClick={handleResendOtp} style={{ textDecoration: "none" }}>Resend OTP</Link>
          </div>
        </LoginBox>
      </LoginPageContainer>
    );
  };

  export default LoginOtpPage;
