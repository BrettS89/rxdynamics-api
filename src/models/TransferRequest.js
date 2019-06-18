const mongoose = require('mongoose');

const transferRequestSchema = new mongoose.Schema({
  dateCreated: { type: Number, required: true, },
  pbm: { type: mongoose.Schema.Types.ObjectId, ref: 'PBM', required: true, },
  planSponsor: { type: String, required: true },
  transferFromPharmacy: { type: mongoose.Schema.Types.ObjectId, ref: 'Pharmacy', required: true, },
  transferToPharmacy: { type: mongoose.Schema.Types.ObjectId, ref: 'Pharmacy', required: true, },
  drugs: { type: [], required: true },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', default: null },
  memberId: { type: String, },
  memberPhoneNumber: { type: String, },
  status: { type: String, required: true, },
});

module.exports = mongoose.model('TransferRequest', transferRequestSchema);
