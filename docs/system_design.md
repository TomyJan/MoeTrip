# MoeTrip 系统设计

本文档描述 MoeTrip 旅游景区信息管理系统的技术设计，涵盖架构、数据库、模块和接口，基于前后端分离架构，使用 Vue3、Node.js 和 PostgreSQL/MySQL 实现。

## 1. 系统架构

### 1.1 总体架构

MoeTrip 采用三层架构（前端、后端、数据层），通过 Fetch 进行非 RESTful API 通信。

- **前端**：Vue3 构建交互界面，Vuetify 3 提供 Material Design 风格，ECharts 渲染数据图表。
- **后端**：Node.js + Express 处理业务逻辑，Sequelize 操作数据库。
- **数据层**：PostgreSQL / MySQL 存储景点、用户、票务等数据。

**架构图**：

![架构图](/docs/diagrams/architecture.png)

- **通信流程**：
  1. 用户通过浏览器访问前端页面
  2. Vue3 使用 Fetch 发送请求到后端（如 `/attraction/query`）
  3. Express 处理请求，调用 Sequelize 查询数据库
  4. 后端返回 JSON 数据，前端渲染

### 1.2 数据流程

![数据流程图](/docs/diagrams/data_flow.png)

- **示例**：用户查询景点信息
  1. 用户点击"景点列表"按钮
  2. 前端发送 `POST /attraction/query` 请求
  3. 后端查询 `attractions` 表，返回景点数据
  4. 前端渲染卡片列表（Vuetify 3）

### 1.3 安全措施

系统采用多层次安全措施保护数据和通信：

- **身份验证**：基于JWT的用户认证
- **权限控制**：基于角色的访问控制
- **数据加密**：密码SHA1哈希存储
- **日志记录**：系统关键操作审计
- **HTTPS支持**：可通过环境变量配置启用HTTPS，保护API通信安全

## 2. 数据库设计

### 2.1 ER 图

![ER图](/docs/diagrams/er_diagram.png)

包含以下核心表：

- `attractions`：景点信息
- `facilities`：设施信息
- `users`：用户信息
- `tickets`：票种信息
- `orders`：购票订单
- `feedback`：满意度反馈
- `logs`：操作日志

数据库初始化：`/backend/scripts/init_db_postgres.sql` 或 `/backend/scripts/init_db_mysql.sql`

### 2.2 表结构

| 表名          | 字段                              | 说明                              |
|---------------|-----------------------------------|-----------------------------------|
| `attractions` | id (PK, int), name (varchar), description (text), open_time (varchar), image_url (varchar), created_at (datetime), updated_at (datetime) | 景点信息，image_url 存图片路径 |
| `facilities`  | id (PK, int), name (varchar), location (varchar), status (varchar), attraction_id (FK, int), created_at (datetime), updated_at (datetime) | 设施信息，status 如"normal/维护" |
| `users`       | id (PK, int), username (varchar), password_hash (varchar), role (varchar), created_at (datetime), updated_at (datetime) | 用户信息，role 如"user/admin" |
| `tickets`     | id (PK, int), attraction_id (FK, int), name (varchar), price (decimal), available (int), status (varchar), created_at (datetime), updated_at (datetime) | 票种信息，available为每日可用数量 |
| `orders`      | id (PK, int), user_id (FK, int), ticket_id (FK, int), quantity (int), total_price (decimal), date (date), status (varchar), created_at (datetime), updated_at (datetime) | 订单信息，包含购票日期和状态（confirmed/canceled） |
| `feedback`    | id (PK, int), user_id (FK, int), attraction_id (FK, int), score (int), comment (text), status (varchar), created_at (datetime), updated_at (datetime) | 用户对景点的满意度评分（1-5分）和反馈 |
| `logs`        | id (PK, int), user_id (FK, int), action (varchar), resource_type (varchar), resource_id (int), details (json), ip_address (varchar), user_agent (varchar), created_at (datetime) | 系统操作日志 |

**关系**：
- `orders.user_id` -> `users.id`
- `orders.ticket_id` -> `tickets.id`
- `facilities.attraction_id` -> `attractions.id`
- `tickets.attraction_id` -> `attractions.id`
- `feedback.user_id` -> `users.id`
- `feedback.attraction_id` -> `attractions.id`
- `logs.user_id` -> `users.id`

