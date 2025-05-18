import { Router } from 'express';
import * as facilityController from '../controllers/facility.controller';
import {
  authMiddleware,
  adminMiddleware,
} from '../middlewares/auth.middleware';

const router = Router();

// 查询设施列表
router.post('/query', facilityController.queryFacilities);

// 添加新设施（需要管理员权限）
router.post(
  '/add',
  authMiddleware,
  adminMiddleware,
  facilityController.addFacility,
);

// 更新设施（需要管理员权限）
router.post(
  '/update',
  authMiddleware,
  adminMiddleware,
  facilityController.updateFacility,
);

// 删除设施（需要管理员权限）
router.post(
  '/delete',
  authMiddleware,
  adminMiddleware,
  facilityController.deleteFacility,
);

export default router;
