const jwt = require('jsonwebtoken');

/**
 * JWT Authentication Middleware
 * Validates JWT token and sets req.user = { sub, role }
 * 
 * @param {Array} allowedRoles - Array of roles allowed to access (e.g., ['student', 'teacher'])
 * @returns {Function} Express middleware function
 */
const auth = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      // Get token from Authorization header
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if role is allowed
      if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
      }

      // Set user info in request
      req.user = {
        sub: decoded.sub,
        role: decoded.role
      };

      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Invalid token' });
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired' });
      }
      return res.status(500).json({ error: 'Authentication error' });
    }
  };
};

module.exports = auth;

