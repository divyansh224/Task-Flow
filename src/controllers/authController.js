import { registerUser, loginUser, updateUser } from '../services/authService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const register = asyncHandler(async (req, res) => {
  const result = await registerUser(req.body, req.app.locals.config);
  res.status(201).json({ success: true, message: 'Registration successful', data: { user: result.user, accessToken: result.token, tokenType: 'Bearer' } });
});
export const login = asyncHandler(async (req, res) => {
  const result = await loginUser(req.body, req.app.locals.config);
  res.status(200).json({ success: true, message: 'Login successful', data: { user: result.user, accessToken: result.token, tokenType: 'Bearer' } });
});
export const me = asyncHandler(async (req, res) => res.json({ success: true, message: 'Current user retrieved successfully', data: { user: req.user } }));
export const updateMe = asyncHandler(async (req, res) => {
  const user = await updateUser(req.user, req.body);
  res.json({ success: true, message: 'Profile updated successfully', data: { user } });
});
export const logout = asyncHandler(async (_req, res) => {
  // Access tokens are stateless. This endpoint does not revoke a token; clients must discard it.
  res.status(200).json({ success: true, message: 'Logged out locally. Discard the access token; it remains valid until expiry.' });
});
