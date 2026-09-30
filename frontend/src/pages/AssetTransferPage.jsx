import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ArrowLeftRight,
  PlusCircle,
  Search,
  CheckCircle,
  Truck,
  XCircle,
  Clock,
  RefreshCw,
  MapPin
} from 'lucide-react';
import { transferService } from '../services/transferService';
import { assetService } from '../services/assetService';
import { personnelService } from '../services/personnelService';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { useToast } from '../components/Toast';

export default function AssetTransferPage() {
  const [searchParams] = useSearchParams();
  const prefillAssetId = searchParams.get('asset_id');

  const [transfers, setTransfers] = useState([]);
  const [assetsList, setAssetsList] = useState([]);
  const [personnelList, setPersonnelList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    asset_id: prefillAssetId || '',
    source_location: 'Central Armory - Alpha',
    destination_location: 'FOB Echo Outpost',
    transfer_date: new Date().toISOString().slice(0, 10),
    recipient_personnel_id: '',
    reason: ''
  });

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  async function loadData() {
    setLoading(true);
    try {
      const [transData, assetsData, persData] = await Promise.all([
        transferService.getTransfers({ search, status: statusFilter }),
        assetService.getAssets({ limit: 300 }),
        personnelService.getPersonnel({ status: 'Active' })
      ]);
      setTransfers(transData);
      setAssetsList(assetsData.data || []);
      setPersonnelList(persData);

      if (prefillAssetId) {
        const found = (assetsData.data || []).find((a) => String(a.id) === String(prefillAssetId));
        if (found) {
          setFormData((prev) => ({
            ...prev,
            asset_id: found.id,
            source_location: found.location
          }));
        }
        setIsModalOpen(true);
      }
    } catch (err) {
      addToast('Failed to load transfers: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  const handleAssetSelect = (e) => {
    const selectedId = e.target.value;
    const found = assetsList.find((a) => String(a.id) === String(selectedId));
    setFormData((prev) => ({
      ...prev,
      asset_id: selectedId,
      source_location: found ? found.location : prev.source_location
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await transferService.createTransfer({
        ...formData,
        recipient_personnel_id: formData.recipient_personnel_id ? parseInt(formData.recipient_personnel_id, 10) : null
      });
      addToast('Transfer requisition submitted for command clearance.', 'success');
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to submit transfer: ' + err.message, 'error');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await transferService.updateTransferStatus(id, status);
      addToast(`Transfer order updated to [${status}].`, 'success');
      loadData();
    } catch (err) {
      addToast('Status update failed: ' + err.message, 'error');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="tactical-title" style={{ fontSize: '1.75rem', color: '#f8fafc', marginBottom: 4 }}>
            ASSET LOGISTICS & TRANSFER ORDERS
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Base-to-Base Relocation, Custody Reassignment & Transit Tracking
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={loadData} className="btn btn-secondary btn-sm">
            <RefreshCw size={15} /> Refresh Orders
          </button>
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary btn-sm">
            <PlusCircle size={15} /> New Transfer Request
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
              placeholder="Search transfer code, origin, destination, asset..."
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
              <option value="">All Transfer Statuses</option>
              <option value="Pending">Pending Approval</option>
              <option value="Approved">Approved</option>
              <option value="In Transit">In Transit</option>
              <option value="Completed">Completed / Delivered</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transfers Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="tactical-table">
            <thead>
              <tr>
                <th>TRANSFER CODE</th>
                <th>ASSET</th>
                <th>ORIGIN STATION</th>
                <th>DESTINATION STATION</th>
                <th>DATE</th>
                <th>REQUESTED BY</th>
                <th>RECIPIENT</th>
                <th>STATUS</th>
                <th style={{ textAlign: 'right' }}>COMMAND ACTION</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: 40, color: '#38bdf8' }}>
                    Accessing Relocation Orders...
                  </td>
                </tr>
              ) : transfers.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
                    No transfer orders on record.
                  </td>
                </tr>
              ) : (
                transfers.map((t) => (
                  <tr key={t.id}>
                    <td className="mono" style={{ color: '#38bdf8', fontWeight: 600 }}>
                      {t.transfer_code}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#f8fafc' }}>{t.asset_name}</div>
                      <div className="mono" style={{ fontSize: '0.75rem', color: '#64748b' }}>{t.asset_code}</div>
                    </td>
                    <td style={{ color: '#cbd5e1' }}>{t.source_location}</td>
                    <td style={{ color: '#34d399', fontWeight: 600 }}>{t.destination_location}</td>
                    <td className="mono" style={{ fontSize: '0.8rem' }}>{t.transfer_date}</td>
                    <td style={{ color: '#94a3b8' }}>
                      {t.requester_rank ? `${t.requester_rank} ` : ''}{t.requester_name || 'Staff'}
                    </td>
                    <td>
                      {t.recipient_name ? (
                        <span style={{ color: '#f8fafc', fontWeight: 500 }}>
                          {t.recipient_rank} {t.recipient_name}
                        </span>
                      ) : (
                        <span style={{ color: '#64748b', fontStyle: 'italic' }}>Base Reserve</span>
                      )}
                    </td>
                    <td>
                      <StatusBadge status={t.status} />
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        {t.status === 'Pending' && (
                          <>
                            <button
                              type="button"
                              className="btn btn-tactical btn-sm"
                              onClick={() => handleUpdateStatus(t.id, 'Approved')}
                              style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              onClick={() => handleUpdateStatus(t.id, 'Rejected')}
                              style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {t.status === 'Approved' && (
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => handleUpdateStatus(t.id, 'In Transit')}
                            style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                          >
                            <Truck size={12} /> Dispatch
                          </button>
                        )}
                        {t.status === 'In Transit' && (
                          <button
                            type="button"
                            className="btn btn-tactical btn-sm"
                            onClick={() => handleUpdateStatus(t.id, 'Completed')}
                            style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                          >
                            <CheckCircle size={12} /> Confirm Delivery
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transfer Request Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="INITIATE LOGISTICS TRANSFER REQUEST"
      >
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Asset to Relocate</label>
              <select
                className="form-select"
                value={formData.asset_id}
                onChange={handleAssetSelect}
                required
              >
                <option value="">-- Select Asset --</option>
                {assetsList.map((a) => (
                  <option key={a.id} value={a.id}>
                    [{a.asset_code}] {a.name} (At: {a.location})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Transfer Effective Date</label>
              <input
                type="date"
                className="form-input mono"
                value={formData.transfer_date}
                onChange={(e) => setFormData({ ...formData, transfer_date: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Source Origin Location</label>
              <input
                type="text"
                className="form-input"
                value={formData.source_location}
                onChange={(e) => setFormData({ ...formData, source_location: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Destination Station / FOB</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. FOB Echo Outpost, Sector 7"
                value={formData.destination_location}
                onChange={(e) => setFormData({ ...formData, destination_location: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Receiving Custodian (Officer)</label>
              <select
                className="form-select"
                value={formData.recipient_personnel_id}
                onChange={(e) => setFormData({ ...formData, recipient_personnel_id: e.target.value })}
              >
                <option value="">-- No Direct Personnel Custodian --</option>
                {personnelList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.rank_title} {p.full_name} ({p.unit})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: 10 }}>
            <label className="form-label">Tactical Justification / Mission Reason</label>
            <textarea
              className="form-textarea"
              rows="3"
              placeholder="State tactical requisition justification, deployment exercise code, or replenishment order..."
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Submit Requisition
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
