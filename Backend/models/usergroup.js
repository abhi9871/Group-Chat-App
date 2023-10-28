const Sequelize = require("sequelize");
const sequelize = require("../utils/database");

const UserGroup = sequelize.define("UserGroup", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  isAdmin: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
    allowNull: false
  }
});

module.exports = UserGroup;