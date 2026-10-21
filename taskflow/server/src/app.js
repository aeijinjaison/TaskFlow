const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const config = require('./config/env');
const sanitize = require('./middleware/sanitize');
const { notFound, errorHandler } = require('./middleware/error');
const AppError = require('./utils/AppError');

const app = express();
app.disable('x-powered-by');
if (config.env === 'production') app.set('trust proxy', 1); // behind Render/Heroku-style proxies (correct client IPs for rate limiting)

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      // No Origin header = tools like Postman / curl, allow them
      if (!origin || config.clientOrigins.includes(origin)) return callback(null, true);
      return callback(new AppError('Origin not allowed by CORS', 403));
    },
  })
);

if (config.env !== 'test') app.use(morgan(config.env === 'production' ? 'combined' : 'dev'));

app.use(express.json({ limit: '10kb' })); // must come BEFORE the routes
app.use(sanitize);

app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 600,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests. Please slow down' },
  })
);

app.get('/api/health', (req, res) => res.json({ success: true, status: 'ok', time: new Date().toISOString() }));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
