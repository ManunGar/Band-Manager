import { Model } from "sequelize";
const loadModel = (sequelize, DataTypes) => {
  class Musician extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Instrument relationship with Musician (Many-to-Many)
      const MusicianLevel = sequelize.define('MusicianLevel', {
        level: {
          type: DataTypes.ENUM,
          values: ['aficionado', 'aficionado profesional', 'enseñanzas básica', 'título profesional', 'título superior'],
          allowNull: false
        }
      });
      Musician.belongsToMany(models.Instrument, {
        through: MusicianLevel,
        as: 'instruments',
        foreignKey: 'musicianId',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });

      // User relationship with Musician (One-to-One)
      Musician.belongsTo(models.User, { foreignKey: 'userId', as: 'user', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

      // Component relationship with Musician (One-to-Many)
      Musician.hasMany(models.Component, { foreignKey: 'musicianId', as: 'components' });

      // Agreement relationship with Musician (One-to-Many)
      Musician.hasMany(models.Agreement, { foreignKey: 'musicianId', as: 'agreements' });
    }
  }
  Musician.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: {
          tableName: 'Users'
        },
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    isProfilePrivate: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'Musician',
  });
  return Musician;
};

export default loadModel;