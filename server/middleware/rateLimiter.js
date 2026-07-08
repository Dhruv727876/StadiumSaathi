/**
 * Simple in-memory store for rate limiting.
 * @type {Record<string, { count: number, resetTime: number }>}
 */
const ipRequests = {};

/**
 * Express middleware to rate limit incoming requests by IP address.
 * Defaults to a maximum of 100 requests per 15 minutes window.
 *
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function.
 * @returns {void}
 */
function rateLimiter(req, res, next) {
  const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
  const currentTime = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 100;

  if (!ipRequests[ip]) {
    ipRequests[ip] = {
      count: 1,
      resetTime: currentTime + windowMs
    };
    return next();
  }

  const record = ipRequests[ip];

  if (currentTime > record.resetTime) {
    record.count = 1;
    record.resetTime = currentTime + windowMs;
    return next();
  }

  record.count += 1;

  if (record.count > maxRequests) {
    return res.status(429).json({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.'
    });
  }

  next();
}

/**
 * Exported rateLimiter middleware instance.
 */
module.exports = rateLimiter;
