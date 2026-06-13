import React, { useState } from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Sidebar, Header } from '../components/Navigation';
import { DesignProvider } from '../components/DesignProvider';

export const BusinessAdminLayout: React.FC = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const location = useLocation();

  if (!isAuthenticated || (user?.role !== 'BUSINESS_ADMIN' && user?.role !== 'STAFF')) {
    return <Navigate to="/login" replace />;
  }

  const userPlatforms = user?.businessData?.platforms || [];
  const currentPath = location.pathname.split('/').pop();

  if (currentPath === 'restro' && !userPlatforms.includes('Restro')) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  if (currentPath === 'bar' && !userPlatforms.includes('Bar')) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  if (currentPath === 'cafe' && !userPlatforms.includes('Cafe')) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <div className="flex h-screen bg-brand-bg select-none font-sans font-semibold">
      <Sidebar isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />
      
      {/* Mobile Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <div className="flex-1 min-w-0">
        <Header onOpenSidebar={() => setIsMobileSidebarOpen(true)} />
        <main className="relative h-[calc(100vh-80px)] overflow-hidden lg:ml-64">
          <DesignProvider key={location.pathname}>
            <Outlet />
          </DesignProvider>
        </main>
      </div>
    </div>
  );
};
