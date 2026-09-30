import React, { useState, useEffect } from 'react';
import {
  Crosshair,
  PlusCircle,
  Search,
  Battery,
  Sliders,
  Calendar,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { equipmentService } from '../services/equipmentService';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { useToast } from '../components/Toast';

export default function EquipmentManagementPage() {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    category: 'Tactical Optics',
    serial_no: '',
    storage_locker: 'Locker B-12',
    battery_health: '98%',
    operational_state: 'Fully Operational',
    calibration_date: new Date().toISOString().slice(0, 10),
    value_usd: 12000
  });

  useEffect(() => {
    loadEquipment();
  }, [categoryFilter]);

  async function loadEquipment() {
    setLoading(true);
    try {
      const data = await equipmentService.getEquipment({ search, category: categoryFilter });
      setEquipment(data);
    } catch (err) {
      addToast('Failed to load tactical equipment: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      category: 'Encrypted Radio',
      serial_no: `EQ-${Math.floor(10000 + Math.random() * 90000)}`,
      storage_locker: 'Rack Alpha-04',
      battery_health: '100%',
      operational_state: 'Fully Operational',
      calibration_date: new Date().toISOString().slice(0, 10),
      value_usd: 15000
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await equipmentService.createEquipment(formData);
      addToast('Tactical equipment cataloged in armory.', 'success');
      setIsModalOpen(false);
      loadEquipment();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to catalog equipment: ' + err.message, 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await equipmentService.deleteEquipment(deleteId);
      addToast('Equipment decommissioned from armory.', 'success');
      loadEquipment();
    } catch (err) {
      addToast('Failed to delete equipment: ' + err.message, 'error');
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="tactical-title" style={{ fontSize: '1.75rem', color: '#f8fafc', marginBottom: 4 }}>
            SPECIALIZED TACTICAL EQUIPMENT
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Encrypted Comms, Thermal Night Optics, UAV Drones, and Ballistic Assets
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={loadEquipment} className="btn btn-secondary btn-sm">
            <RefreshCw size={15} /> Refresh
          </button>
          <button onClick={handleOpenAdd} className="btn btn-primary btn-sm">
            <PlusCircle size={15} /> Catalog Gear
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
              placeholder="Search gear by name, serial no, locker..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadEquipment()}
              style={{ paddingLeft: 36, fontSize: '0.85rem' }}
            />
          </div>

          <div style={{ flex: '0 1 200px' }}>
            <select
              className="form-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ fontSize: '0.85rem' }}
            >
              <option value="">All Categories</option>
              <option value="Tactical Optics">Tactical Optics</option>
              <option value="Encrypted Radio">Encrypted Radio</option>
              <option value="Ballistic Gear">Ballistic Gear</option>
              <option value="Drone / UAV">Drone / UAV</option>
              <option value="Field Power">Field Power</option>
            </select>
          </div>
        </div>
      </div>

      {/* Equipment Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="tactical-table">
            <thead>
              <tr>
                <th>SERIAL NO</th>
                <th>EQUIPMENT NAME</th>
                <th>CATEGORY</th>
                <th>STORAGE BIN</th>
                <th>BATTERY HEALTH</th>
                <th>LAST CALIBRATION</th>
                <th>OPERATIONAL STATE</th>
                <th>CURRENT CUSTODIAN</th>
                <th style={{ textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: 40, color: '#38bdf8' }}>
                    Scanning Armory Vaults...
                  </td>
                </tr>
              ) : equipment.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
                    No specialized equipment found.
                  </td>
                </tr>
              ) : (
                equipment.map((eq) => (
                  <tr key={eq.id}>
                    <td className="mono" style={{ color: '#38bdf8', fontWeight: 600 }}>
                      {eq.serial_no}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#f8fafc' }}>{eq.asset_name}</div>
                      <div className="mono" style={{ fontSize: '0.75rem', color: '#64748b' }}>{eq.asset_code}</div>
                    </td>
                    <td>{eq.category}</td>
                    <td style={{ color: '#cbd5e1' }}>{eq.storage_locker}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Battery size={14} color="#34d399" />
                        <span className="mono" style={{ fontSize: '0.825rem', color: '#34d399' }}>
                          {eq.battery_health}
                        </span>
                      </div>
                    </td>
                    <td className="mono" style={{ fontSize: '0.8rem' }}>
                      {eq.calibration_date || 'N/A'}
                    </td>
                    <td>
                      <StatusBadge status={eq.operational_state} />
                    </td>
                    <td>
                      {eq.assigned_to_name ? (
                        <span style={{ color: '#f8fafc', fontWeight: 500 }}>
                          {eq.assigned_to_rank} {eq.assigned_to_name}
                        </span>
                      ) : (
                        <span style={{ color: '#64748b', fontStyle: 'italic' }}>Armory Vault</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-icon"
                          title="Decommission Equipment"
                          onClick={() => setDeleteId(eq.id)}
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

      {/* Add Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="CATALOG SPECIALIZED EQUIPMENT"
      >
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Equipment Model / Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Harris Falcon III Backpack Radio"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Tactical Optics">Tactical Optics</option>
                <option value="Encrypted Radio">Encrypted Radio</option>
                <option value="Ballistic Gear">Ballistic Gear</option>
                <option value="Drone / UAV">Drone / UAV</option>
                <option value="Field Power">Field Power</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Serial Number</label>
              <input
                type="text"
                className="form-input mono"
                value={formData.serial_no}
                onChange={(e) => setFormData({ ...formData, serial_no: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Armory Storage Locker</label>
              <input
                type="text"
                className="form-input"
                value={formData.storage_locker}
                onChange={(e) => setFormData({ ...formData, storage_locker: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Battery Health</label>
              <input
                type="text"
                className="form-input mono"
                value={formData.battery_health}
                onChange={(e) => setFormData({ ...formData, battery_health: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Calibration Verification Date</label>
              <input
                type="date"
                className="form-input mono"
                value={formData.calibration_date}
                onChange={(e) => setFormData({ ...formData, calibration_date: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Operational State</label>
              <select
                className="form-select"
                value={formData.operational_state}
                onChange={(e) => setFormData({ ...formData, operational_state: e.target.value })}
              >
                <option value="Fully Operational">Fully Operational</option>
                <option value="Needs Calibration">Needs Calibration</option>
                <option value="Defective">Defective</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Replacement Valuation (USD)</label>
              <input
                type="number"
                className="form-input mono"
                value={formData.value_usd}
                onChange={(e) => setFormData({ ...formData, value_usd: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Catalog in Armory
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Decommission Equipment"
        message="Are you sure you want to decommission this tactical gear from the armory vault?"
        confirmText="Confirm Decommission"
        isDanger={true}
      />
    </div>
  );
}
