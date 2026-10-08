import React, { useContext } from "react";
import UnifiedSidebar from "../../components/Sidebar/Sidebar";
import { SidebarContext } from "../../components/Layout/DashboardLayout";

const AdminSidebar = (props) => {
  const isInsideLayout = useContext(SidebarContext);

  if (isInsideLayout) {
    // Persistent sidebar is already rendered by DashboardLayout
    return null;
  }

  return <UnifiedSidebar role="admin" {...props} />;
};

export default AdminSidebar;
