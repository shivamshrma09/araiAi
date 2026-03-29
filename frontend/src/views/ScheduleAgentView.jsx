import { useState, useEffect } from 'react';
import { Plus, Play, Pause, Trash2, Clock, AlertCircle, CheckCircle2, Loader2, ChevronDown, X } from 'lucide-react';
import { getScheduleAgents, createScheduleAgent, toggleScheduleAgent, runScheduleAgent, deleteScheduleAgent } from '../api';

export default function ScheduleAgentView() {
  const [agents, setAgents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [running, setRunning] = useState({});
  const [expanded, setExpanded] = useState({});
  const [form, setForm] = useState({ name: '', companyPolicyUrl: '', govtSourceUrls: '', cronExpression: '0 9 * * *', alertEmail: '' });

  const load = async () => {
    try { const { data } = await getScheduleAgents(); setAgents(data); } catch {}
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createScheduleAgent({
        ...form,
        govtSourceUrls: form.govtSourceUrls.split('\n').map(s => s.trim()).filter(Boolean),
      });
      setShowForm(false);
      setForm({ name: '', companyPolicyUrl: '', govtSourceUrls: '', cronExpression: '0 9 * * *', alertEmail: '' });
      load();
    } catch (err) { alert(err.response?.data?.error || 'Failed'); }
  };

  const handleRun = async (id) => {
    setRunning(r => ({ ...r, [id]: true }));
    try { await runScheduleAgent(id); load(); } catch (err) { alert(err.response?.data?.error || 'Run failed'); }
    finally { setRunning(r => ({ ...r, [id]: false })); }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#000000' }}>

      {/* Header */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(115,115,115,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: '15px', fontWeight: 600, color: '#FAFAFA', letterSpacing: '-0.01em' }}>Schedule Agents</h1>
          <p style={{ fontSize: '11px', color: '#737373', marginTop: '3px' }}>Automatically monitor company policy vs government rules on a schedule</p>
        </div>
        <button onClick={() => setShowForm(f => !f)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px', background: showForm ? 'transparent' : '#172B4D', border: showForm ? '1px solid rgba(115,115,115,0.25)' : '1px solid rgba(59,130,246,0.3)', color: showForm ? '#737373' : '#FAFAFA', fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', boxShadow: showForm ? 'none' : '0 1px 8px rgba(23,43,77,0.4)' }}>
          {showForm ? <X size={13} /> : <Plus size={13} />}
          {showForm ? 'Cancel' : 'New Agent'}
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>

        {/* Create Form */}
        {showForm && (
          <form onSubmit={handleCreate} style={{ borderRadius: '16px', padding: '22px', background: '#0a0a0a', border: '1px solid rgba(115,115,115,0.25)', boxShadow: '0 0 0 1px rgba(255,255,255,0.02)', display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '4px' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#FAFAFA' }}>New Schedule Agent</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <F label="Agent Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="GST Policy Monitor" required span={2} />
              <F label="Company Policy URL (ImageKit PDF)" value={form.companyPolicyUrl} onChange={e => setForm(f => ({ ...f, companyPolicyUrl: e.target.value }))} placeholder="https://ik.imagekit.io/..." span={2} />
              <F label="Cron Expression" value={form.cronExpression} onChange={e => setForm(f => ({ ...f, cronExpression: e.target.value }))} placeholder="0 9 * * *" />
              <F label="Alert Email" type="email" value={form.alertEmail} onChange={e => setForm(f => ({ ...f, alertEmail: e.target.value }))} placeholder="hr@company.com" />
            </div>
            <div>
              <label style={lbl}>Govt Source URLs (one per line)</label>
              <textarea value={form.govtSourceUrls} onChange={e => setForm(f => ({ ...f, govtSourceUrls: e.target.value }))} placeholder={'https://www.gst.gov.in/\nhttps://labour.gov.in/'} rows={3} style={{ ...inp, resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', gap: '8px', paddingTop: '2px' }}>
              <button type="submit" style={{ padding: '9px 20px', borderRadius: '10px', background: 'linear-gradient(135deg, #172B4D 0%, #1e3a6e 100%)', border: '1px solid rgba(59,130,246,0.3)', color: '#FAFAFA', fontSize: '12px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 1px 8px rgba(23,43,77,0.5)' }}>Create Agent</button>
              <button type="button" onClick={() => setShowForm(false)} style={{ padding: '9px 16px', borderRadius: '10px', background: 'transparent', border: '1px solid rgba(115,115,115,0.25)', color: '#737373', fontSize: '12px', cursor: 'pointer' }}>Cancel</button>
            </div>
          </form>
        )}

        {agents.length === 0 && !showForm && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px' }}>
            <Clock size={32} color="#737373" style={{ marginBottom: '14px', opacity: 0.4 }} />
            <p style={{ fontSize: '14px', fontWeight: 500, color: '#737373', marginBottom: '6px' }}>No schedule agents yet</p>
            <p style={{ fontSize: '12px', color: '#505050' }}>Create one to automatically monitor policy changes</p>
          </div>
        )}

        {agents.map(agent => (
          <div key={agent._id} style={{ borderRadius: '12px', border: '1px solid rgba(115,115,115,0.2)', background: '#0a0a0a', overflow: 'hidden', transition: 'border-color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(115,115,115,0.35)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(115,115,115,0.2)'}
          >
            <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: agent.isActive ? '#22c55e' : '#505050', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#FAFAFA' }}>{agent.name}</p>
                <p style={{ fontSize: '11px', color: '#737373', marginTop: '2px' }}>
                  <span style={{ fontFamily: 'monospace', color: '#505050' }}>{agent.cronExpression}</span>
                  {' · '}Last run: {agent.lastRun ? new Date(agent.lastRun).toLocaleString() : 'Never'}
                </p>
              </div>

              {agent.lastResult && (
                <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', background: agent.lastResult.hasConflict ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)', color: agent.lastResult.hasConflict ? '#ef4444' : '#22c55e', border: `1px solid ${agent.lastResult.hasConflict ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)'}`, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {agent.lastResult.hasConflict ? <AlertCircle size={10} /> : <CheckCircle2 size={10} />}
                  {agent.lastResult.hasConflict ? 'Conflict' : 'Clear'}
                </span>
              )}

              <div style={{ display: 'flex', gap: '5px', flexShrink: 0 }}>
                <Btn onClick={() => handleRun(agent._id)} disabled={running[agent._id]} title="Run Now">
                  {running[agent._id] ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Play size={13} />}
                </Btn>
                <Btn onClick={async () => { await toggleScheduleAgent(agent._id); load(); }} title={agent.isActive ? 'Pause' : 'Resume'}>
                  {agent.isActive ? <Pause size={13} /> : <Play size={13} />}
                </Btn>
                <Btn onClick={() => setExpanded(x => ({ ...x, [agent._id]: !x[agent._id] }))}>
                  <ChevronDown size={13} style={{ transform: expanded[agent._id] ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </Btn>
                <Btn onClick={async () => { if (!window.confirm('Delete?')) return; await deleteScheduleAgent(agent._id); load(); }} danger>
                  <Trash2 size={13} />
                </Btn>
              </div>
            </div>

            {expanded[agent._id] && agent.lastResult && (
              <div style={{ padding: '14px 16px', borderTop: '1px solid rgba(115,115,115,0.12)', background: 'rgba(0,0,0,0.3)' }}>
                <p style={{ fontSize: '10px', fontWeight: 600, color: '#737373', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Last Result</p>
                <p style={{ fontSize: '12px', color: '#737373', lineHeight: 1.7 }}>{agent.lastResult.summary}</p>
                {agent.runHistory?.length > 0 && (
                  <div style={{ marginTop: '12px' }}>
                    <p style={{ fontSize: '10px', color: '#505050', marginBottom: '6px' }}>Run History</p>
                    {agent.runHistory.slice(-5).reverse().map((r, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 0', borderBottom: '1px solid rgba(115,115,115,0.08)' }}>
                        {r.hasConflict ? <AlertCircle size={10} color="#ef4444" /> : <CheckCircle2 size={10} color="#22c55e" />}
                        <span style={{ fontSize: '11px', color: '#505050' }}>{new Date(r.runAt).toLocaleString()}</span>
                        <span style={{ fontSize: '11px', color: r.hasConflict ? '#ef4444' : '#22c55e', marginLeft: 'auto' }}>{r.hasConflict ? 'Conflict found' : 'All clear'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Btn({ children, onClick, disabled, title, danger }) {
  return (
    <button onClick={onClick} disabled={disabled} title={title}
      style={{ width: 30, height: 30, borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: `1px solid ${danger ? 'rgba(239,68,68,0.2)' : 'rgba(115,115,115,0.2)'}`, color: danger ? '#ef4444' : '#737373', cursor: disabled ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', opacity: disabled ? 0.5 : 1 }}
      onMouseEnter={e => { if (!disabled) { e.currentTarget.style.background = danger ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = danger ? '#ef4444' : '#FAFAFA'; } }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = danger ? '#ef4444' : '#737373'; }}
    >{children}</button>
  );
}

function F({ label, span, ...props }) {
  return (
    <div style={{ gridColumn: span === 2 ? 'span 2' : 'span 1' }}>
      <label style={lbl}>{label}</label>
      <input {...props} style={inp} />
    </div>
  );
}

const lbl = { display: 'block', fontSize: '12px', fontWeight: 500, color: '#737373', marginBottom: '6px', fontFamily: "'Inter', sans-serif" };
const inp = { width: '100%', padding: '9px 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(115,115,115,0.25)', color: '#FAFAFA', fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif", transition: 'all 0.2s' };
