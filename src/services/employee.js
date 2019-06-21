const bcrypt = require('bcryptjs');
const jwt  = require('jsonwebtoken');
const keys = require('../config');
const Employee = require('../models/Employee');

exports.createAccount = async data => {
  const existingEmployee = await Employee.findOne({ email: data.email });
  if (existingEmployee) 
    throw new Error({ message: 'Email already exists for an employee', status: 400 });

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
  if (!employee) throw new Error({ message: 'no employee with this email exists', status: 404 });

  if (!bcrypt.compareSync(data.password, employee.password))
    throw new Error({ message: 'invalid password', status: 401 });

  const userId = { _id: employee._id };
  const token = jwt.sign({ user: userId }, keys.secret);
  return token;
};

exports.changePasswordByAdmin = async data => {
  if (!data.password || !data.id) 
    throw new Error({ message: 'please provide an id and password', status: 400 });

  let employee = await Employee.findById(data.id);
  if (!employee) throw new Error({ message: 'could not find employee with this id', status: 404 });

  employee.password = bcrypt.hashSync(data.password, 10);

  employee.save();
  return true;
};

exports.changePasswordByEmployee = async (id, data) => {
  if (!data.password || !data.id) 
    throw new Error({ message: 'please provide an id and password', status: 400 });

  let employee = await Employee.findById(id);
  if (!employee) throw new Error({ message: 'could not find employee with this id', status: 404 });

  employee.password = bcrypt.hashSync(data.password, 10);

  employee.save();
  return true;
};

exports.setInactive = async id => {
  let employee = await Employee.findById(id);
  if (!employee) throw new Error({ message: 'could not find employee with this id', status: 404 });

  employee.active = false;

  await employee.save()

  return true;
};

exports.setActive = async id => {
  let employee = await Employee.findById(id);
  if (!employee) throw new Error({ message: 'could not find employee with this id', status: 404 });

  employee.active = true;

  await employee.save()
  
  return true;
};

exports.makeAdmin = async id => {
  let employee = await Employee.findById(id);
  if (!employee) throw new Error({ message: 'could not find employee with this id', status: 404 });

  employee.isAdmin = true;

  await employee.save()
  
  return true;
};

exports.removeAdmin = async id => {
  let employee = await Employee.findById(id);
  if (!employee) throw new Error({ message: 'could not find employee with this id', status: 404 });

  employee.isAdmin = false;

  await employee.save()
  
  return true;
};
