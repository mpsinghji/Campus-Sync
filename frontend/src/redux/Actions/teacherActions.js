import axios from 'axios';
import { setTeacher, logoutTeacher } from '../Reducers/teacherReducers';

export const teacherLogin = (email, password) => async (dispatch) => {
  try {
    const response = await axios.post('http://localhost:5000/api/teacher/login', { email, password });
    const { teacher, token } = response.data.data;
    dispatch(setTeacher({ teacher, token }));
    localStorage.setItem('teacherToken', token); // Store token for teacher
  } catch (error) {
    console.error(error);
  }
};

export const logoutTeacherAction = () => (dispatch) => {
  dispatch(logoutTeacher());
  localStorage.removeItem('teacherToken');
};
