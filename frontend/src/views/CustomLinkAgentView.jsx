import { useState, useEffect } from 'react';
import { Plus, Copy, Trash2, CheckCircle2, User, X, Link2, Edit2, Check } from 'lucide-react';
import { getCustomLinkSessions, createCustomLinkSession, updateCustomLinkSession, deleteCustomLinkSession } from '../api';

const DEFAULT_FIELDS = [
  { field: 'bank_account', question: 'What is your bank account number?', required: true, collected: false, value: '' },
  { field: 'ifsc_code', question: 'What is your bank IFSC code?', required: true, collected: false, value: '' },
  { field: 'address', question: 'What is your current residential address?', required: true, collected: false, value: '' },
  { field: 'emergency_contact', question: 'What is your emergency contact name and number?', required: true, collected: false, value: '' },
];

export default function CustomLinkAgentView() {
  const [sessions, setSessions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [copied, setCopied] = useState({});
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(defaultForm());

  function defaultForm() {
    return {
      agentName: 'Employee Onboarding',
      companyName: import.meta.env.VITE_COMPANY_NAME || '',
      companyPolicyUrl: import.meta.env.VITE_COMPANY_POLICY_URL || '',
      agentTone: 'friendly',
      expiryDays: 7,
      employeeData: { name: '', role: '', department: '', joiningDate: '', email: '', reportingManager: '' },
      fieldsToCollect: DEFAULT_FIELDS.map(f => ({ ...f })),
    };
  }

  const load = async () => {
    try { const { data } = await getCustomLinkSessions(); setSessions(data); } catch {}
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        agentName: 'Employee Onboarding',
        companyName: import.meta.env.VITE_COMPANY_NAME || '',
        companyPolicyUrl: import.meta.env.VITE_COMPANY_POLICY_URL || '',
        agentTone: 'friendly',
        expiryDays: 7,
        employeeData: form.employeeData,
        fieldsToCollect: DEFAULT_FIELDS.map(f => ({ ...f })),
      };
      const { data } = await createCustomLinkSession(payload);
      setSessions(s => [data.session, ...s]);
      setSelectedSession(data.session);
      setShowForm(false);
      setForm(defaultForm());
    } catch (err) { alert(err.response?.data?.error || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleUpdate = async () => {
    if (!selectedSession) return;
    setSaving(true);
    try {
      const { data } = await updateCustomLinkSession(selectedSession._id, {
        agentName: selectedSession.agentName,
        companyPolicyUrl: selectedSession.companyPolicyUrl,
        agentTone: selectedSession.agentTone,
        fieldsToCollect: selectedSession.fieldsToCollect,
      });
      setSelectedSession(data); load(); setEditMode(false);
    } catch {}
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this session?')) return;
    await deleteCustomLinkSession(id);
    if (selectedSession?._id === id) setSelectedSession(null);
    load();
  };

  const copyLink = (token, id) => {
    navigator.clipboard.writeText(`${window.location.origin}/agent/${token}`);
    setCopied(c => ({ ...c, [id]: true }));
    setTimeout(() => setCopied(c => ({ ...c, [id]: false })), 2000);
  };

  const statusColor = { pending: '#505050', in_progress: '#f59e0b', completed: '#22c55e' };

  return (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden', background: '#000000' }}>

      {/* Left: Sessions list */}
      <div style={{ width: '240px', flexShrink: 0, borderRight: '1px solid rgba(115,115,115,0.15)', display: 'flex', flexDirection: 'column', background: '#0a0a0a' }}>
        <div style={{ padding: '16px 12px', borderBottom: '1px solid rgba(115,115,115,0.15)' }}>
          <p style={{ fontSize: '13px', fontWeight: 600, color: '#FAFAFA' }}>Link Sessions</p>
          <p style={{ fontSize: '10px', color: '#737373', marginTop: '3px' }}>Select a template to get started</p>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
          <p style={{ fontSize: '10px', fontWeight: 600, color: '#737373', textTransform: 'uppercase', letterSpacing: '0.07em', padding: '4px 6px 8px' }}>Templates</p>

          {/* Fixed Employee Onboarding Template */}
          <button onClick={() => { setShowForm(true); setSelectedSession(null); setEditMode(false); }}
            style={{ width: '100%', textAlign: 'left', padding: '12px 10px', borderRadius: '10px', marginBottom: '8px', background: showForm ? '#172B4D' : 'rgba(255,255,255,0.03)', border: showForm ? '1px solid rgba(59,130,246,0.3)' : '1px solid rgba(115,115,115,0.2)', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => { if (!showForm) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(115,115,115,0.35)'; } }}
            onMouseLeave={e => { if (!showForm) { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(115,115,115,0.2)'; } }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <div style={{ width: 28, height: 28, borderRadius: '8px', background: '#172B4D', border: '1px solid rgba(59,130,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <User size={13} color="#FAFAFA" />
              </div>
              <p style={{ fontSize: '12px', fontWeight: 600, color: '#FAFAFA' }}>Employee Onboarding</p>
            </div>
            <p style={{ fontSize: '10px', color: '#737373', lineHeight: 1.5, paddingLeft: '36px' }}>Collects bank details, address &amp; emergency contact · Friendly tone</p>
          </button>

          {sessions.length > 0 && (
            <>
              <p style={{ fontSize: '10px', fontWeight: 600, color: '#737373', textTransform: 'uppercase', letterSpacing: '0.07em', padding: '8px 6px 6px' }}>Active Sessions</p>
              {sessions.map(s => (
                <button key={s._id} onClick={() => { setSelectedSession(s); setShowForm(false); setEditMode(false); }}
                  style={{ width: '100%', textAlign: 'left', padding: '9px 10px', borderRadius: '8px', marginBottom: '2px', background: selectedSession?._id === s._id ? 'rgba(255,255,255,0.06)' : 'transparent', border: 'none', cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={e => { if (selectedSession?._id !== s._id) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                  onMouseLeave={e => { if (selectedSession?._id !== s._id) e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor[s.status] || '#505050', flexShrink: 0 }} />
                    <p style={{ fontSize: '12px', fontWeight: 500, color: '#FAFAFA', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.employeeData?.name || 'Employee'}</p>
                  </div>
                  <p style={{ fontSize: '10px', color: '#505050', marginTop: '2px', paddingLeft: '14px' }}>{s.employeeData?.role || ''} · {s.completionPercent || 0}% done</p>
                </button>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Right */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Create Form */}
        {showForm && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
            <div style={{ maxWidth: '480px', margin: '0 auto' }}>

              {/* Template Card */}
              <div style={{ borderRadius: '12px', padding: '16px', background: '#0a0a0a', border: '1px solid rgba(115,115,115,0.25)', boxShadow: '0 0 0 1px rgba(255,255,255,0.02)', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '10px', background: '#172B4D', border: '1px solid rgba(59,130,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <User size={16} color="#FAFAFA" />
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: '#FAFAFA' }}>Employee Onboarding</p>
                    <p style={{ fontSize: '11px', color: '#737373', marginTop: '2px' }}>Friendly tone · 7 day link expiry</p>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', paddingTop: '4px', borderTop: '1px solid rgba(115,115,115,0.12)' }}>
                  {DEFAULT_FIELDS.map((f, i) => (
                    <span key={i} style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(115,115,115,0.2)', color: '#737373' }}>
                      {f.field.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>

              {/* Employee Data Form */}
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#FAFAFA', marginBottom: '14px' }}>Employee Data</p>
              <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {[['name', 'Full Name *'], ['role', 'Role'], ['department', 'Department'], ['email', 'Email'], ['reportingManager', 'Reporting Manager']].map(([k, l]) => (
                    <div key={k} style={{ gridColumn: k === 'name' ? 'span 2' : 'span 1' }}>
                      <label style={lbl}>{l}</label>
                      <input value={form.employeeData[k]} onChange={e => setForm(f => ({ ...f, employeeData: { ...f.employeeData, [k]: e.target.value } }))} required={k === 'name'} style={inp}
                        onFocus={e => { e.target.style.borderColor = 'rgba(59,130,246,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(23,43,77,0.25)'; }}
                        onBlur={e => { e.target.style.borderColor = 'rgba(115,115,115,0.25)'; e.target.style.boxShadow = 'none'; }}
                      />
                    </div>
                  ))}
                  <div>
                    <label style={lbl}>Joining Date</label>
                    <input type="date" value={form.employeeData.joiningDate} onChange={e => setForm(f => ({ ...f, employeeData: { ...f.employeeData, joiningDate: e.target.value } }))} style={inp}
                      onFocus={e => { e.target.style.borderColor = 'rgba(59,130,246,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(23,43,77,0.25)'; }}
                      onBlur={e => { e.target.style.borderColor = 'rgba(115,115,115,0.25)'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                </div>

                <button type="submit" disabled={saving} style={{ marginTop: '4px', padding: '11px', borderRadius: '10px', background: 'linear-gradient(135deg, #172B4D 0%, #1e3a6e 100%)', border: '1px solid rgba(59,130,246,0.3)', color: '#FAFAFA', fontSize: '13px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 1px 8px rgba(23,43,77,0.5)', transition: 'opacity 0.2s' }}
                  onMouseEnter={e => { if (!saving) e.currentTarget.style.opacity = '0.9'; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                >
                  <Link2 size={14} /> {saving ? 'Creating…' : 'Generate Unique Link'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Session Detail */}
        {selectedSession && !showForm && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
            <div style={{ maxWidth: '560px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#FAFAFA' }}>{selectedSession.employeeData?.name || 'Employee'}</h2>
                  <p style={{ fontSize: '12px', color: '#737373', marginTop: '3px' }}>{selectedSession.employeeData?.role}{selectedSession.employeeData?.department ? ` · ${selectedSession.employeeData.department}` : ''}</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => setEditMode(e => !e)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '8px', background: 'transparent', border: '1px solid rgba(115,115,115,0.25)', color: '#737373', fontSize: '11px', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(115,115,115,0.4)'; e.currentTarget.style.color = '#FAFAFA'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(115,115,115,0.25)'; e.currentTarget.style.color = '#737373'; }}
                  >
                    <Edit2 size={11} /> {editMode ? 'Cancel' : 'Edit'}
                  </button>
                  <button onClick={() => handleDelete(selectedSession._id)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '8px', background: 'transparent', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: '11px', cursor: 'pointer' }}>
                    <Trash2 size={11} /> Delete
                  </button>
                </div>
              </div>

              {/* Link Card */}
              <div style={{ borderRadius: '12px', padding: '16px', background: '#0a0a0a', border: '1px solid rgba(115,115,115,0.25)', boxShadow: '0 0 0 1px rgba(255,255,255,0.02)' }}>
                <p style={{ fontSize: '11px', fontWeight: 600, color: '#737373', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>Unique Agent Link</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <code style={{ flex: 1, fontSize: '11px', color: '#FAFAFA', background: 'rgba(255,255,255,0.04)', padding: '8px 12px', borderRadius: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', border: '1px solid rgba(115,115,115,0.2)' }}>
                    {window.location.origin}/agent/{selectedSession.token}
                  </code>
                  <button onClick={() => copyLink(selectedSession.token, selectedSession._id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 14px', borderRadius: '8px', background: copied[selectedSession._id] ? 'rgba(34,197,94,0.08)' : '#172B4D', border: `1px solid ${copied[selectedSession._id] ? 'rgba(34,197,94,0.3)' : 'rgba(59,130,246,0.3)'}`, color: copied[selectedSession._id] ? '#22c55e' : '#FAFAFA', fontSize: '11px', fontWeight: 600, cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s' }}>
                    {copied[selectedSession._id] ? <Check size={11} /> : <Copy size={11} />}
                    {copied[selectedSession._id] ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <p style={{ fontSize: '10px', color: '#505050', marginTop: '8px' }}>
                  Expires: {new Date(selectedSession.expiresAt).toLocaleDateString()} · Accessed: {selectedSession.accessCount} times
                </p>
              </div>

              {/* Completion */}
              <div style={{ borderRadius: '12px', padding: '16px', background: '#0a0a0a', border: '1px solid rgba(115,115,115,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: '#FAFAFA' }}>Completion</p>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: statusColor[selectedSession.status] || '#505050' }}>{selectedSession.completionPercent || 0}%</span>
                </div>
                <div style={{ height: '3px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: '3px', width: `${selectedSession.completionPercent || 0}%`, background: selectedSession.status === 'completed' ? '#22c55e' : '#172B4D', transition: 'width 0.5s', boxShadow: selectedSession.status === 'completed' ? 'none' : '0 0 8px rgba(23,43,77,0.8)' }} />
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
                  {(selectedSession.fieldsToCollect || []).map((f, i) => (
                    <span key={i} style={{ fontSize: '11px', padding: '3px 9px', borderRadius: '20px', background: f.collected ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.04)', color: f.collected ? '#22c55e' : '#737373', border: `1px solid ${f.collected ? 'rgba(34,197,94,0.2)' : 'rgba(115,115,115,0.2)'}`, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {f.collected ? <Check size={9} /> : null}
                      {f.field.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>

              {/* Edit mode */}
              {editMode && (
                <div style={{ borderRadius: '12px', padding: '16px', background: '#0a0a0a', border: '1px solid rgba(115,115,115,0.25)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: '#FAFAFA' }}>Edit Session</p>
                  <Row label="Agent Name" value={selectedSession.agentName} onChange={v => setSelectedSession(s => ({ ...s, agentName: v }))} />
                  <Row label="Company Policy URL" value={selectedSession.companyPolicyUrl || ''} onChange={v => setSelectedSession(s => ({ ...s, companyPolicyUrl: v }))} />
                  <div>
                    <label style={lbl}>Tone</label>
                    <select value={selectedSession.agentTone} onChange={e => setSelectedSession(s => ({ ...s, agentTone: e.target.value }))} style={sel}>
                      <option value="friendly">Friendly</option>
                      <option value="formal">Formal</option>
                    </select>
                  </div>
                  <button onClick={handleUpdate} disabled={saving} style={{ padding: '9px', borderRadius: '10px', background: 'linear-gradient(135deg, #172B4D 0%, #1e3a6e 100%)', border: '1px solid rgba(59,130,246,0.3)', color: '#FAFAFA', fontSize: '12px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 1px 8px rgba(23,43,77,0.5)' }}>
                    {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              )}

              {/* Chat history */}
              {selectedSession.chatHistory?.length > 0 && (
                <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(115,115,115,0.2)' }}>
                  <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(115,115,115,0.15)', background: '#0a0a0a' }}>
                    <p style={{ fontSize: '11px', fontWeight: 600, color: '#737373', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Chat History · {selectedSession.chatHistory.length} messages</p>
                  </div>
                  <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto', background: '#000' }}>
                    {selectedSession.chatHistory.slice(-6).map((m, i) => (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                        <div style={{ background: m.role === 'user' ? '#172B4D' : 'rgba(255,255,255,0.05)', border: m.role === 'user' ? '1px solid rgba(59,130,246,0.3)' : '1px solid rgba(115,115,115,0.2)', padding: '8px 12px', borderRadius: '10px', maxWidth: '85%' }}>
                          <p style={{ fontSize: '12px', color: '#FAFAFA', lineHeight: 1.5 }}>{m.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {!showForm && !selectedSession && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <User size={32} color="#737373" style={{ marginBottom: '14px', opacity: 0.3 }} />
            <p style={{ fontSize: '14px', fontWeight: 500, color: '#737373', marginBottom: '6px' }}>Custom Link Agents</p>
            <p style={{ fontSize: '12px', color: '#505050' }}>Create a session to generate a unique onboarding link</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Sec({ title, children }) {
  return (
    <div style={{ borderRadius: '12px', padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(115,115,115,0.2)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <p style={{ fontSize: '11px', fontWeight: 600, color: '#737373', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{title}</p>
      {children}
    </div>
  );
}

function Row({ label, value, onChange, ...props }) {
  return (
    <div>
      <label style={lbl}>{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} style={inp} {...props} />
    </div>
  );
}

function AddField({ onAdd }) {
  const [field, setField] = useState('');
  const [question, setQuestion] = useState('');
  return (
    <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-end', paddingTop: '4px' }}>
      <div style={{ flex: 1 }}>
        <label style={lbl}>Field name</label>
        <input value={field} onChange={e => setField(e.target.value)} placeholder="pan_number" style={inp} />
      </div>
      <div style={{ flex: 2 }}>
        <label style={lbl}>Question to ask</label>
        <input value={question} onChange={e => setQuestion(e.target.value)} placeholder="What is your PAN number?" style={inp} />
      </div>
      <button type="button" onClick={() => { if (field && question) { onAdd({ field, question, required: true }); setField(''); setQuestion(''); } }}
        style={{ padding: '9px 14px', borderRadius: '8px', background: '#172B4D', border: '1px solid rgba(59,130,246,0.3)', color: '#FAFAFA', fontSize: '12px', fontWeight: 600, cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}>
        + Add
      </button>
    </div>
  );
}

const lbl = { display: 'block', fontSize: '12px', fontWeight: 500, color: '#737373', marginBottom: '6px', fontFamily: "'Inter', sans-serif" };
const inp = { width: '100%', padding: '9px 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(115,115,115,0.25)', color: '#FAFAFA', fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif", transition: 'all 0.2s' };
const sel = { width: '100%', padding: '9px 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(115,115,115,0.25)', color: '#FAFAFA', fontSize: '13px', outline: 'none', cursor: 'pointer', fontFamily: "'Inter', sans-serif" };
