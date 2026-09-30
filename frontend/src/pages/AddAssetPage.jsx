import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, PlusCircle, ShieldAlert } from 'lucide-react';
import { assetService } from '../services/assetService';
import { personnelService } from '../services/personnelService';
import { useToast } from '../components/Toast';

export default function AddAssetPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [personnelList, setPersonnelList] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    asset_code: '',
    name: '',
    type: 'Vehicle',
    serial_number: '',
    quantity: 1,
    status: 'Available',
    location: 'Central Armory - Alpha',
    assigned_to_id: '',
    purchase_date: new Date().toISOString().slice(0, 10),
    last_maintenance_date: '',
    next_maintenance_date: '',
    condition_state: 'Good',
    value_usd: '',
    description: ''
  });

  useEffect(() => {
    loadPersonnel();
  }, []);

  async function loadPersonnel() {
    try {
      const data = await personnelService.getPersonnel({ status: 'Active' });
      setPersonnelList(data);
    } catch {
      // Ignored
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerateCode = () => {
    const typePrefix = {
      'Vehicle': 'AST-1',
      'Weapon': 'AST-3',
      'Communication': 'AST-2',
      'Optics': 'AST-5',
      'Heavy Equipment': 'AST-4',
      'Surveillance': 'AST-6',
      'Medical Gear': 'AST-7'
    }[formData.type] || 'AST-9';

    const random = Math.floor(1000 + Math.random() * 9000);
    setFormData((prev) => ({ ...prev, asset_code: `${typePrefix}${random}` }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.serial_number || !formData.purchase_date) {
      addToast('Please complete all mandatory tactical asset fields.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await assetService.createAsset({
        ...formData,
        quantity: parseInt(formData.quantity, 10) || 1,
        value_usd: parseFloat(formData.value_usd) || 0,
        assigned_to_id: formData.assigned_to_id ? parseInt(formData.assigned_to_id, 10) : null
      });

      if (res.success) {
        addToast(res.message || 'Asset successfully cataloged in registry!', 'success');
        navigate('/assets');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to catalog asset: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link to="/assets" className="btn btn-secondary btn-icon" title="Return to Registry">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="tactical-title" style={{ fontSize: '1.6rem', color: '#f8fafc', marginBottom: 2 }}>
              COMMISSION NEW ASSET
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Armory Intake & Technical Specification Registration
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="card">
        <div className="hud-corner hud-tl" />
        <div className="hud-corner hud-tr" />
        <div className="hud-corner hud-bl" />
        <div className="hud-corner hud-br" />

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {/* Asset Code */}
            <div className="form-group">
              <label className="form-label">
                Asset ID / Code <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  name="asset_code"
                  className="form-input mono"
                  placeholder="e.g. AST-1049"
                  value={formData.asset_code}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleGenerateCode}
                  title="Auto Generate Code"
                >
                  Generate
                </button>
              </div>
            </div>

            {/* Asset Name */}
            <div className="form-group">
              <label className="form-label">
                Asset Name / Model <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                name="name"
                className="form-input"
                placeholder="e.g. Guardian Tactical APC (V-8)"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            {/* Asset Type */}
            <div className="form-group">
              <label className="form-label">
                Asset Type <span style={{ color: '#ef4444' }}>*</span>
              </label>
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

            {/* Serial Number */}
            <div className="form-group">
              <label className="form-label">
                Serial Number <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                name="serial_number"
                className="form-input mono"
                placeholder="e.g. APC-2024-99120"
                value={formData.serial_number}
                onChange={handleChange}
                required
              />
            </div>

            {/* Quantity */}
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

            {/* Status */}
            <div className="form-group">
              <label className="form-label">Initial Status</label>
              <select name="status" className="form-select" value={formData.status} onChange={handleChange}>
                <option value="Available">Available</option>
                <option value="Assigned">Assigned</option>
                <option value="Under Maintenance">Under Maintenance</option>
                <option value="Retired">Retired</option>
              </select>
            </div>

            {/* Location */}
            <div className="form-group">
              <label className="form-label">Storage Location / Base</label>
              <input
                type="text"
                name="location"
                className="form-input"
                placeholder="e.g. Central Armory - Alpha"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>

            {/* Assigned Personnel */}
            <div className="form-group">
              <label className="form-label">Assigned Custodian (Personnel)</label>
              <select name="assigned_to_id" className="form-select" value={formData.assigned_to_id} onChange={handleChange}>
                <option value="">-- Unassigned / Armory Reserve --</option>
                {personnelList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.rank_title} {p.full_name} ({p.service_number}) - {p.unit}
                  </option>
                ))}
              </select>
            </div>

            {/* Purchase Date */}
            <div className="form-group">
              <label className="form-label">
                Purchase / Acquisition Date <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="date"
                name="purchase_date"
                className="form-input mono"
                value={formData.purchase_date}
                onChange={handleChange}
                required
              />
            </div>

            {/* Condition */}
            <div className="form-group">
              <label className="form-label">Condition State</label>
              <select name="condition_state" className="form-select" value={formData.condition_state} onChange={handleChange}>
                <option value="Excellent">Excellent (New / Overhauled)</option>
                <option value="Good">Good (Operational)</option>
                <option value="Fair">Fair (Needs Inspection)</option>
                <option value="Critical">Critical (Inoperative)</option>
              </select>
            </div>

            {/* Estimated Value */}
            <div className="form-group">
              <label className="form-label">Estimated Value (USD)</label>
              <input
                type="number"
                name="value_usd"
                className="form-input mono"
                placeholder="e.g. 85000"
                value={formData.value_usd}
                onChange={handleChange}
              />
            </div>

            {/* Maintenance Dates */}
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

          {/* Description */}
          <div className="form-group" style={{ marginTop: 10 }}>
            <label className="form-label">Asset Description & Technical Notes</label>
            <textarea
              name="description"
              className="form-textarea"
              rows="4"
              placeholder="Provide technical specifications, ballistic standards, operating limits, or maintenance instructions..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          {/* Form Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24, paddingTop: 18, borderTop: '1px solid #1e293b' }}>
            <Link to="/assets" className="btn btn-secondary">
              Cancel
            </Link>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Save size={16} /> {loading ? 'Registering...' : 'Commission Asset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
