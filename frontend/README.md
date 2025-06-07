# MoeTrip 旅游景区信息管理系统前端

这是MoeTrip旅游景区信息管理系统的前端部分，基于Vue 3 + TypeScript + Vite + Vuetify开发。

## 项目功能

- 用户认证（登录/注册）
- 景点信息浏览和管理
- 用户反馈系统
- 系统管理功能（管理员专用）
- 数据可视化统计

## 技术栈

- [Vue 3](https://v3.vuejs.org/)：核心前端框架
- [TypeScript](https://www.typescriptlang.org/)：类型系统
- [Vite](https://vitejs.dev/)：开发与构建工具
- [Vuetify 3](https://vuetifyjs.com/)：Material Design组件库
- [Pinia](https://pinia.vuejs.org/)：状态管理
- [Vue Router](https://router.vuejs.org/)：路由管理
- [ECharts](https://echarts.apache.org/)：数据可视化
- [Crypto-js](https://github.com/brix/crypto-js)：加密库

## 开发环境设置

### 前提条件

- Node.js (推荐v18或更高版本)
- pnpm (推荐v8或更高版本)

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

### 构建生产版本

```bash
pnpm build
```

### 预览生产构建

```bash
pnpm preview
```

## 项目结构

```
frontend/
├── public/           # 静态资源，不需要通过构建过程处理
├── src/              # 源代码
│   ├── assets/       # 需要通过构建过程处理的资源
│   ├── components/   # 可复用组件
│   ├── plugins/      # 插件配置（Vuetify等）
│   ├── router/       # 路由配置
│   ├── stores/       # Pinia状态仓库
│   ├── types/        # TypeScript类型定义
│   ├── utils/        # 工具函数
│   ├── views/        # 页面级组件
│   ├── App.vue       # 应用入口组件
│   └── main.ts       # 应用入口
├── .env              # 环境变量
├── .gitignore        # Git忽略配置
├── package.json      # 依赖和脚本配置
├── tsconfig.json     # TypeScript配置
└── vite.config.ts    # Vite配置
```

## 环境变量

项目使用`.env`文件进行环境变量配置：

- `VITE_API_BASE_URL`: API基础URL，默认为`http://localhost:5200/api/v1`
- `VITE_IS_DEMO`: 是否为演示模式，演示模式目前会在登录页面显示示例用户提示
