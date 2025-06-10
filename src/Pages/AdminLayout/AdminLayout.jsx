import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import SidebarAdmin from "../../components/SidebarAdmin/SidebarAdmin";
import { FaBars } from "react-icons/fa";

const AdminLayout = () => {
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isDesktopCollapsed, setDesktopCollapsed] = useState(false);

  return (
    <div className="relative min-h-screen md:flex">
      {isMobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
        ></div>
      )}

      <SidebarAdmin
        isDesktopCollapsed={isDesktopCollapsed}
        setDesktopCollapsed={setDesktopCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      <main
        className={`flex-1 min-h-screen bg-gray-100 dark:bg-gray-900 transition-all duration-300 ${
          isDesktopCollapsed ? "lg:ml-20" : "lg:ml-64"
        }`}
      >
        <div className="sticky top-0 bg-white dark:bg-gray-800 shadow-sm p-4 flex items-center lg:hidden z-10">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="text-gray-700 dark:text-gray-200"
          >
            <FaBars size={24} />
          </button>
          <h1 className="text-lg font-semibold ml-4 text-gray-800 dark:text-gray-100">
            Admin Panel
          </h1>
        </div>

        <div className="p-6 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
