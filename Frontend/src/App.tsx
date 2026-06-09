import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './views/Login';
import { Register } from './views/Register';
import { SystemOwnerLogin } from './views/SystemOwnerLogin';
import { BusinessAdminLayout } from './layouts/BusinessAdminLayout';
import { SuperAdminLayout } from './layouts/SuperAdminLayout';

// Super Admin Views
import { SuperAdminDashboard } from './views/superadmin/Dashboard';
import { Businesses } from './views/superadmin/Businesses';
import { Subscriptions } from './views/superadmin/Subscriptions';
import { Settings } from './views/superadmin/Settings';
import { MessageCenter } from './views/superadmin/MessageCenter';

// Business Admin Views
import { Dashboard } from './views/Dashboard';
import { POS } from './views/POS';
import { RestroSignature } from './views/RestroSignature';
import { BarLounge } from './views/BarLounge';
import { CafeBakery } from './views/CafeBakery';
import { MenuManagement } from './views/MenuManagement';
import { Tables } from './views/Tables';
import { KDS } from './views/KDS';
import { Delivery } from './views/Delivery';
import { QRMenu } from './views/QRMenu';
import { Inventory } from './views/Inventory';
import { StaffManagement } from './views/StaffManagement';
import { Reports } from './views/Reports';

const CustomersPlaceholder = () => (
  <div className="p-8 text-center">
    <h2 className="text-2xl font-bold">Customer CRM Placeholder</h2>
  </div>
);



const CustomerPlaceholder = () => (
  <div className="p-8 text-center mt-20">
    <h2 className="text-4xl font-bold">Customer Panel</h2>
    <p>View Menus, Place Orders, and Track Loyalty Points</p>
  </div>
);

export default function App() {
  return (
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
          <Route path="customers" element={<CustomersPlaceholder />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
