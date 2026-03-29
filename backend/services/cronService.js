const cron = require('node-cron');
const axios = require('axios');
const ScheduleAgent = require('../models/ScheduleAgent');

// Map to store active cron jobs: agentId -> cron task
const activeCrons = new Map();

async function runAgent(agent) {
  try {
    const { data } = await axios.post(`${process.env.AI_SERVICE_URL}/schedule/run`, {
      agentId: agent._id,
      companyPolicyUrl: agent.companyPolicyUrl,
      govtSourceUrls: agent.govtSourceUrls,
    }, { timeout: 60000 });

    agent.lastRun = new Date();
    agent.lastResult = { hasConflict: data.hasConflict, summary: data.summary, checkedAt: new Date() };
    agent.runHistory.push({ runAt: new Date(), hasConflict: data.hasConflict, summary: data.summary });
    if (agent.runHistory.length > 30) agent.runHistory = agent.runHistory.slice(-30);
    await agent.save();
    console.log(`[Cron] Agent "${agent.name}" ran. Conflict: ${data.hasConflict}`);
  } catch (err) {
    console.error(`[Cron] Agent "${agent.name}" failed:`, err.message);
  }
}

function scheduleAgent(agent) {
  if (activeCrons.has(String(agent._id))) {
    activeCrons.get(String(agent._id)).stop();
  }
  if (!agent.isActive) return;

  try {
    const task = cron.schedule(agent.cronExpression, () => runAgent(agent));
    activeCrons.set(String(agent._id), task);
    console.log(`[Cron] Scheduled agent "${agent.name}" with "${agent.cronExpression}"`);
  } catch (err) {
    console.error(`[Cron] Invalid cron for agent "${agent.name}":`, err.message);
  }
}

async function initAllCrons() {
  const agents = await ScheduleAgent.find({ isActive: true });
  agents.forEach(scheduleAgent);
  console.log(`[Cron] Initialized ${agents.length} schedule agents`);
}

module.exports = { scheduleAgent, initAllCrons };
