import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({ baseURL: BASE });
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('aria_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// Auth
export const login = (email, password) => api.post('/api/auth/login', { email, password });
export const signup = (name, email, password) => api.post('/api/auth/signup', { name, email, password });

// Type 1: Schedule Agents
export const getScheduleAgents = () => api.get('/api/schedule');
export const createScheduleAgent = (data) => api.post('/api/schedule', data);
export const toggleScheduleAgent = (id) => api.put(`/api/schedule/${id}/toggle`);
export const runScheduleAgent = (id) => api.post(`/api/schedule/${id}/run`);
export const deleteScheduleAgent = (id) => api.delete(`/api/schedule/${id}`);

// Type 2: Pretrained Agents
export const getPretrainedRuns = (agentType) => api.get('/api/pretrained', { params: { agentType } });
export const getPretrainedRun = (id) => api.get(`/api/pretrained/${id}`);
export const runPretrainedAgent = (agentType, file) => {
  const form = new FormData();
  form.append('agentType', agentType);
  form.append('file', file);
  return api.post('/api/pretrained/run', form);
};
export const runPretrainedAgentUrl = (agentType, documentUrl) =>
  api.post('/api/pretrained/run', { agentType, documentUrl });
export const decidePretrainedRun = (id, decision) => api.put(`/api/pretrained/${id}/decision`, { decision });
export const sendEmail = (data) => api.post('/api/pretrained/send-email', data);

// Type 3: Custom Link Agents
export const getCustomLinkSessions = () => api.get('/api/custom-link');
export const createCustomLinkSession = (data) => api.post('/api/custom-link/create', data);
export const updateCustomLinkSession = (id, data) => api.put(`/api/custom-link/${id}`, data);
export const deleteCustomLinkSession = (id) => api.delete(`/api/custom-link/${id}`);

// Public (no auth)
export const getPublicSession = (token) => axios.get(`${BASE}/api/custom-link/public/${token}`);
export const sendPublicChat = (token, message) => axios.post(`${BASE}/api/custom-link/public/${token}/chat`, { message });
