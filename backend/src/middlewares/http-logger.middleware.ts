import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";

export const httpLogger = (req: Request, res: Response, next: NextFunction) => {
  // 记录请求开始时间
  const start = Date.now();

  // 响应结束时记录日志
  res.on("finish", () => {
    const duration = Date.now() - start;
    const message = `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`;

    // 根据状态码选择日志级别
    if (res.statusCode >= 500) {
      logger.error(message);
    } else if (res.statusCode >= 400) {
      logger.warn(message);
    } else {
      logger.http(message);
    }
  });

  next();
};
