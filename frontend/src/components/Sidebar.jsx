import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShieldAlert,
  Boxes,
  PlusCircle,
  Package,
  Users,
  Truck,
  Crosshair,
  Wrench,
  ArrowLeftRight,
  FileBarChart,
  Bell,
  UserCheck,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function Sidebar({ isCollapsed, onToggleCollapse, isMobileOpen, onCloseMobile }) {
  const navSections = [
    {
      title: 'Command & Assets',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Asset Management', path: '/assets', icon: Boxes },
        { label: 'Add Asset', path: '/assets/new', icon: PlusCircle },
        { label: 'Inventory List', path: '/inventory', icon: Package }
      ]
    },
    {
      title: 'Force & Fleet',
      items: [
        { label: 'Personnel', path: '/personnel', icon: Users },
        { label: 'Vehicles', path: '/vehicles', icon: Truck },
        { label: 'Equipment', path: '/equipment', icon: Crosshair }
      ]
    },
    {
      title: 'Logistics Operations',
      items: [
        { label: 'Maintenance', path: '/maintenance', icon: Wrench },
        { label: 'Asset Transfer', path: '/transfers', icon: ArrowLeftRight },
        { label: 'Reports', path: '/reports', icon: FileBarChart }
      ]
    },
    {
      title: 'HQ System',
      items: [
        { label: 'Notifications', path: '/notifications', icon: Bell },
        { label: 'User Profile', path: '/profile', icon: UserCheck },
        { label: 'Settings', path: '/settings', icon: Settings }
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 900
          }}
        />
      )}

      <aside
        style={{
          width: isCollapsed ? '76px' : '260px',
          transition: 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform 0.25s ease',
          backgroundColor: '#0a0f1d',
          borderRight: '1px solid #1e293b',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 950,
          position: isMobileOpen ? 'fixed' : 'sticky',
          top: 0,
          left: 0,
          bottom: 0,
          height: '100vh',
          transform: isMobileOpen ? 'translateX(0)' : undefined
        }}
      >
        {/* Brand / Logo */}
        <div
          style={{
            height: '68px',
            display: 'flex',
            alignItems: 'center',
            padding: '0 20px',
            borderBottom: '1px solid #1e293b',
            gap: 12
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #059669, #0284c7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 0 15px rgba(16, 185, 129, 0.35)',
              flexShrink: 0
            }}
          >
            <Shield size={20} />
          </div>

          {!isCollapsed && (
            <div style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
              <div className="tactical-title" style={{ fontSize: '1rem', color: '#f8fafc', lineHeight: 1.2 }}>
                DLAMS COMMAND
              </div>
              <div style={{ fontSize: '0.7rem', color: '#38bdf8', letterSpacing: '0.05em' }} className="mono">
                DEFENSE LOGISTICS HQ
              </div>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 10px',
            display: 'flex',
            flexDirection: 'column',
            gap: 20
          }}
        >
          {navSections.map((section, idx) => (
            <div key={idx}>
              {!isCollapsed && (
                <div
                  style={{
                    fontSize: '0.675rem',
                    textTransform: 'uppercase',
                    color: '#64748b',
                    padding: '0 12px 6px',
                    fontWeight: 700,
                    letterSpacing: '0.08em'
                  }}
                >
                  {section.title}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => onCloseMobile && onCloseMobile()}
                      style={({ isActive }) => ({
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: isCollapsed ? '10px 0' : '9px 14px',
                        justifyContent: isCollapsed ? 'center' : 'flex-start',
                        borderRadius: 6,
                        textDecoration: 'none',
                        fontSize: '0.85rem',
                        fontWeight: isActive ? 600 : 500,
                        color: isActive ? '#38bdf8' : '#94a3b8',
                        backgroundColor: isActive ? 'rgba(14, 165, 233, 0.12)' : 'transparent',
                        borderLeft: isActive ? '3px solid #38bdf8' : '3px solid transparent',
                        transition: 'all 0.15s ease'
                      })}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <Icon size={18} style={{ flexShrink: 0 }} />
                      {!isCollapsed && (
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.label}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Collapse Toggle Footer */}
        <div
          style={{
            padding: 12,
            borderTop: '1px solid #1e293b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'space-between'
          }}
        >
          {!isCollapsed && (
            <div style={{ fontSize: '0.725rem', color: '#64748b' }}>
              DEFENSE OPS v2.4
            </div>
          )}
          <button
            type="button"
            onClick={onToggleCollapse}
            className="btn btn-secondary btn-icon"
            style={{ padding: 6 }}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      </aside>
    </>
  );
}
