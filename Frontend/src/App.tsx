
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './views/auth/Login';
import { Register } from './views/auth/Register';
import { SystemOwnerLogin } from './views/auth/SystemOwnerLogin';
import { BusinessAdminLayout } from './layouts/BusinessAdminLayout';
import { SuperAdminLayout } from './layouts/SuperAdminLayout';

// Super Admin Views
import { SuperAdminDashboard } from './views/superadmin/Dashboard';
import { Businesses } from './views/superadmin/Businesses';
import { Subscriptions } from './views/superadmin/Subscriptions';
import { Settings } from './views/superadmin/Settings';
import { MessageCenter } from './views/superadmin/MessageCenter';

// Business Admin Views
import { Dashboard } from './views/businessAdmin/Dashboard';
import { POS } from './views/businessAdmin/POS';
import { RestroSignature } from './views/businessAdmin/RestroSignature';
import { BarLounge } from './views/businessAdmin/BarLounge';
import { CafeBakery } from './views/businessAdmin/CafeBakery';
import { MenuManagement } from './views/businessAdmin/MenuManagement';
import { Tables } from './views/businessAdmin/Tables';
import { KDS } from './views/businessAdmin/KDS';
import { Delivery } from './views/businessAdmin/Delivery';
import { QRMenu } from './views/businessAdmin/QRMenu';
import { Inventory } from './views/businessAdmin/Inventory';
import { StaffManagement } from './views/businessAdmin/StaffManagement';
import { Reports } from './views/businessAdmin/Reports';
import { Settings as BusinessSettings } from './views/businessAdmin/Settings';
import { Transactions } from './views/businessAdmin/Transactions';
import { MessageCenter as BusinessMessageCenter } from './views/businessAdmin/MessageCenter';
import { InvoiceView } from './views/businessAdmin/InvoiceView';

import { Customers } from './views/businessAdmin/Customers';



const CustomerPlaceholder = () => (
  <div className="min-h-[112vh] bg-[#F8FAFC] flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
    <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] bg-brand-accent/5 rounded-full blur-3xl pointer-events-none" />
    <h2 className="text-4xl font-bold text-slate-900 mb-4 z-10">Customer Panel</h2>
    <p className="text-slate-500 z-10">View Menus, Place Orders, and Track Loyalty Points</p>
  </div>
);

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/system-owner" element={<SystemOwnerLogin />} />

        {/* Super Admin Routes */}
        <Route path="/super-admin" element={<SuperAdminLayout />}>
          <Route index element={<Navigate to="/super-admin/dashboard" replace />} />
          <Route path="dashboard" element={<SuperAdminDashboard />} />
          <Route path="businesses" element={<Businesses />} />
          <Route path="subscriptions" element={<Subscriptions />} />
          <Route path="settings" element={<Settings />} />
          <Route path="messages" element={<MessageCenter />} />
        </Route>

        {/* Invoice Print Route */}
        <Route path="/invoice/:id" element={<InvoiceView />} />

        {/* Customer Routes */}
        <Route path="/customer" element={<CustomerPlaceholder />} />

        {/* Business Admin / Staff Routes */}
        <Route path="/admin" element={<BusinessAdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="pos" element={<POS />} />
          <Route path="restro" element={<RestroSignature />} />
          <Route path="bar" element={<BarLounge />} />
          <Route path="cafe" element={<CafeBakery />} />
          <Route path="menu" element={<MenuManagement />} />
          <Route path="tables" element={<Tables />} />
          <Route path="kds" element={<KDS />} />
          <Route path="delivery" element={<Delivery />} />
          <Route path="qrmenu" element={<QRMenu />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="staff" element={<StaffManagement />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<BusinessSettings />} />
          <Route path="customers" element={<Customers />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="messages" element={<BusinessMessageCenter />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
    </QueryClientProvider>
  );
}
