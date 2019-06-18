const axios = require('axios');
const keys = require('../config');
const PBM = require('../models/PBM');

exports.getRxDetails = async (tr) => {
  // Need name, DOB, phone number, drug names, drug strengths

  // get correct api key of pbm
  // find pbm in DB
  const foundPbm = await PBM.findById(tr.pbm);
  // get pbm api uri and api route for getting member details
  // hit pbm api and get member details
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
