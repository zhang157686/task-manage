"use client"

import * as React from "react"
import {
  BookOpen,
  Bot,
  Command,
  Frame,
  LifeBuoy,
  Map,
  PieChart,
  Send,
  SquareTerminal,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/auth-context"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();

  const data = {
    user: {
      name: user?.username || "用户",
      email: user?.email || "user@example.com",
      avatar: "/avatars/shadcn.jpg",
    },
    navMain: [
      {
        title: "项目管理",
        url: "#",
        icon: SquareTerminal,
        isActive: true,
        items: [
          {
            title: "项目列表",
            url: "/projects",
          },
          {
            title: "创建项目",
            url: "/projects/new",
          },
        ],
      },
      {
        title: "任务管理",
        url: "#",
        icon: Bot,
        items: [
          {
            title: "任务列表",
            url: "/tasks",
          },
          {
            title: "任务生成",
            url: "/tasks/generate",
          },
        ],
      },
      {
        title: "设置",
        url: "#",
        icon: BookOpen,
        items: [
          {
            title: "AI模型配置",
            url: "/settings/models",
          },
          {
            title: "API密钥",
            url: "/settings/api-keys",
          },
        ],
      },
    ],
    navSecondary: [
      {
        title: "支持",
        url: "#",
        icon: LifeBuoy,
      },
      {
        title: "反馈",
        url: "#",
        icon: Send,
      },
    ],
    projects: [
      {
        name: "Design Engineering",
        url: "#",
        icon: Frame,
      },
      {
        name: "Sales & Marketing",
        url: "#",
        icon: PieChart,
      },
      {
        name: "Travel",
        url: "#",
        icon: Map,
      },
    ],
  };
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">TaskMaster AI</span>
                  <span className="truncate text-xs">智能任务管理</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}