import request from 'supertest';
import app from '@/app';  // 需要从主应用分离express实例
import User from '@/models/user.model';
import { createTestUser, generateTestToken, generateTestData } from '../utils/test-utils';

describe('用户认证模块', () => {
  describe('POST /api/v1/user/register', () => {
    it('应该成功注册新用户', async () => {
      const testData = generateTestData();
      const response = await request(app)
        .post('/api/v1/user/register')
        .send({
          username: testData.username,
          password: testData.password, // 已经是SHA1后的值
        });

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(0);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.token).toBeDefined();
    });

    it('应该拒绝重复的用户名', async () => {
      const testUser = await createTestUser();
      const response = await request(app)
        .post('/api/v1/user/register')
        .send({
          username: testUser.username,
          password: 'da39a3ee5e6b4b0d3255bfef95601890afd80709', // 空字符串的SHA1值
        });

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(1003);
    });
  });

  describe('POST /api/v1/user/login', () => {
    it('应该成功登录已存在的用户', async () => {
      const testUser = await createTestUser();
      
      const response = await request(app)
        .post('/api/v1/user/login')
        .send({
          username: testUser.username,
          password: testUser.password_hash, // 使用已存储的SHA1值
        });

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(0);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.token).toBeDefined();
    });

    it('应该拒绝错误的密码', async () => {
      const testUser = await createTestUser();
      
      const response = await request(app)
        .post('/api/v1/user/login')
        .send({
          username: testUser.username,
          password: '0000000000000000000000000000000000000000', // 错误的SHA1值
        });

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(1004);
    });
  });
});
