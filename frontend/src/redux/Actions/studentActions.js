import axios from "axios";
import { BACKEND_URL } from "../../constants/url";

const URL = BACKEND_URL + "api/v1/student";

axios.defaults.withCredentials = true;

// Student Login Action
export const studentLogin = (email, password) => async (dispatch) => {
  try {
    dispatch({
      type: "STUDENT_LOGIN_REQUEST",
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
      type: "STUDENT_LOGIN_SUCCESS",
      payload: {
        message: data.message,
        id: data.data,
        userRole: data.userRole,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    dispatch({
      type: "STUDENT_LOGIN_FAILURE",
      payload: error.response?.data?.message || "Server Error",
    });
  }
};

// Verify Student OTP Action
export const verifyStudentOtp = (id, otp) => async (dispatch) => {
  try {
    dispatch({
      type: "VERIFY_STUDENT_OTP_REQUEST",
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
      type: "VERIFY_STUDENT_OTP_SUCCESS",
      payload: {
        message: data.message,
        userRole: "student",
      }
    });
  } catch (error) {
    dispatch({
      type: "VERIFY_STUDENT_OTP_FAILURE",
      payload: error.response?.data?.message || "OTP Verification Failed",
    });
  }
};

// Resend Student OTP Action
export const resendStudentOtp = (id) => async (dispatch) => {
  try {
    dispatch({
      type: "RESEND_STUDENT_OTP_REQUEST",
    });

    const { data } = await axios.get(`${URL}/login/resend/${id}`);

    dispatch({
      type: "RESEND_STUDENT_OTP_SUCCESS",
      payload: data.message,
    });
  } catch (error) {
    dispatch({
      type: "RESEND_STUDENT_OTP_FAILURE",
      payload: error.response?.data?.message || "Error Resending OTP",
    });
  }
};

// Check and restore student state
export const checkStudentAuth = () => async (dispatch) => {
    try {
        const token = localStorage.getItem('studentToken');
        if (!token) {
            return;
        }

        dispatch({
            type: "VERIFY_STUDENT_OTP_REQUEST"
        });

        // Verify token with backend
        const { data } = await axios.get(`${URL}/profile`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            withCredentials: true
        });

        dispatch({
            type: "VERIFY_STUDENT_OTP_SUCCESS",
            payload: {
                message: "Session restored",
                userRole: 'student',
                token: token
            }
        });

    } catch (error) {
        console.error("Auth check error:", error);
        // Clear invalid token
        localStorage.removeItem('studentToken');
        dispatch({
            type: "VERIFY_STUDENT_OTP_FAILURE",
            payload: "Session expired"
        });
    }
};

// Student Logout Action
export const studentLogout = () => async (dispatch) => {
    try {
        // Clear localStorage
        localStorage.removeItem('studentToken');
        
        // Clear cookies by calling backend logout endpoint
        await axios.post(`${URL}/logout`, {}, {
            withCredentials: true
        });

        dispatch({
            type: "STUDENT_LOGOUT",
            payload: "Logged out successfully"
        });

    } catch (error) {
        console.error("Logout Error:", error);
        // Even if the backend call fails, clear the local state
        dispatch({
            type: "STUDENT_LOGOUT",
            payload: "Logged out successfully"
        });
    }
};
