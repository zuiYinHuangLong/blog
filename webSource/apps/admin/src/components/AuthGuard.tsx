import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spin } from '@arco-design/web-react';
import { useAuthStore, fetchProfile } from '../store/authStore';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const { token, user, setAuth } = useAuthStore();
    const [loading, setLoading] = useState(!user && !!token);
    const location = useLocation();

    useEffect(() => {
        if (token && !user) {
            fetchProfile()
                .then((data) => {
                    setAuth(data.user, token, data.permissions || []);
                })
                .catch(() => {
                    useAuthStore.getState().logout();
                })
                .finally(() => setLoading(false));
        }
    }, [token, user, setAuth]);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Spin size={40} />
            </div>
        );
    }

    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
}
