const Pharmacy = require('../models/Pharmacy');
const TransferRequest = require('../models/TransferRequest');
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
        $maxDistance: 8046
      }
    }
  });

  nearbyPharmacyNpis = nearbyPharmacies.map(p => p.npi);

  return nearbyPharmacyNpis;
};

exports.createTransferRequest = async (data, pbm) => {
  const transferRequest = new TransferRequest({
    dateCreated: Date.now(),
    pbm,
    transferFromPharmacy: data.transferFromPharmacy,
    transferToPharmacy: data.transferToPharmacy,
    drugs: [data.drug],
    memberPhoneNumber: data.memberPhoneNumber,
    status: 'new',
  });

  await transferRequest.save();
};

exports.sendTransferRequestSMS = async data => {
  const pharmacy = await Pharmacy.findOne({ npi: data.npi });

  const message = 
    `Greetings from ${data.planSponsor}. 
    You can save money by transferring your prescription to 
    ${pharmacy.name} at ${pharmacy.address}. If you would like us to 
    transfer your prescription reply with YES to this text message 
    and we'll handle the rest.`;

  await sendSMS(data.memberPhoneNumber, message);
};