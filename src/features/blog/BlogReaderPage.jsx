import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/Navbar.jsx';
import { Footer } from '../../components/Footer.jsx';
import { getPosts, editPost, deletePost } from '../../services/blogService.js';
import { getSession } from '../../services/sessionService.js';
import { getAvatar } from '../../utils/avatarFactory.js';
import { ROLES } from '../../constants.js';

/**
 * Full post reader page at /blogs/:id.
 * Fetches the post by ID from blogService.getPosts().
 * Displays title, author avatar, author username, created/updated dates, and full content.
 * Shows Edit and Delete buttons per ownership rules (Admin: any post; Viewer: own post only).
 * Delete prompts confirmation and calls blogService.deletePost().
 * On successful delete, navigates back to /blogs.
 * @returns {JSX.Element}
 */
const BlogReaderPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const session = getSession();

  const post = getPosts().find((p) => p.id === id) || null;

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [formTitle, setFormTitle] = useState(post ? post.title : '');
  const [formContent, setFormContent] = useState(post ? post.content : '');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const canEdit =
    session &&
    post &&
    (session.role === ROLES.ADMIN || session.userId === post.authorId);

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

  const openEditModal = () => {
    setFormTitle(post.title);
    setFormContent(post.content);
    setFormError('');
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setFormTitle(post ? post.title : '');
    setFormContent(post ? post.content : '');
    setFormError('');
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!formTitle.trim() || !formContent.trim()) {
      setFormError('Title and content are required.');
      return;
    }

    setIsSubmitting(true);

    const result = editPost(id, { title: formTitle, content: formContent });

    setIsSubmitting(false);

    if (result && result.error) {
      setFormError(result.message || 'Something went wrong. Please try again.');
      return;
    }

    setShowEditModal(false);
    navigate(0);
  };

  const handleDeleteConfirm = () => {
    setDeleteError('');
    setIsDeleting(true);

    const result = deletePost(id);

    setIsDeleting(false);

    if (result && result.error) {
      setDeleteError(result.message || 'Could not delete post. Please try again.');
      return;
    }

    navigate('/blogs', { replace: true });
  };

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="text-center flex flex-col items-center gap-4">
            <span className="text-5xl">🔍</span>
            <h1 className="text-xl font-bold text-gray-900">Post Not Found</h1>
            <p className="text-sm text-gray-500">
              The blog post you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <button
              onClick={() => navigate('/blogs')}
              className="mt-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
            >
              Back to Blog
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-10">
        {/* Back link */}
        <button
          onClick={() => navigate('/blogs')}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-purple-700 transition-colors mb-6"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back to Blog
        </button>

        {/* Post card */}
        <article className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl font-bold text-gray-900 leading-snug flex-1">
                {post.title}
              </h1>

              {canEdit && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={openEditModal}
                    className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-purple-700 border border-gray-200 hover:border-purple-300 px-3 py-1.5 rounded-lg transition-colors"
                    aria-label="Edit post"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setDeleteError('');
                      setShowDeleteConfirm(true);
                    }}
                    className="flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 px-3 py-1.5 rounded-lg transition-colors"
                    aria-label="Delete post"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
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
              )}
            </div>

            {/* Author & dates */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                {getAvatar(post.authorRole ?? ROLES.VIEWER)}
                <span className="text-sm font-medium text-gray-700">
                  {post.authorUsername}
                </span>
              </div>
              <span className="text-gray-300 text-sm">·</span>
              <span className="text-xs text-gray-400">
                Published {formatDate(post.createdAt)}
              </span>
              {post.updatedAt && post.updatedAt !== post.createdAt && (
                <>
                  <span className="text-gray-300 text-sm">·</span>
                  <span className="text-xs text-gray-400">
                    Updated {formatDate(post.updatedAt)}
                  </span>
                </>
              )}
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Content */}
          <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {post.content}
          </div>
        </article>
      </main>

      <Footer />

      {/* Edit Modal */}
      {showEditModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeEditModal();
          }}
        >
          <div className="w-full max-w-lg bg-white border border-gray-200 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">Edit Post</h2>
              <button
                onClick={closeEditModal}
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

            <form onSubmit={handleEditSubmit} noValidate className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="editPostTitle"
                  className="text-sm font-medium text-gray-700"
                >
                  Title
                </label>
                <input
                  id="editPostTitle"
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
                  htmlFor="editPostContent"
                  className="text-sm font-medium text-gray-700"
                >
                  Content
                </label>
                <textarea
                  id="editPostContent"
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
                  onClick={closeEditModal}
                  className="text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-purple-600 hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
                >
                  {isSubmitting ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowDeleteConfirm(false);
          }}
        >
          <div className="w-full max-w-sm bg-white border border-gray-200 rounded-xl shadow-lg p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Delete Post</h2>
              <button
                onClick={() => setShowDeleteConfirm(false)}
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
              <span className="font-semibold text-gray-900">&ldquo;{post.title}&rdquo;</span>?
              This action cannot be undone.
            </p>

            {deleteError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {deleteError}
              </p>
            )}

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
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

export { BlogReaderPage };