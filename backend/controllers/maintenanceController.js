const db = require('../config/db');
const { logActivity } = require('../middleware/errorHandler');

/**
 * Get all maintenance work orders
 * GET /api/maintenance
 */
async function getMaintenance(req, res) {
  try {
    const { status = '', type = '', search = '' } = req.query;
    let whereClauses = [];
    const params = [];

    if (search) {
      whereClauses.push('(m.work_order_no LIKE ? OR a.name LIKE ? OR m.technician_name LIKE ? OR m.description LIKE ?)');
      const s = `%${search.trim()}%`;
      params.push(s, s, s, s);
    }

    if (status) {
      whereClauses.push('m.status = ?');
      params.push(status);
    }

    if (type) {
      whereClauses.push('m.maintenance_type = ?');
      params.push(type);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const sql = `
      SELECT 
        m.*,
        a.name AS asset_name,
        a.asset_code,
        a.type AS asset_type,
        a.location AS asset_location,
        a.status AS current_asset_status
      FROM maintenance m
      JOIN assets a ON m.asset_id = a.id
      ${whereSql}
      ORDER BY m.id DESC
    `;

    const [rows] = await db.query(sql, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve maintenance records: ' + err.message });
  }
}

/**
 * Get single maintenance work order
 * GET /api/maintenance/:id
 */
async function getMaintenanceById(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      `SELECT m.*, a.name AS asset_name, a.asset_code, a.type AS asset_type, a.serial_number
       FROM maintenance m
       JOIN assets a ON m.asset_id = a.id
       WHERE m.id = ?`,
      [id]
    );

    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Work order not found.' });

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Create new maintenance work order
 * POST /api/maintenance
 */
async function createMaintenance(req, res) {
  try {
    const {
      asset_id,
      maintenance_type,
      description,
      technician_name,
      parts_replaced = '',
      cost = 0,
      start_date,
      completion_date = null,
      status = 'In Progress',
      notes = ''
    } = req.body;

    if (!asset_id || !maintenance_type || !description || !technician_name || !start_date) {
      return res.status(400).json({
        success: false,
        message: 'Asset ID, Maintenance Type, Description, Technician Name, and Start Date are required.'
      });
    }

    // Auto-generate Work Order #
    const work_order_no = req.body.work_order_no || `WO-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    const [result] = await db.query(
      `INSERT INTO maintenance 
       (work_order_no, asset_id, maintenance_type, description, technician_name, parts_replaced, cost, start_date, completion_date, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        work_order_no,
        parseInt(asset_id, 10),
        maintenance_type,
        description,
        technician_name,
        parts_replaced,
        parseFloat(cost) || 0,
        start_date,
        completion_date || null,
        status,
        notes
      ]
    );

    // Update asset status to 'Under Maintenance' if in progress
    if (status === 'In Progress') {
      await db.query("UPDATE assets SET status = 'Under Maintenance' WHERE id = ?", [asset_id]);
    }

    await logActivity(
      req.user.id,
      req.user.username,
      'CREATE_MAINTENANCE',
      'Maintenance',
      `Issued work order [${work_order_no}] for asset #${asset_id}`,
      req.ip
    );

    res.status(201).json({
      success: true,
      message: 'Maintenance work order opened.',
      data: { id: result.insertId, work_order_no }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create work order: ' + err.message });
  }
}

/**
 * Update maintenance work order
 * PUT /api/maintenance/:id
 */
async function updateMaintenance(req, res) {
  try {
    const { id } = req.params;
    const {
      maintenance_type,
      description,
      technician_name,
      parts_replaced,
      cost,
      start_date,
      completion_date,
      status,
      notes
    } = req.body;

    const [existing] = await db.query('SELECT * FROM maintenance WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Work order not found.' });

    const current = existing[0];
    const newStatus = status || current.status;
    const newCompDate = completion_date !== undefined ? completion_date : current.completion_date;

    await db.query(
      `UPDATE maintenance SET
        maintenance_type = COALESCE(?, maintenance_type),
        description = COALESCE(?, description),
        technician_name = COALESCE(?, technician_name),
        parts_replaced = COALESCE(?, parts_replaced),
        cost = COALESCE(?, cost),
        start_date = COALESCE(?, start_date),
        completion_date = ?,
        status = COALESCE(?, status),
        notes = COALESCE(?, notes)
       WHERE id = ?`,
      [
        maintenance_type,
        description,
        technician_name,
        parts_replaced,
        cost !== undefined ? parseFloat(cost) : current.cost,
        start_date,
        newCompDate,
        newStatus,
        notes,
        id
      ]
    );

    // If marked Completed, return asset to Available & update last_maintenance_date
    if (newStatus === 'Completed' && current.status !== 'Completed') {
      const today = newCompDate || new Date().toISOString().split('T')[0];
      // Next maintenance 6 months out
      const nextDate = new Date();
      nextDate.setMonth(nextDate.getMonth() + 6);
      const nextMaintStr = nextDate.toISOString().split('T')[0];

      await db.query(
        `UPDATE assets SET 
          status = 'Available', 
          last_maintenance_date = ?, 
          next_maintenance_date = ? 
         WHERE id = ?`,
        [today, nextMaintStr, current.asset_id]
      );
    }

    await logActivity(
      req.user.id,
      req.user.username,
      'UPDATE_MAINTENANCE',
      'Maintenance',
      `Updated work order #${id} [${current.work_order_no}] status -> ${newStatus}`,
      req.ip
    );

    res.json({ success: true, message: 'Maintenance record updated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Delete maintenance record
 * DELETE /api/maintenance/:id
 */
async function deleteMaintenance(req, res) {
  try {
    const { id } = req.params;
    const [existing] = await db.query('SELECT work_order_no FROM maintenance WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Work order not found.' });

    await db.query('DELETE FROM maintenance WHERE id = ?', [id]);

    await logActivity(
      req.user.id,
      req.user.username,
      'DELETE_MAINTENANCE',
      'Maintenance',
      `Deleted work order #${id} [${existing[0].work_order_no}]`,
      req.ip
    );

    res.json({ success: true, message: 'Work order removed.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  getMaintenance,
  getMaintenanceById,
  createMaintenance,
  updateMaintenance,
  deleteMaintenance
};
