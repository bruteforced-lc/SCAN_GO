import User from '../models/User.js';
import { verifyToken } from '../utils/token.js';
import { httpError } from '../utils/httpError.js';
import asyncHandler from '../utils/asyncHandler.js';

export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw httpError(401, 'Not logged in');

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    throw httpError(401, 'Session expired, please log in again');
  }

  const user = await User.findById(payload.id);
  if (!user) throw httpError(401, 'User no longer exists');

  req.user = user;
  next();
});

export const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return next(httpError(403, 'Admin access required'));
  }
  next();
};
