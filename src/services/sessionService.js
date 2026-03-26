import { read, write } from './storage.js';
import { STORAGE_KEYS } from '../constants.js';

/**
 * Retrieves the current session from localStorage.
 * @returns {Object|null} The session object or null if no session exists.
 */
const getSession = () => {
  return read(STORAGE_KEYS.SESSION);
};

/**
 * Clears the current session from localStorage.
 */
const logout = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  } catch (err) {
    console.error('[SessionService] Failed to clear session:', err);
    write(STORAGE_KEYS.SESSION, null);
  }
};

export { getSession, logout };