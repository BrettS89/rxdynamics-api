const keys = require('../config');
const Pharmacy = require('../models/Pharmacy');
const TransferRequest = require('../models/TransferRequest');
const PBM = require('../models/PBM');
const { sendSMS } = require('./twilio');

exports.findNearbyPharmacies = async npi => {
  const p = await Pharmacy.findOne({ npi });
  if (!p) throw new Error({ message: 'pharmacy not found', status: 404 });
  let searchRadius = 300;
  let minimumPharmaciesFound = false;
  let pharmacies = [];

  while (!minimumPharmaciesFound) {
    let nearbyPharmacies = await Pharmacy.find({
      location: {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [
              p.lon, p.lat,
            ],
          },
          $maxDistance: searchRadius,
        }
      }
    });

    if (nearbyPharmacies.length >= 5) {
      pharmacies = nearbyPharmacies;
      minimumPharmaciesFound = true;
      console.log('finished');
      console.log({ [searchRadius.toString()]: pharmacies.length });
    } else {
      console.log({ [searchRadius.toString()]: nearbyPharmacies.length });
      searchRadius += 300;
    }
  }
  
  return pharmacies.map(p => p.npi);
};

exports.createTransferRequest = async (data, pbm) => {
  if (!await duplicateRxCheck(data, pbm)) return false;

  const transferFromPharmacy =
    await Pharmacy.findOne({ npi: data.transferFromPharmacy });

  const transferToPharmacy =
    await Pharmacy.findOne({ npi: data.transferToPharmacy });

  const transferRequest = new TransferRequest({
    dateCreated: Date.now(),
    pbm,
    transferFromPharmacy,
    transferToPharmacy,
    drugs: [data.prescription],
    memberId: data.memberId,
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

  if (!transferRequests) {
    const message = `We apologize, we can't transfer your prescription at this time`;
    await sendSMS(transferRequest.memberPhoneNumber, message);
    throw { message: 'Could not find any Rx\'s', status: 404 };
  }

  if (transferRequests.length === 1 && Date.now() - transferRequests[0].dateCreated > keys.expire) {
    console.log(Date.now() - transferRequests[0].dateCreated)
    console.log(Date.now() - transferRequests[0].dateCreated > keys.expire);
    return false;
  }
    

  transferRequests = transferRequests.filter(t => Date.now() - t.dateCreated < keys.expire);

  if (!transferRequests) {
    const message = `We apologize, we can't transfer your prescription at this time`;
    await sendSMS(transferRequest.memberPhoneNumber, message);
    throw { message: 'Could not find any Rx\'s', status: 404 };
  }

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
    .populate('transferToPharmacy', ['_id', 'name', 'address', 'npi', 'phoneNumber'])
    .populate('transferFromPharmacy', ['_id', 'name', 'address', 'npi', 'phoneNumber'])
    .sort({ date: 1 })
    .limit(25)
    .lean()
    .exec();

    console.log(transferRequests);
  
  return transferRequests;
};

exports.employeeClaimTransferRequest = async (id, employee_id) => {
  let transferRequest = await TransferRequest.findById(id);
  if (!transferRequest) throw new Error({ message: 'Could not find transfer request', status: 404 });
  if (transferRequest.employee)
    throw new Error({ message: 'already claimed', status: 401 });
  transferRequest.employee = employee_id;
  transferRequest.status = 'claimed';
  await transferRequest.save();
};

exports.cancelTransferRequest = async (_id, employee) => {
  let transferRequest = await TransferRequest.findOne({ _id, employee });
  if (!transferRequest) throw new Error({
    status: 404,
    message: 'transfer request not found',
  });
  transferRequest.status = 'cancelled';
  const cancelledTransferRequest = await transferRequest.save();
  return cancelledTransferRequest;
};

exports.setTransferRequestComplete = async (_id, employee) => {
  let transferRequest = await TransferRequest.findOne({ _id, employee })
    .populate('transferToPharmacy', ['_id', 'name', 'address'])
    .exec();

  transferRequest.status = 'complete';
  await transferRequest.save();

  return transferRequest;
};

exports.sendCompletedSMS = async transferRequest => {
  const pharmacyName = transferRequest.transferToPharmacy.name;
  const pharmacyAddress = transferRequest.transferToPharmacy.address;
  const memberPhoneNumber = transferRequest.memberPhoneNumber;
  const message = `Your transfer is complete and your prescription(s) are ready for pick up at ${pharmacyName} ${pharmacyAddress}`;
  await sendSMS(memberPhoneNumber, message);
};

exports.sendCanceledSMS = async transferRequest => {
  const message = `We apologize, we couldn\'t transfer your prescription at this time. You can pick up your prescription at the original pharmacy it was prescribed.`;
  await sendSMS(transferRequest.memberPhoneNumber, message);
};

exports.sendExpiredSMS = async phoneNumber => {
  const message = `We're sorry you're transfer offer has expired, we'll inform you of any future Rx savings.`;
  await sendSMS(phoneNumber, message);
};

// Helper functions

async function duplicateRxCheck(transferRequest, pbm_id) {
  const pbm = await PBM.findById(pbm_id);
  const existingTransferRequests = await TransferRequest.find({
    memberPhoneNumber: transferRequest.memberPhoneNumber,
    status: 'new',
    dateCreated: { $lt: Date.now() - keys.expire },
  });

  let existingTransferRequest = {};

  if (existingTransferRequests.length === 1 
      && existingTransferRequests[0].transferFromPharmacy.toString() 
        !== transferRequest.transferFromPharmacy
      ) {
    existingTransferRequest = existingTransferRequests[0];
    existingTransferRequest.status = 'cancelled';
    await existingTransferRequest.save();
  }

  if (existingTransferRequests.length === 1) {
    existingTransferRequest = existingTransferRequests[0];

    if (pbm.transferMultipleRx) {
      existingTransferRequest.drugs.push(transferRequest.prescription);
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
