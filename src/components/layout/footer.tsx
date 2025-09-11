
'use client';

import { Separator } from '@/components/ui/separator';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted/50 text-muted-foreground mt-12 border-t py-6 px-4 text-center text-sm">
        <Separator className="my-4 bg-border" />

        <div className="text-center text-sm">
          <p>© {currentYear} AI‑Powered Fitness Tracker. Built for B.Tech Final Year Major Project.</p>
          <p>Made with ❤️ by Santosh, Abneesh & Subham.</p>
        </div>
    </footer>
  );
}
