import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Role } from '../../types';

interface ProtectedRouteProps {
  allowedRoles: Role[];
  // FIX: Replaced JSX.Element with React.ReactElement to resolve "Cannot find namespace 'JSX'" error.
  children: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    // This case might happen briefly on load. Or if something is wrong.
    // Redirecting to dashboard, where a user can be selected.
    return <Navigate to="/dashboard" replace />;
  }

  if (!allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;