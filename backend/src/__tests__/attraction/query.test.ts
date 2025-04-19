import request from 'supertest';
import app from '@/app';
import sequelize from '@/utils/database';

describe('景点模块-查询景点', () => {
  describe('POST /api/v1/attraction/query', () => {
    // 在测试前获取初始化脚本创建的景点数量
    let initialAttractionCount = 0;
    
    beforeEach(async () => {
      const [result] = await sequelize.query('SELECT COUNT(*) as count FROM attractions');
      initialAttractionCount = parseInt((result as any)[0].count);
    });
    
    it('应该成功查询景点列表', async () => {
      const response = await request(app)
        .post('/api/v1/attraction/query')
        .send({});

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(0);
      expect(response.body.data.total).toBe(initialAttractionCount);
      expect(response.body.data.attractions).toHaveLength(initialAttractionCount);
      expect(response.body.data.page).toBe(1);
      expect(response.body.data.pageSize).toBe(10);
    });

    it('应该根据关键词搜索景点', async () => {
      // 使用初始化脚本中的景点名称
      const response = await request(app)
        .post('/api/v1/attraction/query')
        .send({ keyword: '樱花' });

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(0);
      expect(response.body.data.total).toBeGreaterThan(0);
      // 检查至少一个结果包含关键词
      expect(response.body.data.attractions.some((a: { name: string }) => a.name.includes('樱花'))).toBe(true);
    });

    it('应该正确处理分页', async () => {
      const response = await request(app)
        .post('/api/v1/attraction/query')
        .send({ page: 1, pageSize: 1 });

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(0);
      expect(response.body.data.total).toBe(initialAttractionCount);
      expect(response.body.data.attractions).toHaveLength(1);
      expect(response.body.data.page).toBe(1);
      expect(response.body.data.pageSize).toBe(1);
    });

    it('应该验证无效的分页参数', async () => {
      const response = await request(app)
        .post('/api/v1/attraction/query')
        .send({ page: 0, pageSize: 0 });

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(1001);
      expect(response.body.message).toBe('无效的分页参数');
    });
  });
});
