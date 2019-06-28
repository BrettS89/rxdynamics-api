const jwt = require('jsonwebtoken');
const keys = require('../config');
const Employee = require('../models/Employee');
const PBM = require('../models/PBM');

exports.employeeAuth = async receivedToken => {
  if (!receivedToken) throw { message: 'unauthorized', status: 401 };

  try {
    await jwt.verify(receivedToken, keys.secret);
    const decodedUser = jwt.decode(receivedToken);
    if (decodedUser === null) throw { message: 'unauthorized', status: 401 };
    return decodedUser.user._id;
  }
  catch(e) {
    throw { message: 'token error', status: 401 };
  }
};

exports.adminAuth = async receivedToken => {
  if (!receivedToken) throw { message: 'unauthorized', status: 401 };

  try {
    await jwt.verify(receivedToken, keys.secret);
    const decodedUser = jwt.decode(receivedToken);
    if (decodedUser === null) throw { message: 'unauthorized', status: 401 };

    const employee = await Employee.findById(decodedUser.user._id);
    if (!employee.isAdmin) throw { message: 'is not admin', status: 401 };
  }
  catch(e) {
    throw { message: 'token error', status: 401 };
  }

  // const token = jwt.sign({ user: decodedUser.user }, keys.secret, { expiresIn: 60 * 60 * 12 });
  return employee;
};

exports.pbmAuth = async apiKey => {
  const pbm = await PBM.findOne({ apiKey });
  if (!pbm) throw { message: 'unauthorized', status: 401 };
  return pbm;
};
