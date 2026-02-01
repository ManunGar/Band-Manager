import { Model } from "sequelize";
const loadModel = (sequelize, DataTypes) => {
  class Performance extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Event relationship with Performance (One-to-One)
      Performance.belongsTo(models.Event, { foreignKey: 'eventId' });
    }
  }
  Performance.init({
    name: {
      type: DataTypes.STRING, 
      allowNull: false
    },
    eventId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Events',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    picture: {
      type: DataTypes.STRING, 
      allowNull: true
    },
    type: {
      type: DataTypes.STRING, 
      allowNull: false
    },
    comment: {
      type: DataTypes.STRING, 
      allowNull: true
    },
    place: {
      type: DataTypes.STRING, 
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Performance',
  });
  return Performance;
};

export default loadModel;