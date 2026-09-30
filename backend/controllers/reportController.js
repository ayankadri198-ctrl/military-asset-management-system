const db = require('../config/db');

/**
 * Get comprehensive analytics summary
 * GET /api/reports/summary
 */
async function getSummaryReport(req, res) {
  try {
    // Total assets & total value
    const [assetStats] = await db.query(`
      SELECT 
        COUNT(*) as total_assets,
        SUM(quantity) as total_units,
        SUM(value_usd) as total_inventory_value,
        SUM(CASE WHEN status = 'Available' THEN 1 ELSE 0 END) as available_count,
        SUM(CASE WHEN status = 'Assigned' THEN 1 ELSE 0 END) as assigned_count,
        SUM(CASE WHEN status = 'Under Maintenance' THEN 1 ELSE 0 END) as maintenance_count,
        SUM(CASE WHEN status = 'Retired' THEN 1 ELSE 0 END) as retired_count
      FROM assets
    `);

    // Type distribution
    const [byType] = await db.query(`
      SELECT type, COUNT(*) as count, SUM(value_usd) as total_value
      FROM assets
      GROUP BY type
      ORDER BY count DESC
    `);

    // Condition distribution
    const [byCondition] = await db.query(`
      SELECT condition_state, COUNT(*) as count
      FROM assets
      GROUP BY condition_state
    `);

    // Maintenance cost summary
    const [maintenanceStats] = await db.query(`
      SELECT 
        COUNT(*) as total_orders,
        SUM(cost) as total_maintenance_spent,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed_orders,
        SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as open_orders
      FROM maintenance
    `);

    // Personnel breakdown
    const [personnelStats] = await db.query(`
      SELECT 
        COUNT(*) as total_personnel,
        SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) as active_count,
        SUM(CASE WHEN status = 'Deployed' THEN 1 ELSE 0 END) as deployed_count
      FROM personnel
    `);

    // Location distribution
    const [byLocation] = await db.query(`
      SELECT location, COUNT(*) as count
      FROM assets
      GROUP BY location
      ORDER BY count DESC
    `);

    res.json({
      success: true,
      data: {
        assets: assetStats[0] || {},
        byType,
        byCondition,
        maintenance: maintenanceStats[0] || {},
        personnel: personnelStats[0] || {},
        byLocation
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to generate report: ' + err.message });
  }
}

/**
 * Export data records (Assets, Maintenance, Transfers)
 * GET /api/reports/export?module=assets
 */
async function exportData(req, res) {
  try {
    const { module = 'assets' } = req.query;

    let rows = [];
    if (module === 'assets') {
      [rows] = await db.query(`
        SELECT a.asset_code, a.name, a.type, a.serial_number, a.quantity, a.status, a.location,
               p.full_name as assigned_to, a.condition_state, a.value_usd, a.purchase_date
        FROM assets a
        LEFT JOIN personnel p ON a.assigned_to_id = p.id
        ORDER BY a.id ASC
      `);
    } else if (module === 'maintenance') {
      [rows] = await db.query(`
        SELECT m.work_order_no, a.name as asset_name, m.maintenance_type, m.technician_name,
               m.cost, m.status, m.start_date, m.completion_date, m.parts_replaced
        FROM maintenance m
        JOIN assets a ON m.asset_id = a.id
        ORDER BY m.id DESC
      `);
    } else if (module === 'transfers') {
      [rows] = await db.query(`
        SELECT t.transfer_code, a.name as asset_name, t.source_location, t.destination_location,
               t.transfer_date, t.status, t.reason
        FROM transfers t
        JOIN assets a ON t.asset_id = a.id
        ORDER BY t.id DESC
      `);
    }

    res.json({
      success: true,
      module,
      count: rows.length,
      data: rows
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  getSummaryReport,
  exportData
};
