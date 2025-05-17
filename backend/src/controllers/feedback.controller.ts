import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Feedback from '../models/feedback.model';
import Attraction from '../models/attraction.model';
import logger from '../utils/logger';
import { Sequelize } from 'sequelize';

/**
 * 添加用户反馈
 * @param req.body.attraction_id 景点ID
 * @param req.body.score 评分（1-5）
 * @param req.body.comment 评论内容（可选）
 * @param req.user.id 当前登录用户ID (从JWT获取)
 */
export const addFeedback = async (req: Request, res: Response) => {
  try {
    const { attraction_id, score, comment } = req.body;
    const userId = req.user?.id;

    // 验证景点ID
    if (!attraction_id || typeof attraction_id !== 'number') {
      return res.json({
        code: 1001,
        message: '景点ID必须提供且为数字',
        data: null,
      });
    }

    // 验证分数
    if (!score || typeof score !== 'number' || score < 1 || score > 5) {
      return res.json({
        code: 1001,
        message: '评分必须是1-5之间的整数',
        data: null,
      });
    }

    // 验证评论长度（如果提供）
    if (comment && comment.length > 500) {
      return res.json({
        code: 1001,
        message: '评论长度不能超过500个字符',
        data: null,
      });
    }

    // 检查用户是否已经对该景点提交过反馈
    const existingFeedback = await Feedback.findOne({
      where: {
        user_id: userId,
        attraction_id,
      },
    });

    if (existingFeedback) {
      // 如果已有反馈被标记为删除，则更新它而不是创建新的
      if (existingFeedback.status === 'deleted') {
        const updatedFeedback = await existingFeedback.update({
          score,
          comment: comment || null,
          status: 'public',
        });

        logger.info(
          `用户(${userId})恢复了对景点(${attraction_id})的反馈，评分: ${score}`,
        );

        // 获取景点名称
        const attraction = await Attraction.findByPk(attraction_id);
        const feedbackWithAttraction = {
          ...updatedFeedback.get({ plain: true }),
          attraction_name: attraction ? attraction.name : null,
        };

        return res.json({
          code: 0,
          message: null,
          data: { feedback: feedbackWithAttraction },
        });
      } else {
        return res.json({
          code: 1002,
          message: '您已经对该景点提交过反馈，请使用更新功能修改',
          data: { feedback: existingFeedback },
        });
      }
    }

    // 创建新反馈
    const feedback = await Feedback.create({
      user_id: userId,
      attraction_id,
      score,
      comment: comment || null,
      status: 'public',
    });

    logger.info(
      `用户(${userId})对景点(${attraction_id})提交了新反馈，评分: ${score}`,
    );

    // 获取景点名称
    const attraction = await Attraction.findByPk(attraction_id);
    const feedbackWithAttraction = {
      ...feedback.get({ plain: true }),
      attraction_name: attraction ? attraction.name : null,
    };

    return res.json({
      code: 0,
      message: null,
      data: { feedback: feedbackWithAttraction },
    });
  } catch (error) {
    logger.error('提交反馈失败:', error);
    return res.json({
      code: 500,
      message: '服务器内部错误',
      data: null,
    });
  }
};

/**
 * 更新用户反馈
 * @param req.body.id 反馈ID (可选，如果提供则按ID更新)
 * @param req.body.attraction_id 景点ID (在不提供id时必须)
 * @param req.body.user_id 用户ID (可选，管理员可更新其他用户的反馈)
 * @param req.body.score 评分（1-5）(可选，如果更新)
 * @param req.body.comment 评论内容（可选，如果更新；传null则清除评论）
 * @param req.body.status 反馈状态 (可选，'public'或'deleted')
 * @param req.user.id 当前登录用户ID (从JWT获取)
 * @param req.user.role 当前登录用户角色 (从JWT获取)
 */
