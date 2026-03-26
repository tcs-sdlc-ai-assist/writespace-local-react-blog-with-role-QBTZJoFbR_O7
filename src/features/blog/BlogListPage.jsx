import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/Navbar.jsx';
import { Footer } from '../../components/Footer.jsx';
import { BlogCard } from '../../components/BlogCard.jsx';
import { getPosts, createPost, editPost } from '../../services/blogService.js';
import { getSession } from '../../services/sessionService.js';

/**
 * Authenticated blog list page at /blogs.
 * Fetches all posts via blogService.getPosts() and renders them in a responsive grid using BlogCard components.
 * Shows empty state message and CTA if no posts exist.
 * Includes a 'Write New Post' button/modal for creating posts.
 * Admin and post authors can edit posts via an inline modal.
 * @returns {JSX.Element}
 */
const BlogListPage = () => {
  const navigate = useNavigate();
  const session = getSession();

  const [posts, setPosts] = useState(() => getPosts());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const refreshPosts = useCallback(() => {
    setPosts(getPosts());
  }, []);

  const openCreateModal = () => {
    setFormTitle('');
    setFormContent('');
    setFormError('');
    setEditingPost(null);
    setShowCreateModal(true);
  };

  const openEditModal = (post) => {
    setFormTitle(post.title);
    setFormContent(post.content);
    setFormError('');
    setEditingPost(post);
    setShowCreateModal(true);
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setEditingPost(null);
    setFormTitle('');
    setFormContent('');
    setFormError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!formTitle.trim() || !formContent.trim()) {
      setFormError('Title and content are required.');
      return;
    }

    setIsSubmitting(true);

    let result;
    if (editingPost) {
      result = editPost(editingPost.id, { title: formTitle, content: formContent });
    } else {
      result = createPost({ title: formTitle, content: formContent });
    }

    setIsSubmitting(false);

    if (result && result.error) {
      setFormError(result.message || 'Something went wrong. Please try again.');
      return;
    }

    refreshPosts();
    closeModal();
  };

  const handleCardClick = (post) => {
    navigate(`/blogs/${post.id}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Blog Posts</h1>
            <p className="text-sm text-gray-500 mt-1">
              {posts.length === 0
                ? 'No posts yet. Be the first to write!'
                : `${posts.length} post${posts.length === 1 ? '' : 's'} published`}
            </p>
          </div>
          {session && (
            <button
              onClick={openCreateModal}
              className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              ✍️ Write New Post
            </button>
          )}
        </div>

        {/* Posts Grid */}
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {posts.map((post) => (
              <BlogCard
                key={post.id}
                post={post}
                onEdit={openEditModal}
                onClick={handleCardClick}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <span className="text-5xl">📝</span>
            <h2 className="text-lg font-semibold text-gray-700">No posts yet</h2>
            <p className="text-sm text-gray-500 text-center max-w-sm">
              There are no blog posts to display. Start writing and share your thoughts with the world!
            </p>
            {session && (
              <button
                onClick={openCreateModal}
                className="mt-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
              >
                Write Your First Post
              </button>
            )}
          </div>
        )}
      </main>

      <Footer />

      {/* Create / Edit Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="w-full max-w-lg bg-white border border-gray-200 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">
                {editingPost ? 'Edit Post' : 'Write New Post'}
              </h2>
              <button
                onClick={closeModal}
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

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="postTitle"
                  className="text-sm font-medium text-gray-700"
                >
                  Title
                </label>
                <input
                  id="postTitle"
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Enter post title"
                  maxLength={100}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                />
                <span className="text-xs text-gray-400 text-right">
                  {formTitle.length}/100
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <label
                  htmlFor="postContent"
                  className="text-sm font-medium text-gray-700"
                >
                  Content
                </label>
                <textarea
                  id="postContent"
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Write your post content here…"
                  maxLength={5000}
                  rows={8}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition resize-none"
                />
                <span className="text-xs text-gray-400 text-right">
                  {formContent.length}/5000
                </span>
              </div>

              {formError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {formError}
                </p>
              )}

              <div className="flex items-center justify-end gap-3 mt-1">
                <button
                  type="button"
                  onClick={closeModal}
                  className="text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-purple-600 hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
                >
                  {isSubmitting
                    ? editingPost
                      ? 'Saving…'
                      : 'Publishing…'
                    : editingPost
                    ? 'Save Changes'
                    : 'Publish Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export { BlogListPage };