import axios from 'axios';
// import { setStudent, logoutStudent } from '../Reducers/studentReducers';
import { setStudent,logoutStudent } from '../Reducers/studentReducer';

export const studentLogin = (email, password) => async (dispatch) => {
  try {
    const response = await axios.post('http://localhost:5000/api/student/login', { email, password });
    const { student, token } = response.data.data;
    dispatch(setStudent({ student, token }));
    localStorage.setItem('studentToken', token); // Store token for student
  } catch (error) {
    console.error(error);
  }
};

export const logoutStudentAction = () => (dispatch) => {
  dispatch(logoutStudent());
  localStorage.removeItem('studentToken');
};
