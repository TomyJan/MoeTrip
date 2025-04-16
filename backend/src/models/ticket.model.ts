import { Model, DataTypes } from "sequelize";
import sequelize from "../utils/database";
import Attraction from "./attraction.model";

class Ticket extends Model {
  public id!: number;
  public attraction_id!: number;
  public name!: string;
  public available!: number;

  // 时间戳
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Ticket.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    attraction_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Attraction,
        key: "id",
      },
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    available: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
  },
  {
    sequelize,
    tableName: "tickets",
    timestamps: true,
    underscored: true,
  },
);

// 设置外键关联
Ticket.belongsTo(Attraction, {
  foreignKey: "attraction_id",
  as: "attraction",
});

export default Ticket;
