import path from 'path';
import { validateEnv } from '../utils/env-validator';

// 验证并加载测试环境变量
const testEnvPath = path.join(__dirname, '../../.env.test');
const examplePath = path.join(__dirname, '../../.env.example');
validateEnv(testEnvPath, examplePath);

// 导入数据库配置
import sequelize from '../utils/database';

// 设置测试超时时间
jest.setTimeout(30000);

// 在所有测试开始前执行
beforeAll(async () => {
  try {
    await sequelize.authenticate();
    console.log('测试数据库连接成功');
    
    // 同步数据库模型（强制重建表）
    await sequelize.sync({ force: true });
    console.log('测试数据库模型同步完成');
  } catch (error) {
    console.error('测试数据库连接失败:', error);
    process.exit(1);
  }
});

// 在所有测试结束后执行
afterAll(async () => {
  await sequelize.close();
  console.log('测试数据库连接已关闭');
});

// 在每个测试用例开始前执行
beforeEach(async () => {
  // 清空所有表数据
  await Promise.all(
    Object.values(sequelize.models).map(model => model.destroy({ truncate: true, cascade: true }))
  );
});
