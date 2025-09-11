
import Image from 'next/image';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <Image
      src="/logo.png" 
      alt="AI Powered Fitness Tracker Logo"
      width={48}
      height={48}
      className={cn("rounded-full", className)}
      priority 
    />
  );
}
