import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar, Header } from '../components/Navigation';

const getTitleFromPath = (pathname: string) => {
  const view = pathname.split('/').pop() || 'dashboard';
  switch (view) {
    case 'dashboard': return 'Operational Analytics';
    case 'pos': return 'Industrial POS Billing';
    case 'restro': return 'Signature Fine-Dining';
    case 'bar': return 'Bar Cellar & Lounge';
    case 'cafe': return 'Cafe Extraction & Patisserie';
    case 'menu': return 'Enterprise Menu Management';
    case 'tables': return 'Table Management & Flow';
    case 'kds': return 'Kitchen Display System';
    case 'delivery': return 'Delivery Management Hub';
    case 'qrmenu': return 'Customer QR Ordering Experience';
    case 'inventory': return 'Enterprise Inventory';
    case 'staff': return 'Crew Directory & Shift Calendar';
    case 'reports': return 'Financial Reports & GST';
    case 'customers': return 'Customer CRM & Loyalty';
    default: return 'Dashboard';
  }
};

export const BusinessAdminLayout: React.FC = () => {
  const location = useLocation();
  const title = getTitleFromPath(location.pathname);

  return (
    <div className="flex h-screen bg-brand-bg select-none">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Header title={title} />
        <main className="relative h-[calc(100vh-80px)] overflow-hidden ml-64">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