export const updateFeedback = async (req: Request, res: Response) => {
  try {
    const { id, attraction_id, user_id, score, comment, status } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    let feedback;

    // 根据ID或者用户ID+景点ID查找反馈
    if (id) {
      feedback = await Feedback.findByPk(id);
    } else if (attraction_id) {
      const targetUserId = user_id || userId;

      feedback = await Feedback.findOne({
        where: {
          user_id: targetUserId,
          attraction_id,
        },
      });
    } else {
      return res.json({
        code: 1001,
        message: '必须提供反馈ID或景点ID',
        data: null,
      });
    }

    // 验证反馈是否存在
    if (!feedback) {
      return res.json({
        code: 1006,
        message: '反馈不存在',
        data: null,
      });
    }

    // 权限检查：只有反馈作者或管理员可以更新
    if (feedback.user_id !== userId && userRole !== 'admin') {
      return res.json({
        code: 2001,
        message: '无权更新此反馈',
        data: null,
      });
    }

    // 构建更新数据
    const updateData: any = {};

    // 如果提供了新评分，进行验证
    if (score !== undefined) {
      if (typeof score !== 'number' || score < 1 || score > 5) {
        return res.json({
          code: 1001,
          message: '评分必须是1-5之间的整数',
          data: null,
        });
      }
      updateData.score = score;
    }

    // 如果提供了新评论，进行验证
    if (comment !== undefined) {
      if (comment && comment.length > 500) {
        return res.json({
          code: 1001,
          message: '评论长度不能超过500个字符',
          data: null,
        });
      }
      updateData.comment = comment || null;
    }

    // 处理状态更新
    if (status !== undefined) {
      if (status !== 'public' && status !== 'deleted') {
        return res.json({
          code: 1001,
          message: '状态必须是public或deleted',
          data: null,
        });
      }
      updateData.status = status;
    }

    // 验证是否有任何需要更新的内容
    if (Object.keys(updateData).length === 0) {
      return res.json({
        code: 1001,
        message: '没有提供任何更新内容',
        data: null,
      });
    }

    // 更新反馈
    const updatedFeedback = await feedback.update(updateData);

    // 获取景点名称
    const attraction = await Attraction.findByPk(updatedFeedback.attraction_id);
    const feedbackWithAttraction = {
      ...updatedFeedback.get({ plain: true }),
      attraction_name: attraction ? attraction.name : null,
    };

    // 根据状态更新日志内容
    if (updateData.status === 'deleted') {
      logger.info(
        `反馈(ID:${updatedFeedback.id}, 景点:${updatedFeedback.attraction_id})已被${userRole === 'admin' ? '管理员' : '用户'}标记为删除`,
      );
      return res.json({
        code: 0,
        message: '反馈已标记为删除',
        data: { feedback: feedbackWithAttraction },
      });
    } else {
      logger.info(
        `反馈(ID:${updatedFeedback.id}, 景点:${updatedFeedback.attraction_id})已被${userRole === 'admin' ? '管理员' : '用户'}更新`,
      );
      return res.json({
        code: 0,
        message: '反馈已更新',
        data: { feedback: feedbackWithAttraction },
      });
    }
  } catch (error) {
    logger.error('更新反馈失败:', error);
    return res.json({
      code: 500,
      message: '服务器内部错误',
      data: null,
    });
  }
};

/**
 * 查询反馈列表
 * @param req.body.id 反馈ID (可选，获取单个反馈)
 * @param req.body.user_id 用户ID (可选，管理员可获取特定用户的反馈)
 * @param req.body.attraction_id 景点ID (可选，查询特定景点的反馈)
 * @param req.body.min_score 最小评分 (可选，过滤条件)
 * @param req.body.max_score 最大评分 (可选，过滤条件)
 * @param req.body.has_comment 是否有评论 (可选，过滤条件)
 * @param req.body.keyword 关键词搜索 (可选，在评论中搜索)
 * @param req.body.include_deleted 是否包含已删除的反馈 (可选，管理员可用)
 * @param req.body.page 页码，默认1
 * @param req.body.pageSize 每页数量，默认10
 * @param req.user.id 当前登录用户ID (从JWT获取)
 * @param req.user.role 当前登录用户角色 (从JWT获取)
 */
