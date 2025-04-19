import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Ticket from '../models/ticket.model';
import Attraction from '../models/attraction.model';
import Order from '../models/order.model';
import logger from '../utils/logger';

/**
 * 验证日期是否真实存在
 * @param dateStr 格式为YYYY-MM-DD的日期字符串
 * @returns 如果日期有效返回true，否则返回false
 */
function isValidDate(dateStr: string): boolean {
  // 首先检查基本格式
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return false;
  }
  const [year, month, day] = dateStr.split('-').map(Number);
  if (month < 1 || month > 12) return false;
  // 获取该月的最后一天
  // 通过将下个月的第0天（即上个月的最后一天）来获取
  const lastDayOfMonth = new Date(year, month, 0).getDate();
  // 检查日期是否在有效范围内
  if (day < 1 || day > lastDayOfMonth) return false;
  return true;
}

/**
 * 检查票种余量
 * @param req.body.ticket_id 票种ID
 * @param req.body.date 门票日期 (YYYY-MM-DD)
 */
export const checkTicket = async (req: Request, res: Response) => {
  try {
    const { ticket_id, date } = req.body;

    // 验证必填参数
    if (!ticket_id || !date) {
      return res.json({
        code: 1001,
        message: '缺少必需的字段',
        data: null,
      });
    }

    // 验证日期格式和是否真实存在
    if (!isValidDate(date)) {
      return res.json({
        code: 1001,
        message: '无效的日期，该日期不存在',
        data: null,
      });
    }

    // 检查是否为未来日期
    const dateObj = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dateObj.setHours(0, 0, 0, 0);

    if (dateObj < today) {
      return res.json({
        code: 1001,
        message: '预订日期必须是今天或未来日期',
        data: null,
      });
    }

    // 查询票种信息
    const ticket = await Ticket.findByPk(ticket_id, {
      include: [{ model: Attraction, as: 'attraction' }],
    });

    if (!ticket) {
      return res.json({
        code: 1001,
        message: '票种不存在',
        data: null,
      });
    }

    // 计算该日期已售票数
    const soldCount = await Order.sum('quantity', {
      where: {
        ticket_id,
        date,
      },
    });

    // 计算剩余可用数量
    const available = ticket.available - (soldCount || 0);

    return res.json({
      code: 0,
      message: null,
      data: {
        ticket: {
          id: ticket.id,
          attraction_id: ticket.attraction_id,
          name: ticket.name,
          available: available > 0 ? available : 0,
          date,
        },
      },
    });
  } catch (error) {
    logger.error('检查票种余量失败:', error);
    return res.json({
      code: 500,
      message: '服务器内部错误',
      data: null,
    });
  }
};

/**
 * 购买门票
 * @param req.body.ticket_id 票种ID
 * @param req.body.quantity 门票数量
 * @param req.body.date 门票日期 (YYYY-MM-DD)
 */
export const purchase = async (req: Request, res: Response) => {
  try {
    const { ticket_id, quantity, date } = req.body;
    const user_id = req.user?.id; // 从请求上下文获取用户ID

    // 验证必填参数
    if (!ticket_id || !quantity || !date || !user_id) {
      return res.json({
        code: 1001,
        message: '缺少必需的字段',
        data: null,
      });
    }

    // 验证数量
    if (isNaN(quantity) || quantity <= 0) {
      return res.json({
        code: 1001,
        message: '门票数量必须大于0',
        data: null,
      });
    }

    // 验证日期格式和是否真实存在
    if (!isValidDate(date)) {
      return res.json({
        code: 1001,
        message: '无效的日期，该日期不存在',
        data: null,
      });
    }

    // 检查是否为未来日期
    const dateObj = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dateObj.setHours(0, 0, 0, 0);

    if (dateObj < today) {
      return res.json({
        code: 1001,
        message: '预订日期必须是今天或未来日期',
        data: null,
      });
    }

    // 查询票种信息
    const ticket = await Ticket.findByPk(ticket_id);
    if (!ticket) {
      return res.json({
        code: 1001,
        message: '票种不存在',
        data: null,
      });
    }

    // 计算该日期已售票数
    const soldCount = await Order.sum('quantity', {
      where: {
        ticket_id,
        date,
      },
    });

    // 计算剩余可用数量
    const available = ticket.available - (soldCount || 0);

    // 检查余量是否充足
    if (available < quantity) {
      return res.json({
        code: 1005,
        message: '票种余量不足',
        data: null,
      });
    }

    // 创建订单
    const order = await Order.create({
      user_id,
      ticket_id,
      quantity,
      date,
    });

    logger.info(
      `用户 ${user_id} 预订票种 ${ticket_id} ${quantity} 张，日期: ${date}`,
    );

    return res.json({
      code: 0,
      message: null,
      data: {
        ticket: {
          id: order.id,
          order_id: order.id,
          ticket_id: order.ticket_id,
          quantity: order.quantity,
          date: order.date,
          user_id: order.user_id,
          created_at: order.created_at,
        },
      },
    });
  } catch (error) {
    logger.error('购票失败:', error);
    return res.json({
      code: 500,
      message: '服务器内部错误',
      data: null,
    });
  }
};

