import { Model, DataTypes } from 'sequelize';
import sequelize from '../utils/database';
import bcrypt from 'bcrypt';

class User extends Model {
  public id!: number;
  public username!: string;
  public password_hash!: string;
  public role!: 'user' | 'admin';

  // 时间戳
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // 密码验证方法
  public async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password_hash);
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
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'user',
      validate: {
        isIn: [['user', 'admin']],
      },
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
    underscored: true,
    hooks: {
      // 保存前对密码进行哈希
      beforeSave: async (user: User) => {
        if (user.changed('password_hash')) {
          const salt = await bcrypt.genSalt(10);
          user.password_hash = await bcrypt.hash(user.password_hash, salt);
        }
      },
    },
  }
);

export default User;
