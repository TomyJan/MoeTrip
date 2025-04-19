import { Model, DataTypes } from 'sequelize';
import sequelize from '../utils/database';
import User from './user.model';
import Ticket from './ticket.model';

class Order extends Model {
  public id!: number;
  public user_id!: number;
  public ticket_id!: number;
  public quantity!: number;
  public date!: Date;
  public status!: string;

  // 时间戳
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Order.init(
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
    },
    ticket_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Ticket,
        key: 'id',
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isDate: true,
        // 仅在插入新记录时验证日期
        dateValidator(value: string) {
          try {
            // 新记录永远需要验证
            // Sequelize会在创建新记录时自动调用此验证器
            const dateToCheck = new Date(value);
            
            // 检查日期是否有效
            if (isNaN(dateToCheck.getTime())) {
              throw new Error('无效的日期格式');
            }
          } catch (err) {
            if (err instanceof Error) {
              throw new Error(`日期验证失败: ${err.message}`);
            } else {
              throw new Error('日期验证失败');
            }
          }
        }
      },
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'success',
      validate: {
        isIn: [['success', 'cancelled']]
      }
    },
  },
  {
    sequelize,
    tableName: 'orders',
    timestamps: true,
    underscored: true,
  },
);

// 设置外键关联
Order.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

Order.belongsTo(Ticket, {
  foreignKey: 'ticket_id',
  as: 'ticket',
});

export default Order;
