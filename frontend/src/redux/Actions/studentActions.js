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
          "Accept": "application/json"
        },
        withCredentials: true,
      }
    );

    console.log("OTP verification response:", data);

    // Store token in localStorage
    if (data.data && data.data.token) {
      localStorage.setItem('studentToken', data.data.token);
      console.log("Token stored in localStorage");
    } else {
      console.error("No token received in response");
      throw new Error("No token received");
    }

    // Store user data in localStorage
    if (data.data && data.data.user) {
      localStorage.setItem('studentUser', JSON.stringify(data.data.user));
      console.log("User data stored in localStorage");
    }

    dispatch({
      type: "VERIFY_STUDENT_OTP_SUCCESS",
      payload: {
        message: data.message,
        userRole: "student",
        token: data.data.token,
        user: data.data.user
      }
    });
  } catch (error) {
    console.error("OTP Verification Error:", error);
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
        const userData = localStorage.getItem('studentUser');
        
        if (!token || !userData) {
            console.log("No stored authentication data found");
            return;
        }

        // First, try to restore state from localStorage
        const parsedUserData = JSON.parse(userData);
        dispatch({
            type: "VERIFY_STUDENT_OTP_SUCCESS",
            payload: {
                message: "Session restored from cache",
                userRole: 'student',
                token: token,
                user: parsedUserData
            }
        });

        // Then verify with backend in the background
        try {
            const { data } = await axios.get(`${URL}/profile`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                withCredentials: true
            });

            // Update with fresh data if available
            if (data.data && data.data.user) {
                localStorage.setItem('studentUser', JSON.stringify(data.data.user));
                dispatch({
                    type: "VERIFY_STUDENT_OTP_SUCCESS",
                    payload: {
                        message: "Session verified",
                        userRole: 'student',
                        token: token,
                        user: data.data.user
                    }
                });
            }
        } catch (backendError) {
            console.error("Backend verification error:", backendError);
            // Only clear data if it's a 401 error
            if (backendError.response && backendError.response.status === 401) {
                localStorage.removeItem('studentToken');
                localStorage.removeItem('studentUser');
                dispatch({
                    type: "VERIFY_STUDENT_OTP_FAILURE",
                    payload: "Session expired"
                });
            }
            // For other errors, keep using the cached data
        }

    } catch (error) {
        console.error("Auth check error:", error);
        // Only clear data if it's a parsing error or other critical error
        if (error instanceof SyntaxError) {
            localStorage.removeItem('studentToken');
            localStorage.removeItem('studentUser');
            dispatch({
                type: "VERIFY_STUDENT_OTP_FAILURE",
                payload: "Invalid session data"
            });
        }
    }
};

// Student Logout Action
export const studentLogout = () => async (dispatch) => {
    try {
        // Clear localStorage
        localStorage.removeItem('studentToken');
        localStorage.removeItem('studentUser');
        
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
