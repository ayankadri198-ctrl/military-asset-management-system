import React, { useState, useEffect } from 'react';
import {
  Truck,
  PlusCircle,
  Search,
  Fuel,
  Gauge,
  Shield,
  Trash2,
  Edit,
  RefreshCw,
  UserCheck
} from 'lucide-react';
import { vehicleService } from '../services/vehicleService';
import { personnelService } from '../services/personnelService';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { useToast } from '../components/Toast';

export default function VehicleManagementPage() {
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [readinessFilter, setReadinessFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    vehicle_type: 'Armored Patrol',
    registration_no: '',
    engine_no: '',
    mileage_km: 0,
    fuel_type: 'Diesel',
    operational_readiness: 'Mission Ready',
    assigned_driver_id: '',
    armor_level: 'STANAG Level 2',
    value_usd: 250000
  });

  useEffect(() => {
    loadData();
  }, [readinessFilter]);

  async function loadData() {
    setLoading(true);
    try {
      const [vehData, persData] = await Promise.all([
        vehicleService.getVehicles({ search, readiness: readinessFilter }),
        personnelService.getPersonnel({ status: 'Active' })
      ]);
      setVehicles(vehData);
      setDrivers(persData);
    } catch (err) {
      addToast('Failed to load fleet: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  const handleOpenAdd = () => {
    const regNum = `MIL-V-${Math.floor(10000 + Math.random() * 90000)}`;
    const engNum = `ENG-DET-${Math.floor(1000 + Math.random() * 9000)}`;
    setFormData({
      name: '',
      vehicle_type: 'Tactical Truck',
      registration_no: regNum,
      engine_no: engNum,
      mileage_km: 1200,
      fuel_type: 'Diesel',
      operational_readiness: 'Mission Ready',
      assigned_driver_id: '',
      armor_level: 'STANAG Level 2',
      value_usd: 180000
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await vehicleService.createVehicle({
        ...formData,
        mileage_km: parseInt(formData.mileage_km, 10) || 0,
        assigned_driver_id: formData.assigned_driver_id ? parseInt(formData.assigned_driver_id, 10) : null
      });
      addToast('Vehicle commissioned into motor pool fleet.', 'success');
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to add vehicle: ' + err.message, 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await vehicleService.deleteVehicle(deleteId);
      addToast('Vehicle decommissioned from fleet.', 'success');
      loadData();
    } catch (err) {
      addToast('Failed to delete vehicle: ' + err.message, 'error');
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="tactical-title" style={{ fontSize: '1.75rem', color: '#f8fafc', marginBottom: 4 }}>
            TACTICAL MOTOR POOL FLEET
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Armored Vehicles, Heavy Transport, Mobility Readiness & Driver Assignment
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={loadData} className="btn btn-secondary btn-sm">
            <RefreshCw size={15} /> Refresh Fleet
          </button>
          <button onClick={handleOpenAdd} className="btn btn-primary btn-sm">
            <PlusCircle size={15} /> Commission Vehicle
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
              placeholder="Search registration, vehicle name, model..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadData()}
              style={{ paddingLeft: 36, fontSize: '0.85rem' }}
            />
          </div>

          <div style={{ flex: '0 1 200px' }}>
            <select
              className="form-select"
              value={readinessFilter}
              onChange={(e) => setReadinessFilter(e.target.value)}
              style={{ fontSize: '0.85rem' }}
            >
              <option value="">All Readiness States</option>
              <option value="Mission Ready">Mission Ready</option>
              <option value="Standby">Standby</option>
              <option value="In Shop">In Shop</option>
              <option value="Decommissioned">Decommissioned</option>
            </select>
          </div>
        </div>
      </div>

      {/* Fleet Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="tactical-table">
            <thead>
              <tr>
                <th>REGISTRATION NO</th>
                <th>VEHICLE NAME</th>
                <th>TYPE</th>
                <th>ARMOR LEVEL</th>
                <th>MILEAGE (KM)</th>
                <th>FUEL</th>
                <th>READINESS</th>
                <th>ASSIGNED OPERATOR</th>
                <th style={{ textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: 40, color: '#38bdf8' }}>
                    Scanning Motor Pool Radar...
                  </td>
                </tr>
              ) : vehicles.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
                    No fleet vehicles found matching criteria.
                  </td>
                </tr>
              ) : (
                vehicles.map((v) => (
                  <tr key={v.id}>
                    <td className="mono" style={{ color: '#38bdf8', fontWeight: 600 }}>
                      {v.registration_no}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#f8fafc' }}>{v.asset_name}</div>
                      <div className="mono" style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        ENG: {v.engine_no}
                      </div>
                    </td>
                    <td>{v.vehicle_type}</td>
                    <td>
                      <span className="badge" style={{ backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
                        {v.armor_level}
                      </span>
                    </td>
                    <td className="mono">
                      {Number(v.mileage_km || 0).toLocaleString()} km
                    </td>
                    <td>
                      <span style={{ color: '#cbd5e1' }}>{v.fuel_type}</span>
                    </td>
                    <td>
                      <StatusBadge status={v.operational_readiness} />
                    </td>
                    <td>
                      {v.driver_name ? (
                        <div>
                          <div style={{ fontWeight: 500, color: '#f8fafc' }}>
                            {v.driver_rank} {v.driver_name}
                          </div>
                          <div className="mono" style={{ fontSize: '0.7rem', color: '#64748b' }}>
                            {v.driver_service_no}
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: '#64748b', fontStyle: 'italic' }}>Unassigned</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-icon"
                          title="Decommission Vehicle"
                          onClick={() => setDeleteId(v.id)}
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

      {/* Add Vehicle Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="COMMISSION FLEET VEHICLE"
      >
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Vehicle Name / Model</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Cougar 6x6 MRAP"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Vehicle Classification</label>
              <select
                className="form-select"
                value={formData.vehicle_type}
                onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
              >
                <option value="Armored Patrol">Armored Patrol</option>
                <option value="Tactical Truck">Tactical Truck</option>
                <option value="APC">APC (Armored Personnel Carrier)</option>
                <option value="Reconnaissance Rover">Reconnaissance Rover</option>
                <option value="Utility Transport">Utility Transport</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Registration Plate #</label>
              <input
                type="text"
                className="form-input mono"
                value={formData.registration_no}
                onChange={(e) => setFormData({ ...formData, registration_no: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Engine Block Serial #</label>
              <input
                type="text"
                className="form-input mono"
                value={formData.engine_no}
                onChange={(e) => setFormData({ ...formData, engine_no: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Odometer (km)</label>
              <input
                type="number"
                className="form-input mono"
                min="0"
                value={formData.mileage_km}
                onChange={(e) => setFormData({ ...formData, mileage_km: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Fuel Requirement</label>
              <select
                className="form-select"
                value={formData.fuel_type}
                onChange={(e) => setFormData({ ...formData, fuel_type: e.target.value })}
              >
                <option value="Diesel">Diesel</option>
                <option value="JP-8 Heavy Fuel">JP-8 Heavy Fuel</option>
                <option value="Hybrid Electric">Hybrid Electric</option>
                <option value="Battery EV">Battery EV</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Armor Standard</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. STANAG Level 3"
                value={formData.armor_level}
                onChange={(e) => setFormData({ ...formData, armor_level: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Assigned Driver / Operator</label>
              <select
                className="form-select"
                value={formData.assigned_driver_id}
                onChange={(e) => setFormData({ ...formData, assigned_driver_id: e.target.value })}
              >
                <option value="">-- No Assigned Driver --</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.rank_title} {d.full_name} ({d.service_number})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Register Vehicle
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Decommission Fleet Vehicle"
        message="Are you sure you want to decommission this vehicle and remove it from active fleet logs?"
        confirmText="Confirm Decommission"
        isDanger={true}
      />
    </div>
  );
}
