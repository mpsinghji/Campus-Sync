import styled from 'styled-components';

export const LoginPageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #1a252f ;
  font-family: Arial, sans-serif;
`;

export const LoginBox = styled.div`
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 40px;
  text-align: center;
  width: 90%;
  max-width: 400px;
  margin: 0 auto;
  color: #333;
`;

export const Heading = styled.h2`
  font-size: 24px;
  margin-bottom: 20px;
`;

export const InputField = styled.input`
  width: 100%;
  padding: 12px 15px;
  margin-bottom: 20px;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
  color: #333;
`;

export const SubmitButton = styled.button`
  background-color: #16a085;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 12px 20px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #1abc9c;
  }
`;

export const Message = styled.p`
  margin-top: 20px;
  color: #007bff;
  font-size: 14px;
`;

export const ResendLink = styled.button`
  background: none;
  border: none;
  color: #4a90e2;
  cursor: pointer;
  font-size: 14px;
  margin-top: 20px;
  padding: 0;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
  
  &:disabled {
    color: #999;
    cursor: not-allowed;
    text-decoration: none;
  }
`;