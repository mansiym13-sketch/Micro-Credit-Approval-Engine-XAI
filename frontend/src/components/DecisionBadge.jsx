/**
 * Decision badge: APPROVED or REJECTED with dynamic styling.
 */
export default function DecisionBadge({ decision }) {
  const approved = decision?.toLowerCase() === 'approved';

  return (
    <div
      className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border text-sm font-bold tracking-widest uppercase ${
        approved
          ? 'border-emerald-500/40 text-emerald-400'
          : 'border-red-500/40 text-red-400'
      }`}
      style={{
        background: approved ? 'rgba(52,211,153,0.08)' : 'rgba(248,113,113,0.08)',
      }}
    >
      <span
        className="material-symbols-outlined text-base"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        {approved ? 'verified' : 'cancel'}
      </span>
      {approved ? 'Approved' : 'Rejected'}
    </div>
  );
}
