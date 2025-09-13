"use client";

import { usePathname } from 'next/navigation';
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TopNav } from "@/components/top-nav";
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts";
import { PageLoadingSpinner } from "@/components/loading-states";
import { useAuth } from "@/contexts/auth-context";

// Pages that don't require authentication
const publicPages = ['/login', '/register'];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated, loading } = useAuth();
  
  const isPublicPage = publicPages.includes(pathname);

  // Show loading spinner while checking authentication
  if (loading) {
    return <PageLoadingSpinner />;
  }

  // For public pages, render without sidebar
  if (isPublicPage) {
    return <>{children}</>;
  }

  // For protected pages, redirect to login if not authenticated
  if (!isAuthenticated) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return null;
  }

  // Render authenticated layout with sidebar
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 flex flex-col">
        <TopNav />
        <div className="flex-1 space-y-4 p-4 pt-6 overflow-auto">
          {children}
        </div>
      </main>
      <KeyboardShortcuts />
    </SidebarProvider>
  );
}