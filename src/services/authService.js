import { read, write } from './storage.js';
import { STORAGE_KEYS, ROLES, HARD_CODED_ADMIN } from '../constants.js';

/**
 * Generates a simple pseudo-random token string.
 * @returns {string} A random token.
 */
const genToken = () => {
  return 'token_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
};

/**
 * Generates a unique user ID string.
 * @returns {string} A unique user ID.
 */
const genUserId = () => {
  return 'u_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
};

/**
 * Attempts to log in a user with the given credentials.
 * Checks the hard-coded admin first, then localStorage users.
 * Writes a session to ws_session on success.
 * @param {string} username - The username to authenticate.
 * @param {string} password - The password to authenticate.
 * @returns {{ userId: string, username: string, role: string, token: string }|{ error: string, message: string }}
 */
const login = (username, password) => {
  if (!username || !password) {
    return { error: 'INVALID_CREDENTIALS', message: 'Username and password are required.' };
  }

  if (
    username === HARD_CODED_ADMIN.username &&
    password === HARD_CODED_ADMIN.password
  ) {
    const session = {
      userId: HARD_CODED_ADMIN.id,
      username: HARD_CODED_ADMIN.username,
      role: HARD_CODED_ADMIN.role,
      token: genToken(),
    };
    const written = write(STORAGE_KEYS.SESSION, session);
    if (!written) {
      return { error: 'STORAGE_WRITE_FAILED', message: 'Could not save session.' };
    }
    return session;
  }

  const users = read(STORAGE_KEYS.USERS) || [];
  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    return { error: 'INVALID_CREDENTIALS', message: 'Username or password is incorrect.' };
  }

  const session = {
    userId: user.id,
    username: user.username,
    role: user.role,
    token: genToken(),
  };

  const written = write(STORAGE_KEYS.SESSION, session);
  if (!written) {
    return { error: 'STORAGE_WRITE_FAILED', message: 'Could not save session.' };
  }

  return session;
};

/**
 * Registers a new viewer account with the given credentials.
 * Validates uniqueness of username and writes the new user to localStorage.
 * Writes a session to ws_session on success.
 * @param {string} username - The desired username.
 * @param {string} password - The desired password.
 * @param {string} confirmPassword - Must match password.
 * @returns {{ userId: string, username: string, role: string, token: string }|{ error: string, message: string }}
 */
const register = (username, password, confirmPassword) => {
  if (!username || !password || !confirmPassword) {
    return { error: 'INVALID_CREDENTIALS', message: 'All fields are required.' };
  }

  if (username.length < 3) {
    return { error: 'INVALID_CREDENTIALS', message: 'Username must be at least 3 characters.' };
  }

  if (password.length < 6) {
    return { error: 'INVALID_CREDENTIALS', message: 'Password must be at least 6 characters.' };
  }

  if (password !== confirmPassword) {
    return { error: 'INVALID_CREDENTIALS', message: 'Passwords do not match.' };
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
    role: ROLES.VIEWER,
  };

  const updatedUsers = [...users, newUser];
  const usersWritten = write(STORAGE_KEYS.USERS, updatedUsers);
  if (!usersWritten) {
    return { error: 'STORAGE_WRITE_FAILED', message: 'Could not save user.' };
  }

  const session = {
    userId: newUser.id,
    username: newUser.username,
    role: newUser.role,
    token: genToken(),
  };

  const sessionWritten = write(STORAGE_KEYS.SESSION, session);
  if (!sessionWritten) {
    return { error: 'STORAGE_WRITE_FAILED', message: 'Could not save session.' };
  }

  return session;
};

export { login, register };