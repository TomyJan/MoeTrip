import request from 'supertest';
import app from '@/app'; // 需要从主应用分离express实例
import { createTestUser, generateTestData } from '../utils/test-utils';

describe('用户模块-注册', () => {
  describe('POST /api/v1/user/register', () => {
    it('应该成功注册新用户', async () => {
      const testData = generateTestData();
      const response = await request(app).post('/api/v1/user/register').send({
        username: testData.username,
        password: testData.password,
      });

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(0);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.username).toBe(testData.username);
    });

    it('应该拒绝重复的用户名', async () => {
      const testUser = await createTestUser();
      const response = await request(app).post('/api/v1/user/register').send({
        username: testUser.username,
        password: '12dea96fec20593566ab75692c9949596833adc9', // 'user' 的SHA1值
      });

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(1003);
      expect(response.body.message).toBe('用户名已存在');
    });
  });
});
