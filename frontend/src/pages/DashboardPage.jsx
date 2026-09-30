import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Boxes,
  CheckCircle,
  Clock,
  Wrench,
  Users,
  Truck,
  DollarSign,
  TrendingUp,
  Activity,
  ArrowRight,
  PlusCircle,
  FileText,
  ArrowLeftRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import { dashboardService } from '../services/dashboardService';
import { useToast } from '../components/Toast';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    setLoading(true);
    try {
      const res = await dashboardService.getStats();
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      addToast('Failed to load dashboard metrics: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  // Tactical Palette for Charts
  const STATUS_COLORS = {
    'Available': '#10b981',
    'Assigned': '#0ea5e9',
    'Under Maintenance': '#f59e0b',
    'Retired': '#ef4444'
  };

  const CATEGORY_COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#64748b'];

  if (loading && !data) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 16 }}>
        <RefreshCw size={36} className="radar-pulse" style={{ color: '#38bdf8' }} />
        <span className="tactical-title" style={{ color: '#94a3b8' }}>INITIALIZING COMMAND RADAR...</span>
      </div>
    );
  }

  const { stats = {}, charts = {}, recentActivities = [] } = data || {};

  return (
    <div>
      {/* Top Banner & Quick Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="tactical-title" style={{ fontSize: '1.75rem', color: '#f8fafc', marginBottom: 4 }}>
            COMMAND OPERATIONS OVERVIEW
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Tactical Asset Readiness, Armory Logistics, and Maintenance Surveillance
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={fetchStats} className="btn btn-secondary btn-sm" title="Refresh Live Feeds">
            <RefreshCw size={15} /> Refresh Data
          </button>
          <Link to="/assets/new" className="btn btn-primary btn-sm">
            <PlusCircle size={15} /> Add New Asset
          </Link>
          <Link to="/transfers" className="btn btn-tactical btn-sm">
            <ArrowLeftRight size={15} /> Transfer Asset
          </Link>
        </div>
      </div>

      {/* 6 Core Stat KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: 16,
        marginBottom: 24
      }}>
        <StatCard
          title="Total Assets"
          value={stats.totalAssets || 0}
          icon={Boxes}
          color="cyan"
          subtext="Cataloged armory equipment"
        />
        <StatCard
          title="Available Assets"
          value={stats.availableAssets || 0}
          icon={CheckCircle}
          color="emerald"
          subtext="Ready for mission issue"
        />
        <StatCard
          title="Assigned Assets"
          value={stats.assignedAssets || 0}
          icon={Clock}
          color="blue"
          subtext="Field deployed / in-use"
        />
        <StatCard
          title="Under Maintenance"
          value={stats.underMaintenance || 0}
          icon={Wrench}
          color="amber"
          subtext="Work orders in depot shop"
        />
        <StatCard
          title="Total Personnel"
          value={stats.totalPersonnel || 0}
          icon={Users}
          color="cyan"
          subtext={`${stats.activePersonnel || 0} active service units`}
        />
        <StatCard
          title="Total Vehicles"
          value={stats.totalVehicles || 0}
          icon={Truck}
          color="emerald"
          subtext={`${stats.readyVehicles || 0} mission ready`}
        />
      </div>

      {/* 4 Interactive Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: 20, marginBottom: 24 }}>
        {/* Chart 1: Asset Status (Donut Chart) */}
        <div className="card">
          <div className="hud-corner hud-tl" />
          <div className="hud-corner hud-tr" />
          <div className="card-header">
            <div className="card-title">
              <Activity size={18} color="#0ea5e9" />
              <span>Asset Operational Status</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>READINESS RATIO</span>
          </div>

          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.assetStatus || []}
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={5}
                  dataKey="value"
                  nameKey="name"
                >
                  {(charts.assetStatus || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, color: '#f8fafc' }}
                  itemStyle={{ color: '#38bdf8' }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(val) => <span style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Asset Categories (Bar Chart) */}
        <div className="card">
          <div className="hud-corner hud-tl" />
          <div className="hud-corner hud-tr" />
          <div className="card-header">
            <div className="card-title">
              <Boxes size={18} color="#10b981" />
              <span>Asset Categories Breakdown</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>UNIT DENSITY</span>
          </div>

          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.assetCategories || []} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} angle={-25} textAnchor="end" />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, color: '#f8fafc' }}
                  itemStyle={{ color: '#34d399' }}
                />
                <Bar dataKey="count" fill="#059669" radius={[4, 4, 0, 0]} name="Units Count">
                  {(charts.assetCategories || []).map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Maintenance Status */}
        <div className="card">
          <div className="hud-corner hud-tl" />
          <div className="hud-corner hud-tr" />
          <div className="card-header">
            <div className="card-title">
              <Wrench size={18} color="#f59e0b" />
              <span>Depot Maintenance Work Orders</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>INSPECTIONS & REPAIRS</span>
          </div>

          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.maintenanceStatus || []} layout="vertical" margin={{ top: 10, right: 20, left: 30, bottom: 10 }}>
                <XAxis type="number" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" stroke="#cbd5e1" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, color: '#f8fafc' }}
                />
                <Bar dataKey="count" fill="#d97706" radius={[0, 4, 4, 0]} name="Work Orders" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Monthly Asset Logistics Trend */}
        <div className="card">
          <div className="hud-corner hud-tl" />
          <div className="hud-corner hud-tr" />
          <div className="card-header">
            <div className="card-title">
              <TrendingUp size={18} color="#38bdf8" />
              <span>Monthly Asset Activity</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>6-MONTH RADAR</span>
          </div>

          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.monthlyActivity || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAcq" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorTrans" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8 }} />
                <Legend verticalAlign="top" height={30} />
                <Area type="monotone" dataKey="acquisitions" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorAcq)" name="Acquisitions" />
                <Area type="monotone" dataKey="transfers" stroke="#10b981" fillOpacity={1} fill="url(#colorTrans)" name="Transfers" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activities Section */}
      <div className="card">
        <div className="hud-corner hud-tl" />
        <div className="hud-corner hud-tr" />
        <div className="card-header">
          <div className="card-title">
            <Activity size={18} color="#38bdf8" />
            <span>Recent Command Activities & Log Manifest</span>
          </div>
          <Link to="/reports" style={{ fontSize: '0.8rem', color: '#38bdf8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
            View Full Audit Logs <ArrowRight size={14} />
          </Link>
        </div>

        <div className="table-container">
          <table className="tactical-table">
            <thead>
              <tr>
                <th>TIMESTAMP</th>
                <th>OPERATOR</th>
                <th>MODULE</th>
                <th>ACTION</th>
                <th>DETAILS</th>
                <th>SECURITY IP</th>
              </tr>
            </thead>
            <tbody>
              {recentActivities.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: '#64748b', padding: 24 }}>
                    No recent activities recorded.
                  </td>
                </tr>
              ) : (
                recentActivities.map((act) => (
                  <tr key={act.id}>
                    <td className="mono" style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      {act.created_at || 'Just now'}
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: '#f8fafc' }}>{act.user_name}</span>
                    </td>
                    <td>
                      <span className="badge" style={{ backgroundColor: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                        {act.module}
                      </span>
                    </td>
                    <td className="mono" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                      {act.action}
                    </td>
                    <td style={{ color: '#cbd5e1', fontSize: '0.825rem' }}>
                      {act.details}
                    </td>
                    <td className="mono" style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {act.ip_address}
                    </td>
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
