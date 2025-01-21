const express = require("express");
const { employeeDepartment } = require("./model/employeeDepartment.model");
const { employeeRole } = require("./model/employeeRole.model");
const { employee } = require("./model/employee.model");
const { role } = require("./model/role.model");
const { department } = require("./model/department.model");
const { sequelize } = require("./lib/index.js");
let { Op } = require("@sequelize/core");

const app = express();
app.use(express.json());
const port = 3000;

app.get("/seed_db", async (req, res) => {
  await sequelize.sync({ force: true });

  const departments = await department.bulkCreate([
    { name: "Engineering" },
    { name: "Marketing" },
  ]);

  const roles = await role.bulkCreate([
    { title: "Software Engineer" },
    { title: "Marketing Specialist" },
    { title: "Product Manager" },
  ]);

  const employees = await employee.bulkCreate([
    { name: "Rahul Sharma", email: "rahul.sharma@example.com" },
    { name: "Priya Singh", email: "priya.singh@example.com" },
    { name: "Ankit Verma", email: "ankit.verma@example.com" },
  ]);

  // Associate employees with departments and roles using create method on junction models
  await employeeDepartment.create({
    employeeId: employees[0].id,
    departmentId: departments[0].id,
  });
  await employeeRole.create({
    employeeId: employees[0].id,
    roleId: roles[0].id,
  });

  await employeeDepartment.create({
    employeeId: employees[1].id,
    departmentId: departments[1].id,
  });
  await employeeRole.create({
    employeeId: employees[1].id,
    roleId: roles[1].id,
  });

  await employeeDepartment.create({
    employeeId: employees[2].id,
    departmentId: departments[0].id,
  });
  await employeeRole.create({
    employeeId: employees[2].id,
    roleId: roles[2].id,
  });

  await employeeDepartment.create({
    employeeId: employees[3].id,
    departmentId: departments[0].id,
  });
  await employeeRole.create({
    employeeId: employees[3].id,
    roleId: roles[0].id,
  });

  return res.json({ message: "Database seeded!" });
});
// Helper function to get employee's associated departments
async function getEmployeeDepartments(employeeId) {
  const employeeDepartments = await employeeDepartment.findAll({
    where: { employeeId },
  });

  let departmentData;
  for (let empDep of employeeDepartments) {
    departmentData = await department.findOne({
      where: { id: empDep.departmentId },
    });
  }

  return departmentData;
}

async function getEmployeeRoles(employeeId) {
  const employeeRoles = await employeeRole.findAll({
    where: { employeeId },
  });
  let roleData;
  for (let empRole of employeeRoles) {
    roleData = await role.findOne({
      where: { id: empRole.roleId },
    });
  }

  return roleData;
}

// Helper function to get employee details with associated departments and roles
async function getEmployeeDetails(employeeData) {
  const department = await getEmployeeDepartments(employeeData.id);
  const role = await getEmployeeRoles(employeeData.id);

  return {
    ...employeeData.dataValues,
    department,
    role,
  };
}

async function getAllEmployees() {
  let employees = await employee.findAll();
  let employeeDetails = [];
  for (let i = 0; i < employees.length; i++) {
    let details = await getEmployeeDetails(employees[i]);
    employeeDetails.push(details);
  }
  return { employees: employeeDetails };
}

app.get("/employees", async (req, res) => {
  try {
    let response = await getAllEmployees();
    if (response.employees.length === 0) {
      return res.status(404).json({ message: "No employees found" });
    }
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

async function getEmployeeById(employeeId) {
  let employeeData = await employee.findOne({ where: { id: employeeId } });
  let employeeDetails = [];
  if (employeeData) {
    let details = await getEmployeeDetails(employeeData);
    employeeDetails.push(details);
  }
  return { employees: employeeDetails };
}

app.get("/employees/details/:id", async (req, res) => {
  try {
    let employeeId = parseInt(req.params.id);
    let response = await getEmployeeById(employeeId);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

async function getEmployeesByDepartmentId(departmentId) {
  const employeeDepartments = await employeeDepartment.findAll({
    where: { departmentId },
  });
  let employeeDetails = [];
  for (let i = 0; i < employeeDepartments.length; i++) {
    let employeeData = await employee.findOne({
      where: { id: employeeDepartments[i].employeeId },
    });
    if (employeeData) {
      let details = await getEmployeeDetails(employeeData);
      employeeDetails.push(details);
    }
  }
  return { employees: employeeDetails };
}

app.get("/employees/department/:departmentId", async (req, res) => {
  try {
    let departmentId = parseInt(req.params.departmentId);
    let response = await getEmployeesByDepartmentId(departmentId);
    if (response.employees.length === 0) {
      return res
        .status(404)
        .json({ message: "No employee found by this department ID" });
    }
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

async function getEmployeesByRoleId(roleId) {
  const employeeRoles = await employeeRole.findAll({
    where: { roleId },
  });
  let employeeDetails = [];
  for (let i = 0; i < employeeRoles.length; i++) {
    let employeeData = await employee.findOne({
      where: { id: employeeRoles[i].employeeId },
    });
    if (employeeData) {
      let details = await getEmployeeDetails(employeeData);
      employeeDetails.push(details);
    }
  }
  return { employees: employeeDetails };
}

app.get("/employees/role/:roleId", async (req, res) => {
  try {
    let roleId = parseInt(req.params.roleId);
    let response = await getEmployeesByRoleId(roleId);
    if (response.employees.length === 0) {
      return res
        .status(404)
        .json({ message: "No employee found by this role ID" });
    }
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

async function sortByName(order) {
  let employeeData = await employee.findAll({
    order: [["name", order]],
  });

  let employeeDetails = [];
  for (let i = 0; i < employeeData.length; i++) {
    let details = await getEmployeeDetails(employeeData[i]);
    employeeDetails.push(details);
  }
  return { employees: employeeDetails };
}

app.get("/employees/sort-by-name", async (req, res) => {
  try {
    let order = req.query.order;
    let response = await sortByName(order);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

async function addNewEmployee(newEmployee) {
  let addEmployee = await employee.create(newEmployee);
  return { addEmployee };
}
app.post("/employees/new", async (req, res) => {
  try {
    let newEmployee = req.body.newEmployee;
    let response = await addNewEmployee(newEmployee);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Exam//localhost:${port}`);
});
