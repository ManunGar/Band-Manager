'use strict';
import { Model } from "sequelize";
const loadModel = (sequelize, DataTypes) => {
  class Application extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Musician relationship with Application (Many-to-One)
      Application.belongsTo(models.Musician, { foreignKey: 'musicianId', as: 'musician' });

      // Agreement relationship with Application (Many-to-One)
      Application.belongsTo(models.Agreement, { foreignKey: 'agreementId', as: 'agreement' });
    }
  }
  Application.init({
    musicianId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Musicians',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    agreementId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Agreements',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    status: {
      type: DataTypes.ENUM,
      values: ['pending', 'accepted', 'rejected'],
      allowNull: false,
      defaultValue: 'pending'
    },
    rate: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM,
      values: ['musician_apply', 'band_invite'],
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Application',
  });
  return Application;
};

export default loadModel;