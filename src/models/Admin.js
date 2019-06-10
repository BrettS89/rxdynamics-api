const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  dateAdded: { type: Number, required: true, },
  firstName: { type: String, required: true, lowercase: true, },
  lastName: { type: String, required: true, lowercase: true, },
  email: { type: String, required: true, lowercase: true, },
  active: { type: Boolean, required: true, },
});

module.exports = mongoose.model('Admin', adminSchema);
