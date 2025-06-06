import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ResidentsList from './pages/ResidentsList';
import ResidentDetail from './pages/ResidentDetail';
import AddResident from './pages/AddResident';
import Payments from './pages/Payments';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="residents" element={<ResidentsList />} />
        <Route path="residents/add" element={<AddResident />} />
        <Route path="residents/:id" element={<ResidentDetail />} />
        <Route path="payments" element={<Payments />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/\" replace />} />
      </Route>
    </Routes>
  );
}

export default App;