import request from 'supertest';
import app from '@/app';
import { createTestUser, generateTestToken } from '../utils/test-utils';
import Attraction from '@/models/attraction.model';

describe('景点模块', () => {
  describe('POST /api/v1/attraction/query', () => {
    beforeEach(async () => {
      // 创建测试数据
      await Attraction.bulkCreate([
        {
          name: '樱花谷',
          description: '春季赏樱胜地，风景优美',
          open_time: '08:00-18:00',
          image_url: '/images/sakura.jpg',
        },
        {
          name: '星空湖',
          description: '夜间观星，湖光山色',
          open_time: '10:00-22:00',
          image_url: '/images/starlake.jpg',
        },
      ]);
    });

    it('应该成功查询景点列表', async () => {
      const response = await request(app)
        .post('/api/v1/attraction/query')
        .send({});

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(0);
      expect(response.body.data.total).toBe(2);
      expect(response.body.data.attractions).toHaveLength(2);
      expect(response.body.data.page).toBe(1);
      expect(response.body.data.pageSize).toBe(10);
    });

    it('应该根据关键词搜索景点', async () => {
      const response = await request(app)
        .post('/api/v1/attraction/query')
        .send({ keyword: '樱花' });

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(0);
      expect(response.body.data.total).toBe(1);
      expect(response.body.data.attractions[0].name).toBe('樱花谷');
    });

    it('应该正确处理分页', async () => {
      const response = await request(app)
        .post('/api/v1/attraction/query')
        .send({ page: 1, pageSize: 1 });

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(0);
      expect(response.body.data.total).toBe(2);
      expect(response.body.data.attractions).toHaveLength(1);
      expect(response.body.data.page).toBe(1);
      expect(response.body.data.pageSize).toBe(1);
    });

    it('应该验证无效的分页参数', async () => {
      const response = await request(app)
        .post('/api/v1/attraction/query')
        .send({ page: 0, pageSize: 0 });

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(1001);
      expect(response.body.message).toBe('无效的分页参数');
    });
  });

  describe('POST /api/v1/attraction/add', () => {
    let adminToken: string;
    let userToken: string;

    beforeEach(async () => {
      // 创建管理员和普通用户
      const admin = await createTestUser('admin');
      const user = await createTestUser('user');
      adminToken = generateTestToken(admin);
      userToken = generateTestToken(user);
    });

    it('应该成功添加新景点（管理员）', async () => {
      const newAttraction = {
        name: '测试景点',
        description: '这是一个测试景点',
        open_time: '09:00-17:00',
        image_url: '/images/test.jpg',
      };

      const response = await request(app)
        .post('/api/v1/attraction/add')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newAttraction);

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(0);
      expect(response.body.data.name).toBe(newAttraction.name);

      // 验证数据库
      const attraction = await Attraction.findOne({
        where: { name: newAttraction.name },
      });
      expect(attraction).not.toBeNull();
      expect(attraction?.description).toBe(newAttraction.description);
    });

    it('应该拒绝非管理员添加景点', async () => {
      const response = await request(app)
        .post('/api/v1/attraction/add')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: '测试景点',
          description: '这是一个测试景点',
          open_time: '09:00-17:00',
          image_url: '/images/test.jpg',
        });

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(2001);
      expect(response.body.message).toBe('需要管理员权限');
    });

    it('应该验证必填字段', async () => {
      const response = await request(app)
        .post('/api/v1/attraction/add')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: '测试景点',
        });

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(1001);
      expect(response.body.message).toBe('缺少必需的字段');
    });

    it('应该验证字段长度限制', async () => {
      const response = await request(app)
        .post('/api/v1/attraction/add')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'a'.repeat(101),
          description: '测试描述',
          open_time: '09:00-17:00',
          image_url: '/images/test.jpg',
        });

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(1001);
      expect(response.body.message).toBe('景点名称不能超过100个字符');
    });

    it('应该检查重复名称', async () => {
      // 先创建一个景点
      await Attraction.create({
        name: '测试景点',
        description: '这是一个测试景点',
        open_time: '09:00-17:00',
        image_url: '/images/test.jpg',
      });

      // 尝试创建同名景点
      const response = await request(app)
        .post('/api/v1/attraction/add')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: '测试景点',
          description: '这是另一个测试景点',
          open_time: '10:00-18:00',
          image_url: '/images/test2.jpg',
        });

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(1002);
      expect(response.body.message).toBe('景点名称已存在');
    });
  });
});
