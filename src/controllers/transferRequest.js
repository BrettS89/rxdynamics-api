const { pbmAuth } = require('../utilities/auth');
const { handleError } = require('../utilities/errorHandling');
const transferRequest = require('../services/transferRequest');

exports.getNearbyPharmacies = async (req, res) => {
  try {
    await pbmAuth(req.header('authorization'));
    const nearByPharmacies =
      await transferRequest.findNearbyPharmacies(req.params.npi);
    res.status(200).json({ nearByPharmacies });
  } catch (e) {
    handleError(req, e, 'get nearby pharmacies');
  }
};

exports.promptMember = async (req, res) => {
  try {
    const pbm = await pbmAuth(req.header('authorization'));
    await transferRequest.createTransferRequest(req.body, pbm._id);
    await transferRequest.sendTransferRequestSMS(data);
    res.status(200).json({ message: 'transfer prompt sent to member' });
  } catch (e) {
    handleError(req, e, 'prompt transfer request');
  }
};

exports.initiate = async (req, res) => {
  try {
    console.log(req.body.Body);
    res.status(200).json({ message: 'recieved' });
  } catch (e) {
    handleError(req, e, 'initiateTransfer');
  }
};