**数据字典**（部分示例）：
- `attractions.name`: 景点名称，字符串，非空，最大 100 字符
- `tickets.available`: 每日可用票数，整数，非负
- `tickets.price`: 票价，小数，非负
- `orders.date`: 门票使用日期，日期类型
- `orders.status`: 订单状态，字符串，取值"confirmed"或"canceled"
- `feedback.score`: 用户评分，整数，范围1-5
- `feedback.status`: 反馈状态，字符串，取值"public"或"deleted"
- `logs.action`: 操作类型，字符串，如"login"、"register"、"create"

## 3. 模块设计

### 3.1 景区资源管理

- **功能**：
  - 管理景点（增删改查、搜索）
  - 管理设施（增删改查）
- **前端**：
  - 组件：`Attractions.vue`（列表）、`AttractionDetail.vue`（详情）、`AdminAttractions.vue`（管理）
  - 交互：Fetch 调用后端，Vuetify 3 卡片和表格展示
- **后端**：
  - 路由：`/attraction/query`, `/attraction/add`, `/facility/update` 等
  - 控制器：`attraction.controller.ts`, `facility.controller.ts`
  - 逻辑：Sequelize 读写 `attractions` 和 `facilities` 表
- **数据流**：
  - 用户搜索景点 -> Fetch `/attraction/query` -> 后端返回 JSON -> 渲染列表

### 3.2 用户信息管理

- **功能**：
  - 注册、登录、角色管理
  - 记录浏览、预定、反馈
- **前端**：
  - 组件：`Login.vue`, `Register.vue`, `UserProfile.vue`
  - 状态：Pinia 管理用户角色和认证状态
- **后端**：
  - 路由：`/user/login`, `/user/register`, `/user/logout`
  - 控制器：`user.controller.ts`
  - 中间件：`auth.middleware.ts` (JWT认证)
  - 逻辑：JWT 认证，SHA1 加密密码，Sequelize 存取 `users`
- **数据流**：
  - 用户登录 -> Fetch `/user/login` -> 返回 JWT -> Pinia 保存

### 3.3 票务与预约

- **功能**：
  - 购票、退票、改签
  - 门票类型管理
  - 余量管理与冲突检测
- **前端**：
  - 组件：`TicketBuy.vue`, `OrderDetail.vue`, `AdminTickets.vue`
  - 交互：Vuetify 3 日历选择日期，显示票务状态和余量
- **后端**：
  - 路由：`/order/create`, `/ticket/check`, `/ticket/add`
  - 控制器：`ticket.controller.ts`, `order.controller.ts`
  - 逻辑：
    - Sequelize 事务确保订单一致性
    - 检查指定日期的票种余量
    - 管理每日票种配额
- **数据流**：
  - 用户查看余量 -> Fetch `/ticket/check` -> 后端返回余量
  - 用户购票 -> Fetch `/order/create` -> 后端验证余量 -> 更新 `orders`
  - 管理员添加票种 -> Fetch `/ticket/add` -> 后端创建新票种

### 3.4 用户反馈管理

- **功能**：
  - 用户提交景点反馈和评分
  - 查询反馈（个人/景点/全部）
  - 更新和删除反馈
  - 统计反馈数据（管理员）
- **前端**：
  - 组件：`FeedbackForm.vue`、`Feedback.vue`
  - 交互：五星评分组件，评论表单，反馈统计卡片
- **后端**：
  - 路由：`/feedback/add`, `/feedback/query`, `/feedback/update`, `/feedback/stats`
  - 控制器：`feedback.controller.ts`
  - 逻辑：Sequelize 操作 `feedback` 表，支持过滤和统计
- **数据流**：
  - 用户提交评价 -> Fetch `/feedback/add` -> 后端存储 -> 前端显示成功消息
  - 用户查询评价 -> Fetch `/feedback/query` -> 后端返回数组 -> 前端展示列表
  - 管理员查看统计 -> Fetch `/feedback/stats` -> 后端聚合分析 -> 前端显示图表

### 3.5 数据分析与可视化

- **功能**：
  - 统计用户、景点、反馈数据
  - 生成满意度报表和图表
  - 热门景点排名
- **前端**：
  - 组件：`Admin.vue`
  - 交互：ECharts 绘制饼图/柱状图，Vuetify 3 统计卡片
