import React from 'react';
import { HashRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './components/dashboard/Dashboard';
import StockPage from './components/stock/StockPage';
import SuppliersPage from './components/suppliers/SuppliersPage';
import FinancePage from './components/finance/FinancePage';
import StaffPage from './components/staff/StaffPage';
import OrdersPage from './components/orders/OrdersPage';
import ReportsPage from './components/reports/ReportsPage';
import SalesReport from './components/reports/SalesReport';
import { AuthProvider } from './components/auth/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import UnauthorizedPage from './components/auth/UnauthorizedPage';
import './index.css';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/stock" element={<StockPage />} />
                <Route path="/orders" element={
                  <ProtectedRoute allowedRoles={['Admin', 'Warehouse Staff']}>
                    <OrdersPage />
                  </ProtectedRoute>
                } />
                <Route path="/suppliers" element={
                  <ProtectedRoute allowedRoles={['Admin', 'Warehouse Staff']}>
                    <SuppliersPage />
                  </ProtectedRoute>
                } />
                <Route path="/finance" element={
                  <ProtectedRoute allowedRoles={['Admin', 'Sales Rep']}>
                    <FinancePage />
                  </ProtectedRoute>
                } />
                <Route path="/staff" element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <StaffPage />
                  </ProtectedRoute>
                } />
                 <Route path="/reports" element={
                  <ProtectedRoute allowedRoles={['Admin', 'Sales Rep']}>
                    <ReportsPage />
                  </ProtectedRoute>
                } />
                <Route path="/reports/sales" element={
                  <ProtectedRoute allowedRoles={['Admin', 'Sales Rep']}>
                    <SalesReport />
                  </ProtectedRoute>
                } />
                <Route path="/unauthorized" element={<UnauthorizedPage />} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;