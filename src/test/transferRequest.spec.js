const assert = require('chai').assert;
const transferRequest = require('../services/transferRequest');

describe('transferRequest', () => {

  describe('sendTransferRequestSMS', () => {
    it ('Should return true', async () => {
      data = {
        transferToPharmacy: '1770761397',
        planSponsor: 'Aetna',
        memberPhoneNumber: '6092131708',
      };

      assert.equal(await transferRequest.sendTransferRequestSMS(data), true);
    });
  });

  describe('sendBadTextResponse', () => {
    it ('Should return true', async () => {
      assert.equal(await transferRequest.sendBadTextResponse('6092131708'), true);
    });
  });



});