export const queryFeedback = async (req: Request, res: Response) => {
  try {
    const {
      id,
      user_id,
      attraction_id,
      min_score,
      max_score,
      has_comment,
      keyword,
      include_deleted,
      page = 1,
      pageSize = 10,
    } = req.body;

    const userId = req.user?.id;
    const userRole = req.user?.role;

    // 如果指定了ID，直接查询单个反馈
    if (id) {
      const feedback = await Feedback.findByPk(id);

      // 如果反馈不存在
      if (!feedback) {
        return res.json({
          code: 1006,
          message: '反馈不存在',
          data: null,
        });
      }

      // 权限检查：普通用户只能查看自己的反馈
      if (userRole !== 'admin' && feedback.user_id !== userId) {
        return res.json({
          code: 2001,
          message: '无权查看此反馈',
          data: null,
        });
      }

      // 过滤已删除的反馈（除非是管理员且明确要求包含已删除反馈）
      if (
        feedback.status === 'deleted' &&
        (userRole !== 'admin' || !include_deleted)
      ) {
        return res.json({
          code: 1006,
          message: '反馈不存在或已删除',
          data: null,
        });
      }

      // 获取景点信息
      const attraction = await Attraction.findByPk(feedback.attraction_id);
      const feedbackWithAttraction = {
        ...feedback.get({ plain: true }),
        attraction_name: attraction ? attraction.name : null,
      };

      return res.json({
        code: 0,
        message: null,
        data: {
          total: feedback ? 1 : 0,
          feedback: feedback ? [feedbackWithAttraction] : [],
          avgScore: feedback ? feedback.score : 0,
          page: 1,
          pageSize: 1,
        },
      });
    }

    // 如果请求用户对特定景点的反馈（相当于之前的user-feedback功能）
    if (attraction_id && !user_id && !pageSize) {
      const feedback = await Feedback.findOne({
        where: {
          user_id: userId,
          attraction_id,
          status: 'public', // 只返回未删除的
        },
      });

      // 如果找到了反馈，获取景点信息
      let feedbackWithAttraction = null;
      if (feedback) {
        const attraction = await Attraction.findByPk(attraction_id);
        feedbackWithAttraction = {
          ...feedback.get({ plain: true }),
          attraction_name: attraction ? attraction.name : null,
        };
      }

      return res.json({
        code: 0,
        message: null,
        data: {
          total: feedback ? 1 : 0,
          feedback: feedback ? [feedbackWithAttraction] : [],
          avgScore: feedback ? feedback.score : 0,
          page: 1,
          pageSize: 1,
        }, // feedback可能为null，表示用户未对该景点评价
      });
    }

    // 验证分页参数
    if (page < 1 || pageSize < 1 || pageSize > 50) {
      return res.json({
        code: 1001,
        message: '无效的分页参数',
        data: null,
      });
    }

    // 构建查询条件
    let where: any = {};

    // 默认只查询未删除的反馈，除非管理员明确要求包含已删除的
    if (userRole === 'admin' && include_deleted === true) {
      // 不添加状态过滤，查询所有反馈
    } else {
      where.status = 'public';
    }

    // 权限检查：普通用户只能查询自己的反馈，除非指定了景点ID
    if (userRole !== 'admin') {
      if (attraction_id) {
        // 允许普通用户查询特定景点的所有反馈
        where.attraction_id = attraction_id;
      } else {
        // 否则只能查询自己的反馈
        where.user_id = userId;
      }
    } else {
      // 管理员可以按条件筛选
      if (user_id) {
        where.user_id = user_id;
      }

      if (attraction_id) {
        where.attraction_id = attraction_id;
      }
    }

    // 评分范围过滤
    if (min_score !== undefined && max_score !== undefined) {
      if (min_score > max_score) {
        return res.json({
          code: 1001,
          message: '最小评分不能大于最大评分',
          data: null,
        });
      }
      where.score = { [Op.between]: [min_score, max_score] };
    } else if (min_score !== undefined) {
      where.score = { [Op.gte]: min_score };
    } else if (max_score !== undefined) {
      where.score = { [Op.lte]: max_score };
    }

    // 是否有评论过滤
    if (has_comment === true) {
      where.comment = { [Op.and]: [{ [Op.not]: null }, { [Op.ne]: '' }] };
    } else if (has_comment === false) {
      where.comment = { [Op.or]: [null, ''] };
    }

    // 关键词搜索
    if (keyword) {
      where.comment = { [Op.iLike]: `%${keyword}%` };
    }

    // 查询总数
    const total = await Feedback.count({ where });

    // 查询反馈数据
    const feedbacks = await Feedback.findAll({
      where,
      order: [['created_at', 'DESC']],
      offset: (page - 1) * pageSize,
      limit: pageSize,
    });

    // 为每个反馈添加景点名称
    const feedbacksWithAttraction = await Promise.all(
      feedbacks.map(async (feedback) => {
        const attraction = await Attraction.findByPk(feedback.attraction_id);
        return {
          ...feedback.get({ plain: true }),
          attraction_name: attraction ? attraction.name : null,
        };
      }),
    );

    // 计算特定景点的平均评分
    let avgScore = 0;
    if (attraction_id && feedbacks.length > 0) {
      const sum = feedbacks.reduce((acc, item) => acc + item.score, 0);
      avgScore = Math.round((sum / feedbacks.length) * 10) / 10; // 保留一位小数
    }

    return res.json({
      code: 0,
      message: null,
      data: {
        total,
        feedback: feedbacksWithAttraction,
        avgScore,
        page,
        pageSize,
      },
    });
  } catch (error) {
    logger.error('查询反馈失败:', error);
    return res.json({
      code: 500,
      message: '服务器内部错误',
      data: null,
    });
  }
};

