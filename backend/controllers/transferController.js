const db = require('../config/db');
const { logActivity } = require('../middleware/errorHandler');

/**
 * Get all asset transfers
 * GET /api/transfers
 */
async function getTransfers(req, res) {
  try {
    const { status = '', search = '' } = req.query;
    let whereClauses = [];
    const params = [];

    if (search) {
      whereClauses.push('(t.transfer_code LIKE ? OR a.name LIKE ? OR t.source_location LIKE ? OR t.destination_location LIKE ?)');
      const s = `%${search.trim()}%`;
      params.push(s, s, s, s);
    }

    if (status) {
      whereClauses.push('t.status = ?');
      params.push(status);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const sql = `
      SELECT 
        t.*,
        a.name AS asset_name,
        a.asset_code,
        a.type AS asset_type,
        a.serial_number,
        u_req.username AS requester_name,
        u_req.rank_title AS requester_rank,
        u_app.username AS approver_name,
        p_rec.full_name AS recipient_name,
        p_rec.rank_title AS recipient_rank,
        p_rec.service_number AS recipient_service_no
      FROM transfers t
      JOIN assets a ON t.asset_id = a.id
      LEFT JOIN users u_req ON t.requested_by_id = u_req.id
      LEFT JOIN users u_app ON t.approved_by_id = u_app.id
      LEFT JOIN personnel p_rec ON t.recipient_personnel_id = p_rec.id
      ${whereSql}
      ORDER BY t.id DESC
    `;

    const [rows] = await db.query(sql, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve transfers: ' + err.message });
  }
}

/**
 * Create asset transfer request
 * POST /api/transfers
 */
async function createTransfer(req, res) {
  try {
    const {
      asset_id,
      source_location,
      destination_location,
      transfer_date,
      recipient_personnel_id = null,
      reason
    } = req.body;

    if (!asset_id || !source_location || !destination_location || !transfer_date || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Asset ID, Source, Destination, Date, and Reason are required.'
      });
    }

    const transfer_code = `TRF-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    const [result] = await db.query(
      `INSERT INTO transfers 
       (transfer_code, asset_id, source_location, destination_location, transfer_date, requested_by_id, recipient_personnel_id, reason, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending')`,
      [
        transfer_code,
        parseInt(asset_id, 10),
        source_location,
        destination_location,
        transfer_date,
        req.user.id,
        recipient_personnel_id ? parseInt(recipient_personnel_id, 10) : null,
        reason
      ]
    );

    // Notify admins of new pending transfer
    await db.query(
      `INSERT INTO notifications (title, message, type, link)
       VALUES (?, ?, 'warning', '/transfers')`,
      [
        'New Transfer Request Initiated',
        `Requisition ${transfer_code} awaiting Command sign-off to relocate asset #${asset_id}.`
      ]
    );

    await logActivity(
      req.user.id,
      req.user.username,
      'CREATE_TRANSFER',
      'Transfers',
      `Requested transfer [${transfer_code}] from ${source_location} to ${destination_location}`,
      req.ip
    );

    res.status(201).json({
      success: true,
      message: 'Transfer request submitted for command review.',
      data: { id: result.insertId, transfer_code }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Update transfer status (Approve, Reject, Transit, Complete)
 * PUT /api/transfers/:id/status
 */
async function updateTransferStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ['Pending', 'Approved', 'In Transit', 'Completed', 'Rejected'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status code.' });
    }

    const [existing] = await db.query('SELECT * FROM transfers WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Transfer record not found.' });

    const transfer = existing[0];

    // If approving, record approver user id
    let approverId = transfer.approved_by_id;
    if (status === 'Approved' || (status === 'Completed' && !approverId)) {
      approverId = req.user.id;
    }

    await db.query(
      'UPDATE transfers SET status = ?, approved_by_id = ? WHERE id = ?',
      [status, approverId, id]
    );

    // If Completed, relocate asset and reassign personnel
    if (status === 'Completed') {
      await db.query(
        `UPDATE assets SET 
          location = ?, 
          assigned_to_id = COALESCE(?, assigned_to_id),
          status = 'Assigned'
         WHERE id = ?`,
        [transfer.destination_location, transfer.recipient_personnel_id, transfer.asset_id]
      );
    }

    await logActivity(
      req.user.id,
      req.user.username,
      'TRANSFER_STATUS_CHANGE',
      'Transfers',
      `Updated transfer #${id} [${transfer.transfer_code}] to [${status}]`,
      req.ip
    );

    res.json({
      success: true,
      message: `Transfer status updated to ${status}.`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  getTransfers,
  createTransfer,
  updateTransferStatus
};
