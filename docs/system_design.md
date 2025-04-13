# MoeTrip 系统设计

本文档描述 MoeTrip 旅游景区信息管理系统的技术设计，涵盖架构、数据库、模块和接口，基于前后端分离架构，使用 Vue3、Node.js 和 MySQL 实现。

## 1. 系统架构

### 1.1 总体架构

MoeTrip 采用三层架构（前端、后端、数据层），通过 Fetch 进行非 RESTful API 通信。

- **前端**：Vue3 构建交互界面，Vuetify 3 提供 Material Design 风格（备选 Element Plus），ECharts 渲染数据图表。
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

数据库初始化：`/backend/scripts/init_db.sql`

### 2.2 表结构

| 表名          | 字段                              | 说明                              |
|---------------|-----------------------------------|-----------------------------------|
| `attractions` | id (PK, int), name (varchar), description (text), open_time (varchar), image_url (varchar) | 景点信息，image_url 存图片路径 |
| `facilities`  | id (PK, int), name (varchar), location (varchar), status (varchar), attraction_id (FK, int) | 设施信息，status 如"正常/维护" |
| `users`       | id (PK, int), username (varchar), password_hash (varchar), role (varchar) | 用户信息，role 如"user/admin" |
| `tickets`     | id (PK, int), attraction_id (FK, int), name (varchar), available (int) | 票种信息，available为每日可用数量 |
| `orders`      | id (PK, int), user_id (FK, int), ticket_id (FK, int), quantity (int), date (date), created_at (datetime) | 订单信息，包含购票日期 |
| `feedback`    | id (PK, int), user_id (FK, int), score (int), comment (text), created_at (datetime) | 满意度评分（1-5 分） |

**关系**：
- `orders.user_id` -> `users.id`
- `orders.ticket_id` -> `tickets.id`
- `facilities.attraction_id` -> `attractions.id`
- `tickets.attraction_id` -> `attractions.id`

**数据字典**（部分示例）：
- `attractions.name`: 景点名称，字符串，非空，最大 100 字符
- `tickets.available`: 每日可用票数，整数，非负
- `orders.date`: 门票使用日期，日期类型

## 3. 模块设计

### 3.1 景区资源管理

- **功能**：
  - 管理景点（增删改查、搜索）
  - 管理设施（增删改查）
- **前端**：
  - 组件：`AttractionList.vue`（列表）、`AttractionForm.vue`（表单）
  - 交互：Fetch 调用后端，Vuetify 3 卡片和表格展示
- **后端**：
  - 路由：`/attraction/query`, `/attraction/add`, `/facility/update` 等
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
  - 路由：`/user/login`, `/user/register`, `/user/record`
  - 逻辑：JWT 认证，bcrypt 加密密码，Sequelize 存取 `users`
- **数据流**：
  - 用户登录 -> Fetch `/user/login` -> 返回 JWT -> Pinia 保存

### 3.3 票务与预约

- **功能**：
  - 购票、退票、改签
  - 门票类型管理
  - 余量管理与冲突检测
- **前端**：
  - 组件：`TicketBuy.vue`, `TicketList.vue`, `TicketManage.vue`
  - 交互：Vuetify 3 日历选择日期，显示票务状态和余量
- **后端**：
  - 路由：`/ticket/purchase`, `/ticket/check`, `/ticket/add`
  - 逻辑：
    - Sequelize 事务确保订单一致性
    - 检查指定日期的票种余量
    - 管理每日票种配额
- **数据流**：
  - 用户查看余量 -> Fetch `/ticket/check` -> 后端返回余量
  - 用户购票 -> Fetch `/ticket/purchase` -> 后端验证余量 -> 更新 `orders`
  - 管理员添加票种 -> Fetch `/ticket/add` -> 后端创建新票种

### 3.4 数据分析与可视化

- **功能**：
  - 统计流量、销售、收入
  - 生成满意度报表和图表
- **前端**：
  - 组件：`AnalyticsDashboard.vue`。
  - 交互：ECharts 绘制折线图/柱状图，Vuetify 3 筛选器
- **后端**：
  - 路由：`/analytics/traffic`, `/analytics/feedback`
  - 逻辑：SQL 聚合查询 `orders` 和 `feedback`
- **数据流**：
  - 管理员查看报表 -> Fetch `/analytics/traffic` -> ECharts 渲染

## 4. 接口概要

MoeTrip 使用非 RESTful API，路由以功能为导向。以下是主要接口（详细规范见 [docs/api/api_spec.md](docs/api/api_spec.md)）：

- **景区资源**：
  - POST `/attraction/query`：查询景点列表
  - POST `/attraction/add`：添加新景点
  - POST `/facility/query`：查询设施列表
  - POST `/facility/add`：添加新设施
- **用户信息**：
  - POST `/user/register`：用户注册
  - POST `/user/login`：用户登录
  - POST `/user/record`：查询用户记录
- **票务**：
  - POST `/ticket/check`：检查票种余量
  - POST `/ticket/purchase`：购买门票
  - POST `/ticket/add`：添加新票种

**错误码**：
- 0: 成功
- 1001: 参数无效
- 1002: 名称重复
- 1003: 用户名已存在
- 1004: 用户名或密码错误
- 1005: 票种余量不足
- 2001: 无管理员权限

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
  - 加密用户密码（bcrypt）
  - 限制管理员访问敏感数据

## 6. 下一步

- 搭建前端原型（Vue3 + Vuetify 3）
- 初始化数据库（运行 `backend/scripts/init_db.sql`）
- 实现核心 API（Apifox 测试）
