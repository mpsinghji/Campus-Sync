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
const teacherLoginRequest = createAction("TEACHER_LOGIN_REQUEST");
const teacherLoginSuccess = createAction("TEACHER_LOGIN_SUCCESS");
const teacherLoginFailure = createAction("TEACHER_LOGIN_FAILURE");

const verifyTeacherOtpRequest = createAction("VERIFY_TEACHER_OTP_REQUEST");
const verifyTeacherOtpSuccess = createAction("VERIFY_TEACHER_OTP_SUCCESS");
const verifyTeacherOtpFailure = createAction("VERIFY_TEACHER_OTP_FAILURE");

const resendTeacherOtpRequest = createAction("RESEND_TEACHER_OTP_REQUEST");
const resendTeacherOtpSuccess = createAction("RESEND_TEACHER_OTP_SUCCESS");
const resendTeacherOtpFailure = createAction("RESEND_TEACHER_OTP_FAILURE");

const clearError = createAction("CLEAR_ERROR");
const clearAuthError = createAction("CLEAR_AUTH_ERROR");
const clearMessage = createAction("CLEAR_MESSAGE");
const clearLogoutMessage = createAction("CLEAR_LOGOUT_MESSAGE");

// Reducer
export const teacherReducer = createReducer(initialState, (builder) => {
  builder
    // Teacher login actions
    .addCase(teacherLoginRequest, (state) => {
      state.loading = true;
    })
    .addCase(teacherLoginSuccess, (state, action) => {
      state.loading = false;
      state.message = action.payload.message;
      state.id = action.payload.id;
      state.userRole = action.payload.userRole;
    })
    .addCase(teacherLoginFailure, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })

    // Teacher OTP verification actions
    .addCase(verifyTeacherOtpRequest, (state) => {
      state.loading = true;
    })
    .addCase(verifyTeacherOtpSuccess, (state, action) => {
      state.loading = false;
      state.message = action.payload;
      state.isAuthenticated = true;
    })
    .addCase(verifyTeacherOtpFailure, (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
    })

    // Teacher OTP resend actions
    .addCase(resendTeacherOtpRequest, (state) => {
      state.loading = true;
    })
    .addCase(resendTeacherOtpSuccess, (state, action) => {
      state.loading = false;
      state.message = action.payload;
    })
    .addCase(resendTeacherOtpFailure, (state, action) => {
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
