import { Model, DataTypes } from 'sequelize';
import sequelize from '../utils/database';
import User from './user.model';

class Feedback extends Model {
  public id!: number;
  public user_id!: number;
  public score!: number;
  public comment?: string;

  // 时间戳
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Feedback.init(
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
    score: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'feedback',
    timestamps: true,
    underscored: true,
  },
);

export default Feedback;
