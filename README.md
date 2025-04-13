# MoeTrip

萌旅网 - 旅游景区信息管理系统

## 项目简介

MoeTrip 是一个旅游景区信息管理系统，采用前后端分离架构，基于 Vue3、Node.js 和 PostgreSQL / MySQL 开发，使用 TypeScript 确保代码质量。系统提供景区资源管理、用户信息管理、票务预约和数据分析功能，界面简洁直观，支持游客查询、购票及管理者运营分析。

## 技术栈

- **前端**:
  - 框架：Vue3
  - 语言：TypeScript
  - HTTP 请求：Fetch
  - UI 组件库：Vuetify 3（备选 Element Plus）
  - 数据可视化：ECharts
- **后端**:
  - 运行环境：Node.js
  - 框架：Express
  - 语言：TypeScript
  - ORM：Sequelize
- **数据库**：PostgreSQL / MySQL
- **工具**:
  - 版本控制：Git
  - API 测试：Apifox
  - 测试框架：Jest

## 功能模块

- **景区资源管理**:
  - 管理景点信息（名称、介绍、开放时间、图片）
  - 管理设施信息（位置、状态、维护记录）
  - 支持增删改查和搜索
- **用户信息管理**:
  - 用户注册、登录（游客、管理者角色）
  - 角色权限管理
  - 记录浏览、预定、反馈行为
- **票务与预约**:
  - 在线购票、退票、改签
  - 管理门票类型和价格
  - 预约冲突检测。
- **数据分析与可视化**:
  - 统计游客流量和商品销售
  - 生成收入和满意度报表
  - 支持动态图表展示

## 开发环境

- **Node.js**：v18 及以上
- **数据库**: PostgreSQL 15 及以上 或 MySQL 8 及以上
- **包管理**：pnpm（推荐）或 npm
- **工具**：
  - VS Code（推荐，安装 ESLint 和 Prettier 插件）
  - pgAdmin（数据库管理）
  - Apifox（API 测试）

## 快速开始

1. 克隆仓库：

    ```bash
    git clone https://github.com/TomyJan/MoeTrip.git
    cd MoeTrip
    ```
2. 安装依赖：

    ```bash
    cd backend && pnpm install
    cd ../frontend && pnpm install
    ```

3. 配置环境：

    复制 `backend/.env.example 到 backend/.env`，设置数据库连接

    运行 `backend/scripts/init_db_postgres.sql` 或 `backend/scripts/init_db_mysql.sql` 初始化数据库

4. 启动服务：

    ```bash
    # 后端
    cd backend && pnpm start
    # 前端
    cd frontend && pnpm dev
    ```

	访问：打开浏览器，进入 [http://localhost:5200](http://localhost:5200)

## 文档

整体设计：[docs/system_design.md](docs/system_design.md)

目录结构：[docs/directory_structure.md](docs/directory_structure.md)

API 文档：[docs/api/api_spec.md](docs/api/api_spec.md)

