# TaskMaster AI 部署指南

本文档提供了 TaskMaster AI 系统的完整部署指南，包括开发环境和生产环境的部署方式。

## 📋 系统要求

### 最低配置
- **CPU**: 2核心
- **内存**: 4GB RAM
- **存储**: 20GB 可用空间
- **操作系统**: Linux (Ubuntu 20.04+), macOS, Windows 10+

### 推荐配置
- **CPU**: 4核心
- **内存**: 8GB RAM
- **存储**: 50GB SSD
- **操作系统**: Ubuntu 22.04 LTS

## 🛠️ 依赖软件

### 开发环境
- Node.js 18+
- Python 3.11+
- MySQL 8.0+
- Redis 7+ (可选)

### 生产环境
- Docker 20.10+
- Docker Compose 2.0+

## 🚀 快速部署（生产环境）

### 1. 克隆项目
```bash
git clone https://github.com/your-org/taskmaster-ai.git
cd taskmaster-ai
```

### 2. 配置环境变量
```bash
cp .env.example .env
# 编辑 .env 文件，配置数据库密码和API密钥
nano .env
```

### 3. 运行部署脚本
```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

### 4. 访问系统
- 前端应用: http://localhost:3000
- 后端API: http://localhost:8000
- API文档: http://localhost:8000/docs

## 🛠️ 开发环境部署

### 1. 环境设置
```bash
chmod +x scripts/dev-setup.sh
./scripts/dev-setup.sh
```

### 2. 配置数据库
```bash
# 启动MySQL（如果使用Docker）
docker run -d --name mysql \
  -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=123456 \
  -e MYSQL_DATABASE=taskmaster \
  mysql:8.0

# 或者使用本地MySQL
mysql -u root -p
CREATE DATABASE taskmaster;
```

### 3. 运行数据库迁移
```bash
cd backend
source venv/bin/activate
alembic upgrade head
```

### 4. 启动开发服务器
```bash
./start-dev.sh
```

## 🐳 Docker 部署详解

### 服务架构
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    Nginx    │    │  Frontend   │    │   Backend   │
│   (Port 80) │────│ (Port 3000) │────│ (Port 8000) │
└─────────────┘    └─────────────┘    └─────────────┘
                                              │
                   ┌─────────────┐    ┌─────────────┐
                   │    Redis    │    │    MySQL    │
                   │ (Port 6379) │    │ (Port 3306) │
                   └─────────────┘    └─────────────┘
```

### 服务说明

#### Frontend (Next.js)
- **端口**: 3000
- **功能**: 用户界面，React应用
- **依赖**: Backend API

#### Backend (FastAPI)
- **端口**: 8000
- **功能**: REST API，业务逻辑
- **依赖**: MySQL, Redis

#### MySQL
- **端口**: 3306
- **功能**: 主数据库
- **数据持久化**: Docker Volume

#### Redis
- **端口**: 6379
- **功能**: 缓存，会话存储
- **数据持久化**: Docker Volume

#### Nginx
- **端口**: 80, 443
- **功能**: 反向代理，负载均衡
- **配置**: 静态文件缓存，GZIP压缩

### Docker Compose 命令

```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f [service_name]

# 重启服务
docker-compose restart [service_name]

# 停止所有服务
docker-compose down

# 重新构建并启动
docker-compose up -d --build

# 清理所有数据（危险操作）
docker-compose down -v --remove-orphans
```

## 🔧 配置说明

### 环境变量

#### 数据库配置
```env
MYSQL_ROOT_PASSWORD=your_secure_password
MYSQL_DATABASE=taskmaster
MYSQL_USER=taskmaster
MYSQL_PASSWORD=your_mysql_password
```

#### API密钥配置
```env
SECRET_KEY=your_jwt_secret_key_here
OPENAI_API_KEY=sk-your_openai_key
PERPLEXITY_API_KEY=pplx-your_perplexity_key
```

#### 服务端口配置
```env
FRONTEND_PORT=3000
BACKEND_PORT=8000
MYSQL_PORT=3306
REDIS_PORT=6379
NGINX_PORT=80
```

### 数据库迁移

```bash
# 创建新迁移
docker-compose exec backend alembic revision --autogenerate -m "description"

# 应用迁移
docker-compose exec backend alembic upgrade head

# 回滚迁移
docker-compose exec backend alembic downgrade -1
```

## 🔒 安全配置

