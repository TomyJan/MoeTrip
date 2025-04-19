import { Express } from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import User from '@/models/user.model';
import Attraction from '@/models/attraction.model';
import Ticket from '@/models/ticket.model';
import Feedback from '@/models/feedback.model';

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

    console.log(
      `辅助函数成功创建测试票种: ID=${ticket.id}, 名称=${ticket.name}`,
    );
    return ticket;
  } catch (error) {
    console.error('辅助函数创建测试票种失败:', error);
    throw error;
  }
}

// 创建测试反馈
export async function createTestFeedback(
  user_id: number,
  attraction_id: number,
  status: 'public' | 'deleted' = 'public',
  score?: number,
  comment?: string | null,
): Promise<Feedback> {
  try {
    // 先检查景点是否存在
    const attraction = await Attraction.findByPk(attraction_id);
    if (!attraction) {
      throw new Error(`创建测试反馈失败：景点ID ${attraction_id} 不存在`);
    }

    // 检查用户是否存在
    const user = await User.findByPk(user_id);
    if (!user) {
      throw new Error(`创建测试反馈失败：用户ID ${user_id} 不存在`);
    }

    // 如果未提供分数，使用随机分数
    const finalScore = score ?? Math.floor(Math.random() * 5) + 1; // 1-5之间的随机分数

    // 如果未提供评论，使用默认评论
    const finalComment =
      comment !== undefined ? comment : `测试反馈 ${Date.now()}`;

    // 检查是否已存在反馈
    let feedback = await Feedback.findOne({
      where: {
        user_id,
        attraction_id,
      },
    });

    // 如果已存在反馈，更新它
    if (feedback) {
      await feedback.update({
        score: finalScore,
        comment: finalComment,
        status,
      });
      console.log(
        `辅助函数更新了测试反馈: ID=${feedback.id}, 用户=${user_id}, 景点=${attraction_id}`,
      );
    } else {
      // 创建新反馈
      feedback = await Feedback.create({
        user_id,
        attraction_id,
        score: finalScore,
        comment: finalComment,
        status,
      });
      console.log(
        `辅助函数创建了测试反馈: ID=${feedback.id}, 用户=${user_id}, 景点=${attraction_id}`,
      );
    }

    return feedback;
  } catch (error) {
    console.error('辅助函数创建测试反馈失败:', error);
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
