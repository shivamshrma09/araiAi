const router = require('express').Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const PretrainedRun = require('../models/PretrainedRun');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

// Get all runs for user
router.get('/', auth, async (req, res) => {
  const { agentType } = req.query;
  const filter = { userId: req.user.id };
  if (agentType) filter.agentType = agentType;
  const runs = await PretrainedRun.find(filter).sort({ createdAt: -1 }).limit(50);
  res.json(runs);
});

// Get single run
router.get('/:id', auth, async (req, res) => {
  const run = await PretrainedRun.findOne({ _id: req.params.id, userId: req.user.id });
  if (!run) return res.status(404).json({ error: 'Not found' });
  res.json(run);
});

// Run pretrained agent with PDF upload
router.post('/run', auth, upload.single('file'), async (req, res) => {
  try {
    const { agentType, documentUrl } = req.body;
    if (!agentType) return res.status(400).json({ error: 'agentType required' });

    // Create run record
    const run = await PretrainedRun.create({
      userId: req.user.id,
      agentType,
      originalFileName: req.file?.originalname || 'document',
      documentUrl: documentUrl || null,
      status: 'processing',
    });

    // Send to AI service async
    res.json({ runId: run._id, status: 'processing' });

    // Process in background
    (async () => {
      try {
        let aiResponse;
        if (req.file) {
          const form = new FormData();
          form.append('file', req.file.buffer, { filename: req.file.originalname, contentType: req.file.mimetype });
          form.append('agentType', agentType);
          form.append('runId', run._id.toString());
          const { data } = await axios.post(`${process.env.AI_SERVICE_URL}/pretrained/run`, form, {
            headers: form.getHeaders(),
            timeout: 120000,
          });
          aiResponse = data;
        } else if (documentUrl) {
          const { data } = await axios.post(`${process.env.AI_SERVICE_URL}/pretrained/run-url`, {
            documentUrl, agentType, runId: run._id.toString(),
          }, { timeout: 120000 });
          aiResponse = data;
        }

        await PretrainedRun.findByIdAndUpdate(run._id, {
          status: 'awaiting_approval',
          extractedData: aiResponse.extractedData,
          complianceResult: aiResponse.complianceResult,
          riskResult: aiResponse.riskResult,
          auditLog: aiResponse.auditLog,
          retryCount: aiResponse.retryCount || 0,
          finalOutput: aiResponse.finalOutput,
        });
      } catch (err) {
        await PretrainedRun.findByIdAndUpdate(run._id, {
          status: 'error',
          errorMessage: err.message,
        });
      }
    })();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Send Email via AI agent
router.post('/send-email', auth, async (req, res) => {
  try {
    const { to, subject, content } = req.body;
    if (!to || !subject || !content) return res.status(400).json({ error: 'to, subject, content required' });
    const { data } = await axios.post(`${process.env.AI_SERVICE_URL}/email/send`, { to, subject, content }, { timeout: 30000 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.response?.data?.detail || err.message });
  }
});

// Approve / Reject
router.put('/:id/decision', auth, async (req, res) => {
  const { decision } = req.body; // 'approved' | 'rejected'
  const run = await PretrainedRun.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { status: decision },
    { new: true }
  );
  res.json(run);
});

// Get PDF (if stored locally)
router.get('/:id/pdf', auth, async (req, res) => {
  res.status(404).json({ error: 'PDF served from ImageKit URL directly' });
});

module.exports = router;
