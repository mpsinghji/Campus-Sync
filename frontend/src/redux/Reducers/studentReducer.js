import { createAction, createReducer } from "@reduxjs/toolkit";

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
};

// Actions
const studentLoginRequest = createAction("STUDENT_LOGIN_REQUEST");
const studentLoginSuccess = createAction("STUDENT_LOGIN_SUCCESS");
const studentLoginFailure = createAction("STUDENT_LOGIN_FAILURE");

const verifyStudentOtpRequest = createAction("VERIFY_STUDENT_OTP_REQUEST");
const verifyStudentOtpSuccess = createAction("VERIFY_STUDENT_OTP_SUCCESS");
const verifyStudentOtpFailure = createAction("VERIFY_STUDENT_OTP_FAILURE");

const resendStudentOtpRequest = createAction("RESEND_STUDENT_OTP_REQUEST");
const resendStudentOtpSuccess = createAction("RESEND_STUDENT_OTP_SUCCESS");
const resendStudentOtpFailure = createAction("RESEND_STUDENT_OTP_FAILURE");

const clearError = createAction("CLEAR_ERROR");
const clearAuthError = createAction("CLEAR_AUTH_ERROR");
const clearMessage = createAction("CLEAR_MESSAGE");
const clearLogoutMessage = createAction("CLEAR_LOGOUT_MESSAGE");

// Reducer
export const studentReducer = createReducer(initialState, (builder) => {
  builder
    // Student login actions
    .addCase(studentLoginRequest, (state) => {
      state.loading = true;
    })
    .addCase(studentLoginSuccess, (state, action) => {
      state.loading = false;
      state.message = action.payload.message;
      state.id = action.payload.id;
      state.userRole = action.payload.userRole;
    })
    .addCase(studentLoginFailure, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })

    // Student OTP verification actions
    .addCase(verifyStudentOtpRequest, (state) => {
      state.loading = true;
    })
    .addCase(verifyStudentOtpSuccess, (state, action) => {
      state.loading = false;
      state.message = action.payload;
      state.isAuthenticated = true;
    })
    .addCase(verifyStudentOtpFailure, (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
    })

    // Student OTP resend actions
    .addCase(resendStudentOtpRequest, (state) => {
      state.loading = true;
    })
    .addCase(resendStudentOtpSuccess, (state, action) => {
      state.loading = false;
      state.message = action.payload;
    })
    .addCase(resendStudentOtpFailure, (state, action) => {
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
