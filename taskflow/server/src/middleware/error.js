const config = require('../config/env');

function notFound(req, res) {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
}

/** Central error handler: one consistent JSON shape, no internals leaked. */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let status = err.statusCode || err.status || 500;
  let message = err.message || 'Unexpected error';
  let errors = err.errors;

  if (err.name === 'ValidationError' && err.errors && !Array.isArray(err.errors)) {
    status = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
  } else if (err.name === 'CastError') {
    status = 400;
    message = `Invalid value for "${err.path}"`;
    errors = undefined;
  } else if (err.code === 11000) {
    status = 409;
    message = 'That value is already in use';
    errors = undefined;
  } else if (err.name === 'TokenExpiredError') {
    status = 401;
    message = 'Your session has expired. Please log in again';
  } else if (err.name === 'JsonWebTokenError') {
    status = 401;
    message = 'Invalid login token. Please log in again';
  } else if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'Malformed JSON in request body';
  } else if (err.type === 'entity.too.large') {
    status = 413;
    message = 'Request body is too large';
  }

  if (status >= 500) {
    // Full details only in the server log, never in the response
    console.error('[error]', err);
    message = 'Something went wrong on our side. Please try again';
    errors = undefined;
  }

  const body = { success: false, message };
  if (errors && errors.length) body.errors = errors;
  if (config.env === 'development' && status >= 500) body.debug = err.message;
  res.status(status).json(body);
}

module.exports = { notFound, errorHandler };
