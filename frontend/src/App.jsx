import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';

// 16 Complete Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AssetManagementPage from './pages/AssetManagementPage';
import AddAssetPage from './pages/AddAssetPage';
import EditAssetPage from './pages/EditAssetPage';
import AssetDetailsPage from './pages/AssetDetailsPage';
import InventoryListPage from './pages/InventoryListPage';
import PersonnelManagementPage from './pages/PersonnelManagementPage';
import VehicleManagementPage from './pages/VehicleManagementPage';
import EquipmentManagementPage from './pages/EquipmentManagementPage';
import MaintenanceRecordsPage from './pages/MaintenanceRecordsPage';
import AssetTransferPage from './pages/AssetTransferPage';
import ReportsPage from './pages/ReportsPage';
import NotificationsPage from './pages/NotificationsPage';
import UserProfilePage from './pages/UserProfilePage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage initialMode="login" />} />
          <Route path="/register" element={<LoginPage initialMode="register" />} />
          <Route path="/auth" element={<LoginPage initialMode="login" />} />

          {/* Protected Command HQ Routes */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/assets" element={<AssetManagementPage />} />
            <Route path="/assets/new" element={<AddAssetPage />} />
            <Route path="/assets/edit/:id" element={<EditAssetPage />} />
            <Route path="/assets/:id" element={<AssetDetailsPage />} />
            <Route path="/inventory" element={<InventoryListPage />} />
            <Route path="/personnel" element={<PersonnelManagementPage />} />
            <Route path="/vehicles" element={<VehicleManagementPage />} />
            <Route path="/equipment" element={<EquipmentManagementPage />} />
            <Route path="/maintenance" element={<MaintenanceRecordsPage />} />
            <Route path="/transfers" element={<AssetTransferPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/profile" element={<UserProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Fallback to Login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
