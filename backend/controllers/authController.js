const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { logActivity } = require('../middleware/errorHandler');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_military_jwt_key_2026_defense_grade';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * User Login
 * POST /api/auth/login
 */
async function login(req, res) {
  try {
    const identifier = (req.body.username || req.body.email || req.body.identifier || '').trim();
    const { password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Security protocol requires Username / Military Email and Access Password.'
      });
    }

    const [users] = await db.query(
      'SELECT * FROM users WHERE LOWER(email) = LOWER(?) OR LOWER(username) = LOWER(?)',
      [identifier, identifier]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Access Denied.'
      });
    }

    const user = users[0];

    if (user.status !== 'Active') {
      return res.status(403).json({
        success: false,
        message: `Account status [${user.status}]. Contact Base Security Officer.`
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await logActivity(user.id, user.username, 'FAILED_LOGIN_ATTEMPT', 'Authentication', `Invalid password attempted for ${email}`, req.ip);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Access Denied.'
      });
    }

    // Generate token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    await logActivity(user.id, user.username, 'LOGIN_SUCCESS', 'Authentication', `Logged in successfully as [${user.role}]`, req.ip);

    // Sanitize user object
    delete user.password;

    res.json({
      success: true,
      message: 'Authentication validated. Welcome to Tactical Command.',
      token,
      user
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Authentication processing failed: ' + err.message
    });
  }
}

/**
 * Get Authenticated User Details
 * GET /api/auth/me
 */
async function getMe(req, res) {
  try {
    const [users] = await db.query(
      'SELECT id, username, email, role, rank_title, military_unit, service_id, status, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User record not found.' });
    }

    res.json({
      success: true,
      user: users[0]
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Logout
 * POST /api/auth/logout
 */
async function logout(req, res) {
  try {
    if (req.user) {
      await logActivity(req.user.id, req.user.username, 'LOGOUT', 'Authentication', 'User terminated session.', req.ip);
    }
    res.json({
      success: true,
      message: 'Session cleared. Device disconnected securely.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Change Password
 * PUT /api/auth/change-password
 */
async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both current and new passwords are required.' });
    }

    const [rows] = await db.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'User not found.' });

    const isMatch = await bcrypt.compare(currentPassword, rows[0].password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password does not match records.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);
    await logActivity(req.user.id, req.user.username, 'CHANGE_PASSWORD', 'Security', 'User updated password cipher.', req.ip);

    res.json({ success: true, message: 'Password updated securely.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * User Registration (Officer Enlistment)
 * POST /api/auth/register
 */
async function register(req, res) {
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
      return res.status(400).json({
        success: false,
        message: 'Security protocol requires Call-sign / Username, Military Email, and Password.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    // Check duplicate email or username
    const [existing] = await db.query(
      'SELECT id FROM users WHERE LOWER(email) = LOWER(?) OR LOWER(username) = LOWER(?)',
      [email.trim(), username.trim()]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'A personnel account with this Email or Call-sign already exists.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const generatedServiceId = service_id && service_id.trim() !== ''
      ? service_id.trim()
      : `MIL-${Math.floor(10000 + Math.random() * 90000)}`;

    const [result] = await db.query(
      `INSERT INTO users (username, email, password, role, rank_title, military_unit, service_id, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Active')`,
      [username.trim(), email.trim(), hashedPassword, role, rank_title, military_unit, generatedServiceId]
    );

    const newUserId = result.insertId;

    // Generate JWT token
    const token = jwt.sign(
      {
        id: newUserId,
        username: username.trim(),
        email: email.trim(),
        role: role
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const newUser = {
      id: newUserId,
      username: username.trim(),
      email: email.trim(),
      role: role,
      rank_title: rank_title,
      military_unit: military_unit,
      service_id: generatedServiceId,
      status: 'Active'
    };

    await logActivity(
      newUserId,
      username.trim(),
      'REGISTER_SUCCESS',
      'Authentication',
      `New personnel [${username.trim()}] enlisted with rank [${rank_title}] and service ID [${generatedServiceId}]`,
      req.ip
    );

    res.status(201).json({
      success: true,
      message: `Enlistment confirmed. Officer [${username.trim()}] assigned Service ID: ${generatedServiceId}.`,
      token,
      user: newUser
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Registration processing failed: ' + err.message
    });
  }
}

module.exports = { login, register, getMe, logout, changePassword };

