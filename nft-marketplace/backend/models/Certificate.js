// models/Certificate.js
const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  certificateId: {
    type: String,
    required: true,
    unique: true
  },
  serverName: {
    type: String,
    required: true
  },
  issuedDate: {
    type: Date,
    required: true
  },
  expiryDate: {
    type: Date,
    required: true
  },
  issuingCA: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Active', 'Revoked', 'Expired'],
    default: 'Active'
  },
  publicKey: {
    type: String,
    required: true
  },
  privateKey: {
    type: String,
    required: true,
    select: false // Opzionale, per non includere il privateKey nelle query
  }
}, { timestamps: true });

module.exports = mongoose.model('Certificate', certificateSchema);
