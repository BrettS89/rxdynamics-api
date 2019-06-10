const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  dateAdded: { type: Number, required: true, },
  firstName: { type: String, required: true, lowercase: true, },
  lastName: { type: String, required: true, lowercase: true, },
  email: { type: String, required: true, unique: true, lowercase: true, },
  password: { type: String, required: true, },
  active: { type: Boolean, required: true, },
  isAdmin: { type: Boolean, required: true, },
});

module.exports = mongoose.model('Employee', employeeSchema);
