import { useState, useCallback } from 'react';
import { evaluateLoan, getPDFReportUrl } from '../api/loanApi';
import LoanForm from '../components/LoanForm';
import ScoreGauge from '../components/ScoreGauge';
import DecisionBadge from '../components/DecisionBadge';
import ReasonPanel from '../components/ReasonPanel';
import LoadingOverlay from '../components/LoadingOverlay';
import Toast from '../components/Toast';
import AIInsightCard from '../components/AIInsightCard';

// Our backend returns `score` — derive portfolio bars from it
function derivePortfolioStats(result) {
  const score = result?.score ?? 0;
  const high = Math.min(Math.round(((score - 300) / 600) * 100), 100);
  const review = score < 550 ? Math.round(Math.random() * 20 + 10) : Math.round(Math.random() * 10 + 5);
  const neutral = Math.max(0, 100 - high - review);
  return { high, neutral, review };
}

function PortfolioBar({ label, value, color, textColor }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs font-semibold" style={{ color: '#c7c4d7' }}>
        <span>{label}</span>
        <span style={{ color: textColor }}>{value}%</span>
      </div>
      <div className="h-1.5 rounded-full" style={{ background: '#2d3449' }}>
        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  );
}

function StatChip({ icon, label, value, color }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: 'rgba(19,27,46,0.7)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <span className="material-symbols-outlined text-lg" style={{ color }}>{icon}</span>
      <div>
        <p className="text-[10px] font-medium uppercase tracking-widest" style={{ color: '#908fa0' }}>{label}</p>
        <p className="text-sm font-bold" style={{ color }}>{value}</p>
      </div>
    </div>
  );
}

function DecisionBanner({ result, applicantId }) {
  const approved = result?.decision?.toLowerCase() === 'approved';
  const amount = result?.recommended_loan_amount ?? null;
  const formattedAmount = amount != null
    ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
    : null;

  return (
    <section className="relative group">
      <div
        className="absolute -inset-0.5 rounded-xl blur opacity-70 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: approved ? 'linear-gradient(135deg, rgba(52,211,153,0.35) 0%, rgba(16,185,129,0.15) 100%)' : 'linear-gradient(135deg, rgba(248,113,113,0.35) 0%, rgba(220,38,38,0.15) 100%)' }}
      />
      <div
        className={`relative flex flex-col md:flex-row items-center justify-between gap-6 p-8 rounded-xl ${approved ? 'approval-glow' : 'rejection-glow'}`}
        style={{ background: approved ? 'rgba(6,30,22,0.85)' : 'rgba(30,6,6,0.85)', border: `1px solid ${approved ? 'rgba(52,211,153,0.25)' : 'rgba(248,113,113,0.25)'}`, backdropFilter: 'blur(16px)' }}
      >
        <div className="flex items-center gap-6">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: approved ? 'linear-gradient(135deg, #10b981, #34d399)' : 'linear-gradient(135deg, #dc2626, #f87171)', boxShadow: approved ? '0 0 32px rgba(52,211,153,0.4)' : '0 0 32px rgba(248,113,113,0.4)' }}
          >
            <span className="material-symbols-outlined text-4xl text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
              {approved ? 'check_circle' : 'cancel'}
            </span>
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight" style={{ color: approved ? '#34d399' : '#f87171', letterSpacing: '-0.01em' }}>
              {approved ? 'LOAN APPROVED' : 'APPLICATION REJECTED'}
            </h2>
            {approved && formattedAmount && (
              <p className="text-base mt-1" style={{ color: '#c7c4d7' }}>
                Recommended Disbursement: <span className="font-bold" style={{ color: '#dae2fd' }}>{formattedAmount}</span>
              </p>
            )}
            {!approved && <p className="text-sm mt-1" style={{ color: '#908fa0' }}>The application does not meet current credit criteria.</p>}
            <p className="text-[11px] mt-2 font-mono" style={{ color: '#464554' }}>Application ID: {applicantId}</p>
          </div>
        </div>
        <DecisionBadge decision={result?.decision} />
      </div>
    </section>
  );
}

