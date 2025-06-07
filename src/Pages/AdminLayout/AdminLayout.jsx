import React from 'react';
import { Outlet } from 'react-router-dom';
import SidebarAdmin from '../../components/SidebarAdmin/SidebarAdmin';

const AdminLayout = () => {
  return (
    <div className="flex">
      {/* Sidebar yang posisinya sudah fixed */}
      <SidebarAdmin />

      {/* [PERUBAHAN UTAMA DI SINI] */}
      <main className="flex-1 ml-64 bg-gray-100 dark:bg-gray-900 min-h-screen transition-colors duration-300">
        <div className="p-6 max-w-7xl mx-auto">
          <Outlet /> 
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;