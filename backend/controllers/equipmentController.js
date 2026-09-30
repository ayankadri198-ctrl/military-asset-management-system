const db = require('../config/db');
const { logActivity } = require('../middleware/errorHandler');

/**
 * Get all equipment
 * GET /api/equipment
 */
async function getEquipment(req, res) {
  try {
    const { search = '', category = '', operational_state = '' } = req.query;
    let whereClauses = [];
    const params = [];

    if (search) {
      whereClauses.push('(e.serial_no LIKE ? OR a.name LIKE ? OR a.asset_code LIKE ? OR e.storage_locker LIKE ?)');
      const s = `%${search.trim()}%`;
      params.push(s, s, s, s);
    }

    if (category) {
      whereClauses.push('e.category = ?');
      params.push(category);
    }

    if (operational_state) {
      whereClauses.push('e.operational_state = ?');
      params.push(operational_state);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const sql = `
      SELECT 
        e.*,
        a.name AS asset_name,
        a.asset_code,
        a.type AS asset_type,
        a.status AS asset_status,
        a.location,
        a.condition_state,
        p.full_name AS assigned_to_name,
        p.rank_title AS assigned_to_rank
      FROM equipment e
      JOIN assets a ON e.asset_id = a.id
      LEFT JOIN personnel p ON a.assigned_to_id = p.id
      ${whereSql}
      ORDER BY e.id ASC
    `;

    const [rows] = await db.query(sql, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve equipment: ' + err.message });
  }
}

/**
 * Get single equipment by ID
 * GET /api/equipment/:id
 */
async function getEquipmentById(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      `SELECT 
        e.*,
        a.name AS asset_name,
        a.asset_code,
        a.status AS asset_status,
        a.location,
        a.condition_state,
        a.value_usd,
        p.full_name AS assigned_to_name
      FROM equipment e
      JOIN assets a ON e.asset_id = a.id
      LEFT JOIN personnel p ON a.assigned_to_id = p.id
      WHERE e.id = ?`,
      [id]
    );

    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Equipment not found.' });

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Create equipment
 * POST /api/equipment
 */
async function createEquipment(req, res) {
  try {
    const {
      name,
      category,
      serial_no,
      storage_locker = 'Locker A-01',
      battery_health = '100%',
      operational_state = 'Fully Operational',
      calibration_date,
      location = 'Central Armory - Alpha',
      assigned_to_id = null,
      value_usd = 5000
    } = req.body;

    if (!name || !category || !serial_no) {
      return res.status(400).json({
        success: false,
        message: 'Name, Category, and Serial Number are required.'
      });
    }

    const [dup] = await db.query('SELECT id FROM equipment WHERE serial_no = ?', [serial_no]);
    if (dup.length > 0) {
      return res.status(409).json({ success: false, message: 'Equipment serial number already exists.' });
    }

    // Create asset
    const assetCode = `AST-5${Math.floor(100 + Math.random() * 900)}`;
    const [assetResult] = await db.query(
      `INSERT INTO assets 
       (asset_code, name, type, serial_number, quantity, status, location, assigned_to_id, purchase_date, condition_state, value_usd)
       VALUES (?, ?, 'Optics', ?, 1, 'Available', ?, ?, ?, 'Good', ?)`,
      [
        assetCode,
        name,
        serial_no,
        location,
        assigned_to_id ? parseInt(assigned_to_id, 10) : null,
        new Date().toISOString().split('T')[0],
        parseFloat(value_usd) || 0
      ]
    );

    const assetId = assetResult.insertId;

    const [equipResult] = await db.query(
      `INSERT INTO equipment 
       (asset_id, category, calibration_date, battery_health, serial_no, storage_locker, operational_state)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        assetId,
        category,
        calibration_date || null,
        battery_health,
        serial_no,
        storage_locker,
        operational_state
      ]
    );

    await logActivity(
      req.user.id,
      req.user.username,
      'CREATE_EQUIPMENT',
      'Equipment',
      `Cataloged equipment [${serial_no}] ${category} (${name})`,
      req.ip
    );

    res.status(201).json({
      success: true,
      message: 'Equipment cataloged successfully.',
      data: { id: equipResult.insertId, asset_id: assetId }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create equipment: ' + err.message });
  }
}

/**
 * Update equipment
 * PUT /api/equipment/:id
 */
async function updateEquipment(req, res) {
  try {
    const { id } = req.params;
    const {
      category,
      serial_no,
      calibration_date,
      battery_health,
      storage_locker,
      operational_state
    } = req.body;

    const [existing] = await db.query('SELECT * FROM equipment WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Equipment not found.' });

    await db.query(
      `UPDATE equipment SET
        category = COALESCE(?, category),
        serial_no = COALESCE(?, serial_no),
        calibration_date = ?,
        battery_health = COALESCE(?, battery_health),
        storage_locker = COALESCE(?, storage_locker),
        operational_state = COALESCE(?, operational_state)
       WHERE id = ?`,
      [
        category,
        serial_no,
        calibration_date !== undefined ? calibration_date : existing[0].calibration_date,
        battery_health,
        storage_locker,
        operational_state,
        id
      ]
    );

    await logActivity(
      req.user.id,
      req.user.username,
      'UPDATE_EQUIPMENT',
      'Equipment',
      `Updated equipment record #${id} [${existing[0].serial_no}]`,
      req.ip
    );

    res.json({ success: true, message: 'Equipment record updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Delete equipment
 * DELETE /api/equipment/:id
 */
async function deleteEquipment(req, res) {
  try {
    const { id } = req.params;
    const [existing] = await db.query('SELECT asset_id, serial_no FROM equipment WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Equipment not found.' });

    await db.query('DELETE FROM equipment WHERE id = ?', [id]);
    if (existing[0].asset_id) {
      await db.query('DELETE FROM assets WHERE id = ?', [existing[0].asset_id]);
    }

    await logActivity(
      req.user.id,
      req.user.username,
      'DELETE_EQUIPMENT',
      'Equipment',
      `Decommissioned equipment #${id} [${existing[0].serial_no}]`,
      req.ip
    );

    res.json({ success: true, message: 'Equipment removed from armory.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  getEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment
};
