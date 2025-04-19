// server/models/class.js

module.exports = (sequelize, DataTypes) => {
    const Class = sequelize.define('Class', {
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      teacherId: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    }, {
      tableName: 'classes',
      timestamps: true
    });
  
    Class.associate = (models) => {
      Class.belongsTo(models.User, {
        foreignKey: 'teacherId',
        as: 'teacher'
      });
  
      Class.belongsToMany(models.User, {
        through: 'ClassEnrollments',
        foreignKey: 'classId',
        otherKey: 'studentId',
        as: 'students'
      });
    };
  
    return Class;
  };
  