const db = require('../config/db');
const { logActivity } = require('../middleware/errorHandler');

/**
 * Get all military vehicles
 * GET /api/vehicles
 */
async function getVehicles(req, res) {
  try {
    const { search = '', readiness = '', vehicle_type = '' } = req.query;
    let whereClauses = [];
    const params = [];

    if (search) {
      whereClauses.push('(v.registration_no LIKE ? OR a.name LIKE ? OR a.asset_code LIKE ?)');
      const s = `%${search.trim()}%`;
      params.push(s, s, s);
    }

    if (readiness) {
      whereClauses.push('v.operational_readiness = ?');
      params.push(readiness);
    }

    if (vehicle_type) {
      whereClauses.push('v.vehicle_type = ?');
      params.push(vehicle_type);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const sql = `
      SELECT 
        v.*,
        a.name AS asset_name,
        a.asset_code,
        a.status AS asset_status,
        a.location,
        a.condition_state,
        a.purchase_date,
        a.last_maintenance_date,
        a.next_maintenance_date,
        p.full_name AS driver_name,
        p.rank_title AS driver_rank,
        p.service_number AS driver_service_no
      FROM vehicles v
      JOIN assets a ON v.asset_id = a.id
      LEFT JOIN personnel p ON v.assigned_driver_id = p.id
      ${whereSql}
      ORDER BY v.id ASC
    `;

    const [rows] = await db.query(sql, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve vehicles: ' + err.message });
  }
}

/**
 * Get single vehicle by ID
 * GET /api/vehicles/:id
 */
async function getVehicleById(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      `SELECT 
        v.*,
        a.name AS asset_name,
        a.asset_code,
        a.status AS asset_status,
        a.location,
        a.condition_state,
        a.value_usd,
        p.full_name AS driver_name,
        p.rank_title AS driver_rank
      FROM vehicles v
      JOIN assets a ON v.asset_id = a.id
      LEFT JOIN personnel p ON v.assigned_driver_id = p.id
      WHERE v.id = ?`,
      [id]
    );

    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Vehicle not found.' });

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Create vehicle & its asset entry if not existing
 * POST /api/vehicles
 */
async function createVehicle(req, res) {
  try {
    const {
      name,
      vehicle_type,
      registration_no,
      engine_no,
      mileage_km = 0,
      fuel_type = 'Diesel',
      operational_readiness = 'Mission Ready',
      assigned_driver_id = null,
      armor_level = 'STANAG Level 2',
      location = 'Motor Pool Alpha',
      purchase_date,
      value_usd = 150000
    } = req.body;

    if (!name || !vehicle_type || !registration_no || !engine_no) {
      return res.status(400).json({
        success: false,
        message: 'Name, Vehicle type, Registration No, and Engine No are required.'
      });
    }

    // Check duplicate registration
    const [dup] = await db.query('SELECT id FROM vehicles WHERE registration_no = ?', [registration_no]);
    if (dup.length > 0) {
      return res.status(409).json({ success: false, message: 'Registration number already registered.' });
    }

    // Create the master asset entry
    const assetCode = `AST-1${Math.floor(100 + Math.random() * 900)}`;
    const [assetResult] = await db.query(
      `INSERT INTO assets 
       (asset_code, name, type, serial_number, quantity, status, location, assigned_to_id, purchase_date, condition_state, value_usd)
       VALUES (?, ?, 'Vehicle', ?, 1, 'Available', ?, ?, ?, 'Good', ?)`,
      [
        assetCode,
        name,
        registration_no,
        location,
        assigned_driver_id ? parseInt(assigned_driver_id, 10) : null,
        purchase_date || new Date().toISOString().split('T')[0],
        parseFloat(value_usd) || 0
      ]
    );

    const assetId = assetResult.insertId;

    const [vehResult] = await db.query(
      `INSERT INTO vehicles 
       (asset_id, vehicle_type, registration_no, engine_no, mileage_km, fuel_type, operational_readiness, assigned_driver_id, armor_level)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        assetId,
        vehicle_type,
        registration_no,
        engine_no,
        parseInt(mileage_km, 10) || 0,
        fuel_type,
        operational_readiness,
        assigned_driver_id ? parseInt(assigned_driver_id, 10) : null,
        armor_level
      ]
    );

    await logActivity(
      req.user.id,
      req.user.username,
      'CREATE_VEHICLE',
      'Vehicles',
      `Registered vehicle [${registration_no}] ${vehicle_type} (${name})`,
      req.ip
    );

    res.status(201).json({
      success: true,
      message: 'Vehicle commissioned and registered in the motor fleet.',
      data: { id: vehResult.insertId, asset_id: assetId }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create vehicle: ' + err.message });
  }
}

/**
 * Update vehicle record
 * PUT /api/vehicles/:id
 */
async function updateVehicle(req, res) {
  try {
    const { id } = req.params;
    const {
      vehicle_type,
      registration_no,
      engine_no,
      mileage_km,
      fuel_type,
      operational_readiness,
      assigned_driver_id,
      armor_level
    } = req.body;

    const [existing] = await db.query('SELECT * FROM vehicles WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Vehicle not found.' });

    await db.query(
      `UPDATE vehicles SET
        vehicle_type = COALESCE(?, vehicle_type),
        registration_no = COALESCE(?, registration_no),
        engine_no = COALESCE(?, engine_no),
        mileage_km = COALESCE(?, mileage_km),
        fuel_type = COALESCE(?, fuel_type),
        operational_readiness = COALESCE(?, operational_readiness),
        assigned_driver_id = ?,
        armor_level = COALESCE(?, armor_level)
       WHERE id = ?`,
      [
        vehicle_type,
        registration_no,
        engine_no,
        mileage_km !== undefined ? parseInt(mileage_km, 10) : existing[0].mileage_km,
        fuel_type,
        operational_readiness,
        assigned_driver_id !== undefined ? (assigned_driver_id ? parseInt(assigned_driver_id, 10) : null) : existing[0].assigned_driver_id,
        armor_level,
        id
      ]
    );

    await logActivity(
      req.user.id,
      req.user.username,
      'UPDATE_VEHICLE',
      'Vehicles',
      `Updated vehicle record #${id} [${existing[0].registration_no}]`,
      req.ip
    );

    res.json({ success: true, message: 'Vehicle status updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Delete vehicle
 * DELETE /api/vehicles/:id
 */
async function deleteVehicle(req, res) {
  try {
    const { id } = req.params;
    const [existing] = await db.query('SELECT asset_id, registration_no FROM vehicles WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Vehicle not found.' });

    await db.query('DELETE FROM vehicles WHERE id = ?', [id]);
    // Also delete associated asset
    if (existing[0].asset_id) {
      await db.query('DELETE FROM assets WHERE id = ?', [existing[0].asset_id]);
    }

    await logActivity(
      req.user.id,
      req.user.username,
      'DELETE_VEHICLE',
      'Vehicles',
      `Decommissioned vehicle #${id} [${existing[0].registration_no}]`,
      req.ip
    );

    res.json({ success: true, message: 'Vehicle removed from fleet registry.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle
};
