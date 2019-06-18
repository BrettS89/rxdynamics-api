const mongoose = require('mongoose');

const pbmSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  apiKey: { type: String, required: true },
  uri: { type: String, },
  getMemberPhoneNumberRoute: { type: String, },
  transferMultipleRx: { type: Boolean, required: true },
});

module.exports = mongoose.model('PBM', pbmSchema);
