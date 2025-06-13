const errorHandler = (error, req, res, next) => {
  let message = error.message;
  let statusCode = error.statusCode || 500;

  // Sequelize validation errors
  if (error.name === 'SequelizeValidationError') {
    message = error.errors.map(err => err.message).join(', ');
    statusCode = 400;
  }

  // Sequelize unique constraint errors
  if (error.name === 'SequelizeUniqueConstraintError') {
    message = 'This email is already registered';
    statusCode = 409;
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    message = 'Invalid token';
    statusCode = 401;
  }

  if (error.name === 'TokenExpiredError') {
    message = 'Token expired';
    statusCode = 401;
  }

  // Multer errors
  if (error.code === 'LIMIT_FILE_SIZE') {
    message = 'File too large';
    statusCode = 413;
  }

  if (error.code === 'LIMIT_FILE_COUNT') {
    message = 'Too many files';
    statusCode = 413;
  }

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', error);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  asyncHandler
};
