import { Sequelize } from 'sequelize';

const dbType = process.env.DB_TYPE || 'postgres';

const sequelize = new Sequelize({
  dialect: dbType === 'mysql' ? 'mysql' : 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || (dbType === 'mysql' ? '3306' : '5432')),
  database: process.env.DB_NAME || 'moetrip',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  schema: dbType === 'postgres' ? (process.env.DB_SCHEMA || 'public') : undefined,
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
  // MySQL特定配置
  ...(dbType === 'mysql' ? {
    timezone: '+08:00',
    dialectOptions: {
      charset: 'utf8mb4',
    },
  } : {}),
});

export default sequelize;
