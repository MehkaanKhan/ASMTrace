export default function ConfidenceRing({ confidence }: { confidence: number }) {
  const radius = 28
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (confidence / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-1.5">
      <svg width="72" height="72" className="-rotate-90">
        <circle cx="36" cy="36" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
        <circle
          cx="36" cy="36" r={radius}
          fill="none"
          stroke="url(#ring-gradient)"
          strokeWidth="5"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
      </svg>
      <span className="font-mono text-sm font-bold text-zinc-200">{confidence}%</span>
      <span className="text-[10px] uppercase tracking-widest text-zinc-600">confidence</span>
    </div>
  )
}
