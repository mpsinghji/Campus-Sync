import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  BsGraphUp,
  BsFileText,
  BsBook,
  BsGraphDown,
  BsCalendar,
  BsGear,
  BsChatDots,
  BsBoxArrowRight,
} from "react-icons/bs";
import {
  SidebarContainer,
  SidebarHeader,
  SidebarNav,
  SidebarNavItem,
  SidebarIcon,
  Logo,
} from "../../styles/SidebarStyles";
import bg1 from "../../assets/bg1.png";
import { MdPayment } from "react-icons/md";
import LogoutModal from "../../components/Logout/logOut";
import { studentLogout } from "../../redux/Actions/studentActions";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const handleNavigation = (path) => {
    navigate(path);
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  const handleLogout = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = (status) => {
    setIsModalOpen(status);
  };

  const handleConfirmLogout = async () => {
    try {
      await dispatch(studentLogout());
      navigate("/choose-user");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <SidebarContainer>
      <SidebarHeader>
        <Logo
          src={bg1}
          alt="Logo"
          onClick={() => navigate("/student/dashboard")}
        />
      </SidebarHeader>
      <SidebarHeader>Student</SidebarHeader>
      <SidebarNav>
        <SidebarNavItem
          onClick={() => handleNavigation("/student/dashboard")}
          className={isActive("/student/dashboard")}
        >
          <SidebarIcon>
            <BsGraphUp />
          </SidebarIcon>
          Dashboard
        </SidebarNavItem>
        <SidebarNavItem
          onClick={() => handleNavigation("/student/assignments")}
          className={isActive("/student/assignments")}
        >
          <SidebarIcon>
            <BsFileText />
          </SidebarIcon>
          Assignments
        </SidebarNavItem>
        <SidebarNavItem
          onClick={() => handleNavigation("/student/exams")}
          className={isActive("/student/exams")}
        >
          <SidebarIcon>
            <BsBook />
          </SidebarIcon>
          Exams
        </SidebarNavItem>
        {/* <SidebarNavItem
          onClick={() => handleNavigation("/student/performance")}
          className={isActive("/student/performance")}
        >
          <SidebarIcon>
            <BsGraphDown />
          </SidebarIcon>
          Performance
        </SidebarNavItem> */}
        <SidebarNavItem
          onClick={() => handleNavigation("/student/attendance")}
          className={isActive("/student/attendance")}
        >
          <SidebarIcon>
            <BsCalendar />
          </SidebarIcon>
          Attendance
        </SidebarNavItem>
        <SidebarNavItem
          onClick={() => handleNavigation("/student/library")}
          className={isActive("/student/library")}
        >
          <SidebarIcon>
            <BsBook />
          </SidebarIcon>
          Library
        </SidebarNavItem>
        <SidebarNavItem
          onClick={() => handleNavigation("/student/fees")}
          className={isActive("/student/fees")}
        >
          <SidebarIcon>
            <MdPayment />
          </SidebarIcon>
          Fees
        </SidebarNavItem>
        <SidebarNavItem
          onClick={() => handleNavigation("/student/communication")}
          className={isActive("/student/communication")}
        >
          <SidebarIcon>
            <BsChatDots />
          </SidebarIcon>
          Announcement
        </SidebarNavItem>
        <SidebarNavItem
          onClick={() => handleNavigation("/student/EventCalendar")}
          className={isActive("/student/EventCalendar")}
        >
          <SidebarIcon>
            <BsChatDots />
          </SidebarIcon>
          Events & Calendar
        </SidebarNavItem>
        <SidebarNavItem
          onClick={() => handleNavigation("/student/settings")}
          className={isActive("/student/settings")}
        >
          <SidebarIcon>
            <BsGear />
          </SidebarIcon>
          Profile
        </SidebarNavItem>
        <SidebarNavItem
          onClick={handleLogout}
          className={isActive("/choose-user")}
        >
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
