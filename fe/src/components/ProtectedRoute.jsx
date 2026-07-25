import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ShimmerFallback from './ShimmerFallback';
import { ROUTES } from '../constants';

/** Blocks store access until the user is signed in */
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="auth-boot">
        <ShimmerFallback />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate to={ROUTES.login} replace state={{ from: location.pathname }} />
    );
  }

  return children;
}

export default ProtectedRoute;
