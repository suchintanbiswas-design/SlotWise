import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const AdminRoute: React.FC = () => {
    const { user, isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    const hasAdminAccess = user?.roles.includes('ADMIN') || user?.roles.includes('FACULTY');
    return hasAdminAccess ? <Outlet /> : <Navigate to="/dashboard" replace />;
};

