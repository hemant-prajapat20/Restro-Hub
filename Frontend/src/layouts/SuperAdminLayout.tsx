import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { SuperAdminSidebar, SuperAdminHeader } from '../components/SuperAdminNavigation';

export const SuperAdminLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-brand-bg select-none">
      <SuperAdminSidebar />
      <div className="flex-1 min-w-0">
        <SuperAdminHeader />
        <main className="relative h-[calc(100vh-80px)] overflow-hidden lg:ml-64 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
