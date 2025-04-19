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
    console.log(`数据库类型: ${sequelize.getDialect()}`);
    console.log(`数据库名称: ${sequelize.getDatabaseName()}`);

    // 重置数据库和创建表结构 - 使用单个SQL脚本而不是多个单独的命令
    await sequelize.query(`
      -- 1. 删除所有表
      DROP TABLE IF EXISTS orders CASCADE;
      DROP TABLE IF EXISTS feedback CASCADE;
      DROP TABLE IF EXISTS tickets CASCADE;
      DROP TABLE IF EXISTS facilities CASCADE;
      DROP TABLE IF EXISTS attractions CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      
      -- 2. 创建users表
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password_hash CHAR(40) NOT NULL,
        role VARCHAR(10) NOT NULL DEFAULT 'user',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT valid_role CHECK (role IN ('user', 'admin')),
        CONSTRAINT valid_password CHECK (password_hash ~ '^[a-f0-9]{40}$')
      );
      
      -- 3. 创建attractions表
      CREATE TABLE attractions (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT NOT NULL,
        open_time VARCHAR(50) NOT NULL,
        image_url VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      
      -- 4. 创建facilities表
      CREATE TABLE facilities (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        location VARCHAR(255) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'normal',
        attraction_id INTEGER NOT NULL REFERENCES attractions(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      
      -- 5. 创建tickets表
      CREATE TABLE tickets (
        id SERIAL PRIMARY KEY,
        attraction_id INTEGER NOT NULL REFERENCES attractions(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        available INTEGER NOT NULL DEFAULT 0 CHECK (available >= 0),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      
      -- 6. 创建orders表
      CREATE TABLE orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
        ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE RESTRICT,
        quantity INTEGER NOT NULL CHECK (quantity > 0),
        date DATE NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'success',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT valid_status CHECK (status IN ('success', 'cancelled'))
      );
      
      -- 7. 创建feedback表
      CREATE TABLE feedback (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        attraction_id INTEGER NOT NULL REFERENCES attractions(id) ON DELETE CASCADE,
        score SMALLINT NOT NULL CHECK (score BETWEEN 1 AND 5),
        comment TEXT,
        status VARCHAR(10) NOT NULL DEFAULT 'public',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT valid_feedback_status CHECK (status IN ('public', 'deleted')),
        UNIQUE (user_id, attraction_id)
      );
      
      -- 8. 创建索引
      CREATE INDEX idx_facilities_attraction_id ON facilities(attraction_id);
      CREATE INDEX idx_tickets_attraction_id ON tickets(attraction_id);
      CREATE INDEX idx_orders_user_id ON orders(user_id);
      CREATE INDEX idx_orders_ticket_id ON orders(ticket_id);
      CREATE INDEX idx_orders_date ON orders(date);
      CREATE INDEX idx_feedback_user_id ON feedback(user_id);
      CREATE INDEX idx_feedback_attraction_id ON feedback(attraction_id);
    `);

    console.log('所有表和索引创建成功');
    console.log('测试数据库初始化完成');
  } catch (error) {
    console.error('测试数据库初始化失败:', error);
    throw error;
  }
});

// 在所有测试结束后执行
afterAll(async () => {
  await sequelize.close();
  console.log('测试数据库连接已关闭');
});

// 在每个测试用例开始前执行
beforeEach(async () => {
  try {
    // 清空所有表数据并初始化测试数据 - 单个脚本
    await sequelize.query(`
      -- 1. 禁用外键约束
      SET CONSTRAINTS ALL DEFERRED;
      
      -- 2. 清空所有表
      TRUNCATE TABLE orders, feedback, tickets, facilities, attractions, users RESTART IDENTITY CASCADE;
      
      -- 3. 重新启用外键约束
      SET CONSTRAINTS ALL IMMEDIATE;
      
      -- 4. 插入用户数据
      INSERT INTO users (id, username, password_hash, role) VALUES
        (1, 'TomyJan', 'cd6dcca66cf64a1d9b0f842f9c3bbb18c146a629', 'admin'),
        (2, 'user', '12dea96fec20593566ab75692c9949596833adc9', 'user');
      
      -- 5. 插入景点数据
      INSERT INTO attractions (id, name, description, open_time, image_url) VALUES
        (1, '樱花谷', '春季赏樱胜地，风景优美', '08:00-18:00', '/images/sakura.jpg'),
        (2, '星空湖', '夜间观星，湖光山色', '10:00-22:00', '/images/starlake.jpg');
      
      -- 6. 插入设施数据
      INSERT INTO facilities (id, name, location, status, attraction_id) VALUES
        (1, '休息亭', '樱花谷入口', 'normal', 1),
        (2, '停车场', '樱花谷西侧', 'normal', 1),
        (3, '观景台', '湖边', 'normal', 2);
      
      -- 7. 插入票种数据
      INSERT INTO tickets (id, attraction_id, name, available) VALUES
        (1, 1, '成人票', 100),
        (2, 1, '儿童票', 50),
        (3, 2, '夜游票', 30);
      
      -- 8. 插入订单数据
      INSERT INTO orders (id, user_id, ticket_id, quantity, date, status) VALUES
        (1, 2, 1, 2, '2025-07-15', 'success');
      
      -- 9. 插入反馈数据
      INSERT INTO feedback (id, user_id, attraction_id, score, comment, status) VALUES
        (1, 2, 1, 5, '景色非常美！', 'public');
      
      -- 10. 更新序列号
      SELECT setval('users_id_seq', 3);
      SELECT setval('attractions_id_seq', 3);
      SELECT setval('facilities_id_seq', 4);
      SELECT setval('tickets_id_seq', 4);
      SELECT setval('orders_id_seq', 2);
      SELECT setval('feedback_id_seq', 2);
    `);

    console.log('测试数据已重置');
  } catch (error) {
    console.error('重置测试数据失败:', error);
    throw error;
  }
});
