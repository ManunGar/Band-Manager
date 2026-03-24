'use strict';
import { Model } from "sequelize";
const loadModel = (sequelize, DataTypes) => {
  class Agreement extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Performance relationship with Agreement (Many-to-One)
      Agreement.belongsTo(models.Performance, { foreignKey: 'performanceId', as: 'performance' });

      // Musician relationship with Agreement (Many-to-One)
      Agreement.belongsTo(models.Musician, { foreignKey: 'musicianId', as: 'musician' });

      // Instrument relationship with Agreement (Many-to-One)
      Agreement.belongsTo(models.Instrument, { foreignKey: 'instrumentId', as: 'instrument' });

      // Application relationship with Agreement (One-to-Many)
      Agreement.hasMany(models.Application, { foreignKey: 'agreementId', as: 'applications' });

    }
  }
  Agreement.init({
    performanceId: {
      allowNull: false,
      type: DataTypes.INTEGER,
      references: {
        model: 'Performances',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    musicianId: {
      allowNull: false,
      type: DataTypes.INTEGER,
      references: {
        model: 'Musicians',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    instrumentId: {
      allowNull: false,
      type: DataTypes.INTEGER,
      references: {
        model: 'Instruments',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    status: {
      type: DataTypes.ENUM,
      values: ['open', 'closed'],
      defaultValue: 'open',
      allowNull: false
    },
    amount: {
      allowNull: false,
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    payment: {
      allowNull: false,
      type: DataTypes.DOUBLE
    },
    description: {
      allowNull: false,
      type: DataTypes.STRING
    }
  }, {
    sequelize,
    modelName: 'Agreement',
  });
  return Agreement;
};

export default loadModel;