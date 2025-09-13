"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

interface BreadcrumbItem {
  label: string
  href?: string
}

const routeMap: Record<string, string> = {
  "": "首页",
  "projects": "项目管理",
  "tasks": "任务管理", 
  "settings": "设置",
  "models": "AI模型配置",
  "api-keys": "API密钥",
  "new": "新建",
  "generate": "生成",
}

export function BreadcrumbNav() {
  const pathname = usePathname()
  
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const segments = pathname.split("/").filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = [
      { label: "首页", href: "/" }
    ]
    
    let currentPath = ""
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`
      const label = routeMap[segment] || segment
      
      if (index === segments.length - 1) {
        // 最后一个不需要链接
        breadcrumbs.push({ label })
      } else {
        breadcrumbs.push({ label, href: currentPath })
      }
    })
    
    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  if (breadcrumbs.length <= 1) {
    return null
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((item, index) => (
          <div key={index} className="flex items-center">
            {index > 0 && (
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
            )}
            <BreadcrumbItem>
              {item.href ? (
                <BreadcrumbLink asChild>
                  <Link href={item.href} className="flex items-center">
                    {index === 0 && <Home className="h-4 w-4 mr-1" />}
                    {item.label}
                  </Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}