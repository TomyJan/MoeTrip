import request from 'supertest';
import app from '@/app';
import {
  createTestUser,
  generateTestToken,
  createTestAttraction,
} from '../utils/test-utils';
import Facility from '@/models/facility.model';

describe('设施模块-添加设施', () => {
  describe('POST /api/v1/facility/add', () => {
    let adminToken: string;
    let userToken: string;
    let attractionId: number;

    beforeEach(async () => {
      // 创建管理员和普通用户
      const admin = await createTestUser('admin');
      const user = await createTestUser('user');
      adminToken = generateTestToken(admin);
      userToken = generateTestToken(user);

      // 创建测试景点
      const attraction = await createTestAttraction();
      attractionId = attraction.id;
    });

    it('应该成功添加新设施（管理员）', async () => {
      // 确保设施名称唯一
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 10000);

      const newFacility = {
        name: `测试设施_${timestamp}_${random}`,
        location: '测试位置',
        status: '正常',
        attraction_id: attractionId,
      };

      const response = await request(app)
        .post('/api/v1/facility/add')
        .set('Authorization', `Bearer ${adminToken}`)
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

    it('应该拒绝非管理员添加设施', async () => {
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 10000);

      const response = await request(app)
        .post('/api/v1/facility/add')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: `测试设施_${timestamp}_${random}`,
          location: '测试位置',
          status: '正常',
          attraction_id: attractionId,
        });

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(2001);
      expect(response.body.message).toBe('需要管理员权限');
    });

    it('应该验证必填字段', async () => {
      const response = await request(app)
        .post('/api/v1/facility/add')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: '测试设施',
        });

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(1001);
      expect(response.body.message).toBe('缺少必需的字段');
    });

    it('应该验证字段长度限制', async () => {
      const response = await request(app)
        .post('/api/v1/facility/add')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'a'.repeat(101),
          location: '测试位置',
          status: '正常',
          attraction_id: attractionId,
        });

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(1001);
      expect(response.body.message).toBe('设施名称不能超过100个字符');
    });

    it('应该验证状态值', async () => {
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 10000);

      const response = await request(app)
        .post('/api/v1/facility/add')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: `测试设施_${timestamp}_${random}`,
          location: '测试位置',
          status: '无效状态',
          attraction_id: attractionId,
        });

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(1001);
      expect(response.body.message).toBe('设施状态必须为"正常"或"维护"');
    });
  });
});
