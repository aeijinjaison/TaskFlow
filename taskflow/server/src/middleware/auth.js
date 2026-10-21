const jwt = require('jsonwebtoken');
const config = require('../config/env');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

/** Protects a route: verifies the Bearer token and attaches the user to req.user. */
const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw new AppError('Please log in to continue', 401);
  }

  const payload = jwt.verify(token, config.jwtSecret); // throws on invalid / expired
  const user = await User.findById(payload.id);
  if (!user) throw new AppError('This account no longer exists', 401);

  req.user = user;
  next();
});

module.exports = { protect };
