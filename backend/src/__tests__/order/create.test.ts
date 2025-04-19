import request from 'supertest';
import app from '@/app';
import { createTestUser, generateTestToken, createTestAttraction, createTestTicket } from '../utils/test-utils';
import Order from '@/models/order.model';
import Ticket from '@/models/ticket.model';

describe('订单模块-创建订单', () => {
  let regularUser: any;
  let regularUserToken: string;
  let testTicket: any;

  // 在所有测试之前准备测试数据
  beforeAll(async () => {
    try {
      console.log('开始准备测试数据 - 购买门票测试');
      
      // 使用createTestUser创建用户
      regularUser = await createTestUser('user');
      console.log(`已创建测试用户: 普通用户(${regularUser.id})`);

      // 生成令牌
      regularUserToken = generateTestToken(regularUser);

      // 获取已有的票种或创建新的
      testTicket = await Ticket.findOne();
      if (!testTicket) {
        // 如果没有找到任何票种，创建一个新的测试景点和票种
        const testAttraction = await createTestAttraction();
        testTicket = await createTestTicket(testAttraction.id);
      }
      
      console.log(`已找到/创建测试票种: ID=${testTicket.id}, 名称=${testTicket.name}`);
    } catch (error) {
      console.error('测试数据准备失败:', error);
      throw error;
    }
  });

  describe('POST /api/v1/order/create', () => {
    // 测试正常购票流程
    it('用户应该能成功购票', async () => {
      const response = await request(app)
        .post('/api/v1/order/create')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({
          ticket_id: testTicket.id,
          quantity: 1,
          date: '2025-12-25' // 未来日期
        });

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(0);
      // 检查API返回的数据结构
      expect(response.body.data.ticket).toBeDefined();
      expect(response.body.data.ticket.user_id).toBe(regularUser.id);
      expect(response.body.data.ticket.ticket_id).toBe(testTicket.id);
      expect(response.body.data.ticket.quantity).toBe(1);
      expect(response.body.data.ticket.status).toBe('success');

      // 清理测试订单
      if (response.body.data.ticket && response.body.data.ticket.id) {
        await Order.destroy({ where: { id: response.body.data.ticket.id } });
      }
    });

    // 测试未认证用户
    it('未认证用户不应该能购票', async () => {
      const response = await request(app)
        .post('/api/v1/order/create')
        .send({
          ticket_id: testTicket.id,
          quantity: 1,
          date: '2025-12-25'
        });

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(2001);
      expect(response.body.message).toBe('未提供认证令牌');
    });

    // 测试参数验证
    it('应该验证必填参数', async () => {
      const response = await request(app)
        .post('/api/v1/order/create')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({});

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(1001);
      expect(response.body.message).toContain('缺少');
    });

    // 测试日期验证
    it('应该验证日期格式和是否为未来日期', async () => {
      // 测试无效日期格式
      const invalidDateResponse = await request(app)
        .post('/api/v1/order/create')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({
          ticket_id: testTicket.id,
          quantity: 1,
          date: '非日期格式'
        });

      expect(invalidDateResponse.status).toBe(200);
      expect(invalidDateResponse.body.code).toBe(1001);
      expect(invalidDateResponse.body.message).toBe('无效的日期，该日期不存在');

      // 测试过去日期
      const pastDateResponse = await request(app)
        .post('/api/v1/order/create')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({
          ticket_id: testTicket.id,
          quantity: 1,
          date: '2020-01-01'
        });

      expect(pastDateResponse.status).toBe(200);
      expect(pastDateResponse.body.code).toBe(1001);
      expect(pastDateResponse.body.message).toBe('预订日期必须是今天或未来日期');
    });

    // 测试不存在的票种
    it('应该验证票种是否存在', async () => {
      const response = await request(app)
        .post('/api/v1/order/create')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({
          ticket_id: 99999, // 不存在的票种ID
          quantity: 1,
          date: '2025-12-25'
        });

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(1001); // 实际API返回的错误码
      expect(response.body.message).toBe('票种不存在');
    });

    // 测试先取消后再购买的场景
    it('用户应该能在取消订单后再次购买相同数量的门票', async () => {
      // 首先创建一个订单
      const order = await Order.create({
        user_id: regularUser.id,
        ticket_id: testTicket.id,
        quantity: 1,
        date: '2025-11-01',
        status: 'success'
      });

      // 取消该订单
      await Order.update(
        { status: 'cancelled' },
        { where: { id: order.id } }
      );

      // 再次购买相同数量的票
      const response = await request(app)
        .post('/api/v1/order/create')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({
          ticket_id: testTicket.id,
          quantity: 1,
          date: '2025-11-01'
        });

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(0);
      expect(response.body.data.ticket).toBeDefined();

      // 清理测试数据
      await Order.destroy({ where: { id: order.id } });
      if (response.body.data.ticket && response.body.data.ticket.id) {
        await Order.destroy({ where: { id: response.body.data.ticket.id } });
      }
    });
  });
});
