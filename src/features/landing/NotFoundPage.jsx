import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/Navbar.jsx';
import { Footer } from '../../components/Footer.jsx';

/**
 * 404 Not Found page rendered for any unmatched route.
 * Displays a friendly message and a link back to the home page.
 * Styled with Tailwind CSS.
 * @returns {JSX.Element}
 */
const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="text-center flex flex-col items-center gap-4">
          <span className="text-6xl">🔍</span>
          <h1 className="text-3xl font-extrabold text-gray-900">404</h1>
          <h2 className="text-xl font-semibold text-gray-700">Page Not Found</h2>
          <p className="text-sm text-gray-500 max-w-sm text-center">
            Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <button
            onClick={() => navigate('/')}
            className="mt-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
          >
            Back to Home
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export { NotFoundPage };