const db = require('../config/db');
const { logActivity } = require('../middleware/errorHandler');

/**
 * Get all personnel with search & filter
 * GET /api/personnel
 */
async function getPersonnel(req, res) {
  try {
    const { search = '', status = '', unit = '' } = req.query;
    let whereClauses = [];
    const params = [];

    if (search) {
      whereClauses.push('(p.full_name LIKE ? OR p.service_number LIKE ? OR p.rank_title LIKE ?)');
      const s = `%${search.trim()}%`;
      params.push(s, s, s);
    }

    if (status) {
      whereClauses.push('p.status = ?');
      params.push(status);
    }

    if (unit) {
      whereClauses.push('p.unit LIKE ?');
      params.push(`%${unit.trim()}%`);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const sql = `
      SELECT 
        p.*,
        COUNT(DISTINCT a.id) as assigned_assets_count
      FROM personnel p
      LEFT JOIN assets a ON a.assigned_to_id = p.id
      ${whereSql}
      GROUP BY p.id
      ORDER BY p.id ASC
    `;

    const [rows] = await db.query(sql, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve personnel: ' + err.message });
  }
}

/**
 * Get single personnel with their assigned gear & vehicles
 * GET /api/personnel/:id
 */
async function getPersonnelById(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM personnel WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Personnel not found.' });

    const person = rows[0];
    const [assignedAssets] = await db.query('SELECT * FROM assets WHERE assigned_to_id = ?', [id]);
    person.assignedAssets = assignedAssets;

    res.json({ success: true, data: person });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Create new personnel record
 * POST /api/personnel
 */
async function createPersonnel(req, res) {
  try {
    const {
      service_number,
      full_name,
      rank_title,
      unit,
      role_assignment,
      clearance_level = 'Secret',
      phone = '',
      email = '',
      status = 'Active',
      assigned_base = 'Forward Operating Base Alpha'
    } = req.body;

    if (!service_number || !full_name || !rank_title || !unit || !role_assignment) {
      return res.status(400).json({
        success: false,
        message: 'Service number, Full name, Rank, Unit, and Role assignment are required.'
      });
    }

    const [existing] = await db.query('SELECT id FROM personnel WHERE service_number = ?', [service_number]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Personnel service number already exists.' });
    }

    const [result] = await db.query(
      `INSERT INTO personnel 
       (service_number, full_name, rank_title, unit, role_assignment, clearance_level, phone, email, status, assigned_base)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [service_number, full_name, rank_title, unit, role_assignment, clearance_level, phone, email, status, assigned_base]
    );

    await logActivity(
      req.user.id,
      req.user.username,
      'CREATE_PERSONNEL',
      'Personnel',
      `Enrolled personnel [${service_number}] ${rank_title} ${full_name}`,
      req.ip
    );

    res.status(201).json({
      success: true,
      message: 'Personnel registered successfully.',
      data: { id: result.insertId }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Update personnel record
 * PUT /api/personnel/:id
 */
async function updatePersonnel(req, res) {
  try {
    const { id } = req.params;
    const {
      service_number,
      full_name,
      rank_title,
      unit,
      role_assignment,
      clearance_level,
      phone,
      email,
      status,
      assigned_base
    } = req.body;

    const [existing] = await db.query('SELECT * FROM personnel WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Personnel not found.' });

    await db.query(
      `UPDATE personnel SET
        service_number = COALESCE(?, service_number),
        full_name = COALESCE(?, full_name),
        rank_title = COALESCE(?, rank_title),
        unit = COALESCE(?, unit),
        role_assignment = COALESCE(?, role_assignment),
        clearance_level = COALESCE(?, clearance_level),
        phone = COALESCE(?, phone),
        email = COALESCE(?, email),
        status = COALESCE(?, status),
        assigned_base = COALESCE(?, assigned_base)
       WHERE id = ?`,
      [service_number, full_name, rank_title, unit, role_assignment, clearance_level, phone, email, status, assigned_base, id]
    );

    await logActivity(
      req.user.id,
      req.user.username,
      'UPDATE_PERSONNEL',
      'Personnel',
      `Updated personnel details #${id} (${full_name})`,
      req.ip
    );

    res.json({ success: true, message: 'Personnel record updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Delete personnel record
 * DELETE /api/personnel/:id
 */
async function deletePersonnel(req, res) {
  try {
    const { id } = req.params;
    const [existing] = await db.query('SELECT full_name, service_number FROM personnel WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Personnel not found.' });

    await db.query('DELETE FROM personnel WHERE id = ?', [id]);

    await logActivity(
      req.user.id,
      req.user.username,
      'DELETE_PERSONNEL',
      'Personnel',
      `Discharged/removed personnel #${id} [${existing[0].service_number}] ${existing[0].full_name}`,
      req.ip
    );

    res.json({ success: true, message: 'Personnel record removed.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  getPersonnel,
  getPersonnelById,
  createPersonnel,
  updatePersonnel,
  deletePersonnel
};
