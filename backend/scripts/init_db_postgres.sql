-- MoeTrip PostgreSQL 数据库初始化脚本
-- 文件：/MoeTrip/backend/scripts/init_db_postgres.sql
-- 日期：2024-03-13
-- 适用：PostgreSQL 12 或以上

-- 设置客户端编码为 UTF-8
\encoding UTF8

-- 景点表
CREATE TABLE attractions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    open_time VARCHAR(50) NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 设施表
CREATE TABLE facilities (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'normal',
    attraction_id BIGINT NOT NULL REFERENCES attractions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 用户表
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash CHAR(40) NOT NULL,
    role VARCHAR(10) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_role CHECK (role IN ('user', 'admin')),
    CONSTRAINT valid_password CHECK (password_hash ~ '^[a-f0-9]{40}$')
);

-- 门票表
CREATE TABLE tickets (
    id BIGSERIAL PRIMARY KEY,
    attraction_id BIGINT NOT NULL REFERENCES attractions(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    available INTEGER NOT NULL DEFAULT 0 CHECK (available >= 0),
    price DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (price >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 订单表
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    ticket_id BIGINT NOT NULL REFERENCES tickets(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'success',
    total_price DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (total_price >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_status CHECK (status IN ('success', 'cancelled'))
);

-- 反馈表
CREATE TABLE feedback (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    attraction_id BIGINT NOT NULL REFERENCES attractions(id) ON DELETE CASCADE,
    score SMALLINT NOT NULL CHECK (score BETWEEN 1 AND 5),
    comment TEXT,
    status VARCHAR(10) NOT NULL DEFAULT 'public',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_feedback_status CHECK (status IN ('public', 'deleted')),
    UNIQUE (user_id, attraction_id)
);

-- 索引
CREATE INDEX idx_facilities_attraction_id ON facilities(attraction_id);
CREATE INDEX idx_tickets_attraction_id ON tickets(attraction_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_ticket_id ON orders(ticket_id);
CREATE INDEX idx_orders_date ON orders(date);
CREATE INDEX idx_feedback_user_id ON feedback(user_id);
CREATE INDEX idx_feedback_attraction_id ON feedback(attraction_id);

-- 插入初始数据

-- 管理员用户 (密码: TomyJan)
INSERT INTO users (username, password_hash, role) VALUES
('TomyJan', 'cd6dcca66cf64a1d9b0f842f9c3bbb18c146a629', 'admin');

-- 测试用户 (密码: user)
INSERT INTO users (username, password_hash, role) VALUES
('user', '12dea96fec20593566ab75692c9949596833adc9', 'user');

-- 景点
INSERT INTO attractions (name, description, open_time, image_url) VALUES
('樱花谷', '春季赏樱胜地，风景优美', '08:00-18:00', '/images/sakura.jpg'),
('星空湖', '夜间观星，湖光山色', '10:00-22:00', '/images/starlake.jpg');

-- 设施
INSERT INTO facilities (name, location, status, attraction_id) VALUES
('休息亭', '樱花谷入口', 'normal', 1),
('停车场', '樱花谷西侧', 'normal', 1),
('观景台', '湖边', 'normal', 2);

-- 门票
INSERT INTO tickets (attraction_id, name, available, price) VALUES
(1, '成人票', 100, 80.00),
(1, '儿童票', 50, 40.00),
(2, '夜游票', 30, 120.00);

-- 订单
INSERT INTO orders (user_id, ticket_id, quantity, date, status, total_price) VALUES
(2, 1, 2, '2025-07-15', 'success', 160.00);

-- 反馈
INSERT INTO feedback (user_id, attraction_id, score, comment, status) VALUES
(2, 1, 5, '景色非常美！', 'public');
