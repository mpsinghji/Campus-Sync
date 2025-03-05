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
          "Accept": "application/json"
        },
        withCredentials: true,
      }
    );

    console.log("Teacher OTP verification response:", data);

    // Store token in localStorage
    if (data.token) {
      localStorage.setItem('teacherToken', data.token);
      console.log("Teacher token stored in localStorage");
    } else {
      console.error("No token received in response");
      throw new Error("No token received");
    }

    // Decode token to get user info
    const tokenPayload = JSON.parse(atob(data.token.split('.')[1]));
    
    dispatch({
      type: "VERIFY_TEACHER_OTP_SUCCESS",
      payload: {
        message: data.message,
        userRole: data.userRole,
        token: data.token,
        user: {
          id: tokenPayload.id,
          userRole: data.userRole
        }
      }
    });
  } catch (error) {
    console.error("Teacher OTP Verification Error:", error);
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

// Check and restore teacher state
export const checkTeacherAuth = () => async (dispatch) => {
    try {
        const token = localStorage.getItem('teacherToken');
        
        if (!token) {
            console.log("No stored teacher authentication data found");
            return;
        }

        // Decode token to get user info
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        
        // First, try to restore state from token
        dispatch({
            type: "VERIFY_TEACHER_OTP_SUCCESS",
            payload: {
                message: "Session restored from cache",
                userRole: 'teacher',
                token: token,
                user: {
                    id: tokenPayload.id,
                    userRole: 'teacher'
                }
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
            if (data.data) {
                dispatch({
                    type: "VERIFY_TEACHER_OTP_SUCCESS",
                    payload: {
                        message: "Session verified",
                        userRole: 'teacher',
                        token: token,
                        user: {
                            id: data.data,
                            userRole: 'teacher'
                        }
                    }
                });
            }
        } catch (backendError) {
            console.error("Teacher backend verification error:", backendError);
            // Only clear data if it's a 401 error
            if (backendError.response && backendError.response.status === 401) {
                localStorage.removeItem('teacherToken');
                dispatch({
                    type: "VERIFY_TEACHER_OTP_FAILURE",
                    payload: "Session expired"
                });
            }
            // For other errors, keep using the cached data
        }

    } catch (error) {
        console.error("Teacher auth check error:", error);
        // Only clear data if it's a parsing error or other critical error
        if (error instanceof SyntaxError) {
            localStorage.removeItem('teacherToken');
            dispatch({
                type: "VERIFY_TEACHER_OTP_FAILURE",
                payload: "Invalid session data"
            });
        }
    }
};

// Teacher Logout Action
export const teacherLogout = () => async (dispatch) => {
    try {
        // Clear localStorage
        localStorage.removeItem('teacherToken');
        
        // Clear cookies by calling backend logout endpoint
        await axios.post(`${URL}/logout`, {}, {
            withCredentials: true
        });

        dispatch({
            type: "TEACHER_LOGOUT",
            payload: "Logged out successfully"
        });

    } catch (error) {
        console.error("Teacher Logout Error:", error);
        // Even if the backend call fails, clear the local state
        dispatch({
            type: "TEACHER_LOGOUT",
            payload: "Logged out successfully"
        });
    }
};
