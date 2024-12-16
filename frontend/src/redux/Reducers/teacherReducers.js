import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  teacher: null,
  token: null,
  isAuthenticated: false,
};

const teacherSlice = createSlice({
  name: 'teacher',
  initialState,
  reducers: {
    setTeacher: (state, action) => {
      state.teacher = action.payload.teacher;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    logoutTeacher: (state) => {
      state.teacher = null;
      state.token = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setTeacher, logoutTeacher } = teacherSlice.actions;
export default teacherSlice.reducer;
