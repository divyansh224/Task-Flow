import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const authenticate = asyncHandler(async (req, _res, next) => {
  const header = req.get('authorization');
  if (!header?.startsWith('Bearer ')) throw new ApiError(401, 'Authentication required');
  const token = header.slice(7).trim();
  if (!token) throw new ApiError(401, 'Authentication required');
  let payload;
  try { payload = jwt.verify(token, req.app.locals.config.JWT_SECRET, { issuer: 'taskflow-api', audience: 'taskflow-client' }); }
  catch { throw new ApiError(401, 'Invalid or expired access token'); }
  const user = await User.findById(payload.sub);
  if (!user) throw new ApiError(401, 'Invalid or expired access token');
  req.user = user;
  req.token = token;
  next();
});
