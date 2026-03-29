const router = require('express').Router();
const auth = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const CustomLinkSession = require('../models/CustomLinkSession');

// HR: Get all sessions
router.get('/', auth, async (req, res) => {
  const sessions = await CustomLinkSession.find({ userId: req.user.id }).sort({ createdAt: -1 });
  res.json(sessions);
});

// HR: Create new session → returns unique URL token
router.post('/create', auth, async (req, res) => {
  try {
    const {
      agentName, companyPolicyUrl, companyName, agentTone,
      employeeData, fieldsToCollect, expiryDays,
    } = req.body;

    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (expiryDays || 7));

    const session = await CustomLinkSession.create({
      userId: req.user.id,
      agentName: agentName || 'Employee Onboarding',
      companyPolicyUrl,
      companyName,
      agentTone: agentTone || 'friendly',
      token,
      employeeData,
      fieldsToCollect: fieldsToCollect || [],
      expiresAt,
    });

    res.json({
      session,
      agentUrl: `${process.env.CLIENT_URL}/agent/${token}`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// HR: Update session config (edit fields, policy, tone)
router.put('/:id', auth, async (req, res) => {
  const { agentName, companyPolicyUrl, agentTone, fieldsToCollect } = req.body;
  const session = await CustomLinkSession.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { agentName, companyPolicyUrl, agentTone, fieldsToCollect },
    { new: true }
  );
  res.json(session);
});

// HR: Delete session
router.delete('/:id', auth, async (req, res) => {
  await CustomLinkSession.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
  res.json({ success: true });
});

// PUBLIC: Employee opens link → validate token
router.get('/public/:token', async (req, res) => {
  const session = await CustomLinkSession.findOne({ token: req.params.token });
  if (!session) return res.status(404).json({ error: 'Invalid link' });
  if (new Date() > session.expiresAt) return res.status(410).json({ error: 'Link expired' });
  if (session.status === 'completed') return res.status(200).json({ session, alreadyCompleted: true });

  // Increment access count
  session.accessCount += 1;
  if (session.status === 'pending') session.status = 'in_progress';
  await session.save();

  res.json({ session });
});

// PUBLIC: Employee sends chat message
router.post('/public/:token/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const session = await CustomLinkSession.findOne({ token: req.params.token });
    if (!session) return res.status(404).json({ error: 'Invalid link' });
    if (new Date() > session.expiresAt) return res.status(410).json({ error: 'Link expired' });

    // Add user message to history
    session.chatHistory.push({ role: 'user', content: message });

    // Call AI service
    const { data } = await axios.post(`${process.env.AI_SERVICE_URL}/custom-link/chat`, {
      message,
      employeeData: session.employeeData,
      companyName: session.companyName,
      companyPolicyUrl: session.companyPolicyUrl,
      agentTone: session.agentTone,
      fieldsToCollect: session.fieldsToCollect,
      chatHistory: session.chatHistory.slice(-10), // last 10 messages for context
    }, { timeout: 30000 });

    // Add assistant response
    session.chatHistory.push({ role: 'assistant', content: data.reply });

    // Update collected fields if AI detected any
    if (data.collectedFields) {
      data.collectedFields.forEach(({ field, value }) => {
        const f = session.fieldsToCollect.find(x => x.field === field);
        if (f) { f.collected = true; f.value = value; }
      });
    }

    // Update completion percent
    const total = session.fieldsToCollect.length;
    const done = session.fieldsToCollect.filter(f => f.collected).length;
    session.completionPercent = total > 0 ? Math.round((done / total) * 100) : 0;
    if (session.completionPercent === 100) session.status = 'completed';

    await session.save();

    res.json({
      reply: data.reply,
      completionPercent: session.completionPercent,
      status: session.status,
      fieldsToCollect: session.fieldsToCollect,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