function Navbar({ activeTab }) {
  return (
    <header className="fixed top-0 w-full z-50 flex items-center justify-between px-8 h-16" style={{ background: 'rgba(11,19,38,0.7)', borderBottom: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)', boxShadow: '0 0 24px rgba(73,75,214,0.1)' }}>
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined" style={{ color: '#c0c1ff', fontSize: '22px' }}>account_balance</span>
        <span className="font-extrabold text-lg tracking-tighter" style={{ color: '#c0c1ff' }}>ENGINE</span>
      </div>
      <nav className="hidden md:flex items-center gap-8">
        {['Evaluate', 'Analytics', 'History', 'Profile'].map((item) => (
          <a key={item} href="#" className="text-[13px] font-semibold tracking-wide uppercase transition-colors"
            style={{ color: activeTab === item ? '#c0c1ff' : '#908fa0', borderBottom: activeTab === item ? '2px solid #8083ff' : '2px solid transparent', paddingBottom: '2px', letterSpacing: '0.06em' }}>
            {item}
          </a>
        ))}
      </nav>
      <div className="md:hidden">
        <span className="material-symbols-outlined" style={{ color: '#908fa0' }}>menu</span>
      </div>
    </header>
  );
}

function MobileNav({ activeTab }) {
  const items = [
    { label: 'Evaluate', icon: 'assignment_turned_in' },
    { label: 'Analytics', icon: 'insert_chart' },
    { label: 'History', icon: 'history' },
    { label: 'Profile', icon: 'account_circle' },
  ];
  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center py-2 z-50 rounded-t-2xl" style={{ background: 'rgba(23,31,51,0.92)', borderTop: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', boxShadow: '0 -4px 24px rgba(0,0,0,0.4)' }}>
      {items.map(({ label, icon }) => {
        const isActive = activeTab === label;
        return (
          <div key={label} className="flex flex-col items-center justify-center px-4 py-1 rounded-xl transition-all"
            style={isActive ? { background: 'rgba(128,131,255,0.15)', border: '1px solid rgba(128,131,255,0.3)' } : {}}>
            <span className="material-symbols-outlined text-lg" style={{ color: isActive ? '#c0c1ff' : '#908fa0', fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>{icon}</span>
            <span className="text-[10px] font-semibold mt-0.5" style={{ color: isActive ? '#c0c1ff' : '#908fa0' }}>{label}</span>
          </div>
        );
      })}
    </nav>
  );
}

export default function LoanEvaluator() {
  const [screen, setScreen] = useState('form');
  const [transition, setTransition] = useState(null);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [applicantId, setApplicantId] = useState('');

  const dismissToast = useCallback(() => setToast(null), []);

  const handleSubmit = useCallback(async (payload) => {
    setIsLoading(true);
    try {
      const data = await evaluateLoan(payload);
      setResult(data);
      setApplicantId(data.applicant_id);
      setTransition('out');
      setTimeout(() => {
        setScreen('result');
        setTransition('in');
        setTimeout(() => setTransition(null), 350);
      }, 320);
    } catch (err) {
      // 422 = loan REJECTED by scoring engine — still show the result
      if (err.response?.status === 422 && err.response?.data) {
        const data = err.response.data;
        setResult(data);
        setApplicantId(data.applicant_id);
        setTransition('out');
        setTimeout(() => {
          setScreen('result');
          setTransition('in');
          setTimeout(() => setTransition(null), 350);
        }, 320);
      } else {
        // 400 validation error or real network failure
        const message = err.response?.data?.message || 'Something went wrong. Please check your inputs and try again.';
        setToast({ message, type: 'error' });
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleReset = useCallback(() => {
    setTransition('out-right');
    setTimeout(() => {
      setScreen('form');
      setResult(null);
      setTransition('in-left');
      setTimeout(() => setTransition(null), 350);
    }, 320);
  }, []);

  const getTransitionClass = () => {
    if (transition === 'out') return 'screen-slide-left-out';
    if (transition === 'in') return 'screen-slide-right-in';
    if (transition === 'out-right') return 'screen-slide-right-out';
    if (transition === 'in-left') return 'screen-slide-left-in';
    return '';
  };

  const portfolio = result ? derivePortfolioStats(result) : null;
  const activeTab = screen === 'form' ? 'Evaluate' : 'Analytics';

  return (
    <>
      <div className="fixed inset-0 grid-texture pointer-events-none z-0" />
      <div className="fixed top-1/4 -right-32 w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(128,131,255,0.08) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      <div className="fixed -bottom-32 -left-32 w-[400px] h-[400px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(5,102,217,0.07) 0%, transparent 70%)', filter: 'blur(40px)' }} />

      {isLoading && <LoadingOverlay />}
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={dismissToast} />}

      <main className={`relative z-10 pb-28 md:pb-8 px-4 md:px-8 min-h-screen ${getTransitionClass()}`}>
        {screen === 'form' && (
          <div className="flex items-center justify-center min-h-[calc(100vh-7rem)]">
            <LoanForm onSubmit={handleSubmit} isLoading={isLoading} />
          </div>
        )}

        {screen === 'result' && result && (
          <div className="max-w-7xl mx-auto space-y-5">
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Score Gauge */}
              <div className="lg:col-span-2 rounded-xl p-8 flex flex-col items-center justify-center relative overflow-hidden" style={{ background: 'rgba(23,31,51,0.55)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(16px)' }}>
                <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(128,131,255,0.04) 0%, transparent 60%)' }} />
                {/* Pass `score` — our backend field name */}
                <ScoreGauge score={result.score ?? 0} />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-8 w-full max-w-lg">
                  <StatChip icon="speed"       label="Credit Score" value={result.score ?? '—'}      color="#c0c1ff" />
                  <StatChip icon="shield"      label="Risk Band"    value={result.risk_band ?? '—'}   color="#adc6ff" />
                  <StatChip icon="trending_up" label="Decision"     value={result.decision ?? '—'}    color={result.decision?.toLowerCase() === 'approved' ? '#34d399' : '#f87171'} />
                </div>
              </div>

              {/* Portfolio Impact */}
              <div className="rounded-xl p-6 flex flex-col justify-between" style={{ background: 'rgba(23,31,51,0.55)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(16px)' }}>
                <div>
                  <h3 className="text-base font-semibold mb-1" style={{ color: '#dae2fd' }}>Portfolio Impact</h3>
                  <p className="text-xs mb-6" style={{ color: '#908fa0' }}>Real-time risk allocation</p>
                </div>
                <div className="space-y-5">
                  <PortfolioBar label="High Probability" value={portfolio.high}    color="linear-gradient(90deg, #8083ff, #adc6ff)" textColor="#c0c1ff" />
                  <PortfolioBar label="Neutral"          value={portfolio.neutral} color="#908fa0"                                   textColor="#c7c4d7" />
                  <PortfolioBar label="Review Required"  value={portfolio.review}  color="#93000a"                                   textColor="#ffb4ab" />
                </div>
                <div className="mt-6 rounded-lg px-4 py-3 text-center" style={{ background: 'rgba(128,131,255,0.08)', border: '1px solid rgba(128,131,255,0.15)' }}>
                  <p className="text-[11px] font-medium uppercase tracking-widest mb-1" style={{ color: '#908fa0' }}>Score Range</p>
                  <p className="text-lg font-bold tabular-nums" style={{ color: '#c0c1ff' }}>300 – 900</p>
                </div>
              </div>
            </section>

            <DecisionBanner result={result} applicantId={applicantId} />

            {/* ── EMI Affordability + DTI ─────────────────────────── */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* EMI Affordability Card */}
              <div className="rounded-xl p-6 space-y-4" style={{ background: 'rgba(23,31,51,0.55)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined" style={{ color: '#adc6ff' }}>calculate</span>
                  <h3 className="text-base font-semibold" style={{ color: '#dae2fd' }}>EMI Affordability</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg p-3" style={{ background: 'rgba(19,27,46,0.7)' }}>
                    <p className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: '#908fa0' }}>Affordable EMI</p>
                    <p className="text-lg font-bold mt-1" style={{ color: '#c0c1ff' }}>
                      ₹{result.emi_affordability?.affordable_emi?.toLocaleString('en-IN') ?? '—'}
                    </p>
                  </div>
                  <div className="rounded-lg p-3" style={{ background: 'rgba(19,27,46,0.7)' }}>
                    <p className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: '#908fa0' }}>Loan Eligibility</p>
                    <p className="text-lg font-bold mt-1" style={{ color: '#34d399' }}>
                      ₹{result.emi_affordability?.estimated_loan_eligibility?.toLocaleString('en-IN') ?? '—'}
                    </p>
                  </div>
                  <div className="rounded-lg p-3" style={{ background: 'rgba(19,27,46,0.7)' }}>
                    <p className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: '#908fa0' }}>Interest Rate</p>
                    <p className="text-lg font-bold mt-1" style={{ color: '#fbbf24' }}>
                      {result.emi_affordability?.interest_rate ?? '—'}% p.a.
                    </p>
                  </div>
                  <div className="rounded-lg p-3" style={{ background: 'rgba(19,27,46,0.7)' }}>
                    <p className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: '#908fa0' }}>Tenure</p>
                    <p className="text-lg font-bold mt-1" style={{ color: '#c7c4d7' }}>
                      {result.emi_affordability?.tenure_months ?? '—'} months
                    </p>
                  </div>
                </div>
              </div>

              {/* DTI + Audit Info Card */}
              <div className="rounded-xl p-6 space-y-4" style={{ background: 'rgba(23,31,51,0.55)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined" style={{ color: '#adc6ff' }}>analytics</span>
                  <h3 className="text-base font-semibold" style={{ color: '#dae2fd' }}>Evaluation Details</h3>
                </div>
                <div className="space-y-3">
                  {/* DTI */}
                  <div className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span className="text-sm" style={{ color: '#908fa0' }}>DTI Percentage</span>
                    <span className="font-bold tabular-nums" style={{ color: result.dti_percentage > 60 ? '#f87171' : result.dti_percentage > 45 ? '#fbbf24' : '#34d399' }}>
                      {result.dti_percentage}%
                    </span>
                  </div>
                  {/* Recommended Loan */}
                  <div className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span className="text-sm" style={{ color: '#908fa0' }}>Recommended Loan</span>
                    <span className="font-bold" style={{ color: '#c0c1ff' }}>
                      ₹{result.recommended_loan_amount?.toLocaleString('en-IN') ?? '0'}
                    </span>
                  </div>
                  {/* Rule Engine Version */}
                  <div className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span className="text-sm" style={{ color: '#908fa0' }}>Rule Engine</span>
                    <span className="font-mono text-xs px-2 py-1 rounded" style={{ background: 'rgba(128,131,255,0.12)', color: '#c0c1ff' }}>
                      {result.rule_engine_version ?? 'v1.0'}
                    </span>
                  </div>
                  {/* Timestamp */}
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm" style={{ color: '#908fa0' }}>Evaluated At</span>
                    <span className="text-xs font-mono" style={{ color: '#464554' }}>
                      {result.evaluation_timestamp ? new Date(result.evaluation_timestamp).toLocaleString() : '—'}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* ── Explainable AI Decision Insight ─────────────────── */}
            <AIInsightCard
              explanation={result.ai_explanation}
              decision={result.decision}
              source={result.ai_explanation_source}
              model={result.ai_explanation_model}
              isLoading={false}
            />

            {result.reasons && result.reasons.length > 0 && <ReasonPanel reasons={result.reasons} />}

            {/* ── Action Buttons ──────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              {/* PDF Download */}
              <a
                href={getPDFReportUrl(applicantId)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold tracking-wide transition-all duration-200"
                style={{ background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.25)', color: '#34d399' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(52,211,153,0.22)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(52,211,153,0.12)'; }}
              >
                <span className="material-symbols-outlined text-base">download</span>
                Download PDF Report
              </a>

              {/* Evaluate Another */}
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold tracking-wide transition-all duration-200"
                style={{ background: 'rgba(45,52,73,0.5)', border: '1px solid rgba(255,255,255,0.08)', color: '#c7c4d7' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(128,131,255,0.12)'; e.currentTarget.style.borderColor = 'rgba(128,131,255,0.25)'; e.currentTarget.style.color = '#c0c1ff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(45,52,73,0.5)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#c7c4d7'; }}
              >
                <span className="material-symbols-outlined text-base">arrow_back</span>
                Evaluate Another Applicant
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
