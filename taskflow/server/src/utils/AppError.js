/** Error with an HTTP status code that is safe to show to the client. */
class AppError extends Error {
  constructor(message, statusCode = 500, errors) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.errors = errors; // optional: [{ field, message }]
    if (Error.captureStackTrace) Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
