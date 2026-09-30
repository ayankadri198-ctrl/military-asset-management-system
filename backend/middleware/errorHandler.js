const db = require('../config/db');

/**
 * Log user action into activity_logs
 */
async function logActivity(userId, userName, action, module, details, ipAddress = '127.0.0.1') {
  try {
    await db.query(
      `INSERT INTO activity_logs (user_id, user_name, action, module, details, ip_address)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId || null, userName || 'System', action, module, details, ipAddress]
    );
  } catch (err) {
    console.error('[ActivityLog] Failed to record log entry:', err.message);
  }
}

/**
 * Central Error Handler
 */
function errorHandler(err, req, res, next) {
  console.error(`[API Error] ${req.method} ${req.originalUrl}:`, err);
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error Encountered',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
}

module.exports = { logActivity, errorHandler };
