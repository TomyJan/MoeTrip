import Log from '../models/log.model';
import logger from './logger';
import { Op } from 'sequelize';

/**
 * 日志服务，用于记录系统操作
 */
export class LogService {
  /**
   * 记录系统操作日志
   * @param userId 操作用户ID
   * @param action 操作类型（如create, update, delete, login, logout等）
   * @param target 操作对象（如user, ticket, order等）
   * @param targetId 操作对象ID
   * @param content 操作内容详情
   * @param ipAddress 操作者IP地址
   * @param userAgent 操作者浏览器信息
   * @returns 创建的日志记录
   */
  static async createLog(
    userId: number,
    action: string,
    target: string,
    targetId: number | null,
    content: string | object,
    ipAddress?: string,
    userAgent?: string,
  ) {
    try {
      // 如果content是对象，转为JSON字符串
      const contentStr = typeof content === 'object' ? JSON.stringify(content) : content;

      const log = await Log.create({
        user_id: userId,
        action,
        target,
        target_id: targetId,
        content: contentStr,
        ip_address: ipAddress,
        user_agent: userAgent,
      });

      return log;
    } catch (error) {
      logger.error('记录日志失败:', error);
      // 日志记录失败不应影响主要业务逻辑，所以这里只记录错误但不抛出
      return null;
    }
  }

  /**
   * 查询日志记录
   * @param page 页码
   * @param pageSize 每页数量
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @param userId 用户ID
   * @param action 操作类型
   * @param target 操作对象
   * @returns 查询结果
   */
  static async queryLogs(
    page: number = 1,
    pageSize: number = 10,
    startDate?: string,
    endDate?: string,
    userId?: number,
    action?: string,
    target?: string,
  ) {
    try {
      const where: any = {};

      // 添加日期范围条件
      if (startDate || endDate) {
        where.created_at = {};
        if (startDate) {
          where.created_at[Op.gte] = new Date(startDate);
        }
        if (endDate) {
          // 设置为endDate的23:59:59，确保包含整个结束日期
          const endDateTime = new Date(endDate);
          endDateTime.setHours(23, 59, 59, 999);
          where.created_at[Op.lte] = endDateTime;
        }
      }

      // 添加用户ID条件
      if (userId) {
        where.user_id = userId;
      }

      // 添加操作类型条件
      if (action) {
        where.action = action;
      }

      // 添加操作对象条件
      if (target) {
        where.target = target;
      }

      // 计算分页
      const offset = (page - 1) * pageSize;

      // 查询日志
      const { count, rows } = await Log.findAndCountAll({
        where,
        order: [['created_at', 'DESC']],
        limit: pageSize,
        offset,
        include: [{ association: 'user', attributes: ['id', 'username', 'role'] }],
      });

      return {
        total: count,
        logs: rows,
        page,
        pageSize,
      };
    } catch (error) {
      logger.error('查询日志失败:', error);
      throw error;
    }
  }
}

export default LogService;
