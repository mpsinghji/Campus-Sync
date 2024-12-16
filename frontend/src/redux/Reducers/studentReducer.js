import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  student: null,
  token: null,
  isAuthenticated: false,
};

const studentSlice = createSlice({
  name: 'student',
  initialState,
  reducers: {
    setStudent: (state, action) => {
      state.student = action.payload.student;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    logoutStudent: (state) => {
      state.student = null;
      state.token = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setStudent, logoutStudent } = studentSlice.actions;
export default studentSlice.reducer;
