import request from 'supertest';
import app from '@/app';
import { createTestUser, generateTestToken } from '../utils/test-utils';
import Attraction from '@/models/attraction.model';
import sequelize from '@/utils/database';

describe('景点模块', () => {
  describe('POST /api/v1/attraction/query', () => {
    // 在测试前获取初始化脚本创建的景点数量
    let initialAttractionCount = 0;
    
    beforeEach(async () => {
      const [result] = await sequelize.query('SELECT COUNT(*) as count FROM attractions');
      initialAttractionCount = parseInt((result as any)[0].count);
    });
    
    it('应该成功查询景点列表', async () => {
      const response = await request(app)
        .post('/api/v1/attraction/query')
        .send({});

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(0);
      expect(response.body.data.total).toBe(initialAttractionCount);
      expect(response.body.data.attractions).toHaveLength(initialAttractionCount);
      expect(response.body.data.page).toBe(1);
      expect(response.body.data.pageSize).toBe(10);
    });

    it('应该根据关键词搜索景点', async () => {
      // 使用初始化脚本中的景点名称
      const response = await request(app)
        .post('/api/v1/attraction/query')
        .send({ keyword: '樱花' });

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(0);
      expect(response.body.data.total).toBeGreaterThan(0);
      // 检查至少一个结果包含关键词
      expect(response.body.data.attractions.some((a: { name: string }) => a.name.includes('樱花'))).toBe(true);
    });

    it('应该正确处理分页', async () => {
      const response = await request(app)
        .post('/api/v1/attraction/query')
        .send({ page: 1, pageSize: 1 });

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(0);
      expect(response.body.data.total).toBe(initialAttractionCount);
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
      // 确保景点名称唯一
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 10000);
      
      const newAttraction = {
        name: `测试景点_${timestamp}_${random}`,
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
      // 确保景点名称唯一
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 10000);
      
      const response = await request(app)
        .post('/api/v1/attraction/add')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: `测试景点_${timestamp}_${random}`,
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
      // 创建一个景点
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 10000);
      const attractionName = `测试景点_${timestamp}_${random}`;
      
      await Attraction.create({
        name: attractionName,
        description: '这是一个测试景点',
        open_time: '09:00-17:00',
        image_url: '/images/test.jpg',
      });

      // 尝试创建同名景点
      const response = await request(app)
        .post('/api/v1/attraction/add')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: attractionName,
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
