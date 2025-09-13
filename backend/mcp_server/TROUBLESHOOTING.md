# MCP Server 故障排除指南

## 🚨 常见问题及解决方案

### 1. 服务器启动问题

#### 问题：ImportError: No module named 'fastmcp'
**解决方案：**
```bash
# 确保在正确的虚拟环境中
cd backend
.\venv\Scripts\activate

# 安装 FastMCP
pip install fastmcp==2.12.3
```

#### 问题：Pydantic 配置错误
**解决方案：**
```bash
# 更新 pydantic-settings
pip install pydantic-settings>=2.6.1
```

### 2. API 连接问题

#### 问题：Connection refused to localhost:8000
**检查清单：**
- [ ] 主 API 服务器是否运行？
- [ ] 端口 8000 是否被占用？
- [ ] 防火墙是否阻止连接？

**解决方案：**
```bash
# 启动主 API 服务器
cd backend
uvicorn app.main:app --reload --port 8000

# 检查端口占用
netstat -an | findstr :8000
```

#### 问题：API 响应 404 错误
**检查清单：**
- [ ] API 端点路径是否正确？
- [ ] API 版本是否匹配？

**解决方案：**
检查 API 端点：
- 正确：`/api/v1/auth/validate-key`
- 错误：`/api/auth/validate-key`

### 3. 认证问题

#### 问题：Invalid API key
**解决方案：**
1. 确认 API 密钥格式正确
2. 检查用户账户是否激活
3. 验证 API 密钥是否过期

```bash
# 测试 API 密钥
curl -H "Authorization: Bearer your-api-key" \
     http://localhost:8000/api/v1/auth/validate-key
```

#### 问题：Bearer token 格式错误
**解决方案：**
确保使用正确的认证头格式：
```python
headers = {"Authorization": f"Bearer {api_key}"}
```

### 4. Claude Desktop 集成问题

#### 问题：MCP 服务器未显示在 Claude Desktop
**检查清单：**
- [ ] 配置文件路径是否正确？
- [ ] JSON 格式是否有效？
- [ ] Claude Desktop 是否重启？

**解决方案：**
1. 验证配置文件格式：
```json
{
  "mcpServers": {
    "task-manager": {
      "command": "python",
      "args": ["E:\\absolute\\path\\to\\start.py"],
      "env": {
        "MCP_API_BASE_URL": "http://localhost:8000"
      }
    }
  }
}
```

2. 重启 Claude Desktop

#### 问题：工具调用失败
**调试步骤：**
1. 检查 MCP 服务器日志
2. 验证参数类型和格式
3. 测试 API 端点直接调用

### 5. 数据库连接问题

#### 问题：Database connection failed
**解决方案：**
1. 检查数据库服务状态
2. 验证连接参数
3. 确认数据库权限

```bash
# 检查 MySQL 服务
net start mysql

# 测试数据库连接
mysql -h localhost -P 3303 -u root -p taskmaster
```

### 6. 性能问题

#### 问题：响应时间过长
**优化建议：**
1. 增加连接池大小
2. 启用数据库查询缓存
3. 优化 API 查询逻辑

#### 问题：内存使用过高
**解决方案：**
1. 检查内存泄漏
2. 优化数据结构
3. 实现分页查询

## 🔧 调试工具和技巧

### 1. 启用详细日志

```bash
# 启动时设置日志级别
python mcp_server/start.py --log-level DEBUG

# 或设置环境变量
set MCP_LOG_LEVEL=DEBUG
python mcp_server/start.py
```

### 2. 使用测试脚本

```bash
# 运行集成测试
python test_mcp_integration.py

# 测试特定工具
python -c "
import asyncio
from mcp_server.server import mcp
# 测试代码
"
```

### 3. API 端点测试

```bash
# 测试认证端点
curl -X GET http://localhost:8000/api/v1/auth/validate-key \
     -H "Authorization: Bearer your-api-key"

# 测试任务端点
curl -X GET http://localhost:8000/api/v1/projects/1/tasks \
     -H "Authorization: Bearer your-api-key"
```

### 4. 网络诊断

```bash
# 检查端口监听
netstat -an | findstr :8000
netstat -an | findstr :8001

# 测试网络连接
telnet localhost 8000
```

## 📊 监控和维护

### 1. 健康检查

创建健康检查脚本：
```python
import requests

def health_check():
    try:
        response = requests.get("http://localhost:8000/health")
        return response.status_code == 200
    except:
        return False

if __name__ == "__main__":
    if health_check():
        print("✅ API Server is healthy")
    else:
        print("❌ API Server is down")
```

### 2. 日志分析

常见日志模式：
```
# 成功的工具调用
INFO - Tool 'get_tasks' called successfully

# 认证失败
WARNING - Invalid API key attempt

# 连接错误
ERROR - Database connection failed
```

### 3. 性能监控

监控指标：
- 响应时间
- 错误率
- 内存使用
- CPU 使用率

## 🆘 紧急情况处理

### 服务器完全无响应

1. **立即重启服务**
```bash
# 停止所有相关进程
taskkill /f /im python.exe

# 重新启动
cd backend
.\venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
```

2. **检查系统资源**
```bash
# 检查内存使用
tasklist /fi "imagename eq python.exe"

# 检查磁盘空间
dir C:\ /-c
```

### 数据不一致

1. **备份当前数据**
2. **检查数据库完整性**
3. **必要时从备份恢复**

### 安全问题

1. **立即更换 API 密钥**
2. **检查访问日志**
3. **更新安全配置**

## 📞 获取帮助

### 1. 收集诊断信息

运行诊断脚本：
```bash
python -c "
import sys
import platform
print(f'Python: {sys.version}')
print(f'Platform: {platform.platform()}')
print(f'FastMCP: {__import__('fastmcp').__version__}')
"
```

### 2. 日志收集

```bash
# 收集最近的日志
tail -n 100 mcp_server.log > diagnostic_logs.txt
```

### 3. 配置检查

```bash
# 导出配置信息（移除敏感信息）
python -c "
from mcp_server.config import config
print(f'API URL: {config.api_base_url}')
print(f'Log Level: {config.log_level}')
print(f'Transport: {config.transport_type}')
"
```

记住：在寻求帮助时，请提供详细的错误信息、日志文件和系统配置信息，但要确保移除所有敏感数据（如 API 密钥、密码等）。