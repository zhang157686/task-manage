// 在浏览器控制台中运行此脚本来检查登录状态
// 打开 http://localhost:3000，按 F12 打开开发者工具，在 Console 标签中粘贴并运行

console.log('=== TaskMaster AI 登录状态检查 ===');

// 检查 localStorage 中的令牌
const accessToken = localStorage.getItem('access_token');
const refreshToken = localStorage.getItem('refresh_token');

if (accessToken) {
    console.log('✅ 找到访问令牌');
    
    // 检查令牌是否过期
    try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        const currentTime = Date.now() / 1000;
        const isExpired = payload.exp < currentTime;
        
        console.log('令牌信息:');
        console.log('- 用户ID:', payload.sub);
        console.log('- 过期时间:', new Date(payload.exp * 1000).toLocaleString());
        console.log('- 是否过期:', isExpired ? '❌ 是' : '✅ 否');
        
        if (isExpired) {
            console.log('⚠️ 令牌已过期，需要重新登录');
        } else {
            console.log('✅ 令牌有效，用户已登录');
        }
    } catch (error) {
        console.log('❌ 令牌格式无效');
    }
} else {
    console.log('❌ 未找到访问令牌');
    console.log('用户需要登录: http://localhost:3000/login');
    console.log('默认账户: admin / admin123');
}

if (refreshToken) {
    console.log('✅ 找到刷新令牌');
} else {
    console.log('❌ 未找到刷新令牌');
}

console.log('=== 检查完成 ===');