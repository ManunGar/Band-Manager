import { Model } from "sequelize";
const loadModel = (sequelize, DataTypes) => {
  class Event extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Band relationship with Event (Many-to-One)
      Event.belongsTo(models.Band, { foreignKey: 'bandId', as: 'band' });

      // Component relationship with Event (Many-to-Many)
      const EventAttendance = sequelize.define('EventAttendances', {
        present: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false
        },
        alleged: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false
        },
        reason: {
          type: DataTypes.STRING,
          allowNull: true
        }
      });
      Event.belongsToMany(models.Component, {
        through: EventAttendance,
        as: 'attendees',
        foreignKey: 'eventId',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });

      // Instrument relationship with Event (Many-to-Many)
      const InstrumentAttendance = sequelize.define('InstrumentAttendances', {});
      Event.belongsToMany(models.Instrument, {
        through: InstrumentAttendance,
        as: 'instrumentsAttended',
        foreignKey: 'eventId',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    }
  }
  Event.init({
    date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    bandId: {
      type: DataTypes.INTEGER,
      references: {
        model: {
          tableName: 'Bands'
        },
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    initialTime: {
      type: DataTypes.TIME,
      allowNull: false
    },
    endTime: {
      type: DataTypes.TIME
    }
  }, {
    sequelize,
    modelName: 'Event',
  });
  return Event;
};

export default loadModel;