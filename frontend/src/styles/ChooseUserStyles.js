import styled, { keyframes } from "styled-components";

// Container for the entire page
export const ChooseUserContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100vw;
  background: linear-gradient(to right, #1a252f, #1a252f);
  color: #000;
  margin: 0;
  padding: 0;
  overflow: hidden;
  font-family: "Arial", sans-serif;
  transition: all 0.3s ease-in-out;
`;

// Marquee container for contact information
export const MarqueeContainer = styled.div`
  width: 100%;
  background-color: rgba(26, 37, 47, 0.9);
  color: #fff;
  padding: 10px 0;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
`;

// Marquee text style
export const MarqueeText = styled.div`
  font-size: 16px;
  font-weight: 500;
  
  a {
    color: #1abc9c;
    text-decoration: none;
    font-weight: bold;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

// Role selector tabs
export const RoleSelector = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
  position: relative;
  z-index: 10;
  transition: all 0.3s ease-in-out;
`;

// Style for each role tab (admin, student, teacher)
export const RoleTab = styled.button`
  padding: 12px 25px;
  margin: 0 10px;
  cursor: pointer;
  background-color: #34495e;
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 1rem;
  transition: background-color 0.3s ease, transform 0.3s ease;
  box-sizing: border-box;

  &:hover {
    background-color: #1abc9c;
    transform: scale(1.05);
  }

  &.active {
    background-color: #16a085;
    color: #fff;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    transform: scale(1.05);
  }
`;

// Style for user section container
export const UserSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 400px;
  background: rgba(255, 255, 255, 0.9);
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0px 6px 20px rgba(0, 0, 0, 0.3);
  text-align: center;
  transition: background 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease;

  &:hover {
    transform: scale(1.02);
  }
`;

// Input field styles
export const InputField = styled.input`
  width: 100%;
  padding: 12px 15px;
  margin: 10px 0;
  border: 2px solid #dcdcdc;
  border-radius: 5px;
  font-size: 1rem;
  background-color: #f9f9f9;
  color: #333;
  outline: none;
  box-sizing: border-box;

  &::placeholder {
    color: #999;
  }

  &:focus {
    border-color: #2193b0;
    background-color: #fff;
  }
`;

// Button style
export const Button = styled.button`
  width: 100%;
  padding: 12px 15px;
  margin: 20px 0;
  background-color: #16a085;
  color: #fff;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  text-align: center;
  transition: background-color 0.3s ease;
  box-sizing: border-box;

  &:hover {
    background-color: #1abc9c;
  }

  &:disabled {
    background-color: #95a5a6;
    cursor: not-allowed;
  }
`;

// Title style
export const Title = styled.h2`
  font-size: 2rem;
  font-weight: bold;
  color: #fff;
  text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.2);
  margin-bottom: 20px;
`;

// Optional transition for user section
export const UserSectionTransition = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 1;
  transition: opacity 0.3s ease-in-out;

  &.hidden {
    opacity: 0;
  }
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

export const Spinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const Circle = styled.div`
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  animation: ${spin} 1s linear infinite;
`;

