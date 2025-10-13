import { Model } from "sequelize";
const loadModel = (sequelize, DataTypes) => {
  class Band extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Component relationship with Band (One-to-Many)
      Band.hasMany(models.Component, { foreignKey: 'bandId', as: 'components' });
    }
  }
  Band.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: { 
      type: DataTypes.STRING,
      allowNull: false
    },
    code: { 
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    profile_picture: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Band',
  });
  return Band;
};

export default loadModel;