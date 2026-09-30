import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Boxes,
  Search,
  Filter,
  PlusCircle,
  Eye,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  SlidersHorizontal,
  FileSpreadsheet
} from 'lucide-react';
import { assetService } from '../services/assetService';
import StatusBadge from '../components/StatusBadge';
import Pagination from '../components/Pagination';
import ConfirmDialog from '../components/ConfirmDialog';
import { useToast } from '../components/Toast';

export default function AssetManagementPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToast } = useToast();

  const [assets, setAssets] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Filters state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [type, setType] = useState(searchParams.get('type') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Delete modal state
  const [deleteId, setDeleteId] = useState(null);
  const [deleteCode, setDeleteCode] = useState('');

  useEffect(() => {
    fetchAssets();
  }, [page, type, status, location]);

  async function fetchAssets(overrideSearch = search) {
    setLoading(true);
    try {
      const res = await assetService.getAssets({
        search: overrideSearch,
        type,
        status,
        location,
        page,
        limit
      });
      if (res.success) {
        setAssets(res.data);
        setTotalItems(res.meta.total);
        setTotalPages(res.meta.totalPages);
      }
    } catch (err) {
      addToast('Failed to retrieve asset manifests: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchAssets(search);
  };

  const handleResetFilters = () => {
    setSearch('');
    setType('');
    setStatus('');
    setLocation('');
    setPage(1);
    fetchAssets('');
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await assetService.deleteAsset(deleteId);
      addToast(res.message || 'Asset decommissioned.', 'success');
      fetchAssets();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete asset.', 'error');
    } finally {
      setDeleteId(null);
      setDeleteCode('');
    }
  };

  const handleExportCSV = () => {
    if (assets.length === 0) {
      addToast('No assets available to export.', 'warning');
      return;
    }
    const headers = ['Asset Code', 'Name', 'Type', 'Serial Number', 'Quantity', 'Status', 'Location', 'Assigned To', 'Purchase Date', 'Estimated Value USD'];
    const rows = assets.map(a => [
      a.asset_code,
      `"${a.name.replace(/"/g, '""')}"`,
      a.type,
      a.serial_number,
      a.quantity,
      a.status,
      `"${a.location}"`,
      `"${a.assigned_to_name || 'Unassigned'}"`,
      a.purchase_date,
      a.value_usd
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `mams_assets_manifest_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Asset manifest CSV exported.', 'success');
  };

  return (
    <div>
      {/* Title Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="tactical-title" style={{ fontSize: '1.75rem', color: '#f8fafc', marginBottom: 4 }}>
            ASSET MANAGEMENT REGISTRY
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Comprehensive Inventory, Armory Master Catalog & Custody Records
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handleExportCSV} className="btn btn-secondary btn-sm">
            <Download size={15} /> Export CSV
          </button>
          <button onClick={() => fetchAssets()} className="btn btn-secondary btn-sm" title="Refresh">
            <RefreshCw size={15} /> Refresh
          </button>
          <Link to="/assets/new" className="btn btn-primary btn-sm">
            <PlusCircle size={15} /> Add New Asset
          </Link>
        </div>
      </div>

      {/* Filter Toolbar Card */}
      <div className="card" style={{ marginBottom: 20, padding: 18 }}>
        <form onSubmit={handleSearchSubmit}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 12,
            alignItems: 'flex-end'
          }}>
            <div>
              <label className="form-label">Search Query</label>
              <div style={{ position: 'relative' }}>
                <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Code, name, serial..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ paddingLeft: 32, fontSize: '0.85rem' }}
                />
              </div>
            </div>

            <div>
              <label className="form-label">Asset Type</label>
              <select className="form-select" value={type} onChange={(e) => { setType(e.target.value); setPage(1); }} style={{ fontSize: '0.85rem' }}>
                <option value="">All Types</option>
                <option value="Vehicle">Vehicle</option>
                <option value="Weapon">Weapon</option>
                <option value="Communication">Communication</option>
                <option value="Optics">Optics</option>
                <option value="Heavy Equipment">Heavy Equipment</option>
                <option value="Surveillance">Surveillance</option>
                <option value="Medical Gear">Medical Gear</option>
              </select>
            </div>

            <div>
              <label className="form-label">Status</label>
              <select className="form-select" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} style={{ fontSize: '0.85rem' }}>
                <option value="">All Statuses</option>
                <option value="Available">Available</option>
                <option value="Assigned">Assigned</option>
                <option value="Under Maintenance">Under Maintenance</option>
                <option value="Retired">Retired</option>
              </select>
            </div>

            <div>
              <label className="form-label">Location</label>
              <input
                type="text"
                className="form-input"
                placeholder="Armory, Motor Pool..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                style={{ fontSize: '0.85rem' }}
              />
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                <Search size={15} /> Search
              </button>
              <button type="button" onClick={handleResetFilters} className="btn btn-secondary btn-sm">
                Reset
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Assets Master Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="tactical-table">
            <thead>
              <tr>
                <th>ASSET CODE</th>
                <th>ASSET NAME</th>
                <th>TYPE</th>
                <th>SERIAL NO</th>
                <th>QTY</th>
                <th>STATUS</th>
                <th>LOCATION</th>
                <th>ASSIGNED TO</th>
                <th style={{ textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: 40, color: '#38bdf8' }}>
                    <RefreshCw size={24} className="radar-pulse" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 8 }} />
                    Scanning Armory Manifests...
                  </td>
                </tr>
              ) : assets.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
                    No military assets found matching current criteria.
                  </td>
                </tr>
              ) : (
                assets.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <span className="mono" style={{ color: '#38bdf8', fontWeight: 600 }}>
                        {a.asset_code}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#f8fafc' }}>{a.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Cond: <span style={{ color: '#94a3b8' }}>{a.condition_state}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ color: '#cbd5e1' }}>{a.type}</span>
                    </td>
                    <td className="mono" style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                      {a.serial_number}
                    </td>
                    <td>
                      <span className="mono" style={{ fontWeight: 600 }}>{a.quantity}</span>
                    </td>
                    <td>
                      <StatusBadge status={a.status} />
                    </td>
                    <td style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>
                      {a.location}
                    </td>
                    <td>
                      {a.assigned_to_name ? (
                        <div>
                          <div style={{ fontSize: '0.825rem', color: '#f8fafc', fontWeight: 500 }}>
                            {a.assigned_to_rank ? `${a.assigned_to_rank} ` : ''}{a.assigned_to_name}
                          </div>
                          <div className="mono" style={{ fontSize: '0.7rem', color: '#64748b' }}>
                            {a.assigned_to_service_no}
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: '#64748b', fontSize: '0.8rem', fontStyle: 'italic' }}>
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <Link
                          to={`/assets/${a.id}`}
                          className="btn btn-secondary btn-icon"
                          title="View Technical Details"
                          style={{ padding: 6 }}
                        >
                          <Eye size={15} color="#38bdf8" />
                        </Link>
                        <Link
                          to={`/assets/edit/${a.id}`}
                          className="btn btn-secondary btn-icon"
                          title="Edit Asset"
                          style={{ padding: 6 }}
                        >
                          <Edit size={15} color="#34d399" />
                        </Link>
                        <button
                          type="button"
                          className="btn btn-secondary btn-icon"
                          title="Decommission Asset"
                          style={{ padding: 6 }}
                          onClick={() => {
                            setDeleteId(a.id);
                            setDeleteCode(a.asset_code);
                          }}
                        >
                          <Trash2 size={15} color="#f87171" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div style={{ padding: '0 16px' }}>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(newPage) => setPage(newPage)}
            totalItems={totalItems}
            limit={limit}
          />
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        onClose={() => { setDeleteId(null); setDeleteCode(''); }}
        onConfirm={handleConfirmDelete}
        title="Decommission Military Asset"
        message={`Are you sure you want to permanently decommission and remove asset [${deleteCode}] from active armory registries?`}
        confirmText="Confirm Decommission"
        isDanger={true}
      />
    </div>
  );
}
