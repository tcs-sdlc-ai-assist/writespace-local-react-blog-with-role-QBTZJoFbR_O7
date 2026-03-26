import { Navigate } from 'react-router-dom';
import { getSession } from '../services/sessionService.js';
import { ROLES } from '../constants.js';

/**
 * ProtectedRoute component that enforces authentication and role-based access control.
 * Redirects unauthenticated users to /login.
 * Redirects authenticated non-admins away from admin-only routes to /blogs.
 * Renders children if access is granted.
 * @param {{ children: JSX.Element, requiredRole?: string }} props
 * @returns {JSX.Element}
 */
const ProtectedRoute = ({ children, requiredRole }) => {
  const session = getSession();

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole === ROLES.ADMIN && session.role !== ROLES.ADMIN) {
    return <Navigate to="/blogs" replace />;
  }

  return children;
};

export { ProtectedRoute };