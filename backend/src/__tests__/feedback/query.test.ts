import request from 'supertest';
import app from '@/app';
import {
  createTestUser,
  generateTestToken,
  createTestAttraction,
  createTestFeedback,
} from '../utils/test-utils';
import Feedback from '@/models/feedback.model';
import Attraction from '@/models/attraction.model';

describe('反馈模块-查询反馈', () => {
  let regularUser: any;
  let adminUser: any;
  let regularUserToken: string;
  let adminToken: string;
  let testAttractions: Attraction[] = [];

  // 在所有测试之前准备测试数据
  beforeAll(async () => {
    try {
      console.log('开始准备测试数据 - 反馈查询测试');

      // 创建测试用户
      regularUser = await createTestUser('user');
      adminUser = await createTestUser('admin');

      console.log(
        `已创建测试用户: 普通用户(${regularUser.id}), 管理员(${adminUser.id})`,
      );

      // 生成令牌
      regularUserToken = generateTestToken(regularUser);
      adminToken = generateTestToken(adminUser);

      // 确保有测试景点
      console.log('准备测试景点数据');

      // 创建新的测试景点 (只创建2个就足够了，避免景点ID不存在的问题)
      for (let i = 0; i < 2; i++) {
        const attraction = await createTestAttraction();
        testAttractions.push(attraction);
        console.log(
          `创建了测试景点: ID=${attraction.id}, 名称=${attraction.name}`,
        );
      }

      console.log(
        `测试景点已准备完成: ${testAttractions.map((a) => a.id).join(', ')}`,
      );
    } catch (error) {
      console.error('测试数据准备失败:', error);
      throw error;
    }
  });

  describe('POST /api/v1/feedback/query', () => {
    // 准备测试数据
    beforeEach(async () => {
      // 删除之前的数据
      await Feedback.destroy({ where: {} });

      // 为用户创建2个反馈
      await createTestFeedback(regularUser.id, testAttractions[0].id);
      await createTestFeedback(regularUser.id, testAttractions[1].id);
      // 为管理员创建1个反馈
      await createTestFeedback(adminUser.id, testAttractions[0].id);
    });

    it('普通用户应该只能查询自己的反馈', async () => {
      const response = await request(app)
        .post('/api/v1/feedback/query')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({});

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(0);
      expect(response.body.data.feedback).toBeDefined();
      expect(Array.isArray(response.body.data.feedback)).toBe(true);

      // 检查返回的反馈是否都属于当前用户并且状态为public
      const allBelongToUser = response.body.data.feedback.every(
        (item: any) =>
          item.user_id === regularUser.id && item.status === 'public',
      );
      expect(allBelongToUser).toBe(true);
    });

    it('普通用户应该能查询特定景点的所有反馈', async () => {
      const response = await request(app)
        .post('/api/v1/feedback/query')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({ attraction_id: testAttractions[0].id });

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(0);
      expect(response.body.data.feedback).toBeDefined();
      expect(Array.isArray(response.body.data.feedback)).toBe(true);

      // 数据应该包含至少两条对景点的公开反馈（用户和管理员各一条）
      expect(response.body.data.feedback.length).toBeGreaterThanOrEqual(2);
      expect(
        response.body.data.feedback.every(
          (item: any) =>
            item.attraction_id === testAttractions[0].id &&
            item.status === 'public',
        ),
      ).toBe(true);
    });

    it('用户应该能获取自己对特定景点的反馈', async () => {
      const response = await request(app)
        .post('/api/v1/feedback/query')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({ attraction_id: testAttractions[0].id });

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(0);
      expect(response.body.data.feedback).toBeDefined();
      expect(Array.isArray(response.body.data.feedback)).toBe(true);

      // 应该能找到用户对景点的反馈
      const userFeedback = response.body.data.feedback.find(
        (item: any) =>
          item.user_id === regularUser.id &&
          item.attraction_id === testAttractions[0].id,
      );
      expect(userFeedback).toBeDefined();
      expect(userFeedback.status).toBe('public');
    });

    it('用户应该能直接查询自己对特定景点的单个反馈', async () => {
      // 先清除测试数据，确保只有一个反馈
      await Feedback.destroy({ where: {} });
      const testFeedback = await createTestFeedback(
        regularUser.id,
        testAttractions[0].id,
      );

      const response = await request(app)
        .post('/api/v1/feedback/query')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({
          attraction_id: testAttractions[0].id,
          user_id: regularUser.id,
        });

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(0);
      expect(response.body.data.feedback).toBeDefined();
      expect(Array.isArray(response.body.data.feedback)).toBe(true);
      expect(response.body.data.feedback.length).toBe(1);
      expect(response.body.data.feedback[0].user_id).toBe(regularUser.id);
      expect(response.body.data.feedback[0].attraction_id).toBe(
        testAttractions[0].id,
      );
      expect(response.body.data.feedback[0].status).toBe('public');
    });

    it('用户应该能正确处理没有反馈的情况', async () => {
      // 先清除所有反馈
      await Feedback.destroy({ where: {} });

      // 查询用户尚未评价的景点
      const response = await request(app)
        .post('/api/v1/feedback/query')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({
          attraction_id: testAttractions[1].id,
          user_id: regularUser.id,
        });

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(0);
      // 应该返回一个空数组，表示没有反馈
      expect(Array.isArray(response.body.data.feedback)).toBe(true);
      expect(response.body.data.feedback.length).toBe(0);
    });

    it('管理员应该能查询所有反馈', async () => {
      const response = await request(app)
        .post('/api/v1/feedback/query')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(0);
      expect(response.body.data.feedback).toBeDefined();
      expect(Array.isArray(response.body.data.feedback)).toBe(true);

      // 数据库中应该至少有3条反馈
      expect(response.body.data.feedback.length).toBeGreaterThanOrEqual(3);
    });

    it('管理员应该能查询包括已删除的反馈', async () => {
      // 先标记一条反馈为删除
      const testFeedback = await createTestFeedback(
        regularUser.id,
        testAttractions[0].id,
      );
      await testFeedback.update({ status: 'deleted' });

      // 查询不包含已删除的反馈
      const responseWithoutDeleted = await request(app)
        .post('/api/v1/feedback/query')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      // 查询包含已删除的反馈
      const responseWithDeleted = await request(app)
        .post('/api/v1/feedback/query')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ include_deleted: true });

      // 包含已删除反馈的结果应该比不包含的多
      expect(responseWithDeleted.body.data.feedback.length).toBeGreaterThan(
        responseWithoutDeleted.body.data.feedback.length,
      );
    });

    it('管理员应该能按条件筛选反馈', async () => {
      // 先清除测试数据
      await Feedback.destroy({ where: {} });

      // 创建高分反馈
      await Feedback.create({
        user_id: adminUser.id,
        attraction_id: testAttractions[0].id,
        score: 5,
        comment: '非常好的景点',
        status: 'public',
      });

      // 创建低分无评论反馈
      await Feedback.create({
        user_id: regularUser.id,
        attraction_id: testAttractions[0].id,
        score: 2,
        comment: null,
        status: 'public',
      });

      const response = await request(app)
        .post('/api/v1/feedback/query')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          min_score: 4,
          has_comment: true,
        });

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(0);

      // 应该只返回高分有评论的反馈
      expect(response.body.data.feedback.length).toBe(1);
      expect(response.body.data.feedback[0].score).toBeGreaterThanOrEqual(4);
      expect(response.body.data.feedback[0].comment).not.toBeNull();
    });
  });
});
