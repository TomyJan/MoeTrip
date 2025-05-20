import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { validateEnv } from './utils/env-validator';

// 验证并加载环境变量
const envPath = path.join(__dirname, '../.env');
const examplePath = path.join(__dirname, '../.env.example');
validateEnv(envPath, examplePath);

// 导入其他模块
import app from './app';
import sequelize from './utils/database';
import logger from './utils/logger';

const PORT = process.env.PORT as string;
const USE_HTTPS = process.env.USE_HTTPS === 'true';

async function startServer() {
  try {
    // 检查必要目录
    const uploadDir = path.join(
      __dirname,
      '..',
      process.env.UPLOAD_DIR as string,
    );
    const logsDir = path.join(__dirname, '..', 'logs');

    [uploadDir, logsDir].forEach((dir) => {
      if (!fs.existsSync(dir)) {
        logger.info(`创建目录: ${dir}`);
        fs.mkdirSync(dir, { recursive: true });
        // 设置目录权限为 755 (rwxr-xr-x)
        fs.chmodSync(dir, 0o755);
      }
    });

    // 测试数据库连接
    await sequelize.authenticate();
    logger.info('数据库连接成功');

    // 同步数据库模型（开发环境）
    if (process.env.NODE_ENV === 'development') {
      // 禁用掉数据库同步, 手动导吧
      // await sequelize.sync({ alter: true });
      // logger.info('数据库模型同步完成');
    }

    // 根据环境变量决定使用HTTP还是HTTPS
    if (USE_HTTPS) {
      // 读取SSL证书和私钥
      const certPath = process.env.SSL_CERT_PATH as string;
      const keyPath = process.env.SSL_KEY_PATH as string;

      if (!certPath || !keyPath) {
        logger.error('环境变量SSL_CERT_PATH和SSL_KEY_PATH必须设置');
        process.exit(1);
      }

      try {
        const cert = fs.readFileSync(certPath);
        const key = fs.readFileSync(keyPath);

        // 创建HTTPS服务器
        const httpsServer = https.createServer({ cert, key }, app);
        httpsServer.listen(PORT, () => {
          logger.info(`HTTPS服务器运行在 https://localhost:${PORT}`);
          logger.info(`环境: ${process.env.NODE_ENV}`);
          logger.info(`数据库类型: ${process.env.DB_TYPE}`);
        });
      } catch (error) {
        logger.error(`SSL证书读取失败: ${error}`);
        process.exit(1);
      }
    } else {
      // 使用HTTP服务器
      app.listen(PORT, () => {
        logger.info(`HTTP服务器运行在 http://localhost:${PORT}`);
        logger.info(`环境: ${process.env.NODE_ENV}`);
        logger.info(`数据库类型: ${process.env.DB_TYPE}`);
      });
    }
  } catch (error) {
    logger.error('启动失败:', error);
    process.exit(1);
  }
}

startServer();
