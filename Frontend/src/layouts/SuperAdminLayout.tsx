import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Sidebar as SuperAdminSidebar, Header as SuperAdminHeader } from '../components/Navigation';

export const SuperAdminLayout: React.FC = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  if (!isAuthenticated || user?.role !== 'SUPER_ADMIN') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-brand-bg select-none">
      <SuperAdminSidebar 
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />
      
      {/* Mobile Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <div className="flex-1 min-w-0">
        <SuperAdminHeader 
          onOpenSidebar={() => setIsMobileSidebarOpen(true)}
        />
        <main className="relative h-[calc(100vh-80px)] overflow-hidden lg:ml-64 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
