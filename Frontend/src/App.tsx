import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

// Layouts and Auth (Keep static for fast initial load)
import { Login } from './views/auth/Login';
import { Register } from './views/auth/Register';
import { SystemOwnerLogin } from './views/auth/SystemOwnerLogin';
import { BusinessAdminLayout } from './layouts/BusinessAdminLayout';
import { SuperAdminLayout } from './layouts/SuperAdminLayout';

// Super Admin Views (Lazy Loaded)
const SuperAdminDashboard = lazy(() => import('./views/superadmin/Dashboard').then(module => ({ default: module.SuperAdminDashboard })));
const Businesses = lazy(() => import('./views/superadmin/Businesses').then(module => ({ default: module.Businesses })));
const Subscriptions = lazy(() => import('./views/superadmin/Subscriptions').then(module => ({ default: module.Subscriptions })));
const Settings = lazy(() => import('./views/superadmin/Settings').then(module => ({ default: module.Settings })));
const MessageCenter = lazy(() => import('./views/superadmin/MessageCenter').then(module => ({ default: module.MessageCenter })));

// Business Admin Views (Lazy Loaded)
const Dashboard = lazy(() => import('./views/businessAdmin/Dashboard').then(module => ({ default: module.Dashboard })));
const POS = lazy(() => import('./views/businessAdmin/POS').then(module => ({ default: module.POS })));
const RestroSignature = lazy(() => import('./views/businessAdmin/RestroSignature').then(module => ({ default: module.RestroSignature })));
const BarLounge = lazy(() => import('./views/businessAdmin/BarLounge').then(module => ({ default: module.BarLounge })));
const CafeBakery = lazy(() => import('./views/businessAdmin/CafeBakery').then(module => ({ default: module.CafeBakery })));
const MenuManagement = lazy(() => import('./views/businessAdmin/MenuManagement').then(module => ({ default: module.MenuManagement })));
const Tables = lazy(() => import('./views/businessAdmin/Tables').then(module => ({ default: module.Tables })));
const KDS = lazy(() => import('./views/businessAdmin/KDS').then(module => ({ default: module.KDS })));
const Delivery = lazy(() => import('./views/businessAdmin/Delivery').then(module => ({ default: module.Delivery })));
const QRMenu = lazy(() => import('./views/businessAdmin/QRMenu').then(module => ({ default: module.QRMenu })));
const Inventory = lazy(() => import('./views/businessAdmin/Inventory').then(module => ({ default: module.Inventory })));
const StaffManagement = lazy(() => import('./views/businessAdmin/StaffManagement').then(module => ({ default: module.StaffManagement })));
const Reports = lazy(() => import('./views/businessAdmin/Reports').then(module => ({ default: module.Reports })));
const BusinessSettings = lazy(() => import('./views/businessAdmin/Settings').then(module => ({ default: module.Settings })));
const Transactions = lazy(() => import('./views/businessAdmin/Transactions').then(module => ({ default: module.Transactions })));
const BusinessMessageCenter = lazy(() => import('./views/businessAdmin/MessageCenter').then(module => ({ default: module.MessageCenter })));
const InvoiceView = lazy(() => import('./views/businessAdmin/InvoiceView').then(module => ({ default: module.InvoiceView })));
const Customers = lazy(() => import('./views/businessAdmin/Customers').then(module => ({ default: module.Customers })));

// Customer Views (Lazy Loaded)
const CustomerDashboard = lazy(() => import('./views/customer/CustomerDashboard').then(module => ({ default: module.CustomerDashboard })));
const CustomerPanel = lazy(() => import('./views/customer/CustomerPanel').then(module => ({ default: module.CustomerPanel })));

const queryClient = new QueryClient();

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
  </div>
);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" />
      <BrowserRouter>
        <Suspense fallback={<LoadingFallback />}>
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
            <Route path="/customer/dashboard" element={<CustomerPanel />} />
            <Route path="/customer/order/:businessId" element={<CustomerDashboard />} />

            {/* Business Admin / Staff Routes */}
            <Route path="/admin" element={<BusinessAdminLayout />}>
              <Route index element={<Navigate to="/admin/tables" replace />} />
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
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
