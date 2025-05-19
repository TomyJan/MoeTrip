import { Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import User from '../models/user.model';
import LogService from '../utils/log-service';
import logger from '../utils/logger';

export const register = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // 验证输入
    if (!username || !password) {
      return res.json({
        code: 1001,
        message: '用户名和密码不能为空',
        data: null,
      });
    }

    // 验证用户名长度
    if (username.length < 3 || username.length > 50) {
      return res.json({
        code: 1001,
        message: '用户名长度必须在3-50个字符之间',
        data: null,
      });
    }

    // 验证密码格式（SHA1）
    if (!/^[a-f0-9]{40}$/i.test(password)) {
      return res.json({
        code: 1001,
        message: '密码格式无效',
        data: null,
      });
    }

    // 检查用户名是否已存在
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.json({
        code: 1003,
        message: '用户名已存在',
        data: null,
      });
    }

    // 创建新用户
    const user = await User.create({
      username,
      password_hash: password,
      role: 'user',
    });

    // 生成 JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN } as SignOptions,
    );

    // 记录注册操作日志
    try {
      await LogService.createLog(
        user.id,
        'register',
        'user',
        user.id,
        { username: user.username, role: user.role },
        req.ip || req.socket.remoteAddress || '',
        req.headers['user-agent'] || '',
      );
    } catch (logError) {
      logger.error('注册日志记录失败:', logError);
    }

    return res.json({
      code: 0,
      message: null,
      data: {
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    console.error('注册失败:', error);
    return res.json({
      code: 500,
      message: '服务器内部错误',
      data: null,
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // 验证输入
    if (!username || !password) {
      return res.json({
        code: 1001,
        message: '用户名和密码不能为空',
        data: null,
      });
    }

    // 查找用户
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.json({
        code: 1004,
        message: '用户名或密码错误',
        data: null,
      });
    }

    // 验证密码
    if (!user.validatePassword(password)) {
      return res.json({
        code: 1004,
        message: '用户名或密码错误',
        data: null,
      });
    }

    // 生成 JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN } as SignOptions,
    );

    // 记录登录操作日志
    try {
      await LogService.createLog(
        user.id,
        'login',
        'user',
        user.id,
        { username: user.username, role: user.role },
        req.ip || req.socket.remoteAddress || '',
        req.headers['user-agent'] || '',
      );
    } catch (logError) {
      logger.error('登录日志记录失败:', logError);
    }

    return res.json({
      code: 0,
      message: null,
      data: {
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    console.error('登录失败:', error);
    return res.json({
      code: 500,
      message: '服务器内部错误',
      data: null,
    });
  }
};

// 添加登出操作的API
export const logout = async (req: Request, res: Response) => {
  try {
    // 当前没有真正的登出操作，因为使用的是JWT，客户端只需丢弃token
    // 但我们仍然可以记录登出行为
    if (req.user) {
      try {
        await LogService.createLog(
          req.user.id,
          'logout',
          'user',
          req.user.id,
          { userId: req.user.id },
          req.ip || req.socket.remoteAddress || '',
          req.headers['user-agent'] || '',
        );
      } catch (logError) {
        logger.error('登出日志记录失败:', logError);
      }
    }

    return res.json({
      code: 0,
      message: null,
      data: { success: true },
    });
  } catch (error) {
    console.error('登出失败:', error);
    return res.json({
      code: 500,
      message: '服务器内部错误',
      data: null,
    });
  }
};
