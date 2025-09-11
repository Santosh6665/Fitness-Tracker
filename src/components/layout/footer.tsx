
'use client';

import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="bg-muted/50 text-muted-foreground mt-auto border-t py-6 px-4 text-center text-sm">
        <div className="text-center text-sm space-y-2">
          <p>AI‑Powered Fitness Tracker. Built for B.Tech Final Year Major Project.</p>
          <Separator />
          <p>Made with ❤️ by Santosh Chaudhary</p>
        </div>
    </footer>
  );
}
