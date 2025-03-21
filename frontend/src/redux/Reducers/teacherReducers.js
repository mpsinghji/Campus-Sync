import { createAction, createReducer } from "@reduxjs/toolkit";
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
const teacherLoginRequest = createAction("TEACHER_LOGIN_REQUEST");
const teacherLoginSuccess = createAction("TEACHER_LOGIN_SUCCESS");
const teacherLoginFailure = createAction("TEACHER_LOGIN_FAILURE");

const verifyTeacherOtpRequest = createAction("VERIFY_TEACHER_OTP_REQUEST");
const verifyTeacherOtpSuccess = createAction("VERIFY_TEACHER_OTP_SUCCESS");
const verifyTeacherOtpFailure = createAction("VERIFY_TEACHER_OTP_FAILURE");

const resendTeacherOtpRequest = createAction("RESEND_TEACHER_OTP_REQUEST");
const resendTeacherOtpSuccess = createAction("RESEND_TEACHER_OTP_SUCCESS");
const resendTeacherOtpFailure = createAction("RESEND_TEACHER_OTP_FAILURE");

const checkTeacherAuthRequest = createAction("CHECK_TEACHER_AUTH_REQUEST");
const checkTeacherAuthSuccess = createAction("CHECK_TEACHER_AUTH_SUCCESS");
const checkTeacherAuthFailure = createAction("CHECK_TEACHER_AUTH_FAILURE");

const clearError = createAction("CLEAR_ERROR");
const clearAuthError = createAction("CLEAR_AUTH_ERROR");
const clearMessage = createAction("CLEAR_MESSAGE");
const clearLogoutMessage = createAction("CLEAR_LOGOUT_MESSAGE");

const teacherLogout = createAction("TEACHER_LOGOUT");

// Reducer
export const teacherReducer = createReducer(initialState, (builder) => {
  builder
    // Teacher login actions
    .addCase(teacherLoginRequest, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(teacherLoginSuccess, (state, action) => {
      state.loading = false;
      state.message = action.payload.message;
      state.id = action.payload.id;
      state.userRole = action.payload.userRole;
      state.error = null;
    })
    .addCase(teacherLoginFailure, (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
      state.user = null;
    })

    // Teacher OTP verification actions
    .addCase(verifyTeacherOtpRequest, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(verifyTeacherOtpSuccess, (state, action) => {
      state.loading = false;
      state.message = action.payload.message;
      state.userRole = action.payload.userRole;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.error = null;
    })
    .addCase(verifyTeacherOtpFailure, (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
      state.user = null;
    })

    // Teacher OTP resend actions
    .addCase(resendTeacherOtpRequest, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(resendTeacherOtpSuccess, (state, action) => {
      state.loading = false;
      state.message = action.payload;
      state.error = null;
    })
    .addCase(resendTeacherOtpFailure, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })

    // Teacher auth check actions
    .addCase(checkTeacherAuthRequest, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(checkTeacherAuthSuccess, (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.userRole = action.payload.userRole;
      state.error = null;
    })
    .addCase(checkTeacherAuthFailure, (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
      state.user = null;
      state.userRole = null;
    })

    // Logout action
    .addCase(teacherLogout, (state, action) => {
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
