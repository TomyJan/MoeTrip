import { Router } from 'express';
import * as attractionController from '../controllers/attraction.controller';
import {
  authMiddleware,
  adminMiddleware,
} from '../middlewares/auth.middleware';

const router = Router();

// 查询景点列表
router.post('/query', attractionController.queryAttractions);

// 添加新景点（需要管理员权限）
router.post(
  '/add',
  authMiddleware,
  adminMiddleware,
  attractionController.addAttraction,
);

export default router;
