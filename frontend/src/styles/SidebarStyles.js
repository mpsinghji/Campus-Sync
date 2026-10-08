import styled, { css } from 'styled-components';
import { Link } from 'react-router-dom';


export const SidebarContainer = styled.div`
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  width: 250px;
  height: 100vh;
  box-sizing: border-box;
  background-color: #1A252F;
  color: #ECF0F1;
  padding-top: 20px;
  z-index: 100;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.4);
  font-family: "Arial", sans-serif;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const SidebarHeader = styled.div`
  font-size: 20px;
  font-weight: bold;
  text-align: center;
  color: #FFFFFF;
  border-bottom: 1px solid #34495E;
  letter-spacing: 2px;
  text-transform: uppercase;
  flex-shrink: 0;
`;

export const SidebarNav = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

export const SidebarFooter = styled.div`
  margin-top: auto;
  border-top: 1px solid #2C3E50;
  background: #151E27;
  padding: 10px 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
`;

export const SidebarNavItem = styled.li`
  display: flex;
  align-items: center;
  padding: 15px 20px;
  font-size: 18px;
  border-bottom: 1px solid #34495E;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  color: #ECF0F1;

  &.active {
    background-color: #34495E;
    padding-left: 30px;
    color: #1ABC9C;
    border-left: 4px solid #1ABC9C;
  }

  ${({ active }) =>
    active &&
    css`
      background-color: #34495E;
      padding-left: 30px;
      color: #1ABC9C;
      border-left: 4px solid #1ABC9C;
    `}

  &:hover {
    background-color: #34495E;
    padding-left: 30px;
    color: #1ABC9C;
    border-left: 4px solid #1ABC9C;
  }
`;


export const StyledLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  font-weight: 500;
  letter-spacing: 1px;
  transition: color 0.2s ease-in-out;

  &:hover {
    color: #1ABC9C;
  }
`;

export const SidebarIcon = styled.div`
  margin-right: 15px;
  font-size: 20px;
  display: flex;
  align-items: center;
`;

export const Logo = styled.img`
  width: 160px;
  height: 50px;
  margin-bottom: 20px;
  transition: transform 0.3s ease-in-out;

  &:hover {
    transform: scale(1.1);
  }
`;

export const DropdownMenu = styled.div`
  margin-left: 0.5rem;
  display: flex;
  flex-direction: column;
  background-color: #1A252F;
  padding: 0.5rem;
  // box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.2); 
  `;
  
  export const DropdownItem = styled.div`
  border-bottom: 1px solid #34495E; 
  border-left: 4px solid #1ABC9C;
  padding: 0.7rem; 
  cursor: pointer;
  color: #fff; 
  font-weight: 500; 
  border-radius: 3px; 
  transition: background 0.3s ease, color 0.3s ease;
  margin-left: 30px;

  &.active {
    background: #007bff;
    color: #ffffff;
  }

  &:hover {
    background: #007bff; 
    color: #ffffff; 
  }
`;
