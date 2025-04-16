import { Router } from "express";
import * as userController from "../controllers/user.controller";

const router = Router();

// 用户注册
router.post("/register", userController.register);

// 用户登录
router.post("/login", userController.login);

export default router;
