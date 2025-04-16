import { Sequelize } from 'sequelize';

const sequelize = new Sequelize({
  dialect: process.env.DB_TYPE === 'mysql' ? 'mysql' : 'postgres',
  host: process.env.DB_HOST as string,
  port: parseInt(process.env.DB_PORT as string),
  database: process.env.DB_NAME as string,
  username: process.env.DB_USER as string,
  password: process.env.DB_PASSWORD as string,
  schema:
    process.env.DB_TYPE === 'postgres'
      ? (process.env.DB_SCHEMA as string)
      : undefined,
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
  // MySQL特定配置
  ...(process.env.DB_TYPE === 'mysql'
    ? {
        timezone: '+08:00',
        dialectOptions: {
          charset: 'utf8mb4',
        },
      }
    : {}),
});

export default sequelize;
