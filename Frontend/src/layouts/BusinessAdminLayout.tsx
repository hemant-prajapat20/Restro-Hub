import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar, Header } from '../components/Navigation';

export const BusinessAdminLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-brand-bg select-none">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Header />
        <main className="relative h-[calc(100vh-80px)] overflow-hidden ml-64">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
