import React from 'react';

export default function StatusBadge({ status }) {
  if (!status) return null;

  const s = status.toLowerCase();
  let badgeClass = 'badge-available';

  if (s.includes('available') || s.includes('active') || s.includes('completed') || s.includes('ready') || s.includes('excellent')) {
    badgeClass = 'badge-available';
  } else if (s.includes('assigned') || s.includes('transit') || s.includes('standby') || s.includes('good')) {
    badgeClass = 'badge-assigned';
  } else if (s.includes('maintenance') || s.includes('pending') || s.includes('shop') || s.includes('leave') || s.includes('fair') || s.includes('calibration')) {
    badgeClass = 'badge-maintenance';
  } else if (s.includes('retired') || s.includes('critical') || s.includes('rejected') || s.includes('decommissioned') || s.includes('defective') || s.includes('suspended')) {
    badgeClass = 'badge-retired';
  }

  return (
    <span className={`badge ${badgeClass}`}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
      {status}
    </span>
  );
}
