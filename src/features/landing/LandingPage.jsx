import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/Navbar.jsx';
import { Footer } from '../../components/Footer.jsx';
import { getPosts } from '../../services/blogService.js';
import { getSession } from '../../services/sessionService.js';
import { getAvatar } from '../../utils/avatarFactory.js';
import { ROLES } from '../../constants.js';

/**
 * Public landing page at /.
 * Composed of: Navbar (auth-aware), Hero section (app name, tagline, CTA buttons routing to /login and /register),
 * Features section (3 cards), Latest Posts preview (up to 3 most recent posts from localStorage via blogService.getPosts();
 * unauthenticated users redirected to /login on click), and Footer.
 * Fully styled with Tailwind CSS.
 * @returns {JSX.Element}
 */
const LandingPage = () => {
  const navigate = useNavigate();
  const session = getSession();
  const latestPosts = getPosts().slice(0, 3);

  const handlePostClick = (post) => {
    if (!session) {
      navigate('/login');
    } else {
      navigate(`/blogs/${post.id}`);
    }
  };

  const formatDate = (isoString) => {
    try {
      return new Date(isoString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  const features = [
    {
      icon: '✍️',
      title: 'Write & Share',
      description:
        'Create beautiful blog posts and share your thoughts with the world. Express yourself with ease.',
    },
    {
      icon: '👥',
      title: 'Community',
      description:
        'Join a growing community of writers and readers. Discover stories from people around the globe.',
    },
    {
      icon: '🔒',
      title: 'Secure & Private',
      description:
        'Your account and content are protected. Role-based access ensures the right people see the right content.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-20 flex flex-col items-center text-center gap-6">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight">
            Welcome to{' '}
            <span className="text-purple-700">✍️ WriteSpace</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-500 max-w-2xl">
            A place to write, read, and connect. Share your ideas with the world or discover stories from others.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
            <button
              onClick={() => navigate('/login')}
              className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/register')}
              className="bg-white hover:bg-gray-50 text-purple-700 border border-purple-300 text-sm font-medium px-6 py-2.5 rounded-lg transition-colors"
            >
              Create Account
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-5xl mx-auto px-4 py-16 w-full">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">
          Why WriteSpace?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex flex-col gap-3"
            >
              <span className="text-3xl">{feature.icon}</span>
              <h3 className="text-base font-semibold text-gray-900">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Latest Posts Section */}
      {latestPosts.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 pb-16 w-full">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">
            Latest Posts
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {latestPosts.map((post) => {
              const excerpt =
                post.content.length > 150
                  ? post.content.slice(0, 150).trimEnd() + '…'
                  : post.content;

              return (
                <div
                  key={post.id}
                  onClick={() => handlePostClick(post)}
                  className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer p-5 flex flex-col gap-3"
                >
                  <h3 className="text-base font-semibold text-gray-900 leading-snug line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed flex-1">
                    {excerpt}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {getAvatar(post.authorRole ?? ROLES.VIEWER)}
                    <span className="text-sm font-medium text-gray-700">
                      {post.authorUsername}
                    </span>
                    <span className="text-gray-300 text-sm">·</span>
                    <span className="text-xs text-gray-400">
                      {formatDate(post.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <div className="flex-1" />

      <Footer />
    </div>
  );
};

export { LandingPage };