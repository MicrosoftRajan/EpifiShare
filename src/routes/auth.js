const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { isValidEmail } = require('../utils');
const { hashPassword, comparePassword } = require('../utils/password');
const { setAuthCookie, clearAuthCookie } = require('../utils/cookies');
const { generateAvatarUrl } = require('../utils/avatar');
const { authMiddleware } = require('../middleware/auth');

function userResponse(user) {
  return {
    email: user.email,
    avatar: user.avatar || generateAvatarUrl(user.email),
  };
}

const router = express.Router();

const MIN_PASSWORD_LENGTH = 6;

router.post('/register', async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    res.locals.errorMessage = 'Email and password are required';
    return res.status(400).json({ message: res.locals.errorMessage });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
    return res
      .status(400)
      .json({ message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    return res.status(409).json({ message: 'Email already registered' });
  }

  const passwordHash = await hashPassword(password);

  const avatar = generateAvatarUrl(normalizedEmail);
  let user;

  try {
    user = await User.create({ email: normalizedEmail, passwordHash, avatar });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Email already registered' });
    }
    throw err;
  }

  console.log(`   ↳ Registered: ${normalizedEmail}`);
  return res.status(201).json({
    message: 'User registered successfully',
    user: userResponse(user),
  });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');

  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  if (!user.avatar) {
    user.avatar = generateAvatarUrl(user.email);
    await user.save();
  }

  const access_token = jwt.sign(
    { sub: user._id.toString() },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );

  setAuthCookie(res, access_token);
  console.log(`   ↳ Login OK: ${normalizedEmail} (cookie + token set)`);

  return res.status(200).json({
    access_token,
    user: userResponse(user),
    message: 'Login successful. Token is also stored in the access_token cookie.',
  });
});

router.get('/me', authMiddleware, async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  if (!user.avatar) {
    user.avatar = generateAvatarUrl(user.email);
    await user.save();
  }
  return res.status(200).json(userResponse(user));
});

router.post('/logout', (_req, res) => {
  clearAuthCookie(res);
  return res.status(200).json({ message: 'Logged out successfully' });
});

module.exports = router;
