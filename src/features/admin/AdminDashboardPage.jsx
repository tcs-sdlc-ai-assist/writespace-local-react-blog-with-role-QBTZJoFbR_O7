import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/Navbar.jsx';
import { Footer } from '../../components/Footer.jsx';
import { getPosts, deletePost } from '../../services/blogService.js';
import { getUsers } from '../../services/userService.js';
import { getAvatar } from '../../utils/avatarFactory.js';
import { ROLES } from '../../constants.js';

/**
 * Admin-only dashboard page at /dashboard.
 * Displays 4 stat cards: total posts, total users, total admins, total viewers.
 * Shows the 5 most recent posts with edit and delete controls.
 * Provides quick action buttons: 'Write New Post' (/blogs/new) and 'Manage Users' (/users).
 * Non-admins are redirected to /blogs via ProtectedRoute in the router.
 * @returns {JSX.Element}
 */
const AdminDashboardPage = () => {
  const navigate = useNavigate();

  const [posts, setPosts] = useState(() => getPosts());
  const [users] = useState(() => getUsers());

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingPost, setDeletingPost] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const totalPosts = posts.length;
  const totalUsers = users.length;
  const totalAdmins = users.filter((u) => u.role === ROLES.ADMIN).length;
  const totalViewers = users.filter((u) => u.role === ROLES.VIEWER).length;

  const recentPosts = posts.slice(0, 5);

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

  const openDeleteConfirm = (post) => {
    setDeletingPost(post);
    setDeleteError('');
    setShowDeleteConfirm(true);
  };

  const closeDeleteConfirm = () => {
    setShowDeleteConfirm(false);
    setDeletingPost(null);
    setDeleteError('');
  };

  const handleDeleteConfirm = () => {
    if (!deletingPost) return;

    setDeleteError('');
    setIsDeleting(true);

    const result = deletePost(deletingPost.id);

    setIsDeleting(false);

    if (result && result.error) {
      setDeleteError(result.message || 'Could not delete post. Please try again.');
      return;
    }

    setPosts(getPosts());
    closeDeleteConfirm();
  };

  const statCards = [
    {
      label: 'Total Posts',
      value: totalPosts,
      icon: '📝',
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-700',
    },
    {
      label: 'Total Users',
      value: totalUsers,
      icon: '👥',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
    },
    {
      label: 'Admins',
      value: totalAdmins,
      icon: '👑',
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-700',
    },
    {
      label: 'Viewers',
      value: totalViewers,
      icon: '📖',
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-700',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-10">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Platform overview and quick actions.
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {statCards.map((card) => (
            <div
              key={card.label}
              className={`${card.bg} ${card.border} border rounded-xl p-5 flex flex-col gap-2`}
            >
              <span className="text-2xl">{card.icon}</span>
              <span className={`text-3xl font-bold ${card.text}`}>
                {card.value}
              </span>
              <span className="text-xs font-medium text-gray-500">
                {card.label}
              </span>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-3 mb-10">
          <button
            onClick={() => navigate('/blogs/new')}
            className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            ✍️ Write New Post
          </button>
          <button
            onClick={() => navigate('/users')}
            className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            👥 Manage Users
          </button>
        </div>

        {/* Recent Posts */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Recent Posts</h2>
            <button
              onClick={() => navigate('/blogs')}
              className="text-sm font-medium text-purple-600 hover:text-purple-800 transition-colors"
            >
              View all →
            </button>
          </div>

          {recentPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4 bg-white border border-gray-200 rounded-xl">
              <span className="text-4xl">📝</span>
              <p className="text-sm text-gray-500">No posts yet.</p>
              <button
                onClick={() => navigate('/blogs/new')}
                className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                Write the First Post
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {recentPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex items-start justify-between gap-4"
                >
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => navigate(`/blogs/${post.id}`)}
                  >
                    <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-1 hover:text-purple-700 transition-colors">
                      {post.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      {getAvatar(post.authorRole ?? ROLES.VIEWER)}
                      <span className="text-xs font-medium text-gray-600">
                        {post.authorUsername}
                      </span>
                      <span className="text-gray-300 text-xs">·</span>
                      <span className="text-xs text-gray-400">
                        {formatDate(post.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => navigate(`/blogs/${post.id}/edit`)}
                      className="flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-purple-700 border border-gray-200 hover:border-purple-300 px-2.5 py-1.5 rounded-lg transition-colors"
                      aria-label="Edit post"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3.5 w-3.5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => openDeleteConfirm(post)}
                      className="flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 px-2.5 py-1.5 rounded-lg transition-colors"
                      aria-label="Delete post"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3.5 w-3.5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && deletingPost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeDeleteConfirm();
          }}
        >
          <div className="w-full max-w-sm bg-white border border-gray-200 rounded-xl shadow-lg p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Delete Post</h2>
              <button
                onClick={closeDeleteConfirm}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close modal"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            <p className="text-sm text-gray-600">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-gray-900">
                &ldquo;{deletingPost.title}&rdquo;
              </span>
              ? This action cannot be undone.
            </p>

            {deleteError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {deleteError}
              </p>
            )}

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeDeleteConfirm}
                className="text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
              >
                {isDeleting ? 'Deleting…' : 'Delete Post'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { AdminDashboardPage };