import { Model, DataTypes } from 'sequelize';
import sequelize from '../utils/database';
import User from './user.model';

// 操作日志模型
class Log extends Model {
  public id!: number;
  public user_id!: number;
  public action!: string;
  public target!: string;
  public target_id?: number;
  public content!: string;
  public ip_address?: string;
  public user_agent?: string;

  // 时间戳
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Log.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
      comment: '操作用户ID',
    },
    action: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '操作类型（如create, update, delete, login, logout等）',
    },
    target: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '操作对象（如user, ticket, order等）',
    },
    target_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '操作对象ID（可空，如登录操作没有特定目标ID）',
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '操作内容详情（JSON或描述文本）',
    },
    ip_address: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '操作者IP地址',
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '操作者浏览器信息',
    },
  },
  {
    sequelize,
    tableName: 'logs',
    timestamps: true,
    underscored: true,
    comment: '系统操作日志',
  },
);

// 设置外键关联
Log.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

export default Log;
