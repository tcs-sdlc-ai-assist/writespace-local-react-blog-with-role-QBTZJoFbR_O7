import { useState } from 'react';
import { Navbar } from '../../components/Navbar.jsx';
import { Footer } from '../../components/Footer.jsx';
import { getUsers, createUser, deleteUser } from '../../services/userService.js';
import { getSession } from '../../services/sessionService.js';
import { getAvatar } from '../../utils/avatarFactory.js';
import { ROLES } from '../../constants.js';

/**
 * Admin-only user management page at /users.
 * Displays all users in a responsive table/card layout with avatar, username, role, and delete action.
 * Includes a 'Create User' form with username, password, confirm password, and role fields.
 * Validates uniqueness and required fields via userService.createUser().
 * Delete prompts confirmation; hard-coded admin and self cannot be deleted.
 * Non-admins are redirected to /blogs via ProtectedRoute in the router.
 * @returns {JSX.Element}
 */
const UserManagementPage = () => {
  const session = getSession();

  const [users, setUsers] = useState(() => getUsers());

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createUsername, setCreateUsername] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createConfirmPassword, setCreateConfirmPassword] = useState('');
  const [createRole, setCreateRole] = useState(ROLES.VIEWER);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingUser, setDeletingUser] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const refreshUsers = () => {
    setUsers(getUsers());
  };

  const openCreateForm = () => {
    setCreateUsername('');
    setCreatePassword('');
    setCreateConfirmPassword('');
    setCreateRole(ROLES.VIEWER);
    setCreateError('');
    setCreateSuccess('');
    setShowCreateForm(true);
  };

  const closeCreateForm = () => {
    setShowCreateForm(false);
    setCreateUsername('');
    setCreatePassword('');
    setCreateConfirmPassword('');
    setCreateRole(ROLES.VIEWER);
    setCreateError('');
    setCreateSuccess('');
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    setCreateError('');
    setCreateSuccess('');

    if (!createUsername.trim() || !createPassword.trim() || !createConfirmPassword.trim()) {
      setCreateError('All fields are required.');
      return;
    }

    if (createPassword !== createConfirmPassword) {
      setCreateError('Passwords do not match.');
      return;
    }

    setIsCreating(true);

    const result = createUser({
      username: createUsername.trim(),
      password: createPassword,
      role: createRole,
    });

    setIsCreating(false);

    if (result && result.error) {
      setCreateError(result.message || 'Could not create user. Please try again.');
      return;
    }

    refreshUsers();
    setCreateSuccess(`User "${result.username}" created successfully.`);
    setCreateUsername('');
    setCreatePassword('');
    setCreateConfirmPassword('');
    setCreateRole(ROLES.VIEWER);
  };

  const openDeleteConfirm = (user) => {
    setDeletingUser(user);
    setDeleteError('');
    setShowDeleteConfirm(true);
  };

  const closeDeleteConfirm = () => {
    setShowDeleteConfirm(false);
    setDeletingUser(null);
    setDeleteError('');
  };

  const handleDeleteConfirm = () => {
    if (!deletingUser) return;

    setDeleteError('');
    setIsDeleting(true);

    const result = deleteUser(deletingUser.id);

    setIsDeleting(false);

    if (result && result.error) {
      setDeleteError(result.message || 'Could not delete user. Please try again.');
      return;
    }

    refreshUsers();
    closeDeleteConfirm();
  };

  const isSelf = (user) => session && user.id === session.userId;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-10">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-sm text-gray-500 mt-1">
              {users.length === 0
                ? 'No users yet.'
                : `${users.length} user${users.length === 1 ? '' : 's'} registered`}
            </p>
          </div>
          <button
            onClick={openCreateForm}
            className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            + Create User
          </button>
        </div>

        {/* Create User Form */}
        {showCreateForm && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">Create New User</h2>
              <button
                onClick={closeCreateForm}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close form"
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

            <form onSubmit={handleCreateSubmit} noValidate className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="createUsername"
                    className="text-sm font-medium text-gray-700"
                  >
                    Username
                  </label>
                  <input
                    id="createUsername"
                    type="text"
                    autoComplete="off"
                    value={createUsername}
                    onChange={(e) => setCreateUsername(e.target.value)}
                    placeholder="Enter username"
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="createRole"
                    className="text-sm font-medium text-gray-700"
                  >
                    Role
                  </label>
                  <select
                    id="createRole"
                    value={createRole}
                    onChange={(e) => setCreateRole(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition bg-white"
                  >
                    <option value={ROLES.VIEWER}>Viewer</option>
                    <option value={ROLES.ADMIN}>Admin</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="createPassword"
                    className="text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>
                  <input
                    id="createPassword"
                    type="password"
                    autoComplete="new-password"
                    value={createPassword}
                    onChange={(e) => setCreatePassword(e.target.value)}
                    placeholder="Enter password"
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="createConfirmPassword"
                    className="text-sm font-medium text-gray-700"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="createConfirmPassword"
                    type="password"
                    autoComplete="new-password"
                    value={createConfirmPassword}
                    onChange={(e) => setCreateConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              {createError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {createError}
                </p>
              )}

              {createSuccess && (
                <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                  {createSuccess}
                </p>
              )}

              <div className="flex items-center justify-end gap-3 mt-1">
                <button
                  type="button"
                  onClick={closeCreateForm}
                  className="text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="bg-purple-600 hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
                >
                  {isCreating ? 'Creating…' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Users Table */}
        {users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white border border-gray-200 rounded-xl">
            <span className="text-5xl">👥</span>
            <h2 className="text-lg font-semibold text-gray-700">No users yet</h2>
            <p className="text-sm text-gray-500 text-center max-w-sm">
              There are no registered users. Create one to get started.
            </p>
            <button
              onClick={openCreateForm}
              className="mt-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
            >
              Create First User
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden sm:block bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">
                      User
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">
                      Role
                    </th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          {getAvatar(user.role)}
                          <span className="font-medium text-gray-900">
                            {user.username}
                          </span>
                          {isSelf(user) && (
                            <span className="text-xs text-purple-600 font-medium bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
                              You
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${
                            user.role === ROLES.ADMIN
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {user.role === ROLES.ADMIN ? '👑 Admin' : '📖 Viewer'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => openDeleteConfirm(user)}
                          disabled={isSelf(user)}
                          className="flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed ml-auto"
                          aria-label={`Delete user ${user.username}`}
                          title={isSelf(user) ? 'Cannot delete your own account' : `Delete ${user.username}`}
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List */}
            <div className="flex flex-col gap-3 sm:hidden">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {getAvatar(user.role)}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-gray-900 truncate">
                          {user.username}
                        </span>
                        {isSelf(user) && (
                          <span className="text-xs text-purple-600 font-medium bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
                            You
                          </span>
                        )}
                      </div>
                      <span
                        className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full mt-1 ${
                          user.role === ROLES.ADMIN
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {user.role === ROLES.ADMIN ? '👑 Admin' : '📖 Viewer'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => openDeleteConfirm(user)}
                    disabled={isSelf(user)}
                    className="flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                    aria-label={`Delete user ${user.username}`}
                    title={isSelf(user) ? 'Cannot delete your own account' : `Delete ${user.username}`}
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
              ))}
            </div>
          </>
        )}
      </main>

      <Footer />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && deletingUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeDeleteConfirm();
          }}
        >
          <div className="w-full max-w-sm bg-white border border-gray-200 rounded-xl shadow-lg p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Delete User</h2>
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

            <div className="flex items-center gap-3">
              {getAvatar(deletingUser.role)}
              <div>
                <p className="text-sm font-semibold text-gray-900">{deletingUser.username}</p>
                <p className="text-xs text-gray-500 capitalize">{deletingUser.role}</p>
              </div>
            </div>

            <p className="text-sm text-gray-600">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-gray-900">
                &ldquo;{deletingUser.username}&rdquo;
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
                {isDeleting ? 'Deleting…' : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { UserManagementPage };