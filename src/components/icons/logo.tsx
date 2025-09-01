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
      <circle cx="12" cy="12" r="10" stroke="hsl(var(--primary))" strokeWidth="2" />
      <path
        d="M12 14L14.5 9.5L12 5L9.5 9.5L12 14Z"
        fill="hsl(var(--primary))"
        stroke="hsl(var(--primary))"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M12 19V14"
        stroke="hsl(var(--accent))"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
