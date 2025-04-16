import { Router } from "express";
import * as facilityController from "../controllers/facility.controller";
import {
  authMiddleware,
  adminMiddleware,
} from "../middlewares/auth.middleware";

const router = Router();

// 查询设施列表
router.post("/query", facilityController.queryFacilities);

// 添加新设施（需要管理员权限）
router.post(
  "/add",
  authMiddleware,
  adminMiddleware,
  facilityController.addFacility,
);

export default router;
