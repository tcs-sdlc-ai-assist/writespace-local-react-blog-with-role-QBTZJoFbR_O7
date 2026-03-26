import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/Navbar.jsx';
import { Footer } from '../../components/Footer.jsx';
import { getPosts, createPost, editPost } from '../../services/blogService.js';
import { getSession } from '../../services/sessionService.js';
import { ROLES } from '../../constants.js';

/**
 * Unified blog create/edit page.
 * At /blogs/new: renders an empty form and calls blogService.createPost() on submit.
 * At /blogs/:id/edit: pre-fills the form with existing post data, enforces ownership
 * (Admin can edit any post; Viewer can only edit their own), and calls blogService.editPost() on submit.
 * Validates required fields and shows inline error messages.
 * On success, navigates to /blogs/:id (edit) or /blogs (create).
 * @returns {JSX.Element}
 */
const BlogEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const session = getSession();
  const isEditMode = Boolean(id);

  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!session) {
      navigate('/login', { replace: true });
      return;
    }

    if (isEditMode) {
      const post = getPosts().find((p) => p.id === id);

      if (!post) {
        setNotFound(true);
        return;
      }

      const canEdit =
        session.role === ROLES.ADMIN || session.userId === post.authorId;

      if (!canEdit) {
        navigate('/blogs', { replace: true });
        return;
      }

      setFormTitle(post.title);
      setFormContent(post.content);
    }
  }, [id, isEditMode, navigate, session]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!formTitle.trim() || !formContent.trim()) {
      setFormError('Title and content are required.');
      return;
    }

    setIsSubmitting(true);

    let result;
    if (isEditMode) {
      result = editPost(id, { title: formTitle, content: formContent });
    } else {
      result = createPost({ title: formTitle, content: formContent });
    }

    setIsSubmitting(false);

    if (result && result.error) {
      setFormError(result.message || 'Something went wrong. Please try again.');
      return;
    }

    if (isEditMode) {
      navigate(`/blogs/${id}`, { replace: true });
    } else {
      navigate(`/blogs/${result.id}`, { replace: true });
    }
  };

  const handleCancel = () => {
    if (isEditMode) {
      navigate(`/blogs/${id}`);
    } else {
      navigate('/blogs');
    }
  };

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="text-center flex flex-col items-center gap-4">
            <span className="text-5xl">🔍</span>
            <h1 className="text-xl font-bold text-gray-900">Post Not Found</h1>
            <p className="text-sm text-gray-500">
              The blog post you&apos;re trying to edit doesn&apos;t exist or has been removed.
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
          onClick={handleCancel}
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
          {isEditMode ? 'Back to Post' : 'Back to Blog'}
        </button>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Edit Post' : 'Write New Post'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {isEditMode
                ? 'Update your post title and content below.'
                : 'Share your thoughts with the world.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
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
                rows={12}
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
                onClick={handleCancel}
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
                  ? isEditMode
                    ? 'Saving…'
                    : 'Publishing…'
                  : isEditMode
                  ? 'Save Changes'
                  : 'Publish Post'}
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export { BlogEditorPage };