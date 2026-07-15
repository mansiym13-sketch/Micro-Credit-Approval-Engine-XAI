/**
 * Live Debt-to-Income Ratio progress bar.
 * Color zones: green <35 | yellow 35-45 | orange 45-60 | red >60
 */
export default function LiveDTIBar({ income, expense }) {
  const safeIncome = parseFloat(income) || 0;
  const safeExpense = parseFloat(expense) || 0;

  const dti = safeIncome > 0 ? Math.min((safeExpense / safeIncome) * 100, 100) : 0;
  const dtiRounded = Math.round(dti);

  const getColor = (val) => {
    if (val < 35) return { bar: 'from-emerald-500 to-emerald-400', label: 'OPTIMAL', text: '#34d399', glow: 'rgba(52,211,153,0.45)' };
    if (val < 45) return { bar: 'from-yellow-500 to-amber-400', label: 'MODERATE', text: '#fbbf24', glow: 'rgba(251,191,36,0.4)' };
    if (val < 60) return { bar: 'from-orange-500 to-orange-400', label: 'HIGH', text: '#fb923c', glow: 'rgba(251,146,60,0.4)' };
    return { bar: 'from-red-600 to-red-500', label: 'CRITICAL', text: '#f87171', glow: 'rgba(248,113,113,0.4)' };
  };

  const color = getColor(dtiRounded);

  return (
    <div className="rounded-2xl p-6 space-y-5" style={{ background: 'rgba(19,27,46,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-end justify-between">
        <div className="space-y-0.5">
          <h3 className="text-xs font-bold tracking-widest uppercase" style={{ color: '#908fa0' }}>
            Live Debt-to-Income Ratio
          </h3>
          <p className="text-[11px]" style={{ color: '#464554', letterSpacing: '0.04em' }}>
            Real-time algorithmic calculation
          </p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold tabular-nums transition-all duration-300" style={{ color: color.text }}>
            {safeIncome > 0 ? `${dtiRounded}%` : '—'}
          </span>
          <span className="block text-[10px] font-bold tracking-widest mt-0.5 transition-colors duration-300" style={{ color: color.text, opacity: 0.8 }}>
            {safeIncome > 0 ? color.label : 'ENTER INCOME'}
          </span>
        </div>
      </div>

      <div className="relative h-3 rounded-full overflow-hidden" style={{ background: '#2d3449' }}>
        <div className="absolute inset-0 flex pointer-events-none">
          <div className="h-full w-[35%]" style={{ background: 'rgba(52,211,153,0.10)', borderRight: '1px solid rgba(255,255,255,0.06)' }} />
          <div className="h-full w-[10%]" style={{ background: 'rgba(251,191,36,0.10)', borderRight: '1px solid rgba(255,255,255,0.06)' }} />
          <div className="h-full w-[15%]" style={{ background: 'rgba(251,146,60,0.10)', borderRight: '1px solid rgba(255,255,255,0.06)' }} />
          <div className="h-full flex-1" style={{ background: 'rgba(248,113,113,0.10)' }} />
        </div>
        <div
          className="absolute h-full left-0 top-0 rounded-full dti-bar-fill"
          style={{
            width: `${dtiRounded}%`,
            backgroundImage: `linear-gradient(to right, ${color.bar.includes('emerald') ? '#10b981, #34d399' : color.bar.includes('yellow') ? '#eab308, #fbbf24' : color.bar.includes('orange') ? '#f97316, #fb923c' : '#dc2626, #f87171'})`,
            boxShadow: `0 0 10px ${color.glow}`,
          }}
        />
      </div>

      <div className="flex justify-between text-[10px] font-medium" style={{ color: '#464554' }}>
        <span>Excellent (&lt;35%)</span>
        <span>Moderate (36–50%)</span>
        <span>High Risk (&gt;50%)</span>
      </div>
    </div>
  );
}
