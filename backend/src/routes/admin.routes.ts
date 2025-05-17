import { Router } from 'express';
import { getStats } from '../controllers/admin.controller';
import {
  authMiddleware,
  adminMiddleware,
} from '../middlewares/auth.middleware';

const router = Router();

/**
 * @route POST /admin/stats
 * @desc 获取系统统计数据
 * @access 仅管理员
 */
router.post('/stats', authMiddleware, adminMiddleware, getStats);

export default router;
