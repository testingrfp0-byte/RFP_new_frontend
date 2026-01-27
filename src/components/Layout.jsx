import React from "react";
import { useTheme } from "../contexts/ThemeContext";
import SideBar from "./SideBar";
import TopBar from "./TopBar";

const Layout = ({ userName, userRole, onLogout, userId, children }) => {
  const { isDarkMode } = useTheme();
  
  return (
    <>
      <div
        className={`flex min-h-screen transition-colors ${
          isDarkMode ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <SideBar userName={userName} userRole={userRole} />
        <div className="flex-1 flex flex-col">
          <TopBar
            userName={userName}
            userRole={userRole}
            onLogout={onLogout}
            userId={userId}
          />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </>
  );
};

export default Layout;
