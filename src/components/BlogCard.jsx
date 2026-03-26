import { useNavigate } from 'react-router-dom';
import { getAvatar } from '../utils/avatarFactory.js';
import { getSession } from '../services/sessionService.js';
import { ROLES } from '../constants.js';

/**
 * Reusable card component for displaying a blog post summary in the blog list grid.
 * Displays post title, author avatar, author username, creation date, and a content excerpt.
 * Shows an edit icon if the current user is Admin (any post) or Viewer (own post only).
 * Clicking the card navigates to /blogs/:id.
 * @param {{ post: { id: string, title: string, content: string, authorId: string, authorUsername: string, createdAt: string, updatedAt: string }, onEdit: Function }} props
 * @returns {JSX.Element}
 */
const BlogCard = ({ post, onEdit }) => {
  const navigate = useNavigate();
  const session = getSession();

  const canEdit =
    session &&
    (session.role === ROLES.ADMIN || session.userId === post.authorId);

  const handleCardClick = () => {
    navigate(`/blogs/${post.id}`);
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(post);
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

  const excerpt =
    post.content.length > 150
      ? post.content.slice(0, 150).trimEnd() + '…'
      : post.content;

  return (
    <div
      onClick={handleCardClick}
      className="relative bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer p-5 flex flex-col gap-3"
    >
      {canEdit && (
        <button
          onClick={handleEditClick}
          className="absolute top-4 right-4 text-gray-400 hover:text-purple-600 transition-colors"
          aria-label="Edit post"
          title="Edit post"
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
        </button>
      )}

      <h2 className="text-base font-semibold text-gray-900 leading-snug pr-6 line-clamp-2">
        {post.title}
      </h2>

      <p className="text-sm text-gray-600 leading-relaxed flex-1">
        {excerpt}
      </p>

      <div className="flex items-center gap-2 mt-1">
        {getAvatar(post.authorRole ?? ROLES.VIEWER)}
        <span className="text-sm font-medium text-gray-700">
          {post.authorUsername}
        </span>
        <span className="text-gray-300 text-sm">·</span>
        <span className="text-xs text-gray-400">{formatDate(post.createdAt)}</span>
      </div>
    </div>
  );
};

export { BlogCard };