import React, { useState, useEffect } from 'react';
import {
  Settings,
  Database,
  ShieldCheck,
  Server,
  Users,
  PlusCircle,
  Trash2,
  Lock,
  Save,
  RefreshCw,
  HardDrive,
  Edit3,
  Volume2,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import api from '../services/api';
import { userService } from '../services/userService';
import { authService } from '../services/authService';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import StatusBadge from '../components/StatusBadge';
import { useToast } from '../components/Toast';

const DEFAULT_CONFIG = {
  systemName: 'Defense Logistics & Asset Management System (DLAMS)',
  commandStation: 'Command Post Alpha',
  defconLevel: 'DEFCON 4',
  maintenanceCycleDays: 180,
  strictClearanceRequired: true,
  autoAuditLogging: true,
  notificationSound: false
};

export default function SettingsPage() {
  const { addToast } = useToast();
  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUser?.role === 'Admin';

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, user: null });

  // System Configuration State with LocalStorage persistence
  const [systemConfig, setSystemConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('mams_system_settings');
      if (saved) return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
    } catch (e) {
      console.error('Error loading settings from localStorage:', e);
    }
    return DEFAULT_CONFIG;
  });

  // Diagnostics / Health State
  const [diagnostics, setDiagnostics] = useState({
    loading: false,
    status: 'ONLINE',
    engine: 'SQLITE',
    latency: null,
    lastChecked: null,
    details: null
  });

  // New User Form State
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    role: 'Staff',
    rank_title: 'Specialist',
    military_unit: 'Logistics Command HQ'
  });

  // Edit User Form State
  const [editingUser, setEditingUser] = useState({
    id: null,
    username: '',
    role: 'Staff',
    rank_title: '',
    military_unit: '',
    status: 'Active'
  });

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
    runDiagnostics();
  }, [isAdmin]);

  async function loadUsers() {
    setLoadingUsers(true);
    try {
      const data = await userService.getUsers();
      setUsers(data || []);
    } catch (err) {
      addToast('Failed to retrieve user directory: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setLoadingUsers(false);
    }
  }

  // Ping backend /api/health to measure latency and live database engine
  async function runDiagnostics() {
    setDiagnostics((prev) => ({ ...prev, loading: true }));
    const startTime = performance.now();
    try {
      const res = await api.get('/health');
      const endTime = performance.now();
      const latencyMs = Math.round(endTime - startTime);

      setDiagnostics({
        loading: false,
        status: res.data?.status || 'ONLINE',
        engine: (res.data?.databaseEngine || 'SQLITE').toUpperCase(),
        latency: latencyMs,
        lastChecked: new Date().toLocaleTimeString(),
        details: res.data
      });
      return latencyMs;
    } catch (err) {
      setDiagnostics({
        loading: false,
        status: 'OFFLINE',
        engine: 'DISCONNECTED',
        latency: null,
        lastChecked: new Date().toLocaleTimeString(),
        details: null
      });
      return null;
    }
  }

  const handleManualDiagnostics = async () => {
    const lat = await runDiagnostics();
    if (lat !== null) {
      addToast(`Diagnostics complete: Database is responsive (${lat}ms latency).`, 'success');
    } else {
      addToast('Diagnostics check failed: Unable to connect to backend server.', 'error');
    }
  };

  const handleSaveSystemConfig = (e) => {
    e.preventDefault();
    try {
      localStorage.setItem('mams_system_settings', JSON.stringify(systemConfig));
      window.dispatchEvent(new Event('mams_settings_changed'));
      addToast('System operational parameters committed and synchronized.', 'success');
    } catch (err) {
      addToast('Failed to save settings: ' + err.message, 'error');
    }
  };

  const handleResetDefaults = () => {
    setSystemConfig(DEFAULT_CONFIG);
    localStorage.setItem('mams_system_settings', JSON.stringify(DEFAULT_CONFIG));
    window.dispatchEvent(new Event('mams_settings_changed'));
    addToast('Parameters reset to default Defense Logistics baseline.', 'info');
  };

  // Tactical Audio Ping test
  const handleTestAudioPing = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // 880Hz A5 tactical tone
      osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.18);

      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);

      addToast('Tactical audio frequency ping transmitted.', 'info');
    } catch {
      addToast('Browser audio synthesizer unavailable.', 'warning');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await userService.createUser(newUser);
      addToast(`User account [${newUser.username}] created successfully.`, 'success');
      setIsUserModalOpen(false);
      setNewUser({
        username: '',
        email: '',
        password: '',
        role: 'Staff',
        rank_title: 'Specialist',
        military_unit: 'Logistics Command HQ'
      });
      loadUsers();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create user: ' + err.message, 'error');
    }
  };

  const handleOpenEditUser = (user) => {
    setEditingUser({
      id: user.id,
      username: user.username,
      role: user.role,
      rank_title: user.rank_title || '',
      military_unit: user.military_unit || '',
      status: user.status || 'Active'
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEditUser = async (e) => {
    e.preventDefault();
    try {
      await userService.updateUser(editingUser.id, {
        role: editingUser.role,
        rank_title: editingUser.rank_title,
        military_unit: editingUser.military_unit,
        status: editingUser.status
      });
      addToast(`Account [${editingUser.username}] updated successfully.`, 'success');
      setIsEditModalOpen(false);
      loadUsers();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update user: ' + err.message, 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm.user) return;
    const { id, username } = deleteConfirm.user;
    if (id === currentUser.id) {
      addToast('Cannot delete currently authenticated session account.', 'error');
      return;
    }
    try {
      await userService.deleteUser(id);
      addToast(`Account [${username}] revoked from command directory.`, 'success');
      loadUsers();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete user: ' + err.message, 'error');
    } finally {
      setDeleteConfirm({ isOpen: false, user: null });
    }
  };

  const defconColors = {
    'DEFCON 1': { bg: 'rgba(239, 68, 68, 0.2)', border: '#ef4444', text: '#f87171' },
    'DEFCON 2': { bg: 'rgba(249, 115, 22, 0.2)', border: '#f97316', text: '#fb923c' },
    'DEFCON 3': { bg: 'rgba(234, 179, 8, 0.2)', border: '#eab308', text: '#facc15' },
    'DEFCON 4': { bg: 'rgba(16, 185, 129, 0.2)', border: '#10b981', text: '#34d399' },
    'DEFCON 5': { bg: 'rgba(14, 165, 233, 0.2)', border: '#0ea5e9', text: '#38bdf8' }
  };
  const activeDefcon = defconColors[systemConfig.defconLevel] || defconColors['DEFCON 4'];

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="tactical-title" style={{ fontSize: '1.75rem', color: '#f8fafc', marginBottom: 4 }}>
            SYSTEM ARCHITECTURE & SETTINGS
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Defense Grid Parameters, Operational Security, and User Credential Provisioning
          </p>
        </div>
        <button
          type="button"
          onClick={handleResetDefaults}
          className="btn btn-secondary btn-sm"
          title="Restore factory default parameters"
        >
          <RotateCcw size={14} /> Reset Defaults
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 24 }}>
        {/* System Parameters Form */}
        <div className="card">
          <div className="hud-corner hud-tl" />
          <div className="hud-corner hud-tr" />
          <div className="card-header">
            <div className="card-title">
              <Settings size={18} color="#0ea5e9" />
              <span>Command Station Configuration</span>
            </div>
            <span
              className="mono"
              style={{
                fontSize: '0.75rem',
                padding: '3px 8px',
                borderRadius: 4,
                backgroundColor: activeDefcon.bg,
                border: `1px solid ${activeDefcon.border}`,
                color: activeDefcon.text,
                fontWeight: 600
              }}
            >
              {systemConfig.defconLevel}
            </span>
          </div>

          <form onSubmit={handleSaveSystemConfig}>
            <div className="form-group">
              <label className="form-label">System Platform Designation</label>
              <input
                type="text"
                className="form-input"
                value={systemConfig.systemName}
                onChange={(e) => setSystemConfig({ ...systemConfig, systemName: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Active Base / Station Tag (Shows in Top Bar)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. FOB ALPHA or Fort Vanguard"
                value={systemConfig.commandStation}
                onChange={(e) => setSystemConfig({ ...systemConfig, commandStation: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Readiness Threat Posture (DEFCON)</label>
              <select
                className="form-select"
                value={systemConfig.defconLevel}
                onChange={(e) => setSystemConfig({ ...systemConfig, defconLevel: e.target.value })}
              >
                <option value="DEFCON 5">DEFCON 5 // Normal Peacetime Readiness</option>
                <option value="DEFCON 4">DEFCON 4 // Heightened Intelligence Vigilance</option>
                <option value="DEFCON 3">DEFCON 3 // Air & Ground Mobilization Ready</option>
                <option value="DEFCON 2">DEFCON 2 // Armed Forces Ready to Deploy</option>
                <option value="DEFCON 1">DEFCON 1 // Maximum Force Alert Status</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Default Maintenance Cycle (Days)</label>
              <input
                type="number"
                min="7"
                max="730"
                className="form-input mono"
                value={systemConfig.maintenanceCycleDays}
                onChange={(e) => setSystemConfig({ ...systemConfig, maintenanceCycleDays: parseInt(e.target.value, 10) || 180 })}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: '0.85rem' }}>
                <input
                  type="checkbox"
                  checked={systemConfig.strictClearanceRequired}
                  onChange={(e) => setSystemConfig({ ...systemConfig, strictClearanceRequired: e.target.checked })}
                  style={{ accentColor: '#0ea5e9' }}
                />
                <span>Enforce NATO Role-Based Verification for Transfers</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: '0.85rem' }}>
                <input
                  type="checkbox"
                  checked={systemConfig.autoAuditLogging}
                  onChange={(e) => setSystemConfig({ ...systemConfig, autoAuditLogging: e.target.checked })}
                  style={{ accentColor: '#0ea5e9' }}
                />
                <span>Real-Time Audit Trail Logging (activity_logs table)</span>
              </label>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input
                    type="checkbox"
                    checked={systemConfig.notificationSound}
                    onChange={(e) => setSystemConfig({ ...systemConfig, notificationSound: e.target.checked })}
                    style={{ accentColor: '#0ea5e9' }}
                  />
                  <span>Acoustic Radar & Alarm Tone Feedback</span>
                </label>
                <button
                  type="button"
                  onClick={handleTestAudioPing}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                  title="Test Audio Synthesizer"
                >
                  <Volume2 size={13} /> Ping Audio
                </button>
              </div>
            </div>

            <div style={{ marginTop: 22 }}>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                <Save size={16} /> Save Parameters & Commit Grid
              </button>
            </div>
          </form>
        </div>

        {/* Database & Infrastructure Status */}
        <div className="card">
          <div className="hud-corner hud-tl" />
          <div className="hud-corner hud-tr" />
          <div className="card-header">
            <div className="card-title">
              <Database size={18} color="#10b981" />
              <span>Database Engine & Architecture</span>
            </div>
            <span
              className={`badge ${diagnostics.status === 'ONLINE' ? 'badge-available' : 'badge-retired'}`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'currentColor' }} />
              {diagnostics.status}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ padding: 14, background: '#1e293b', borderRadius: 8, border: '1px solid #334155' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <HardDrive size={18} color="#34d399" />
                  <span style={{ fontWeight: 600, color: '#f8fafc' }}>
                    Active Storage Driver: {diagnostics.engine}
                  </span>
                </div>
                <span className="mono" style={{ fontSize: '0.75rem', color: '#38bdf8' }}>
                  {diagnostics.latency ? `${diagnostics.latency}ms response` : 'Live'}
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>
                Dual-engine database layer configured with MySQL schema and automatic high-concurrency SQLite fallback to guarantee zero-downtime mission operations.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 6, borderBottom: '1px solid #1e293b' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Host / Socket:</span>
                <span className="mono" style={{ color: '#f8fafc' }}>127.0.0.1:5001 (API)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 6, borderBottom: '1px solid #1e293b' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Active Schema:</span>
                <span className="mono" style={{ color: '#38bdf8' }}>military_assets_db / sqlite</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 6, borderBottom: '1px solid #1e293b' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Registered Tables:</span>
                <span className="mono" style={{ color: '#34d399' }}>9 tables (InnoDB/WAL)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 6, borderBottom: '1px solid #1e293b' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Security Cipher:</span>
                <span className="mono" style={{ color: '#cbd5e1' }}>bcrypt (cost factor 10)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Last Diagnostics Check:</span>
                <span className="mono" style={{ color: '#94a3b8' }}>{diagnostics.lastChecked || 'Initial boot'}</span>
              </div>
            </div>

            <div style={{ marginTop: 10 }}>
              <button
                type="button"
                onClick={handleManualDiagnostics}
                disabled={diagnostics.loading}
                className="btn btn-secondary btn-sm"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <RefreshCw size={14} className={diagnostics.loading ? 'radar-pulse' : ''} />
                {diagnostics.loading ? 'Pinging Infrastructure...' : 'Run Diagnostics & Latency Ping'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Admin User Provisioning Table (Visible to Admin) */}
      {isAdmin && (
        <div className="card">
          <div className="hud-corner hud-tl" />
          <div className="hud-corner hud-tr" />
          <div className="card-header">
            <div className="card-title">
              <Users size={18} color="#38bdf8" />
              <span>Operator Accounts & Role Delegation</span>
            </div>
            <button onClick={() => setIsUserModalOpen(true)} className="btn btn-primary btn-sm">
              <PlusCircle size={15} /> Provision New Account
            </button>
          </div>

          <div className="table-container">
            <table className="tactical-table">
              <thead>
                <tr>
                  <th>SERVICE ID</th>
                  <th>USERNAME</th>
                  <th>EMAIL</th>
                  <th>RANK</th>
                  <th>UNIT</th>
                  <th>ROLE</th>
                  <th>STATUS</th>
                  <th style={{ textAlign: 'right' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {loadingUsers ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: 24, color: '#38bdf8' }}>
                      Retrieving operator accounts...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: 24, color: '#64748b' }}>
                      No operator accounts cataloged.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id}>
                      <td className="mono" style={{ color: '#38bdf8', fontWeight: 600 }}>{u.service_id || `USR-${u.id}`}</td>
                      <td style={{ fontWeight: 600, color: '#f8fafc' }}>{u.username}</td>
                      <td style={{ color: '#cbd5e1' }}>{u.email}</td>
                      <td>{u.rank_title || 'N/A'}</td>
                      <td style={{ color: '#94a3b8' }}>{u.military_unit || 'Unassigned'}</td>
                      <td>
                        <span className="badge" style={{
                          backgroundColor: u.role === 'Admin' ? 'rgba(239, 68, 68, 0.2)' : u.role === 'Manager' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                          color: u.role === 'Admin' ? '#f87171' : u.role === 'Manager' ? '#fbbf24' : '#34d399'
                        }}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={u.status || 'Active'} />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-icon"
                            title="Edit Operator Clearance & Role"
                            onClick={() => handleOpenEditUser(u)}
                          >
                            <Edit3 size={14} color="#38bdf8" />
                          </button>
                          {u.id !== currentUser?.id && (
                            <button
                              type="button"
                              className="btn btn-secondary btn-icon"
                              title="Revoke Account"
                              onClick={() => setDeleteConfirm({ isOpen: true, user: u })}
                            >
                              <Trash2 size={14} color="#f87171" />
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
      )}

      {/* Provision User Modal */}
      <Modal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        title="PROVISION COMMAND OPERATOR ACCOUNT"
      >
        <form onSubmit={handleCreateUser}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. capt_reynolds"
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Military Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="reynolds@example.com"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Initial Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••••••"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Clearance Role</label>
              <select
                className="form-select"
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              >
                <option value="Staff">Staff (Standard Armory Clearance)</option>
                <option value="Manager">Manager (Logistics & Maintenance)</option>
                <option value="Admin">Admin (Full Command Control)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Rank Title</label>
              <input
                type="text"
                className="form-input"
                value={newUser.rank_title}
                onChange={(e) => setNewUser({ ...newUser, rank_title: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Unit Assignment</label>
              <input
                type="text"
                className="form-input"
                value={newUser.military_unit}
                onChange={(e) => setNewUser({ ...newUser, military_unit: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsUserModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Authorize Account
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Operator Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`EDIT CLEARANCE & PRIVILEGES: ${editingUser.username}`}
      >
        <form onSubmit={handleSaveEditUser}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Clearance Role</label>
              <select
                className="form-select"
                value={editingUser.role}
                onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
              >
                <option value="Staff">Staff (Standard Armory Clearance)</option>
                <option value="Manager">Manager (Logistics & Maintenance)</option>
                <option value="Admin">Admin (Full Command Control)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Account Status</label>
              <select
                className="form-select"
                value={editingUser.status}
                onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value })}
              >
                <option value="Active">Active Duty</option>
                <option value="Suspended">Suspended / Clearance Revoked</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Rank Title</label>
              <input
                type="text"
                className="form-input"
                value={editingUser.rank_title}
                onChange={(e) => setEditingUser({ ...editingUser, rank_title: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Unit Assignment</label>
              <input
                type="text"
                className="form-input"
                value={editingUser.military_unit}
                onChange={(e) => setEditingUser({ ...editingUser, military_unit: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Clearance Updates
            </button>
          </div>
        </form>
      </Modal>

      {/* Revocation Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, user: null })}
        onConfirm={handleConfirmDelete}
        title="REVOKE OPERATOR CREDENTIALS"
        message={`Are you sure you want to permanently revoke operator account [${deleteConfirm.user?.username}] (${deleteConfirm.user?.rank_title || 'Operator'})? This will disconnect access to all DLAMS command terminals.`}
        confirmText="Revoke Account"
        isDanger={true}
      />
    </div>
  );
}
