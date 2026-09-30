import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ currentPage, totalPages, onPageChange, totalItems, limit }) {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalItems);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 4px',
      fontSize: '0.85rem',
      color: 'var(--text-secondary)'
    }}>
      <div>
        Showing <span className="mono" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{startItem}</span> to{' '}
        <span className="mono" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{endItem}</span> of{' '}
        <span className="mono" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{totalItems}</span> manifests
      </div>

      <div style={{ display: 'flex', gap: 6 }}>
        <button
          className="btn btn-secondary btn-sm"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          style={{ opacity: currentPage === 1 ? 0.4 : 1 }}
        >
          <ChevronLeft size={16} /> Prev
        </button>

        <span style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px',
          background: 'var(--bg-input)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-color)',
          fontSize: '0.8rem',
          fontFamily: 'var(--font-mono)'
        }}>
          {currentPage} / {totalPages}
        </span>

        <button
          className="btn btn-secondary btn-sm"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          style={{ opacity: currentPage === totalPages ? 0.4 : 1 }}
        >
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
