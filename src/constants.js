export const STORAGE_KEYS = {
  USERS: 'ws_users',
  POSTS: 'ws_posts',
  SESSION: 'ws_session',
};

export const ROLES = {
  ADMIN: 'admin',
  VIEWER: 'viewer',
};

export const HARD_CODED_ADMIN = {
  id: 'u_admin',
  username: 'admin',
  password: 'admin',
  role: ROLES.ADMIN,
};