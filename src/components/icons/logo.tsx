
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
        <defs>
            <linearGradient id="pulse-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="hsl(var(--chart-2))" />
            <stop offset="100%" stopColor="hsl(var(--primary))" />
            </linearGradient>
        </defs>
        <rect width="24" height="24" rx="6" ry="6" fill="url(#pulse-gradient)" />
        <path
            d="M5 12H8L10.5 5L13.5 19L16 12H19"
            stroke="hsl(var(--primary-foreground))"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M17 10L16 12L17 14"
            stroke="hsl(var(--primary-foreground))"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
  );
}
