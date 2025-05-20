# MoeTrip 目录结构

以下是 MoeTrip 项目的目录结构，基于前后端分离架构，包含代码、文档和配置。

```
MoeTrip/
├── backend/
│   ├── src/
│   │   ├── app.ts                # Express应用配置
│   │   ├── index.ts              # 应用入口点，根据环境变量配置选择HTTP或HTTPS协议提供服务
│   │   ├── controllers/          # 业务逻辑控制器
│   │   │   ├── admin.controller.ts
│   │   │   ├── attraction.controller.ts
│   │   │   ├── facility.controller.ts
│   │   │   ├── feedback.controller.ts
│   │   │   ├── log.controller.ts
│   │   │   ├── order.controller.ts
│   │   │   ├── ticket.controller.ts
│   │   │   └── user.controller.ts
│   │   ├── middlewares/          # 中间件
│   │   │   ├── auth.middleware.ts
│   │   │   ├── http-logger.middleware.ts
│   │   │   └── operation-logger.middleware.ts
│   │   ├── models/               # Sequelize 模型
│   │   │   ├── attraction.model.ts
│   │   │   ├── facility.model.ts
│   │   │   ├── feedback.model.ts
│   │   │   ├── log.model.ts
│   │   │   ├── order.model.ts
│   │   │   ├── ticket.model.ts
│   │   │   └── user.model.ts
│   │   ├── routes/               # API路由
│   │   │   ├── admin.routes.ts
│   │   │   ├── attraction.routes.ts
│   │   │   ├── facility.routes.ts
│   │   │   ├── feedback.routes.ts
│   │   │   ├── log.routes.ts
│   │   │   ├── order.routes.ts
│   │   │   ├── ticket.routes.ts
│   │   │   └── user.routes.ts
│   │   ├── utils/                # 工具函数
│   │   │   ├── database.ts       # 数据库连接
│   │   │   ├── env-validator.ts  # 环境变量验证
│   │   │   ├── log-service.ts    # 日志服务
│   │   │   └── logger.ts         # 日志工具
│   │   ├── validators/           # 请求验证器
│   │   └── __tests__/            # 单元测试
│   ├── scripts/
│   │   ├── init_db_postgres.sql  # PostgreSQL 数据库初始化
│   │   └── init_db_mysql.sql     # MySQL 数据库初始化
│   ├── uploads/                  # 文件上传目录
│   ├── logs/                     # 日志文件目录
│   ├── docs/                     # 后端文档
│   ├── .env.example              # 环境变量模板
│   ├── package.json              # 依赖配置
│   ├── tsconfig.json             # TypeScript配置
│   ├── nodemon.json              # 开发服务器配置
│   └── jest.config.js            # 测试配置
├── frontend/
│   ├── src/
│   │   ├── main.ts               # 应用入口点
│   │   ├── App.vue               # 根组件
│   │   ├── assets/               # 静态资源
│   │   ├── components/           # Vue 组件
│   │   │   ├── AppDialog.vue
│   │   │   ├── AppPagination.vue
│   │   │   ├── AppSnackbar.vue
│   │   │   ├── AttractionCard.vue
│   │   │   ├── AuthForm.vue
│   │   │   ├── FeedbackForm.vue
│   │   │   └── SearchFilterBar.vue
│   │   ├── views/                # 页面视图
│   │   │   ├── Admin.vue
│   │   │   ├── AdminAttractions.vue
│   │   │   ├── AdminFacilities.vue
│   │   │   ├── AdminLogs.vue
│   │   │   ├── AdminOrders.vue
│   │   │   ├── AdminSettings.vue
│   │   │   ├── AdminTickets.vue
│   │   │   ├── AdminUsers.vue
│   │   │   ├── AttractionDetail.vue
│   │   │   ├── Attractions.vue
│   │   │   ├── Feedback.vue
│   │   │   ├── Login.vue
│   │   │   ├── OrderDetail.vue
│   │   │   ├── Register.vue
│   │   │   ├── TicketBuy.vue
│   │   │   └── UserProfile.vue
│   │   ├── stores/               # Pinia 状态管理
│   │   │   └── index.ts
│   │   ├── router/               # Vue Router
│   │   │   └── index.ts
│   │   ├── plugins/              # 插件配置
│   │   ├── types/                # TypeScript类型定义
│   │   └── utils/                # 工具函数
│   │       ├── api.ts            # API调用函数
│   │       └── formatting.ts     # 格式化工具
│   ├── public/                   # 公共资源
│   ├── index.html                # HTML入口文件
│   ├── package.json              # 依赖配置
│   ├── tsconfig.json             # TypeScript配置
│   ├── tsconfig.app.json
│   ├── tsconfig.node.json
│   └── vite.config.ts            # Vite打包配置
├── docs/
│   ├── api/
│   │   ├── api_spec.md           # API 规范
│   │   ├── error_codes.md        # 错误码说明
│   │   └── authentication.md     # JWT认证说明
│   ├── diagrams/
│   │   ├── architecture.png      # 架构图
│   │   └── er_diagram.png        # ER 图
│   ├── system_design.md          # 系统设计文档
│   └── directory_structure.md    # 目录结构说明
├── .github/                      # GitHub配置
├── .vscode/                      # VS Code 配置
├── .gitignore                    # Git忽略配置
├── .gitattributes                # Git属性配置
├── README.md                     # 项目说明
└── LICENSE                       # 许可证
```

## 说明

- **backend/**: 后端服务，包含 Express 路由和 Sequelize 模型
  - **src/**: 源代码目录
    - **index.ts**: 应用入口点，根据环境变量配置选择HTTP或HTTPS协议提供服务
    - **controllers/**: API 控制器，处理业务逻辑
    - **middlewares/**: 中间件，包括认证、日志记录等
    - **models/**: 数据模型定义，使用 Sequelize ORM
    - **routes/**: API 路由定义
    - **utils/**: 工具函数，如数据库连接、日志等
    - **validators/**: 请求数据验证器
  - **scripts/**: 数据库脚本和其他工具脚本
  - **uploads/**: 文件上传存储目录
  - **logs/**: 系统日志存储目录

- **frontend/**: 前端应用，使用 Vue3 和 Vuetify 3
  - **src/**: 源代码目录
    - **components/**: 可复用的 Vue 组件
    - **views/**: 页面级组件，对应路由
    - **stores/**: Pinia 状态管理
    - **router/**: Vue Router 路由配置
    - **utils/**: 工具函数，包括 API 调用

- **docs/**: 项目文档
  - **api/**: API相关文档
  - **diagrams/**: 系统架构和数据库图表

- **.github/**: GitHub 相关配置，如工作流、模板等
- **.vscode/**: Visual Studio Code 编辑器配置
