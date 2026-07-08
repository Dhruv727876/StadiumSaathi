/**
 * Express middleware to validate that the request body contains a 'message' field.
 *
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function.
 * @returns {void}
 */
function validateInput(req, res, next) {
  const { message } = req.body || {};

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'The request body must contain a non-empty "message" string.'
    });
  }

  next();
}

/**
 * Exported validateInput middleware instance.
 */
module.exports = validateInput;
