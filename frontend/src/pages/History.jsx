import { useEffect, useState } from 'react';
import { getLoanHistory, getPDFReportUrl } from '../api/loanApi';

export default function History() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getLoanHistory()
      .then(setRecords)
      .catch(() => setError('Failed to load history'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#dae2fd' }}>Loan History</h1>
        <p className="text-sm mt-1" style={{ color: '#908fa0' }}>All past evaluations — latest first</p>
      </div>

      {loading && (
        <div className="text-center py-20" style={{ color: '#908fa0' }}>Loading…</div>
      )}

      {error && (
        <div className="rounded-xl p-4 text-sm" style={{ background: 'rgba(147,0,10,0.2)', border: '1px solid rgba(255,180,171,0.2)', color: '#ffb4ab' }}>
          {error}
        </div>
      )}

      {!loading && !error && records.length === 0 && (
        <div className="text-center py-20" style={{ color: '#908fa0' }}>No evaluations yet. Submit a loan application first.</div>
      )}

      {!loading && records.length > 0 && (
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
          {/* Table header */}
          <div
            className="grid grid-cols-6 px-6 py-3 text-[11px] font-bold uppercase tracking-widest"
            style={{ background: 'rgba(19,27,46,0.9)', color: '#908fa0', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
          >
            <span>Applicant ID</span>
            <span className="text-center">Score</span>
            <span className="text-center">Decision</span>
            <span className="text-center">Risk Band</span>
            <span className="text-center">Date</span>
            <span className="text-center">Actions</span>
          </div>

          {/* Rows */}
          {records.map((r, i) => {
            const approved = r.decision === 'APPROVED';
            return (
              <div
                key={r.applicant_id}
                className="grid grid-cols-6 px-6 py-4 items-center text-sm"
                style={{
                  background: i % 2 === 0 ? 'rgba(23,31,51,0.5)' : 'rgba(19,27,46,0.5)',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                }}
              >
                <span className="font-mono text-xs truncate pr-4" style={{ color: '#c7c4d7' }}>
                  {r.applicant_id}
                </span>
                <span className="text-center font-bold tabular-nums" style={{ color: '#c0c1ff' }}>
                  {r.score}
                </span>
                <span className="text-center">
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold"
                    style={{ background: approved ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.12)', color: approved ? '#34d399' : '#f87171', border: `1px solid ${approved ? 'rgba(52,211,153,0.25)' : 'rgba(248,113,113,0.25)'}` }}>
                    {r.decision}
                  </span>
                </span>
                <span className="text-center">
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold"
                    style={{ background: r.risk_band === 'LOW' ? 'rgba(128,131,255,0.12)' : r.risk_band === 'MEDIUM' ? 'rgba(251,191,36,0.12)' : 'rgba(248,113,113,0.12)', color: r.risk_band === 'LOW' ? '#c0c1ff' : r.risk_band === 'MEDIUM' ? '#fbbf24' : '#f87171' }}>
                    {r.risk_band}
                  </span>
                </span>
                {/* Date */}
                <span className="text-center text-xs font-mono" style={{ color: '#908fa0' }}>
                  {r.created_at ?? '—'}
                </span>
                {/* PDF Download */}
                <div className="text-center">
                  <a
                    href={getPDFReportUrl(r.applicant_id)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
                    style={{ background: 'rgba(128,131,255,0.12)', color: '#c0c1ff', border: '1px solid rgba(128,131,255,0.2)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(128,131,255,0.25)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(128,131,255,0.12)'; }}
                  >
                    <span className="material-symbols-outlined text-sm">download</span>
                    PDF
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
