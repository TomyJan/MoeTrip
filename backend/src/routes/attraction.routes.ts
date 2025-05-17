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

// 获取景点统计数据
router.post('/stats', attractionController.getStats);

// 更新景点（需要管理员权限）
router.post(
  '/update',
  authMiddleware,
  adminMiddleware,
  attractionController.updateAttraction,
);

// 删除景点（需要管理员权限）
router.post(
  '/delete',
  authMiddleware,
  adminMiddleware,
  attractionController.deleteAttraction,
);

export default router;
