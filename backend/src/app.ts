import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

const app = express();

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
}));

// 健康检查
app.get('/health', (req, res) => {
  res.json({code: 0, message: null, data: { status: 'ok', timestamp: new Date().toISOString() }});
});

// API路由
// TODO: 添加路由

export default app;
