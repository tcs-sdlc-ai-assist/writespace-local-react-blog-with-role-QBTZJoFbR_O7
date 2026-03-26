import { read, write } from './storage.js';
import { getSession } from './sessionService.js';
import { STORAGE_KEYS, ROLES, HARD_CODED_ADMIN } from '../constants.js';

/**
 * Generates a unique user ID string.
 * @returns {string} A unique user ID.
 */
const genUserId = () => {
  return 'u_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
};

/**
 * Retrieves all users from localStorage.
 * Does not include the hard-coded admin in the returned list.
 * @returns {Array<{ id: string, username: string, role: string }>} Array of user objects (without passwords).
 */
const getUsers = () => {
  const users = read(STORAGE_KEYS.USERS) || [];
  return users.map(({ password: _password, ...rest }) => rest);
};

/**
 * Creates a new user with the given data. Admin-only operation.
 * Validates username uniqueness and required fields.
 * @param {{ username: string, password: string, role: string }} userData - The data for the new user.
 * @returns {{ id: string, username: string, role: string }|{ error: string, message: string }}
 */
const createUser = (userData) => {
  const session = getSession();
  if (!session) {
    return { error: 'NOT_AUTHORIZED', message: 'Login required.' };
  }

  if (session.role !== ROLES.ADMIN) {
    return { error: 'NOT_AUTHORIZED', message: 'Admin access required.' };
  }

  const { username, password, role } = userData || {};

  if (!username || !password || !role) {
    return { error: 'INVALID_CREDENTIALS', message: 'All fields are required.' };
  }

  if (username.length < 3) {
    return { error: 'INVALID_CREDENTIALS', message: 'Username must be at least 3 characters.' };
  }

  if (password.length < 6) {
    return { error: 'INVALID_CREDENTIALS', message: 'Password must be at least 6 characters.' };
  }

  if (role !== ROLES.ADMIN && role !== ROLES.VIEWER) {
    return { error: 'INVALID_CREDENTIALS', message: 'Role must be admin or viewer.' };
  }

  if (username === HARD_CODED_ADMIN.username) {
    return { error: 'USERNAME_TAKEN', message: 'That username is already taken.' };
  }

  const users = read(STORAGE_KEYS.USERS) || [];
  const exists = users.some((u) => u.username === username);
  if (exists) {
    return { error: 'USERNAME_TAKEN', message: 'That username is already taken.' };
  }

  const newUser = {
    id: genUserId(),
    username,
    password,
    role,
  };

  const updatedUsers = [...users, newUser];
  const written = write(STORAGE_KEYS.USERS, updatedUsers);
  if (!written) {
    return { error: 'STORAGE_WRITE_FAILED', message: 'Could not save user.' };
  }

  const { password: _password, ...safeUser } = newUser;
  return safeUser;
};

/**
 * Deletes a user by ID. Admin-only operation.
 * Cannot delete the hard-coded admin or the currently logged-in user.
 * @param {string} userId - The ID of the user to delete.
 * @returns {boolean|{ error: string, message: string }}
 */
const deleteUser = (userId) => {
  const session = getSession();
  if (!session) {
    return { error: 'NOT_AUTHORIZED', message: 'Login required.' };
  }

  if (session.role !== ROLES.ADMIN) {
    return { error: 'NOT_AUTHORIZED', message: 'Admin access required.' };
  }

  if (!userId) {
    return { error: 'INVALID_CREDENTIALS', message: 'User ID is required.' };
  }

  if (userId === HARD_CODED_ADMIN.id) {
    return { error: 'NOT_AUTHORIZED', message: 'Cannot delete the hard-coded admin.' };
  }

  if (userId === session.userId) {
    return { error: 'NOT_AUTHORIZED', message: 'Cannot delete your own account.' };
  }

  const users = read(STORAGE_KEYS.USERS) || [];
  const userExists = users.some((u) => u.id === userId);
  if (!userExists) {
    return { error: 'NOT_FOUND', message: 'User not found.' };
  }

  const updatedUsers = users.filter((u) => u.id !== userId);
  const written = write(STORAGE_KEYS.USERS, updatedUsers);
  if (!written) {
    return { error: 'STORAGE_WRITE_FAILED', message: 'Could not delete user.' };
  }

  return true;
};

export { getUsers, createUser, deleteUser };