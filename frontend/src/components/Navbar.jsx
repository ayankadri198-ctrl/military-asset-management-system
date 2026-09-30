import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  LogOut,
  User,
  Shield,
  Radio,
  ExternalLink,
  Check
} from 'lucide-react';
import { authService } from '../services/authService';
import { notificationService } from '../services/notificationService';

export default function Navbar({ onOpenMobile }) {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const notifRef = useRef(null);

  // Dynamic station and DEFCON threat posture from settings
  const [stationConfig, setStationConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('mams_system_settings');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      commandStation: 'Command Post Alpha',
      defconLevel: 'DEFCON 4'
    };
  });

  useEffect(() => {
    const handleSettingsUpdate = () => {
      try {
        const saved = localStorage.getItem('mams_system_settings');
        if (saved) setStationConfig(JSON.parse(saved));
      } catch {}
    };
    window.addEventListener('mams_settings_changed', handleSettingsUpdate);
    return () => window.removeEventListener('mams_settings_changed', handleSettingsUpdate);
  }, []);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function loadNotifications() {
    try {
      const res = await notificationService.getNotifications();
      if (res.success) {
        setNotifications(res.data.slice(0, 5));
        setUnreadCount(res.unreadCount);
      }
    } catch {
      // Ignore background notification fetch errors
    }
  }

  async function handleMarkRead(id, link) {
    try {
      await notificationService.markAsRead(id);
      loadNotifications();
      if (link) {
        setShowNotifMenu(false);
        navigate(link);
      }
    } catch {
      // Handled
    }
  }

  async function handleLogout() {
    await authService.logout();
    navigate('/login');
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/assets?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const roleColors = {
    Admin: { bg: 'rgba(239, 68, 68, 0.2)', text: '#f87171', border: '#ef4444' },
    Manager: { bg: 'rgba(245, 158, 11, 0.2)', text: '#fbbf24', border: '#f59e0b' },
    Staff: { bg: 'rgba(16, 185, 129, 0.2)', text: '#34d399', border: '#10b981' }
  };

  const roleStyle = roleColors[user?.role] || roleColors.Staff;

  return (
    <header
      style={{
        height: '68px',
        backgroundColor: '#0a0f1d',
        borderBottom: '1px solid #1e293b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 800
      }}
    >
      {/* Left: Mobile hamburger & Base Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          type="button"
          onClick={onOpenMobile}
          className="btn btn-secondary btn-icon"
          style={{ display: 'none' }}
          id="mobile-menu-btn"
        >
          <Menu size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {(() => {
            const defconMap = {
              'DEFCON 1': { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.5)', text: '#f87171' },
              'DEFCON 2': { bg: 'rgba(249, 115, 22, 0.15)', border: 'rgba(249, 115, 22, 0.5)', text: '#fb923c' },
              'DEFCON 3': { bg: 'rgba(234, 179, 8, 0.15)', border: 'rgba(234, 179, 8, 0.5)', text: '#facc15' },
              'DEFCON 4': { bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.5)', text: '#34d399' },
              'DEFCON 5': { bg: 'rgba(14, 165, 233, 0.15)', border: 'rgba(14, 165, 233, 0.5)', text: '#38bdf8' }
            };
            const currentDefcon = defconMap[stationConfig.defconLevel] || defconMap['DEFCON 4'];
            return (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 12px',
                  borderRadius: 4,
                  background: currentDefcon.bg,
                  border: `1px solid ${currentDefcon.border}`,
                  fontSize: '0.75rem',
                  color: currentDefcon.text
                }}
                className="mono"
                title="Tactical Base and Threat Readiness Posture"
              >
                <Radio size={14} className="radar-pulse" />
                <span>
                  {(stationConfig.commandStation || 'Command Post Alpha').toUpperCase()} // {stationConfig.defconLevel || 'DEFCON 4'}
                </span>
              </div>
            );
          })()}
          <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'none' }} className="d-md-block">
            {user?.military_unit || 'Joint Logistics Command'}
          </span>
        </div>
      </div>

      {/* Center: Search Bar */}
      <form onSubmit={handleSearchSubmit} style={{ flex: '0 1 400px', margin: '0 16px' }}>
        <div style={{ position: 'relative' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#64748b'
            }}
          />
          <input
            type="text"
            className="form-input"
            placeholder="Search manifests, serial numbers, gear..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              paddingLeft: 36,
              paddingTop: 8,
              paddingBottom: 8,
              fontSize: '0.85rem',
              borderRadius: 6
            }}
          />
        </div>
      </form>

      {/* Right: Notifications & User Dossier */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Notifications Dropdown */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            type="button"
            className="btn btn-secondary btn-icon"
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            style={{ position: 'relative', padding: 8 }}
            title="Operational Alerts"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: -2,
                  right: -2,
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 8px rgba(239, 68, 68, 0.8)'
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '46px',
                width: '360px',
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: 8,
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.6)',
                zIndex: 1000,
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid #1e293b',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span className="tactical-title" style={{ fontSize: '0.85rem', color: '#f8fafc' }}>
                  Alerts & Signals ({unreadCount})
                </span>
                <Link
                  to="/notifications"
                  onClick={() => setShowNotifMenu(false)}
                  style={{ fontSize: '0.75rem', color: '#38bdf8', textDecoration: 'none' }}
                >
                  View All
                </Link>
              </div>

              <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: 24, textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                    No alerts currently logged in manifest.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleMarkRead(n.id, n.link)}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid #1e293b',
                        backgroundColor: n.is_read ? 'transparent' : 'rgba(14, 165, 233, 0.06)',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                        <span style={{ fontSize: '0.825rem', fontWeight: 600, color: '#f8fafc' }}>
                          {n.title}
                        </span>
                        {!n.is_read && (
                          <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#0ea5e9' }} />
                        )}
                      </div>
                      <p style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.3, margin: 0 }}>
                        {n.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Pill */}
        <Link
          to="/profile"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '5px 12px 5px 6px',
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: 9999,
            textDecoration: 'none',
            color: 'inherit'
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: '#334155',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8'
            }}
          >
            <User size={18} />
          </div>

          <div style={{ lineHeight: 1.1 }}>
            <div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#f8fafc' }}>
              {user?.rank_title ? `${user.rank_title} ` : ''}{user?.username || 'Operator'}
            </div>
            <span
              style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                color: roleStyle.text,
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}
            >
              [{user?.role || 'Staff'}]
            </span>
          </div>
        </Link>

        {/* Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          className="btn btn-secondary btn-icon"
          title="Sign Out / Disconnect"
          style={{ padding: 8, color: '#f87171' }}
        >
          <LogOut size={18} />
        </button>
      </div>

      <style>{`
        @media (max-width: 768px) {
          #mobile-menu-btn { display: inline-flex !important; }
        }
      `}</style>
    </header>
  );
}
