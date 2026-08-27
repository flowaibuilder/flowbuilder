import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ session, children }) {
  const location = useLocation();

  if (!session) {
    // Pass the current location as state so Login can redirect back after auth
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
