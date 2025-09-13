# TaskMaster AI MCP 工具集成指南

本指南详细介绍如何配置和使用 TaskMaster AI 的 MCP (Model Context Protocol) 工具，实现与 AI 编辑器的无缝集成。

## 📋 目录

1. [MCP 概述](#mcp-概述)
2. [系统要求](#系统要求)
3. [安装和配置](#安装和配置)
4. [Claude Desktop 集成](#claude-desktop-集成)
5. [Cursor 编辑器集成](#cursor-编辑器集成)
6. [MCP 工具详解](#mcp-工具详解)
7. [使用示例](#使用示例)
8. [故障排除](#故障排除)
9. [高级配置](#高级配置)

## 🔍 MCP 概述

### 什么是 MCP？

Model Context Protocol (MCP) 是一个开放标准协议，允许 AI 模型与外部工具和数据源进行交互。TaskMaster AI 通过 MCP 服务器暴露任务管理功能，让 AI 编辑器能够直接操作项目和任务。

### 核心优势

- **无缝集成**: AI 编辑器可直接访问任务管理功能
- **自然交互**: 使用自然语言操作项目和任务
- **实时同步**: 操作结果实时反映到 Web 界面
- **安全认证**: 基于 API 密钥的安全访问控制

### 支持的编辑器

- ✅ Claude Desktop
- ✅ Cursor (计划支持)
- ✅ 其他支持 MCP 的 AI 工具

## 🛠️ 系统要求

### 基础要求
- TaskMaster AI 后端服务正在运行
- Python 3.11+ 环境
- 有效的 API 密钥

### 网络要求
- MCP 服务器端口 (默认: stdio)
- 后端 API 端口 (默认: 8000)
- 网络连接正常

## 🚀 安装和配置

### 1. 启动 MCP 服务器

#### 方法一：直接启动
```bash
cd backend
source venv/bin/activate
python mcp_server/start.py
```

#### 方法二：使用 Docker
```bash
docker-compose up mcp-server
```

#### 方法三：后台运行
```bash
cd backend
source venv/bin/activate
nohup python mcp_server/start.py > mcp_server.log 2>&1 &
```

### 2. 验证服务器状态

```bash
# 检查进程
ps aux | grep mcp_server

# 查看日志
tail -f backend/mcp_server.log
```

### 3. 获取 API 密钥

1. 登录 TaskMaster AI Web 界面
2. 进入"系统设置" → "API密钥"
3. 创建新的 API 密钥
4. 复制并保存密钥（仅显示一次）

## 🖥️ Claude Desktop 集成

### 1. 找到配置文件

Claude Desktop 的 MCP 配置文件位置：

**Windows:**
```
%APPDATA%\Claude\claude_desktop_config.json
```

**macOS:**
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Linux:**
```
~/.config/claude/claude_desktop_config.json
```

### 2. 添加 MCP 配置

编辑配置文件，添加 TaskMaster AI 配置：

```json
{
  "mcpServers": {
    "taskmaster-ai": {
      "command": "python",
      "args": ["/absolute/path/to/backend/mcp_server/start.py"],
      "env": {
        "MCP_API_BASE_URL": "http://localhost:8000",
        "MCP_LOG_LEVEL": "INFO"
      }
    }
  }
}
```

**重要提示:**
- 使用绝对路径指向 `start.py` 文件
- 确保 Python 环境包含所需依赖
- 根据实际情况调整 API 基础 URL

### 3. 重启 Claude Desktop

配置完成后，重启 Claude Desktop 以加载 MCP 服务器。

### 4. 验证集成

在 Claude Desktop 中输入：
```
请帮我初始化 TaskMaster AI 项目配置
```

如果配置正确，Claude 会调用 `init_project` 工具。

## 📝 Cursor 编辑器集成

### 1. 安装 MCP 扩展

```bash
# 在 Cursor 中安装 MCP 扩展
# (具体步骤待 Cursor 正式支持 MCP 后更新)
```

### 2. 配置 MCP 服务器

在 Cursor 设置中添加 MCP 服务器配置：

```json
{
  "mcp.servers": [
    {
      "name": "taskmaster-ai",
      "command": "python",
      "args": ["/path/to/backend/mcp_server/start.py"],
      "env": {
        "MCP_API_BASE_URL": "http://localhost:8000"
      }
    }
  ]
}
```

## 🔧 MCP 工具详解

### 1. init_project

**功能**: 初始化项目配置，创建本地配置文件

**参数**:
- `api_key` (必需): API 密钥
- `project_id` (可选): 项目 ID
- `api_url` (可选): API 基础 URL
- `config_path` (可选): 配置文件路径

**示例**:
```python
init_project(
    api_key="sk-1234567890abcdef",
    project_id="1"
)
```

**返回**:
```json
{
  "success": true,
  "message": "MCP configuration initialized successfully",
  "config_path": "~/.task-manager-mcp.json",
  "user": "user@example.com",
  "available_projects": 3,
  "current_project": "1"
}
```

### 2. get_tasks

**功能**: 获取项目任务列表

**参数**:
- `project_id` (必需): 项目 ID
- `status` (可选): 任务状态筛选
- `include_subtasks` (可选): 是否包含子任务
- `api_key` (可选): API 密钥

**示例**:
```python
get_tasks(
    project_id="1",
    status="pending",
    api_key="sk-1234567890abcdef"
)
```

### 3. get_task

**功能**: 获取特定任务详情

**参数**:
- `task_id` (必需): 任务 ID
- `api_key` (可选): API 密钥

**示例**:
```python
get_task(
    task_id="123",
    api_key="sk-1234567890abcdef"
)
```

### 4. set_task_status

**功能**: 更新任务状态

**参数**:
- `task_id` (必需): 任务 ID
- `status` (必需): 新状态
- `api_key` (可选): API 密钥

**有效状态**:
- `pending`: 待处理
- `in_progress`: 进行中
- `completed`: 已完成
- `blocked`: 已阻塞
- `cancelled`: 已取消

**示例**:
```python
set_task_status(
    task_id="123",
    status="completed",
    api_key="sk-1234567890abcdef"
)
```

### 5. update_project

**功能**: 更新项目信息

**参数**:
- `project_id` (必需): 项目 ID
- `updates` (必需): 更新内容字典
- `api_key` (可选): API 密钥

**示例**:
```python
update_project(
    project_id="1",
    updates={
        "name": "新项目名称",
        "description": "更新的项目描述"
    },
    api_key="sk-1234567890abcdef"
)
```

### 6. get_progress

**功能**: 获取项目进展统计

**参数**:
- `project_id` (必需): 项目 ID
- `api_key` (可选): API 密钥

**示例**:
```python
get_progress(
    project_id="1",
    api_key="sk-1234567890abcdef"
)
```

## 💡 使用示例

### 场景 1: 项目初始化

**用户**: "帮我设置 TaskMaster AI，我的 API 密钥是 sk-abc123"

**Claude 操作**:
```python
init_project(api_key="sk-abc123")
```

**结果**: 创建配置文件，显示可用项目列表

### 场景 2: 查看任务进展

**用户**: "查看项目 1 的所有待处理任务"

**Claude 操作**:
```python
get_tasks(project_id="1", status="pending")
```

**结果**: 显示所有待处理任务的详细信息

### 场景 3: 更新任务状态

**用户**: "将任务 123 标记为已完成"

**Claude 操作**:
```python
set_task_status(task_id="123", status="completed")
```

**结果**: 任务状态更新，Web 界面同步显示

### 场景 4: 项目进展报告

**用户**: "生成项目 1 的进展报告"

**Claude 操作**:
```python
get_progress(project_id="1")
```

**结果**: 显示详细的项目统计和进展信息

### 场景 5: 批量操作

**用户**: "将项目 1 中所有进行中的任务标记为已完成"

**Claude 操作**:
```python
# 1. 获取进行中的任务
tasks = get_tasks(project_id="1", status="in_progress")

# 2. 批量更新状态
for task in tasks["tasks"]:
    set_task_status(task_id=task["id"], status="completed")
```

## 🔍 故障排除

### 常见问题

#### 1. MCP 服务器无法启动

**症状**: Claude Desktop 显示连接错误

**解决方案**:
```bash
# 检查 Python 环境
python --version

# 检查依赖
pip list | grep fastmcp

# 手动启动测试
cd backend
python mcp_server/start.py
```

#### 2. API 密钥认证失败

**症状**: 工具调用返回 "Invalid API key"

**解决方案**:
1. 确认 API 密钥有效性
2. 检查 API 密钥权限
3. 验证后端服务运行状态

```bash
# 测试 API 密钥
curl -H "Authorization: Bearer your-api-key" \
     http://localhost:8000/api/v1/auth/validate-key
```

#### 3. 网络连接问题

**症状**: 工具调用超时或连接失败

**解决方案**:
```bash
# 检查后端服务
curl http://localhost:8000/health

# 检查端口占用
netstat -an | grep :8000

# 检查防火墙设置
```

#### 4. 配置文件路径错误

**症状**: Claude Desktop 无法找到 MCP 服务器

**解决方案**:
1. 使用绝对路径
2. 确认文件存在
3. 检查文件权限

```bash
# 获取绝对路径
realpath backend/mcp_server/start.py

# 检查文件权限
ls -la backend/mcp_server/start.py
```

### 调试技巧

#### 1. 启用详细日志

```bash
# 设置环境变量
export MCP_LOG_LEVEL=DEBUG

# 启动服务器
python mcp_server/start.py --log-level DEBUG
```

#### 2. 查看 MCP 通信日志

```bash
# 查看 Claude Desktop 日志
# Windows: %APPDATA%\Claude\logs\
# macOS: ~/Library/Logs/Claude/
# Linux: ~/.local/share/claude/logs/
```

#### 3. 测试工具调用

```python
# 在 Python 中直接测试
import asyncio
from mcp_server.server import mcp

async def test_tool():
    result = await init_project(api_key="test-key")
    print(result)

asyncio.run(test_tool())
```

## ⚙️ 高级配置

### 1. 自定义配置路径

```json
{
  "mcpServers": {
    "taskmaster-ai": {
      "command": "python",
      "args": ["/path/to/start.py"],
      "env": {
        "MCP_API_BASE_URL": "http://localhost:8000",
        "MCP_CONFIG_PATH": "/custom/path/config.json",
        "MCP_LOG_LEVEL": "DEBUG"
      }
    }
  }
}
```

### 2. 多环境配置

```json
{
  "mcpServers": {
    "taskmaster-dev": {
      "command": "python",
      "args": ["/path/to/start.py"],
      "env": {
        "MCP_API_BASE_URL": "http://localhost:8000"
      }
    },
    "taskmaster-prod": {
      "command": "python",
      "args": ["/path/to/start.py"],
      "env": {
        "MCP_API_BASE_URL": "https://api.taskmaster.com"
      }
    }
  }
}
```

### 3. 性能优化

```bash
# 使用 HTTP 传输（更快）
python mcp_server/start.py --transport http --port 8001
```

```json
{
  "mcpServers": {
    "taskmaster-ai": {
      "command": "python",
      "args": ["/path/to/start.py", "--transport", "http", "--port", "8001"],
      "env": {
        "MCP_API_BASE_URL": "http://localhost:8000"
      }
    }
  }
}
```

### 4. 安全配置

```bash
# 使用环境变量存储敏感信息
export TASKMASTER_API_KEY="your-secure-api-key"
export MCP_API_BASE_URL="https://secure-api.taskmaster.com"
```

### 5. 监控和日志

```bash
# 启用系统监控
python mcp_server/start.py --enable-metrics

# 配置日志轮转
python mcp_server/start.py --log-file /var/log/mcp_server.log --log-rotate
```

## 📊 性能监控

### 1. 监控指标

- 工具调用次数
- 响应时间
- 错误率
- 内存使用

### 2. 日志分析

```bash
# 分析调用频率
grep "Tool called" mcp_server.log | wc -l

# 分析错误
grep "ERROR" mcp_server.log

# 分析响应时间
grep "Response time" mcp_server.log | awk '{print $NF}'
```

## 🔄 更新和维护

### 1. 更新 MCP 服务器

```bash
# 停止服务器
pkill -f mcp_server

# 更新代码
git pull origin main

# 重新安装依赖
pip install -r requirements.txt

# 重启服务器
python mcp_server/start.py
```

### 2. 配置备份

```bash
# 备份 Claude Desktop 配置
cp ~/.config/claude/claude_desktop_config.json \
   ~/.config/claude/claude_desktop_config.json.backup
```

### 3. 定期维护

- 检查日志文件大小
- 清理临时文件
- 更新 API 密钥
- 监控性能指标

---

通过本指南，您应该能够成功配置和使用 TaskMaster AI 的 MCP 工具集成。如有问题，请参考故障排除章节或联系技术支持。