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
        isAfter: new Date().toISOString().split('T')[0], // 只能预订今天之后的票
      },
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
