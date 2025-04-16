import path from 'path';
import { validateEnv } from '../utils/env-validator';

// 验证并加载测试环境变量
const testEnvPath = path.join(__dirname, '../../.env.test');
const examplePath = path.join(__dirname, '../../.env.example');
validateEnv(testEnvPath, examplePath);

// 导入数据库配置和模型
import sequelize from '../utils/database';
import Attraction from '../models/attraction.model';
import Facility from '../models/facility.model';
import User from '../models/user.model';
import Ticket from '../models/ticket.model';
import Order from '../models/order.model';

// 设置测试超时时间
jest.setTimeout(30000);

// 在所有测试开始前执行
beforeAll(async () => {
  try {
    await sequelize.authenticate();
    console.log('测试数据库连接成功');

    // 按顺序同步数据库模型
    await sequelize.query('DROP TABLE IF EXISTS orders CASCADE');
    await sequelize.query('DROP TABLE IF EXISTS tickets CASCADE');
    await sequelize.query('DROP TABLE IF EXISTS facilities CASCADE');
    await sequelize.query('DROP TABLE IF EXISTS attractions CASCADE');
    await sequelize.query('DROP TABLE IF EXISTS users CASCADE');

    // 按正确的顺序创建表
    await User.sync({ force: true });
    await Attraction.sync({ force: true });
    await Facility.sync({ force: true });
    await Ticket.sync({ force: true });
    await Order.sync({ force: true });

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
  // 按照外键依赖的反序清理数据
  await Order.destroy({ truncate: true, cascade: true });
  await Ticket.destroy({ truncate: true, cascade: true });
  await Facility.destroy({ truncate: true, cascade: true });
  await Attraction.destroy({ truncate: true, cascade: true });
  await User.destroy({ truncate: true, cascade: true });
});
