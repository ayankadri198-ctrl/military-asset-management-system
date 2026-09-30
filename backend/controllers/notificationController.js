const db = require('../config/db');

/**
 * Get notifications for current user or broadcast
 * GET /api/notifications
 */
async function getNotifications(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT * FROM notifications 
       WHERE user_id IS NULL OR user_id = ?
       ORDER BY id DESC LIMIT 50`,
      [req.user.id]
    );

    const [unread] = await db.query(
      `SELECT COUNT(*) as unread_count FROM notifications
       WHERE (user_id IS NULL OR user_id = ?) AND is_read = 0`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: rows,
      unreadCount: unread[0] ? unread[0].unread_count : 0
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Mark notification as read
 * PUT /api/notifications/:id/read
 */
async function markAsRead(req, res) {
  try {
    const { id } = req.params;
    await db.query('UPDATE notifications SET is_read = 1 WHERE id = ?', [id]);
    res.json({ success: true, message: 'Notification marked as read.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Mark all notifications as read
 * PUT /api/notifications/read-all
 */
async function markAllAsRead(req, res) {
  try {
    await db.query(
      'UPDATE notifications SET is_read = 1 WHERE user_id IS NULL OR user_id = ?',
      [req.user.id]
    );
    res.json({ success: true, message: 'All notifications cleared.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead
};
