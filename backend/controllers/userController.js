const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { logActivity } = require('../middleware/errorHandler');

/**
 * Get all users
 * GET /api/users
 */
async function getUsers(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT id, username, email, role, rank_title, military_unit, service_id, status, created_at
       FROM users ORDER BY id ASC`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Create new user account
 * POST /api/users
 */
async function createUser(req, res) {
  try {
    const {
      username,
      email,
      password,
      role = 'Staff',
      rank_title = 'Specialist',
      military_unit = 'Logistics Command HQ',
      service_id
    } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'Username, Email, and Password are required.' });
    }

    const [dup] = await db.query('SELECT id FROM users WHERE email = ? OR username = ?', [email, username]);
    if (dup.length > 0) {
      return res.status(409).json({ success: false, message: 'Username or Email is already registered.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const generatedServiceId = service_id || `USR-${Math.floor(1000 + Math.random() * 9000)}`;

    const [result] = await db.query(
      `INSERT INTO users 
       (username, email, password, role, rank_title, military_unit, service_id, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Active')`,
      [username, email, hashedPassword, role, rank_title, military_unit, generatedServiceId]
    );

    await logActivity(
      req.user.id,
      req.user.username,
      'CREATE_USER',
      'Users',
      `Provisioned account [${username}] with role [${role}]`,
      req.ip
    );

    res.status(201).json({
      success: true,
      message: 'User account created successfully.',
      data: { id: result.insertId, username, email, role }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Update user role or status
 * PUT /api/users/:id
 */
async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { role, status, rank_title, military_unit } = req.body;

    const [existing] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'User not found.' });

    await db.query(
      `UPDATE users SET
        role = COALESCE(?, role),
        status = COALESCE(?, status),
        rank_title = COALESCE(?, rank_title),
        military_unit = COALESCE(?, military_unit)
       WHERE id = ?`,
      [role, status, rank_title, military_unit, id]
    );

    await logActivity(
      req.user.id,
      req.user.username,
      'UPDATE_USER',
      'Users',
      `Updated user #${id} permissions / status`,
      req.ip
    );

    res.json({ success: true, message: 'User account updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Delete user account
 * DELETE /api/users/:id
 */
async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    if (parseInt(id, 10) === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own administrative account.' });
    }

    const [existing] = await db.query('SELECT username FROM users WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'User not found.' });

    await db.query('DELETE FROM users WHERE id = ?', [id]);

    await logActivity(
      req.user.id,
      req.user.username,
      'DELETE_USER',
      'Users',
      `Revoked user account #${id} (${existing[0].username})`,
      req.ip
    );

    res.json({ success: true, message: 'User account removed.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  getUsers,
  createUser,
  updateUser,
  deleteUser
};
