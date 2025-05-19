-- MoeTrip MySQL 数据库初始化脚本
-- 文件：/MoeTrip/backend/scripts/init_db_mysql.sql
-- 日期：2024-03-13
-- 适用：MySQL 8.0 或以上

-- 设置时区
SET time_zone = '+08:00';

-- 景点表
CREATE TABLE attractions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    open_time VARCHAR(50) NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 设施表
CREATE TABLE facilities (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'normal',
    attraction_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (attraction_id) REFERENCES attractions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 用户表
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash CHAR(40) NOT NULL,
    role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT valid_password CHECK (password_hash REGEXP '^[a-f0-9]{40}$')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 门票表
CREATE TABLE tickets (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    attraction_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(100) NOT NULL,
    available INT NOT NULL DEFAULT 0 CHECK (available >= 0),
    price DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (price >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (attraction_id) REFERENCES attractions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 订单表
CREATE TABLE orders (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    ticket_id BIGINT UNSIGNED NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    date DATE NOT NULL,
    status ENUM('success', 'cancelled') NOT NULL DEFAULT 'success',
    total_price DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (total_price >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 反馈表
CREATE TABLE feedback (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    attraction_id BIGINT UNSIGNED NOT NULL,
    score TINYINT NOT NULL CHECK (score BETWEEN 1 AND 5),
    comment TEXT,
    status ENUM('public', 'deleted') NOT NULL DEFAULT 'public',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (attraction_id) REFERENCES attractions(id) ON DELETE CASCADE,
    UNIQUE KEY feedback_user_attraction_unique (user_id, attraction_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 操作日志表
CREATE TABLE logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    action VARCHAR(50) NOT NULL COMMENT '操作类型（如create, update, delete, login, logout等）',
    target VARCHAR(50) NOT NULL COMMENT '操作对象（如user, ticket, order等）',
    target_id BIGINT UNSIGNED NULL COMMENT '操作对象ID（可空，如登录操作没有特定目标ID）',
    content TEXT NOT NULL COMMENT '操作内容详情（JSON或描述文本）',
    ip_address VARCHAR(50) NULL COMMENT '操作者IP地址',
    user_agent TEXT NULL COMMENT '操作者浏览器信息',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统操作日志';

-- 索引
CREATE INDEX idx_facilities_attraction_id ON facilities(attraction_id);
CREATE INDEX idx_tickets_attraction_id ON tickets(attraction_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_ticket_id ON orders(ticket_id);
CREATE INDEX idx_orders_date ON orders(date);
CREATE INDEX idx_feedback_user_id ON feedback(user_id);
CREATE INDEX idx_feedback_attraction_id ON feedback(attraction_id);
CREATE INDEX idx_logs_user_id ON logs(user_id);
CREATE INDEX idx_logs_action ON logs(action);
CREATE INDEX idx_logs_target ON logs(target);
CREATE INDEX idx_logs_created_at ON logs(created_at);

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

-- 初始日志记录
INSERT INTO logs (user_id, action, target, target_id, content, ip_address) VALUES
(1, 'init', 'system', NULL, '系统初始化', '127.0.0.1');
