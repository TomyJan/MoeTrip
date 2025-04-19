import request from 'supertest';
import app from '@/app';
import { createTestUser, generateTestToken, createTestAttraction, createTestFeedback } from '../utils/test-utils';
import Feedback from '@/models/feedback.model';
import Attraction from '@/models/attraction.model';
import { Op } from 'sequelize';

describe('反馈模块-添加反馈', () => {
  let regularUser: any;
  let adminUser: any;
  let regularUserToken: string;
  let adminToken: string;
  let testAttractions: Attraction[] = [];

  // 在所有测试之前准备测试数据
  beforeAll(async () => {
    try {
      console.log('开始准备测试数据 - 反馈添加测试');
      
      // 创建测试用户
      regularUser = await createTestUser('user');
      adminUser = await createTestUser('admin');
      
      console.log(`已创建测试用户: 普通用户(${regularUser.id}), 管理员(${adminUser.id})`);

      // 生成令牌
      regularUserToken = generateTestToken(regularUser);
      adminToken = generateTestToken(adminUser);
      
      // 确保有测试景点
      console.log('准备测试景点数据');
      
      // 创建新的测试景点 (只创建2个就足够了，避免景点ID不存在的问题)
      for (let i = 0; i < 2; i++) {
        const attraction = await createTestAttraction();
        testAttractions.push(attraction);
        console.log(`创建了测试景点: ID=${attraction.id}, 名称=${attraction.name}`);
      }
      
      console.log(`测试景点已准备完成: ${testAttractions.map(a => a.id).join(', ')}`);
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
            [Op.in]: [regularUser.id, adminUser.id]
          }
        }
      });
    } catch (error) {
      console.error('清理测试数据失败:', error);
    }
  });

  describe('POST /api/v1/feedback/add', () => {
    it('用户应该能成功添加反馈', async () => {
      const testData = {
        attraction_id: testAttractions[0].id,
        score: 4,
        comment: '系统非常好用，界面友好，推荐！'
      };

      const response = await request(app)
        .post('/api/v1/feedback/add')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send(testData);

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(0);
      expect(response.body.data.feedback).toBeDefined();
      expect(response.body.data.feedback.user_id).toBe(regularUser.id);
      expect(response.body.data.feedback.attraction_id).toBe(testData.attraction_id);
      expect(response.body.data.feedback.score).toBe(testData.score);
      expect(response.body.data.feedback.comment).toBe(testData.comment);
      expect(response.body.data.feedback.status).toBe('public');
    });

    it('用户应该能对不同景点添加不同反馈', async () => {
      const testData = {
        attraction_id: testAttractions[1].id,
        score: 5,
        comment: '另一个景点体验更好！'
      };

      const response = await request(app)
        .post('/api/v1/feedback/add')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send(testData);

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(0);
      expect(response.body.data.feedback).toBeDefined();
      expect(response.body.data.feedback.user_id).toBe(regularUser.id);
      expect(response.body.data.feedback.attraction_id).toBe(testData.attraction_id);
      expect(response.body.data.feedback.score).toBe(testData.score);
      expect(response.body.data.feedback.comment).toBe(testData.comment);
      expect(response.body.data.feedback.status).toBe('public');
    });

    it('用户应该不能对同一个景点重复添加反馈', async () => {
      // 先添加一个反馈
      await createTestFeedback(regularUser.id, testAttractions[0].id);
      
      const testData = {
        attraction_id: testAttractions[0].id, // 已经对这个景点添加过反馈
        score: 3,
        comment: '重复评价'
      };

      const response = await request(app)
        .post('/api/v1/feedback/add')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send(testData);

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(1002); // 已存在的反馈代码
      expect(response.body.message).toContain('已经对该景点提交过反馈');
    });

    it('用户应该能在删除后重新添加同一景点的反馈', async () => {
      // 先创建一个反馈并标记为删除
      await createTestFeedback(regularUser.id, testAttractions[0].id, 'deleted');
        
      // 然后尝试重新添加
      const newData = {
        attraction_id: testAttractions[0].id,
        score: 3,
        comment: '重新评价'
      };

      const response = await request(app)
        .post('/api/v1/feedback/add')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send(newData);

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(0);
      expect(response.body.data.feedback).toBeDefined();
      expect(response.body.data.feedback.status).toBe('public');
      expect(response.body.data.feedback.score).toBe(newData.score);
    });

    it('应该拒绝无效的评分', async () => {
      const invalidScoreData = {
        attraction_id: testAttractions[0].id,
        score: 6, // 超出1-5范围
        comment: '测试评论'
      };

      const response = await request(app)
        .post('/api/v1/feedback/add')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send(invalidScoreData);

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(1001);
      expect(response.body.message).toContain('评分必须是1-5之间');
    });

    it('未登录用户不应该能添加反馈', async () => {
      const feedbackData = {
        attraction_id: testAttractions[0].id,
        score: 3,
        comment: '测试评论'
      };

      const response = await request(app)
        .post('/api/v1/feedback/add')
        .send(feedbackData);

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(2001);
      expect(response.body.message).toContain('未提供认证令牌');
    });
  });
});
