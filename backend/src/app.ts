import express from 'express';
import cors from 'cors';
import userRoutes from './routes/user.routes';
import attractionRoutes from './routes/attraction.routes';
import facilityRoutes from './routes/facility.routes';
import ticketRoutes from './routes/ticket.routes';
import orderRoutes from './routes/order.routes';
import { httpLogger } from './middlewares/http-logger.middleware';
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

// API路由
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/attraction', attractionRoutes);
app.use('/api/v1/facility', facilityRoutes);
app.use('/api/v1/ticket', ticketRoutes);
app.use('/api/v1/order', orderRoutes);

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
