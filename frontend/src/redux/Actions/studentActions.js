import axios from "axios";
import { BACKEND_URL } from "../../constants/url";
import Cookies from 'js-cookie';

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
          "Accept": "application/json"
        },
        withCredentials: true,
      }
    );

    console.log("OTP verification response:", data);

    // Check if we have token in response
    if (!data.data || !data.data.token) {
      console.error("No token received in response");
      throw new Error("No token received");
    }

    // Clear any existing student data
    Cookies.remove('studentData', { path: '/' });
    
    // Store user data in cookie
    Cookies.set('studentData', JSON.stringify({
      user: data.data.user,
      token: data.data.token
    }), { path: '/' });

    dispatch({
      type: "VERIFY_STUDENT_OTP_SUCCESS",
      payload: {
        message: data.message,
        userRole: "student",
        token: data.data.token,
        user: data.data.user
      }
    });

    return true;

  } catch (error) {
    console.error("OTP Verification Error:", error);
    // Clear any partial data
    Cookies.remove('studentData', { path: '/' });
    dispatch({
      type: "VERIFY_STUDENT_OTP_FAILURE",
      payload: error.response?.data?.message || "OTP Verification Failed",
    });
    throw error;
  }
};

// Resend Student OTP Action
export const resendStudentOtp = (id) => async (dispatch) => {
  try {
    dispatch({
      type: "RESEND_STUDENT_OTP_REQUEST",
    });

    const { data } = await axios.get(`${URL}/login/resend/${id}`, {
      withCredentials: true
    });

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

// Check Student Auth Action
export const checkStudentAuth = () => async (dispatch) => {
    try {
        dispatch({
            type: "CHECK_STUDENT_AUTH_REQUEST"
        });

        const studentData = Cookies.get('studentData');
        if (!studentData) {
            throw new Error("No student data found");
        }

        // Parse the student data to get the token
        const { token } = JSON.parse(studentData);
        if (!token) {
            throw new Error("No token found in student data");
        }

        const { data } = await axios.get(`${URL}/profile`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            withCredentials: true
        });

        dispatch({
            type: "CHECK_STUDENT_AUTH_SUCCESS",
            payload: {
                isAuthenticated: true,
                user: data,
                userRole: 'student'
            }
        });

        return true;

    } catch (error) {
        console.error("Auth check failed:", error);
        // Clear invalid data
        Cookies.remove('studentData', { path: '/' });
        dispatch({
            type: "CHECK_STUDENT_AUTH_FAILURE",
            payload: error.message
        });
        throw error;
    }
};

// Student Logout Action
export const studentLogout = () => async (dispatch) => {
    try {
        // Clear Redux state immediately
        dispatch({
            type: "STUDENT_LOGOUT",
            payload: "Logged out successfully"
        });
        
        // Clear cookies by calling backend logout endpoint
        await axios.post(`${URL}/logout`, {}, {
            withCredentials: true
        });

        // Force remove cookies from client side as backup
        Cookies.remove('studentData', { path: '/' });

    } catch (error) {
        console.error("Logout Error:", error);
        // Even if the backend call fails, ensure everything is cleared
        Cookies.remove('studentData', { path: '/' });
        dispatch({
            type: "STUDENT_LOGOUT",
            payload: "Logged out successfully"
        });
    }
};
