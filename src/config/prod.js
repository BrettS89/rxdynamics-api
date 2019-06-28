module.exports = {
  secret: process.env.SECRET,
  mongoURI: process.env.MONGO_URI,
  environment: process.env.ENVIRONMENT,
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
  twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER,
  expire: 3600000000,
};
