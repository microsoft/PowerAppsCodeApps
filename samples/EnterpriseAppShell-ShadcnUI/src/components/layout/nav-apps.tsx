import { ChevronRightIcon } from "lucide-react"
import { Link, useLocation } from "react-router"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

export type AppNavGroup = {
  title: string
  icon?: React.ReactNode
  items: { title: string; url: string; nested?: boolean }[]
}

export function NavApps({ apps }: { apps: AppNavGroup[] }) {
  const { pathname } = useLocation()

  const isItemActive = (item: AppNavGroup["items"][number]) =>
    pathname === item.url ||
    (item.nested === true && pathname.startsWith(`${item.url}/`))

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Apps</SidebarGroupLabel>
      <SidebarMenu>
        {apps.map((app) => {
          const hasActiveChild = app.items.some(isItemActive)

          return (
            <Collapsible
              // Remount when the active state flips so the group follows the route.
              key={`${app.title}-${hasActiveChild}`}
              asChild
              defaultOpen={hasActiveChild}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={app.title}>
                    {app.icon}
                    <span>{app.title}</span>
                    <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {app.items.map((item) => (
                      <SidebarMenuSubItem key={item.title}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={isItemActive(item)}
                        >
                          <Link to={item.url}>
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
