export function WavingStickman() {
  return (
    <div
      className="stickman-wave pointer-events-none flex flex-col items-center animate-easter-egg-fade-in"
      aria-hidden="true"
    >
      <div className="mb-1 rounded-md border border-border bg-surface px-2.5 py-0.5 text-xs font-medium text-ink dark:border-dark-border dark:bg-dark-elevated dark:text-zinc-200">
        Hi!
      </div>
      <svg
        viewBox="0 0 64 96"
        className="h-[5.5rem] w-16 text-ink dark:text-zinc-300"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="32" cy="12" r="8" />
        <line x1="32" y1="20" x2="32" y2="52" />
        <line x1="32" y1="52" x2="22" y2="78" />
        <line x1="32" y1="52" x2="42" y2="78" />
        <line x1="32" y1="28" x2="18" y2="42" />
        <g transform="translate(32 28)">
          <g className="stickman-wave-arm">
            <line x1="0" y1="0" x2="18" y2="-12" />
            <circle cx="18" cy="-12" r="2.5" fill="currentColor" stroke="none" />
          </g>
        </g>
      </svg>
    </div>
  )
}
