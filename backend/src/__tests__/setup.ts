import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

// 检查测试环境文件
const testEnvPath = path.join(__dirname, '../../.env.test');
if (!fs.existsSync(testEnvPath)) {
  console.error('错误：缺少 .env.test 文件，请先配置测试环境变量');
  process.exit(1);
}

// 加载测试环境变量
dotenv.config({ path: testEnvPath });

// 设置测试超时时间
jest.setTimeout(30000);

// 创建测试数据库连接
export const testSequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'moetrip_test',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  schema: process.env.DB_SCHEMA || 'public',
  logging: false,
  define: {
    underscored: true,
    timestamps: true,
  },
});

// 在所有测试开始前执行
beforeAll(async () => {
  try {
    await testSequelize.authenticate();
    console.log('测试数据库连接成功');
    
    // 同步数据库模型（强制重建表）
    await testSequelize.sync({ force: true });
    console.log('测试数据库模型同步完成');
  } catch (error) {
    console.error('测试数据库连接失败:', error);
    process.exit(1);
  }
});

// 在所有测试结束后执行
afterAll(async () => {
  await testSequelize.close();
  console.log('测试数据库连接已关闭');
});

// 在每个测试用例开始前执行
beforeEach(async () => {
  // 清空所有表数据
  await Promise.all(
    Object.values(testSequelize.models).map(model => model.destroy({ truncate: true, cascade: true }))
  );
});
