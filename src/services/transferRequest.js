const Pharmacy = require('../models/Pharmacy');
const TransferRequest = require('../models/TransferRequest');
const { sendSMS } = require('./twilio');

exports.findNearbyPharmacies = async npi => {
  const p = await Pharmacy.findOne({ npi });
  if (!p) throw new Error({ message: 'pharmacy not found', status: 404 });
  console.log(p.lat, p.lon);
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
  const transferFromPharmacy = await findOne({ npi: data.transferFromPharmacy });
  const transferToPharmacy = await findOne({ npi: data.transferToPharmacy });

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

  await transferRequest.save();
};

exports.sendTransferRequestSMS = async data => {
  const pharmacy = await Pharmacy.findOne({ npi: data.npi });

  const message = 
    `Greetings from ${data.planSponsor}. 
    You can save money by transferring your prescription(s) to 
    ${pharmacy.name} at ${pharmacy.address}. If you would like us to 
    transfer your prescription reply with YES to this text message 
    and we'll handle the rest.`;

  await sendSMS(data.memberPhoneNumber, message);
};

exports.sendBadTextResponse = async memberPhoneNumber => {
  const message =
    `Please respond with a yes if you would like us 
    to transfer your prescription(s).`;

  await sendSMS(memberPhoneNumber, message);
};

exports.initiate = async memberPhoneNumber => {
  let transferRequest = await TransferRequest.find({ 
    memberPhoneNumber, 
    status: 'new' 
  });

  transferRequest.status = 'initiate';
  await transferRequest.save();
  return true;
};

exports.sendInitiatedSMS = async memberPhoneNumber => {
  const message = 
    `Great! We'll have your prescription(s) transferred there. 
    The transfer process will take about 10 minutes. 
    We'll text you when it's finished. Call us at
    609 213 1708 if you have any questions.`;

  await sendSMS(memberPhoneNumber, message);
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

  const message = 
    `Your transfer is complete and your prescription(s)
    are ready for pick up at ${pharmacyName} ${pharmacyAddress}`;

  await sendSMS(memberPhoneNumber, message);
};

