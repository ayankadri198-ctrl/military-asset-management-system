import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, RefreshCw } from 'lucide-react';
import { assetService } from '../services/assetService';
import { personnelService } from '../services/personnelService';
import { useToast } from '../components/Toast';

export default function EditAssetPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [personnelList, setPersonnelList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    asset_code: '',
    name: '',
    type: 'Vehicle',
    serial_number: '',
    quantity: 1,
    status: 'Available',
    location: '',
    assigned_to_id: '',
    purchase_date: '',
    last_maintenance_date: '',
    next_maintenance_date: '',
    condition_state: 'Good',
    value_usd: '',
    description: ''
  });

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    setLoading(true);
    try {
      const [asset, personnel] = await Promise.all([
        assetService.getAssetById(id),
        personnelService.getPersonnel({ status: 'Active' })
      ]);

      setPersonnelList(personnel);

      setFormData({
        asset_code: asset.asset_code || '',
        name: asset.name || '',
        type: asset.type || 'Vehicle',
        serial_number: asset.serial_number || '',
        quantity: asset.quantity || 1,
        status: asset.status || 'Available',
        location: asset.location || '',
        assigned_to_id: asset.assigned_to_id ? String(asset.assigned_to_id) : '',
        purchase_date: asset.purchase_date || '',
        last_maintenance_date: asset.last_maintenance_date || '',
        next_maintenance_date: asset.next_maintenance_date || '',
        condition_state: asset.condition_state || 'Good',
        value_usd: asset.value_usd || '',
        description: asset.description || ''
      });
    } catch (err) {
      addToast('Failed to load asset details: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await assetService.updateAsset(id, {
        ...formData,
        quantity: parseInt(formData.quantity, 10) || 1,
        value_usd: parseFloat(formData.value_usd) || 0,
        assigned_to_id: formData.assigned_to_id ? parseInt(formData.assigned_to_id, 10) : null
      });

      if (res.success) {
        addToast(res.message || 'Asset updated successfully!', 'success');
        navigate(`/assets/${id}`);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update asset: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: 12 }}>
        <RefreshCw size={24} className="radar-pulse" style={{ color: '#38bdf8' }} />
        <span>Loading Asset Record...</span>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link to={`/assets/${id}`} className="btn btn-secondary btn-icon" title="Return">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="tactical-title" style={{ fontSize: '1.6rem', color: '#f8fafc', marginBottom: 2 }}>
              MODIFY ASSET RECORD [{formData.asset_code}]
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Update Operational Status, Location, and Custody Assignment
            </p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="hud-corner hud-tl" />
        <div className="hud-corner hud-tr" />
        <div className="hud-corner hud-bl" />
        <div className="hud-corner hud-br" />

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            <div className="form-group">
              <label className="form-label">Asset Code</label>
              <input
                type="text"
                name="asset_code"
                className="form-input mono"
                value={formData.asset_code}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Asset Name</label>
              <input
                type="text"
                name="name"
                className="form-input"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Asset Type</label>
              <select name="type" className="form-select" value={formData.type} onChange={handleChange} required>
                <option value="Vehicle">Vehicle</option>
                <option value="Weapon">Weapon</option>
                <option value="Communication">Communication</option>
                <option value="Optics">Optics</option>
                <option value="Heavy Equipment">Heavy Equipment</option>
                <option value="Surveillance">Surveillance</option>
                <option value="Medical Gear">Medical Gear</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Serial Number</label>
              <input
                type="text"
                name="serial_number"
                className="form-input mono"
                value={formData.serial_number}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Quantity</label>
              <input
                type="number"
                name="quantity"
                className="form-input mono"
                min="1"
                value={formData.quantity}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select name="status" className="form-select" value={formData.status} onChange={handleChange}>
                <option value="Available">Available</option>
                <option value="Assigned">Assigned</option>
                <option value="Under Maintenance">Under Maintenance</option>
                <option value="Retired">Retired</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Location / Base</label>
              <input
                type="text"
                name="location"
                className="form-input"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Assigned Custodian (Personnel)</label>
              <select name="assigned_to_id" className="form-select" value={formData.assigned_to_id} onChange={handleChange}>
                <option value="">-- Unassigned / Armory Reserve --</option>
                {personnelList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.rank_title} {p.full_name} ({p.service_number})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Purchase Date</label>
              <input
                type="date"
                name="purchase_date"
                className="form-input mono"
                value={formData.purchase_date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Condition State</label>
              <select name="condition_state" className="form-select" value={formData.condition_state} onChange={handleChange}>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Estimated Value (USD)</label>
              <input
                type="number"
                name="value_usd"
                className="form-input mono"
                value={formData.value_usd}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Last Maintenance Date</label>
              <input
                type="date"
                name="last_maintenance_date"
                className="form-input mono"
                value={formData.last_maintenance_date}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Next Maintenance Due</label>
              <input
                type="date"
                name="next_maintenance_date"
                className="form-input mono"
                value={formData.next_maintenance_date}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: 10 }}>
            <label className="form-label">Description & Notes</label>
            <textarea
              name="description"
              className="form-textarea"
              rows="4"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24, paddingTop: 18, borderTop: '1px solid #1e293b' }}>
            <Link to={`/assets/${id}`} className="btn btn-secondary">
              Cancel
            </Link>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <Save size={16} /> {saving ? 'Saving Manifest...' : 'Save Modifications'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
