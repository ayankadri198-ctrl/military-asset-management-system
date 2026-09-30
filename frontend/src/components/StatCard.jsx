import React from 'react';

export default function StatCard({ title, value, icon: Icon, color = 'emerald', subtext, trend }) {
  const colorMap = {
    emerald: { text: '#34d399', bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.3)' },
    cyan: { text: '#38bdf8', bg: 'rgba(14, 165, 233, 0.12)', border: 'rgba(14, 165, 233, 0.3)' },
    amber: { text: '#fbbf24', bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.3)' },
    red: { text: '#f87171', bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.3)' },
    blue: { text: '#60a5fa', bg: 'rgba(59, 130, 246, 0.12)', border: 'rgba(59, 130, 246, 0.3)' }
  };

  const scheme = colorMap[color] || colorMap.emerald;

  return (
    <div className="card" style={{ borderColor: scheme.border }}>
      <div className="hud-corner hud-tl" />
      <div className="hud-corner hud-tr" />
      <div className="hud-corner hud-bl" />
      <div className="hud-corner hud-br" />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {title}
          </span>
          <div className="mono" style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>
            {value}
          </div>
        </div>
        {Icon && (
          <div style={{
            padding: 12,
            borderRadius: 8,
            backgroundColor: scheme.bg,
            color: scheme.text,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Icon size={24} />
          </div>
        )}
      </div>

      {(subtext || trend) && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <span>{subtext}</span>
          {trend && <span style={{ color: scheme.text, fontWeight: 600 }}>{trend}</span>}
        </div>
      )}
    </div>
  );
}
