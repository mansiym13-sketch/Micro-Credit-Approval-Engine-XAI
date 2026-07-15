import { useEffect, useRef, useState } from 'react';

const SCORE_MIN = 300;
const SCORE_MAX = 900;

function scoreToAngle(score) {
  const pct = (score - SCORE_MIN) / (SCORE_MAX - SCORE_MIN);
  return -90 + pct * 180;
}

function getRiskProfile(score) {
  if (score >= 750) return { label: 'LOW RISK',  color: '#34d399', glow: 'rgba(52,211,153,0.5)',  zone: 'Excellent' };
  if (score >= 650) return { label: 'MODERATE',  color: '#fbbf24', glow: 'rgba(251,191,36,0.5)',  zone: 'Good' };
  if (score >= 550) return { label: 'ELEVATED',  color: '#fb923c', glow: 'rgba(251,146,60,0.5)',  zone: 'Fair' };
  return               { label: 'HIGH RISK', color: '#f87171', glow: 'rgba(248,113,113,0.5)', zone: 'Poor' };
}

function arcPath(cx, cy, r, startDeg, endDeg) {
  const toRad = (d) => (d * Math.PI) / 180;
  const x1 = cx + r * Math.cos(toRad(startDeg));
  const y1 = cy + r * Math.sin(toRad(startDeg));
  const x2 = cx + r * Math.cos(toRad(endDeg));
  const y2 = cy + r * Math.sin(toRad(endDeg));
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
}

// Accepts `score` (our backend field name)
export default function ScoreGauge({ score = 0 }) {
  const [displayScore, setDisplayScore] = useState(SCORE_MIN);
  const [needleAngle, setNeedleAngle] = useState(-90);
  const animRef = useRef(null);
  const startRef = useRef(null);

  const risk = getRiskProfile(score);
  const targetAngle = scoreToAngle(score);

  useEffect(() => {
    if (score <= 0) return;
    const duration = 1400;
    startRef.current = null;

    const tick = (timestamp) => {
      if (!startRef.current) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setDisplayScore(Math.round(SCORE_MIN + (score - SCORE_MIN) * eased));
      setNeedleAngle(-90 + (targetAngle + 90) * eased);

      if (progress < 1) animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [score, targetAngle]);

  const cx = 160, cy = 130, r = 110;

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-xs font-bold tracking-widest uppercase mb-6" style={{ color: '#c0c1ff', letterSpacing: '0.14em' }}>
        AI Probability Score
      </h2>

      <div className="relative">
        <svg width="320" height="160" viewBox="0 0 320 160" aria-label={`Credit score: ${displayScore}`}>
          <defs>
            <linearGradient id="gaugeGreen"  x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#34d399" /></linearGradient>
            <linearGradient id="gaugeYellow" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#f59e0b" /><stop offset="100%" stopColor="#fbbf24" /></linearGradient>
            <linearGradient id="gaugeOrange" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#ea580c" /><stop offset="100%" stopColor="#fb923c" /></linearGradient>
            <linearGradient id="gaugeRed"    x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#dc2626" /><stop offset="100%" stopColor="#f87171" /></linearGradient>
            <filter id="needleGlow">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          <path d={arcPath(cx, cy, r, 180, 360)} fill="none" stroke="#2d3449" strokeWidth="18" strokeLinecap="round" />
          <path d={arcPath(cx, cy, r, 180, 225)} fill="none" stroke="url(#gaugeRed)"    strokeWidth="16" strokeLinecap="butt" opacity="0.7" />
          <path d={arcPath(cx, cy, r, 225, 270)} fill="none" stroke="url(#gaugeOrange)" strokeWidth="16" strokeLinecap="butt" opacity="0.7" />
          <path d={arcPath(cx, cy, r, 270, 315)} fill="none" stroke="url(#gaugeYellow)" strokeWidth="16" strokeLinecap="butt" opacity="0.7" />
          <path d={arcPath(cx, cy, r, 315, 360)} fill="none" stroke="url(#gaugeGreen)"  strokeWidth="16" strokeLinecap="butt" opacity="0.7" />

          <g transform={`rotate(${needleAngle}, ${cx}, ${cy})`}>
            <line x1={cx} y1={cy} x2={cx} y2={cy - r + 20} stroke={risk.color} strokeWidth="3" strokeLinecap="round" filter="url(#needleGlow)" />
          </g>

          <circle cx={cx} cy={cy} r="7" fill="#2d3449" stroke={risk.color} strokeWidth="2" />
          <text x={cx - r - 4} y={cy + 20} fill="#464554" fontSize="10" textAnchor="middle" fontFamily="Inter">300</text>
          <text x={cx + r + 4} y={cy + 20} fill="#464554" fontSize="10" textAnchor="middle" fontFamily="Inter">900</text>
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-end pb-2 pointer-events-none">
          <span
            className="score-appear tabular-nums"
            style={{ fontSize: '52px', fontWeight: 800, lineHeight: 1, color: risk.color, textShadow: `0 0 24px ${risk.glow}`, letterSpacing: '-0.02em', fontFamily: 'Inter' }}
          >
            {displayScore}
          </span>
        </div>
      </div>

      <div
        className="mt-3 flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold tracking-widest"
        style={{ background: `${risk.color}15`, borderColor: `${risk.color}35`, color: risk.color }}
      >
        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: risk.color }} />
        {risk.label}
      </div>

      <div className="flex gap-6 mt-4 text-[10px]" style={{ color: '#464554' }}>
        {[{ label: 'Poor', color: '#f87171' }, { label: 'Fair', color: '#fb923c' }, { label: 'Good', color: '#fbbf24' }, { label: 'Excellent', color: '#34d399' }].map(({ label, color }) => (
          <span key={label} className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ background: color }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
