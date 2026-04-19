const AppError = require('./AppError');

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || `${statusCode}`.startsWith('4') ? 'fail' : 'error';

  if (process.env.NODE_ENV === 'development') {
    return res.status(statusCode).json({
      status,
      message: err.message,
      stack: err.stack,
      error: err
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'fail',
      message: 'Token expiré. Veuillez vous reconnecter.'
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'fail',
      message: 'Token invalide. Authentification requise.'
    });
  }

  if (err instanceof AppError && err.isOperational) {
    return res.status(statusCode).json({
      status,
      message: err.message
    });
  }

  console.error('Unexpected error:', err);
  res.status(500).json({
    status: 'error',
    message: 'Une erreur interne est survenue'
  });
};

module.exports = errorHandler;
