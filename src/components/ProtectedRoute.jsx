import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search);
    const loginPath = adminOnly ? `/admin-login?next=${next}` : `/login?next=${next}`;
    return <Navigate to={loginPath} replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/admin-login" replace />;
  }

  return children;
}
