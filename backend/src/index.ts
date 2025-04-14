import fs from 'fs';
import path from 'path';
import app from './app';
import sequelize from './utils/database';

const PORT = process.env.PORT || 5200;

async function startServer() {
  try {
    // 检查环境文件
    const envPath = path.join(__dirname, '../.env');
    if (!fs.existsSync(envPath)) {
      console.error('错误：缺少 .env 文件，请先配置环境变量');
      process.exit(1);
    }

    // 检查必要目录
    const uploadDir = path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads');
    const logsDir = path.join(__dirname, '..', 'logs');

    [uploadDir, logsDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        console.log(`创建目录: ${dir}`);
        fs.mkdirSync(dir, { recursive: true });
        // 设置目录权限为 755 (rwxr-xr-x)
        fs.chmodSync(dir, 0o755);
      }
    });

    // 测试数据库连接
    await sequelize.authenticate();
    console.log('数据库连接成功');

    // 同步数据库模型（开发环境）
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('数据库模型同步完成');
    }

    // 启动服务器
    app.listen(PORT, () => {
      console.log(`服务器运行在 http://localhost:${PORT}`);
      console.log(`环境: ${process.env.NODE_ENV}`);
      console.log(`数据库类型: ${process.env.DB_TYPE}`);
    });
  } catch (error) {
    console.error('启动失败:', error);
    process.exit(1);
  }
}

startServer();
