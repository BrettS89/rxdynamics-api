const Pharmacy = require('../models/Pharmacy');
const TransferRequest = require('../models/TransferRequest');
const PBM = require('../models/PBM');
const { sendSMS } = require('./twilio');

exports.findNearbyPharmacies = async npi => {
  const p = await Pharmacy.findOne({ npi });
  if (!p) throw new Error({ message: 'pharmacy not found', status: 404 });

  const nearbyPharmacies = await Pharmacy.find({
    location: {
      $nearSphere: {
        $geometry: {
          type: 'Point',
          coordinates: [
            p.lat, p.lon,
          ]
        },
        $maxDistance: 8000
      }
    }
  });

  nearbyPharmacyNpis = nearbyPharmacies.map(p => p.npi);

  return nearbyPharmacyNpis;
};

exports.createTransferRequest = async (data, pbm) => {
  if (!await duplicateRxCheck(data, pbm)) return false;

  const transferFromPharmacy = await Pharmacy.findOne({ npi: data.transferFromPharmacy });
  const transferToPharmacy = await Pharmacy.findOne({ npi: data.transferToPharmacy });

  const transferRequest = new TransferRequest({
    dateCreated: Date.now(),
    pbm,
    transferFromPharmacy,
    transferToPharmacy,
    drugs: [data.drug],
    memberPhoneNumber: data.memberPhoneNumber,
    planSponsor: data.planSponsor,
    status: 'new',
  });

  return await transferRequest.save();
};

exports.sendTransferRequestSMS = async data => {
  const pharmacy = await Pharmacy.findOne({ npi: data.transferToPharmacy });
  const message = `Greetings from ${data.planSponsor}. You can save money by transferring your prescription(s) to ${pharmacy.name} at ${pharmacy.address}. If you would like us to transfer your prescription reply with YES to this text message and we'll handle the rest.`;
  await sendSMS(data.memberPhoneNumber, message);
};

exports.sendBadTextResponse = async memberPhoneNumber => {
  const message = `Please respond with a yes if you would like us to transfer your prescription(s).`;
  await sendSMS(memberPhoneNumber, message);
};

exports.initiate = async memberPhoneNumber => {
  let transferRequests = await TransferRequest.find({ 
    memberPhoneNumber: memberPhoneNumber.substring(2, memberPhoneNumber.length),
    status: 'new',
  });

  if (!transferRequests) throw new Error('Could not find any Rx\'s');

  await Promise.all(transferRequests.map(async t => {
    const transferRecord = t;
    transferRecord.status = 'initiate';
    await transferRecord.save();
  }));
};

exports.sendInitiatedSMS = async memberPhoneNumber => {
  const message = `Great! We'll have your prescription(s) transferred there. The transfer process will take about 10 minutes. We'll text you when it's finished. Call us at 609 213 1708 if you have any questions.`;
  await sendSMS(memberPhoneNumber, message);
};

exports.getOpenTransferRequests = async () => {
  const transferRequests = await TransferRequest
    .find({ status: 'initiate', employee: null })
    .populate('transferToPharmacy', ['_id', 'name', 'address', 'npi', 'phoneNumber'])
    .populate('transferFromPharmacy', ['_id', 'name', 'address', 'npi', 'phoneNumber'])
    .sort({ date: 1 })
    .limit(25)
    .lean()
    .exec();
  
  return transferRequests;
};

exports.getMyTransferRequests = async id => {
  const transferRequests = await TransferRequest
    .find({ status: 'claimed', employee: id })
  
  return transferRequests;
};

exports.employeeClaimTransferRequest = async (id, employee_id) => {
  let transferRequest = await TransferRequest.findById(id);
  if (!transferRequest) throw new Error('Could not find transfer request');
  if (transferRequest.employee)
    throw new Error({ message: 'already claimed', status: 401 });
  transferRequest.employee = employee_id;
  transferRequest.status = 'claimed';
  await transferRequest.save();
};

exports.setTransferRequestComplete = async id => {
  let transferRequest = await TransferRequest.findById(id)
    .populate('transferToPharmacy', ['_id', 'name', 'address'])
    .exec();

  transferRequest.status = 'complete';
  await transferRequest.save();

  return transferRequest;
};

exports.sendCompletedSMS = async transferRequest => {
  const pharmacyName = transferRequest.pharmacy.name;
  const pharmacyAddress = transferRequest.pharmacy.address;
  const memberPhoneNumber = transferRequest.memberPhoneNumber;
  const message = `Your transfer is complete and your prescription(s) are ready for pick up at ${pharmacyName} ${pharmacyAddress}`;
  await sendSMS(memberPhoneNumber, message);
};

// Helper functions

async function duplicateRxCheck(transferRequest, pbm_id) {
  const pbm = await PBM.findById(pbm_id);
  const existingTransferRequests = await TransferRequest.find({
    memberPhoneNumber: transferRequest.memberPhoneNumber,
    status: 'new',
  });
  
  let existingTransferRequest = {};

  if (existingTransferRequests.length === 1) {
    existingTransferRequest = existingTransferRequests[0];

    if (pbm.transferMultipleRx) {
      existingTransferRequest.drugs.push(transferRequest.drug);
    } else {
      existingTransferRequest.status = 'cancelled';
    }

    await existingTransferRequest.save();
    return false;
  }

  if (existingTransferRequests.length > 1) {
    await Promise.all(existingTransferRequests.map(async t => {
      let tReq = t;
      tReq.status = 'cancelled';
      await tReq.save();
    }));
    throw new Error({ message: 'More than 1 existing transfer requests', status: 500 });
  }
  return true;
}
