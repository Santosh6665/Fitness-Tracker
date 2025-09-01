
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="32"
      height="32"
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-labelledby="title"
    >
        <title>AI Powered Fitness Tracker</title>
        <defs>
            <linearGradient id="logo-bg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="hsl(var(--chart-2))"/>
                <stop offset="1" stopColor="hsl(var(--primary))"/>
            </linearGradient>
            <linearGradient id="logo-fg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="hsl(var(--sidebar-primary-foreground))"/>
                <stop offset="1" stopColor="hsl(var(--secondary))"/>
            </linearGradient>
            <filter id="logo-glow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="0" stdDeviation="12" floodColor="hsl(var(--chart-2))" floodOpacity="0.6"/>
            </filter>
        </defs>

        <rect width="512" height="512" rx="120" fill="url(#logo-bg)"/>

        <circle cx="256" cy="256" r="160" stroke="url(#logo-fg)" strokeWidth="20" fill="none" filter="url(#logo-glow)"/>

        <path d="M136 256 H200 L224 296 L256 200 L288 312 L312 256 H376"
            stroke="url(#logo-fg)" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" fill="none"/>

        <circle cx="256" cy="128" r="12" fill="url(#logo-fg)"/>
        <circle cx="176" cy="176" r="8" fill="url(#logo-fg)"/>
        <circle cx="336" cy="176" r="8" fill="url(#logo-fg)"/>
        <circle cx="176" cy="336" r="8" fill="url(#logo-fg)"/>
        <circle cx="336" cy="336" r="8" fill="url(#logo-fg)"/>
    </svg>
  );
}
