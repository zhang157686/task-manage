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
  Settings,
  FileText,
  BarChart3,
  Key,
  Zap,
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
          {
            title: "项目统计",
            url: "/projects/stats",
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
          {
            title: "任务看板",
            url: "/tasks/kanban",
          },
        ],
      },
      {
        title: "进展文档",
        url: "#",
        icon: FileText,
        items: [
          {
            title: "文档管理",
            url: "/progress",
          },
          {
            title: "导出报告",
            url: "/progress/export",
          },
        ],
      },
      {
        title: "数据分析",
        url: "#",
        icon: BarChart3,
        items: [
          {
            title: "项目概览",
            url: "/analytics/overview",
          },
          {
            title: "任务统计",
            url: "/analytics/tasks",
          },
          {
            title: "效率分析",
            url: "/analytics/efficiency",
          },
        ],
      },
      {
        title: "系统设置",
        url: "#",
        icon: Settings,
        items: [
          {
            title: "AI模型配置",
            url: "/settings/models",
          },
          {
            title: "API密钥",
            url: "/settings/api-keys",
          },
          {
            title: "MCP工具",
            url: "/settings/mcp",
          },
          {
            title: "系统偏好",
            url: "/settings/preferences",
          },
        ],
      },
    ],
    navSecondary: [
      {
        title: "快捷键",
        url: "#",
        icon: Zap,
      },
      {
        title: "帮助文档",
        url: "#",
        icon: LifeBuoy,
      },
      {
        title: "反馈建议",
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