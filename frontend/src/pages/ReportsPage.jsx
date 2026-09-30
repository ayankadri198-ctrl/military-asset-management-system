import React, { useState, useEffect } from 'react';
import {
  FileBarChart,
  Download,
  DollarSign,
  Boxes,
  Wrench,
  Users,
  Shield,
  FileSpreadsheet,
  RefreshCw,
  Printer
} from 'lucide-react';
import { reportService } from '../services/reportService';
import { useToast } from '../components/Toast';

export default function ReportsPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    loadReport();
  }, []);

  async function loadReport() {
    setLoading(true);
    try {
      const data = await reportService.getSummary();
      setReport(data);
    } catch (err) {
      addToast('Failed to generate summary report: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  const handleExport = async (moduleName) => {
    setExporting(true);
    try {
      const res = await reportService.exportData(moduleName);
      if (res.success && res.data) {
        if (res.data.length === 0) {
          addToast('No data available to export.', 'warning');
          return;
        }

        const keys = Object.keys(res.data[0]);
        const csvRows = [
          keys.join(','),
          ...res.data.map(row => keys.map(k => `"${(row[k] || '').toString().replace(/"/g, '""')}"`).join(','))
        ];

        const csvString = 'data:text/csv;charset=utf-8,' + csvRows.join('\n');
        const encodedUri = encodeURI(csvString);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `mams_report_${moduleName}_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        addToast(`Exported ${res.count} ${moduleName} records successfully!`, 'success');
      }
    } catch (err) {
      addToast('Export failed: ' + err.message, 'error');
    } finally {
      setExporting(false);
    }
  };

  if (loading && !report) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: 12 }}>
        <RefreshCw size={24} className="radar-pulse" style={{ color: '#38bdf8' }} />
        <span>Compiling Command Intelligence Report...</span>
      </div>
    );
  }

  const { assets = {}, byType = [], byCondition = [], maintenance = {}, personnel = {}, byLocation = [] } = report || {};

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="tactical-title" style={{ fontSize: '1.75rem', color: '#f8fafc', marginBottom: 4 }}>
            INTELLIGENCE & LOGISTICS AUDIT
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Comprehensive Asset Valuation, Maintenance Spend, and Readiness Audits
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => window.print()} className="btn btn-secondary btn-sm">
            <Printer size={15} /> Print Report
          </button>
          <button onClick={loadReport} className="btn btn-secondary btn-sm">
            <RefreshCw size={15} /> Re-Calculate
          </button>
        </div>
      </div>

      {/* Export Action Center */}
      <div className="card" style={{ marginBottom: 24, borderColor: 'rgba(56, 189, 248, 0.4)' }}>
        <div className="hud-corner hud-tl" />
        <div className="hud-corner hud-tr" />
        <div className="card-header">
          <div className="card-title">
            <Download size={18} color="#38bdf8" />
            <span>Generate & Download Verified Manifest Reports</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>EXPORT ENGINES</span>
        </div>

        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <button
            onClick={() => handleExport('assets')}
            disabled={exporting}
            className="btn btn-primary btn-sm"
          >
            <FileSpreadsheet size={16} /> Export Assets Manifest (CSV)
          </button>
          <button
            onClick={() => handleExport('maintenance')}
            disabled={exporting}
            className="btn btn-tactical btn-sm"
          >
            <FileSpreadsheet size={16} /> Export Maintenance Logs (CSV)
          </button>
          <button
            onClick={() => handleExport('transfers')}
            disabled={exporting}
            className="btn btn-secondary btn-sm"
          >
            <FileSpreadsheet size={16} /> Export Transfer History (CSV)
          </button>
        </div>
      </div>

      {/* 4 Financial & Asset Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div className="card">
          <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Total Armory Valuation</span>
          <div className="mono" style={{ fontSize: '1.8rem', fontWeight: 700, color: '#34d399', marginTop: 4 }}>
            ${Number(assets.total_inventory_value || 0).toLocaleString()} USD
          </div>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Across all cataloged assets</span>
        </div>

        <div className="card">
          <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Total Maintenance Expenditure</span>
          <div className="mono" style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fbbf24', marginTop: 4 }}>
            ${Number(maintenance.total_maintenance_spent || 0).toLocaleString()} USD
          </div>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{maintenance.total_orders || 0} total work orders</span>
        </div>

        <div className="card">
          <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Asset Availability Ratio</span>
          <div className="mono" style={{ fontSize: '1.8rem', fontWeight: 700, color: '#38bdf8', marginTop: 4 }}>
            {assets.total_assets ? Math.round(((assets.available_count || 0) / assets.total_assets) * 100) : 0}%
          </div>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{assets.available_count || 0} available of {assets.total_assets || 0}</span>
        </div>

        <div className="card">
          <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Force Deployment Rate</span>
          <div className="mono" style={{ fontSize: '1.8rem', fontWeight: 700, color: '#60a5fa', marginTop: 4 }}>
            {personnel.total_personnel ? Math.round(((personnel.deployed_count || 0) / personnel.total_personnel) * 100) : 0}%
          </div>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{personnel.deployed_count || 0} deployed units</span>
        </div>
      </div>

      {/* Summary Breakdowns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20 }}>
        {/* Category Breakdown Table */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Boxes size={18} color="#0ea5e9" />
              <span>Valuation by Asset Category</span>
            </div>
          </div>

          <div className="table-container">
            <table className="tactical-table">
              <thead>
                <tr>
                  <th>CATEGORY</th>
                  <th>ITEMS</th>
                  <th style={{ textAlign: 'right' }}>VALUATION (USD)</th>
                </tr>
              </thead>
              <tbody>
                {byType.map((t, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600, color: '#f8fafc' }}>{t.type}</td>
                    <td className="mono">{t.count}</td>
                    <td className="mono" style={{ textAlign: 'right', color: '#34d399' }}>
                      ${Number(t.total_value || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Location Breakdown Table */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Shield size={18} color="#10b981" />
              <span>Asset Distribution by Military Base / Depot</span>
            </div>
          </div>

          <div className="table-container">
            <table className="tactical-table">
              <thead>
                <tr>
                  <th>BASE / DEPOT LOCATION</th>
                  <th style={{ textAlign: 'right' }}>ASSETS ASSIGNED</th>
                </tr>
              </thead>
              <tbody>
                {byLocation.map((loc, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 500, color: '#f8fafc' }}>{loc.location}</td>
                    <td className="mono" style={{ textAlign: 'right', fontWeight: 600, color: '#38bdf8' }}>
                      {loc.count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
