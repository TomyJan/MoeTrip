import { Request, Response } from 'express';
import User from '../models/user.model';
import Attraction from '../models/attraction.model';
import Feedback from '../models/feedback.model';
import { Sequelize, Op } from 'sequelize';

/**
 * 获取系统统计数据
 * @route POST /admin/stats
 */
export const getStats = async (req: Request, res: Response) => {
  try {
    // 查询用户数量
    const usersCount = await User.count();

    // 查询景点数量
    const attractionsCount = await Attraction.count();

    // 查询反馈数量
    const feedbackCount = await Feedback.count({
      where: {
        status: 'public', // 只统计公开的反馈
      },
    });

    // 查询平均评分
    const avgScoreResultData = await Feedback.findOne({
      attributes: [[Sequelize.fn('AVG', Sequelize.col('score')), 'avgScore']],
      where: {
        status: 'public', // 只统计公开的反馈
      },
      raw: true,
    });

    // 使用类型断言转换结果
    const avgScoreResult = avgScoreResultData as unknown as {
      avgScore?: string | number;
    } | null;

    // 计算平均分，保留一位小数
    const avgScore = avgScoreResult?.avgScore
      ? parseFloat(parseFloat(avgScoreResult.avgScore.toString()).toFixed(1))
      : 0;

    // 返回统计数据
    return res.json({
      code: 0,
      message: null,
      data: {
        users: usersCount,
        attractions: attractionsCount,
        feedback: feedbackCount,
        avgScore,
      },
    });
  } catch (error) {
    console.error('获取管理员统计数据失败:', error);
    return res.status(500).json({
      code: 5000,
      message: '服务器内部错误',
      data: null,
    });
  }
};

/**
 * 查询用户列表
 * @route POST /admin/users/query
 */
export const queryUsers = async (req: Request, res: Response) => {
  try {
    const { page = 1, pageSize = 10, keyword = '', role = '' } = req.body;

    // 验证参数
    if (page < 1 || pageSize < 1 || pageSize > 50) {
      return res.status(400).json({
        code: 1001,
        message: '无效的分页参数',
        data: null,
      });
    }

    // 构建查询条件
    const where: any = {};
    if (keyword) {
      where.username = { [Op.iLike]: `%${keyword}%` };
    }
    if (role) {
      where.role = role;
    }

    // 查询总数
    const total = await User.count({ where });

    // 查询用户列表
    const users = await User.findAll({
      where,
      attributes: { exclude: ['password_hash'] },
      order: [['created_at', 'DESC']],
      offset: (page - 1) * pageSize,
      limit: pageSize,
    });

    return res.json({
      code: 0,
      message: null,
      data: {
        total,
        users,
        page,
        pageSize,
      },
    });
  } catch (error) {
    console.error('查询用户列表失败:', error);
    return res.status(500).json({
      code: 5000,
      message: '服务器内部错误',
      data: null,
    });
  }
};

/**
 * 添加用户
 * @route POST /admin/users/add
 */
export const addUser = async (req: Request, res: Response) => {
  try {
    const { username, password, role } = req.body;

    // 验证参数
    if (!username || !password) {
      return res.status(400).json({
        code: 1001,
        message: '用户名和密码不能为空',
        data: null,
      });
    }

    if (username.length < 3 || username.length > 50) {
      return res.status(400).json({
        code: 1001,
        message: '用户名长度必须在3-50个字符之间',
        data: null,
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        code: 1001,
        message: '密码长度不能少于6个字符',
        data: null,
      });
    }

    if (role !== 'user' && role !== 'admin') {
      return res.status(400).json({
        code: 1001,
        message: '无效的用户角色',
        data: null,
      });
    }

    // 检查用户名是否已存在
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({
        code: 1003,
        message: '用户名已存在',
        data: null,
      });
    }

    // 创建用户
    const user = await User.create({
      username,
      password_hash: password, // 注意：前端应该已经进行了SHA1哈希
      role,
    });

    return res.json({
      code: 0,
      message: null,
      data: {
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          created_at: user.created_at,
          updated_at: user.updated_at,
        },
      },
    });
  } catch (error) {
    console.error('添加用户失败:', error);
    return res.status(500).json({
      code: 5000,
      message: '服务器内部错误',
      data: null,
    });
  }
};

/**
 * 更新用户
 * @route POST /admin/users/update
 */
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id, role } = req.body;

    // 验证参数
    if (!id) {
      return res.status(400).json({
        code: 1001,
        message: '用户ID不能为空',
        data: null,
      });
    }

    if (role && role !== 'user' && role !== 'admin') {
      return res.status(400).json({
        code: 1001,
        message: '无效的用户角色',
        data: null,
      });
    }

    // 查找用户
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        code: 1004,
        message: '用户不存在',
        data: null,
      });
    }

    // 防止修改系统管理员
    if (user.username === 'TomyJan' && role !== 'admin') {
      return res.status(403).json({
        code: 2001,
        message: '不能修改系统管理员的角色',
        data: null,
      });
    }

    // 更新用户
    if (role) {
      user.role = role as 'user' | 'admin';
    }

    await user.save();

    return res.json({
      code: 0,
      message: null,
      data: {
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          created_at: user.created_at,
          updated_at: user.updated_at,
        },
      },
    });
  } catch (error) {
    console.error('更新用户失败:', error);
    return res.status(500).json({
      code: 5000,
      message: '服务器内部错误',
      data: null,
    });
  }
};

/**
 * 删除用户
 * @route POST /admin/users/delete
 */
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;

    // 验证参数
    if (!id) {
      return res.status(400).json({
        code: 1001,
        message: '用户ID不能为空',
        data: null,
      });
    }

    // 查找用户
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        code: 1004,
        message: '用户不存在',
        data: null,
      });
    }

    // 防止删除系统管理员
    if (user.username === 'TomyJan') {
      return res.status(403).json({
        code: 2001,
        message: '不能删除系统管理员',
        data: null,
      });
    }

    // 防止删除当前登录用户
    const currentUser = req.user;
    if (currentUser && currentUser.id === user.id) {
      return res.status(403).json({
        code: 2001,
        message: '不能删除当前登录用户',
        data: null,
      });
    }

    // 删除用户
    await user.destroy();

    return res.json({
      code: 0,
      message: null,
      data: { success: true },
    });
  } catch (error) {
    console.error('删除用户失败:', error);
    return res.status(500).json({
      code: 5000,
      message: '服务器内部错误',
      data: null,
    });
  }
};
