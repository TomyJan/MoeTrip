# MoeTrip API 认证说明

本文档说明 MoeTrip API 的认证机制，主要基于 JWT (JSON Web Token)。

## JWT认证流程

1. **获取令牌**
   - 用户通过 `/user/login` 或 `/user/register` 获取 JWT
   - 令牌包含用户ID和角色信息
   - 令牌有效期由环境变量 `JWT_EXPIRES_IN` 控制（默认为24小时）

2. **使用令牌**
   - 在请求头中添加 `Authorization: Bearer <token>`
   - 所有需要认证的API都要求此头部
   - 后端通过 `auth.middleware.ts` 中间件验证令牌

3. **令牌过期与登出**
   - 目前系统不支持自动令牌刷新
   - 当令牌过期后，需重新登录获取新令牌
   - 用户可以调用 `/user/logout` 登出（前端需删除本地令牌）

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
   - 可进行个人信息操作
   - 可进行票务预订
   - 可查看个人订单
   - 可对景点添加、查询和更新自己的反馈
   - 可查看所有景点的公开反馈

3. **管理员**
   - 拥有所有普通用户权限
   - 可管理景点和设施（增删改查）
   - 可管理票种信息（增删改查）
   - 可查看和管理所有订单
   - 可查看、更新或删除任何用户的反馈
   - 可查看系统操作日志
   - 可获取数据统计信息
   - 可管理用户账户

## 安全措施

1. **密码加密**
   - 使用SHA1算法对密码进行哈希处理
   - 密码哈希值存储在数据库中，不保存明文密码
   - 计划未来升级到bcrypt算法

2. **权限检查**
   - 在控制器层面通过中间件验证用户权限
   - 对管理员操作进行额外的角色检查

3. **系统日志**
   - 记录重要操作（登录/登出/注册）
   - 记录关键业务操作（创建订单/添加反馈等）
   - 日志包含操作类型、用户ID、资源信息、IP和浏览器信息

## 前端实现

前端使用Pinia状态管理库处理用户认证状态：

```typescript
// 存储令牌
userStore.setUser({
  id: response.data.user.id,
  username: response.data.user.username,
  role: response.data.user.role,
  token: response.data.token,
});

// 令牌存储在localStorage中
localStorage.setItem('token', userData.token);

// 在API请求中使用令牌
headers['Authorization'] = `Bearer ${token}`;
```

## 路由保护

前端通过Vue Router导航守卫保护需要认证的路由：

```typescript
router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  // 检查令牌和角色
  if (to.meta.requiresAdmin && userRole !== 'admin') {
    next({ name: 'Login' });
  } else if (to.meta.requiresAuth && !token) {
    next({ name: 'Login' });
  } else {
    next();
  }
});
```

## 后端实现

后端使用中间件验证JWT令牌：

```typescript
// auth.middleware.ts
export const authMiddleware: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      code: 2001,
      message: '未提供有效的认证令牌',
      data: null,
    });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    req.user = decoded as { id: number; role: string };
    next();
  } catch (error) {
    return res.status(401).json({
      code: 2001,
      message: '令牌无效或已过期',
      data: null,
    });
  }
};
```
