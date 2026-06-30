import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { FullPageSpinner } from '../ui/Spinner.jsx';

/**
 * Guards routes that require authentication. While the session is bootstrapping
 * we show a spinner to avoid a flash redirect. `adminOnly` additionally enforces
 * the admin role.
 */
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullPageSpinner />;

  if (!isAuthenticated) {
    // Preserve where the user was headed so we can return them after login.
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;

  return children;
};

export default ProtectedRoute;
