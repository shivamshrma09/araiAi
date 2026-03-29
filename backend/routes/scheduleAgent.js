const router = require('express').Router();
const auth = require('../middleware/auth');
const ScheduleAgent = require('../models/ScheduleAgent');
const axios = require('axios');

// Get all schedule agents for user
router.get('/', auth, async (req, res) => {
  const agents = await ScheduleAgent.find({ userId: req.user.id }).sort({ createdAt: -1 });
  res.json(agents);
});

// Create schedule agent
router.post('/', auth, async (req, res) => {
  try {
    const { name, companyPolicyUrl, govtSourceUrls, cronExpression, alertEmail } = req.body;
    const agent = await ScheduleAgent.create({
      userId: req.user.id,
      name,
      companyPolicyUrl,
      govtSourceUrls: govtSourceUrls || [],
      cronExpression: cronExpression || '0 9 * * *',
      alertEmail,
    });
    res.json(agent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle active/pause
router.put('/:id/toggle', auth, async (req, res) => {
  const agent = await ScheduleAgent.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    [{ $set: { isActive: { $not: '$isActive' } } }],
    { new: true }
  );
  res.json(agent);
});

// Manual trigger - run now
router.post('/:id/run', auth, async (req, res) => {
  try {
    const agent = await ScheduleAgent.findOne({ _id: req.params.id, userId: req.user.id });
    if (!agent) return res.status(404).json({ error: 'Agent not found' });

    const { data } = await axios.post(`${process.env.AI_SERVICE_URL}/schedule/run`, {
      agentId: agent._id,
      companyPolicyUrl: agent.companyPolicyUrl,
      govtSourceUrls: agent.govtSourceUrls,
    });

    agent.lastRun = new Date();
    agent.lastResult = { hasConflict: data.hasConflict, summary: data.summary, checkedAt: new Date() };
    agent.runHistory.push({ runAt: new Date(), hasConflict: data.hasConflict, summary: data.summary });
    await agent.save();

    res.json({ agent, result: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete
router.delete('/:id', auth, async (req, res) => {
  await ScheduleAgent.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
  res.json({ success: true });
});

module.exports = router;
