import { Link, useRouterState } from "@tanstack/react-router";
import { HeartHandshake } from "lucide-react";

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
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/dashboard" className="flex items-center gap-3 px-2 py-2.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <HeartHandshake className="size-5" />
          </span>
          <span className="grid group-data-[collapsible=icon]:hidden">
            <span className="font-display text-base font-semibold tracking-tight">SAHAAYAK</span>
            <span className="text-xs text-muted-foreground">Elderly care platform</span>
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
                  return (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton asChild isActive={active} tooltip={item.label}>
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

      <SidebarFooter className="border-t border-sidebar-border">
        <p className="px-2 py-1 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
          Care records only — not a medical decision tool.
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
