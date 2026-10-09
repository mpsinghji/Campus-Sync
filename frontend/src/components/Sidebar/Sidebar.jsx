import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  SidebarContainer,
  SidebarHeader,
  SidebarNav,
  SidebarNavItem,
  SidebarIcon,
  SidebarFooter,
  Logo,
  DropdownMenu,
  DropdownItem,
} from "../../styles/SidebarStyles";
import {
  BsGraphUp,
  BsFileText,
  BsBook,
  BsCalendar,
  BsGear,
  BsChatDots,
  BsCalendarEvent,
  BsBoxArrowRight,
  BsPeople,
  BsShieldLock,
  BsPersonBadge,
} from "react-icons/bs";
import { FaUserPlus } from "react-icons/fa";
import { IoIosArrowDropdown, IoIosArrowForward } from "react-icons/io";
import { CgUserRemove } from "react-icons/cg";
import { MdPayment } from "react-icons/md";
import Cookies from "js-cookie";
import bg1 from "../../assets/bg1.png";
import LogoutModal from "../Logout/logOut";
import { resetAuthVerification } from "../AuthGuard";
import { adminLogout } from "../../redux/Actions/adminActions";
import { teacherLogout } from "../../redux/Actions/teacherActions";
import { studentLogout } from "../../redux/Actions/studentActions";

// Role-specific configuration dictionary
export const ROLE_CONFIGS = {
  admin: {
    roleName: "admin",
    title: null, // Admin original header only displayed logo
    dashboardPath: "/admin/dashboard",
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: BsGraphUp,
        path: "/admin/dashboard",
      },
      {
        id: "users-group",
        label: "Users & Admissions",
        icon: BsPeople,
        isDropdown: true,
        children: [
          { label: "Students Directory", path: "/admin/Students" },
          { label: "Faculty Directory", path: "/admin/Teachers" },
          { label: "Register Student", path: "/student-register" },
          { label: "Register Faculty", path: "/teacher-register" },
          { label: "Register Admin", path: "/admin-register" },
        ],
      },
      {
        id: "academics-group",
        label: "Academics",
        icon: BsBook,
        isDropdown: true,
        children: [
          { label: "Attendance", path: "/admin/Attendance" },
          { label: "Exams & Results", path: "/admin/Exam" },
          { label: "Assignments", path: "/admin/Assignment" },
          { label: "Class Schedules", path: "/admin/Classes" },
        ],
      },
      {
        id: "campus-group",
        label: "Campus Operations",
        icon: BsCalendarEvent,
        isDropdown: true,
        children: [
          { label: "Library Management", path: "/admin/Library" },
          { label: "Accounts & Fees", path: "/admin/accounts-fees" },
          { label: "Events & Calendar", path: "/admin/EventCalender" },
          { label: "Announcements", path: "/admin/Announcement" },
        ],
      },
      {
        id: "settings",
        label: "Settings & Profile",
        icon: BsGear,
        path: "/admin/Profile",
      },
    ],
    logoutAction: adminLogout,
  },
  teacher: {
    roleName: "teacher",
    title: "Teacher",
    dashboardPath: "/teacher/dashboard",
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: BsGraphUp,
        path: "/teacher/dashboard",
      },
      {
        id: "students",
        label: "Students",
        icon: BsPeople,
        path: "/teacher/students",
      },
      {
        id: "assignments",
        label: "Assignments",
        icon: BsFileText,
        path: "/teacher/assignments",
      },
      {
        id: "exams",
        label: "Exams",
        icon: BsBook,
        path: "/teacher/exams",
      },
      {
        id: "attendance",
        label: "Attendance",
        icon: BsCalendar,
        path: "/teacher/attendance",
      },
      {
        id: "announcement",
        label: "Announcement",
        icon: BsChatDots,
        path: "/teacher/communication",
      },
      {
        id: "events",
        label: "Events & Calendar",
        icon: BsCalendarEvent,
        path: "/teacher/events",
      },
      {
        id: "library",
        label: "Library Management",
        icon: BsBook,
        path: "/teacher/library",
      },
      {
        id: "settings",
        label: "Settings & Profile",
        icon: BsGear,
        path: "/teacher/settings",
      },
    ],
    logoutAction: teacherLogout,
  },
  student: {
    roleName: "student",
    title: "Student",
    dashboardPath: "/student/dashboard",
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: BsGraphUp,
        path: "/student/dashboard",
      },
      {
        id: "assignments",
        label: "Assignments",
        icon: BsFileText,
        path: "/student/assignments",
      },
      {
        id: "exams",
        label: "Exams",
        icon: BsBook,
        path: "/student/exams",
      },
      {
        id: "attendance",
        label: "Attendance",
        icon: BsCalendar,
        path: "/student/attendance",
      },
      {
        id: "library",
        label: "Library",
        icon: BsBook,
        path: "/student/library",
      },
      {
        id: "fees",
        label: "Fees",
        icon: MdPayment,
        path: "/student/fees",
      },
      {
        id: "announcement",
        label: "Announcement",
        icon: BsChatDots,
        path: "/student/communication",
      },
      {
        id: "events",
        label: "Events & Calendar",
        icon: BsCalendarEvent,
        path: "/student/EventCalendar",
      },
      {
        id: "directory",
        label: "Campus Directory",
        icon: BsPeople,
        path: "/student/directory",
      },
      {
        id: "settings",
        label: "Profile",
        icon: BsGear,
        path: "/student/settings",
      },
    ],
    logoutAction: studentLogout,
  },
};

