import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ session, children }) {
  const location = useLocation();

  const DEV_BYPASS_AUTH =
    import.meta.env.VITE_DEV_BYPASS_AUTH === 'true';

  if (DEV_BYPASS_AUTH) {
    return children;
  }

  if (!session) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  return children;
}