import axios from 'axios';
import { BACKEND_URL } from '../../constants/url';

// This will be the base URL for your API endpoints
const URL = BACKEND_URL + "api/v1";

// Set axios defaults for cookies
axios.defaults.withCredentials = true;

// Function to get the role-specific URL
const getRoleUrl = (role) => `${URL}/${role}`;

export const loginUser = (role, email, password) => async (dispatch) => {
    try {
        dispatch({
            type: "USER_LOGIN_REQUEST"
        });

        // Dynamic URL based on the role
        const { data } = await axios.post(getRoleUrl(role), { email, password }, {
            headers: {
                "Content-Type": "application/json"
            },
            withCredentials: true
        });

        dispatch({
            type: "USER_LOGIN_SUCCESS",
            payload: {
                message: data.message,
                id: data.data
            }
        });
        
    } catch (error) {
        dispatch({
            type: "USER_LOGIN_FAILURE",
            payload: error.response?.data?.message
        });
    }
};

export const verifyLoginOtp = (role, id, otp) => async (dispatch) => {
    try {
        dispatch({
            type: "LOGIN_OTP_REQUEST"
        });

        const { data } = await axios.post(`${getRoleUrl(role)}/login/verify/${id}`, { otp }, {
            headers: {
                "Content-Type": "application/json"
            },
            withCredentials: true
        });

        dispatch({
            type: "LOGIN_OTP_SUCCESS",
            payload: data.message
        });
        
    } catch (error) {
        dispatch({
            type: "LOGIN_OTP_FAILURE",
            payload: error.response?.data?.message
        });
    }
};


export const resendLoginOtp = (role, id) => async (dispatch) => {
    try {
        dispatch({
            type: "RESEND_LOGIN_OTP_REQUEST"
        });

        const { data } = await axios.get(`${getRoleUrl(role)}/login/resend/${id}`);

        dispatch({
            type: "RESEND_LOGIN_OTP_SUCCESS",
            payload: data.message
        });
        
    } catch (error) {
        dispatch({
            type: "RESEND_LOGIN_OTP_FAILURE",
            payload: error.response?.data?.message
        });
    }
};

export const resendVerifyOtp = (role, id) => async (dispatch) => {
    try {
        dispatch({
            type: "RESEND_VERIFY_OTP_REQUEST"
        });

        const { data } = await axios.get(`${getRoleUrl(role)}/resend/${id}`);

        dispatch({
            type: "RESEND_VERIFY_OTP_SUCCESS",
            payload: data.message
        });
        
    } catch (error) {
        dispatch({
            type: "RESEND_VERIFY_OTP_FAILURE",
            payload: error.response?.data?.message
        });
    }
};

export const loadUser = (role) => async (dispatch) => {
    try {
        dispatch({
            type: "LOAD_USER_REQUEST"
        });

        // Dynamic URL based on the role
        const { data } = await axios.get(`${getRoleUrl(role)}/me`);

        dispatch({
            type: "LOAD_USER_SUCCESS",
            payload: data.data
        });

    } catch (error) {
        dispatch({
            type: "LOAD_USER_FAILURE",
            payload: error.response?.data?.message
        });
    }
};
