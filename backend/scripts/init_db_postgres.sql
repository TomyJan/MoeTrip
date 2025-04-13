-- MoeTrip PostgreSQL 数据库初始化脚本
-- 文件：/MoeTrip/backend/scripts/init_db_postgres.sql
-- 日期：2025-04-13
-- 适用：PostgreSQL 15 或以上

-- 注意：需先创建数据库
-- psql -U postgres -c "CREATE DATABASE moetrip ENCODING 'UTF8';"

-- 切换数据库
\connect moetrip

-- 景点表
CREATE TABLE attractions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    open_time VARCHAR(50) NOT NULL,
    image_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 设施表
CREATE TABLE facilities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT '正常',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 用户表
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'tourist',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 门票表
CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    valid_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 订单表
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 反馈表
CREATE TABLE feedback (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    score INTEGER NOT NULL CHECK (score BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_feedback_user_id ON feedback(user_id);

-- 插入模拟数据

-- 景点
INSERT INTO attractions (name, description, open_time, image_url) VALUES
('樱花谷', '春季赏樱胜地，风景优美', '08:00-18:00', '/images/sakura.jpg'),
('星空湖', '夜间观星，湖光山色', '10:00-22:00', '/images/starlake.jpg'),
('古风街', '体验传统文化，美食众多', '09:00-20:00', '/images/oldstreet.jpg');

-- 设施
INSERT INTO facilities (name, location, status) VALUES
('休息亭', '樱花谷入口', '正常'),
('停车场', '星空湖西侧', '正常');

-- 用户
INSERT INTO users (username, password_hash, role) VALUES
('tourist1', '$2b$10$examplehash1', 'tourist'),
('admin1', '$2b$10$examplehash2', 'admin');

-- 门票
INSERT INTO tickets (type, price, valid_date) VALUES
('成人票', 50.00, '2025-12-31'),
('儿童票', 25.00, '2025-12-31');

-- 订单
INSERT INTO orders (user_id, ticket_id, quantity, status) VALUES
(1, 1, 2, 'paid'),
(1, 2, 1, 'pending');

-- 反馈
INSERT INTO feedback (user_id, score, comment) VALUES
(1, 4, '樱花谷很美，但排队时间长'),
(1, 5, '星空湖夜景绝佳');
