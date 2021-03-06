/*
User Schema
This is the schema that users in the PostgreSQL database conform to.
*/

module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('users', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    level: {
      type: DataTypes.INTEGER,
      field: 'access_level'
    }
  }, {
    freezeTableName: true
  });
  User.sync();
  return User;
};
