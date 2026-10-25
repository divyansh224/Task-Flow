import mongoose from 'mongoose';
import ApiError from '../utils/ApiError.js';

export function errorHandler(error, _req, res, _next) {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal server error';
  let errors = error.errors || [];
  if (error instanceof SyntaxError && 'body' in error) { statusCode = 400; message = 'Malformed JSON request body'; }
  if (error instanceof mongoose.Error.ValidationError) {
    statusCode = 400; message = 'Database validation failed';
    errors = Object.values(error.errors).map((item) => ({ field: item.path, message: item.message }));
  }
  if (error instanceof mongoose.Error.CastError) { statusCode = 400; message = 'Invalid resource identifier'; }
  if (error?.code === 11000) { statusCode = 409; message = 'A user with this email already exists'; }
  if (error?.name === 'TokenExpiredError' || error?.name === 'JsonWebTokenError') { statusCode = 401; message = 'Invalid or expired access token'; }
  if (statusCode >= 500) { message = 'Internal server error'; errors = []; if (process.env.NODE_ENV !== 'production') console.error(error); }
  res.status(statusCode).json({ success: false, message, ...(errors.length ? { errors } : {}) });
}
