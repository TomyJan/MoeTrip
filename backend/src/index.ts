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
    });
  } catch (error) {
    console.error('启动失败:', error);
    process.exit(1);
  }
}

startServer();
