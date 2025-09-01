"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Dumbbell,
  Flame,
  LayoutDashboard,
  NotebookPen,
  Video,
  Mic,
  LogOut,
  User as UserIcon,
  LogIn
} from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase/client";
import { useAuth } from "@/hooks/use-auth";

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
  SidebarFooter,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/icons/logo";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/workout-plan", icon: NotebookPen, label: "Workout Plan" },
  { href: "/exercises", icon: Dumbbell, label: "Exercises" },
  { href: "/form-check", icon: Video, label: "Form Check" },
  { href: "/nutrition", icon: Flame, label: "Nutrition" },
  { href: "/journal", icon: Mic, label: "Voice Journal" },
];

function PageHeader() {
  const { isMobile } = useSidebar();
  const pathname = usePathname();
  const currentNav = navItems.find((item) => item.href === pathname);

  const getPageTitle = () => {
    if (pathname === '/login') return 'Login';
    if (pathname === '/signup') return 'Sign Up';
    if (pathname === '/onboarding') return 'Welcome';
    return currentNav?.label;
  }

  return (
    <header className={cn("sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 sm:pt-4 sm:pb-2", {
      "pl-14": !isMobile
    })}>
       <SidebarTrigger className={cn("sm:hidden", {
        "-ml-14": !isMobile
      })} />
      <h1 className="text-xl font-semibold font-headline">{getPageTitle()}</h1>
    </header>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const isAuthPage = pathname === "/login" || pathname === "/signup";

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (isAuthPage) {
    return (
      <main className="flex-1 p-4 sm:px-6 sm:py-4">{children}</main>
    );
  }

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
        <SidebarFooter>
          <SidebarSeparator />
           {user ? (
            <div className="flex flex-col gap-3 p-2">
                <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user.photoURL || undefined} alt="User avatar" />
                        <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col text-sm overflow-hidden">
                        <span className="font-medium truncate">{user.displayName || user.email}</span>
                    </div>
                </div>
                <Button variant="ghost" size="sm" className="justify-start" onClick={handleSignOut}>
                    <LogOut />
                    <span>Sign Out</span>
                </Button>
            </div>
            ) : (
             <div className="p-2">
                <Button variant="ghost" size="sm" className="justify-start w-full" asChild>
                  <Link href="/login">
                    <LogIn />
                    <span>Login</span>
                  </Link>
                </Button>
             </div>
            )}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="bg-background">
        <PageHeader />
        <main className="flex-1 p-4 sm:px-6 sm:py-4">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
