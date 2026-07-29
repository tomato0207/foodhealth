export default function HealthIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 480 480"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <defs>
        <radialGradient id="glow" cx="50%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#d1fae5" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#d1fae5" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="bowl" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
      </defs>

      <circle cx="240" cy="200" r="220" fill="url(#glow)" />

      {/* floating leaves */}
      <path d="M96 118c26-22 62-18 78 8 14 24 2 54-24 62-30 10-58-6-64-34-4-20 2-28 10-36Z" fill="#86efac" opacity="0.9" />
      <path d="M368 96c22 8 34 32 26 54-8 22-32 32-52 22-18-10-24-34-14-52 8-16 24-28 40-24Z" fill="#4ade80" opacity="0.85" />

      {/* fruit accents */}
      <circle cx="120" cy="330" r="30" fill="#f97316" />
      <path d="M120 300c4-8 12-12 20-10" stroke="#166534" strokeWidth="4" strokeLinecap="round" />
      <circle cx="378" cy="300" r="24" fill="#facc15" />
      <circle cx="352" cy="360" r="18" fill="#ef4444" />

      {/* bowl */}
      <path
        d="M110 230c0-8 6-14 14-14h232c8 0 14 6 14 14 0 66-58 120-130 120s-130-54-130-120Z"
        fill="url(#bowl)"
      />
      <ellipse cx="240" cy="228" rx="140" ry="22" fill="#a7f3d0" />

      {/* contents in bowl */}
      <circle cx="190" cy="222" r="16" fill="#fde68a" />
      <circle cx="230" cy="216" r="20" fill="#fca5a5" />
      <circle cx="272" cy="222" r="15" fill="#fdba74" />
      <circle cx="252" cy="228" r="10" fill="#bef264" />
      <circle cx="206" cy="230" r="9" fill="#86efac" />
    </svg>
  );
}
