import axios from "axios";
import { BACKEND_URL } from "../../constants/url";
import Cookies from 'js-cookie';

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
          "Accept": "application/json"
        },
        withCredentials: true,
      }
    );

    console.log("Teacher OTP verification response:", data);

    // Check if we have token in response
    if (!data.token) {
      console.error("No token received in response");
      throw new Error("No token received");
    }

    // Clear any existing teacher data
    Cookies.remove('teacherData', { path: '/' });
    
    // Store user data in cookie
    Cookies.set('teacherData', JSON.stringify({
      user: {
        id: data.data,
        userRole: data.userRole
      },
      token: data.token
    }), { path: '/' });

    dispatch({
      type: "VERIFY_TEACHER_OTP_SUCCESS",
      payload: {
        message: data.message,
        userRole: data.userRole,
        token: data.token,
        user: {
          id: data.data,
          userRole: data.userRole
        }
      }
    });

    return true;

  } catch (error) {
    console.error("Teacher OTP Verification Error:", error);
    // Clear any partial data
    Cookies.remove('teacherData', { path: '/' });
    dispatch({
      type: "VERIFY_TEACHER_OTP_FAILURE",
      payload: error.response?.data?.message || "OTP Verification Failed",
    });
    throw error;
  }
};

// Resend Teacher OTP Action
export const resendTeacherOtp = (id) => async (dispatch) => {
  try {
    dispatch({
      type: "RESEND_TEACHER_OTP_REQUEST",
    });

    const { data } = await axios.get(`${URL}/login/resend/${id}`, {
      withCredentials: true
    });

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

// Check Teacher Auth Action
export const checkTeacherAuth = () => async (dispatch) => {
    try {
        dispatch({
            type: "CHECK_TEACHER_AUTH_REQUEST"
        });

        const teacherData = Cookies.get('teacherData');
        if (!teacherData) {
            throw new Error("No teacher data found");
        }

        // Parse the teacher data to get the token
        const { token } = JSON.parse(teacherData);
        if (!token) {
            throw new Error("No token found in teacher data");
        }

        const { data } = await axios.get(`${URL}/profile`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            withCredentials: true
        });

        dispatch({
            type: "CHECK_TEACHER_AUTH_SUCCESS",
            payload: {
                isAuthenticated: true,
                user: data,
                userRole: 'teacher'
            }
        });

        return true;

    } catch (error) {
        console.error("Auth check failed:", error);
        // Clear invalid data
        Cookies.remove('teacherData', { path: '/' });
        dispatch({
            type: "CHECK_TEACHER_AUTH_FAILURE",
            payload: error.message
        });
        throw error;
    }
};

// Teacher Logout Action
export const teacherLogout = () => async (dispatch) => {
    try {
        // Clear Redux state immediately
        dispatch({
            type: "TEACHER_LOGOUT",
            payload: "Logged out successfully"
        });
        
        // Clear cookies by calling backend logout endpoint
        await axios.post(`${URL}/logout`, {}, {
            withCredentials: true
        });

        // Force remove cookies from client side as backup
        Cookies.remove('teacherData', { path: '/' });

    } catch (error) {
        console.error("Logout Error:", error);
        // Even if the backend call fails, ensure everything is cleared
        Cookies.remove('teacherData', { path: '/' });
        dispatch({
            type: "TEACHER_LOGOUT",
            payload: "Logged out successfully"
        });
    }
};
