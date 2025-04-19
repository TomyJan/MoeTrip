import { Router } from 'express';
import * as orderController from '../controllers/order.controller';
import {
  authMiddleware,
  adminMiddleware,
} from '../middlewares/auth.middleware';

const router = Router();

// 购买门票（需要用户登录）
router.post('/create', authMiddleware, orderController.createOrder);

// 查询用户购票记录（需要用户登录）
router.post('/query', authMiddleware, orderController.queryOrders);

// 修改订单（需要用户登录）
router.post('/update', authMiddleware, orderController.updateOrder);

export default router;
