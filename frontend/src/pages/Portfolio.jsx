import { useEffect, useState } from 'react';
import { getPortfolioStats } from '../api/loanApi';

function StatCard({ icon, label, value, color }) {
  return (
    <div
      className="rounded-xl p-6 flex items-center gap-5"
      style={{ background: 'rgba(23,31,51,0.6)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}18`, border: `1px solid ${color}30` }}
      >
        <span className="material-symbols-outlined text-2xl" style={{ color }}>{icon}</span>
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: '#908fa0' }}>{label}</p>
        <p className="text-2xl font-bold tabular-nums mt-0.5" style={{ color }}>{value}</p>
      </div>
    </div>
  );
}

function RiskBar({ label, count, total, color }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span style={{ color: '#c7c4d7' }}>{label}</span>
        <span className="font-bold tabular-nums" style={{ color }}>{count} <span style={{ color: '#908fa0', fontWeight: 400 }}>({pct}%)</span></span>
      </div>
      <div className="h-2 rounded-full" style={{ background: '#2d3449' }}>
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

export default function Portfolio() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getPortfolioStats()
      .then(setStats)
      .catch(() => setError('Failed to load portfolio stats'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#dae2fd' }}>Portfolio Analytics</h1>
        <p className="text-sm mt-1" style={{ color: '#908fa0' }}>Aggregate statistics across all loan evaluations</p>
      </div>

      {loading && <div className="text-center py-20" style={{ color: '#908fa0' }}>Loading…</div>}
      {error   && (
        <div className="rounded-xl p-4 text-sm" style={{ background: 'rgba(147,0,10,0.2)', border: '1px solid rgba(255,180,171,0.2)', color: '#ffb4ab' }}>
          {error}
        </div>
      )}

      {stats && (
        <>
          {/* Top stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon="folder_open"   label="Total Applications"  value={stats.total_applications}  color="#c0c1ff" />
            <StatCard icon="check_circle"  label="Approved"            value={stats.approved}            color="#34d399" />
            <StatCard icon="cancel"        label="Rejected"            value={stats.rejected}            color="#f87171" />
            <StatCard icon="percent"       label="Approval Rate"       value={stats.approval_rate}       color="#fbbf24" />
          </div>

          {/* Average score + risk distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Average score */}
            <div className="rounded-xl p-6" style={{ background: 'rgba(23,31,51,0.6)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-[11px] font-semibold uppercase tracking-widest mb-4" style={{ color: '#908fa0' }}>Average Credit Score</p>
              <p className="text-6xl font-extrabold tabular-nums" style={{ color: '#c0c1ff' }}>
                {stats.average_credit_score}
              </p>
              <p className="text-xs mt-2" style={{ color: '#464554' }}>Across all {stats.total_applications} applications</p>
            </div>

            {/* Risk band distribution */}
            <div className="rounded-xl p-6 space-y-5" style={{ background: 'rgba(23,31,51,0.6)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: '#908fa0' }}>Risk Band Distribution</p>
              <RiskBar label="Low Risk"    count={stats.low_risk_count}    total={stats.total_applications} color="#34d399" />
              <RiskBar label="Medium Risk" count={stats.medium_risk_count} total={stats.total_applications} color="#fbbf24" />
              <RiskBar label="High Risk"   count={stats.high_risk_count}   total={stats.total_applications} color="#f87171" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
