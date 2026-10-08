import React, { createContext } from 'react';
import { Outlet } from 'react-router-dom';
import UnifiedSidebar from '../Sidebar/Sidebar';

// Context to signal child components that a persistent sidebar is active in the layout
export const SidebarContext = createContext(false);

const DashboardLayout = ({ role }) => {
  return (
    <SidebarContext.Provider value={true}>
      <UnifiedSidebar role={role} />
      <Outlet />
    </SidebarContext.Provider>
  );
};

export default DashboardLayout;
