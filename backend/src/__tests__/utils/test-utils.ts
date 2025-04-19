import { Express } from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import User from '@/models/user.model';
import Attraction from '@/models/attraction.model';
import Ticket from '@/models/ticket.model';

// 创建测试用户
export async function createTestUser(
  role: 'user' | 'admin' = 'user',
): Promise<User> {
  // 先尝试查找已有的用户
  let user: User | null = null;
  
  if (role === 'admin') {
    user = await User.findOne({ where: { role: 'admin' } });
  } else {
    user = await User.findOne({ where: { role: 'user' } });
  }

  // 如果找到了用户，直接返回
  if (user) {
    return user;
  }

  // 否则创建新用户
  return await User.create({
    username: `test_${Date.now()}`,
    password_hash: '12dea96fec20593566ab75692c9949596833adc9', // 'user' 的SHA1值
    role,
  });
}

// 生成测试用 JWT
export function generateTestToken(user: User): string {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET!, {
    expiresIn: '1h',
  });
}

// 创建测试景点
export async function createTestAttraction(): Promise<Attraction> {
  // 确保名称唯一
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  
  return await Attraction.create({
    name: `测试景点_${timestamp}_${random}`,
    description: '这是一个测试景点',
    open_time: '09:00-18:00',
    image_url: '/images/test.jpg',
  });
}

// 创建测试票种
export async function createTestTicket(attraction_id: number): Promise<Ticket> {
  try {
    // 确保名称唯一
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    
    // 先检查景点是否存在
    const attraction = await Attraction.findByPk(attraction_id);
    if (!attraction) {
      throw new Error(`创建测试票种失败：景点ID ${attraction_id} 不存在`);
    }
    
    // 创建票种
    const ticket = await Ticket.create({
      attraction_id,
      name: `测试票种_${timestamp}_${random}`,
      available: 100,
    });
    
    console.log(`辅助函数成功创建测试票种: ID=${ticket.id}, 名称=${ticket.name}`);
    return ticket;
  } catch (error) {
    console.error('辅助函数创建测试票种失败:', error);
    throw error;
  }
}

// 发送认证请求的辅助函数
export function authRequest(app: Express, token: string) {
  return {
    get: (url: string) =>
      request(app).get(url).set('Authorization', `Bearer ${token}`),
    post: (url: string, body?: any) =>
      request(app).post(url).set('Authorization', `Bearer ${token}`).send(body),
    put: (url: string, body?: any) =>
      request(app).put(url).set('Authorization', `Bearer ${token}`).send(body),
    delete: (url: string) =>
      request(app).delete(url).set('Authorization', `Bearer ${token}`),
  };
}

// 生成随机测试数据
export function generateTestData() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 100000);
  return {
    username: `user_${timestamp}_${random}`,
    password: '12dea96fec20593566ab75692c9949596833adc9', // 'user' 的SHA1值
    attractionName: `景点_${timestamp}_${random}`,
    ticketName: `票种_${timestamp}_${random}`,
  };
}

// 等待指定时间
export const wait = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
