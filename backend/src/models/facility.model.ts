import { Model, DataTypes } from 'sequelize';
import sequelize from '../utils/database';
import Attraction from './attraction.model';

class Facility extends Model {
  public id!: number;
  public name!: string;
  public location!: string;
  public status!: string;
  public attraction_id!: number;

  // 时间戳
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Facility.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: '正常',
      validate: {
        isIn: [['正常', '维护']],
      },
    },
    attraction_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Attraction,
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'facilities',
    timestamps: true,
    underscored: true,
  },
);

// 设置外键关联
Facility.belongsTo(Attraction, {
  foreignKey: 'attraction_id',
  as: 'attraction',
});

export default Facility;
