import { Request, Response } from 'express';
import LogService from '../utils/log-service';
import logger from '../utils/logger';

/**
 * 查询日志列表
 * @param req.body.page 页码（可选，默认1）
 * @param req.body.pageSize 每页数量（可选，默认10）
 * @param req.body.startDate 开始日期（可选，格式YYYY-MM-DD）
 * @param req.body.endDate 结束日期（可选，格式YYYY-MM-DD）
 * @param req.body.userId 用户ID（可选）
 * @param req.body.action 操作类型（可选）
 * @param req.body.target 操作对象（可选）
 */
export const queryLogs = async (req: Request, res: Response) => {
  try {
    // 检查用户权限（仅管理员可查看日志）
    if (req.user?.role !== 'admin') {
      return res.json({
        code: 2001,
        message: '无权限访问',
        data: null,
      });
    }

    const {
      page = 1,
      pageSize = 10,
      startDate,
      endDate,
      userId,
      action,
      target,
    } = req.body;

    // 验证分页参数
    const pageNum = parseInt(page.toString());
    const pageSizeNum = parseInt(pageSize.toString());

    if (isNaN(pageNum) || pageNum < 1) {
      return res.json({
        code: 1001,
        message: '无效的页码',
        data: null,
      });
    }

    if (isNaN(pageSizeNum) || pageSizeNum < 1 || pageSizeNum > 100) {
      return res.json({
        code: 1001,
        message: '无效的每页数量',
        data: null,
      });
    }

    // 验证日期格式
    if (startDate && !/^\d{4}-\d{2}-\d{2}$/.test(startDate.toString())) {
      return res.json({
        code: 1001,
        message: '开始日期格式无效，应为YYYY-MM-DD',
        data: null,
      });
    }

    if (endDate && !/^\d{4}-\d{2}-\d{2}$/.test(endDate.toString())) {
      return res.json({
        code: 1001,
        message: '结束日期格式无效，应为YYYY-MM-DD',
        data: null,
      });
    }

    // 查询日志
    const result = await LogService.queryLogs(
      pageNum,
      pageSizeNum,
      startDate?.toString(),
      endDate?.toString(),
      userId ? parseInt(userId.toString()) : undefined,
      action?.toString(),
      target?.toString(),
    );

    return res.json({
      code: 0,
      message: null,
      data: result,
    });
  } catch (error) {
    logger.error('查询日志失败:', error);
    return res.json({
      code: 500,
      message: '服务器内部错误',
      data: null,
    });
  }
};

/**
 * 为管理员的操作创建日志
 * 此方法仅在内部使用，不对外暴露API
 */
export const createAdminLog = async (
  req: Request,
  action: string,
  target: string,
  targetId: number | null,
  content: string | object,
) => {
  try {
    if (!req.user) return null;

    const userId = req.user.id;
    const ipAddress = req.ip || req.socket.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';

    return await LogService.createLog(
      userId,
      action,
      target,
      targetId,
      content,
      ipAddress,
      userAgent,
    );
  } catch (error) {
    logger.error('创建管理日志失败:', error);
    return null;
  }
};

/**
 * 获取日志统计信息
 */
export const getLogStats = async (req: Request, res: Response) => {
  try {
    // 检查用户权限（仅管理员可查看统计信息）
    if (req.user?.role !== 'admin') {
      return res.json({
        code: 2001,
        message: '无权限访问',
        data: null,
      });
    }

    // 这里可以添加更多统计逻辑，如各种操作类型的数量统计等
    // 目前仅返回简单的统计信息
    return res.json({
      code: 0,
      message: null,
      data: {
        stats: {
          // 暂时返回空对象，后续可扩展
        },
      },
    });
  } catch (error) {
    logger.error('获取日志统计信息失败:', error);
    return res.json({
      code: 500,
      message: '服务器内部错误',
      data: null,
    });
  }
};
