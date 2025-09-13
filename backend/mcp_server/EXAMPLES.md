# MCP Server 使用示例

本文档提供了使用优化后的 MCP 服务器的详细示例，展示了新的 API 密钥管理功能。

## 配置示例

### 1. Claude Desktop 配置（推荐方式）

在 Claude Desktop 的 MCP 配置文件中设置环境变量：

```json
{
  "mcpServers": {
    "task-manager": {
      "command": "python",
      "args": ["E:\\path\\to\\your\\project\\backend\\mcp_server\\start.py"],
      "env": {
        "MCP_API_BASE_URL": "http://localhost:8000",
        "MCP_LOG_LEVEL": "INFO",
        "MCP_DEFAULT_API_KEY": "sk-1234567890abcdef1234567890abcdef"
      }
    }
  }
}
```

### 2. 系统环境变量配置

在系统环境变量或 `.env` 文件中设置：

```bash
# Windows
set MCP_DEFAULT_API_KEY=sk-1234567890abcdef1234567890abcdef

# Linux/Mac
export MCP_DEFAULT_API_KEY=sk-1234567890abcdef1234567890abcdef
```

### 3. 配置文件方式

运行一次初始化命令创建配置文件：

```python
init_project(
    api_key="sk-1234567890abcdef1234567890abcdef",
    project_id="1"
)
```

这会在 `~/.task-manager-mcp.json` 创建配置文件：

```json
{
  "api_key": "sk-1234567890abcdef1234567890abcdef",
  "api_url": "http://localhost:8000",
  "project_id": "1",
  "user_id": 1,
  "user_email": "user@example.com",
  "available_projects": [
    {"id": "1", "name": "我的项目"}
  ],
  "created_at": "2024-01-01T00:00:00Z"
}
```

## 使用示例

### 基础用法（推荐）

配置好环境变量后，可以直接使用工具而无需每次传入 API 密钥：

```python
# 获取项目任务列表
tasks = get_tasks(project_id="1")

# 获取特定任务详情
task_detail = get_task(task_id="123")

# 更新任务状态
result = set_task_status(task_id="123", status="completed")

# 获取项目进展
progress = get_progress(project_id="1")

# 更新项目信息
update_result = update_project(
    project_id="1",
    updates={
        "name": "更新的项目名称",
        "description": "新的项目描述"
    }
)
```

### 手动指定 API 密钥（兼容旧版本）

如果需要使用不同的 API 密钥或覆盖默认设置：

```python
# 使用特定的 API 密钥
tasks = get_tasks(
    project_id="1",
    api_key="sk-different-key-here"
)

# 为不同用户获取任务
admin_tasks = get_tasks(
    project_id="1",
    api_key="sk-admin-key-here"
)
```

### 错误处理示例

```python
# 获取任务时的错误处理
result = get_tasks(project_id="1")

if result["success"]:
    tasks = result["tasks"]
    print(f"获取到 {result['total_count']} 个任务")
    for task in tasks:
        print(f"- {task['title']}: {task['status']}")
else:
    print(f"获取任务失败: {result['error']}")
    
    # 根据错误类型进行处理
    if "API key required" in result["error"]:
        print("请设置 MCP_DEFAULT_API_KEY 环境变量或运行 init_project")
    elif "Invalid API key" in result["error"]:
        print("API 密钥无效，请检查密钥是否正确")
```

## 完整工作流示例

### 项目管理工作流

