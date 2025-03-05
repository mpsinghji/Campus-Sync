import axios from 'axios';
import { BACKEND_URL } from '../../constants/url';
import { message } from '../../../../backend/utils/message';

const URL = BACKEND_URL + "api/v1/admin";

axios.defaults.withCredentials = true;

// Check and restore admin state
export const checkAdminAuth = () => async (dispatch) => {
    try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            return;
        }

        dispatch({
            type: "VERIFY_ADMIN_OTP_REQUEST"
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
            type: "VERIFY_ADMIN_OTP_SUCCESS",
            payload: {
                message: "Session restored",
                userRole: 'admin',
                token: token
            }
        });

    } catch (error) {
        console.error("Auth check error:", error);
        // Clear invalid token
        localStorage.removeItem('adminToken');
        dispatch({
            type: "VERIFY_ADMIN_OTP_FAILURE",
            payload: "Session expired"
        });
    }
};

// Admin Login Action
export const adminLogin = (email, password) => async (dispatch) => {
    try {
        dispatch({
            type: "ADMIN_LOGIN_REQUEST"
        });

        // Make API call to login
        const { data } = await axios.post(`${URL}/login`, { email, password }, {
            headers: {
                "Content-Type": "application/json"
            },
            withCredentials: true
        });

        dispatch({
            type: "ADMIN_LOGIN_SUCCESS",
            payload: {
                message: data.message,
                id: data.data,
                userRole: data.userRole
            }
        });

    } catch (error) {
        console.error("Login Error:", error);
        dispatch({
            type: "ADMIN_LOGIN_FAILURE",
            payload: error.response?.data?.message || "Server Error"
        });
    }
};

// Verify Admin OTP Action
export const verifyAdminOtp = (id, otp) => async (dispatch) => {
    try {
        dispatch({
            type: "VERIFY_ADMIN_OTP_REQUEST"
        });

        // API call to verify OTP
        const { data } = await axios.post(`${URL}/login/verify/${id}`, { otp }, {
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            withCredentials: true
        });

        console.log("OTP verification response:", data);

        // Store token in localStorage
        if (data.data && data.data.token) {
            localStorage.setItem('adminToken', data.data.token);
            console.log("Token stored in localStorage");
        } else {
            console.error("No token received in response");
            throw new Error("No token received");
        }

        dispatch({
            type: "VERIFY_ADMIN_OTP_SUCCESS",
            payload: {
                message: data.message,
                userRole: 'admin',
                token: data.data.token
            }
        });

    } catch (error) {
        console.error("OTP Verification Error:", error);
        dispatch({
            type: "VERIFY_ADMIN_OTP_FAILURE",
            payload: error.response?.data?.message || "OTP Verification Failed"
        });
        throw error;
    }
};

// Resend Admin OTP Action
export const resendAdminOtp = (id) => async (dispatch) => {
    try {
        dispatch({
            type: "RESEND_ADMIN_OTP_REQUEST"
        });

        const { data } = await axios.get(`${URL}/login/resend/${id}`, {
            withCredentials: true
        });

        dispatch({
            type: "RESEND_ADMIN_OTP_SUCCESS",
            payload: data.message
        });

    } catch (error) {
        console.error("Resend OTP Error:", error);
        dispatch({
            type: "RESEND_ADMIN_OTP_FAILURE",
            payload: error.response?.data?.message || "Error Resending OTP"
        });
    }
};

// Admin Logout Action
export const adminLogout = () => async (dispatch) => {
    try {
        // Clear localStorage first
        localStorage.removeItem('adminToken');
        
        // Clear Redux state immediately
        dispatch({
            type: "ADMIN_LOGOUT",
            payload: "Logged out successfully"
        });
        
        // Then clear cookies by calling backend logout endpoint
        await axios.post(`${URL}/logout`, {}, {
            withCredentials: true
        });

    } catch (error) {
        console.error("Logout Error:", error);
        // Even if the backend call fails, ensure token is cleared
        localStorage.removeItem('adminToken');
        dispatch({
            type: "ADMIN_LOGOUT",
            payload: "Logged out successfully"
        });
    }
};
