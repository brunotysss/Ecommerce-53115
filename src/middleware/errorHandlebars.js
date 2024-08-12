import createError from 'http-errors';
import logger from '../config/logger.js';

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

  const error = createError(err.status || 500, err.message);
  res.status(error.status).json({ error: error.message });
};

// Aquí es donde defines la exportación predeterminada
export default errorHandler;
