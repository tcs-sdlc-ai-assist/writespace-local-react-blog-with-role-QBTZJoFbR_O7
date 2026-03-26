import { read, write } from './storage.js';
import { getSession } from './sessionService.js';
import { STORAGE_KEYS, ROLES } from '../constants.js';

/**
 * Generates a unique post ID string.
 * @returns {string} A unique post ID.
 */
const genPostId = () => {
  return 'p_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
};

/**
 * Retrieves all posts from localStorage, sorted by createdAt descending.
 * @returns {Array<{ id: string, title: string, content: string, authorId: string, authorUsername: string, createdAt: string, updatedAt: string }>}
 */
const getPosts = () => {
  const posts = read(STORAGE_KEYS.POSTS) || [];
  return posts.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

/**
 * Creates a new blog post. Requires an active session.
 * @param {{ title: string, content: string }} postData - The data for the new post.
 * @returns {{ id: string, title: string, content: string, authorId: string, authorUsername: string, createdAt: string, updatedAt: string }|{ error: string, message: string }}
 */
const createPost = (postData) => {
  const session = getSession();
  if (!session) {
    return { error: 'NOT_AUTHORIZED', message: 'Login required.' };
  }

  const { title, content } = postData || {};

  if (!title || !content) {
    return { error: 'INVALID_CREDENTIALS', message: 'Title and content are required.' };
  }

  if (title.trim().length === 0) {
    return { error: 'INVALID_CREDENTIALS', message: 'Title cannot be empty.' };
  }

  if (title.length > 100) {
    return { error: 'INVALID_CREDENTIALS', message: 'Title must be 100 characters or fewer.' };
  }

  if (content.trim().length === 0) {
    return { error: 'INVALID_CREDENTIALS', message: 'Content cannot be empty.' };
  }

  if (content.length > 5000) {
    return { error: 'INVALID_CREDENTIALS', message: 'Content must be 5000 characters or fewer.' };
  }

  const now = new Date().toISOString();
  const newPost = {
    id: genPostId(),
    title: title.trim(),
    content: content.trim(),
    authorId: session.userId,
    authorUsername: session.username,
    createdAt: now,
    updatedAt: now,
  };

  const posts = read(STORAGE_KEYS.POSTS) || [];
  const updatedPosts = [...posts, newPost];
  const written = write(STORAGE_KEYS.POSTS, updatedPosts);
  if (!written) {
    return { error: 'STORAGE_WRITE_FAILED', message: 'Could not save post.' };
  }

  return newPost;
};

/**
 * Edits an existing blog post by ID.
 * Admin can edit any post; Viewer can only edit their own posts.
 * @param {string} postId - The ID of the post to edit.
 * @param {{ title: string, content: string }} updates - The updated fields.
 * @returns {{ id: string, title: string, content: string, authorId: string, authorUsername: string, createdAt: string, updatedAt: string }|{ error: string, message: string }}
 */
const editPost = (postId, updates) => {
  const session = getSession();
  if (!session) {
    return { error: 'NOT_AUTHORIZED', message: 'Login required.' };
  }

  if (!postId) {
    return { error: 'INVALID_CREDENTIALS', message: 'Post ID is required.' };
  }

  const { title, content } = updates || {};

  if (!title || !content) {
    return { error: 'INVALID_CREDENTIALS', message: 'Title and content are required.' };
  }

  if (title.trim().length === 0) {
    return { error: 'INVALID_CREDENTIALS', message: 'Title cannot be empty.' };
  }

  if (title.length > 100) {
    return { error: 'INVALID_CREDENTIALS', message: 'Title must be 100 characters or fewer.' };
  }

  if (content.trim().length === 0) {
    return { error: 'INVALID_CREDENTIALS', message: 'Content cannot be empty.' };
  }

  if (content.length > 5000) {
    return { error: 'INVALID_CREDENTIALS', message: 'Content must be 5000 characters or fewer.' };
  }

  const posts = read(STORAGE_KEYS.POSTS) || [];
  const postIndex = posts.findIndex((p) => p.id === postId);

  if (postIndex === -1) {
    return { error: 'NOT_FOUND', message: 'Post not found.' };
  }

  const post = posts[postIndex];

  if (session.role !== ROLES.ADMIN && post.authorId !== session.userId) {
    return { error: 'NOT_AUTHORIZED', message: 'You do not have permission to edit this post.' };
  }

  const updatedPost = {
    ...post,
    title: title.trim(),
    content: content.trim(),
    updatedAt: new Date().toISOString(),
  };

  const updatedPosts = [...posts];
  updatedPosts[postIndex] = updatedPost;

  const written = write(STORAGE_KEYS.POSTS, updatedPosts);
  if (!written) {
    return { error: 'STORAGE_WRITE_FAILED', message: 'Could not update post.' };
  }

  return updatedPost;
};

/**
 * Deletes a blog post by ID.
 * Admin can delete any post; Viewer can only delete their own posts.
 * @param {string} postId - The ID of the post to delete.
 * @returns {boolean|{ error: string, message: string }}
 */
const deletePost = (postId) => {
  const session = getSession();
  if (!session) {
    return { error: 'NOT_AUTHORIZED', message: 'Login required.' };
  }

  if (!postId) {
    return { error: 'INVALID_CREDENTIALS', message: 'Post ID is required.' };
  }

  const posts = read(STORAGE_KEYS.POSTS) || [];
  const post = posts.find((p) => p.id === postId);

  if (!post) {
    return { error: 'NOT_FOUND', message: 'Post not found.' };
  }

  if (session.role !== ROLES.ADMIN && post.authorId !== session.userId) {
    return { error: 'NOT_AUTHORIZED', message: 'You do not have permission to delete this post.' };
  }

  const updatedPosts = posts.filter((p) => p.id !== postId);
  const written = write(STORAGE_KEYS.POSTS, updatedPosts);
  if (!written) {
    return { error: 'STORAGE_WRITE_FAILED', message: 'Could not delete post.' };
  }

  return true;
};

export { getPosts, createPost, editPost, deletePost };