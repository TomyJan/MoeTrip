import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Facility from '../models/facility.model';
import logger from '../utils/logger';

/**
 * 查询设施列表
 * @param req.body.attraction_id 景点ID（可选）
 * @param req.body.keyword 搜索关键词（可选）
 * @param req.body.page 页码，默认1
 * @param req.body.pageSize 每页数量，默认10
 */
export const queryFacilities = async (req: Request, res: Response) => {
  try {
    const { attraction_id, keyword = '', page = 1, pageSize = 10 } = req.body;

    // 验证参数
    if (page < 1 || pageSize < 1) {
      return res.json({
        code: 1001,
        message: '无效的分页参数',
        data: null,
      });
    }

    // 构建查询条件
    let where: any = {};

    if (attraction_id) {
      where.attraction_id = attraction_id;
    }

    if (keyword) {
      where = {
        ...where,
        [Op.or]: [
          { name: { [Op.iLike]: `%${keyword}%` } },
          { location: { [Op.iLike]: `%${keyword}%` } },
        ],
      };
    }

    // 查询总数
    const total = await Facility.count({ where });

    // 查询数据
    const facilities = await Facility.findAll({
      where,
      order: [['created_at', 'DESC']],
      offset: (page - 1) * pageSize,
      limit: pageSize,
    });

    return res.json({
      code: 0,
      message: null,
      data: {
        total,
        facilities,
        page,
        pageSize,
      },
    });
  } catch (error) {
    logger.error('查询设施列表失败:', error);
    return res.json({
      code: 500,
      message: '服务器内部错误',
      data: null,
    });
  }
};

/**
 * 添加新设施
 * @param req.body.name 设施名称
 * @param req.body.location 设施位置
 * @param req.body.status 设施状态
 * @param req.body.attraction_id 景点ID
 */
export const addFacility = async (req: Request, res: Response) => {
  try {
    const { name, location, status = 'normal', attraction_id } = req.body;

    // 验证必填字段
    if (!name || !location || !attraction_id) {
      return res.json({
        code: 1001,
        message: '缺少必需的字段',
        data: null,
      });
    }

    // 验证字段长度
    if (name.length > 100) {
      return res.json({
        code: 1001,
        message: '设施名称不能超过100个字符',
        data: null,
      });
    }

    if (location.length > 255) {
      return res.json({
        code: 1001,
        message: '设施位置不能超过255个字符',
        data: null,
      });
    }

    // 验证状态值
    const validStatus = ['normal', 'maintenance'];
    if (!validStatus.includes(status)) {
      return res.json({
        code: 1001,
        message: '设施状态必须为"normal"或"maintenance"',
        data: null,
      });
    }

    // 创建新设施
    const facility = await Facility.create({
      name,
      location,
      status,
      attraction_id,
    });

    logger.info(`新设施已添加: ${name}`);

    return res.json({
      code: 0,
      message: null,
      data: { facility },
    });
  } catch (error) {
    logger.error('添加设施失败:', error);
    return res.json({
      code: 500,
      message: '服务器内部错误',
      data: null,
    });
  }
};

/**
 * 更新设施
 * @param req.body.id 设施ID
 * @param req.body.name 设施名称（可选）
 * @param req.body.location 设施位置（可选）
 * @param req.body.status 设施状态（可选）
 * @param req.body.attraction_id 景点ID（可选）
 */
export const updateFacility = async (req: Request, res: Response) => {
  try {
    const { id, name, location, status, attraction_id } = req.body;

    // 验证ID参数
    if (!id) {
      return res.json({
        code: 1001,
        message: '缺少设施ID',
        data: null,
      });
    }

    // 查找设施
    const facility = await Facility.findByPk(id);
    if (!facility) {
      return res.json({
        code: 1002,
        message: '设施不存在',
        data: null,
      });
    }

    // 验证字段长度
    if (name && name.length > 100) {
      return res.json({
        code: 1003,
        message: '设施名称不能超过100个字符',
        data: null,
      });
    }

    if (location && location.length > 255) {
      return res.json({
        code: 1003,
        message: '设施位置不能超过255个字符',
        data: null,
      });
    }

    // 验证状态值
    if (status) {
      const validStatus = ['normal', 'maintenance'];
      if (!validStatus.includes(status)) {
        return res.json({
          code: 1003,
          message: '设施状态必须为"normal"或"maintenance"',
          data: null,
        });
      }
    }

    // 更新设施信息
    const updateFields: any = {};
    if (name) updateFields.name = name;
    if (location) updateFields.location = location;
    if (status) updateFields['status'] = status;
    if (attraction_id) updateFields.attraction_id = attraction_id;

    // 如果没有任何要更新的字段
    if (Object.keys(updateFields).length === 0) {
      return res.json({
        code: 1004,
        message: '没有提供需要更新的信息',
        data: null,
      });
    }

    await facility.update(updateFields);

    logger.info(`设施已更新: ID=${id}, 名称=${facility.name}`);

    return res.json({
      code: 0,
      message: null,
      data: { facility: facility.get({ plain: true }) },
    });
  } catch (error) {
    logger.error('更新设施失败:', error);
    return res.json({
      code: 500,
      message: '服务器内部错误',
      data: null,
    });
  }
};

/**
 * 删除设施
 * @param req.body.id 设施ID
 */
export const deleteFacility = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;

    // 验证ID参数
    if (!id) {
      return res.json({
        code: 1001,
        message: '缺少设施ID',
        data: null,
      });
    }

    // 查找设施
    const facility = await Facility.findByPk(id);
    if (!facility) {
      return res.json({
        code: 1002,
        message: '设施不存在',
        data: null,
      });
    }

    // 删除设施
    await facility.destroy();

    logger.info(`设施已删除: ID=${id}, 名称=${facility.name}`);

    return res.json({
      code: 0,
      message: null,
      data: { success: true },
    });
  } catch (error) {
    logger.error('删除设施失败:', error);
    return res.json({
      code: 500,
      message: '服务器内部错误',
      data: null,
    });
  }
};
