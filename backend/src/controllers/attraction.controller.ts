import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Attraction from '../models/attraction.model';
import logger from '../utils/logger';

/**
 * 查询景点列表
 * @param req.body.keyword 搜索关键词（可选）
 * @param req.body.page 页码，默认1
 * @param req.body.pageSize 每页数量，默认10
 */
export const queryAttractions = async (req: Request, res: Response) => {
  try {
    const { keyword = '', page = 1, pageSize = 10 } = req.body;

    // 验证参数
    if (page < 1 || pageSize < 1) {
      return res.json({
        code: 1001,
        message: '无效的分页参数',
        data: null
      });
    }

    // 构建查询条件
    const where = keyword ? {
      [Op.or]: [
        { name: { [Op.iLike]: `%${keyword}%` } },
        { description: { [Op.iLike]: `%${keyword}%` } }
      ]
    } : {};

    // 查询总数
    const total = await Attraction.count({ where });

    // 查询数据
    const attractions = await Attraction.findAll({
      where,
      order: [['created_at', 'DESC']],
      offset: (page - 1) * pageSize,
      limit: pageSize
    });

    return res.json({
      code: 0,
      message: null,
      data: {
        total,
        attractions,
        page,
        pageSize
      }
    });
  } catch (error) {
    logger.error('查询景点列表失败:', error);
    return res.json({
      code: 500,
      message: '服务器内部错误',
      data: null
    });
  }
};

/**
 * 添加新景点
 * @param req.body.name 景点名称
 * @param req.body.description 景点描述
 * @param req.body.open_time 开放时间
 * @param req.body.image_url 图片URL
 */
export const addAttraction = async (req: Request, res: Response) => {
  try {
    const { name, description, open_time, image_url } = req.body;

    // 验证必填字段
    if (!name || !description || !open_time || !image_url) {
      return res.json({
        code: 1001,
        message: '缺少必需的字段',
        data: null
      });
    }

    // 验证字段长度
    if (name.length > 100) {
      return res.json({
        code: 1001,
        message: '景点名称不能超过100个字符',
        data: null
      });
    }

    if (open_time.length > 50) {
      return res.json({
        code: 1001,
        message: '开放时间不能超过50个字符',
        data: null
      });
    }

    if (image_url.length > 255) {
      return res.json({
        code: 1001,
        message: '图片URL不能超过255个字符',
        data: null
      });
    }

    // 检查名称是否重复
    const existing = await Attraction.findOne({ where: { name } });
    if (existing) {
      return res.json({
        code: 1002,
        message: '景点名称已存在',
        data: null
      });
    }

    // 创建新景点
    const attraction = await Attraction.create({
      name,
      description,
      open_time,
      image_url
    });

    logger.info(`新景点已添加: ${name}`);

    return res.json({
      code: 0,
      message: null,
      data: attraction
    });
  } catch (error) {
    logger.error('添加景点失败:', error);
    return res.json({
      code: 500,
      message: '服务器内部错误',
      data: null
    });
  }
};
