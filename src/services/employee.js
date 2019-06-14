const bcrypt = require('bcryptjs');
const jwt  = require('jsonwebtoken');
const keys = require('../config');
const Employee = require('../models/Employee');

exports.createAccount = async data => {
  const existingEmployee = await Employee.findOne({ email: data.email });
  if (existingEmployee) 
    throw new Error('Email already exists for an employee');

  const employee = new Employee({
    ...data,
    password: bcrypt.hashSync(data.password, 10),
    dateAdded: Date.now(),
    active: true,
    isAdmin: false,
  });

  await employee.save();

  return true;
};

exports.login = async data => {
  const employee = await Employee.findOne({ email: data.email });
  if (!employee) throw new Error('No employee with this email exists');

  if (!bcrypt.compareSync(data.password, employee.password))
    throw new Error('Invalid password');

  const userId = { _id: employee._id };
  const token = jwt.sign({ user: userId }, keys.secret, 50000);
  return token;
};

exports.changePasswordByAdmin = async data => {
  if (!data.password || !data.id) 
    throw new Error('please provide an id and password');

  let employee = await Employee.findById(data.id);
  if (!employee) throw new Error('could not find employee with this id');

  employee.password = bcrypt.hashSync(data.password, 10);

  employee.save();
  return true;
};

exports.changePasswordByEmployee = async (id, data) => {
  if (!data.password || !data.id) 
    throw new Error('please provide an id and password');

  let employee = await Employee.findById(id);
  if (!employee) throw new Error('could not find employee with this id');

  employee.password = bcrypt.hashSync(data.password, 10);

  employee.save();
  return true;
};

exports.setInactive = async id => {
  let employee = await Employee.findById(id);
  if (!employee) throw new Error('Could not find employee with this ID');

  employee.active = false;

  await employee.save()

  return true;
};

exports.setActive = async id => {
  let employee = await Employee.findById(id);
  if (!employee) throw new Error('Could not find employee with this ID');

  employee.active = true;

  await employee.save()
  
  return true;
};

exports.makeAdmin = async id => {
  let employee = await Employee.findById(id);
  if (!employee) throw new Error('Could not find employee with this ID');

  employee.isAdmin = true;

  await employee.save()
  
  return true;
};

exports.removeAdmin = async id => {
  let employee = await Employee.findById(id);
  if (!employee) throw new Error('Could not find employee with this ID');

  employee.isAdmin = false;

  await employee.save()
  
  return true;
};
