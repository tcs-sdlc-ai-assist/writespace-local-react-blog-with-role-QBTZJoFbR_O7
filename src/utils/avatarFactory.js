import { ROLES } from '../constants.js';

/**
 * Returns a JSX element representing a role-based avatar.
 * Admin: crown emoji with purple background.
 * Viewer: book emoji with blue background.
 * @param {string} role - The user's role ('admin' or 'viewer').
 * @returns {JSX.Element} A styled avatar element.
 */
const getAvatar = (role) => {
  if (role === ROLES.ADMIN) {
    return (
      <span
        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-200 text-purple-800 text-base select-none"
        title="Admin"
        aria-label="Admin avatar"
      >
        👑
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-200 text-blue-800 text-base select-none"
      title="Viewer"
      aria-label="Viewer avatar"
    >
      📖
    </span>
  );
};

export { getAvatar };