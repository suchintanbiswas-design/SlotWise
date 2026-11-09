import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';
import { Layout } from './components/Layout';
import { useTheme } from './context/ThemeContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Resources from './pages/Resources';
import Bookings from './pages/Bookings';
import AdminDashboard from './pages/AdminDashboard';

const App: React.FC = () => {
    const { isDark } = useTheme();

    return (
        <BrowserRouter>
            <Toaster
                position="top-right"
                toastOptions={{
                    className: isDark
                        ? '!bg-slate-900 !text-slate-100 !border !border-slate-800 !shadow-soft'
                        : '!bg-white !text-slate-900 !shadow-soft',
                    duration: 4000,
                }}
            />
            <Routes>
                {/* Public Authentication Routes */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Authenticated Routes with Sidebar App Shell */}
                <Route element={<ProtectedRoute />}>
                    <Route element={<Layout />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/resources" element={<Resources />} />
                        <Route path="/bookings" element={<Bookings />} />

                        {/* Admin / Faculty Route */}
                        <Route element={<AdminRoute />}>
                            <Route path="/admin/dashboard" element={<AdminDashboard />} />
                        </Route>
                    </Route>
                </Route>

                {/* Catch-all redirect */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;
