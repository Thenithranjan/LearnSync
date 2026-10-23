const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const departmentRoutes = require('./routes/department.routes');
const courseRoutes = require('./routes/course.routes');
const moduleRoutes = require('./routes/module.routes');
const materialRoutes = require('./routes/material.routes');
const enrollmentRoutes = require('./routes/enrollment.routes');
const progressRoutes = require('./routes/progress.routes');
const assessmentRoutes = require('./routes/assessment.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const forumRoutes = require('./routes/forum.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const intelligenceRoutes = require('./routes/intelligence.routes');
const interventionRoutes = require('./routes/intervention.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const testRoutes = require('./routes/test.routes');
const errorHandler = require('./middleware/error.middleware');
const requestCache = require('./utils/requestCache');
const { sendError } = require('./utils/apiResponse');

const app = express();

// Dynamic authenticated JSON must never be served stale: Express ETags cause
// browsers to revalidate with If-None-Match and get 304s with empty bodies,
// which leaves axios with no data. Disable ETags for the whole app.
app.set('etag', false);

// Enable CORS with credentials for frontend client
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://learnsync-9gpd.vercel.app',
  'https://learnsync-nine.vercel.app'
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.indexOf(origin) !== -1 ||
        origin.endsWith('.vercel.app') ||
        process.env.NODE_ENV !== 'production'
      ) {
        return callback(null, true);
      }
      return callback(new Error('CORS policy violation'));
    },
    credentials: true
  })
);

// Middleware for parsing request bodies & cookies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Tell browsers/proxies to never cache API responses (all are authenticated,
// user-specific and change frequently — e.g. /api/dashboard/*, /api/auth/me).
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  next();
});

// Request-scoped memo cache for expensive analytics computations
app.use(requestCache.middleware);

// Root health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'EduPulse Authentication & Digital Learning API',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api', enrollmentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api', moduleRoutes);
app.use('/api', materialRoutes);
app.use('/api', progressRoutes);
app.use('/api', assessmentRoutes);
app.use('/api', attendanceRoutes);
app.use('/api', forumRoutes);
app.use('/api', analyticsRoutes);
app.use('/api', intelligenceRoutes);
app.use('/api', interventionRoutes);
app.use('/api', dashboardRoutes);
app.use('/api', testRoutes);

// Handle 404 for undefined routes
app.use('*', (req, res) => {
  sendError(res, 404, `Endpoint not found: ${req.originalUrl}`);
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
