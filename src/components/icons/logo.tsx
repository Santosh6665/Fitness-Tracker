
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
            d="M8.5 14.5C8.5 14.5 8 13 9 12C10 11 11.5 11.5 11.5 11.5L13 13L15 8.5C15 8.5 15.5 7 14.5 6.5C13.5 6 12.5 7 12.5 7L8.5 14.5Z" 
            fill="hsl(var(--primary-foreground))"
            stroke="hsl(var(--primary-foreground))"
            strokeWidth="0.5"
            strokeLinejoin="round"
            strokeLinecap="round"
        />
        <path 
            d="M12.5 17.5C12.5 17.5 15 16 15 13.5C15 11 11.5 11.5 11.5 11.5"
            stroke="hsl(var(--primary-foreground))"
            strokeWidth="1.5"
            strokeLinecap="round"
        />
        <circle cx="13" cy="5" r="1.5" fill="hsl(var(--primary-foreground))" />
    </svg>
  );
}
