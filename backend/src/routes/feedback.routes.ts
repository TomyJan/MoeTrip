import { Router } from 'express';
import * as feedbackController from '../controllers/feedback.controller';
import {
  authMiddleware,
  adminMiddleware,
} from '../middlewares/auth.middleware';

const router = Router();

// 添加反馈 (需要用户登录)
router.post('/add', authMiddleware, feedbackController.addFeedback);

// 查询反馈列表 (普通用户只能查询自己的反馈)
router.post('/query', feedbackController.queryFeedback);

// 更新反馈 (需要用户登录，只能更新自己的反馈，管理员可更新任何反馈)
router.post('/update', authMiddleware, feedbackController.updateFeedback);

// 获取反馈统计 (管理员可见)
router.post(
  '/stats',
  authMiddleware,
  adminMiddleware,
  feedbackController.getFeedbackStats,
);

export default router;
