import { Model, DataTypes } from "sequelize";
import sequelize from "../utils/database";

class User extends Model {
  public id!: number;
  public username!: string;
  public password_hash!: string;
  public role!: "user" | "admin";

  // 时间戳
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // 密码验证方法
  public validatePassword(password: string): boolean {
    return this.password_hash === password; // 直接比较SHA1值
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [3, 50],
      },
    },
    password_hash: {
      type: DataTypes.STRING(40), // SHA1哈希值固定长度为40字符
      allowNull: false,
      validate: {
        is: /^[a-f0-9]{40}$/i, // SHA1格式验证
      },
    },
    role: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: "user",
      validate: {
        isIn: [["user", "admin"]],
      },
    },
  },
  {
    sequelize,
    tableName: "users",
    timestamps: true,
    underscored: true,
  },
);

export default User;
