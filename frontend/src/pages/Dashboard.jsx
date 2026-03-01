import React from 'react';
import { useAuth } from '../context/AuthContext';
import UserDashboardView from '../components/UserDashboardView';
import AdminDashboardView from '../components/AdminDashboardView';

export default function Dashboard() {
    const { user } = useAuth();

    if (!user) return null;

    return (
        <div className="animate-fade-in">
            {/* Strictly render view based on fixed User Role */}
            {user.role === 'ADMIN' ? (
                <AdminDashboardView />
            ) : (
                <UserDashboardView />
            )}
        </div>
    );
}
