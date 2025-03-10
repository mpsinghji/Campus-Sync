import { createAction, createReducer } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';

// Initial state for the reducer
const initialState = {
    loading: false,
    message: null,
    error: null,
    isAuthenticated: false,
    id: null,
    authError: null,
    logoutMessage: null,
    userRole: null,
    user: null
};

// Actions
const studentLoginRequest = createAction('STUDENT_LOGIN_REQUEST');
const studentLoginSuccess = createAction('STUDENT_LOGIN_SUCCESS');
const studentLoginFailure = createAction('STUDENT_LOGIN_FAILURE');

const verifyStudentOtpRequest = createAction('VERIFY_STUDENT_OTP_REQUEST');
const verifyStudentOtpSuccess = createAction('VERIFY_STUDENT_OTP_SUCCESS');
const verifyStudentOtpFailure = createAction('VERIFY_STUDENT_OTP_FAILURE');

const resendStudentOtpRequest = createAction('RESEND_STUDENT_OTP_REQUEST');
const resendStudentOtpSuccess = createAction('RESEND_STUDENT_OTP_SUCCESS');
const resendStudentOtpFailure = createAction('RESEND_STUDENT_OTP_FAILURE');

const checkStudentAuthRequest = createAction('CHECK_STUDENT_AUTH_REQUEST');
const checkStudentAuthSuccess = createAction('CHECK_STUDENT_AUTH_SUCCESS');
const checkStudentAuthFailure = createAction('CHECK_STUDENT_AUTH_FAILURE');

const clearError = createAction('CLEAR_ERROR');
const clearAuthError = createAction('CLEAR_AUTH_ERROR');
const clearMessage = createAction('CLEAR_MESSAGE');
const clearLogoutMessage = createAction('CLEAR_LOGOUT_MESSAGE');

const studentLogout = createAction('STUDENT_LOGOUT');

// Reducer
export const studentReducer = createReducer(initialState, (builder) => {
    builder
        // Student login actions
        .addCase(studentLoginRequest, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(studentLoginSuccess, (state, action) => {
            state.loading = false;
            state.message = action.payload.message;
            state.id = action.payload.id;
            state.userRole = action.payload.userRole;
            state.error = null;
        })
        .addCase(studentLoginFailure, (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.isAuthenticated = false;
            state.user = null;
        })
        
        // Student OTP verification actions
        .addCase(verifyStudentOtpRequest, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(verifyStudentOtpSuccess, (state, action) => {
            state.loading = false;
            state.message = action.payload.message;
            state.userRole = action.payload.userRole;
            state.isAuthenticated = true;
            state.user = action.payload.user;
            state.error = null;
        })
        .addCase(verifyStudentOtpFailure, (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.isAuthenticated = false;
            state.user = null;
        })

        // Student OTP resend actions
        .addCase(resendStudentOtpRequest, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(resendStudentOtpSuccess, (state, action) => {
            state.loading = false;
            state.message = action.payload;
            state.error = null;
        })
        .addCase(resendStudentOtpFailure, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })

        // Student auth check actions
        .addCase(checkStudentAuthRequest, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(checkStudentAuthSuccess, (state, action) => {
            state.loading = false;
            state.isAuthenticated = true;
            state.user = action.payload.user;
            state.userRole = action.payload.userRole;
            state.error = null;
        })
        .addCase(checkStudentAuthFailure, (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.isAuthenticated = false;
            state.user = null;
            state.userRole = null;
        })

        // Logout action
        .addCase(studentLogout, (state, action) => {
            state.loading = false;
            state.message = action.payload;
            state.error = null;
            state.isAuthenticated = false;
            state.id = null;
            state.userRole = null;
            state.user = null;
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