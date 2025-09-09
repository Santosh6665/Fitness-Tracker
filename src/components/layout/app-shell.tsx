
"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Dumbbell,
  Flame,
  LayoutDashboard,
  Video,
  BarChart,
  Bot,
  User,
  Activity,
  NotebookPen,
} from "lucide-react";

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/icons/logo";
import { cn } from "@/lib/utils";
import { UserNav } from "@/components/layout/user-nav";
import { useAuth } from "@/components/auth/auth-provider";
import { Footer } from "./footer";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/workouts", icon: Activity, label: "Workouts" },
  { href: "/exercises", icon: Dumbbell, label: "Exercises" },
  { href: "/form-check", icon: Video, label: "Form Check" },
  { href: "/nutrition", icon: Flame, label: "Nutrition" },
  { href: "/reports", icon: BarChart, label: "Reports" },
  { href: "/ai-coach", icon: Bot, label: "AI Coach" },
];

function PageHeader() {
  const { isMobile } = useSidebar();
  const pathname = usePathname();
  const { user } = useAuth();

  const getPageTitle = () => {
    if (pathname === '/onboarding') return 'Welcome';
    if (pathname === '/nutrition-tools') return 'Advanced Nutrition Tools';
    if (pathname === '/profile') return 'Your Profile';
    const currentNav = navItems.find((item) => item.href === pathname);
    if (!currentNav) return '';
    return currentNav.label;
  }

  return (
    <header className={cn("sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 px-4 pt-4 backdrop-blur-sm sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 sm:pb-2", {
      "pl-14": !isMobile
    })}>
       <SidebarTrigger className={cn("sm:hidden", {
        "fixed left-2 top-2 z-50": isMobile,
        "-ml-14": !isMobile
      })} />
      <h1 className="text-xl font-semibold font-headline pl-12 sm:pl-0">{getPageTitle()}</h1>
      <div className="ml-auto">
        {user && <UserNav user={user} />}
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  
  if (pathname === '/login' || pathname === '/signup') {
    return (
       <main className="flex-1">{children}</main>
    )
  }

  if (isLoading || !user) {
    return null;
  }
  
  if (pathname === '/onboarding' && !user) {
    return null;
  }
  
  if (pathname === '/onboarding') {
     return (
       <main className="flex-1">{children}</main>
    )
  }


  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="border-b">
          <Link href="/" className="flex items-center gap-2">
            <Logo />
            <span className="text-lg font-semibold font-headline">
              AI Powered Fitness Tracker
            </span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={{ children: item.label, side: 'right', align: 'center' }}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="bg-background flex flex-col min-h-screen">
        <PageHeader />
        <main className="flex-1 p-4 sm:px-6 sm:py-4">{children}</main>
        {pathname !== '/' && <Footer />}
      </SidebarInset>
    </SidebarProvider>
  );
}
