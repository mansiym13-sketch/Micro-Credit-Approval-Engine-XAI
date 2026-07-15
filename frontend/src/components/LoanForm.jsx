import { useState } from 'react';
import LiveDTIBar from './LiveDTIBar';

const INITIAL_FORM = {
  monthly_income: '',
  monthly_expense: '',
  existing_loans: 0,
  credit_history_months: 12,
  defaults: 0,
};

const EXISTING_LOAN_OPTIONS = [
  { label: 'No active loans', value: 0 },
  { label: '1–2 active loans', value: 1 },
  { label: '3+ active loans', value: 3 },
];

const CREDIT_HISTORY_OPTIONS = [
  { label: '< 6 months', value: 3 },
  { label: '6–12 months', value: 9 },
  { label: '12–24 months', value: 18 },
  { label: '24–60 months', value: 36 },
  { label: '5+ years', value: 72 },
];

const DEFAULTS_OPTIONS = [
  { label: 'No defaults', value: 0 },
  { label: '1 default', value: 1 },
  { label: '2+ defaults', value: 2 },
];

function FormField({ label, icon, error, children }) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-[13px] font-semibold tracking-wide uppercase" style={{ color: '#908fa0', letterSpacing: '0.06em' }}>
        <span className="material-symbols-outlined text-sm" style={{ color: '#8083ff' }}>{icon}</span>
        {label}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1.5 text-xs font-medium" style={{ color: '#ffb4ab' }}>
          <span className="material-symbols-outlined text-xs">error_outline</span>
          {error}
        </p>
      )}
    </div>
  );
}

const inputClass = `w-full rounded-xl py-3.5 px-4 text-sm font-medium focus:outline-none focus:ring-2 transition-all duration-200 placeholder:font-normal`;
const inputStyle = { background: 'rgba(45,52,73,0.5)', border: '1px solid rgba(255,255,255,0.08)', color: '#dae2fd' };
const inputFocusStyle = { borderColor: '#8083ff', boxShadow: '0 0 0 3px rgba(128,131,255,0.18)' };

function SmartInput({ prefix, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="relative group">
      {prefix && (
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
          <span className="text-sm font-bold" style={{ color: '#8083ff' }}>{prefix}</span>
        </div>
      )}
      <input
        className={inputClass}
        style={{ ...inputStyle, ...(focused ? inputFocusStyle : {}), paddingLeft: prefix ? '2.5rem' : '1rem' }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      />
    </div>
  );
}

function SmartSelect({ children, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="relative">
      <select
        className={`${inputClass} appearance-none pr-10`}
        style={{ ...inputStyle, ...(focused ? inputFocusStyle : {}) }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      >
        {children}
      </select>
      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
        <span className="material-symbols-outlined text-base" style={{ color: '#908fa0' }}>expand_more</span>
      </div>
    </div>
  );
}

export default function LoanForm({ onSubmit, isLoading }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.monthly_income || parseFloat(form.monthly_income) <= 0) {
      errs.monthly_income = 'Monthly income is required';
    }
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    onSubmit({
      monthly_income:        parseFloat(form.monthly_income),
      monthly_expense:       parseFloat(form.monthly_expense) || 0,
      existing_loans:        parseInt(form.existing_loans, 10),
      credit_history_months: parseInt(form.credit_history_months, 10),
      defaults:              parseInt(form.defaults, 10),
    });
  };

  return (
    <div
      className="w-full max-w-4xl mx-auto rounded-[2rem] overflow-hidden shadow-2xl"
      style={{ background: 'rgba(23,31,51,0.6)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 24px 64px rgba(0,0,0,0.55), 0 0 48px rgba(73,75,214,0.12)', backdropFilter: 'blur(20px)' }}
    >
      {/* Header */}
      <div className="px-8 md:px-12 pt-10 pb-8 text-center relative overflow-hidden" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(128,131,255,0.18) 0%, transparent 70%)' }} />
        <div className="relative w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(128,131,255,0.14)', border: '1px solid rgba(128,131,255,0.3)', boxShadow: '0 0 24px rgba(128,131,255,0.2)' }}>
          <span className="material-symbols-outlined text-4xl" style={{ color: '#c0c1ff', fontVariationSettings: "'FILL' 1" }}>query_stats</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2" style={{ color: '#dae2fd', letterSpacing: '-0.01em' }}>
          Micro-Credit Approval Engine
        </h1>
        <p className="text-sm" style={{ color: '#908fa0' }}>Powered by Intelligent Risk Analytics</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-8 md:px-12 py-10 space-y-8" noValidate>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Monthly Income" icon="payments" error={errors.monthly_income}>
            <SmartInput id="monthly_income" type="number" min="0" placeholder="50,000" prefix="₹" value={form.monthly_income} onChange={set('monthly_income')} />
          </FormField>
          <FormField label="Monthly Expenses" icon="shopping_cart" error={errors.monthly_expense}>
            <SmartInput id="monthly_expense" type="number" min="0" placeholder="20,000" prefix="₹" value={form.monthly_expense} onChange={set('monthly_expense')} />
          </FormField>
          <FormField label="Existing Loans" icon="account_balance_wallet">
            <SmartSelect id="existing_loans" value={form.existing_loans} onChange={set('existing_loans')}>
              {EXISTING_LOAN_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </SmartSelect>
          </FormField>
          <FormField label="Credit History" icon="history_edu">
            <SmartSelect id="credit_history_months" value={form.credit_history_months} onChange={set('credit_history_months')}>
              {CREDIT_HISTORY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </SmartSelect>
          </FormField>
        </div>

        <FormField label="Payment Defaults" icon="warning_amber">
          <SmartSelect id="defaults" value={form.defaults} onChange={set('defaults')}>
            {DEFAULTS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </SmartSelect>
        </FormField>

        <LiveDTIBar income={form.monthly_income} expense={form.monthly_expense} />

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-xl text-sm font-bold tracking-widest uppercase transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ background: isLoading ? 'rgba(128,131,255,0.4)' : 'linear-gradient(135deg, #8083ff 0%, #494bd6 100%)', color: '#ffffff', boxShadow: isLoading ? 'none' : '0 8px 32px rgba(73,75,214,0.35), 0 0 0 1px rgba(128,131,255,0.2)', letterSpacing: '0.1em' }}
        >
          <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
          {isLoading ? 'Analyzing…' : 'Evaluate Credit'}
        </button>
      </form>

      {/* Footer */}
      <div className="px-8 md:px-12 pb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#adc6ff', boxShadow: '0 0 8px #adc6ff' }} />
          <span className="text-[11px] font-medium" style={{ color: '#908fa0', letterSpacing: '0.04em' }}>Engine Online: v1.0-stable</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-sm" style={{ color: '#464554' }}>lock</span>
          <span className="text-[11px]" style={{ color: '#464554' }}>AES-256 Encrypted</span>
        </div>
      </div>
    </div>
  );
}
