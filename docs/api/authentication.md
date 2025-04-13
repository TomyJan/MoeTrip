# MoeTrip API 认证说明

本文档说明 MoeTrip API 的认证机制，主要基于 JWT (JSON Web Token)。

## JWT认证流程

1. **获取令牌**
   - 用户通过 `/user/login` 或 `/user/register` 获取 JWT
   - 令牌包含用户ID和角色信息
   - 令牌有效期为24小时

2. **使用令牌**
   - 在请求头中添加 `Authorization: Bearer <token>`
   - 所有需要认证的API都要求此头部

3. **令牌刷新**
   - 令牌过期前30分钟可请求新令牌
   - 使用旧令牌调用 `/user/refresh` 获取新令牌 // TODO: 此接口实现

## 认证响应

### 成功响应
```json
{
  "code": 0,
  "message": null,
  "data": {
    "user": {
      "id": 1,
      "username": "example",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### 认证失败
```json
{
  "code": 2001,
  "message": "无管理员权限",
  "data": null
}
```

## 权限级别

1. **游客（未认证）**
   - 可访问公开API（如景点查询）
   - 可进行注册和登录

2. **普通用户**
   - 可查看个人信息
   - 可进行票务预订
   - 可查看购票记录

3. **管理员**
   - 可管理景点和设施
   - 可管理票种信息
   - 可查看所有用户记录

## 安全建议

1. **客户端**
   - 将令牌存储在安全位置（如HttpOnly Cookie）
   - 定期检查令牌有效期并刷新
   - 登出时清除令牌

2. **API调用**
   - 使用HTTPS确保传输安全
   - 不要在URL中传递敏感信息
   - 遵循最小权限原则

## 示例代码

### 前端请求示例
```typescript
// 登录并保存令牌
async function login(username: string, password: string) {
  const response = await fetch('/api/v1/user/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await response.json();
  if (data.code === 0) {
    localStorage.setItem('token', data.data.token);
  }
}

// 使用令牌请求API
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    }
  });
}
```

### 后端验证示例
```typescript
// 验证中间件
function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({
      code: 2001,
      message: '未认证',
      data: null
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({
      code: 2001,
      message: '令牌无效',
      data: null
    });
  }
}
```
