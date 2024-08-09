const createError = require('http-errors');
const logger = require('../config/logger');

module.exports = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

  const error = createError(err.status || 500, err.message);
  res.status(error.status).json({ error: error.message });
};
