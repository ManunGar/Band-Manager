import { Model } from "sequelize";
const loadModel = (sequelize, DataTypes) => {
  class Component extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Musician relationship with Component (Many-to-One)
      Component.belongsTo(models.Musician, { foreignKey: 'musicianId', as: 'musician' });

      // Instruments relationship with Components (Many-to-Many)
      const ComponentInstrument = sequelize.define('ComponentInstruments', {
        principal: {
          type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false
        }
      });
      Component.belongsToMany(models.Instrument, {
        through: ComponentInstrument,
        as: 'instruments',
        foreignKey: 'componentId',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
      
      // Band relationship with Component (Many-to-One)
      Component.belongsTo(models.Band, { foreignKey: 'bandId', as: 'band' });

      // Event relationship with Component (Many-to-Many)
      const EventAttendance = sequelize.define('EventAttendances', {
        present: {
          type: DataTypes.BOOLEAN,
          allowNull: true
        },
        alleged: {
          type: DataTypes.BOOLEAN,
          allowNull: true,
        },
        reason: {
          type: DataTypes.STRING,
          allowNull: true
        }
      });
      Component.belongsToMany(models.Event, {
        through: EventAttendance,
        as: 'eventsAttended',
        foreignKey: 'componentId',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    }
  }
  Component.init({
    musicianId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: {
          tableName: 'Musicians'
        },
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    bandId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: {
          tableName: 'Bands'
        },
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    private: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    administrator: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'Component',
  });
  return Component;
};

export default loadModel;