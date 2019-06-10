const Employee = require('../models/Employee');
const PBM = require('../models/PBM');

exports.employeeAuth = async receivedToken => {
  if (!receivedToken) throw new Error({ error: 'Unauthorized', status: 401 });

  try {
    await jwt.verify(receivedToken, keys.secret);
    const decodedUser = jwt.decode(receivedToken);
    if (decodedUser === null) throw { error: 'Unauthorized', status: 401 };
    return decodedUser.user._id;
  }
  catch(e) {
    throw new Error('Token error');
  }
};

exports.adminAuth = async receivedToken => {
  if (!receivedToken) throw new Error({ error: 'Unauthorized', status: 401 });

  try {
    await jwt.verify(receivedToken, keys.secret);
    const decodedUser = jwt.decode(receivedToken);
    if (decodedUser === null) throw { error: 'Unauthorized', status: 401 };

    const employee = await Employee.findById(decodedUser.user._id);
    if (!employee.isAdmin) throw new Error('is not admin');
  }
  catch(e) {
    throw new Error('Token error');
  }

  // const token = jwt.sign({ user: decodedUser.user }, keys.secret, { expiresIn: 60 * 60 * 12 });
  return employee;
};

exports.pbmAuth = async apiKey => {
  const pbm = await PBM.findOne({ apiKey });
  if (!pbm) throw new Error({ message: 'unauthorized', status: 401 });
  return pbm;
};
