import { Model } from "sequelize";
const loadModel = (sequelize, DataTypes) => {
  class Instrument extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Musician relationship with Instrument (Many-to-Many)
      const MusicianLevel = sequelize.define('MusicianLevel', {
        level: {
          type: DataTypes.ENUM,
          values: ['aficionado', 'aficionado profesional', 'enseñanzas básica', 'título profesional', 'título superior'],
          allowNull: false
        }
      });
      Instrument.belongsToMany(models.Musician, { 
        through: MusicianLevel, 
        as: 'musicians', 
        foreignKey: 'instrumentId', 
        onDelete: 'CASCADE', 
        onUpdate: 'CASCADE' 
      });

      // Component relationship with Instrument (Many-to-Many)
      const ComponentInstrument = sequelize.define('ComponentInstruments', {
        principal: {
          type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false
        }
      });
      Instrument.belongsToMany(models.Component, {
        through: ComponentInstrument,
        as: 'components',
        foreignKey: 'instrumentId',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });

      // Event relationship with Instrument (Many-to-Many)
      const InstrumentAttendance = sequelize.define('InstrumentAttendances', {});
      Instrument.belongsToMany(models.Event, {
        through: InstrumentAttendance,
        as: 'eventsAttended',
        foreignKey: 'instrumentId',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    }
  }
  Instrument.init({
    name: { type: DataTypes.STRING, allowNull: false },
    image: { type: DataTypes.STRING, allowNull: true }
  }, {
    sequelize,
    modelName: 'Instrument',
  });
  return Instrument;
};

export default loadModel;