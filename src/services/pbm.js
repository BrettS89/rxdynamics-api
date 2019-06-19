const axios = require('axios');
const PBM = require('../models/PBM');
const utils = require('../utilities/misc');

exports.getRxDetails = async (tr) => {
  // Need name, DOB, phone number, address, drug names, drug strengths
  const foundPbm = await PBM.findById(tr.pbm);
  const apikey = utils.getPbmApiKey(foundPbm.companyName);
  const rxDetailsRoute = foundPbm.rxDetailsRoute;
  // hit pbm api and get member details
  const body = {
    memberId: tr.memberId,
    claims: tr.drugs,
  };

  return {
    firstName: 'Brett',
    lastName: 'Sodie',
    dob: '04-22-1989',
    phone: '6092131708',
    address: '298 Sherman Avenue, Apt. 2, Jersey City, NJ 07307',
    drugs: [
      {
        drugName: 'Atorvastatin Calcium',
        drugStrength: '20MG',
      },
      {
        drugName: 'Metformin',
        drugStrength: '50MG',
      },
    ],
  };
};
