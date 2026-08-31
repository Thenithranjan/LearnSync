const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const courseRoutes = require('./routes/course.routes');
const moduleRoutes = require('./routes/module.routes');
const testRoutes = require('./routes/test.routes');
const errorHandler = require('./middleware/error.middleware');
const { sendError } = require('./utils/apiResponse');

const app = express();

// Enable CORS with credentials for frontend client
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
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

// Root health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'EduPulse Authentication & User Management API',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api', moduleRoutes); // Handles /api/courses/:courseId/modules and /api/modules/:id
app.use('/api', testRoutes);

// Handle 404 for undefined routes
app.use('*', (req, res) => {
  sendError(res, 404, `Endpoint not found: ${req.originalUrl}`);
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
