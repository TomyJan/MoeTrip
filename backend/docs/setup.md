# MoeTrip 后端环境配置

## 环境要求

- Node.js >= 16.0.0
- MySQL >= 8.0 或 PostgreSQL >= 12
- TypeScript >= 4.5

## 安装步骤

1. 安装依赖
```bash
npm install
```

2. 配置环境变量
```bash
cp .env.example .env
# 修改 .env 中的配置
```

3. 初始化数据库
```bash
# MySQL
mysql -u root -p < scripts/init_db_mysql.sql

# 或 PostgreSQL
psql -U postgres -f scripts/init_db_postgres.sql
```

4. 启动开发服务器
```bash
npm run dev
```

## 项目结构

```
src/
├── controllers/     # 控制器
├── models/         # 数据模型
├── routes/         # 路由定义
└── utils/          # 工具函数
```

## API文档

API文档见 `docs/api/api_spec.md`

## 开发指南

1. 新增API流程
   - 在 `routes/` 添加路由
   - 在 `controllers/` 实现处理逻辑
   - 在 `models/` 添加必要的模型方法

2. 错误处理
   - 使用统一的错误响应格式
   - 错误码定义见 `docs/api/error_codes.md`

3. 认证授权
   - JWT认证说明见 `docs/api/authentication.md`
   - 使用 `auth.middleware.ts` 进行权限验证

## 测试

```bash
# 运行所有测试
npm test

# 运行特定测试
npm test -- --grep "用户认证"
```

## 部署

1. 构建生产版本
```bash
npm run build
```

2. 启动生产服务器
```bash
npm start
```

## 常见问题

1. 数据库连接失败
   - 检查数据库服务是否运行
   - 验证 `.env` 中的数据库配置

2. JWT验证失败
   - 确保 `JWT_SECRET` 已正确配置
   - 检查token格式是否正确

## 注意事项

1. 所有API返回格式统一为：
```typescript
{
  code: number;      // 状态码
  message: string;   // 信息
  data: any;        // 数据
}
```

2. 开发时注意处理：
   - 输入验证
   - 错误处理
   - 日志记录
   - 性能优化
```
