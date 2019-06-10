const { pbmAuth, employeeAuth } = require('../utilities/auth');
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
    const message = req.body.Body.toLowerCase();

    if (message === 'yes') {
      await transferRequest.initiate(req.body.from);
      await transferRequest.sendInitiatedSMS(req.body.from);
    } else {
      await transferRequest.sendBadTextResponse(req.body.from);
    }
    res.status(200).json({ message: 'recieved' });
  } catch (e) {
    handleError(req, e, 'initiateTransfer');
  }
};

exports.completed = async (req, res) => {
  try {
    await employeeAuth(req.header(authorization));
    const tRequest = 
      await transferRequest.setTransferRequestComplete(req.params.id);
    await transferRequest.sendCompletedSMS(tRequest);
    res.status(200).json({ message: 'success' });
  } catch (e) {
    handleError(req, e, 'transferCompleted');
  }
};
