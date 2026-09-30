import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Search, AlertTriangle, CheckCircle, RefreshCw, PlusCircle, Layers } from 'lucide-react';
import { assetService } from '../services/assetService';
import StatusBadge from '../components/StatusBadge';
import { useToast } from '../components/Toast';

export default function InventoryListPage() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const { addToast } = useToast();

  useEffect(() => {
    loadInventory();
  }, [category]);

  async function loadInventory() {
    setLoading(true);
    try {
      const res = await assetService.getAssets({ search, type: category, limit: 200 });
      if (res.success) {
        setAssets(res.data);
      }
    } catch (err) {
      addToast('Failed to load inventory: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  const filtered = assets.filter((a) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return a.name.toLowerCase().includes(s) || a.asset_code.toLowerCase().includes(s) || a.location.toLowerCase().includes(s);
  });

  const totalStockCount = filtered.reduce((acc, curr) => acc + (curr.quantity || 1), 0);
  const lowStockCount = filtered.filter((a) => (a.quantity || 1) <= 2).length;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="tactical-title" style={{ fontSize: '1.75rem', color: '#f8fafc', marginBottom: 4 }}>
            ARMORY INVENTORY MANIFEST
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Stock Levels, Batch Allocations, and Depletion Threshold Monitoring
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={loadInventory} className="btn btn-secondary btn-sm">
            <RefreshCw size={15} /> Refresh Stock
          </button>
          <Link to="/assets/new" className="btn btn-primary btn-sm">
            <PlusCircle size={15} /> Intake New Batch
          </Link>
        </div>
      </div>

      {/* Quick Stock Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div className="card" style={{ borderColor: 'rgba(14, 165, 233, 0.4)' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Total Physical Units</span>
          <div className="mono" style={{ fontSize: '2rem', fontWeight: 700, color: '#38bdf8', marginTop: 4 }}>
            {totalStockCount}
          </div>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Across all military depots</span>
        </div>

        <div className="card" style={{ borderColor: 'rgba(16, 185, 129, 0.4)' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Cataloged SKUs / Items</span>
          <div className="mono" style={{ fontSize: '2rem', fontWeight: 700, color: '#34d399', marginTop: 4 }}>
            {filtered.length}
          </div>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Active equipment models</span>
        </div>

        <div className="card" style={{ borderColor: 'rgba(245, 158, 11, 0.4)' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Low Stock Alert (≤ 2)</span>
          <div className="mono" style={{ fontSize: '2rem', fontWeight: 700, color: '#fbbf24', marginTop: 4 }}>
            {lowStockCount}
          </div>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Reorder replenishment warning</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: 20, padding: 16 }}>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 240px' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Filter by asset name, code, storage location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 36, fontSize: '0.85rem' }}
            />
          </div>

          <div style={{ flex: '0 1 200px' }}>
            <select
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ fontSize: '0.85rem' }}
            >
              <option value="">All Categories</option>
              <option value="Vehicle">Vehicle</option>
              <option value="Weapon">Weapon</option>
              <option value="Communication">Communication</option>
              <option value="Optics">Optics</option>
              <option value="Heavy Equipment">Heavy Equipment</option>
              <option value="Surveillance">Surveillance</option>
              <option value="Medical Gear">Medical Gear</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="tactical-table">
            <thead>
              <tr>
                <th>CODE</th>
                <th>ITEM NAME</th>
                <th>CATEGORY</th>
                <th>LOCATION</th>
                <th>STOCK LEVEL</th>
                <th>STOCK STATUS</th>
                <th>CONDITION</th>
                <th>STATUS</th>
                <th style={{ textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: 40, color: '#38bdf8' }}>
                    Scanning depot stores...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
                    No inventory records found.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const qty = item.quantity || 1;
                  const isLow = qty <= 2;
                  return (
                    <tr key={item.id}>
                      <td className="mono" style={{ color: '#38bdf8', fontWeight: 600 }}>{item.asset_code}</td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#f8fafc' }}>{item.name}</div>
                        <div className="mono" style={{ fontSize: '0.75rem', color: '#64748b' }}>SN: {item.serial_number}</div>
                      </td>
                      <td>{item.type}</td>
                      <td style={{ color: '#cbd5e1' }}>{item.location}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span className="mono" style={{ fontWeight: 700, fontSize: '0.95rem' }}>{qty}</span>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>units</span>
                        </div>
                      </td>
                      <td>
                        {isLow ? (
                          <span className="badge badge-maintenance">
                            <AlertTriangle size={12} /> Low Reserve
                          </span>
                        ) : (
                          <span className="badge badge-available">
                            <CheckCircle size={12} /> Optimal
                          </span>
                        )}
                      </td>
                      <td>{item.condition_state}</td>
                      <td><StatusBadge status={item.status} /></td>
                      <td style={{ textAlign: 'right' }}>
                        <Link to={`/assets/${item.id}`} className="btn btn-secondary btn-sm">
                          Inspect
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
