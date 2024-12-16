import { configureStore } from '@reduxjs/toolkit';
import { adminReducer } from './Reducers/adminReducers';
import studentReducer from './Reducers/studentReducer';
import teacherReducer from './Reducers/teacherReducers';

const store = configureStore({
  reducer: {
    admin:adminReducer,
    student: studentReducer,
    teacher: teacherReducer,
  },
});

export default store;
