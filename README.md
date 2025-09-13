# TaskMaster AI - 智能任务管理系统

<div align="center">

![TaskMaster AI](https://img.shields.io/badge/TaskMaster-AI-blue?style=for-the-badge)
![Version](https://img.shields.io/badge/version-1.0.0-green?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-orange?style=for-the-badge)

**基于人工智能的智能项目任务管理和生成系统**

[功能特性](#-功能特性) • [快速开始](#-快速开始) • [技术架构](#-技术架构) • [部署指南](#-部署指南) • [API文档](#-api文档)

</div>

---

## 📋 项目概述

TaskMaster AI 是一个现代化的智能任务管理系统，结合了人工智能技术和直观的用户界面，帮助开发者和团队高效地管理项目任务。系统支持AI自动生成任务、智能任务分析、进展跟踪，并提供MCP (Model Context Protocol) 工具集成，可与Claude Desktop等AI编辑器无缝协作。

### 🎯 核心价值

- **AI驱动**: 利用多种AI模型自动生成和优化任务规划
- **智能分析**: 实时任务进展分析和项目统计
- **无缝集成**: 通过MCP协议与AI编辑器深度集成
- **现代化UI**: 基于Next.js 15和shadcn/ui的响应式界面
- **企业级**: 完整的用户认证、权限管理和API安全

## ✨ 功能特性

### 🤖 AI智能功能
- **智能任务生成**: 基于项目描述自动生成详细任务列表
- **多模型支持**: 支持OpenAI GPT、Anthropic Claude、Google Gemini等主流AI模型
- **任务智能分析**: AI驱动的任务复杂度分析和优化建议
- **自然语言交互**: 通过MCP工具支持自然语言操作

### 📊 项目管理
- **项目创建与管理**: 完整的项目生命周期管理
- **任务状态跟踪**: 支持待处理、进行中、已完成、已阻塞、已取消等状态
- **任务优先级**: 高、中、低优先级分类管理
- **进展可视化**: 实时项目进展统计和图表展示

### 🎨 用户界面
- **现代化设计**: 基于shadcn/ui的美观界面
- **响应式布局**: 完美支持桌面端和移动端
- **多视图模式**: 列表视图、看板视图、卡片视图
- **暗色主题**: 支持明暗主题切换

### 🔧 开发者工具
- **MCP工具集成**: 与Claude Desktop等AI编辑器无缝集成
- **RESTful API**: 完整的API接口，支持第三方集成
- **API密钥管理**: 安全的API访问控制
- **实时同步**: 操作结果实时反映到所有客户端

### 🛡️ 安全特性
- **JWT认证**: 基于JSON Web Token的安全认证
- **权限控制**: 细粒度的用户权限管理
- **API安全**: 完整的API访问控制和速率限制
- **数据加密**: 敏感数据加密存储

## 🚀 快速开始

### 系统要求

- **Node.js** 18+ 
- **Python** 3.11+
- **MySQL** 8.0+
- **Redis** 7+ (可选)

### 一键启动 (推荐)

```bash
# 克隆项目
git clone https://github.com/your-org/taskmaster-ai.git
cd taskmaster-ai

# 使用Docker Compose启动所有服务
docker-compose up -d

# 等待服务启动完成后访问
# 前端: http://localhost:3000
# 后端API: http://localhost:8000
# API文档: http://localhost:8000/docs
```

### 开发环境启动

#### 1. 后端服务

```bash
cd backend

# 创建虚拟环境
python -m venv venv

# 激活虚拟环境
# Windows:
.\venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，配置数据库和API密钥

# 初始化数据库
python manage_db.py init

# 启动服务
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

#### 2. 前端服务

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

#### 3. 访问系统

- **前端应用**: http://localhost:3000
- **后端API**: http://127.0.0.1:8000
- **API文档**: http://127.0.0.1:8000/docs

#### 4. 默认登录

- **用户名**: `admin`
- **密码**: `admin123`
- **邮箱**: `admin@taskmanage.ai`

## 🏗️ 技术架构

### 系统架构图

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   前端 (Next.js) │    │  后端 (FastAPI)  │    │   数据库 (MySQL) │
│                 │────│                 │────│                 │
│  - React 19     │    │  - Python 3.11  │    │  - MySQL 8.0    │
│  - TypeScript   │    │  - SQLAlchemy   │    │  - Redis 7      │
│  - Tailwind CSS │    │  - JWT Auth     │    │                 │
│  - shadcn/ui    │    │  - AI Models    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │  MCP工具集成     │
                    │                 │
                    │  - Claude       │
                    │  - Cursor       │
                    │  - 其他AI工具    │
                    └─────────────────┘
```

### 技术栈详情

#### 前端技术栈
- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript 5
- **样式**: Tailwind CSS 4
- **组件库**: shadcn/ui + Radix UI
- **状态管理**: React Hooks + Context
- **HTTP客户端**: Axios
- **图标**: Lucide React

#### 后端技术栈
- **框架**: FastAPI 0.115
- **语言**: Python 3.11
- **数据库**: MySQL 8.0
- **ORM**: SQLAlchemy 2.0
- **认证**: JWT (python-jose)
- **密码加密**: bcrypt (passlib)
- **数据迁移**: Alembic
- **日志**: structlog
- **AI集成**: OpenAI, Anthropic, Google AI

#### 基础设施
- **容器化**: Docker + Docker Compose
- **反向代理**: Nginx
- **缓存**: Redis
- **数据库**: MySQL
- **MCP服务器**: FastMCP

## 📁 项目结构

```
taskmaster-ai/
├── frontend/                    # Next.js 前端应用
│   ├── src/
│   │   ├── app/                # App Router 页面
│   │   │   ├── (auth)/         # 认证相关页面
│   │   │   ├── projects/       # 项目管理页面
│   │   │   ├── tasks/          # 任务管理页面
│   │   │   ├── analytics/      # 数据分析页面
│   │   │   ├── settings/       # 系统设置页面
│   │   │   └── debug/          # 调试页面
│   │   ├── components/         # React 组件
│   │   │   ├── ui/             # shadcn/ui 基础组件
│   │   │   ├── layout/         # 布局组件
│   │   │   ├── forms/          # 表单组件
│   │   │   └── charts/         # 图表组件
│   │   ├── hooks/              # 自定义 Hooks
│   │   ├── lib/                # 工具函数
│   │   └── types/              # TypeScript 类型定义
│   ├── public/                 # 静态资源
│   └── package.json
│
├── backend/                     # FastAPI 后端应用
│   ├── app/
│   │   ├── api/                # API 路由
│   │   │   └── api_v1/         # API v1 版本
│   │   │       ├── endpoints/  # API 端点
│   │   │       └── api.py      # 路由汇总
│   │   ├── core/               # 核心配置
│   │   │   ├── config.py       # 应用配置
│   │   │   ├── database.py     # 数据库配置
│   │   │   ├── security.py     # 安全配置
│   │   │   └── logging.py      # 日志配置
│   │   ├── models/             # SQLAlchemy 模型
│   │   ├── schemas/            # Pydantic 模式
│   │   ├── services/           # 业务逻辑服务
│   │   └── main.py             # 应用入口
│   ├── alembic/                # 数据库迁移
│   ├── mcp_server/             # MCP 服务器
│   ├── requirements.txt        # Python 依赖
│   └── manage_db.py            # 数据库管理脚本
│
├── nginx/                       # Nginx 配置
├── scripts/                     # 部署和管理脚本
├── .taskmaster/                 # TaskMaster 配置
│   ├── config.json             # 项目配置
│   ├── tasks/                  # 任务文件
│   └── docs/                   # 项目文档
├── docker-compose.yml          # Docker 编排配置
└── README.md                   # 项目说明文档
```

## 🔧 部署指南

### Docker 部署 (推荐)

```bash
# 1. 克隆项目
git clone https://github.com/your-org/taskmaster-ai.git
cd taskmaster-ai

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，设置数据库密码和API密钥

# 3. 启动所有服务
docker-compose up -d

# 4. 检查服务状态
docker-compose ps

# 5. 查看日志
docker-compose logs -f
```

### 生产环境部署

详细的生产环境部署指南请参考 [DEPLOYMENT.md](DEPLOYMENT.md)

### MCP工具集成

详细的MCP工具集成指南请参考 [MCP_INTEGRATION_GUIDE.md](MCP_INTEGRATION_GUIDE.md)

## 📚 API文档

### 认证端点
- `POST /api/v1/auth/login` - 用户登录
- `POST /api/v1/auth/register` - 用户注册
- `POST /api/v1/auth/refresh` - 刷新令牌
- `GET /api/v1/auth/validate-key` - 验证API密钥

### 项目管理
- `GET /api/v1/projects` - 获取项目列表
- `POST /api/v1/projects` - 创建新项目
- `GET /api/v1/projects/{id}` - 获取项目详情
- `PUT /api/v1/projects/{id}` - 更新项目
- `DELETE /api/v1/projects/{id}` - 删除项目

### 任务管理
- `GET /api/v1/projects/{id}/tasks` - 获取项目任务
- `POST /api/v1/projects/{id}/tasks` - 创建任务
- `PUT /api/v1/tasks/{id}` - 更新任务
- `DELETE /api/v1/tasks/{id}` - 删除任务
- `POST /api/v1/tasks/generate` - AI生成任务

### AI模型配置
- `GET /api/v1/models` - 获取模型配置
- `POST /api/v1/models` - 创建模型配置
- `PUT /api/v1/models/{id}` - 更新模型配置
- `DELETE /api/v1/models/{id}` - 删除模型配置

### API密钥管理
- `GET /api/v1/access-keys` - 获取API密钥列表
- `POST /api/v1/access-keys` - 创建API密钥
- `PUT /api/v1/access-keys/{id}` - 更新API密钥
- `DELETE /api/v1/access-keys/{id}` - 删除API密钥

完整的API文档可在运行后端服务后访问: http://127.0.0.1:8000/docs

## 🛠️ 开发指南

### 环境配置

1. **后端开发环境**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# 或 .\venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

2. **前端开发环境**
```bash
cd frontend
npm install
npm run dev
```

3. **数据库管理**
```bash
# 测试数据库连接
python manage_db.py test-connection

# 初始化数据库
python manage_db.py init

# 创建迁移
alembic revision --autogenerate -m "描述"

# 应用迁移
alembic upgrade head
```

### 代码规范

- **前端**: 使用 ESLint + Prettier
- **后端**: 使用 Black + isort
- **提交**: 遵循 Conventional Commits 规范

### 测试

```bash
# 后端测试
cd backend
pytest

# 前端测试
cd frontend
npm test
```

## 🤝 贡献指南

我们欢迎所有形式的贡献！请查看 [CONTRIBUTING.md](CONTRIBUTING.md) 了解详细信息。

### 贡献流程

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🆘 支持与帮助

### 文档资源
- [用户使用手册](USER_MANUAL.md)
- [部署指南](DEPLOYMENT.md)
- [MCP集成指南](MCP_INTEGRATION_GUIDE.md)
- [故障排除指南](TROUBLESHOOTING.md)
- [登录指南](LOGIN_GUIDE.md)

### 常见问题

**Q: 如何重置管理员密码？**
A: 使用数据库管理脚本：`python manage_db.py reset-admin-password`

**Q: 如何配置AI模型？**
A: 登录后访问"系统设置" → "AI模型配置"，添加您的API密钥

**Q: MCP工具无法连接？**
A: 请参考 [MCP_INTEGRATION_GUIDE.md](MCP_INTEGRATION_GUIDE.md) 中的故障排除章节

### 技术支持

- **GitHub Issues**: [提交问题](https://github.com/your-org/taskmaster-ai/issues)
- **讨论区**: [GitHub Discussions](https://github.com/your-org/taskmaster-ai/discussions)
- **邮箱支持**: support@taskmaster-ai.com

## 🎉 致谢

感谢所有为 TaskMaster AI 项目做出贡献的开发者和用户！

### 技术致谢
- [Next.js](https://nextjs.org/) - React 框架
- [FastAPI](https://fastapi.tiangolo.com/) - Python Web 框架
- [shadcn/ui](https://ui.shadcn.com/) - UI 组件库
- [SQLAlchemy](https://www.sqlalchemy.org/) - Python ORM
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架

---

<div align="center">

**[⬆ 回到顶部](#taskmaster-ai---智能任务管理系统)**

Made with ❤️ by TaskMaster AI Team

</div>