/**
 * 添加票种
 * @param req.body.attraction_id 所属景点ID
 * @param req.body.name 票种名称
 * @param req.body.available 每日可用数量
 */
export const addTicket = async (req: Request, res: Response) => {
  try {
    const { attraction_id, name, available } = req.body;

    // 验证必填字段
    if (!attraction_id || !name || available === undefined) {
      return res.json({
        code: 1001,
        message: '缺少必需的字段',
        data: null,
      });
    }

    // 验证每日可用数量
    if (isNaN(available) || available < 0) {
      return res.json({
        code: 1001,
        message: '每日可用数量必须是非负数',
        data: null,
      });
    }

    // 验证票种名称长度
    if (name.length > 100) {
      return res.json({
        code: 1001,
        message: '票种名称不能超过100个字符',
        data: null,
      });
    }

    // 检查景点是否存在
    const attraction = await Attraction.findByPk(attraction_id);
    if (!attraction) {
      return res.json({
        code: 1001,
        message: '所属景点不存在',
        data: null,
      });
    }

    // 检查是否已存在同名票种
    const existingTicket = await Ticket.findOne({
      where: {
        attraction_id,
        name,
      },
    });

    if (existingTicket) {
      return res.json({
        code: 1002,
        message: '该景点下已存在同名票种',
        data: null,
      });
    }

    // 创建新票种
    const ticket = await Ticket.create({
      attraction_id,
      name,
      available,
    });

    logger.info(`新票种已添加: ${name}, 景点ID: ${attraction_id}`);

    return res.json({
      code: 0,
      message: null,
      data: {
        ticket,
      },
    });
  } catch (error) {
    logger.error('添加票种失败:', error);
    return res.json({
      code: 500,
      message: '服务器内部错误',
      data: null,
    });
  }
};

/**
 * 查询用户的购票记录
 * @param req.body.user_id 用户ID（可选，管理员可查询特定用户，普通用户只能查自己）
 */
export const queryOrders = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.body;
    const currentUserId = req.user?.id;
    const isAdmin = req.user?.role === 'admin';

    // 确定要查询的用户ID
    let targetUserId = currentUserId;

    // 如果是管理员且指定了用户ID，则查询指定用户
    if (isAdmin && user_id) {
      targetUserId = user_id;
    }

    // 如果非管理员尝试查询其他用户的记录，返回错误
    if (!isAdmin && user_id && user_id !== currentUserId) {
      return res.json({
        code: 2001,
        message: '无权查询其他用户的记录',
        data: null,
      });
    }

    // 查询订单记录
    const orders = await Order.findAll({
      where: { user_id: targetUserId },
      order: [['created_at', 'DESC']],
    });

    // 格式化响应数据，只包含API文档中指定的字段
    const formattedOrders = orders.map((order) => ({
      id: order.id,
      order_id: order.id,
      ticket_id: order.ticket_id,
      quantity: order.quantity,
      date: order.date,
      user_id: order.user_id,
      created_at: order.created_at,
    }));

    return res.json({
      code: 0,
      message: null,
      data: {
        total: orders.length,
        orders: formattedOrders,
      },
    });
  } catch (error) {
    logger.error('查询购票记录失败:', error);
    return res.json({
      code: 500,
      message: '服务器内部错误',
      data: null,
    });
  }
};
