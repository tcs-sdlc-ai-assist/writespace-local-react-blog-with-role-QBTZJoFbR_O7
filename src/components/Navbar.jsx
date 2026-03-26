import { Link, useNavigate } from 'react-router-dom';
import { getSession, logout } from '../services/sessionService.js';
import { getAvatar } from '../utils/avatarFactory.js';
import { ROLES } from '../constants.js';

/**
 * Shared Navbar component rendered on all pages.
 * Adapts links and buttons based on authentication state and user role.
 * Guests see Login/Register; authenticated users see Blog, Dashboard (admin only),
 * Users (admin only), and Logout. Displays user avatar and username.
 * @returns {JSX.Element}
 */
const Navbar = () => {
  const navigate = useNavigate();
  const session = getSession();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link
          to={session ? '/blogs' : '/login'}
          className="text-xl font-bold text-purple-700 tracking-tight hover:text-purple-900 transition-colors"
        >
          ✍️ WriteSpace
        </Link>

        <div className="flex items-center gap-4">
          {session ? (
            <>
              <Link
                to="/blogs"
                className="text-sm font-medium text-gray-600 hover:text-purple-700 transition-colors"
              >
                Blog
              </Link>

              {session.role === ROLES.ADMIN && (
                <>
                  <Link
                    to="/dashboard"
                    className="text-sm font-medium text-gray-600 hover:text-purple-700 transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/users"
                    className="text-sm font-medium text-gray-600 hover:text-purple-700 transition-colors"
                  >
                    Users
                  </Link>
                </>
              )}

              <div className="flex items-center gap-2">
                {getAvatar(session.role)}
                <span className="text-sm font-medium text-gray-700">
                  {session.username}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 px-3 py-1.5 rounded transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-gray-600 hover:text-purple-700 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 px-3 py-1.5 rounded transition-colors"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export { Navbar };