const STORAGE_KEY = "campus_sync_open_dropdowns";

const getSavedDropdowns = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

const saveDropdowns = (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { }
};

const UnifiedSidebar = ({ role: propRole }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Load initial dropdown state from persistent storage
  const [openDropdowns, setOpenDropdowns] = useState(() => getSavedDropdowns());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sessionRemaining, setSessionRemaining] = useState(null);
  const [matrixPermissions, setMatrixPermissions] = useState(() => {
    try {
      const saved = localStorage.getItem("role_sidebar_permissions");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Listen for real-time permission matrix changes from Master Control
  useEffect(() => {
    const handlePermUpdate = () => {
      try {
        const saved = localStorage.getItem("role_sidebar_permissions");
        if (saved) setMatrixPermissions(JSON.parse(saved));
      } catch { }
    };
    window.addEventListener("campus_sync_permissions_updated", handlePermUpdate);
    return () => window.removeEventListener("campus_sync_permissions_updated", handlePermUpdate);
  }, []);

  // Auto-detect role from URL if not passed explicitly as prop
  const currentRole = useMemo(() => {
    if (propRole && ROLE_CONFIGS[propRole.toLowerCase()]) {
      return propRole.toLowerCase();
    }
    const path = location.pathname.toLowerCase();
    if (
      path.startsWith("/admin") ||
      path.startsWith("/master-control") ||
      path.startsWith("/super-admin") ||
      path.includes("admin-register") ||
      path.includes("student-register") ||
      path.includes("teacher-register")
    ) {
      return "admin";
    }
    if (path.startsWith("/teacher")) {
      return "teacher";
    }
    if (path.startsWith("/student")) {
      return "student";
    }
    return "admin";
  }, [propRole, location.pathname]);

  const config = ROLE_CONFIGS[currentRole] || ROLE_CONFIGS.admin;

  // Check if current logged-in user is Super Admin (admin@campus-sync.com)
  const isSuperAdmin = useMemo(() => {
    try {
      const data = Cookies.get("adminData");
      if (data) {
        const parsed = JSON.parse(data);
        return parsed.email?.toLowerCase().trim() === "admin@campus-sync.com";
      }
    } catch { }
    return false;
  }, [location.pathname]);

  // Identify specific role key for Matrix RBAC lookup
  const resolvedRoleKey = useMemo(() => {
    if (currentRole === "admin") {
      try {
        const raw = Cookies.get("adminData");
        if (raw) {
          const parsed = JSON.parse(raw);
          const dept = (parsed.department || "").toLowerCase();
          const desig = (parsed.designation || "").toLowerCase();
          if (dept.includes("account") || dept.includes("finance") || desig.includes("account") || desig.includes("finance")) {
            return "AccountsOfficer";
          }
          if (dept.includes("registrar") || desig.includes("registrar") || desig.includes("admission")) {
            return "StudentRegistrar";
          }
          if (dept.includes("exam") || desig.includes("exam")) {
            return "ExamController";
          }
        }
      } catch {}
      return "Administrator";
    }

    if (currentRole === "teacher") {
      try {
        const raw = Cookies.get("teacherData");
        if (raw) {
          const parsed = JSON.parse(raw);
          const resp = (parsed.responsibility || parsed.user?.responsibility || "").toLowerCase();
          if (resp.includes("account") || resp.includes("finance")) return "AccountsOfficer";
          if (resp.includes("librarian")) return "Librarian";
          if (resp.includes("exam")) return "ExamController";
          if (resp.includes("event")) return "EventCoordinator";
          if (resp.includes("registrar")) return "StudentRegistrar";
        }
      } catch {}
      return "Teacher";
    }

    if (currentRole === "student") {
      return "Student";
    }

    return "Administrator";
  }, [currentRole, location.pathname]);

  const itemsToRender = useMemo(() => {
    // Deep clone items and dropdown children so modifications don't mutate ROLE_CONFIGS
    let list = config.items.map((item) => ({
      ...item,
      children: item.children ? [...item.children] : undefined,
    }));

    // Master Control item for Super Admin
    if (currentRole === "admin" && isSuperAdmin) {
      if (!list.some((item) => item.id === "master-control")) {
        const settingsIdx = list.findIndex((i) => i.id === "settings");
        const insertIdx = settingsIdx >= 0 ? settingsIdx : list.length;
        list.splice(insertIdx, 0, {
          id: "master-control",
          label: "Master Control",
          icon: BsShieldLock,
          isDropdown: true,
          children: [
            { label: "Overview & Dashboard", path: "/master-control?tab=overview" },
            { label: "Universal Users & Directory", path: "/master-control?tab=users" },
            { label: "IP Security & Firewall (SOC)", path: "/master-control?tab=ipSecurity" },
            { label: "Role Sidebar Matrix (RBAC)", path: "/master-control?tab=matrix" },
            { label: "Security & System Parameters", path: "/master-control?tab=security" },
            { label: "Tuition & Fee Structures", path: "/master-control?tab=feeRates" },
          ],
        });
      }
    }

    const isAccountsUser = resolvedRoleKey === "AccountsOfficer";

    // Dynamic filtering according to Super Admin Matrix Permissions
    const p = matrixPermissions ? matrixPermissions[resolvedRoleKey] : null;

    if (currentRole === "admin" && !isSuperAdmin) {
      list = list
        .map((item) => {
          if (item.id === "dashboard") {
            if (p && p.dashboard === false) return null;
            return item;
          }

          if (item.id === "users-group") {
            if (p && p.users === false) return null;
            let children = item.children || [];

            // Accounts Department isolation: Remove registration of all three roles
            if (isAccountsUser) {
              children = children.filter(
                (c) => !["/student-register", "/teacher-register", "/admin-register"].includes(c.path)
              );
            } else if (p) {
              children = children.filter((c) => {
                if (c.path === "/admin/Students") return p.users_studentsDir !== false;
                if (c.path === "/admin/Teachers") return p.users_facultyDir !== false;
                if (c.path === "/student-register") return p.users_registerStudent !== false;
                if (c.path === "/teacher-register") return p.users_registerFaculty !== false;
                if (c.path === "/admin-register") return p.users_registerAdmin !== false;
                return true;
              });
            }

            if (children.length === 0) return null;
            return { ...item, children };
          }

          if (item.id === "academics-group") {
            // Accounts Department isolation: No attendance, exams, assignments, or class schedules
            if (isAccountsUser) return null;
            if (p && p.academics === false) return null;

            let children = item.children || [];
            if (p) {
              children = children.filter((c) => {
                if (c.path === "/admin/Attendance") return p.academics_attendance !== false;
                if (c.path === "/admin/Exam") return p.academics_exams !== false;
                if (c.path === "/admin/Assignment") return p.academics_assignments !== false;
                if (c.path === "/admin/Classes") return p.academics_classes !== false;
                return true;
              });
            }

            if (children.length === 0) return null;
            return { ...item, children };
          }

          if (item.id === "campus-group") {
            if (p && p.services === false) return null;
            let children = item.children || [];

            if (isAccountsUser) {
              // Accounts primarily manages Accounts & Fees and Announcements
              children = children.filter((c) => {
                if (c.path === "/admin/Library") return p?.services_library === true;
                if (c.path === "/admin/EventCalender") return p?.services_events === true;
                if (c.path === "/admin/accounts-fees") return p ? p.services_accountsFees !== false : true;
                if (c.path === "/admin/Announcement") return p ? p.services_announcements !== false : true;
                return true;
              });
            } else if (p) {
              children = children.filter((c) => {
                if (c.path === "/admin/Library") return p.services_library !== false;
                if (c.path === "/admin/accounts-fees") return p.services_accountsFees !== false;
                if (c.path === "/admin/EventCalender") return p.services_events !== false;
                if (c.path === "/admin/Announcement") return p.services_announcements !== false;
                return true;
              });
            }

            if (children.length === 0) return null;
            return { ...item, children };
          }

          if (item.id === "settings") {
            if (p && p.settings === false) return null;
            return item;
          }

          return item;
        })
        .filter(Boolean);
    } else if (currentRole === "teacher") {
      // Teacher portal responsibility & granular permissions
      list = list.filter((item) => {
        if (p) {
          if (item.id === "dashboard") return p.dashboard !== false;
          if (item.id === "students") return p.users !== false && p.users_studentsDir !== false;
          if (item.id === "assignments") return p.academics !== false && p.academics_assignments !== false;
          if (item.id === "exams") return p.academics !== false && p.academics_exams !== false;
          if (item.id === "attendance") return p.academics !== false && p.academics_attendance !== false;
          if (item.id === "announcement") return p.services !== false && p.services_announcements !== false;
          if (item.id === "events") return p.services !== false && p.services_events !== false;
          if (item.id === "library") return p.services !== false && p.services_library !== false;
          if (item.id === "settings") return p.settings !== false;
        }

        // Fallback responsibility isolation if matrix not set
        if (resolvedRoleKey === "Librarian") {
          return ["dashboard", "library", "announcement", "settings"].includes(item.id);
        } else if (resolvedRoleKey === "ExamController") {
          return ["dashboard", "exams", "announcement", "settings"].includes(item.id);
        } else if (resolvedRoleKey === "EventCoordinator") {
          return ["dashboard", "events", "announcement", "settings"].includes(item.id);
        } else if (resolvedRoleKey === "StudentRegistrar") {
          return ["dashboard", "students", "announcement", "settings"].includes(item.id);
        } else if (resolvedRoleKey === "AccountsOfficer") {
          return ["dashboard", "announcement", "settings"].includes(item.id);
        }
        return item.id !== "library";
      });
    } else if (currentRole === "student") {
      if (p) {
        list = list.filter((item) => {
          if (item.id === "dashboard") return p.dashboard !== false;
          if (item.id === "directory") return p.users !== false && p.users_studentsDir !== false;
          if (item.id === "assignments") return p.academics !== false && p.academics_assignments !== false;
          if (item.id === "exams") return p.academics !== false && p.academics_exams !== false;
          if (item.id === "attendance") return p.academics !== false && p.academics_attendance !== false;
          if (item.id === "library") return p.services !== false && p.services_library !== false;
          if (item.id === "fees") return p.services !== false && p.services_accountsFees !== false;
          if (item.id === "announcement") return p.services !== false && p.services_announcements !== false;
          if (item.id === "events") return p.services !== false && p.services_events !== false;
          if (item.id === "settings") return p.settings !== false;
          return true;
        });
      }

      try {
        const raw = Cookies.get("studentData");
        if (raw) {
          const parsed = JSON.parse(raw);
          const blocked = parsed.blockedModules || parsed.user?.blockedModules || [];
          if (Array.isArray(blocked) && blocked.length > 0) {
            list = list.filter((i) => !blocked.includes(i.id));
          }
        }
      } catch (e) {}
    }

    return list;
  }, [config.items, currentRole, isSuperAdmin, matrixPermissions, resolvedRoleKey]);

  const isPathActive = (path) => {
    if (!path) return false;
    const currPath = location.pathname.toLowerCase();
    const currSearch = location.search.toLowerCase();
    const p = path.toLowerCase();

    // Query-specific path match (e.g. /master-control?tab=users)
    if (p.includes("?")) {
      const [pBase, pQuery] = p.split("?");
      if (currPath === pBase) {
        if (pQuery === "tab=overview") {
          return !currSearch || currSearch.includes("tab=overview");
        }
        return currSearch.includes(pQuery);
      }
      return false;
    }

    if (currPath === p) {
      if (p === "/master-control" && currSearch && !currSearch.includes("tab=overview")) return false;
      return true;
    }
    if (p === "/master-control" && (currPath === "/admin/master-control" || currPath === "/super-admin")) return true;
    if (p === "/admin/master-control" && (currPath === "/master-control" || currPath === "/super-admin")) return true;
    return false;
  };

  // Auto-expand dropdown containing the active route
  useEffect(() => {
    itemsToRender.forEach((item) => {
      if (item.isDropdown && item.children) {
        const hasActiveChild = item.children.some((child) => isPathActive(child.path));
        if (hasActiveChild) {
          setOpenDropdowns((prev) => {
            if (!prev[item.id]) {
              const updated = { ...prev, [item.id]: true };
              saveDropdowns(updated);
              return updated;
            }
            return prev;
          });
        }
      }
    });
  }, [location.pathname, location.search, itemsToRender]);

  const handleNavigation = (path) => {
    navigate(path);
  };

  // Toggle dropdown explicitly on click - stays open if opened, stays closed if closed
  const toggleDropdown = (id) => {
    setOpenDropdowns((prev) => {
      const updated = {
        ...prev,
        [id]: !prev[id],
      };
      saveDropdowns(updated);
      return updated;
    });
  };

  const handleLogout = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = (status) => {
    setIsModalOpen(status);
  };

  const handleConfirmLogout = async () => {
    try {
      resetAuthVerification();
      localStorage.removeItem(STORAGE_KEY);
      if (config.logoutAction) {
        await dispatch(config.logoutAction());
      }
    } catch (error) {
      console.error(`Logout error for ${currentRole}:`, error);
    } finally {
      setIsModalOpen(false);
      window.location.href = "/choose-user";
    }
  };

  // Live session timer & automatic validation
  useEffect(() => {
    const calculateSession = () => {
      try {
        let token = null;
        if (currentRole === "admin") {
          token = Cookies.get("adminToken") || localStorage.getItem("adminToken");
        } else if (currentRole === "teacher") {
          token = Cookies.get("teacherToken") || localStorage.getItem("teacherToken");
        } else if (currentRole === "student") {
          token = Cookies.get("studentToken") || localStorage.getItem("studentToken");
        }

        if (!token) {
          const cookieName = currentRole + "Data";
          const raw = Cookies.get(cookieName);
          if (raw) {
            const parsed = JSON.parse(raw);
            token = parsed.token;
          }
        }

        if (token && token.includes(".")) {
          const parts = token.split(".");
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            if (payload && payload.exp) {
              const nowSec = Math.floor(Date.now() / 1000);
              const diffSec = payload.exp - nowSec;

              if (diffSec <= 0) {
                console.warn("Session expired! Auto-redirecting to login.");
                resetAuthVerification();
                localStorage.removeItem(STORAGE_KEY);
                window.location.href = "/choose-user";
                return;
              }

              const days = Math.floor(diffSec / 86400);
              const hours = Math.floor((diffSec % 86400) / 3600);
              const minutes = Math.floor((diffSec % 3600) / 60);

              let formatted = "";
              if (days > 0) {
                formatted = `${days}d ${hours}h`;
              } else if (hours > 0) {
                formatted = `${hours}h ${minutes}m`;
              } else {
                formatted = `${minutes}m ${diffSec % 60}s`;
              }

              setSessionRemaining(formatted);
            }
          }
        }
      } catch (err) {
        // Safe failover
      }
    };

    calculateSession();
    const timer = setInterval(calculateSession, 15000);
    return () => clearInterval(timer);
  }, [currentRole]);

  return (
    <>
      <SidebarContainer>
        {/* Header / Logo */}
        <SidebarHeader>
          <Logo
            src={bg1}
            alt="CampusSync Logo"
            onClick={() => handleNavigation(config.dashboardPath)}
            style={{ cursor: "pointer" }}
          />
        </SidebarHeader>

        {/* Optional Role Subheader badge for Teacher / Student */}
        {config.title && (
          <SidebarHeader style={{ paddingBottom: "10px" }}>
            {config.title}
          </SidebarHeader>
        )}

        <SidebarNav>
          {itemsToRender.map((item) => {
            const IconComponent = item.icon;

            // Handle Dropdown Item
            if (item.isDropdown) {
              const isOpen = !!openDropdowns[item.id];
              const isChildActive = item.children?.some((child) =>
                isPathActive(child.path)
              );

              return (
                <React.Fragment key={item.id}>
                  <SidebarNavItem
                    className={`sidebar-dropdown ${isChildActive ? "active" : ""}`}
                    active={isChildActive}
                    onClick={() => toggleDropdown(item.id)}
                  >
                    <SidebarIcon>
                      <IconComponent />
                    </SidebarIcon>
                    {item.label}
                    {isOpen ? (
                      <IoIosArrowDropdown style={{ marginLeft: "auto" }} />
                    ) : (
                      <IoIosArrowForward style={{ marginLeft: "auto" }} />
                    )}
                  </SidebarNavItem>

                  {isOpen && item.children && (
                    <DropdownMenu className="sidebar-dropdown">
                      {item.children.map((child) => (
                        <DropdownItem
                          key={child.path}
                          className={isPathActive(child.path) ? "active" : ""}
                          onClick={() => handleNavigation(child.path)}
                        >
                          {child.label}
                        </DropdownItem>
                      ))}
                    </DropdownMenu>
                  )}
                </React.Fragment>
              );
            }

            // Handle Regular Item
            const active = isPathActive(item.path);
            return (
              <SidebarNavItem
                key={item.id || item.path}
                className={active ? "active" : ""}
                active={active}
                onClick={() => handleNavigation(item.path)}
              >
                <SidebarIcon>
                  <IconComponent />
                </SidebarIcon>
                {item.label}
              </SidebarNavItem>
            );
          })}
        </SidebarNav>

        {/* Sticky Sidebar Bottom Section */}
        <SidebarFooter>
          {sessionRemaining && (
            <div
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                background: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                color: "#94a3b8",
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontWeight: 500,
              }}
            >
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#10b981",
                  boxShadow: "0 0 6px rgba(16, 185, 129, 0.6)",
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
              <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                Session: {sessionRemaining} remaining
              </span>
            </div>
          )}

          <SidebarNavItem
            style={{
              borderBottom: "none",
              padding: "10px 14px",
              borderRadius: "8px",
              fontSize: "15px",
              color: "#ef4444",
            }}
            className={isPathActive("/choose-user") ? "active" : ""}
            onClick={handleLogout}
          >
            <SidebarIcon style={{ color: "#ef4444" }}>
              <BsBoxArrowRight />
            </SidebarIcon>
            Log Out
          </SidebarNavItem>
        </SidebarFooter>

        {isModalOpen && (
          <LogoutModal
            onClose={handleCloseModal}
            onConfirm={handleConfirmLogout}
          />
        )}
      </SidebarContainer>
    </>
  );
};

export default UnifiedSidebar;
