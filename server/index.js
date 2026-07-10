const fs = require('fs');
const path = require('path');

// Optionally load environment variables from local .env file
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath) && typeof process.loadEnvFile === 'function') {
  process.loadEnvFile(envPath);
}

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const aiService = require('./services/aiService');

// 1. Enforce Env checks on Startup (Non-test environments)
if (process.env.NODE_ENV !== 'test') {
  const geminiKey = process.env.GEMINI_API_KEY;
  const mapsKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!geminiKey || !mapsKey) {
    process.stderr.write('[CRITICAL] Mandatory environment variables GEMINI_API_KEY or GOOGLE_MAPS_API_KEY are missing. Exiting server.\n');
    process.exit(1);
  }
}

// Initialize Express App
const app = express();

// 2. Helmet HTTP Header Security with Content Security Policy (Absolute First Middleware)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://maps.googleapis.com"],
      connectSrc: ["'self'", "https://generativelanguage.googleapis.com", "https://integrate.api.nvidia.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://maps.gstatic.com", "https://*.googleapis.com"]
    }
  }
}));

// CORS Configuration - restrict to approved origins (CORS Allowlist)
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://stadiumsaathi-prod-98.firebaseapp.com',
  'https://stadiumsaathi-prod-98.web.app',
  'https://stadiumsaathi-399b9.firebaseapp.com',
  'https://stadiumsaathi-399b9.web.app'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  optionsSuccessStatus: 200
}));

// Parse application/json payloads with size limits
app.use(express.json({ limit: '10kb' }));

// 3. Express Rate Limiter Configurations
const chatRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  message: {
    error: 'Too Many Requests',
    message: 'Rate limit exceeded on chat endpoint. Max 20 requests/min.'
  }
});

const secondaryRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 15,
  message: {
    error: 'Too Many Requests',
    message: 'Rate limit exceeded. Max 15 requests/min.'
  }
});

// 4. Express Validator Input Validation & XSS Sanitization Rules
const validateChatPayload = [
  body('message')
    .isString()
    .trim()
    .notEmpty().withMessage('Message parameter is required')
    .isLength({ max: 1000 }).withMessage('Message content must be under 1000 characters')
    .escape(),
  body('persona')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 }).withMessage('Persona must be under 100 characters')
    .escape(),
  body('language')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 20 }).withMessage('Language parameter must be under 20 characters')
    .escape(),
  body('accessibilityProfile')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 }).withMessage('Accessibility profile parameter must be under 500 characters')
    .escape(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Bad Request',
        errors: errors.array()
      });
    }
    next();
  }
];

// Mount secondary rate limiting globally by default
app.use(secondaryRateLimiter);

/**
 * Health check endpoint to verify server status.
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    service: 'StadiumSaathi Backend'
  });
});

/**
 * AI endpoint to process navigation or crowd query.
 * Specific rate limiting (20 req/min) and validator middleware applied.
 */
app.post('/api/chat', chatRateLimiter, validateChatPayload, async (req, res, next) => {
  try {
    const { message, persona, language, accessibilityProfile } = req.body;
    
    let processedMessage = message;
    if (accessibilityProfile) {
      processedMessage = `[User Accessibility Needs: ${accessibilityProfile}]\n${message}`;
    }

    const result = await aiService.processMessage(processedMessage, persona, language);
    res.status(200).json({
      success: true,
      provider: result.provider,
      response: result.text
    });
  } catch (error) {
    next(error);
  }
});

// 5. 404 Route Handler (After all registered routes)
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Endpoint ${req.method} ${req.originalUrl} does not exist.`
  });
});

// 6. Centralized Global Error Handler (Bottom of stack)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: 'A secure server error occurred. Please contact venue administration.'
  });
});

// Define Server Port
const PORT = process.env.PORT || 5000;

let server;
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => {
    process.stdout.write(`[SERVER] StadiumSaathi operational on port ${PORT}\n`);
  });
}

/**
 * Exported Express application and server instances for execution and testing.
 */
module.exports = { app, server };
