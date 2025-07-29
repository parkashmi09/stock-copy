import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, isAuthenticated }) => {
  // Check both the prop and localStorage for authentication
  const token = localStorage.getItem('token');
  const isAuth = isAuthenticated || !!token;

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute; 