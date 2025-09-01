"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Dumbbell,
  Flame,
  LayoutDashboard,
  NotebookPen,
  Video,
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

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/workout-plan", icon: NotebookPen, label: "Workout Plan" },
  { href: "/exercises", icon: Dumbbell, label: "Exercises" },
  { href: "/form-check", icon: Video, label: "Form Check" },
  { href: "/nutrition", icon: Flame, label: "Nutrition" },
];

function PageHeader() {
  const { isMobile } = useSidebar();
  const pathname = usePathname();
  const currentNav = navItems.find((item) => item.href === pathname);

  return (
    <header className={cn("sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 sm:pt-4 sm:pb-2", {
      "pl-14": !isMobile
    })}>
       <SidebarTrigger className={cn("sm:hidden", {
        "-ml-14": !isMobile
      })} />
      <h1 className="text-xl font-semibold font-headline">{currentNav?.label}</h1>
    </header>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="border-b">
          <Link href="/" className="flex items-center gap-2">
            <Logo />
            <span className="text-lg font-semibold font-headline">
              Fitness Compass
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
      <SidebarInset className="bg-background">
        <PageHeader />
        <main className="flex-1 p-4 sm:px-6 sm:py-4">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
