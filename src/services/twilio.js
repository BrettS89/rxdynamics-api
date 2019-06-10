const twilio = require('twilio');
const { twilioAccountSid, twilioAuthToken, twilioPhoneNumber } = require('../config');

const client = new twilio(twilioAccountSid, twilioAuthToken);

exports.sendSMS = (phoneNumber, message) => {
  client.messages.create({
    body: message,
    to: phoneNumber,
    from: twilioPhoneNumber
  });
};
