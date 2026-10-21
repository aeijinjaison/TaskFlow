/**
 * Server-side validation. Every function returns { errors, data }:
 *  - errors: [{ field, message }]  (empty when valid)
 *  - data:   a clean object containing ONLY whitelisted, trimmed fields
 */

const PRIORITIES = ['Low', 'Medium', 'High'];
const STATUSES = ['Pending', 'Done'];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

/** 'YYYY-MM-DD' -> Date at 00:00 UTC, or null if it is not a real calendar date. */
function parseDateOnly(value) {
  if (typeof value !== 'string' || !DATE_RE.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) return null;
  return date;
}

function validateRegister(body) {
  const errors = [];
  if (!isPlainObject(body)) return { errors: [{ field: 'body', message: 'Request body is required' }], data: {} };

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (name.length < 2 || name.length > 50) errors.push({ field: 'name', message: 'Name must be 2-50 characters' });
  if (!EMAIL_RE.test(email) || email.length > 254) errors.push({ field: 'email', message: 'Enter a valid email address' });
  if (password.length < 8 || password.length > 72) {
    errors.push({ field: 'password', message: 'Password must be 8-72 characters' });
  } else if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    errors.push({ field: 'password', message: 'Password must contain at least one letter and one number' });
  }
  return { errors, data: { name, email, password } };
}

function validateLogin(body) {
  const errors = [];
  if (!isPlainObject(body)) return { errors: [{ field: 'body', message: 'Request body is required' }], data: {} };

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  if (!EMAIL_RE.test(email)) errors.push({ field: 'email', message: 'Enter a valid email address' });
  if (!password) errors.push({ field: 'password', message: 'Password is required' });
  return { errors, data: { email, password } };
}

/** partial = true for updates: only validate fields that are present. */
function validateTask(body, { partial = false } = {}) {
  const errors = [];
  const data = {};
  if (!isPlainObject(body)) return { errors: [{ field: 'body', message: 'Request body is required' }], data };

  const has = (key) => Object.prototype.hasOwnProperty.call(body, key);

  if (!partial || has('title')) {
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    if (!title) errors.push({ field: 'title', message: 'Title is required' });
    else if (title.length > 120) errors.push({ field: 'title', message: 'Title must be 120 characters or fewer' });
    else data.title = title;
  }

  if (has('description')) {
    const description = body.description == null ? '' : body.description;
    if (typeof description !== 'string') errors.push({ field: 'description', message: 'Description must be text' });
    else if (description.trim().length > 1000) errors.push({ field: 'description', message: 'Description must be 1000 characters or fewer' });
    else data.description = description.trim();
  }

  if (has('priority')) {
    if (!PRIORITIES.includes(body.priority)) errors.push({ field: 'priority', message: `Priority must be one of: ${PRIORITIES.join(', ')}` });
    else data.priority = body.priority;
  }

  if (has('status')) {
    if (!STATUSES.includes(body.status)) errors.push({ field: 'status', message: `Status must be one of: ${STATUSES.join(', ')}` });
    else data.status = body.status;
  }

  if (has('dueDate')) {
    if (body.dueDate === null || body.dueDate === '') {
      data.dueDate = null;
    } else {
      const parsed = parseDateOnly(body.dueDate);
      if (!parsed) errors.push({ field: 'dueDate', message: 'Due date must be a valid date (YYYY-MM-DD)' });
      else data.dueDate = parsed;
    }
  }

  return { errors, data };
}

module.exports = { PRIORITIES, STATUSES, parseDateOnly, validateRegister, validateLogin, validateTask };
