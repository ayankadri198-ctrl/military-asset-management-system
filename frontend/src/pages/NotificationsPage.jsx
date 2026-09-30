import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  AlertTriangle,
  Info,
  CheckCircle,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { notificationService } from '../services/notificationService';
import { useToast } from '../components/Toast';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterUnread, setFilterUnread] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    setLoading(true);
    try {
      const res = await notificationService.getNotifications();
      if (res.success) {
        setNotifications(res.data);
      }
    } catch (err) {
      addToast('Failed to load notifications: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  const handleMarkRead = async (id, link) => {
    try {
      await notificationService.markAsRead(id);
      loadNotifications();
      if (link) navigate(link);
    } catch {
      // Ignored
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      addToast('All operational alerts marked as read.', 'success');
      loadNotifications();
    } catch (err) {
      addToast('Failed to clear alerts: ' + err.message, 'error');
    }
  };

  const filtered = filterUnread ? notifications.filter(n => !n.is_read) : notifications;

  const getTypeIcon = (type) => {
    switch (type) {
      case 'critical': return <AlertTriangle size={18} color="#ef4444" />;
      case 'warning': return <AlertTriangle size={18} color="#f59e0b" />;
      case 'success': return <CheckCircle size={18} color="#10b981" />;
      default: return <Info size={18} color="#0ea5e9" />;
    }
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="tactical-title" style={{ fontSize: '1.75rem', color: '#f8fafc', marginBottom: 4 }}>
            COMMUNICATIONS & SIGNALS LOG
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            System Alerts, Requisition Warnings, and Maintenance Schedules
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={loadNotifications} className="btn btn-secondary btn-sm">
            <RefreshCw size={15} /> Refresh
          </button>
          <button onClick={handleMarkAllRead} className="btn btn-primary btn-sm">
            <CheckCheck size={15} /> Mark All as Read
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <button
          className={`btn btn-sm ${!filterUnread ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setFilterUnread(false)}
        >
          All Signals ({notifications.length})
        </button>
        <button
          className={`btn btn-sm ${filterUnread ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setFilterUnread(true)}
        >
          Unread Only ({notifications.filter(n => !n.is_read).length})
        </button>
      </div>

      {/* Notification Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {loading ? (
          <div className="card" style={{ textAlign: 'center', padding: 40, color: '#38bdf8' }}>
            <RefreshCw size={24} className="radar-pulse" style={{ margin: '0 auto 10px' }} />
            Receiving signals...
          </div>
        ) : filtered.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
            No alerts or notifications recorded.
          </div>
        ) : (
          filtered.map((n) => (
            <div
              key={n.id}
              className="card"
              onClick={() => handleMarkRead(n.id, n.link)}
              style={{
                cursor: 'pointer',
                borderColor: !n.is_read ? 'rgba(56, 189, 248, 0.5)' : '#334155',
                backgroundColor: !n.is_read ? 'rgba(15, 23, 42, 0.95)' : 'var(--bg-card)',
                padding: '18px 22px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14 }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{ marginTop: 2 }}>{getTypeIcon(n.type)}</div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.95rem' }}>
                        {n.title}
                      </span>
                      {!n.is_read && (
                        <span className="badge" style={{ backgroundColor: 'rgba(14, 165, 233, 0.2)', color: '#38bdf8' }}>
                          NEW
                        </span>
                      )}
                    </div>
                    <p style={{ color: '#cbd5e1', fontSize: '0.875rem', lineHeight: 1.4, margin: 0 }}>
                      {n.message}
                    </p>
                    <div className="mono" style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 8 }}>
                      SIGNAL RECEIVED: {n.created_at || 'Just now'}
                    </div>
                  </div>
                </div>

                {n.link && (
                  <div style={{ color: '#38bdf8', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                    Inspect <ExternalLink size={14} />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
