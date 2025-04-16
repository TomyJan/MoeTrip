import { Model, DataTypes } from 'sequelize';
import sequelize from '../utils/database';

class Attraction extends Model {
  public id!: number;
  public name!: string;
  public description!: string;
  public open_time!: string;
  public image_url!: string;

  // 时间戳
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Attraction.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    open_time: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    image_url: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'attractions',
    timestamps: true,
    underscored: true,
  },
);

export default Attraction;
