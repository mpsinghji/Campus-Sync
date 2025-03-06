import React from 'react';
import { Navigate } from 'react-router-dom';
import AuthGuard from '../components/AuthGuard';

const ProtectedRoute = ({ children, roles }) => {
  return (
    <AuthGuard>
      {children}
    </AuthGuard>
  );
};

export default ProtectedRoute;
