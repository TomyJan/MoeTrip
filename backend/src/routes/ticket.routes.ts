import { Router } from 'express';
import * as ticketController from '../controllers/ticket.controller';
import {
  authMiddleware,
  adminMiddleware,
} from '../middlewares/auth.middleware';

const router = Router();

// 检查票种余量
router.post('/check', ticketController.checkTicket);

// 购买门票（需要用户登录）
router.post('/purchase', authMiddleware, ticketController.purchase);

// 查询用户购票记录（需要用户登录）
router.post('/query_order', authMiddleware, ticketController.queryOrders);

// 添加票种（需要管理员权限）
router.post(
  '/add',
  authMiddleware,
  adminMiddleware,
  ticketController.addTicket,
);

export default router;
