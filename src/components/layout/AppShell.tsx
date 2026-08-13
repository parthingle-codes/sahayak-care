import type { ReactNode } from "react";
import { Search } from "lucide-react";

import { AppSidebar } from "@/components/layout/AppSidebar";
import { RoleSwitcher } from "@/components/layout/RoleSwitcher";
import { Input } from "@/components/ui/input";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { RoleProvider } from "@/hooks/use-role";

/** Shared application chrome: role-aware sidebar, top bar, content canvas. */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <RoleProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="bg-background">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur md:px-6">
            <SidebarTrigger className="-ml-1" />
            <div className="relative hidden max-w-sm flex-1 sm:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                aria-label="Search residents"
                placeholder="Search residents…"
                className="h-9 pl-9"
              />
            </div>
            <div className="ml-auto">
              <RoleSwitcher />
            </div>
          </header>
          <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
            <div className="mx-auto w-full max-w-6xl">{children}</div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </RoleProvider>
  );
}
