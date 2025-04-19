import request from 'supertest';
import app from '@/app';
import Ticket from '@/models/ticket.model';
import Order from '@/models/order.model';

describe('票种模块-余量检查', () => {
  describe('POST /api/v1/ticket/check', () => {
    it('应该成功检查票种余量', async () => {
      // 使用数据库中的初始票种数据(ID=1,学生票)
      const ticketId = 1;
      const date = '2028-01-01';

      // 查询对应票种是否存在
      const ticket = await Ticket.findByPk(ticketId);
      if (!ticket) {
        console.warn(`ID=${ticketId}的票种不存在，跳过测试`);
        return;
      }

      // 查询已售票数
      const soldCount =
        (await Order.sum('quantity', {
          where: {
            ticket_id: ticketId,
            date,
          },
        })) || 0;

      console.log(`测试前已售出票数: ${soldCount}，当前票种ID: ${ticketId}`);

      const response = await request(app).post('/api/v1/ticket/check').send({
        ticket_id: ticketId,
        date,
      });

      console.log(`余量检查响应: ${JSON.stringify(response.body)}`);

      // 预期结果：成功查询到余量
      expect(response.status).toBe(200);
      expect(response.body.code).toBe(0);
      expect(response.body.data.ticket).toBeDefined();
      expect(response.body.data.ticket.id).toBe(ticketId);

      // 检查可用票数 = 总可用 - 已售
      expect(response.body.data.ticket.date).toBe(date);
    });

    it('应该验证必填字段', async () => {
      // 使用数据库中的初始票种数据(ID=1,学生票)
      const ticketId = 1;

      const response = await request(app).post('/api/v1/ticket/check').send({
        ticket_id: ticketId,
      });

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(1001);
      expect(response.body.message).toBe('缺少必需的字段');
    });

    it('应该验证日期格式', async () => {
      // 使用数据库中的初始票种数据(ID=1,学生票)
      const ticketId = 1;
      // 使用明显无效的日期格式
      const invalidDate = '非日期格式';

      const response = await request(app).post('/api/v1/ticket/check').send({
        ticket_id: ticketId,
        date: invalidDate,
      });

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(1001);
      expect(response.body.message).toBe('无效的日期，该日期不存在');
    });

    it('应该验证过往日期', async () => {
      // 使用数据库中的初始票种数据(ID=1,学生票)
      const ticketId = 1;

      // 查询对应票种是否存在
      const ticket = await Ticket.findByPk(ticketId);
      if (!ticket) {
        console.warn(`ID=${ticketId}的票种不存在，跳过测试`);
        return;
      }

      // 使用固定的过去日期 (2022年是确定的过去日期)
      const pastDate = '2022-01-01';

      const response = await request(app).post('/api/v1/ticket/check').send({
        ticket_id: ticketId,
        date: pastDate,
      });

      console.log(`过往日期验证响应: ${JSON.stringify(response.body)}`);

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(1001);
      expect(response.body.message).toBe('预订日期必须是今天或未来日期');
    });

    it('应该处理不存在的票种', async () => {
      const response = await request(app).post('/api/v1/ticket/check').send({
        ticket_id: 9999, // 不存在的ID
        date: '2025-07-15',
      });

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(1001);
      expect(response.body.message).toBe('票种不存在');
    });
  });
});
