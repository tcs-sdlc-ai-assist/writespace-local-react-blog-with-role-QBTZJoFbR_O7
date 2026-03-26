import { Link } from 'react-router-dom';

/**
 * Shared Footer component rendered on the landing page and optionally other pages.
 * Displays copyright, app name, and navigation links (Home, Blogs).
 * Fully styled with Tailwind CSS.
 * @returns {JSX.Element}
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-500">
          &copy; {currentYear}{' '}
          <span className="font-semibold text-purple-700">✍️ WriteSpace</span>. All rights reserved.
        </p>

        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="text-sm font-medium text-gray-600 hover:text-purple-700 transition-colors"
          >
            Home
          </Link>
          <Link
            to="/blogs"
            className="text-sm font-medium text-gray-600 hover:text-purple-700 transition-colors"
          >
            Blogs
          </Link>
        </div>
      </div>
    </footer>
  );
};

export { Footer };