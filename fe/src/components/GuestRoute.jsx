import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../constants';
import ShimmerFallback from './ShimmerFallback';

/** Sends already-authenticated users away from login/register */
function GuestRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="auth-boot">
        <ShimmerFallback />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={ROUTES.home} replace />;
  }

  return children;
}

export default GuestRoute;
