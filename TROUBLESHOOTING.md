# TaskMaster AI 故障排除指南

## 问题：创建项目按钮一直显示 "Loading project..."

### 问题原因

这个问题通常是由以下原因之一引起的：

1. **用户未登录** - 系统需要用户认证才能创建项目
2. **API 连接失败** - 前端无法连接到后端服务
3. **路由配置问题** - `/projects/new` 页面缺失或配置错误

### 解决方案

#### 1. 确保用户已登录

**默认管理员账户：**

- 用户名：`admin`
- 密码：`admin123`

**登录步骤：**

1. 访问 http://localhost:3000/login
2. 输入上述用户名和密码
3. 点击登录按钮
4. 登录成功后会自动跳转到首页

#### 2. 检查系统状态

访问调试页面：http://localhost:3000/debug

该页面会显示：

- API 连接状态
- 系统配置信息
- 默认登录信息
- 故障排除指南

#### 3. 确保后端服务运行

```bash
# 进入后端目录
cd backend

# 激活虚拟环境
.\venv\Scripts\activate  # Windows
# 或
source venv/bin/activate  # Linux/Mac

# 启动后端服务
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

后端服务应该运行在：http://127.0.0.1:8000

#### 4. 确保前端服务运行

```bash
# 进入前端目录
cd frontend

# 启动前端服务
npm run dev
```

前端服务应该运行在：http://localhost:3000

#### 5. 检查数据库连接

确保 MySQL 服务正在运行：

- 主机：localhost
- 端口：3303
- 数据库：taskmaster
- 用户名：root
- 密码：123456

### 验证修复

1. 访问 http://localhost:3000/debug 检查系统状态
2. 使用默认账户登录：http://localhost:3000/login
3. 访问项目页面：http://localhost:3000/projects
4. 点击 "New Project" 按钮
5. 或直接访问：http://localhost:3000/projects/new

### 常见错误信息

- **"请先登录后再创建项目"** - 用户未认证，需要登录
- **"您没有权限创建项目"** - 权限问题，检查用户角色
- **"创建项目失败: Network Error"** - API 连接失败，检查后端服务
- **"401 Unauthorized"** - 认证失败，重新登录

### 技术细节

#### 修复内容

1. **创建了缺失的页面文件**：
   - `frontend/src/app/projects/new/page.tsx` - 项目创建页面
   - `frontend/src/app/projects/stats/page.tsx` - 项目统计页面
   - `frontend/src/app/tasks/page.tsx` - 任务列表页面
   - `frontend/src/app/tasks/generate/page.tsx` - 任务生成页面
   - `frontend/src/app/tasks/kanban/page.tsx` - 任务看板页面
   - `frontend/src/app/analytics/overview/page.tsx` - 数据分析概览
   - `frontend/src/app/analytics/tasks/page.tsx` - 任务分析页面
   - `frontend/src/app/analytics/efficiency/page.tsx` - 效率分析页面
   - `frontend/src/app/progress/page.tsx` - 进展文档页面
   - `frontend/src/app/progress/export/page.tsx` - 报告导出页面
   - `frontend/src/app/settings/mcp/page.tsx` - MCP工具配置页面
   - `frontend/src/app/settings/preferences/page.tsx` - 系统偏好设置页面

2. **修复了 API URL 配置**：从 `localhost:8000` 改为 `127.0.0.1:8000`
3. **添加了错误处理**：更好的错误提示和用户引导
4. **创建了调试页面**：`/debug` 用于系统状态检查

#### 文件结构

```
frontend/src/app/
├── projects/
│   ├── new/
│   │   └── page.tsx          # ✅ 新创建的页面
│   └── page.tsx              # 项目列表页面
├── debug/
│   └── page.tsx              # ✅ 新创建的调试页面
└── login/
    └── page.tsx              # 登录页面
```

### 联系支持

如果问题仍然存在，请：

1. 检查浏览器控制台的错误信息
2. 查看后端日志输出
3. 确认所有服务都在正确的端口运行
4. 验证数据库连接状态

---

_最后更新：2025 年 9 月 13 日_
