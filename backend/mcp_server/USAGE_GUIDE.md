# Task Manager MCP Server 使用指南

## 概述

Task Manager MCP Server 是一个基于 Model Context Protocol (MCP) 的服务器，为 AI 编辑器（如 Claude Desktop、Cursor 等）提供任务管理功能。

## 功能特性

### 🛠️ MCP 工具

1. **init_project** - 初始化项目配置
2. **get_tasks** - 获取项目任务列表
3. **get_task** - 获取特定任务详情
4. **set_task_status** - 更新任务状态
5. **update_project** - 更新项目信息
6. **get_progress** - 获取项目进展统计

### 🔐 认证机制

- 支持 API 密钥认证
- 与主系统用户管理集成
- 安全的 Bearer Token 验证

## 安装和配置

### 1. 环境准备

```bash
# 进入后端目录
cd backend

# 激活虚拟环境
.\venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt
```

### 2. 启动主 API 服务器

```bash
# 启动 FastAPI 服务器
uvicorn app.main:app --reload --port 8000
```

### 3. 启动 MCP 服务器

```bash
# STDIO 模式（用于 Claude Desktop）
python mcp_server/start.py

# HTTP 模式（用于测试）
python mcp_server/start.py --transport http --port 8001
```

## Claude Desktop 集成

### 1. 获取 API 密钥

1. 访问前端应用：http://localhost:3000
2. 注册/登录用户账户
3. 在用户设置中创建 API 密钥
4. 复制生成的 API 密钥

### 2. 配置文件

将以下配置添加到 Claude Desktop 的 MCP 配置文件中：

```json
{
  "mcpServers": {
    "task-manager": {
      "command": "python",
      "args": ["E:\\path\\to\\your\\project\\backend\\mcp_server\\start.py"],
      "env": {
        "MCP_API_BASE_URL": "http://localhost:8000",
        "MCP_LOG_LEVEL": "INFO",
        "MCP_DEFAULT_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

### 3. API 密钥配置方式（三种方式任选其一）

#### 方式一：环境变量配置（推荐）

在 MCP 配置文件的 `env` 部分设置：

```json
"env": {
  "MCP_DEFAULT_API_KEY": "your-api-key-here"
}
```

#### 方式二：初始化配置文件

在 Claude Desktop 中运行一次初始化命令：

```
init_project(api_key="your-api-key-here", project_id="1")
```

这会在用户目录下创建 `~/.task-manager-mcp.json` 配置文件。

#### 方式三：每次手动传参

在每个工具调用时手动传入 API 密钥：

```
get_tasks(project_id="1", api_key="your-api-key-here")
```

### 4. 使用工具

配置完成后，可以直接使用工具而无需每次传入 API 密钥：

```
# 获取任务列表
get_tasks(project_id="1")

# 获取特定任务
get_task(task_id="123")

# 更新任务状态
set_task_status(task_id="123", status="completed")
```

## MCP 工具详细说明

### init_project

初始化 MCP 客户端配置。

**参数：**

- `api_key` (必需): API 密钥
- `project_id` (可选): 项目 ID
- `api_url` (可选): API 基础 URL
- `config_path` (可选): 配置文件保存路径

**示例：**

```python
init_project(
    api_key="sk-1234567890abcdef",
    project_id="1",
    config_path="~/.task-manager-mcp.json"
)
```

### get_tasks

获取项目的所有任务。

**参数：**

- `project_id` (必需): 项目 ID
- `status` (可选): 状态筛选
- `include_subtasks` (可选): 是否包含子任务
- `api_key` (可选): API 密钥（如已在环境变量或配置文件中设置则无需传入）

**示例：**

```python
# 使用环境变量中的 API 密钥
get_tasks(project_id="1", status="pending")

# 或手动指定 API 密钥
get_tasks(project_id="1", status="pending", api_key="sk-1234567890abcdef")
```

### get_task

获取特定任务的详细信息。

**参数：**

- `task_id` (必需): 任务 ID
- `api_key` (可选): API 密钥（如已在环境变量或配置文件中设置则无需传入）

**示例：**

```python
# 使用环境变量中的 API 密钥
get_task(task_id="123")

# 或手动指定 API 密钥
get_task(task_id="123", api_key="sk-1234567890abcdef")
```

### set_task_status

更新任务状态。

**参数：**

- `task_id` (必需): 任务 ID
- `status` (必需): 新状态 (pending, in_progress, completed, blocked, cancelled)
- `api_key` (可选): API 密钥（如已在环境变量或配置文件中设置则无需传入）

**示例：**

```python
# 使用环境变量中的 API 密钥
set_task_status(task_id="123", status="completed")

# 或手动指定 API 密钥
set_task_status(task_id="123", status="completed", api_key="sk-1234567890abcdef")
```

### update_project

更新项目信息。

**参数：**

- `project_id` (必需): 项目 ID
- `updates` (必需): 更新内容字典
- `api_key` (可选): API 密钥（如已在环境变量或配置文件中设置则无需传入）

**示例：**

```python
# 使用环境变量中的 API 密钥
update_project(
    project_id="1",
    updates={"name": "新项目名称", "description": "更新的描述"}
)

# 或手动指定 API 密钥
update_project(
    project_id="1",
    updates={"name": "新项目名称", "description": "更新的描述"},
    api_key="sk-1234567890abcdef"
)
```

### get_progress

获取项目进展统计。

**参数：**

- `project_id` (必需): 项目 ID
- `api_key` (可选): API 密钥（如已在环境变量或配置文件中设置则无需传入）

**示例：**

```python
# 使用环境变量中的 API 密钥
get_progress(project_id="1")

# 或手动指定 API 密钥
get_progress(project_id="1", api_key="sk-1234567890abcdef")
```

## 故障排除

### 常见问题

1. **连接失败**

   - 确保主 API 服务器正在运行 (http://localhost:8000)
   - 检查防火墙设置
   - 验证端口是否被占用

2. **认证失败**

   - 确认 API 密钥有效
   - 检查用户账户是否激活
   - 验证 API 密钥权限

3. **工具调用失败**
   - 检查参数格式是否正确
   - 确认项目 ID 存在
   - 查看服务器日志获取详细错误信息

### 日志调试

启用详细日志：

```bash
python mcp_server/start.py --log-level DEBUG
```

### 测试连接

使用测试脚本验证功能：

```bash
python test_mcp_integration.py
```

## 生产环境部署

### 1. 环境变量配置

创建 `.env` 文件：

```env
MCP_API_BASE_URL=https://your-api-domain.com
MCP_LOG_LEVEL=INFO
MCP_TRANSPORT_TYPE=stdio
```

### 2. 服务管理

使用 systemd 或其他服务管理器：

```ini
[Unit]
Description=Task Manager MCP Server
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/project/backend
ExecStart=/path/to/venv/bin/python mcp_server/start.py
Restart=always

[Install]
WantedBy=multi-user.target
```

### 3. 监控和日志

- 配置日志轮转
- 设置监控告警
- 定期检查服务状态

## 开发和扩展

### 添加新工具

1. 在 `server.py` 中定义新函数
2. 使用 `@mcp.tool()` 装饰器
3. 添加类型注解和文档字符串
4. 更新测试和文档

### 自定义认证

修改 `auth.py` 中的认证逻辑以支持其他认证方式。

### 性能优化

- 使用连接池
- 实现缓存机制
- 优化数据库查询

## 支持和反馈

如有问题或建议，请：

1. 查看日志文件
2. 检查配置设置
3. 参考故障排除指南
4. 联系技术支持团队
