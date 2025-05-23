import express from 'express';
import cors from 'cors';
import userRoutes from './routes/user.routes';
import attractionRoutes from './routes/attraction.routes';
import facilityRoutes from './routes/facility.routes';
import ticketRoutes from './routes/ticket.routes';
import orderRoutes from './routes/order.routes';
import feedbackRoutes from './routes/feedback.routes';
import adminRoutes from './routes/admin.routes';
import logRoutes from './routes/log.routes';
import { httpLogger } from './middlewares/http-logger.middleware';
import { operationLogger } from './middlewares/operation-logger.middleware';
import { authMiddleware } from './middlewares/auth.middleware';
import logger from './utils/logger';

const app = express();

// 中间件
app.use(httpLogger); // 添加 HTTP 日志中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }),
);

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    code: 0,
    message: null,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
    },
  });
});

// 鉴权后添加操作日志中间件（必须放在路由之前）
// 注意这里不直接应用于所有路由，而是让各路由决定是否需要认证
app.use('/api/v1', operationLogger);

// API路由
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/attraction', attractionRoutes);
app.use('/api/v1/facility', facilityRoutes);
app.use('/api/v1/ticket', ticketRoutes);
app.use('/api/v1/order', orderRoutes);
app.use('/api/v1/feedback', feedbackRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/log', logRoutes);

// 错误处理中间件
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    logger.error(`未处理的错误: ${err.message}`);
    logger.error(err.stack);

    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null,
    });
  },
);

export default app;
