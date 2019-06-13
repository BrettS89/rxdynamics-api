const { employeeAuth, adminAuth } = require('../utilities/auth');
const { handleError } = require('../utilities/errorHandling');
const employeeService = require('../services/employee');

exports.login = async (req, res) => {
  try {
    const token = await employeeService.login(req.body);
    res.status(200).json({ token });
  } catch (e) {
    handleError(res, e, 'employee login');
  }
};

exports.createEmployee = async (req, res) => {
  try {
    await adminAuth(req.header('authorization'));
    await employeeService.createAccount(req.body);
    res.status(201).json({ message: 'employee created' });
  } catch (e) {
    handleError(res, e, 'create employee');
  }
};

exports.changePasswordByEmployee = async (req, res) => {
  try {
    const id = await employeeAuth(req.header('authorization'));
    await employeeService.changePasswordByEmployee(id, req.body);
    res.status(200).json({ message: 'password changed' });
  } catch (e) {
    handleError(res, e, 'change password by employee');
  }
};

exports.changePasswordByAdmin = async (req, res) => {
  try {
    await adminAuth(req.header('authorization'));
    await employeeService.changePasswordByAdmin(req.body);
    res.status(200).json({ message: 'password changed' });
  } catch (e) {
    handleError(res, e, 'change password by admin');
  }
};
