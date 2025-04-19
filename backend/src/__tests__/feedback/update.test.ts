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
import { Op } from 'sequelize';

describe('反馈模块-更新反馈', () => {
  let regularUser: any;
  let adminUser: any;
  let regularUserToken: string;
  let adminToken: string;
  let testAttractions: Attraction[] = [];

  // 在所有测试之前准备测试数据
  beforeAll(async () => {
    try {
      console.log('开始准备测试数据 - 反馈更新测试');

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

  // 每个测试之前清理上一个测试的数据
  beforeEach(async () => {
    try {
      // 删除用户的所有反馈
      await Feedback.destroy({
        where: {
          user_id: {
            [Op.in]: [regularUser.id, adminUser.id],
          },
        },
      });
    } catch (error) {
      console.error('清理测试数据失败:', error);
    }
  });

  describe('POST /api/v1/feedback/update', () => {
    it('用户应该能更新自己的反馈 (通过ID)', async () => {
      // 创建测试反馈
      const feedback = await createTestFeedback(
        regularUser.id,
        testAttractions[0].id,
      );

      // 更新反馈
      const updateData = {
        id: feedback.id,
        score: 3,
        comment: '更新后的评价',
      };

      const updateResponse = await request(app)
        .post('/api/v1/feedback/update')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send(updateData);

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.code).toBe(0);
      expect(updateResponse.body.data.feedback).toBeDefined();
      expect(updateResponse.body.data.feedback.score).toBe(updateData.score);
      expect(updateResponse.body.data.feedback.comment).toBe(
        updateData.comment,
      );
      expect(updateResponse.body.data.feedback.status).toBe('public');
    });

    it('用户应该能更新自己的反馈 (通过景点ID)', async () => {
      // 创建测试反馈
      await createTestFeedback(regularUser.id, testAttractions[1].id);

      // 更新反馈
      const updateData = {
        attraction_id: testAttractions[1].id,
        score: 4,
        comment: '使用景点ID更新的评价',
      };

      const updateResponse = await request(app)
        .post('/api/v1/feedback/update')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send(updateData);

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.code).toBe(0);
      expect(updateResponse.body.data.feedback).toBeDefined();
      expect(updateResponse.body.data.feedback.score).toBe(updateData.score);
      expect(updateResponse.body.data.feedback.comment).toBe(
        updateData.comment,
      );
      expect(updateResponse.body.data.feedback.status).toBe('public');
    });

    it('用户应该能标记自己的反馈为删除状态', async () => {
      // 创建测试反馈
      const feedback = await createTestFeedback(
        regularUser.id,
        testAttractions[0].id,
      );

      const deleteResponse = await request(app)
        .post('/api/v1/feedback/update')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({
          id: feedback.id,
          status: 'deleted',
        });

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.code).toBe(0);
      expect(deleteResponse.body.message).toContain('反馈已标记为删除');
      expect(deleteResponse.body.data.feedback.status).toBe('deleted');

      // 验证反馈被标记为删除但仍存在于数据库中
      const deletedFeedback = await Feedback.findByPk(feedback.id);
      expect(deletedFeedback).not.toBeNull();
      expect(deletedFeedback?.status).toBe('deleted');

      // 验证查询时不会返回已删除的反馈
      const queryResponse = await request(app)
        .post('/api/v1/feedback/query')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({ attraction_id: testAttractions[0].id });

      const feedbackFound = queryResponse.body.data.feedback.some(
        (f: any) => f.id === feedback.id,
      );
      expect(feedbackFound).toBe(false);
    });

    it('管理员应该能标记任何人的反馈为删除状态', async () => {
      // 创建测试反馈
      const feedback = await createTestFeedback(
        regularUser.id,
        testAttractions[0].id,
      );

      const deleteResponse = await request(app)
        .post('/api/v1/feedback/update')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          id: feedback.id,
          status: 'deleted',
        });

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.code).toBe(0);
      expect(deleteResponse.body.message).toContain('反馈已标记为删除');
      expect(deleteResponse.body.data.feedback.status).toBe('deleted');
    });

    it('用户不应该能修改他人的反馈', async () => {
      // 创建管理员的测试反馈
      const adminFeedback = await createTestFeedback(
        adminUser.id,
        testAttractions[0].id,
      );

      const deleteResponse = await request(app)
        .post('/api/v1/feedback/update')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({
          id: adminFeedback.id,
          status: 'deleted',
        });

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.code).toBe(2001);
      expect(deleteResponse.body.message).toContain('无权更新此反馈');
    });
  });
});
