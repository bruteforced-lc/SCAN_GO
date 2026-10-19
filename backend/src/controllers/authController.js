import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import { httpError } from '../utils/httpError.js';
import { signToken } from '../utils/token.js';

const userPayload = (u) => ({ id: u._id, name: u.name, email: u.email, role: u.role });

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    throw httpError(400, 'Name, email and password are required');
  }

  const exists = await User.findOne({ email: String(email).toLowerCase() });
  if (exists) throw httpError(409, 'Email already registered');

  // role is always "user" here; admins are created through the seed script
  const user = await User.create({ name, email, password });
  res.status(201).json({ token: signToken(user._id), user: userPayload(user) });
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw httpError(400, 'Email and password are required');

  const user = await User.findOne({ email: String(email).toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    throw httpError(401, 'Invalid email or password');
  }

  res.json({ token: signToken(user._id), user: userPayload(user) });
});

// GET /api/auth/me
export const me = (req, res) => {
  res.json({ user: userPayload(req.user) });
};
