import { useEffect, useState } from 'react';

/**
 * Toast notification component.
 * Slides in from top-right, auto-dismisses after 4 seconds.
 */
export default function Toast({ message, type = 'error', onDismiss }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const hideTimer = setTimeout(() => setLeaving(true), 3700);
    const removeTimer = setTimeout(() => onDismiss?.(), 4000);
    return () => { clearTimeout(hideTimer); clearTimeout(removeTimer); };
  }, [onDismiss]);

  const icons = { error: 'error_outline', success: 'check_circle', warning: 'warning_amber', info: 'info' };
  const colors = {
    error: 'border-red-500/40 bg-red-950/80',
    success: 'border-emerald-500/40 bg-emerald-950/80',
    warning: 'border-amber-500/40 bg-amber-950/80',
    info: 'border-blue-500/40 bg-blue-950/80',
  };
  const iconColors = { error: 'text-red-400', success: 'text-emerald-400', warning: 'text-amber-400', info: 'text-blue-400' };

  return (
    <div
      className={`fixed top-5 right-5 z-[9999] flex items-start gap-3 max-w-sm w-full p-4 rounded-xl border shadow-2xl backdrop-blur-xl ${colors[type]} ${leaving ? 'toast-leave' : 'toast-enter'}`}
      role="alert"
    >
      <span className={`material-symbols-outlined text-xl flex-shrink-0 mt-0.5 ${iconColors[type]}`}>
        {icons[type]}
      </span>
      <p className="text-sm font-medium text-white/90 leading-snug flex-1">{message}</p>
      <button
        onClick={() => { setLeaving(true); setTimeout(() => onDismiss?.(), 300); }}
        className="text-white/40 hover:text-white/80 transition-colors flex-shrink-0"
        aria-label="Dismiss"
      >
        <span className="material-symbols-outlined text-lg">close</span>
      </button>
    </div>
  );
}
