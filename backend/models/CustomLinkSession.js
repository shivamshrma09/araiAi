const mongoose = require('mongoose');

// Type 3: HR creates a session, gets a unique URL, sends to employee
const customLinkSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // HR user
  agentName: { type: String, default: 'Employee Onboarding' },
  // Company base data (stored as ImageKit URL or text)
  companyPolicyUrl: String,
  companyName: String,
  agentTone: { type: String, enum: ['formal', 'friendly'], default: 'friendly' },
  // Unique token for the URL
  token: { type: String, unique: true, required: true },
  // Employee specific data (HR fills this)
  employeeData: {
    name: String,
    role: String,
    department: String,
    joiningDate: Date,
    email: String,
    reportingManager: String,
  },
  // Fields to collect from employee
  fieldsToCollect: [{
    field: String,       // e.g. "bank_account"
    question: String,    // e.g. "What is your bank account number?"
    required: { type: Boolean, default: true },
    collected: { type: Boolean, default: false },
    value: String,
  }],
  // Chat history
  chatHistory: [{
    role: { type: String, enum: ['user', 'assistant'] },
    content: String,
    timestamp: { type: Date, default: Date.now },
  }],
  // Status
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed'],
    default: 'pending',
  },
  completionPercent: { type: Number, default: 0 },
  // Security
  expiresAt: { type: Date, required: true },
  accessCount: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('CustomLinkSession', customLinkSessionSchema);
