import { createAction, createReducer } from '@reduxjs/toolkit';

// Initial state for the reducer
const initialState = {
    loading: false,
    message: null,
    error: null,
    isAuthenticated: false,
    id: null,
    authError: null,
    logoutMessage: null,
    userRole: null
};

// Actions
const adminLoginRequest = createAction('ADMIN_LOGIN_REQUEST');
const adminLoginSuccess = createAction('ADMIN_LOGIN_SUCCESS');
const adminLoginFailure = createAction('ADMIN_LOGIN_FAILURE');

const verifyAdminOtpRequest = createAction('VERIFY_ADMIN_OTP_REQUEST');
const verifyAdminOtpSuccess = createAction('VERIFY_ADMIN_OTP_SUCCESS');
const verifyAdminOtpFailure = createAction('VERIFY_ADMIN_OTP_FAILURE');

const resendAdminOtpRequest = createAction('RESEND_ADMIN_OTP_REQUEST');
const resendAdminOtpSuccess = createAction('RESEND_ADMIN_OTP_SUCCESS');
const resendAdminOtpFailure = createAction('RESEND_ADMIN_OTP_FAILURE');

const clearError = createAction('CLEAR_ERROR');
const clearAuthError = createAction('CLEAR_AUTH_ERROR');
const clearMessage = createAction('CLEAR_MESSAGE');
const clearLogoutMessage = createAction('CLEAR_LOGOUT_MESSAGE');

// Reducer
export const adminReducer = createReducer(initialState, (builder) => {
    builder
        // Admin login actions
        .addCase(adminLoginRequest, (state) => {
            state.loading = true;
        })
        .addCase(adminLoginSuccess, (state, action) => {
            state.loading = false;
            state.message = action.payload.message;
            state.id = action.payload.id;
            state.userRole = action.payload.userRole;
        })
        .addCase(adminLoginFailure, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
        
        // Admin OTP verification actions
        .addCase(verifyAdminOtpRequest, (state) => {
            state.loading = true;
        })
        .addCase(verifyAdminOtpSuccess, (state, action) => {
            state.loading = false;
            state.message = action.payload;
            state.isAuthenticated = true;
        })
        .addCase(verifyAdminOtpFailure, (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.isAuthenticated = false;
        })

        // Admin OTP resend actions
        .addCase(resendAdminOtpRequest, (state) => {
            state.loading = true;
        })
        .addCase(resendAdminOtpSuccess, (state, action) => {
            state.loading = false;
            state.message = action.payload;
        })
        .addCase(resendAdminOtpFailure, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })

        // Clearing error, message, and authentication state
        .addCase(clearError, (state) => {
            state.error = null;
        })
        .addCase(clearAuthError, (state) => {
            state.authError = null;
        })
        .addCase(clearMessage, (state) => {
            state.message = null;
        })
        .addCase(clearLogoutMessage, (state) => {
            state.logoutMessage = null;
        });
});
