const db = require('../config/db');
const { logActivity } = require('../middleware/errorHandler');

/**
 * Get all assets with filtering, searching, and pagination
 * GET /api/assets
 */
async function getAssets(req, res) {
  try {
    const {
      search = '',
      type = '',
      status = '',
      location = '',
      sortBy = 'id',
      sortOrder = 'DESC',
      page = 1,
      limit = 100
    } = req.query;

    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const params = [];
    let whereClauses = [];

    if (search) {
      whereClauses.push('(a.asset_code LIKE ? OR a.name LIKE ? OR a.serial_number LIKE ? OR a.location LIKE ?)');
      const s = `%${search.trim()}%`;
      params.push(s, s, s, s);
    }

    if (type) {
      whereClauses.push('a.type = ?');
      params.push(type);
    }

    if (status) {
      whereClauses.push('a.status = ?');
      params.push(status);
    }

    if (location) {
      whereClauses.push('a.location LIKE ?');
      params.push(`%${location.trim()}%`);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Allowed sort columns
    const allowedSort = ['id', 'asset_code', 'name', 'type', 'quantity', 'status', 'location', 'purchase_date', 'condition_state', 'value_usd'];
    const safeSortBy = allowedSort.includes(sortBy) ? `a.${sortBy}` : 'a.id';
    const safeOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Count query
    const countSql = `SELECT COUNT(*) as total FROM assets a ${whereSql}`;
    const [countRows] = await db.query(countSql, params);
    const total = countRows[0] ? countRows[0].total : 0;

    // Data query
    const dataSql = `
      SELECT 
        a.id,
        a.asset_code,
        a.name,
        a.type,
        a.serial_number,
        a.quantity,
        a.status,
        a.location,
        a.assigned_to_id,
        a.purchase_date,
        a.last_maintenance_date,
        a.next_maintenance_date,
        a.description,
        a.condition_state,
        a.value_usd,
        a.created_at,
        p.full_name AS assigned_to_name,
        p.rank_title AS assigned_to_rank,
        p.service_number AS assigned_to_service_no,
        p.unit AS assigned_to_unit
      FROM assets a
      LEFT JOIN personnel p ON a.assigned_to_id = p.id
      ${whereSql}
      ORDER BY ${safeSortBy} ${safeOrder}
      LIMIT ? OFFSET ?
    `;

    const queryParams = [...params, parseInt(limit, 10), parseInt(offset, 10)];
    const [rows] = await db.query(dataSql, queryParams);

    res.json({
      success: true,
      data: rows,
      meta: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil(total / parseInt(limit, 10))
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve assets: ' + err.message });
  }
}

/**
 * Get single asset details
 * GET /api/assets/:id
 */
async function getAssetById(req, res) {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `SELECT 
        a.*,
        p.full_name AS assigned_to_name,
        p.rank_title AS assigned_to_rank,
        p.service_number AS assigned_to_service_no,
        p.unit AS assigned_to_unit,
        p.assigned_base AS assigned_to_base
      FROM assets a
      LEFT JOIN personnel p ON a.assigned_to_id = p.id
      WHERE a.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Asset record not found.' });
    }

    const asset = rows[0];

    // Fetch related vehicle details if any
    const [vehicles] = await db.query('SELECT * FROM vehicles WHERE asset_id = ?', [id]);
    asset.vehicleDetails = vehicles[0] || null;

    // Fetch related equipment details if any
    const [equipment] = await db.query('SELECT * FROM equipment WHERE asset_id = ?', [id]);
    asset.equipmentDetails = equipment[0] || null;

    // Fetch maintenance records
    const [maintenance] = await db.query(
      'SELECT * FROM maintenance WHERE asset_id = ? ORDER BY start_date DESC',
      [id]
    );
    asset.maintenanceHistory = maintenance;

    // Fetch transfer logs
    const [transfers] = await db.query(
      `SELECT t.*, u1.username as requester_name, u2.username as approver_name
       FROM transfers t
       LEFT JOIN users u1 ON t.requested_by_id = u1.id
       LEFT JOIN users u2 ON t.approved_by_id = u2.id
       WHERE t.asset_id = ? ORDER BY t.transfer_date DESC`,
      [id]
    );
    asset.transferHistory = transfers;

    res.json({ success: true, data: asset });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Create new asset
 * POST /api/assets
 */
async function createAsset(req, res) {
  try {
    const {
      name,
      type,
      serial_number,
      quantity = 1,
      status = 'Available',
      location = 'Central Armory - Alpha',
      assigned_to_id = null,
      purchase_date,
      last_maintenance_date = null,
      next_maintenance_date = null,
      description = '',
      condition_state = 'Good',
      value_usd = 0
    } = req.body;

    if (!name || !type || !serial_number || !purchase_date) {
      return res.status(400).json({
        success: false,
        message: 'Name, Type, Serial Number, and Purchase Date are required fields.'
      });
    }

    // Auto-generate asset code if not supplied
    let asset_code = req.body.asset_code;
    if (!asset_code) {
      const codePrefix = {
        'Vehicle': 'AST-1',
        'Communication': 'AST-2',
        'Weapon': 'AST-3',
        'Heavy Equipment': 'AST-4',
        'Optics': 'AST-5',
        'Surveillance': 'AST-6',
        'Medical Gear': 'AST-7'
      }[type] || 'AST-9';
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      asset_code = `${codePrefix}${randomSuffix}`;
    }

    // Check duplicate serial or code
    const [dup] = await db.query(
      'SELECT id FROM assets WHERE asset_code = ? OR serial_number = ?',
      [asset_code, serial_number]
    );
    if (dup.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An asset with this Asset Code or Serial Number already exists in the armory manifest.'
      });
    }

    const [result] = await db.query(
      `INSERT INTO assets 
       (asset_code, name, type, serial_number, quantity, status, location, assigned_to_id, purchase_date, last_maintenance_date, next_maintenance_date, description, condition_state, value_usd)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        asset_code,
        name,
        type,
        serial_number,
        parseInt(quantity, 10) || 1,
        status,
        location,
        assigned_to_id ? parseInt(assigned_to_id, 10) : null,
        purchase_date,
        last_maintenance_date || null,
        next_maintenance_date || null,
        description,
        condition_state,
        parseFloat(value_usd) || 0
      ]
    );

    const newId = result.insertId;

    await logActivity(
      req.user.id,
      req.user.username,
      'CREATE_ASSET',
      'Assets',
      `Registered asset [${asset_code}]: ${name} (${type}) into ${location}`,
      req.ip
    );

    res.status(201).json({
      success: true,
      message: 'Asset successfully cataloged in the military registry.',
      data: { id: newId, asset_code }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create asset: ' + err.message });
  }
}

/**
 * Update existing asset
 * PUT /api/assets/:id
 */
async function updateAsset(req, res) {
  try {
    const { id } = req.params;
    const {
      asset_code,
      name,
      type,
      serial_number,
      quantity,
      status,
      location,
      assigned_to_id,
      purchase_date,
      last_maintenance_date,
      next_maintenance_date,
      description,
      condition_state,
      value_usd
    } = req.body;

    const [existing] = await db.query('SELECT * FROM assets WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Asset not found.' });
    }

    await db.query(
      `UPDATE assets SET
        asset_code = COALESCE(?, asset_code),
        name = COALESCE(?, name),
        type = COALESCE(?, type),
        serial_number = COALESCE(?, serial_number),
        quantity = COALESCE(?, quantity),
        status = COALESCE(?, status),
        location = COALESCE(?, location),
        assigned_to_id = ?,
        purchase_date = COALESCE(?, purchase_date),
        last_maintenance_date = ?,
        next_maintenance_date = ?,
        description = COALESCE(?, description),
        condition_state = COALESCE(?, condition_state),
        value_usd = COALESCE(?, value_usd)
      WHERE id = ?`,
      [
        asset_code || existing[0].asset_code,
        name || existing[0].name,
        type || existing[0].type,
        serial_number || existing[0].serial_number,
        quantity !== undefined ? parseInt(quantity, 10) : existing[0].quantity,
        status || existing[0].status,
        location || existing[0].location,
        assigned_to_id !== undefined ? (assigned_to_id ? parseInt(assigned_to_id, 10) : null) : existing[0].assigned_to_id,
        purchase_date || existing[0].purchase_date,
        last_maintenance_date !== undefined ? last_maintenance_date : existing[0].last_maintenance_date,
        next_maintenance_date !== undefined ? next_maintenance_date : existing[0].next_maintenance_date,
        description !== undefined ? description : existing[0].description,
        condition_state || existing[0].condition_state,
        value_usd !== undefined ? parseFloat(value_usd) : existing[0].value_usd,
        id
      ]
    );

    await logActivity(
      req.user.id,
      req.user.username,
      'UPDATE_ASSET',
      'Assets',
      `Updated asset record #${id} [${existing[0].asset_code}]`,
      req.ip
    );

    res.json({
      success: true,
      message: 'Asset record updated successfully.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update asset: ' + err.message });
  }
}

/**
 * Delete asset
 * DELETE /api/assets/:id
 */
async function deleteAsset(req, res) {
  try {
    const { id } = req.params;
    const [existing] = await db.query('SELECT asset_code, name FROM assets WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Asset not found.' });
    }

    await db.query('DELETE FROM assets WHERE id = ?', [id]);

    await logActivity(
      req.user.id,
      req.user.username,
      'DELETE_ASSET',
      'Assets',
      `Decommissioned/deleted asset #${id} [${existing[0].asset_code}] ${existing[0].name}`,
      req.ip
    );

    res.json({
      success: true,
      message: `Asset [${existing[0].asset_code}] decommissioned and removed from registry.`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete asset: ' + err.message });
  }
}

module.exports = {
  getAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset
};
