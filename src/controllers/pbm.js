const TransferRequest = require('../models/TransferRequest');
const { employeeAuth } = require('../utilities/auth');
const { handleError } = require('../utilities/errorHandling');
const pbm = require('../services/pbm');

exports.getRxDetails = async (req, res) => {
  try {
    await employeeAuth(req.header('authorization'));
    const tr = await TransferRequest.findById(req.params.tr);
    const rxDetails = await pbm.getRxDetails(tr);
    res.status(200).json({ rxDetails });
  } catch(e) {
    handleError(res, e, 'getMemberDetails');
  }
};
