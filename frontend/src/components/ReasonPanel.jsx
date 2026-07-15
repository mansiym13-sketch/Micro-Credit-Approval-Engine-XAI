const RULE_MAP = {
  DTI_CHECK:            { title: 'Debt-to-Income Check',      icon: 'analytics' },
  CREDIT_HISTORY_CHECK: { title: 'Credit History Length',     icon: 'history_edu' },
  DEFAULTS_CHECK:       { title: 'Default Record Analysis',   icon: 'warning_amber' },
  INCOME_CHECK:         { title: 'Income Sufficiency',        icon: 'payments' },
  EXISTING_LOANS_CHECK: { title: 'Loan Burden Assessment',    icon: 'account_balance_wallet' },
  CREDIT_SCORE:         { title: 'Credit Score Threshold',    icon: 'stars' },
};

function normalizeReason(reason) {
  if (typeof reason === 'string') return { rule: reason, detail: '', status: 'PASS' };
  return {
    rule:   reason.rule   || reason.name   || 'UNKNOWN',
    detail: reason.detail || reason.description || '',
    status: (reason.status || (reason.passed ? 'PASS' : 'FAIL') || 'PASS').toUpperCase(),
  };
}

export default function ReasonPanel({ reasons = [] }) {
  const items = reasons.map(normalizeReason);

  return (
    <section
      className="rounded-xl p-8"
      style={{ background: 'rgba(23,31,51,0.4)', border: '1px solid rgba(255,255,255,0.05)' }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold" style={{ color: '#dae2fd' }}>
          Automated Rule Logic
        </h3>
        <div className="flex items-center gap-2 text-[11px]" style={{ color: '#908fa0' }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#8083ff' }} />
          ENGINE v1.0 Deployment
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map(({ rule, detail, status }, i) => {
          const meta = RULE_MAP[rule] || { title: rule.replace(/_/g, ' '), icon: 'rule' };
          const isPassing = status === 'PASS';

          return (
            <div
              key={rule + i}
              className="stagger-item flex items-center justify-between p-4 rounded-lg group cursor-default"
              style={{
                background: 'rgba(19,27,46,0.7)',
                border: '1px solid rgba(255,255,255,0.05)',
                animationDelay: `${i * 80}ms`,
                transition: 'background 200ms',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(34,42,61,0.9)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(19,27,46,0.7)'; }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="material-symbols-outlined text-lg flex-shrink-0" style={{ color: isPassing ? '#8083ff' : '#908fa0' }}>
                  {meta.icon}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: '#dae2fd' }}>{meta.title}</p>
                  {detail && (
                    <p className="text-[11px] mt-0.5 truncate" style={{ color: '#908fa0', letterSpacing: '0.02em' }}>{detail}</p>
                  )}
                </div>
              </div>
              <span
                className="ml-3 flex-shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest border"
                style={
                  isPassing
                    ? { background: 'rgba(128,131,255,0.12)', color: '#c0c1ff', borderColor: 'rgba(128,131,255,0.25)' }
                    : { background: 'rgba(147,0,10,0.25)', color: '#ffb4ab', borderColor: 'rgba(255,180,171,0.25)' }
                }
              >
                {status}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
