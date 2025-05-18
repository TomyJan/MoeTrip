import { Router } from 'express';
import * as ticketController from '../controllers/ticket.controller';
import {
  authMiddleware,
  adminMiddleware,
} from '../middlewares/auth.middleware';

const router = Router();

// 查询票种列表
router.post('/query', ticketController.queryTickets);

// 检查票种余量
router.post('/check', ticketController.checkTicket);

// 添加票种（需要管理员权限）
router.post(
  '/add',
  authMiddleware,
  adminMiddleware,
  ticketController.addTicket,
);

// 更新票种（需要管理员权限）
router.post(
  '/update',
  authMiddleware,
  adminMiddleware,
  ticketController.updateTicket,
);

// 删除票种（需要管理员权限）
router.post(
  '/delete',
  authMiddleware,
  adminMiddleware,
  ticketController.deleteTicket,
);

export default router;
