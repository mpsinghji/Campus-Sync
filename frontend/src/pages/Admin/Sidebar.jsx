import React, { useState, useEffect } from "react";
import {
  SidebarContainer,
  SidebarHeader,
  SidebarNav,
  SidebarNavItem,
  SidebarIcon,
  Logo,
  DropdownMenu,
  DropdownItem,
} from "../../styles/SidebarStyles";
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
  BsCalendarEvent,
  BsBoxArrowRight,
} from "react-icons/bs";
import bg1 from "../../assets/bg1.png";
import { FaUserPlus } from "react-icons/fa";
import { IoIosArrowDropdown } from "react-icons/io";
import { CgUserRemove } from "react-icons/cg";
import LogoutModal from "../../components/Logout/logOut";
import { adminLogout } from "../../redux/Actions/adminActions";

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDropdownOpen2, setIsDropdownOpen2] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); 

  const handleNavigation = (path) => {
    navigate(path);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };
  const toggleDropdown2 = () => {
    setIsDropdownOpen2((prev) => !prev);
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
      await dispatch(adminLogout());
      setIsModalOpen(false);
      window.location.href = "/choose-user";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".dropdown")) {
        setIsDropdownOpen(false);
        setIsDropdownOpen2(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <>
      <SidebarContainer>
        <SidebarHeader>
          <Logo src={bg1} alt="PROJECTZERO" onClick={() => handleNavigation("/admin/dashboard")} />
        </SidebarHeader>
        <SidebarNav>
          <SidebarNavItem
            className={isActive("/admin/dashboard") ? "active" : ""}
            onClick={() => handleNavigation("/admin/dashboard")}
          >
            <SidebarIcon>
              <BsGraphUp />
            </SidebarIcon>
            Dashboard
          </SidebarNavItem>
          <SidebarNavItem className="dropdown" onClick={toggleDropdown}>
            <SidebarIcon>
              <FaUserPlus />
            </SidebarIcon>
            Register
            <IoIosArrowDropdown style={{ marginLeft: "auto" }} />
          </SidebarNavItem>
          {isDropdownOpen && (
            <DropdownMenu>
              <DropdownItem onClick={() => handleNavigation("/admin-register")}>
                Admin
              </DropdownItem>
              <DropdownItem onClick={() => handleNavigation("/student-register")}>
                Student
              </DropdownItem>
              <DropdownItem onClick={() => handleNavigation("/teacher-register")}>
                Teacher
              </DropdownItem>
            </DropdownMenu>
          )}
          <SidebarNavItem className="dropdown" onClick={toggleDropdown2}>
            <SidebarIcon>
              <CgUserRemove />
            </SidebarIcon>
            Users
            <IoIosArrowDropdown style={{ marginLeft: "auto" }} />
          </SidebarNavItem>
          {isDropdownOpen2 && (
            <DropdownMenu>
              <DropdownItem onClick={() => handleNavigation("/admin/Students")}>
                Students
              </DropdownItem>
              <DropdownItem onClick={() => handleNavigation("/admin/Teachers")}>
                Teachers
              </DropdownItem>
            </DropdownMenu>
          )}
          <SidebarNavItem
            className={isActive("/admin/Assignment") ? "active" : ""}
            onClick={() => handleNavigation("/admin/Assignment")}
          >
            <SidebarIcon>
              <BsFileText />
            </SidebarIcon>
            Assignment
          </SidebarNavItem>
          <SidebarNavItem
            className={isActive("/admin/Exam") ? "active" : ""}
            onClick={() => handleNavigation("/admin/Exam")}
          >
            <SidebarIcon>
              <BsBook />
            </SidebarIcon>
            Exams
          </SidebarNavItem>
          {/* <SidebarNavItem
            className={isActive("/admin/Performance") ? "active" : ""}
            onClick={() => handleNavigation("/admin/Performance")}
          >
            <SidebarIcon>
              <BsGraphDown />
            </SidebarIcon>
            Performance
          </SidebarNavItem> */}
          <SidebarNavItem
            className={isActive("/admin/Attendance") ? "active" : ""}
            onClick={() => handleNavigation("/admin/Attendance")}
          >
            <SidebarIcon>
              <BsCalendar />
            </SidebarIcon>
            Attendance
          </SidebarNavItem>
          <SidebarNavItem
            className={isActive("/admin/Library") ? "active" : ""}
            onClick={() => handleNavigation("/admin/Library")}
          >
            <SidebarIcon>
              <BsBook />
            </SidebarIcon>
            Library
          </SidebarNavItem>
          <SidebarNavItem
            className={isActive("/admin/Announcement") ? "active" : ""}
            onClick={() => handleNavigation("/admin/Announcement")}
          >
            <SidebarIcon>
              <BsChatDots />
            </SidebarIcon>
            Announcement
          </SidebarNavItem>
          <SidebarNavItem
            className={isActive("/admin/EventCalender") ? "active" : ""}
            onClick={() => handleNavigation("/admin/EventCalender")}
          >
            <SidebarIcon>
              <BsCalendarEvent />
            </SidebarIcon>
            Events & Calendar
          </SidebarNavItem>
          <SidebarNavItem
            className={isActive("/admin/Profile") ? "active" : ""}
            onClick={() => handleNavigation("/admin/Profile")}
          >
            <SidebarIcon>
              <BsGear />
            </SidebarIcon>
            Settings & Profile
          </SidebarNavItem>

          <SidebarNavItem
            className={isActive("/choose-user") ? "active" : ""}
            onClick={handleLogout}
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

      {/* <ToastContainer /> */}
    </>
  );
};

export default AdminSidebar;
