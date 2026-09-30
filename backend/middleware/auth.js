const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_military_jwt_key_2026_defense_grade';

/**
 * Middleware to authenticate requests via JWT Bearer Token
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access Denied: Missing or malformed authentication token.'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    // Fetch fresh user data
    const [users] = await db.query(
      'SELECT id, username, email, role, rank_title, military_unit, service_id, status FROM users WHERE id = ?',
      [decoded.id]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Security validation failed: User account does not exist.'
      });
    }

    const user = users[0];
    if (user.status !== 'Active') {
      return res.status(403).json({
        success: false,
        message: 'Account access revoked or suspended by Command HQ.'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authorization token.',
      error: err.message
    });
  }
}

/**
 * Role-based authorization middleware
 * @param  {...string} allowedRoles e.g. ('Admin', 'Manager')
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required prior to clearance verification.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Clearance Denied: Role [${req.user.role}] does not possess operational clearance for this action.`
      });
    }

    next();
  };
}

module.exports = { authenticate, authorize };
