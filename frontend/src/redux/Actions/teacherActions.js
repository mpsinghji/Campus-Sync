import axios from "axios";
import { BACKEND_URL } from "../../constants/url";

const URL = BACKEND_URL + "api/v1/teacher";

axios.defaults.withCredentials = true;

// Teacher Login Action
export const teacherLogin = (email, password) => async (dispatch) => {
  try {
    dispatch({
      type: "TEACHER_LOGIN_REQUEST",
    });

    // Make API call to login
    const { data } = await axios.post(
      `${URL}/login`,
      { email, password },
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );

    dispatch({
      type: "TEACHER_LOGIN_SUCCESS",
      payload: {
        message: data.message,
        id: data.data,
        userRole: data.userRole,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    dispatch({
      type: "TEACHER_LOGIN_FAILURE",
      payload: error.response?.data?.message || "Server Error",
    });
  }
};

// Verify Teacher OTP Action
export const verifyTeacherOtp = (id, otp) => async (dispatch) => {
  try {
    dispatch({
      type: "VERIFY_TEACHER_OTP_REQUEST",
    });

    // API call to verify OTP
    const { data } = await axios.post(
      `${URL}/login/verify/${id}`,
      { otp },
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );

    dispatch({
      type: "VERIFY_TEACHER_OTP_SUCCESS",
      payload: data.message,
    });
  } catch (error) {
    dispatch({
      type: "VERIFY_TEACHER_OTP_FAILURE",
      payload: error.response?.data?.message || "OTP Verification Failed",
    });
  }
};

// Resend Teacher OTP Action
export const resendTeacherOtp = (id) => async (dispatch) => {
  try {
    dispatch({
      type: "RESEND_TEACHER_OTP_REQUEST",
    });

    const { data } = await axios.get(`${URL}/login/resend/${id}`);

    dispatch({
      type: "RESEND_TEACHER_OTP_SUCCESS",
      payload: data.message,
    });
  } catch (error) {
    dispatch({
      type: "RESEND_TEACHER_OTP_FAILURE",
      payload: error.response?.data?.message || "Error Resending OTP",
    });
  }
};
