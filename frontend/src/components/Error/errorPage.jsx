import React from 'react';
import { ErrorPageContainer } from '../../styles/ErrorPageStyles';
import { useNavigate } from 'react-router-dom';
import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: "Arial", sans-serif;
    background: #ecf0f1;
    overflow: hidden;
    height: 100vh;
    width: 100vw;
  }

  html, body {
    height: 100%;
    width: 100%;
  }
`;

const ErrorPage = () => {
    const navigate = useNavigate(); 
  return (
    <>
    <GlobalStyle />
    <ErrorPageContainer>
      <h1>Something Went Wrong</h1>
      <p>We're sorry, but an unexpected error has occurred.</p>
      <p>Please try log in again.</p>
      <button onClick={() => navigate("/choose-user")}>Back to Login</button>
    </ErrorPageContainer>
    </>
  );
};

export default ErrorPage;
