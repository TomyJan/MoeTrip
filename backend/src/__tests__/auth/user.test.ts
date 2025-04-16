import request from "supertest";
import app from "@/app"; // 需要从主应用分离express实例
import User from "@/models/user.model";
import { createTestUser, generateTestData } from "../utils/test-utils";

describe("用户认证模块", () => {
  describe("POST /api/v1/user/register", () => {
    it("应该成功注册新用户", async () => {
      const testData = generateTestData();
      const response = await request(app).post("/api/v1/user/register").send({
        username: testData.username,
        password: testData.password,
      });

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(0);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.username).toBe(testData.username);
    });

    it("应该拒绝重复的用户名", async () => {
      const testUser = await createTestUser();
      const response = await request(app).post("/api/v1/user/register").send({
        username: testUser.username,
        password: "12dea96fec20593566ab75692c9949596833adc9", // 'user' 的SHA1值
      });

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(1003);
      expect(response.body.message).toBe("用户名已存在");
    });
  });

  describe("POST /api/v1/user/login", () => {
    it("应该成功登录已存在的用户", async () => {
      const testUser = await createTestUser();

      const response = await request(app).post("/api/v1/user/login").send({
        username: testUser.username,
        password: testUser.password_hash,
      });

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(0);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.username).toBe(testUser.username);
    });

    it("应该拒绝错误的密码", async () => {
      const testUser = await createTestUser();

      const response = await request(app).post("/api/v1/user/login").send({
        username: testUser.username,
        password: "0000000000000000000000000000000000000000", // 错误的SHA1值
      });

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(1004);
      expect(response.body.message).toBe("用户名或密码错误");
    });
  });
});
