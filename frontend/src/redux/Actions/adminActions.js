import axios from 'axios';
import { BACKEND_URL } from '../../constants/url';
import { message } from '../../../../backend/utils/message';
import Cookies from 'js-cookie';

// Construct the admin API URL
const ADMIN_URL = `${BACKEND_URL}api/v1/admin`;

// Log the API URL being used
console.log('Admin API URL:', ADMIN_URL);

axios.defaults.withCredentials = true;

// Check Admin Auth Action
export const checkAdminAuth = () => async (dispatch) => {
    try {
        dispatch({
            type: "CHECK_ADMIN_AUTH_REQUEST"
        });

        const adminData = Cookies.get('adminData');
        if (!adminData) {
            throw new Error("No admin data found");
        }

        const parsedData = JSON.parse(adminData);
        const token = parsedData.token;

        const { data } = await axios.get(`${ADMIN_URL}/profile`, {
            headers: {
                Authorization: `Bearer ${token}`
            },
            withCredentials: true
        });

        dispatch({
            type: "CHECK_ADMIN_AUTH_SUCCESS",
            payload: {
                isAuthenticated: true,
                user: data,
                userRole: 'admin'
            }
        });

        return true;

    } catch (error) {
        console.error("Auth check failed:", error);
        // Clear invalid data
        Cookies.remove('adminData', { path: '/' });
        dispatch({
            type: "CHECK_ADMIN_AUTH_FAILURE",
            payload: error.message
        });
        throw error;
    }
};

// Admin Login Action
export const adminLogin = (email, password) => async (dispatch) => {
    const loginUrl = `${ADMIN_URL}/login`;
    try {
        console.log("Making login request to:", loginUrl);

        dispatch({
            type: "ADMIN_LOGIN_REQUEST"
        });

        // Make API call to login
        const { data } = await axios.post(
            loginUrl,
            { email, password },
            {
                headers: {
                    "Content-Type": "application/json"
                },
                withCredentials: true
            }
        );

        console.log("Login response:", data);

        dispatch({
            type: "ADMIN_LOGIN_SUCCESS",
            payload: {
                message: data.message,
                id: data.data,
                userRole: data.userRole
            }
        });

    } catch (error) {
        console.error("Login Error:", {
            message: error.message,
            url: loginUrl,
            error: error
        });

        dispatch({
            type: "ADMIN_LOGIN_FAILURE",
            payload: error.response?.data?.message || "Server Error"
        });
        throw error;
    }
};

// Verify Admin OTP Action
export const verifyAdminOtp = (id, otp) => async (dispatch) => {
    try {
        console.log("Making OTP verification request to:", `${ADMIN_URL}/login/verify/${id}`);

        dispatch({
            type: "VERIFY_ADMIN_OTP_REQUEST"
        });

        // API call to verify OTP
        const { data } = await axios.post(
            `${ADMIN_URL}/login/verify/${id}`,
            { otp: otp.toString() },
            {
                headers: {
                    "Content-Type": "application/json"
                },
                withCredentials: true
            }
        );

        console.log("OTP verification response:", data);

        if (!data.success) {
            throw new Error(data.message || "OTP verification failed");
        }

        // Clear existing cookies
        Cookies.remove('adminToken', { path: '/' });
        token: data.data.token,
            user: data.data.user
    }
        });

return true;

    } catch (error) {
    console.error("OTP Verification Error:", {
        message: error.message,
        url: `${ADMIN_URL}/login/verify/${id}`,
        error: error
    });

    Cookies.remove('adminToken', { path: '/' });
    Cookies.remove('adminData', { path: '/' });

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

        const { data } = await axios.get(`${ADMIN_URL}/login/resend/${id}`, {
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
        // Clear Redux state immediately
        dispatch({
            type: "ADMIN_LOGOUT",
            payload: "Logged out successfully"
        });

        // Clear cookies by calling backend logout endpoint
        await axios.post(`${ADMIN_URL}/logout`, {}, {
            withCredentials: true
        });

        // Force remove cookies from client side as backup
        Cookies.remove('adminToken', { path: '/' });
        Cookies.remove('adminData', { path: '/' });

    } catch (error) {
        console.error("Logout Error:", error);
        // Even if the backend call fails, ensure everything is cleared
        Cookies.remove('adminToken', { path: '/' });
        Cookies.remove('adminData', { path: '/' });
        dispatch({
            type: "ADMIN_LOGOUT",
            payload: "Logged out successfully"
        });
    }
};
