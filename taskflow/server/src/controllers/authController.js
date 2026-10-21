const jwt = require('jsonwebtoken');
const config = require('../config/env');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { validateRegister, validateLogin } = require('../utils/validators');

const signToken = (id) => jwt.sign({ id }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });

const sendAuth = (res, status, user) =>
  res.status(status).json({ success: true, token: signToken(user.id), data: { user: user.toJSON() } });

// POST /api/auth/register
exports.register = asyncHandler(async (req, res) => {
  const { errors, data } = validateRegister(req.body);
  if (errors.length) throw new AppError('Validation failed', 400, errors);

  const exists = await User.exists({ email: data.email });
  if (exists) throw new AppError('An account with this email already exists', 409, [{ field: 'email', message: 'Email is already registered' }]);

  const user = await User.create(data);
  sendAuth(res, 201, user);
});

// POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { errors, data } = validateLogin(req.body);
  if (errors.length) throw new AppError('Validation failed', 400, errors);

  const user = await User.findOne({ email: data.email }).select('+password');
  const ok = user && (await user.comparePassword(data.password));
  // Same message for unknown email and wrong password: do not reveal which accounts exist
  if (!ok) throw new AppError('Invalid email or password', 401);

  sendAuth(res, 200, user);
});

// GET /api/auth/me
exports.me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { user: req.user.toJSON() } });
});