/**
 * 获取反馈统计数据
 * @route POST /feedback/stats
 */
export const getStats = async (req: Request, res: Response) => {
  try {
    const { attraction_id, include_deleted } = req.body;

    // 构建查询条件
    const whereCondition: any = {};

    // 如果指定了景点ID，则只统计该景点的反馈
    if (attraction_id) {
      whereCondition.attraction_id = attraction_id;
    }

    // 默认只统计公开状态的反馈，除非明确要求包含已删除的
    if (!include_deleted) {
      whereCondition.status = 'public';
    }

    // 查询反馈总数
    const totalCount = await Feedback.count({
      where: whereCondition,
    });

    // 查询平均评分
    const avgScoreResultData = await Feedback.findOne({
      attributes: [[Sequelize.fn('AVG', Sequelize.col('score')), 'avgScore']],
      where: whereCondition,
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

    // 查询评分分布
    const scoreDistributionData = await Feedback.findAll({
      attributes: [
        'score',
        [Sequelize.fn('COUNT', Sequelize.col('score')), 'count'],
      ],
      where: whereCondition,
      group: ['score'],
      order: [[Sequelize.col('score'), 'ASC']],
      raw: true,
    });

    // 使用类型断言转换结果
    const scoreDistribution = scoreDistributionData as unknown as Array<{
      score: number;
      count: string | number;
    }>;

    // 格式化评分分布结果
    const distribution: Record<string, number> = {
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 0,
      '5': 0,
    };

    scoreDistribution.forEach((item) => {
      distribution[item.score.toString()] = parseInt(item.count.toString());
    });

    // 查询有评论的反馈数量
    const withCommentCount = await Feedback.count({
      where: {
        ...whereCondition,
        comment: {
          [Op.ne]: null,
        },
      },
    });

    // 计算带评论的反馈百分比，保留一位小数
    const withCommentPercent =
      totalCount > 0
        ? parseFloat(((withCommentCount / totalCount) * 100).toFixed(1))
        : 0;

    return res.json({
      code: 0,
      message: null,
      data: {
        totalCount,
        avgScore,
        scoreDistribution: distribution,
        withCommentCount,
        withCommentPercent,
      },
    });
  } catch (error) {
    console.error('获取反馈统计数据失败:', error);
    return res.status(500).json({
      code: 5000,
      message: '服务器内部错误',
      data: null,
    });
  }
};
