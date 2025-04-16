import request from "supertest";
import app from "@/app";
import {
  createTestUser,
  generateTestToken,
  createTestAttraction,
} from "../utils/test-utils";
import Facility from "@/models/facility.model";

describe("设施模块", () => {
  describe("POST /api/v1/facility/query", () => {
    let attractionId: number;

    beforeEach(async () => {
      // 创建测试景点
      const attraction = await createTestAttraction();
      attractionId = attraction.id;

      // 创建测试设施
      await Facility.bulkCreate([
        {
          name: "休息亭",
          location: "景点入口",
          status: "正常",
          attraction_id: attractionId,
        },
        {
          name: "停车场",
          location: "景点西侧",
          status: "正常",
          attraction_id: attractionId,
        },
        {
          name: "观景台",
          location: "景点东侧",
          status: "维护",
          attraction_id: attractionId,
        },
      ]);
    });

    it("应该成功查询设施列表", async () => {
      const response = await request(app)
        .post("/api/v1/facility/query")
        .send({});

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(0);
      expect(response.body.data.total).toBe(3);
      expect(response.body.data.facilities).toHaveLength(3);
      expect(response.body.data.page).toBe(1);
      expect(response.body.data.pageSize).toBe(10);
    });

    it("应该根据景点ID过滤设施", async () => {
      const response = await request(app)
        .post("/api/v1/facility/query")
        .send({ attraction_id: attractionId });

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(0);
      expect(response.body.data.total).toBe(3);
      expect(response.body.data.facilities).toHaveLength(3);
    });

    it("应该根据关键词搜索设施", async () => {
      const response = await request(app)
        .post("/api/v1/facility/query")
        .send({ keyword: "停车场" });

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(0);
      expect(response.body.data.total).toBe(1);
      expect(response.body.data.facilities[0].name).toBe("停车场");
    });

    it("应该正确处理分页", async () => {
      const response = await request(app)
        .post("/api/v1/facility/query")
        .send({ page: 1, pageSize: 2 });

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(0);
      expect(response.body.data.total).toBe(3);
      expect(response.body.data.facilities).toHaveLength(2);
      expect(response.body.data.page).toBe(1);
      expect(response.body.data.pageSize).toBe(2);
    });

    it("应该验证无效的分页参数", async () => {
      const response = await request(app)
        .post("/api/v1/facility/query")
        .send({ page: 0, pageSize: 0 });

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(1001);
      expect(response.body.message).toBe("无效的分页参数");
    });
  });

  describe("POST /api/v1/facility/add", () => {
    let adminToken: string;
    let userToken: string;
    let attractionId: number;

    beforeEach(async () => {
      // 创建管理员和普通用户
      const admin = await createTestUser("admin");
      const user = await createTestUser("user");
      adminToken = generateTestToken(admin);
      userToken = generateTestToken(user);

      // 创建测试景点
      const attraction = await createTestAttraction();
      attractionId = attraction.id;
    });

    it("应该成功添加新设施（管理员）", async () => {
      const newFacility = {
        name: "测试设施",
        location: "测试位置",
        status: "正常",
        attraction_id: attractionId,
      };

      const response = await request(app)
        .post("/api/v1/facility/add")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(newFacility);

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(0);
      expect(response.body.data.facility.name).toBe(newFacility.name);

      // 验证数据库
      const facility = await Facility.findOne({
        where: { name: newFacility.name },
      });
      expect(facility).not.toBeNull();
      expect(facility?.location).toBe(newFacility.location);
    });

    it("应该拒绝非管理员添加设施", async () => {
      const response = await request(app)
        .post("/api/v1/facility/add")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          name: "测试设施",
          location: "测试位置",
          status: "正常",
          attraction_id: attractionId,
        });

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(2001);
      expect(response.body.message).toBe("需要管理员权限");
    });

    it("应该验证必填字段", async () => {
      const response = await request(app)
        .post("/api/v1/facility/add")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "测试设施",
        });

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(1001);
      expect(response.body.message).toBe("缺少必需的字段");
    });

    it("应该验证字段长度限制", async () => {
      const response = await request(app)
        .post("/api/v1/facility/add")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "a".repeat(101),
          location: "测试位置",
          status: "正常",
          attraction_id: attractionId,
        });

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(1001);
      expect(response.body.message).toBe("设施名称不能超过100个字符");
    });

    it("应该验证状态值", async () => {
      const response = await request(app)
        .post("/api/v1/facility/add")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "测试设施",
          location: "测试位置",
          status: "无效状态",
          attraction_id: attractionId,
        });

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(1001);
      expect(response.body.message).toBe('设施状态必须为"正常"或"维护"');
    });
  });
});
