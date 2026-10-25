import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';

export async function registerUser(input, config) {
  const existing = await User.findOne({ email: input.email });
  if (existing) throw new ApiError(409, 'A user with this email already exists');
  const user = await User.create(input);
  return { user, token: signToken(user, config) };
}
export async function loginUser(input, config) {
  const user = await User.findOne({ email: input.email }).select('+password');
  const passwordMatches = user ? await user.comparePassword(input.password) : false;
  if (!passwordMatches) throw new ApiError(401, 'Invalid email or password');
  return { user, token: signToken(user, config) };
}
export function signToken(user, config) {
  return jwt.sign({}, config.JWT_SECRET, { subject: user.id, expiresIn: config.JWT_EXPIRES_IN, issuer: 'taskflow-api', audience: 'taskflow-client' });
}
export async function updateUser(user, input) {
  if (input.name !== undefined) user.name = input.name;
  if (input.email !== undefined) user.email = input.email;
  if (input.password !== undefined) user.password = input.password;
  await user.save();
  return user;
}
