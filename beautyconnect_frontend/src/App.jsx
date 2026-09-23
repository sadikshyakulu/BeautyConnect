import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import AuthPage from './auth/AuthPage';

// Simple placeholder views for dashboard verification
const DashboardPlaceholder = ({ title, role }) => {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-[#fff8f8] p-8 text-[#1f1a1b]">
      <div className="max-w-4xl mx-auto glass-panel p-8 rounded-3xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="font-headline text-3xl font-bold text-[#954741]">{title}</h1>
          <button
            onClick={logout}
            className="px-5 py-2.5 rounded-full bg-[#f6ebec] text-[#544341] hover:bg-[#ffdad6] hover:text-[#ba1a1a] font-semibold text-xs transition-colors"
          >
            Sign Out
          </button>
        </div>
        <div className="p-4 rounded-2xl bg-white/60 border border-[#dac1be]/40 text-sm">
          <p><strong>Authenticated User:</strong> {user?.email}</p>
          <p><strong>Assigned Role:</strong> {user?.role}</p>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />
          <Route
            path="/customer-dashboard"
            element={<DashboardPlaceholder title="Customer Dashboard" role="Customer" />}
          />
          <Route
            path="/pro-dashboard"
            element={<DashboardPlaceholder title="Professional Studio Dashboard" role="Professional" />}
          />
          <Route
            path="/admin"
            element={<DashboardPlaceholder title="Admin Management Console" role="Admin" />}
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
