import axios from 'axios';
import { BACKEND_URL } from '../../constants/url';

const URL = BACKEND_URL + "api/v1/admin";

axios.defaults.withCredentials = true;

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
                id: data.data
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
                "Content-Type": "application/json"
            },
            withCredentials: true
        });

        dispatch({
            type: "VERIFY_ADMIN_OTP_SUCCESS",
            payload: data.message
        });

    } catch (error) {
        dispatch({
            type: "VERIFY_ADMIN_OTP_FAILURE",
            payload: error.response?.data?.message || "OTP Verification Failed"
        });
    }
};

// Resend Admin OTP Action
export const resendAdminOtp = (id) => async (dispatch) => {
    try {
        dispatch({
            type: "RESEND_ADMIN_OTP_REQUEST"
        });

        // API call to resend OTP
        const { data } = await axios.get(`${URL}/login/resend/${id}`);

        dispatch({
            type: "RESEND_ADMIN_OTP_SUCCESS",
            payload: data.message
        });

    } catch (error) {
        dispatch({
            type: "RESEND_ADMIN_OTP_FAILURE",
            payload: error.response?.data?.message || "Error Resending OTP"
        });
    }
};
