import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/auth/index';

/**
 * Protected Route Component
 * Centralized route guard for authentication
 */
const ProtectedRoute = ({ children, redirectTo = "/" }) => {
  const { user, loading } = useContext(AuthContext);

  // Show loading while checking authentication
  if (loading) {
    return null; // Let the main App handle loading state
  }

  // Redirect to public route if not authenticated
  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  // Render protected content if authenticated
  return children;
};

export default ProtectedRoute;
