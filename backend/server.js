require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const { initAllCrons } = require('./services/cronService');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL, credentials: true },
});

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/schedule', require('./routes/scheduleAgent'));
app.use('/api/pretrained', require('./routes/pretrainedAgent'));
app.use('/api/custom-link', require('./routes/customLinkAgent'));

// Socket.io for real-time pretrained run updates
io.on('connection', (socket) => {
  socket.on('subscribe', (runId) => socket.join(`run_${runId}`));
});
app.set('io', io);

app.get('/health', (_, res) => res.json({ status: 'ok' }));

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected');
    await initAllCrons();
    server.listen(process.env.PORT || 3001, () => {
      console.log(`Server running on port ${process.env.PORT || 3001}`);
    });
  })
  .catch(err => { console.error('MongoDB error:', err); process.exit(1); });
