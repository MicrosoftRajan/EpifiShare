const jwt = require('jsonwebtoken');
const { COOKIE_NAME } = require('../utils/cookies');

function extractToken(req) {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    return header.slice(7);
  }
  if (req.cookies && req.cookies[COOKIE_NAME]) {
    return req.cookies[COOKIE_NAME];
  }
  return null;
}

function authMiddleware(req, res, next) {
  const token = extractToken(req);

  if (!token) {
    res.locals.errorMessage = 'Authorization token required';
    return res.status(401).json({
      message: res.locals.errorMessage,
      hint: 'Send Bearer token in Authorization header or login to receive an access_token cookie',
    });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.sub;
    next();
  } catch {
    res.locals.errorMessage = 'Invalid or expired token';
    return res.status(401).json({ message: res.locals.errorMessage });
  }
}

module.exports = { authMiddleware, extractToken };
