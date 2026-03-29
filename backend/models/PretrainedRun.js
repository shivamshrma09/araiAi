const mongoose = require('mongoose');

// Type 2: Pretrained agents are fixed (Invoice, Vendor Onboarding, Contract Review)
// This model stores each run/execution
const pretrainedRunSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  agentType: {
    type: String,
    enum: ['invoice', 'vendor_onboarding', 'contract_review'],
    required: true,
  },
  // Input document
  documentUrl: String,   // ImageKit URL (if uploaded there)
  originalFileName: String,
  // Processing
  status: {
    type: String,
    enum: ['processing', 'awaiting_approval', 'approved', 'rejected', 'error'],
    default: 'processing',
  },
  // AI Results
  extractedData: mongoose.Schema.Types.Mixed,
  complianceResult: mongoose.Schema.Types.Mixed,
  riskResult: mongoose.Schema.Types.Mixed,
  auditLog: [{
    agent: String,
    output: mongoose.Schema.Types.Mixed,
    timeTakenSec: Number,
    timestamp: Date,
  }],
  retryCount: { type: Number, default: 0 },
  finalOutput: mongoose.Schema.Types.Mixed,
  errorMessage: String,
}, { timestamps: true });

module.exports = mongoose.model('PretrainedRun', pretrainedRunSchema);
