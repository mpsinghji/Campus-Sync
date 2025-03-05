import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  BsGraphUp,
  BsPeople,
  BsFileText,
  BsBook,
  BsGraphDown,
  BsCalendar,
  BsGear,
  BsChatDots,
  BsCalendarEvent,
  BsBoxArrowRight,
} from "react-icons/bs";
import {
  SidebarContainer,
  SidebarHeader,
  SidebarNav,
  SidebarIcon,
  Logo,
} from "../../styles/SidebarStyles";
import styled , { css } from "styled-components";
import bg1 from "../../assets/bg1.png";
import LogoutModal from "../../components/Logout/logOut";
import { teacherLogout } from "../../redux/Actions/teacherActions";

export const SidebarNavItem = styled.li`
  display: flex;
  align-items: center;
  padding: 15px 20px;
  font-size: 18px;
  border-bottom: 1px solid #34495E;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  color: #ECF0F1;
  
  /* Apply active styles when the active prop is true */
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


const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const handleNavigation = (path) => {
    navigate(path);
  };

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = (status) => {
    setIsModalOpen(status);
  };

  const handleConfirmLogout = async () => {
    try {
      await dispatch(teacherLogout());
      navigate("/choose-user");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Logout error:", error);
      // Even if there's an error, still navigate to login
      navigate("/choose-user");
      setIsModalOpen(false);
    }
  };

  return (
    <SidebarContainer>
      <SidebarHeader>
        <Logo src={bg1} alt="Logo" onClick={() => navigate("/teacher/dashboard")} />
      </SidebarHeader>
      <SidebarHeader>Teacher</SidebarHeader>
      <SidebarNav>
        <SidebarNavItem
          onClick={() => handleNavigation("/teacher/dashboard")}
          active={isActive("/teacher/dashboard") }
        >
          <SidebarIcon>
            <BsGraphUp />
          </SidebarIcon>
          Dashboard
        </SidebarNavItem>
        {/* <SidebarNavItem
          active={isActive("/teacher/classes")}
          onClick={() => handleNavigation("/teacher/classes")}
        >
          <SidebarIcon>
            <BsPeople />
          </SidebarIcon>
          Classes
        </SidebarNavItem> */}
        <SidebarNavItem
          active={isActive("/teacher/students")}
          onClick={() => handleNavigation("/teacher/students")}
        >
          <SidebarIcon>
            <BsPeople />
          </SidebarIcon>
          Students
        </SidebarNavItem>
        <SidebarNavItem
          active={isActive("/teacher/assignments")}
          onClick={() => handleNavigation("/teacher/assignments")}
        >
          <SidebarIcon>
            <BsFileText />
          </SidebarIcon>
          Assignments
        </SidebarNavItem>
        <SidebarNavItem
          active={isActive("/teacher/exams")}
          onClick={() => handleNavigation("/teacher/exams")}
        >
          <SidebarIcon>
            <BsBook />
          </SidebarIcon>
          Exams
        </SidebarNavItem>
        {/* <SidebarNavItem
          active={isActive("/teacher/performance")}
          onClick={() => handleNavigation("/teacher/performance")}
        >
          <SidebarIcon>
            <BsGraphDown />
          </SidebarIcon>
          Performance
        </SidebarNavItem> */}
        <SidebarNavItem
          active={isActive("/teacher/attendance")}
          onClick={() => handleNavigation("/teacher/attendance")}
        >
          <SidebarIcon>
            <BsCalendar />
          </SidebarIcon>
          Attendance
        </SidebarNavItem>
        <SidebarNavItem
          active={isActive("/teacher/communication")}
          onClick={() => handleNavigation("/teacher/communication")}
        >
          <SidebarIcon>
            <BsChatDots />
          </SidebarIcon>
          Announcement
        </SidebarNavItem>
        <SidebarNavItem
          active={isActive("/teacher/events")}
          onClick={() => handleNavigation("/teacher/events")}
        >
          <SidebarIcon>
            <BsCalendarEvent />
          </SidebarIcon>
          Events & Calendar
        </SidebarNavItem>
        <SidebarNavItem
          active={isActive("/teacher/settings")}
          onClick={() => handleNavigation("/teacher/settings")}
        >
          <SidebarIcon>
            <BsGear />
          </SidebarIcon>
          Settings & Profile
        </SidebarNavItem>
        <SidebarNavItem onClick={handleLogout}>
          <SidebarIcon>
            <BsBoxArrowRight />
          </SidebarIcon>
          Log Out
        </SidebarNavItem>
        {isModalOpen && (
            <LogoutModal
              onClose={handleCloseModal}
              onConfirm={handleConfirmLogout}
            />
          )}
      </SidebarNav>
    </SidebarContainer>
  );
};

export default Sidebar;
