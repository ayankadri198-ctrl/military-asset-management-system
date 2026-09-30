import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Wrench,
  PlusCircle,
  Search,
  CheckCircle,
  Clock,
  DollarSign,
  User,
  Trash2,
  Edit,
  RefreshCw
} from 'lucide-react';
import { maintenanceService } from '../services/maintenanceService';
import { assetService } from '../services/assetService';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { useToast } from '../components/Toast';

export default function MaintenanceRecordsPage() {
  const [searchParams] = useSearchParams();
  const prefillAssetId = searchParams.get('asset_id');

  const [orders, setOrders] = useState([]);
  const [assetsList, setAssetsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    asset_id: prefillAssetId || '',
    maintenance_type: 'Routine Inspection',
    description: '',
    technician_name: 'CWO Tariq Al-Mansoor',
    parts_replaced: '',
    cost: 450,
    start_date: new Date().toISOString().slice(0, 10),
    status: 'In Progress',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  async function loadData() {
    setLoading(true);
    try {
      const [maintData, assetsData] = await Promise.all([
        maintenanceService.getMaintenance({ search, status: statusFilter }),
        assetService.getAssets({ limit: 300 })
      ]);
      setOrders(maintData);
      setAssetsList(assetsData.data || []);
      if (prefillAssetId) {
        setIsModalOpen(true);
      }
    } catch (err) {
      addToast('Failed to load maintenance records: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  const handleOpenAdd = () => {
    setFormData({
      asset_id: assetsList[0]?.id || '',
      maintenance_type: 'Routine Inspection',
      description: '',
      technician_name: 'Sgt. David Miller',
      parts_replaced: '',
      cost: 350,
      start_date: new Date().toISOString().slice(0, 10),
      status: 'In Progress',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await maintenanceService.createMaintenance(formData);
      addToast('Maintenance work order issued.', 'success');
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to issue work order: ' + err.message, 'error');
    }
  };

  const handleMarkCompleted = async (order) => {
    try {
      await maintenanceService.updateMaintenance(order.id, {
        status: 'Completed',
        completion_date: new Date().toISOString().slice(0, 10)
      });
      addToast(`Work Order #${order.work_order_no} marked as Completed. Asset restored to Available.`, 'success');
      loadData();
    } catch (err) {
      addToast('Failed to update work order: ' + err.message, 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await maintenanceService.deleteMaintenance(deleteId);
      addToast('Work order removed from records.', 'success');
      loadData();
    } catch (err) {
      addToast('Failed to delete record: ' + err.message, 'error');
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="tactical-title" style={{ fontSize: '1.75rem', color: '#f8fafc', marginBottom: 4 }}>
            DEPOT MAINTENANCE RECORDS
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Work Orders, Scheduled Overhauls, Component Replacement, and Service History
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={loadData} className="btn btn-secondary btn-sm">
            <RefreshCw size={15} /> Refresh
          </button>
          <button onClick={handleOpenAdd} className="btn btn-primary btn-sm">
            <PlusCircle size={15} /> Log Work Order
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: 20, padding: 16 }}>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 240px' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search work orders, technician, asset..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadData()}
              style={{ paddingLeft: 36, fontSize: '0.85rem' }}
            />
          </div>

          <div style={{ flex: '0 1 200px' }}>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ fontSize: '0.85rem' }}
            >
              <option value="">All Work Order Statuses</option>
              <option value="In Progress">In Progress</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Maintenance Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="tactical-table">
            <thead>
              <tr>
                <th>WORK ORDER #</th>
                <th>TARGET ASSET</th>
                <th>MAINTENANCE TYPE</th>
                <th>ISSUE / SCOPE</th>
                <th>TECHNICIAN</th>
                <th>COST (USD)</th>
                <th>START DATE</th>
                <th>STATUS</th>
                <th style={{ textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: 40, color: '#38bdf8' }}>
                    Accessing Maintenance Records...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
                    No maintenance records found.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id}>
                    <td className="mono" style={{ color: '#38bdf8', fontWeight: 600 }}>
                      {o.work_order_no}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#f8fafc' }}>{o.asset_name}</div>
                      <div className="mono" style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {o.asset_code}
                      </div>
                    </td>
                    <td>{o.maintenance_type}</td>
                    <td style={{ color: '#cbd5e1', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={o.description}>
                      {o.description}
                    </td>
                    <td style={{ color: '#94a3b8' }}>{o.technician_name}</td>
                    <td className="mono" style={{ color: '#34d399', fontWeight: 600 }}>
                      ${Number(o.cost || 0).toLocaleString()}
                    </td>
                    <td className="mono" style={{ fontSize: '0.8rem' }}>
                      {o.start_date}
                    </td>
                    <td>
                      <StatusBadge status={o.status} />
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        {o.status !== 'Completed' && (
                          <button
                            type="button"
                            className="btn btn-tactical btn-sm"
                            title="Mark as Completed"
                            onClick={() => handleMarkCompleted(o)}
                            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          >
                            <CheckCircle size={14} /> Done
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn btn-secondary btn-icon"
                          title="Delete Order"
                          onClick={() => setDeleteId(o.id)}
                        >
                          <Trash2 size={14} color="#f87171" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Maintenance Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="OPEN DEPOT MAINTENANCE WORK ORDER"
      >
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Asset to Service</label>
              <select
                className="form-select"
                value={formData.asset_id}
                onChange={(e) => setFormData({ ...formData, asset_id: e.target.value })}
                required
              >
                <option value="">-- Select Asset --</option>
                {assetsList.map((a) => (
                  <option key={a.id} value={a.id}>
                    [{a.asset_code}] {a.name} ({a.location})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Maintenance Classification</label>
              <select
                className="form-select"
                value={formData.maintenance_type}
                onChange={(e) => setFormData({ ...formData, maintenance_type: e.target.value })}
              >
                <option value="Routine Inspection">Routine Inspection</option>
                <option value="Corrective Repair">Corrective Repair</option>
                <option value="Overhaul">Overhaul</option>
                <option value="Emergency">Emergency</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Lead Technician / Armorer</label>
              <input
                type="text"
                className="form-input"
                value={formData.technician_name}
                onChange={(e) => setFormData({ ...formData, technician_name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Estimated Service Cost (USD)</label>
              <input
                type="number"
                className="form-input mono"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                className="form-input mono"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Replaced Parts / Components</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Filters, Seals, Buffer Assembly"
                value={formData.parts_replaced}
                onChange={(e) => setFormData({ ...formData, parts_replaced: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: 10 }}>
            <label className="form-label">Issue Description & Diagnostic Scope</label>
            <textarea
              className="form-textarea"
              rows="3"
              placeholder="Describe malfunction symptoms, diagnostics conducted, and repair parameters..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Issue Work Order
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Work Order"
        message="Are you sure you want to permanently delete this maintenance record?"
        confirmText="Confirm Delete"
        isDanger={true}
      />
    </div>
  );
}
