"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function KeyboardShortcuts() {
  const router = useRouter()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 检查是否按下了 Ctrl/Cmd 键
      const isCtrlOrCmd = event.ctrlKey || event.metaKey

      if (isCtrlOrCmd) {
        switch (event.key) {
          case 'k':
            event.preventDefault()
            // 触发搜索
            const searchInput = document.querySelector('input[placeholder*="搜索"]') as HTMLInputElement
            if (searchInput) {
              searchInput.focus()
            }
            break
          
          case 'n':
            event.preventDefault()
            // 新建项目
            router.push('/projects/new')
            toast.success('快捷键: 新建项目')
            break
          
          case 'h':
            event.preventDefault()
            // 回到首页
            router.push('/')
            toast.success('快捷键: 返回首页')
            break
          
          case 'p':
            event.preventDefault()
            // 项目列表
            router.push('/projects')
            toast.success('快捷键: 项目列表')
            break
          
          case 't':
            event.preventDefault()
            // 任务管理
            router.push('/tasks')
            toast.success('快捷键: 任务管理')
            break
          
          case ',':
            event.preventDefault()
            // 设置页面
            router.push('/settings')
            toast.success('快捷键: 设置')
            break
          
          case '/':
            event.preventDefault()
            // 显示快捷键帮助
            showShortcutsHelp()
            break
        }
      }

      // ESC 键关闭模态框等
      if (event.key === 'Escape') {
        // 这里可以添加关闭模态框的逻辑
        const openDialogs = document.querySelectorAll('[role="dialog"]')
        if (openDialogs.length > 0) {
          // 触发关闭最后一个打开的对话框
          const lastDialog = openDialogs[openDialogs.length - 1]
          const closeButton = lastDialog.querySelector('[data-dialog-close]') as HTMLButtonElement
          if (closeButton) {
            closeButton.click()
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [router])

  const showShortcutsHelp = () => {
    toast.info(
      <div className="space-y-2">
        <div className="font-semibold">快捷键帮助</div>
        <div className="text-sm space-y-1">
          <div><kbd className="px-1 py-0.5 text-xs bg-muted rounded">Ctrl+K</kbd> 搜索</div>
          <div><kbd className="px-1 py-0.5 text-xs bg-muted rounded">Ctrl+N</kbd> 新建项目</div>
          <div><kbd className="px-1 py-0.5 text-xs bg-muted rounded">Ctrl+H</kbd> 返回首页</div>
          <div><kbd className="px-1 py-0.5 text-xs bg-muted rounded">Ctrl+P</kbd> 项目列表</div>
          <div><kbd className="px-1 py-0.5 text-xs bg-muted rounded">Ctrl+T</kbd> 任务管理</div>
          <div><kbd className="px-1 py-0.5 text-xs bg-muted rounded">Ctrl+,</kbd> 设置</div>
          <div><kbd className="px-1 py-0.5 text-xs bg-muted rounded">ESC</kbd> 关闭对话框</div>
        </div>
      </div>,
      { duration: 5000 }
    )
  }

  return null // 这个组件不渲染任何内容
}