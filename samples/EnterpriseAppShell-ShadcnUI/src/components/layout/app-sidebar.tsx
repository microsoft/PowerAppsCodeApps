import * as React from "react"

import { MODULES } from "@/app/modules"
import type { AppModule } from "@/lib/module"
import { NavApps, type AppNavGroup } from "./nav-apps"
import { NavMain } from "./nav-main"
import { NavSecondary } from "./nav-secondary"
import { NavUser } from "./nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { CommandIcon } from "lucide-react"

const user = {
  name: "shadcn",
  email: "m@example.com",
  avatar: "/avatars/shadcn.jpg",
}

// Every nav entry comes from the module registry — a module that isn't in
// `src/app/modules.ts` simply doesn't appear here.
const navItems = (group: AppModule["group"]) =>
  MODULES.filter((module) => module.group === group).flatMap((module) =>
    module.routes
      .filter((route) => route.nav)
      .map((route) => ({
        title: route.nav!,
        url: `/${route.path}`,
        icon: module.icon,
      }))
  )

const navMain = navItems("main")
const navSecondary = navItems("secondary")

const apps: AppNavGroup[] = MODULES.filter(
  (module) => module.group === "apps"
).map((module) => ({
  title: module.title,
  icon: module.icon,
  items: module.routes
    .filter((route) => route.nav)
    .map((route) => ({
      title: route.nav!,
      url: `/${route.path}`,
      nested: route.nested,
    })),
}))

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="#">
                <CommandIcon className="size-5!" />
                <span className="text-base font-semibold">Acme Inc.</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavApps apps={apps} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}

