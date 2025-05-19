import { Router } from 'express';
import { 
  queryLogs,
  getLogStats
} from '../controllers/log.controller';
import {
  authMiddleware,
  adminMiddleware,
} from '../middlewares/auth.middleware';

const router = Router();

/**
 * @route POST /log/query
 * @desc 查询系统日志
 * @access 仅管理员
 */
router.post('/query', authMiddleware, adminMiddleware, queryLogs);

/**
 * @route POST /log/stats
 * @desc 获取日志统计信息
 * @access 仅管理员
 */
router.post('/stats', authMiddleware, adminMiddleware, getLogStats);

export default router;
