
import Image from 'next/image';

export function Logo({ className }: { className?: string }) {
  return (
    <Image
      src="/placeholder-logo.png" // Replace with your logo's path, e.g., /logo.png
      alt="AI Powered Fitness Tracker Logo"
      width={48}
      height={48}
      className={className}
      priority // Ensures the logo loads quickly
    />
  );
}
