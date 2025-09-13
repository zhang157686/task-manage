"use client"

import { Bell, Search, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { BreadcrumbNav } from "@/components/breadcrumb-nav"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function TopNav() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      
      {/* 面包屑导航 */}
      <div className="flex-1">
        <BreadcrumbNav />
      </div>

      {/* 搜索框 */}
      <div className="hidden md:flex items-center space-x-2">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索项目、任务..."
            className="pl-8 w-64"
          />
        </div>
      </div>

      {/* 右侧操作区 */}
      <div className="flex items-center space-x-2">
        {/* 通知 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
              >
                3
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>通知</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">任务已完成</p>
                <p className="text-xs text-muted-foreground">
                  "设计用户界面" 任务已标记为完成
                </p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">新项目创建</p>
                <p className="text-xs text-muted-foreground">
                  项目 "移动应用开发" 已创建
                </p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">AI模型更新</p>
                <p className="text-xs text-muted-foreground">
                  GPT-4 模型配置已更新
                </p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center">
              查看全部通知
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 快速设置 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>快速设置</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <a href="/settings/models" className="flex items-center">
                AI模型配置
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <a href="/settings/api-keys" className="flex items-center">
                API密钥管理
              </a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              系统偏好设置
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 主题切换 */}
        <ThemeToggle />
      </div>
    </header>
  )
}