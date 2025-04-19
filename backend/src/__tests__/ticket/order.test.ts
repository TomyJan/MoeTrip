import request from 'supertest';
import app from '@/app';
import { generateTestToken } from '../utils/test-utils';
import User from '@/models/user.model';

// 使用最简单的测试方法，依赖setup.ts中创建的初始数据
describe('已购票查询模块', () => {
  describe('POST /api/v1/ticket/query_order', () => {
    // 普通用户测试
    it('普通用户应该能查询自己的订单', async () => {
      // 获取数据库中的用户ID=2(普通用户)
      const user = await User.findByPk(2);
      if (!user) {
        console.warn('找不到ID=2的普通用户，跳过测试');
        return;
      }
      
      const token = generateTestToken(user);
      
      const response = await request(app)
        .post('/api/v1/ticket/query_order')
        .set('Authorization', `Bearer ${token}`)
        .send({});
      
      expect(response.status).toBe(200);
      expect(response.body.code).toBe(0);
      
      // 验证返回的订单属于当前用户
      const orders = response.body.data.orders || [];
      const allBelongToUser = orders.every((order: any) => order.user_id === 2);
      
      expect(allBelongToUser).toBe(true);
    });
    
    // 管理员用户测试
    it('管理员应该能查询任何用户的订单', async () => {
      // 获取数据库中的用户ID=1(管理员)和ID=2(普通用户)
      const admin = await User.findByPk(1);
      if (!admin) {
        console.warn('找不到ID=1的管理员用户，跳过测试');
        return;
      }
      
      const token = generateTestToken(admin);
      
      const response = await request(app)
        .post('/api/v1/ticket/query_order')
        .set('Authorization', `Bearer ${token}`)
        .send({ user_id: 2 }); // 查询ID=2用户的订单
      
      expect(response.status).toBe(200);
      expect(response.body.code).toBe(0);
      
      // 验证返回的所有订单都属于用户ID=2
      const orders = response.body.data.orders || [];
      const allBelongToTargetUser = orders.every((order: any) => order.user_id === 2);
      
      expect(allBelongToTargetUser).toBe(true);
    });
    
    // 权限测试 - 普通用户不能查询他人订单
    it('普通用户不应该能查询其他用户的订单', async () => {
      // 获取数据库中的用户ID=2(普通用户)
      const user = await User.findByPk(2);
      if (!user) {
        console.warn('找不到ID=2的普通用户，跳过测试');
        return;
      }
      
      const token = generateTestToken(user);
      
      const response = await request(app)
        .post('/api/v1/ticket/query_order')
        .set('Authorization', `Bearer ${token}`)
        .send({ user_id: 1 }); // 尝试查询ID=1管理员的订单
      
      expect(response.status).toBe(200);
      expect(response.body.code).toBe(2001);
      expect(response.body.message).toBe('无权查询其他用户的记录');
    });
    
    // 未登录用户测试
    it('未登录用户不应该能查询订单', async () => {
      const response = await request(app)
        .post('/api/v1/ticket/query_order')
        .send({});
      
      expect(response.status).toBe(200);
      expect(response.body.code).toBe(2001);
      expect(response.body.message).toContain('未提供认证令牌');
    });
  });
});
