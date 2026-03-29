const mongoose = require('mongoose');

const scheduleAgentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  // What to monitor
  companyPolicyUrl: String,      // ImageKit URL of company policy PDF
  govtSourceUrls: [String],      // Govt gazette URLs to scrape
  // Schedule
  cronExpression: { type: String, default: '0 9 * * *' }, // daily 9am
  // Alert config
  alertEmail: String,
  // Status
  isActive: { type: Boolean, default: true },
  lastRun: Date,
  lastResult: {
    hasConflict: Boolean,
    summary: String,
    checkedAt: Date,
  },
  runHistory: [{
    runAt: Date,
    hasConflict: Boolean,
    summary: String,
  }],
}, { timestamps: true });

module.exports = mongoose.model('ScheduleAgent', scheduleAgentSchema);
