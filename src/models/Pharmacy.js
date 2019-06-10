const mongoose = require('mongoose');

const pharmacySchema = new mongoose.Schema({
  npi: { type: String, required: true, unique: true },
  chainCode: { type: String, required: true, },
  name: { type: String, required: true, },
  address: { type: String, required: true, },
  lat: { type: Number, required: true, },
  lon: { type: Number, required: true, },
  location: {
    type: {
      type: String,
      enum: ['Point'],
    },
    coordinates: { type: [Number], }
  },
});

module.exports = mongoose.model('Pharmacy', pharmacySchema);
