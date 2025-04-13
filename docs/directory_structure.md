# MoeTrip 目录结构

以下是 MoeTrip 项目的目录结构，基于前后端分离架构，包含代码、文档和配置。

```
MoeTrip/
├── backend/
│   ├── src/
│   │   ├── controllers/          # 业务逻辑
│   │   ├── models/               # Sequelize 模型
│   │   │   ├── attraction.model.ts
│   │   │   ├── facility.model.ts
│   │   │   ├── user.model.ts
│   │   │   ├── ticket.model.ts
│   │   │   └── order.model.ts
│   │   ├── routes/               # 自定义路由
│   │   └── utils/                # 工具函数
│   ├── scripts/
│   │   ├── init_db_postgres.sql  # PostgreSQL 数据库初始化
│   │   └── init_db_mysql.sql     # MySQL 数据库初始化
│   ├── tests/                    # 单元测试
│   ├── docs/
│   │   └── setup.md              # 后端环境说明
│   ├── .env.example              # 环境变量模板
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── assets/               # 静态资源
│   │   ├── components/           # Vue 组件
│   │   ├── views/                # 页面视图
│   │   ├── stores/               # Pinia 状态管理
│   │   └── utils/                # 工具函数
│   ├── public/                   # 公共资源
│   ├── tests/                    # 前端测试
│   ├── docs/
│   │   └── setup.md              # 前端环境说明
│   ├── package.json
│   └── tsconfig.json
├── docs/
│   ├── api/
│   │   ├── api_spec.md           # API 规范
│   │   ├── error_codes.md        # 错误码说明
│   │   └── authentication.md     # JWT认证说明
│   ├── diagrams/
│   │   ├── architecture.png      # 架构图
│   │   └── er_diagram.png        # ER 图
│   ├── deliverables/
│   │   ├── thesis_report.docx
│   │   ├── translation.docx
│   │   └── project_summary.docx
│   ├── system_design.md
│   └── directory_structure.md
├── .gitignore
├── README.md
└── docker-compose.yml
```

## 说明

- **backend/**: 后端服务，包含 Express 路由和 Sequelize 模型
  - **models/**: 数据模型定义
    - **attraction.model.ts**: 景点信息模型
    - **facility.model.ts**: 设施信息模型
    - **user.model.ts**: 用户信息模型
    - **ticket.model.ts**: 票种信息模型
    - **order.model.ts**: 订单信息模型
- **frontend/**: 前端应用，使用 Vue3 和 Vuetify 3
- **docs/**: 项目文档
  - **api/**: API相关文档
    - **api_spec.md**: API接口规范
    - **error_codes.md**: 错误码说明文档
    - **authentication.md**: JWT认证说明文档
  - **diagrams/**: 图表文件
  - **deliverables/**: 毕业设计成果
- **scripts/**: 数据库脚本
- **tests/**: 测试用例
- **.env.example**: 后端环境配置模板
