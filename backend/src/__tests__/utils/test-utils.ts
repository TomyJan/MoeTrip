import { Express } from "express";
import request from "supertest";
import jwt from "jsonwebtoken";
import User from "@/models/user.model";
import Attraction from "@/models/attraction.model";
import Ticket from "@/models/ticket.model";

// 创建测试用户
export async function createTestUser(
  role: "user" | "admin" = "user",
): Promise<User> {
  return await User.create({
    username: `test_${Date.now()}`,
    password_hash: "12dea96fec20593566ab75692c9949596833adc9", // 'user' 的SHA1值
    role,
  });
}

// 生成测试用 JWT
export function generateTestToken(user: User): string {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET!, {
    expiresIn: "1h",
  });
}

// 创建测试景点
export async function createTestAttraction(): Promise<Attraction> {
  return await Attraction.create({
    name: `测试景点_${Date.now()}`,
    description: "这是一个测试景点",
    open_time: "09:00-18:00",
    image_url: "/images/test.jpg",
  });
}

// 创建测试票种
export async function createTestTicket(attraction_id: number): Promise<Ticket> {
  return await Ticket.create({
    attraction_id,
    name: `测试票种_${Date.now()}`,
    available: 100,
  });
}

// 发送认证请求的辅助函数
export function authRequest(app: Express, token: string) {
  return {
    get: (url: string) =>
      request(app).get(url).set("Authorization", `Bearer ${token}`),
    post: (url: string, body?: any) =>
      request(app).post(url).set("Authorization", `Bearer ${token}`).send(body),
    put: (url: string, body?: any) =>
      request(app).put(url).set("Authorization", `Bearer ${token}`).send(body),
    delete: (url: string) =>
      request(app).delete(url).set("Authorization", `Bearer ${token}`),
  };
}

// 生成随机测试数据
export function generateTestData() {
  const timestamp = Date.now();
  return {
    username: `user_${timestamp}`,
    password: "12dea96fec20593566ab75692c9949596833adc9", // 'user' 的SHA1值
    attractionName: `景点_${timestamp}`,
    ticketName: `票种_${timestamp}`,
  };
}

// 等待指定时间
export const wait = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
