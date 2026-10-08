import axios from "axios";
import { BACKEND_URL } from "../../constants/url";
import Cookies from 'js-cookie';

const URL = BACKEND_URL + "api/v1/student";

axios.defaults.withCredentials = true;

// Student Login Action
export const studentLogin = (email, password) => async (dispatch) => {
  const loginUrl = `${URL}/login`;
  try {
    console.log("Making student login request to:", loginUrl);
    dispatch({
      type: "STUDENT_LOGIN_REQUEST",
    });

    // Make API call to login
    const { data } = await axios.post(
      loginUrl,
      { email, password },
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );

    console.log("Student login response:", data);

    if (data.bypassOtp) {
      if (data.token) {
        localStorage.setItem("studentToken", data.token);
        Cookies.set("studentToken", data.token, { expires: 7, path: "/" });
      }
      if (data.user) {
        Cookies.set(
          "studentData",
          JSON.stringify({
            ...data.user,
            token: data.token,
            user: data.user,
            email: data.user.email,
          }),
          { expires: 7, path: "/" }
        );
      }
      dispatch({
        type: "STUDENT_LOGIN_SUCCESS",
        payload: {
          message: data.message,
          id: data.data,
          userRole: data.userRole || "student",
          bypassOtp: true,
        },
      });
      dispatch({
        type: "VERIFY_STUDENT_OTP_SUCCESS",
        payload: {
          message: data.message,
          userRole: data.userRole || "student",
          token: data.token,
          user: data.user,
        },
      });
      return data;
    }

    dispatch({
      type: "STUDENT_LOGIN_SUCCESS",
      payload: {
        message: data.message,
        id: data.data,
        userRole: data.userRole || "student",
      },
    });
    return data;
  } catch (error) {
    console.error("Student Login Error:", error);
    dispatch({
      type: "STUDENT_LOGIN_FAILURE",
      payload: error.response?.data?.message || "Server Error",
    });
    throw error;
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

    const token = data.data?.token || data.token;
    const user = data.data?.user || data.user || { id, role: "student" };

    if (!token) {
      console.error("No token received in response");
      throw new Error("No token received");
    }

    // Clear any existing student data
    Cookies.remove('studentData', { path: '/' });
    Cookies.remove('studentToken', { path: '/' });
    
    // Store user data in cookie and localStorage
    localStorage.setItem("studentToken", token);
    Cookies.set("studentToken", token, { expires: 7, path: "/" });
    Cookies.set('studentData', JSON.stringify({
      ...user,
      user,
      token
    }), { expires: 7, path: '/' });

    dispatch({
      type: "VERIFY_STUDENT_OTP_SUCCESS",
      payload: {
        message: data.message,
        userRole: "student",
        token,
        user
      }
    });

    return true;

  } catch (error) {
    console.error("OTP Verification Error:", error);
    // Clear any partial data
    Cookies.remove('studentData', { path: '/' });
    Cookies.remove('studentToken', { path: '/' });
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
