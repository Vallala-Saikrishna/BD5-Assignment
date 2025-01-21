let { DataTypes, sequelize } = require("../lib");
const { department } = require("./department.model");
const { employee } = require("./employee.model");

let employeeDepartment = sequelize.define("employeeDepartment", {
  employeeId: {
    type: DataTypes.INTEGER,
    references: {
      model: employee,
      key: "id",
    },
  },
  departmentId: {
    type: DataTypes.INTEGER,
    references: {
      model: department,
      key: "id",
    },
  },
});

employee.belongsToMany(department, { through: employeeDepartment });
department.belongsToMany(employee, { through: employeeDepartment });

module.exports = { employeeDepartment };
