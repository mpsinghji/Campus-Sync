import React, { useContext } from "react";
import UnifiedSidebar from "../../components/Sidebar/Sidebar";
import { SidebarContext } from "../../components/Layout/DashboardLayout";

const TeacherSidebar = (props) => {
  const isInsideLayout = useContext(SidebarContext);

  if (isInsideLayout) {
    // Persistent sidebar is active in DashboardLayout; avoid extra spacer
    return null;
  }

  return <UnifiedSidebar role="teacher" {...props} />;
};

export default TeacherSidebar;
