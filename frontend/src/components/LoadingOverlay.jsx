/**
 * Full-screen loading overlay with animated spinner.
 */
export default function LoadingOverlay({ message = 'Analyzing Applicant Profile...' }) {
  return (
    <div
      className="fixed inset-0 z-[9000] flex flex-col items-center justify-center"
      style={{ background: 'rgba(11,19,38,0.88)', backdropFilter: 'blur(12px)' }}
      aria-live="polite"
    >
      <div className="relative w-20 h-20 mb-8">
        <div
          className="absolute inset-0 rounded-full spin-ring"
          style={{ border: '3px solid transparent', borderTopColor: '#8083ff', borderRightColor: '#adc6ff' }}
        />
        <div
          className="absolute inset-2 rounded-full spin-ring"
          style={{ border: '2px solid transparent', borderTopColor: '#c0c1ff', animationDirection: 'reverse', animationDuration: '1.2s' }}
        />
        <div
          className="absolute inset-[30%] rounded-full"
          style={{ background: 'radial-gradient(circle, #c0c1ff 0%, #8083ff 100%)' }}
        />
      </div>
      <p className="text-sm font-semibold tracking-widest uppercase" style={{ color: '#c0c1ff', letterSpacing: '0.12em' }}>
        {message}
      </p>
      <p className="text-xs mt-2" style={{ color: '#908fa0' }}>
        Running credit risk algorithms…
      </p>
    </div>
  );
}
