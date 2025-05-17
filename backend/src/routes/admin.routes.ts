import { Router } from 'express';
import { getStats, queryUsers, addUser, updateUser, deleteUser } from '../controllers/admin.controller';
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

/**
 * @route POST /admin/users/query
 * @desc 查询用户列表
 * @access 仅管理员
 */
router.post('/users/query', authMiddleware, adminMiddleware, queryUsers);

/**
 * @route POST /admin/users/add
 * @desc 添加用户
 * @access 仅管理员
 */
router.post('/users/add', authMiddleware, adminMiddleware, addUser);

/**
 * @route POST /admin/users/update
 * @desc 更新用户
 * @access 仅管理员
 */
router.post('/users/update', authMiddleware, adminMiddleware, updateUser);

/**
 * @route POST /admin/users/delete
 * @desc 删除用户
 * @access 仅管理员
 */
router.post('/users/delete', authMiddleware, adminMiddleware, deleteUser);

export default router;
