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

        let parsedData = null;
        try {
            parsedData = JSON.parse(adminData);
        } catch (e) {
            throw new Error("Invalid admin data found");
        }

        let token = parsedData?.token || Cookies.get('adminToken') || localStorage.getItem('adminToken');
        if (token === "undefined" || token === "null") {
            token = null;
        }

        const headers = {};
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const { data } = await axios.get(`${ADMIN_URL}/profile`, {
            headers,
            withCredentials: true
        });

        // Ensure token and user details persist properly
        const validToken = token || data?.token || parsedData?.token;
        if (validToken && validToken !== "undefined" && validToken !== "null") {
            localStorage.setItem("adminToken", validToken);
            Cookies.set("adminToken", validToken, { expires: 7, path: "/" });
        }

        const updatedSession = {
            ...parsedData,
            ...data,
            token: validToken,
            isSuperAdmin: parsedData?.isSuperAdmin === true || data?.isSuperAdmin === true || data?.email === "admin@campus-sync.com"
        };
        Cookies.set("adminData", JSON.stringify(updatedSession), { expires: 7, path: "/" });

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
        // Only clear cookies if the backend actually returns 401 Unauthorized
        if (error?.response?.status === 401) {
            Cookies.remove('adminData', { path: '/' });
            localStorage.removeItem('adminToken');
        }
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

        if (data.bypassOtp) {
            if (data.token) {
                localStorage.setItem('adminToken', data.token);
                Cookies.set('adminToken', data.token, { expires: 7, path: '/' });
            }
            if (data.user) {
                Cookies.set('adminData', JSON.stringify({
                    ...data.user,
                    token: data.token,
                    user: data.user,
                    email: data.user.email,
                }), { expires: 7, path: '/' });
            }
            dispatch({
                type: "ADMIN_LOGIN_SUCCESS",
                payload: {
                    message: data.message,
                    id: data.data,
                    userRole: data.userRole || "admin",
                    bypassOtp: true,
                }
            });
            dispatch({
                type: "VERIFY_ADMIN_OTP_SUCCESS",
                payload: {
                    message: data.message,
                    user: data.user,
                    token: data.token,
                    userRole: "admin",
                }
            });
            return data;
        }

        dispatch({
            type: "ADMIN_LOGIN_SUCCESS",
            payload: {
                message: data.message,
                id: data.data,
                userRole: data.userRole
            }
        });
        return data;

    } catch (error) {
        console.error("Login Error:", {
            message: error.message,
            url: loginUrl,
            error: error
        });

        let payloadMsg = error.response?.data?.message || "Server Error";
        if (error.response?.status === 429) {
            const retryAfter = error.response?.data?.retryAfter || error.response?.headers?.['retry-after'];
            const secs = Number(retryAfter);
            const timeMsg = secs ? ` (approx. ${secs >= 60 ? Math.ceil(secs / 60) + ' min' : secs + 's'} remaining)` : '';
            payloadMsg = `Too many login attempts from this network. Please wait before trying again.${timeMsg}`;
        }

        dispatch({
            type: "ADMIN_LOGIN_FAILURE",
            payload: payloadMsg
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
        Cookies.remove('adminData', { path: '/' });

        const token = data.data?.token || data.token;
        const user = data.data?.user || data.user || { id, role: 'admin' };

        if (token) {
            localStorage.setItem('adminToken', token);
            Cookies.set('adminToken', token, { expires: 7, path: '/' });
        }
        Cookies.set('adminData', JSON.stringify({
            ...user,
            user,
            token
        }), { expires: 7, path: '/' });

        dispatch({
            type: "VERIFY_ADMIN_OTP_SUCCESS",
            payload: {
                message: data.message,
                user,
                token,
                userRole: 'admin'
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

        let payloadMsg = error.response?.data?.message || "OTP Verification Failed";
        if (error.response?.status === 429) {
            const retryAfter = error.response?.data?.retryAfter || error.response?.headers?.['retry-after'];
            const secs = Number(retryAfter);
            const timeMsg = secs ? ` (approx. ${secs >= 60 ? Math.ceil(secs / 60) + ' min' : secs + 's'} remaining)` : '';
            payloadMsg = `Too many OTP attempts from this network. Please wait before trying again.${timeMsg}`;
        }

        dispatch({
            type: "VERIFY_ADMIN_OTP_FAILURE",
            payload: payloadMsg
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
        let payloadMsg = error.response?.data?.message || "Error Resending OTP";
        if (error.response?.status === 429) {
            const retryAfter = error.response?.data?.retryAfter || error.response?.headers?.['retry-after'];
            const secs = Number(retryAfter);
            const timeMsg = secs ? ` (approx. ${secs >= 60 ? Math.ceil(secs / 60) + ' min' : secs + 's'} remaining)` : '';
            payloadMsg = `Too many OTP requests from this network. Please wait before trying again.${timeMsg}`;
        }
        dispatch({
            type: "RESEND_ADMIN_OTP_FAILURE",
            payload: payloadMsg
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
