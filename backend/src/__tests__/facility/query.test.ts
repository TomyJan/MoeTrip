import request from 'supertest';
import app from '@/app';
import { createTestAttraction } from '../utils/test-utils';
import Facility from '@/models/facility.model';

describe('设施模块-查询设施', () => {
  describe('POST /api/v1/facility/query', () => {
    let attractionId: number;

    beforeEach(async () => {
      // 创建测试景点
      const attraction = await createTestAttraction();
      attractionId = attraction.id;

      // 创建测试设施（确保名称唯一）
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 10000);

      await Facility.bulkCreate([
        {
          name: `休息亭_${timestamp}_1_${random}`,
          location: '景点入口',
          status: '正常',
          attraction_id: attractionId,
        },
        {
          name: `停车场_${timestamp}_2_${random}`,
          location: '景点西侧',
          status: '正常',
          attraction_id: attractionId,
        },
        {
          name: `观景台_${timestamp}_3_${random}`,
          location: '景点东侧',
          status: '维护',
          attraction_id: attractionId,
        },
      ]);
    });

    it('应该成功查询设施列表', async () => {
      const response = await request(app)
        .post('/api/v1/facility/query')
        .send({});

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(0);
      expect(response.body.data.total).toBeGreaterThan(0);
      expect(response.body.data.facilities.length).toBeGreaterThan(0);
      expect(response.body.data.page).toBe(1);
      expect(response.body.data.pageSize).toBe(10);
    });

    it('应该根据景点ID过滤设施', async () => {
      const response = await request(app)
        .post('/api/v1/facility/query')
        .send({ attraction_id: attractionId });

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(0);
      expect(response.body.data.total).toBe(3);
      expect(response.body.data.facilities).toHaveLength(3);
    });

    it('应该根据关键词搜索设施', async () => {
      // 获取第一个设施的名称前缀（不包括时间戳）
      const facilities = await Facility.findAll({
        where: { attraction_id: attractionId },
        limit: 1,
      });

      // 使用设施名称的一部分作为搜索关键词
      const keyword = facilities[0].name.split('_')[0];

      const response = await request(app)
        .post('/api/v1/facility/query')
        .send({ keyword });

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(0);
      expect(response.body.data.total).toBeGreaterThan(0);
      expect(response.body.data.facilities.length).toBeGreaterThan(0);
    });

    it('应该正确处理分页', async () => {
      const response = await request(app)
        .post('/api/v1/facility/query')
        .send({ page: 1, pageSize: 2 });

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(0);
      expect(response.body.data.total).toBeGreaterThan(0);
      expect(response.body.data.facilities.length).toBeLessThanOrEqual(2);
      expect(response.body.data.page).toBe(1);
      expect(response.body.data.pageSize).toBe(2);
    });

    it('应该验证无效的分页参数', async () => {
      const response = await request(app)
        .post('/api/v1/facility/query')
        .send({ page: 0, pageSize: 0 });

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(1001);
      expect(response.body.message).toBe('无效的分页参数');
    });
  });
});
