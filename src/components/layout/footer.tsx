
'use client';

import Link from 'next/link';
import { Logo } from '@/components/icons/logo';
import { Separator } from '@/components/ui/separator';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted/50 text-muted-foreground mt-12 border-t hidden md:block">
      <div className="container mx-auto px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Column 1: Team Info */}
          <div className="md:col-span-5 lg:col-span-4">
            <div className="flex items-center gap-3 mb-4">
              <Logo />
              <h2 className="text-xl font-bold font-headline text-foreground">
                AI Powered Fitness Tracker
              </h2>
            </div>
            <p className="text-sm ">
              AI‑Powered Fitness Tracker — personalized insights for workouts, nutrition, recovery, and goals.
            </p>
          </div>

          {/* Spacer Column */}
          <div className="hidden md:block md:col-span-2 lg:col-span-4"></div>

          {/* Column 2: Quick Links */}
          <div className="md:col-span-5 lg:col-span-4 grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Project</h3>
              <ul className="mt-4 space-y-3">
                <li><Link href="#" className="hover:text-primary transition-colors">Features</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Docs</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Changelog</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Roadmap</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Legal</h3>
              <ul className="mt-4 space-y-3">
                <li><Link href="#" className="hover:text-primary transition-colors">Privacy</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Terms</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <Separator className="my-4 bg-border" />

        <div className="text-center text-sm">
          <p>© {currentYear} CodeCrafters. Built for B.Tech Final Year Major Project.</p>
          <p>Made with ❤️ by Santosh, Abneesh & Subham.</p>
        </div>
      </div>
    </footer>
  );
}
