import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Wrench,
  ArrowLeftRight,
  Printer,
  Shield,
  Calendar,
  MapPin,
  User,
  Barcode,
  QrCode,
  DollarSign,
  AlertTriangle,
  RefreshCw,
  Clock
} from 'lucide-react';
import { assetService } from '../services/assetService';
import StatusBadge from '../components/StatusBadge';
import { useToast } from '../components/Toast';

export default function AssetDetailsPage() {
  const { id } = useParams();
  const { addToast } = useToast();

  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAsset();
  }, [id]);

  async function loadAsset() {
    setLoading(true);
    try {
      const data = await assetService.getAssetById(id);
      setAsset(data);
    } catch (err) {
      addToast('Failed to load asset dossier: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: 12 }}>
        <RefreshCw size={24} className="radar-pulse" style={{ color: '#38bdf8' }} />
        <span>Decrypting Asset Dossier...</span>
      </div>
    );
  }

  if (!asset) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <h2>Asset Manifest Not Found</h2>
        <Link to="/assets" className="btn btn-primary" style={{ marginTop: 16 }}>
          Return to Registry
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header & Quick Action Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link to="/assets" className="btn btn-secondary btn-icon" title="Return to Registry">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 className="tactical-title" style={{ fontSize: '1.75rem', color: '#f8fafc', margin: 0 }}>
                {asset.name}
              </h1>
              <StatusBadge status={asset.status} />
            </div>
            <div className="mono" style={{ fontSize: '0.85rem', color: '#38bdf8', marginTop: 2 }}>
              REGISTRY CODE: {asset.asset_code} • SERIAL: {asset.serial_number}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handlePrint} className="btn btn-secondary btn-sm" title="Print Technical Manifest">
            <Printer size={15} /> Print Dossier
          </button>
          <Link to={`/assets/edit/${asset.id}`} className="btn btn-secondary btn-sm">
            <Edit size={15} /> Edit
          </Link>
          <Link to={`/maintenance?asset_id=${asset.id}`} className="btn btn-tactical btn-sm">
            <Wrench size={15} /> Log Maintenance
          </Link>
          <Link to={`/transfers?asset_id=${asset.id}`} className="btn btn-primary btn-sm">
            <ArrowLeftRight size={15} /> Transfer Asset
          </Link>
        </div>
      </div>

      {/* Main Dossier Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 24 }}>
        {/* Technical Specs Card */}
        <div className="card">
          <div className="hud-corner hud-tl" />
          <div className="hud-corner hud-tr" />
          <div className="card-header">
            <div className="card-title">
              <Shield size={18} color="#0ea5e9" />
              <span>Technical Specifications</span>
            </div>
            <span className="mono" style={{ fontSize: '0.75rem', color: '#64748b' }}>SPEC-01</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid #1e293b' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Asset Type:</span>
              <span style={{ fontWeight: 600, color: '#f8fafc' }}>{asset.type}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid #1e293b' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Quantity in Stock:</span>
              <span className="mono" style={{ fontWeight: 600, color: '#f8fafc' }}>{asset.quantity} units</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid #1e293b' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Current Location:</span>
              <span style={{ fontWeight: 600, color: '#38bdf8' }}>{asset.location}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid #1e293b' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Condition State:</span>
              <span style={{ fontWeight: 600, color: asset.condition_state === 'Excellent' ? '#34d399' : '#fbbf24' }}>
                {asset.condition_state}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid #1e293b' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Estimated Unit Value:</span>
              <span className="mono" style={{ fontWeight: 600, color: '#34d399' }}>
                ${Number(asset.value_usd || 0).toLocaleString()} USD
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid #1e293b' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Acquisition Date:</span>
              <span className="mono" style={{ color: '#cbd5e1' }}>{asset.purchase_date}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid #1e293b' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Last Maintenance:</span>
              <span className="mono" style={{ color: '#cbd5e1' }}>{asset.last_maintenance_date || 'N/A'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Next Maintenance Due:</span>
              <span className="mono" style={{ color: '#fbbf24', fontWeight: 600 }}>{asset.next_maintenance_date || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Custodian & Verification Dossier */}
        <div className="card">
          <div className="hud-corner hud-tl" />
          <div className="hud-corner hud-tr" />
          <div className="card-header">
            <div className="card-title">
              <User size={18} color="#10b981" />
              <span>Assigned Personnel Custody</span>
            </div>
            <span className="mono" style={{ fontSize: '0.75rem', color: '#64748b' }}>PERSONNEL</span>
          </div>

          {asset.assigned_to_name ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: '#1e293b', borderRadius: 8 }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: '#34d399',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <User size={22} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '1rem' }}>
                    {asset.assigned_to_rank} {asset.assigned_to_name}
                  </div>
                  <div className="mono" style={{ fontSize: '0.75rem', color: '#38bdf8' }}>
                    SERVICE ID: {asset.assigned_to_service_no}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 6, borderBottom: '1px solid #1e293b' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Military Unit:</span>
                  <span style={{ color: '#f8fafc', fontWeight: 500 }}>{asset.assigned_to_unit}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 6, borderBottom: '1px solid #1e293b' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Stationed Base:</span>
                  <span style={{ color: '#f8fafc', fontWeight: 500 }}>{asset.assigned_to_base}</span>
                </div>
              </div>

              {/* Barcode & Security Marker */}
              <div style={{
                marginTop: 10,
                padding: 12,
                borderRadius: 8,
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px dashed #334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div className="mono" style={{ fontSize: '0.7rem', color: '#64748b' }}>SECURITY RFID CIPHER</div>
                  <div className="mono" style={{ fontSize: '0.85rem', color: '#38bdf8', letterSpacing: '0.1em' }}>
                    |||| | |||||| | ||| |||| |
                  </div>
                </div>
                <QrCode size={36} color="#94a3b8" />
              </div>
            </div>
          ) : (
            <div style={{ padding: '30px 10px', textAlign: 'center', color: '#64748b' }}>
              <Shield size={32} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
              <p>Asset currently unassigned in central reserve depot.</p>
              <Link to={`/assets/edit/${asset.id}`} className="btn btn-secondary btn-sm" style={{ marginTop: 12 }}>
                Assign to Personnel
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {asset.description && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="hud-corner hud-tl" />
          <div className="hud-corner hud-tr" />
          <div className="card-header">
            <div className="card-title">
              <span>Operational Notes & Equipment Description</span>
            </div>
          </div>
          <p style={{ color: '#cbd5e1', lineHeight: 1.6, fontSize: '0.9rem' }}>
            {asset.description}
          </p>
        </div>
      )}

      {/* Maintenance History Table */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="hud-corner hud-tl" />
        <div className="hud-corner hud-tr" />
        <div className="card-header">
          <div className="card-title">
            <Wrench size={18} color="#f59e0b" />
            <span>Depot Maintenance Work Orders ({asset.maintenanceHistory?.length || 0})</span>
          </div>
        </div>

        <div className="table-container">
          <table className="tactical-table">
            <thead>
              <tr>
                <th>WORK ORDER #</th>
                <th>MAINTENANCE TYPE</th>
                <th>DESCRIPTION</th>
                <th>TECHNICIAN</th>
                <th>COST (USD)</th>
                <th>START DATE</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {(!asset.maintenanceHistory || asset.maintenanceHistory.length === 0) ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: '#64748b', padding: 24 }}>
                    No maintenance records logged for this asset.
                  </td>
                </tr>
              ) : (
                asset.maintenanceHistory.map((m) => (
                  <tr key={m.id}>
                    <td className="mono" style={{ color: '#38bdf8', fontWeight: 600 }}>{m.work_order_no}</td>
                    <td>{m.maintenance_type}</td>
                    <td style={{ color: '#cbd5e1' }}>{m.description}</td>
                    <td>{m.technician_name}</td>
                    <td className="mono">${Number(m.cost || 0).toLocaleString()}</td>
                    <td className="mono">{m.start_date}</td>
                    <td><StatusBadge status={m.status} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transfer History Table */}
      <div className="card">
        <div className="hud-corner hud-tl" />
        <div className="hud-corner hud-tr" />
        <div className="card-header">
          <div className="card-title">
            <ArrowLeftRight size={18} color="#38bdf8" />
            <span>Transfer & Logistics Relocation History ({asset.transferHistory?.length || 0})</span>
          </div>
        </div>

        <div className="table-container">
          <table className="tactical-table">
            <thead>
              <tr>
                <th>TRANSFER CODE</th>
                <th>ORIGIN</th>
                <th>DESTINATION</th>
                <th>TRANSFER DATE</th>
                <th>REQUESTED BY</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {(!asset.transferHistory || asset.transferHistory.length === 0) ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: '#64748b', padding: 24 }}>
                    No transfer history on record. Asset remains at original deployment base.
                  </td>
                </tr>
              ) : (
                asset.transferHistory.map((t) => (
                  <tr key={t.id}>
                    <td className="mono" style={{ color: '#38bdf8', fontWeight: 600 }}>{t.transfer_code}</td>
                    <td>{t.source_location}</td>
                    <td style={{ color: '#34d399', fontWeight: 500 }}>{t.destination_location}</td>
                    <td className="mono">{t.transfer_date}</td>
                    <td>{t.requester_name || 'Command HQ'}</td>
                    <td><StatusBadge status={t.status} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
