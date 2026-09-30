import React, { useState, useEffect } from 'react';
import {
  User,
  Shield,
  KeyRound,
  Lock,
  Mail,
  Award,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { authService } from '../services/authService';
import { useToast } from '../components/Toast';

export default function UserProfilePage() {
  const { addToast } = useToast();
  const [user, setUser] = useState(authService.getCurrentUser());

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    refreshUser();
  }, []);

  async function refreshUser() {
    try {
      const fresh = await authService.getMe();
      setUser(fresh);
    } catch {
      // Ignored
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      addToast('New password confirmation does not match.', 'error');
      return;
    }

    if (newPassword.length < 6) {
      addToast('New password must be at least 6 characters.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.changePassword(currentPassword, newPassword);
      addToast(res.message || 'Access cipher updated successfully.', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      addToast(err.response?.data?.message || 'Password update failed: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const permissions = {
    Admin: [
      'Full Administrative System Control',
      'Create / Decommission Assets',
      'Manage User Accounts & Permissions',
      'Approve Military Asset Transfers',
      'Export Classified Audit Manifests'
    ],
    Manager: [
      'Asset Cataloging & Equipment Modification',
      'Manage Personnel Rosters',
      'Log & Schedule Depot Maintenance',
      'Initiate & Authorize Asset Transfers',
      'View Operational Analytics Reports'
    ],
    Staff: [
      'View Armory Master Inventory',
      'Submit Transfer Requisitions',
      'Log Maintenance Work Orders',
      'Check Equipment Calibration States',
      'View Assigned Custody Dossiers'
    ]
  };

  const userPerms = permissions[user?.role] || permissions.Staff;

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 className="tactical-title" style={{ fontSize: '1.75rem', color: '#f8fafc', marginBottom: 4 }}>
          OPERATOR DOSSIER & PROFILE
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Security Credentials, Clearance Matrix & Authentication Settings
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {/* Profile Card */}
        <div className="card">
          <div className="hud-corner hud-tl" />
          <div className="hud-corner hud-tr" />
          <div className="card-header">
            <div className="card-title">
              <User size={18} color="#0ea5e9" />
              <span>Identity & Commission</span>
            </div>
            <span className="mono" style={{ fontSize: '0.75rem', color: '#38bdf8' }}>
              [{user?.role?.toUpperCase()}]
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #059669, #0284c7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '1.4rem',
              fontWeight: 700
            }}>
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>
                {user?.rank_title} {user?.username}
              </div>
              <div className="mono" style={{ fontSize: '0.8rem', color: '#38bdf8' }}>
                SERVICE ID: {user?.service_id || 'HQ-001'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid #1e293b' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Email Address:</span>
              <span style={{ color: '#f8fafc' }}>{user?.email}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid #1e293b' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Military Unit:</span>
              <span style={{ color: '#f8fafc' }}>{user?.military_unit}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid #1e293b' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Security Role:</span>
              <span style={{ fontWeight: 600, color: user?.role === 'Admin' ? '#f87171' : user?.role === 'Manager' ? '#fbbf24' : '#34d399' }}>
                {user?.role}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Status:</span>
              <span className="badge badge-available">Active Duty</span>
            </div>
          </div>

          {/* Permissions Matrix */}
          <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #1e293b' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 10 }}>
              Authorized Clearance Privileges
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {userPerms.map((p, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.825rem', color: '#cbd5e1' }}>
                  <CheckCircle2 size={14} color="#34d399" />
                  <span>{p}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="card">
          <div className="hud-corner hud-tl" />
          <div className="hud-corner hud-tr" />
          <div className="card-header">
            <div className="card-title">
              <KeyRound size={18} color="#f59e0b" />
              <span>Update Access Cipher</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>SECURITY ENCRYPTION</span>
          </div>

          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label className="form-label">Current Access Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  style={{ paddingLeft: 36 }}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">New Password Cipher</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ paddingLeft: 36 }}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ paddingLeft: 36 }}
                  required
                />
              </div>
            </div>

            <div style={{ marginTop: 24 }}>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Re-encrypting Credentials...' : 'Update Password Cipher'}
              </button>
            </div>
          </form>

          <div style={{ marginTop: 20, padding: 12, borderRadius: 6, background: 'rgba(14, 165, 233, 0.08)', border: '1px solid rgba(14, 165, 233, 0.2)' }}>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>
              <strong>Password Policy:</strong> Ciphers must contain at least 6 characters and are hashed with bcrypt (cost factor 10) prior to storage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
