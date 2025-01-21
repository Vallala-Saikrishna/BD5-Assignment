let { DataTypes, sequelize } = require("../lib");

let role = sequelize.define("role", {
  title: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
});

module.exports = { role };