- **后端**：
  - 路由：`/admin/stats`, `/feedback/stats`, `/attraction/stats`
  - 控制器：`admin.controller.ts`
  - 逻辑：SQL 聚合查询 `orders`, `feedback` 和 `attractions`
- **数据流**：
  - 管理员查看报表 -> Fetch `/admin/stats` -> ECharts 渲染

### 3.6 系统日志

- **功能**：
  - 记录用户操作（登录、注册、创建订单等）
  - 查询和分析日志
- **前端**：
  - 组件：`AdminLogs.vue`
  - 交互：Vuetify 3 数据表格和筛选器
- **后端**：
  - 路由：`/admin/logs`, `/log/query`
  - 控制器：`log.controller.ts`
  - 中间件：`operation-logger.middleware.ts`
  - 逻辑：自动记录用户操作，支持按时间和操作类型查询
- **数据流**：
  - 用户操作 -> 中间件记录日志 -> 存储到 `logs` 表
  - 管理员查看日志 -> Fetch `/admin/logs` -> 前端展示表格

## 4. 接口概要

MoeTrip 使用非 RESTful API，路由以功能为导向。以下是主要接口（详细规范见 [docs/api/api_spec.md](api/api_spec.md)）：

- **景区资源**：
  - POST `/attraction/query`：查询景点列表
  - POST `/attraction/add`：添加新景点
  - POST `/attraction/update`：更新景点信息
  - POST `/attraction/delete`：删除景点
  - POST `/attraction/stats`：获取景点统计数据
  - POST `/facility/query`：查询设施列表
  - POST `/facility/add`：添加新设施
  - POST `/facility/update`：更新设施信息
- **用户信息**：
  - POST `/user/register`：用户注册
  - POST `/user/login`：用户登录
  - POST `/user/logout`：用户登出
- **票务**：
  - POST `/ticket/query`：查询票种列表
  - POST `/ticket/check`：检查票种余量
  - POST `/ticket/add`：添加新票种
  - POST `/ticket/update`：更新票种信息
  - POST `/ticket/delete`：删除票种
  - POST `/order/create`：购买门票
  - POST `/order/query`：查询订单列表
  - POST `/order/update`：更新订单
  - POST `/order/cancel`：取消订单
  - POST `/order/stats`：获取订单统计数据
- **用户反馈**：
  - POST `/feedback/add`：添加景点反馈
  - POST `/feedback/query`：查询反馈列表
  - POST `/feedback/update`：更新/删除反馈
  - POST `/feedback/stats`：统计反馈数据
- **管理功能**：
  - POST `/admin/stats`：获取系统统计数据
  - POST `/admin/logs`：获取系统日志
  - POST `/admin/users/query`：查询用户列表
  - POST `/admin/users/add`：添加用户
  - POST `/admin/users/update`：更新用户信息
  - POST `/admin/users/delete`：删除用户

**错误码**：
- 0: 成功
- 1001: 参数无效
- 1002: 名称重复/已存在反馈
- 1003: 用户名已存在
- 1004: 用户名或密码错误
- 1005: 票种余量不足
- 1006: 订单/反馈不存在
- 2001: 无访问权限

**TypeScript 示例**（请求/响应）：
```typescript
// 查询票种余量
interface TicketCheckRequest {
  ticket_id: number;
  date: string; // YYYY-MM-DD
}

interface TicketCheckResponse {
  code: number;
  message: string | null;
  data: {
    ticket: {
      id: number;
      attraction_id: number;
      name: string;
      available: number;
      date: string;
    }
  }
}
```

## 5. 非技术因素

- **技术经济性**：
  - 使用开源工具（Vue3、Express、Sequelize）降低成本
  - 优先核心功能，优化开发效率
- **工程伦理**：
  - 加密用户密码（SHA1）
  - 限制管理员访问敏感数据
  - 详细的操作日志记录
  - 支持HTTPS通信，保护用户数据传输安全

## 6. 优化计划

- 升级密码加密算法（从SHA1到bcrypt）
- 添加文件上传功能，增强景点图片管理能力
- 增强数据分析模块，提供更详细的报表
- 提供API文档在线预览
- 添加用户行为分析功能
- 实现令牌刷新机制，提高安全性