```python
# 1. 初始化项目配置（仅需运行一次）
init_result = init_project(
    api_key="your-api-key-here",
    project_id="1"
)

if init_result["success"]:
    print(f"配置初始化成功，用户: {init_result['user']}")
    print(f"可用项目数: {init_result['available_projects']}")

# 2. 获取项目进展概览
progress = get_progress(project_id="1")
if progress["success"]:
    stats = progress["progress"]
    print(f"项目进展: {stats['completion_percentage']:.1f}%")
    print(f"总任务: {stats['total_tasks']}")
    print(f"已完成: {stats['completed_tasks']}")

# 3. 获取待处理任务
pending_tasks = get_tasks(project_id="1", status="pending")
if pending_tasks["success"]:
    print(f"\n待处理任务 ({pending_tasks['total_count']} 个):")
    for task in pending_tasks["tasks"]:
        print(f"- [{task['id']}] {task['title']}")

# 4. 处理特定任务
task_id = "123"
task_detail = get_task(task_id=task_id)
if task_detail["success"]:
    task = task_detail["task"]
    print(f"\n任务详情: {task['title']}")
    print(f"描述: {task['description']}")
    print(f"当前状态: {task['status']}")
    
    # 开始处理任务
    start_result = set_task_status(task_id=task_id, status="in_progress")
    if start_result["success"]:
        print("任务状态已更新为进行中")
        
        # 模拟任务完成
        complete_result = set_task_status(task_id=task_id, status="completed")
        if complete_result["success"]:
            print("任务已完成！")

# 5. 更新项目信息
project_update = update_project(
    project_id="1",
    updates={
        "progress_notes": "完成了任务 #123，项目进展顺利",
        "last_updated": "2024-01-01T12:00:00Z"
    }
)
if project_update["success"]:
    print("项目信息已更新")
```

### 批量任务处理示例

```python
# 批量更新任务状态
def batch_update_tasks(project_id, task_updates):
    """批量更新任务状态"""
    results = []
    
    for task_id, new_status in task_updates.items():
        result = set_task_status(task_id=task_id, status=new_status)
        results.append({
            "task_id": task_id,
            "status": new_status,
            "success": result["success"],
            "error": result.get("error")
        })
    
    return results

# 使用示例
updates = {
    "101": "completed",
    "102": "in_progress",
    "103": "blocked"
}

batch_results = batch_update_tasks("1", updates)
for result in batch_results:
    if result["success"]:
        print(f"✅ 任务 {result['task_id']} 状态更新为 {result['status']}")
    else:
        print(f"❌ 任务 {result['task_id']} 更新失败: {result['error']}")
```

## 调试和故障排除

### 启用详细日志

```json
{
  "mcpServers": {
    "task-manager": {
      "command": "python",
      "args": ["path/to/mcp_server/start.py"],
      "env": {
        "MCP_LOG_LEVEL": "DEBUG",
        "MCP_DEFAULT_API_KEY": "your-key"
      }
    }
  }
}
```

### 测试连接

```python
# 测试 API 密钥是否有效
test_result = get_progress(project_id="1")
if test_result["success"]:
    print("✅ MCP 服务器连接正常")
    print(f"当前用户: {test_result.get('user', 'Unknown')}")
else:
    print("❌ 连接失败:", test_result["error"])
```

### 常见问题解决

```python
# 检查 API 密钥配置
import os
from mcp_server.config import config

print("当前配置:")
print(f"API Base URL: {config.api_base_url}")
print(f"默认 API 密钥: {'已设置' if config.default_api_key else '未设置'}")
print(f"配置文件路径: {config.config_file_path}")

# 测试 API 密钥解析
test_key = config.get_api_key()
if test_key:
    print(f"✅ API 密钥已找到: {test_key[:10]}...")
else:
    print("❌ 未找到 API 密钥，请检查配置")
```

## 最佳实践

1. **使用环境变量**：推荐在 MCP 配置中设置 `MCP_DEFAULT_API_KEY`
2. **避免硬编码**：不要在代码中直接写入 API 密钥
3. **错误处理**：始终检查返回结果的 `success` 字段
4. **日志记录**：在生产环境中使用适当的日志级别
5. **密钥轮换**：定期更新 API 密钥以提高安全性

## 迁移指南

### 从旧版本迁移

如果你之前使用的是需要手动传入 API 密钥的版本：

**旧版本用法：**
```python
get_tasks(project_id="1", api_key="sk-1234567890abcdef")
```

**新版本用法：**
```python
# 1. 在 MCP 配置中设置环境变量
# 2. 直接调用，无需传入 API 密钥
get_tasks(project_id="1")
```

**兼容性说明：**
- 旧版本的手动传参方式仍然支持
- 可以逐步迁移，不需要一次性修改所有代码
- 新版本提供更好的用户体验和更少的重复代码