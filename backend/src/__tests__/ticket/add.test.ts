import request from 'supertest';
import app from '@/app';
import { generateTestToken } from '../utils/test-utils';
import Ticket from '@/models/ticket.model';
import User from '@/models/user.model';

describe('票种模块-添加票种', () => {
  describe('POST /api/v1/ticket/add', () => {
    it('应该成功添加新票种（管理员）', async () => {
      // 获取管理员用户(ID=1)
      const admin = await User.findByPk(1);
      if (!admin) {
        console.warn('找不到ID=1的管理员用户，跳过测试');
        return;
      }

      const adminToken = generateTestToken(admin);

      // 获取景点数据
      const attraction = await Ticket.findOne();
      if (!attraction) {
        console.warn('找不到任何票种，跳过测试');
        return;
      }

      const attractionId = attraction.attraction_id;

      // 确保票种名称唯一
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 10000);

      const newTicket = {
        attraction_id: attractionId,
        name: `测试票_${timestamp}_${random}`,
        available: 50,
      };

      const response = await request(app)
        .post('/api/v1/ticket/add')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newTicket);

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(0);
      expect(response.body.data.ticket).toBeDefined();
      expect(response.body.data.ticket.name).toBe(newTicket.name);
      expect(response.body.data.ticket.available).toBe(newTicket.available);

      // 删除创建的票种，避免影响其他测试
      if (response.body.data.ticket && response.body.data.ticket.id) {
        await Ticket.destroy({ where: { id: response.body.data.ticket.id } });
      }
    });

    it('应该拒绝非管理员添加票种', async () => {
      // 获取普通用户(ID=2)
      const user = await User.findByPk(2);
      if (!user) {
        console.warn('找不到ID=2的普通用户，跳过测试');
        return;
      }

      const userToken = generateTestToken(user);

      // 获取景点数据
      const attraction = await Ticket.findOne();
      if (!attraction) {
        console.warn('找不到任何票种，跳过测试');
        return;
      }

      const attractionId = attraction.attraction_id;

      // 确保票种名称唯一
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 10000);

      const response = await request(app)
        .post('/api/v1/ticket/add')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          attraction_id: attractionId,
          name: `测试票_${timestamp}_${random}`,
          available: 50,
        });

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(2001);
      expect(response.body.message).toBe('需要管理员权限');
    });

    it('应该验证必填字段', async () => {
      // 获取管理员用户(ID=1)
      const admin = await User.findByPk(1);
      if (!admin) {
        console.warn('找不到ID=1的管理员用户，跳过测试');
        return;
      }

      const adminToken = generateTestToken(admin);

      const response = await request(app)
        .post('/api/v1/ticket/add')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: '儿童票',
        });

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(1001);
      expect(response.body.message).toBe('缺少必需的字段');
    });

    it('应该验证每日可用数量', async () => {
      // 获取管理员用户(ID=1)
      const admin = await User.findByPk(1);
      if (!admin) {
        console.warn('找不到ID=1的管理员用户，跳过测试');
        return;
      }

      const adminToken = generateTestToken(admin);

      // 获取景点数据
      const attraction = await Ticket.findOne();
      if (!attraction) {
        console.warn('找不到任何票种，跳过测试');
        return;
      }

      const attractionId = attraction.attraction_id;

      // 确保票种名称唯一
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 10000);

      const response = await request(app)
        .post('/api/v1/ticket/add')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          attraction_id: attractionId,
          name: `测试票_${timestamp}_${random}`,
          available: -10, // 负数
        });

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(1001);
      expect(response.body.message).toBe('每日可用数量必须是非负数');
    });

    it('应该验证票种名称长度', async () => {
      // 获取管理员用户(ID=1)
      const admin = await User.findByPk(1);
      if (!admin) {
        console.warn('找不到ID=1的管理员用户，跳过测试');
        return;
      }

      const adminToken = generateTestToken(admin);

      // 获取景点数据
      const attraction = await Ticket.findOne();
      if (!attraction) {
        console.warn('找不到任何票种，跳过测试');
        return;
      }

      const attractionId = attraction.attraction_id;

      const response = await request(app)
        .post('/api/v1/ticket/add')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          attraction_id: attractionId,
          name: 'a'.repeat(101), // 超长名称
          available: 50,
        });

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(1001);
      expect(response.body.message).toBe('票种名称不能超过100个字符');
    });

    it('应该验证景点是否存在', async () => {
      // 获取管理员用户(ID=1)
      const admin = await User.findByPk(1);
      if (!admin) {
        console.warn('找不到ID=1的管理员用户，跳过测试');
        return;
      }

      const adminToken = generateTestToken(admin);

      // 确保票种名称唯一
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 10000);

      const response = await request(app)
        .post('/api/v1/ticket/add')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          attraction_id: 9999, // 不存在的景点ID
          name: `测试票_${timestamp}_${random}`,
          available: 50,
        });

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(1001);
      expect(response.body.message).toBe('所属景点不存在');
    });

    it('应该检查同名票种', async () => {
      // 获取管理员用户(ID=1)
      const admin = await User.findByPk(1);
      if (!admin) {
        console.warn('找不到ID=1的管理员用户，跳过测试');
        return;
      }

      const adminToken = generateTestToken(admin);

      // 获取一个已存在的票种
      const existingTicket = await Ticket.findOne();
      if (!existingTicket) {
        console.warn('找不到任何票种，跳过测试');
        return;
      }

      // 尝试创建同名票种
      const response = await request(app)
        .post('/api/v1/ticket/add')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          attraction_id: existingTicket.attraction_id,
          name: existingTicket.name,
          available: 100,
        });

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(1002);
      expect(response.body.message).toBe('该景点下已存在同名票种');
    });
  });
});
