import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';

// Pages
import Home from './pages/Home';
import Generator from './pages/Generator';
import Dashboard from './pages/Dashboard';
import RoadmapDetail from './pages/RoadmapDetail';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import Pricing from './pages/Pricing';
import Users from './pages/Users';
import Help from './pages/Help';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-[#0B0914] text-white selection:bg-indigo-500/30">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/pricing" element={<Pricing />} />

            {/* Dashboard & Protected Routes wrapped in DashboardLayout */}
            <Route path="/generator" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Generator />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/roadmap/:id" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <RoadmapDetail />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Settings />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/users" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Users />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/help" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Help />
                </DashboardLayout>
              </ProtectedRoute>
            } />

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
