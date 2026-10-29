import { Link, useRouterState } from "@tanstack/react-router";
import { HeartHandshake, ShieldCheck } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useRole } from "@/hooks/use-auth";
import { navGroupsForRole } from "@/lib/navigation";

export function AppSidebar() {
  const { role } = useRole();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const groups = navGroupsForRole(role);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border/80">
        <Link to="/dashboard" className="flex items-center gap-3 px-2 py-2.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[image:var(--gradient-soft)] text-primary shadow-sm ring-1 ring-inset ring-primary/10">
            <HeartHandshake className="size-5" aria-hidden />
          </span>
          <span className="grid group-data-[collapsible=icon]:hidden">
            <span className="font-display text-base font-semibold tracking-tight text-sidebar-foreground">
              SAHAAYAK
            </span>
            <span className="text-[11px] font-medium leading-snug tracking-wide text-muted-foreground">
              Building technology with compassion
            </span>
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
                  return (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={item.label}
                        className="h-10 rounded-lg font-medium transition-[background-color,box-shadow,color] duration-200 hover:text-foreground data-[active=true]:bg-sidebar-active! data-[active=true]:text-sidebar-active-foreground! data-[active=true]:font-semibold data-[active=true]:shadow-sm data-[active=true]:ring-1 data-[active=true]:ring-inset data-[active=true]:ring-primary/15"
                      >
                        <Link to={item.to}>
                          <item.icon />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/80 pb-1">
        <div className="mx-2 mb-2 hidden rounded-xl border border-border bg-secondary p-3 group-data-[collapsible=icon]:hidden lg:block">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <ShieldCheck className="size-3.5 text-primary" aria-hidden />
            Care with confidence
          </div>
          <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
            Care records only — not a medical decision tool.
          </p>
          <p className="mt-2 text-[10px] font-semibold tracking-[0.1em] text-muted-foreground/80 uppercase">
            SAHAAYAK · Care management
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
