import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  PlusCircle,
  Shield,
  Trash2,
  Edit,
  Phone,
  Mail,
  RefreshCw,
  UserCheck
} from 'lucide-react';
import { personnelService } from '../services/personnelService';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { useToast } from '../components/Toast';

export default function PersonnelManagementPage() {
  const [personnel, setPersonnel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editId, setEditId] = useState(null);
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    service_number: '',
    full_name: '',
    rank_title: 'Specialist',
    unit: 'Logistics Command HQ',
    role_assignment: 'Supply Specialist',
    clearance_level: 'Secret',
    phone: '',
    email: '',
    status: 'Active',
    assigned_base: 'Forward Operating Base Alpha'
  });

  useEffect(() => {
    loadPersonnel();
  }, []);

  async function loadPersonnel() {
    setLoading(true);
    try {
      const data = await personnelService.getPersonnel({ search });
      setPersonnel(data);
    } catch (err) {
      addToast('Failed to load personnel roster: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  const handleOpenAdd = () => {
    setEditId(null);
    setFormData({
      service_number: `SN-${Math.floor(100000 + Math.random() * 900000)}`,
      full_name: '',
      rank_title: 'Sergeant',
      unit: '4th Armored Battalion Depot',
      role_assignment: 'Asset Custodian',
      clearance_level: 'Secret',
      phone: '+1-555-0199',
      email: '',
      status: 'Active',
      assigned_base: 'Fort Vanguard HQ'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditId(p.id);
    setFormData({
      service_number: p.service_number,
      full_name: p.full_name,
      rank_title: p.rank_title,
      unit: p.unit,
      role_assignment: p.role_assignment,
      clearance_level: p.clearance_level,
      phone: p.phone || '',
      email: p.email || '',
      status: p.status,
      assigned_base: p.assigned_base
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await personnelService.updatePersonnel(editId, formData);
        addToast('Personnel record updated.', 'success');
      } else {
        await personnelService.createPersonnel(formData);
        addToast('Personnel enrolled into military register.', 'success');
      }
      setIsModalOpen(false);
      loadPersonnel();
    } catch (err) {
      addToast(err.response?.data?.message || 'Operation failed: ' + err.message, 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await personnelService.deletePersonnel(deleteId);
      addToast('Personnel removed from active duty roster.', 'success');
      loadPersonnel();
    } catch (err) {
      addToast('Failed to discharge personnel: ' + err.message, 'error');
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="tactical-title" style={{ fontSize: '1.75rem', color: '#f8fafc', marginBottom: 4 }}>
            MILITARY PERSONNEL ROSTER
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Officer Registry, Security Clearance Levels & Asset Custodians
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={loadPersonnel} className="btn btn-secondary btn-sm">
            <RefreshCw size={15} /> Refresh
          </button>
          <button onClick={handleOpenAdd} className="btn btn-primary btn-sm">
            <PlusCircle size={15} /> Enroll Personnel
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="card" style={{ marginBottom: 20, padding: 16 }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search by name, service number, rank, or unit..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadPersonnel()}
              style={{ paddingLeft: 36, fontSize: '0.85rem' }}
            />
          </div>
          <button onClick={loadPersonnel} className="btn btn-primary btn-sm">
            Search
          </button>
        </div>
      </div>

      {/* Personnel Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="tactical-table">
            <thead>
              <tr>
                <th>SERVICE NO</th>
                <th>RANK & NAME</th>
                <th>UNIT</th>
                <th>ASSIGNED ROLE</th>
                <th>CLEARANCE</th>
                <th>ASSIGNED BASE</th>
                <th>GEAR COUNT</th>
                <th>STATUS</th>
                <th style={{ textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: 40, color: '#38bdf8' }}>
                    Accessing Personnel Roster...
                  </td>
                </tr>
              ) : personnel.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
                    No personnel on record matching query.
                  </td>
                </tr>
              ) : (
                personnel.map((p) => (
                  <tr key={p.id}>
                    <td className="mono" style={{ color: '#38bdf8', fontWeight: 600 }}>
                      {p.service_number}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#f8fafc' }}>
                        {p.rank_title} {p.full_name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        {p.email || 'internal@mams.local'}
                      </div>
                    </td>
                    <td style={{ color: '#cbd5e1' }}>{p.unit}</td>
                    <td style={{ color: '#94a3b8' }}>{p.role_assignment}</td>
                    <td>
                      <span className="badge" style={{
                        backgroundColor: p.clearance_level === 'Top Secret' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(14, 165, 233, 0.2)',
                        color: p.clearance_level === 'Top Secret' ? '#f87171' : '#38bdf8',
                        border: '1px solid currentColor'
                      }}>
                        {p.clearance_level}
                      </span>
                    </td>
                    <td style={{ color: '#cbd5e1' }}>{p.assigned_base}</td>
                    <td>
                      <span className="mono" style={{ fontWeight: 700, color: p.assigned_assets_count > 0 ? '#34d399' : '#64748b' }}>
                        {p.assigned_assets_count || 0} items
                      </span>
                    </td>
                    <td><StatusBadge status={p.status} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-icon"
                          title="Edit Personnel"
                          onClick={() => handleOpenEdit(p)}
                        >
                          <Edit size={14} color="#34d399" />
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-icon"
                          title="Remove Personnel"
                          onClick={() => setDeleteId(p.id)}
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

      {/* Add / Edit Personnel Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editId ? 'UPDATE PERSONNEL DOSSIER' : 'ENROLL NEW PERSONNEL'}
      >
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Service Number</label>
              <input
                type="text"
                className="form-input mono"
                value={formData.service_number}
                onChange={(e) => setFormData({ ...formData, service_number: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Sarah Jenkins"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Rank Title</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Captain, Major, Sergeant"
                value={formData.rank_title}
                onChange={(e) => setFormData({ ...formData, rank_title: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Military Unit</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 101st Reconnaissance Wing"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Operational Role</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Lead Recon Pilot"
                value={formData.role_assignment}
                onChange={(e) => setFormData({ ...formData, role_assignment: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Clearance Level</label>
              <select
                className="form-select"
                value={formData.clearance_level}
                onChange={(e) => setFormData({ ...formData, clearance_level: e.target.value })}
              >
                <option value="General Clearance">General Clearance</option>
                <option value="Confidential">Confidential</option>
                <option value="Secret">Secret</option>
                <option value="Top Secret">Top Secret</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Assigned Base / Station</label>
              <input
                type="text"
                className="form-input"
                value={formData.assigned_base}
                onChange={(e) => setFormData({ ...formData, assigned_base: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Duty Status</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="Deployed">Deployed</option>
                <option value="On Leave">On Leave</option>
                <option value="Transferred">Transferred</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editId ? 'Save Record' : 'Enroll Officer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Discharge Personnel"
        message="Are you sure you wish to discharge this personnel member from the active command roster?"
        confirmText="Confirm Discharge"
        isDanger={true}
      />
    </div>
  );
}
