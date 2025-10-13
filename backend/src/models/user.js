import bcrypt from 'bcryptjs';
import { Model } from "sequelize";
const salt = bcrypt.genSaltSync(5)
const loadModel = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasOne(models.Musician, { foreignKey: 'userId' })
    }
  }
  User.init({
    full_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    birthday: {
      type: DataTypes.DATE,
      allowNull: false
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      set(value) {
        // Hash the password before saving it to the database
        const hashedPassword = bcrypt.hashSync(value, salt);
        this.setDataValue('password', hashedPassword);
      }
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false
    },
    profile_picture: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};

export default loadModel;