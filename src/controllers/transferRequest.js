const io = require('../../index');
const Pharmacy = require('../models/Pharmacy');
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
    handleError(res, e, 'get nearby pharmacies');
  }
};

exports.promptMember = async (req, res) => {
  try {
    const pbm = await pbmAuth(req.header('authorization'));
    const status = await transferRequest.createTransferRequest(req.body, pbm._id);
    if (!status)
      return res.status(200).json({ message: 'transfers cancelled. More than one Rx' });
    await transferRequest.sendTransferRequestSMS(req.body);
    res.status(200).json({ message: 'transfer prompt sent to member' });
  } catch (e) {
    handleError(res, e, 'prompt transfer request');
  }
};

exports.initiate = async (req, res) => {
  try {
    const message = req.body.Body.toLowerCase();
    if (message === 'yes') {
      await transferRequest.initiate(req.body.From);
      await transferRequest.sendInitiatedSMS(req.body.From);
    } else {
      await transferRequest.sendBadTextResponse(req.body.From);
    }
    res.status(200).json({ message: 'recieved' });
    const openTransferRequests = await transferRequest.getOpenTransferRequests();
    io.io.sockets.emit('openTransferRequests', openTransferRequests);
  } catch (e) {
    handleError(res, e, 'initiateTransfer');
  }
};

exports.getOpenTransferRequests = async (req, res) => {
  try {
    await employeeAuth(req.header('authorization'));
    const openTransferRequests = await transferRequest.getOpenTransferRequests();
    res.status(200).json({ openTransferRequests });
  } catch(e) {
    handleError(res, e, 'getOpenTransferRequests');
  }
};

exports.getMyTransferRequests = async (req, res) => {
  try {
    const employeeId = await employeeAuth(req.header('authorization'));
    const myTransferRequests =
      await transferRequest.getMyTransferRequests(employeeId);
    res.status(200).json({ myTransferRequests });
  } catch(e) {
    handleError(res, e, 'getMyTransferRequests');
  }
};

exports.employeeClaimTR = async (req, res) => {
  try {
    const employeeId = await employeeAuth(req.header('authorization'));
    await transferRequest.employeeClaimTransferRequest(req.body.id, employeeId);
    const openTransferRequests = await transferRequest.getOpenTransferRequests();
    const myTransferRequests =
      await transferRequest.getMyTransferRequests(employeeId);
    
    res.status(200).json({ myTransferRequests });
    io.io.sockets.emit('openTransferRequests', openTransferRequests);
  } catch (e) {
    handleError(res, e, 'employee claim transfer request error');
  }
};

exports.cancel = async (req, res) => {
  try {
    const employeeId = await employeeAuth(req.header('authorization'));
    const cancelledTransferRequest = 
      await transferRequest.cancelTransferRequest(req.body.id, employeeId);
    const openTransferRequests = await transferRequest.getOpenTransferRequests();
    const myTransferRequests =
      await transferRequest.getMyTransferRequests(employeeId);

    await transferRequest.sendCanceledSMS(cancelledTransferRequest);
    
    res.status(200).json({ myTransferRequests });
    io.io.sockets.emit('openTransferRequests', openTransferRequests);
  } catch(e) {
    handleError(res, e, 'transferCancelled');
  }
};

exports.completed = async (req, res) => {
  try {
    const employeeId = await employeeAuth(req.header('authorization'));
    const tRequest = 
      await transferRequest.setTransferRequestComplete(req.body.id, employeeId);
    await transferRequest.sendCompletedSMS(tRequest);

    const openTransferRequests = await transferRequest.getOpenTransferRequests();
    const myTransferRequests =
      await transferRequest.getMyTransferRequests(employeeId);
    
    res.status(200).json({ myTransferRequests });
    io.io.sockets.emit('openTransferRequests', openTransferRequests);
  } catch (e) {
    handleError(res, e, 'transferCompleted');
  }
};

// JUST FOR DEVELOPMENT

exports.addPharmacy = async (req, res) => {
  try {
    const pharmacy = new Pharmacy({
      npi: req.body.npi,
      chainCode: req.body.chainCode,
      name: req.body.name,
      address: req.body.address,
      lat: req.body.lat,
      lon: req.body.lon,
      location: {
        type: 'Point',
        coordinates: [req.body.lat, req.body.lon],
      },
    });
    await pharmacy.save();
    res.status(201).json({ message: 'pharmacy added'})
  } catch (e) {
    console.log('Add pharmacy error: ', e);
  }
};
