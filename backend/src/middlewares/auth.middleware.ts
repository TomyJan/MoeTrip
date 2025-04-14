import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// 扩展 Request 类型以包含用户信息
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        role: 'user' | 'admin';
      };
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(200).json({
        code: 2001,
        message: '未提供认证令牌',
        data: null
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: number;
      role: 'user' | 'admin';
    };

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(200).json({
      code: 2001,
      message: '无效的认证令牌',
      data: null
    });
  }
};

// 管理员权限检查中间件
export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'admin') {
    return res.status(200).json({
      code: 2001,
      message: '需要管理员权限',
      data: null
    });
  }
  next();
};
