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
      Instrument.belongsToMany(models.Musician, { 
        through: 'MusicianLevel', 
        as: 'musicians', 
        foreignKey: 'instrumentId', 
        onDelete: 'CASCADE', 
        onUpdate: 'CASCADE' 
      });

      // Component relationship with Instrument (Many-to-Many)
      Instrument.belongsToMany(models.Component, {
        through: 'ComponentInstruments',
        as: 'components',
        foreignKey: 'instrumentId',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });

      // Event relationship with Instrument (Many-to-Many)
      Instrument.belongsToMany(models.Event, {
        through: 'InstrumentAttendances',
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