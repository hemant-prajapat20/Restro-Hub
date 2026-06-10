import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar, Header } from '../components/Navigation';

export const BusinessAdminLayout: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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
          <Outlet />
        </main>
      </div>
    </div>
  );
};
