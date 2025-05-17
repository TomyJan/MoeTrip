import { Request, Response } from 'express';
import User from '../models/user.model';
import Attraction from '../models/attraction.model';
import Feedback from '../models/feedback.model';
import { Sequelize } from 'sequelize';

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
      attributes: [
        [Sequelize.fn('AVG', Sequelize.col('score')), 'avgScore'],
      ],
      where: {
        status: 'public', // 只统计公开的反馈
      },
      raw: true,
    });
    
    // 使用类型断言转换结果
    const avgScoreResult = avgScoreResultData as unknown as { avgScore?: string | number } | null;

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