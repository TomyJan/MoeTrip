import { Request, Response } from 'express';
import { Op, Model, DataTypes } from 'sequelize';
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
 * 购买门票
 * @param req.body.ticket_id 票种ID
 * @param req.body.quantity 门票数量
 * @param req.body.date 门票日期 (YYYY-MM-DD)
 */
export const createOrder = async (req: Request, res: Response) => {
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
        status: 'success', // 只计算成功的订单
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

    // 计算订单总价
    const total_price = (parseFloat(ticket.price) * quantity).toFixed(2);

    // 创建订单
    const order = await Order.create({
      user_id,
      ticket_id,
      quantity,
      date,
      status: 'success', // 添加默认状态值
      total_price, // 字符串形式的总价
    });

    logger.info(
      `用户 ${user_id} 预订票种 ${ticket_id} ${quantity} 张，日期: ${date}，总价: ${total_price}`,
    );

    // 取出该票种和景点的信息
    const ticketInfo = await Ticket.findByPk(ticket_id);
    const attractionInfo = await Attraction.findByPk(ticketInfo?.attraction_id);

    return res.json({
      code: 0,
      message: null,
      data: {
        ticket: {
          id: order.id,
          order_id: order.id,
          ticket_id: order.ticket_id,
          ticket_name: ticketInfo?.name,
          quantity: order.quantity,
          attraction_id: attractionInfo?.id,
          attraction_name: attractionInfo?.name,
          date: order.date,
          total_price: order.total_price, // 使用计算后的总价
          user_id: order.user_id,
          status: order.status,
          created_at: order.created_at,
          updated_at: order.updated_at,
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
 * 查询用户的购票记录
 * @param req.body.user_id 用户ID（可选，管理员可查询特定用户，普通用户只能查自己）
 */
export const queryOrders = async (req: Request, res: Response) => {
  try {
    const { user_id, order_id } = req.body;
    const currentUserId = req.user?.id;
    const isAdmin = req.user?.role === 'admin';

    let orders = [];

    if (order_id) {
      // 查单个订单
      const order = await Order.findByPk(order_id);
      if (!order) {
        return res.json({
          code: 1006,
          message: '订单不存在',
          data: null,
        });
      }
      // 权限校验
      if (!isAdmin && order.user_id !== currentUserId) {
        return res.json({
          code: 2001,
          message: '无权查询此订单',
          data: null,
        });
      }
      orders = [order];
    } else {
      // user_id 查询
      const targetUserId = isAdmin && user_id ? user_id : currentUserId;
      if (!isAdmin && user_id && user_id !== Number(currentUserId)) {
        return res.json({
          code: 2001,
          message: '无权查询其他用户的记录',
          data: null,
        });
      }
      orders = await Order.findAll({
        where: { user_id: targetUserId },
        order: [['created_at', 'DESC']],
      });
    }

    // 格式化订单
    const formattedOrders = await Promise.all(
      orders.map(async (order) => {
        // 查询票种和景点信息
        const ticketInfo = await Ticket.findByPk(order.ticket_id);
        const attractionInfo = await Attraction.findByPk(
          ticketInfo?.attraction_id,
        );

        return {
          id: order.id,
          order_id: order.id,
          ticket_id: order.ticket_id,
          ticket_name: ticketInfo?.name,
          quantity: order.quantity,
          attraction_id: attractionInfo?.id,
          attraction_name: attractionInfo?.name,
          date: order.date,
          total_price: order.total_price, // 使用数据库中的总价
          user_id: order.user_id,
          status: order.status,
          created_at: order.created_at,
          updated_at: order.updated_at,
        };
      }),
    );

    return res.json({
      code: 0,
      message: null,
      data: {
        total: formattedOrders.length,
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

/**
 * 修改门票订单
 * @param req.body.order_id 要修改的订单ID
 * @param req.body.quantity 修改后的数量（可选）
 * @param req.body.date 修改后的日期（可选）
 * @param req.body.status 修改后的状态（可选）
 */
export const updateOrder = async (req: Request, res: Response) => {
  try {
    const { order_id, quantity, date, status } = req.body;
    const currentUserId = req.user?.id;
    const isAdmin = req.user?.role === 'admin';

    // 验证必填参数
    if (!order_id) {
      return res.json({
        code: 1001,
        message: '缺少订单ID',
        data: null,
      });
    }

    // 如果既没有提供新数量也没有提供新日期也没有提供新状态，则无需修改
    if (quantity === undefined && !date && !status) {
      return res.json({
        code: 1001,
        message: '至少需要提供新的数量或日期或状态',
        data: null,
      });
    }

    // 查询订单
    const order = await Order.findByPk(order_id);
    if (!order) {
      return res.json({
        code: 1006,
        message: '订单不存在',
        data: null,
      });
    }

    // 检查是否已取消
    if (order.status === 'cancelled') {
      return res.json({
        code: 1007,
        message: '订单已取消，无法修改',
        data: null,
      });
    }

    // 检查权限（只有管理员或订单所有者可以修改）
    if (!isAdmin && order.user_id !== currentUserId) {
      return res.json({
        code: 2001,
        message: '无权修改此订单',
        data: null,
      });
    }

    // 准备更新数据
    const updateData: { quantity?: number; date?: string; status?: string; total_price?: string } = {};

    // 如果提供了新数量，验证并添加到更新数据
    if (quantity !== undefined) {
      if (isNaN(quantity) || quantity <= 0) {
        return res.json({
          code: 1001,
          message: '门票数量必须大于0',
          data: null,
        });
      }
      updateData.quantity = quantity;
    }

    // 如果提供了新日期，验证并添加到更新数据
    if (date) {
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

      updateData.date = date;
    }

    // 如果提供了新状态，验证并添加到更新数据
    if (status) {
      if (status !== 'success' && status !== 'cancelled') {
        return res.json({
          code: 1001,
          message: '无效的状态',
          data: null,
        });
      }
      updateData.status = status;
    }

    // 获取票种信息
    const ticket = await Ticket.findByPk(order.ticket_id);
    if (!ticket) {
      return res.json({
        code: 1001,
        message: '票种不存在',
        data: null,
      });
    }

    // 检查新的数量是否可用（如果要修改数量或日期）
    const newQuantity = quantity || order.quantity;
    const newDate = date || order.date;

    // 查询该日期已售票数（不包括当前订单）
    const soldCount = await Order.sum('quantity', {
      where: {
        ticket_id: order.ticket_id,
        date: newDate,
        id: { [Op.ne]: order_id }, // 排除当前订单
        status: 'success', // 只计算成功的订单
      },
    });

    // 计算剩余可用数量
    const available = ticket.available - (soldCount || 0);

    // 检查余量是否充足
    if (available < newQuantity) {
      return res.json({
        code: 1005,
        message: '票种余量不足',
        data: null,
      });
    }

    // 如果更新数量或状态，重新计算总价
    if (quantity !== undefined || status) {
      // 计算新的总价
      const newStatus = status || order.status;
      // 如果订单被取消，总价为0
      if (newStatus === 'cancelled') {
        updateData.total_price = '0.00';
      } else if (quantity !== undefined) {
        // 获取票种价格
        const ticketPrice = parseFloat(ticket.price);
        // 计算新的总价
        updateData.total_price = (ticketPrice * quantity).toFixed(2);
      }
    }

    // 更新订单
    await order.update(updateData);

    // 重新获取更新后的订单
    const updatedOrder = await Order.findByPk(order_id);

    // 检查订单是否存在
    if (!updatedOrder) {
      return res.json({
        code: 1006,
        message: '更新后的订单不存在',
        data: null,
      });
    }

    // 获取票种和景点信息
    const ticketInfo = await Ticket.findByPk(updatedOrder.ticket_id);
    const attractionInfo = await Attraction.findByPk(ticketInfo?.attraction_id);

    logger.info(`订单已更新: ID=${order_id}, 用户ID=${order.user_id}`);

    return res.json({
      code: 0,
      message: null,
      data: {
        ticket: {
          id: updatedOrder.id,
          order_id: updatedOrder.id,
          ticket_id: updatedOrder.ticket_id,
          ticket_name: ticketInfo?.name,
          quantity: updatedOrder.quantity,
          attraction_id: attractionInfo?.id,
          attraction_name: attractionInfo?.name,
          date: updatedOrder.date,
          total_price: updatedOrder.total_price, // 使用数据库中的总价
          user_id: updatedOrder.user_id,
          status: updatedOrder.status,
          created_at: updatedOrder.created_at,
          updated_at: updatedOrder.updated_at,
        },
      },
    });
  } catch (error) {
    logger.error('更新订单失败:', error);
    return res.json({
      code: 500,
      message: '服务器内部错误',
      data: null,
    });
  }
};
