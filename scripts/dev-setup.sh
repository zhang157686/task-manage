#!/bin/bash

# TaskMaster AI 开发环境设置脚本

set -e

echo "🛠️ 设置 TaskMaster AI 开发环境..."

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js 18+"
    exit 1
fi

# 检查Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 未安装，请先安装 Python 3.11+"
    exit 1
fi

# 检查MySQL
if ! command -v mysql &> /dev/null; then
    echo "⚠️  MySQL 未安装，建议安装 MySQL 8.0+"
    echo "   或使用 Docker: docker run -d --name mysql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=123456 mysql:8.0"
fi

# 设置后端环境
echo "🐍 设置后端Python环境..."
cd backend

# 创建虚拟环境
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

# 激活虚拟环境并安装依赖
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# 创建环境文件
if [ ! -f .env ]; then
    cp .env.example .env
    echo "📝 已创建后端 .env 文件，请配置数据库和API密钥"
fi

cd ..

# 设置前端环境
echo "⚛️ 设置前端Node.js环境..."
cd frontend

# 安装依赖
npm install

# 创建环境文件
if [ ! -f .env.local ]; then
    echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
    echo "📝 已创建前端 .env.local 文件"
fi

cd ..

# 创建启动脚本
echo "📜 创建开发启动脚本..."
cat > start-dev.sh << 'EOF'
#!/bin/bash

# 启动开发服务器

echo "🚀 启动 TaskMaster AI 开发服务器..."

# 启动后端
echo "🐍 启动后端服务器..."
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000 &
BACKEND_PID=$!
cd ..

# 等待后端启动
sleep 5

# 启动前端
echo "⚛️ 启动前端服务器..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

# 启动MCP服务器
echo "🔧 启动MCP服务器..."
cd backend
source venv/bin/activate
python mcp_server/start.py &
MCP_PID=$!
cd ..

echo ""
echo "✅ 开发服务器已启动！"
echo ""
echo "📊 服务访问地址："
echo "   前端应用: http://localhost:3000"
echo "   后端API: http://localhost:8000"
echo "   API文档: http://localhost:8000/docs"
echo ""
echo "🛑 停止服务器: Ctrl+C"
echo ""

# 等待用户中断
trap "echo '🛑 停止服务器...'; kill $BACKEND_PID $FRONTEND_PID $MCP_PID 2>/dev/null; exit" INT
wait
EOF

chmod +x start-dev.sh

echo ""
echo "✅ 开发环境设置完成！"
echo ""
echo "📝 下一步："
echo "   1. 配置 backend/.env 文件（数据库连接、API密钥等）"
echo "   2. 启动MySQL数据库服务"
echo "   3. 运行数据库迁移: cd backend && alembic upgrade head"
echo "   4. 启动开发服务器: ./start-dev.sh"
echo ""
echo "📚 更多信息请查看 README.md"
echo ""