import axios from "axios";
import { BACKEND_URL } from "../../constants/url";
import Cookies from 'js-cookie';

const URL = BACKEND_URL + "api/v1/teacher";

axios.defaults.withCredentials = true;

// Teacher Login Action
export const teacherLogin = (email, password) => async (dispatch) => {
  const loginUrl = `${URL}/login`;
  try {
    console.log("Making teacher login request to:", loginUrl);
    dispatch({
      type: "TEACHER_LOGIN_REQUEST",
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

    console.log("Teacher login response:", data);

    if (data.bypassOtp) {
      if (data.token) {
        localStorage.setItem("teacherToken", data.token);
        Cookies.set("teacherToken", data.token, { expires: 7, path: "/" });
      }
      if (data.user) {
        Cookies.set(
          "teacherData",
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
        type: "TEACHER_LOGIN_SUCCESS",
        payload: {
          message: data.message,
          id: data.data,
          userRole: data.userRole || "teacher",
          bypassOtp: true,
        },
      });
      dispatch({
        type: "VERIFY_TEACHER_OTP_SUCCESS",
        payload: {
          message: data.message,
          userRole: data.userRole || "teacher",
          token: data.token,
          user: data.user,
        },
      });
      return data;
    }

    dispatch({
      type: "TEACHER_LOGIN_SUCCESS",
      payload: {
        message: data.message,
        id: data.data,
        userRole: data.userRole || "teacher",
      },
    });
    return data;
  } catch (error) {
    console.error("Teacher Login Error:", error);
    let payloadMsg = error.response?.data?.message || "Server Error";
    if (error.response?.status === 429) {
      const retryAfter = error.response?.data?.retryAfter || error.response?.headers?.['retry-after'];
      const secs = Number(retryAfter);
      const timeMsg = secs ? ` (approx. ${secs >= 60 ? Math.ceil(secs / 60) + ' min' : secs + 's'} remaining)` : '';
      payloadMsg = `Too many login attempts from this network. Please wait before trying again.${timeMsg}`;
    }
    dispatch({
      type: "TEACHER_LOGIN_FAILURE",
      payload: payloadMsg,
    });
    throw error;
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

    const token = data.data?.token || data.token;
    const user = data.data?.user || data.user || { id: data.data || id, role: "teacher" };

    // Check if we have token in response
    if (!token) {
      console.error("No token received in response");
      throw new Error("No token received");
    }

    // Clear any existing teacher data
    Cookies.remove('teacherData', { path: '/' });
    Cookies.remove('teacherToken', { path: '/' });
    
    // Store user data in cookie and localStorage
    localStorage.setItem("teacherToken", token);
    Cookies.set("teacherToken", token, { expires: 7, path: "/" });
    Cookies.set('teacherData', JSON.stringify({
      ...user,
      user,
      token
    }), { expires: 7, path: '/' });

    dispatch({
      type: "VERIFY_TEACHER_OTP_SUCCESS",
      payload: {
        message: data.message,
        userRole: data.userRole || "teacher",
        token,
        user
      }
    });

    return true;

  } catch (error) {
    console.error("Teacher OTP Verification Error:", error);
    Cookies.remove('teacherData', { path: '/' });
    Cookies.remove('teacherToken', { path: '/' });
    let payloadMsg = error.response?.data?.message || "OTP Verification Failed";
    if (error.response?.status === 429) {
      const retryAfter = error.response?.data?.retryAfter || error.response?.headers?.['retry-after'];
      const secs = Number(retryAfter);
      const timeMsg = secs ? ` (approx. ${secs >= 60 ? Math.ceil(secs / 60) + ' min' : secs + 's'} remaining)` : '';
      payloadMsg = `Too many OTP attempts from this network. Please wait before trying again.${timeMsg}`;
    }
    dispatch({
      type: "VERIFY_TEACHER_OTP_FAILURE",
      payload: payloadMsg,
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
    let payloadMsg = error.response?.data?.message || "Error Resending OTP";
    if (error.response?.status === 429) {
      const retryAfter = error.response?.data?.retryAfter || error.response?.headers?.['retry-after'];
      const secs = Number(retryAfter);
      const timeMsg = secs ? ` (approx. ${secs >= 60 ? Math.ceil(secs / 60) + ' min' : secs + 's'} remaining)` : '';
      payloadMsg = `Too many OTP requests from this network. Please wait before trying again.${timeMsg}`;
    }
    dispatch({
      type: "RESEND_TEACHER_OTP_FAILURE",
      payload: payloadMsg,
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
