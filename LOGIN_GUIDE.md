# TaskMaster AI 登录指南

## 问题描述
首页显示项目总数为0，但实际有项目存在。这是因为用户未登录，无法访问受保护的API端点。

## 解决步骤

### 1. 访问登录页面
打开浏览器，访问：http://localhost:3000/login

### 2. 使用默认管理员账户
- **用户名**: `admin`
- **密码**: `admin123`

### 3. 登录成功后
- 系统会自动跳转到首页
- 首页将显示真实的项目统计数据
- 所有功能将正常可用

## 验证登录状态

### 方法1: 检查首页显示
登录后，首页的统计卡片应该显示：
- 项目总数：实际数字（而不是 `--`）
- 活跃任务：实际数字
- AI模型：实际配置数量

### 方法2: 使用浏览器开发者工具
1. 在首页按 `F12` 打开开发者工具
2. 切换到 `Console` 标签
3. 运行以下代码检查登录状态：

```javascript
// 检查登录令牌
const token = localStorage.getItem('access_token');
if (token) {
    console.log('✅ 用户已登录');
    console.log('令牌:', token.substring(0, 20) + '...');
} else {
    console.log('❌ 用户未登录');
}
```

### 方法3: 检查API调用
在开发者工具的 `Network` 标签中，刷新页面后应该看到：
- 对 `/api/v1/projects` 的成功请求（状态码 200）
- 而不是 401 Unauthorized 错误

## 常见问题

### Q: 忘记了默认密码怎么办？
A: 默认管理员账户信息：
- 用户名: `admin`
- 密码: `admin123`
- 邮箱: `admin@taskmaster.ai`

### Q: 登录后仍然显示0怎么办？
A: 可能的原因：
1. 后端服务未运行 - 检查 http://127.0.0.1:8000/health
2. 数据库连接问题 - 检查MySQL服务
3. 缓存问题 - 点击首页的"刷新数据"按钮

### Q: 如何创建新用户？
A: 访问注册页面：http://localhost:3000/register

## 技术说明

### 认证流程
1. 用户提交登录表单
2. 后端验证用户名和密码
3. 返回JWT访问令牌和刷新令牌
4. 前端将令牌存储在localStorage中
5. 后续API请求自动携带令牌

### 令牌存储
- 访问令牌：`localStorage.getItem('access_token')`
- 刷新令牌：`localStorage.getItem('refresh_token')`
- 令牌有效期：8天

### API端点保护
所有项目相关的API端点都需要认证：
- `GET /api/v1/projects` - 获取项目列表
- `POST /api/v1/projects` - 创建项目
- `GET /api/v1/models` - 获取AI模型配置

---

**总结**: 用户需要先登录（admin/admin123）才能看到真实的项目数据。登录后首页将显示正确的统计信息。