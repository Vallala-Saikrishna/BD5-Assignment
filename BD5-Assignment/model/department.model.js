let { DataTypes, sequelize } = require("../lib");

let department = sequelize.define("department", {
  name: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
});

module.exports = { department };
