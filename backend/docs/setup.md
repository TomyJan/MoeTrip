# MoeTrip 后端环境配置

## 环境要求

- Node.js >= 16.0.0
- PostgreSQL >= 12
- TypeScript >= 4.5
- pnpm >= 9.7.0

## 安装步骤

1. 安装依赖
    ```bash
    pnpm install
    ```

2. 配置环境变量
    ```bash
    # 复制开发环境配置模板
    cp .env.example .env
	
    # 复制测试环境配置模板
    cp .env.example .env.test
    ```
	然后依照注释修改配置


3. 初始化数据库
    ```bash
    # 开发数据库
    createdb moetrip
    
    # 测试数据库
    createdb moetrip_test

    # 如果使用 Windows, 还需要先确保终端切换到 UTF8
    chcp 65001
    
    # 初始化表结构, 请相应修改你的用户名和数据库名称
    psql -U postgres -d moetrip -f scripts/init_db_postgres.sql
    ```

4. 启动开发服务器
    ```bash
    pnpm dev
    ```
	
	注意：程序会自动检查环境文件是否存在，如果缺少必要的环境文件会给出错误提示并退出。

## 项目结构

```
src/
├── __tests__/           # 测试文件
│   ├── setup.ts         # 测试环境配置
│   ├── utils/
│   │   └── test-utils.ts # 测试工具函数
│   ├── auth/            # 认证模块测试
│   ├── attraction/      # 景点模块测试
│   └── ticket/          # 票务模块测试
├── controllers/         # 控制器
├── models/             # 数据模型
├── routes/             # 路由定义
└── utils/              # 工具函数
```

## API文档

API文档见 [/docs/api/api_spec.md](/docs/api/api_spec.md)

## 开发指南

1. 新增API流程
   - 在 `routes/` 添加路由
   - 在 `controllers/` 实现处理逻辑
   - 在 `models/` 添加必要的模型方法
   - 在 `__tests__/` 添加对应的测试用例

2. 错误处理
   - 使用统一的错误响应格式
   - 错误码定义见 `docs/api/error_codes.md`

3. 认证授权
   - JWT认证说明见 `docs/api/authentication.md`
   - 使用 `auth.middleware.ts` 进行权限验证

## 测试

### 环境配置检查

程序会在以下情况自动检查环境文件：

1. **开发环境启动时**
   - 检查 `.env` 文件是否存在
   - 位置：`src/index.ts`

2. **测试环境启动时**
   - 检查 `.env.test` 文件是否存在
   - 位置：`src/__tests__/setup.ts`

如果缺少必要的环境文件，程序会给出明确的错误提示并退出。

### 测试架构

1. **测试框架**：Jest + SuperTest
2. **测试数据库**：独立的测试数据库（moetrip_test）
3. **测试环境变量**：使用 .env.test 配置文件
4. **测试工具类**：提供常用的测试辅助函数

### 测试目录结构

```
__tests__/
├── setup.ts              # 测试环境配置
├── utils/
│   └── test-utils.ts     # 测试工具类
├── auth/                 # 按模块组织测试文件
│   ├── user.test.ts
│   └── auth.test.ts
├── attraction/
│   ├── attraction.test.ts
│   └── facility.test.ts
└── ticket/
    ├── ticket.test.ts
    └── order.test.ts
```

### 测试工具函数

- `createTestUser()`: 创建测试用户
- `generateTestToken()`: 生成测试JWT
- `createTestAttraction()`: 创建测试景点
- `createTestTicket()`: 创建测试票种
- `authRequest()`: 发送带认证的请求
- `generateTestData()`: 生成随机测试数据

### 运行测试

```bash
# 运行所有测试
pnpm test

# 运行特定测试
pnpm test -- --grep "用户认证"

# 生成测试覆盖率报告
pnpm test -- --coverage
```

### 测试最佳实践

1. **测试隔离**
   - 每个测试用例都应该是独立的
   - 使用 beforeEach 清理测试数据
   - 不要依赖测试执行顺序

2. **测试分类**
   - 单元测试：测试独立的函数和组件
   - 集成测试：测试多个组件的交互
   - API测试：测试完整的HTTP请求流程

3. **测试命名规范**
   ```typescript
   describe('模块名称', () => {
     describe('功能/接口名称', () => {
       it('应该实现什么功能', () => {
         // 测试代码
       });
     });
   });
   ```

4. **测试用例结构**
   ```typescript
   it('测试描述', async () => {
     // 1. 准备测试数据
     const testData = generateTestData();
     
     // 2. 执行被测试的操作
     const response = await request(app).post('/api/...');
     
     // 3. 验证结果
     expect(response.status).toBe(200);
     expect(response.body.code).toBe(0);
   });
   ```

## 部署

1. 构建生产版本
    ```bash
    pnpm build
    ```

2. 启动生产服务器
    ```bash
    pnpm start
    ```

## 常见问题

1. 数据库连接失败
   - 检查数据库服务是否运行
   - 验证 `.env` 中的数据库配置
   - 确保测试数据库已创建（用于运行测试）

2. JWT验证失败
   - 确保 `JWT_SECRET` 已正确配置
   - 检查token格式是否正确

3. 测试相关问题
   - 确保测试数据库配置正确
   - 检查是否有测试正在使用相同的数据
   - 验证测试环境变量是否正确加载

## 注意事项

1. 所有API返回格式统一为：
    ```typescript
    {
      code: number;              // 状态码
      message: string|null;    // 信息
      data: object|null;          // 数据
    }
    ```

2. 开发时注意处理：
   - 输入验证
   - 错误处理
   - 日志记录
   - 性能优化
   - 测试覆盖率