### 1. 更改默认密码
```bash
# 生成安全的密码
openssl rand -base64 32

# 更新 .env 文件中的密码
MYSQL_ROOT_PASSWORD=generated_secure_password
SECRET_KEY=generated_jwt_secret
```

### 2. 配置HTTPS（生产环境）
```bash
# 生成SSL证书（自签名，仅用于测试）
mkdir -p nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/key.pem \
  -out nginx/ssl/cert.pem

# 或使用Let's Encrypt（推荐）
certbot certonly --webroot -w /var/www/html -d yourdomain.com
```

### 3. 防火墙配置
```bash
# Ubuntu/Debian
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable

# CentOS/RHEL
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --reload
```

## 📊 监控和日志

### 日志查看
```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql

# 查看最近100行日志
docker-compose logs --tail=100 backend
```

### 健康检查
```bash
# 检查服务健康状态
curl http://localhost:8000/health

# 检查前端状态
curl http://localhost:3000

# 检查数据库连接
docker-compose exec mysql mysql -u root -p -e "SELECT 1"
```

### 性能监控
```bash
# 查看容器资源使用情况
docker stats

# 查看磁盘使用情况
docker system df

# 清理未使用的镜像和容器
docker system prune -a
```

## 🔄 备份和恢复

### 数据库备份
```bash
# 创建备份
docker-compose exec mysql mysqldump -u root -p taskmaster > backup_$(date +%Y%m%d_%H%M%S).sql

# 恢复备份
docker-compose exec -T mysql mysql -u root -p taskmaster < backup_file.sql
```

### 完整系统备份
```bash
# 停止服务
docker-compose down

# 备份数据卷
docker run --rm -v taskmaster_mysql_data:/data -v $(pwd):/backup alpine tar czf /backup/mysql_backup.tar.gz -C /data .
docker run --rm -v taskmaster_redis_data:/data -v $(pwd):/backup alpine tar czf /backup/redis_backup.tar.gz -C /data .

# 重启服务
docker-compose up -d
```

## 🚨 故障排除

### 常见问题

#### 1. 端口冲突
```bash
# 检查端口占用
netstat -tulpn | grep :3000
netstat -tulpn | grep :8000

# 修改 .env 文件中的端口配置
FRONTEND_PORT=3001
BACKEND_PORT=8001
```

#### 2. 数据库连接失败
```bash
# 检查MySQL容器状态
docker-compose ps mysql

# 查看MySQL日志
docker-compose logs mysql

# 重启MySQL服务
docker-compose restart mysql
```

#### 3. 前端构建失败
```bash
# 清理Node.js缓存
docker-compose exec frontend npm cache clean --force

# 重新安装依赖
docker-compose exec frontend npm install

# 重新构建
docker-compose up -d --build frontend
```

#### 4. 后端API错误
```bash
# 查看后端日志
docker-compose logs backend

# 检查数据库迁移状态
docker-compose exec backend alembic current

# 重新运行迁移
docker-compose exec backend alembic upgrade head
```

### 日志级别调整
```env
# 在 .env 文件中设置
LOG_LEVEL=DEBUG
MCP_LOG_LEVEL=DEBUG
```

## 📈 性能优化

### 1. 数据库优化
```sql
-- MySQL配置优化
SET GLOBAL innodb_buffer_pool_size = 1073741824; -- 1GB
SET GLOBAL max_connections = 200;
SET GLOBAL query_cache_size = 67108864; -- 64MB
```

### 2. Redis缓存配置
```bash
# 在docker-compose.yml中添加Redis配置
redis:
  command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru
```

### 3. Nginx优化
```nginx
# 在nginx.conf中添加
worker_processes auto;
worker_connections 2048;
keepalive_timeout 30;
client_max_body_size 50M;
```

## 🔄 更新和维护

### 应用更新
```bash
# 拉取最新代码
git pull origin main

# 重新构建并部署
docker-compose up -d --build

# 运行数据库迁移（如果有）
docker-compose exec backend alembic upgrade head
```

### 定期维护
```bash
# 清理Docker系统
docker system prune -f

# 更新Docker镜像
docker-compose pull
docker-compose up -d

# 备份数据库
./scripts/backup.sh
```

## 📞 技术支持

如果遇到部署问题，请：

1. 查看相关日志文件
2. 检查系统资源使用情况
3. 确认网络连接正常
4. 参考故障排除章节
5. 联系技术支持团队

---

**注意**: 生产环境部署前，请务必：
- 更改所有默认密码
- 配置HTTPS证书
- 设置防火墙规则
- 配置定期备份
- 启用监控告警