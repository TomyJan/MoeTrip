import { Router } from 'express';
import { login, register, logout } from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// 用户注册
router.post('/register', register);

// 用户登录
router.post('/login', login);

// 添加登出路由，需要认证
router.post('/logout', authMiddleware, logout);

export default router;
