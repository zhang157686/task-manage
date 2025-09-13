#!/bin/bash

# TaskMaster AI 部署脚本
# 用于快速部署整个系统

set -e

echo "🚀 开始部署 TaskMaster AI 系统..."

# 检查Docker和Docker Compose
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose 未安装，请先安装 Docker Compose"
    exit 1
fi

# 检查环境文件
if [ ! -f .env ]; then
    echo "📝 创建环境配置文件..."
    cp .env.example .env
    echo "⚠️  请编辑 .env 文件配置您的环境变量"
    echo "   特别是数据库密码和API密钥"
fi

# 创建必要的目录
echo "📁 创建必要的目录..."
mkdir -p nginx/ssl
mkdir -p backend/logs
mkdir -p data/mysql
mkdir -p data/redis

# 停止现有服务
echo "🛑 停止现有服务..."
docker-compose down --remove-orphans

# 构建镜像
echo "🔨 构建Docker镜像..."
docker-compose build --no-cache

# 启动服务
echo "🚀 启动服务..."
docker-compose up -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 30

# 检查服务状态
echo "🔍 检查服务状态..."
docker-compose ps

# 运行数据库迁移
echo "🗄️ 运行数据库迁移..."
docker-compose exec backend alembic upgrade head

# 显示访问信息
echo ""
echo "✅ 部署完成！"
echo ""
echo "📊 服务访问地址："
echo "   前端应用: http://localhost:3000"
echo "   后端API: http://localhost:8000"
echo "   API文档: http://localhost:8000/docs"
echo ""
echo "🔧 管理命令："
echo "   查看日志: docker-compose logs -f"
echo "   停止服务: docker-compose down"
echo "   重启服务: docker-compose restart"
echo ""
echo "📝 首次使用请："
echo "   1. 访问 http://localhost:3000"
echo "   2. 注册新用户账户"
echo "   3. 配置AI模型API密钥"
echo "   4. 创建第一个项目"
echo ""