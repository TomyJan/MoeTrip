import { Model, DataTypes } from 'sequelize';
import sequelize from '../utils/database';
import User from './user.model';

class Feedback extends Model {
  public id!: number;
  public user_id!: number;
  public attraction_id!: number;
  public score!: number;
  public comment?: string;
  public status!: string;

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
    attraction_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'public',
      validate: {
        isIn: [['public', 'deleted']],
      },
    },
  },
  {
    sequelize,
    tableName: 'feedback',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'attraction_id'],
        name: 'feedback_user_attraction_unique',
      },
    ],
  },
);

export default Feedback;
