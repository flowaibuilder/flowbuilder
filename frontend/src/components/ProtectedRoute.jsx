import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ session, children }) {
  if (!session) {
    // Redirect them to the /login page, but save the current location they were trying to go to
    return <Navigate to="/login" replace />;
  }

  return children;
}
