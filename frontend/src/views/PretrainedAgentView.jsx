import { useState, useEffect, useRef } from 'react';
import { Upload, Loader2, CheckCircle2, XCircle, ChevronDown, Receipt, Users, Scale, Mail, Send } from 'lucide-react';
import { getPretrainedRuns, getPretrainedRun, runPretrainedAgent, decidePretrainedRun, sendEmail } from '../api';

const AGENTS = [
  { type: 'invoice', label: 'Invoice Processing', Icon: Receipt, desc: 'Extract vendor, amount, GST, dates from invoices' },
  { type: 'vendor_onboarding', label: 'Vendor Onboarding', Icon: Users, desc: 'Validate vendor contracts for compliance & risk' },
  { type: 'contract_review', label: 'Contract Review', Icon: Scale, desc: 'Review contracts for legal clauses & risk' },
  { type: 'email_sender', label: 'Email Sender', Icon: Mail, desc: 'Compose and send emails via AI agent' },
];

const statusMeta = {
  approved:          { color: '#22c55e', label: 'Approved' },
  awaiting_approval: { color: '#3b82f6', label: 'Pending' },
  processing:        { color: '#f59e0b', label: 'Processing' },
  rejected:          { color: '#737373', label: 'Rejected' },
  error:             { color: '#ef4444', label: 'Error' },
};

export default function PretrainedAgentView() {
  const [activeType, setActiveType] = useState('invoice');
  const [runs, setRuns] = useState([]);
  const [selectedRun, setSelectedRun] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [deciding, setDeciding] = useState(false);
  const [emailForm, setEmailForm] = useState({ to: '', subject: '', content: '' });
  const [emailSending, setEmailSending] = useState(false);
  const [emailResult, setEmailResult] = useState(null);
  const fileRef = useRef();
  const pollRef = useRef();

  const loadRuns = async () => {
    try { const { data } = await getPretrainedRuns(activeType); setRuns(data); } catch {}
  };

  useEffect(() => { loadRuns(); setSelectedRun(null); setEmailResult(null); }, [activeType]);

  useEffect(() => {
    clearInterval(pollRef.current);
    if (selectedRun?.status === 'processing') {
      pollRef.current = setInterval(async () => {
        try {
          const { data } = await getPretrainedRun(selectedRun._id);
          setSelectedRun(data);
          if (data.status !== 'processing') { clearInterval(pollRef.current); loadRuns(); }
        } catch {}
      }, 3000);
    }
    return () => clearInterval(pollRef.current);
  }, [selectedRun?._id, selectedRun?.status]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const { data } = await runPretrainedAgent(activeType, file);
      const optimistic = { _id: data.runId, status: 'processing', agentType: activeType, originalFileName: file.name, createdAt: new Date() };
      setSelectedRun(optimistic);
      setRuns(r => [optimistic, ...r]);
    } catch (err) { alert(err.response?.data?.error || 'Upload failed'); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ''; }
  };

  const handleDecision = async (decision) => {
    if (!selectedRun) return;
    setDeciding(true);
    try {
      const { data } = await decidePretrainedRun(selectedRun._id, decision);
      setSelectedRun(data); loadRuns();
    } catch {}
    finally { setDeciding(false); }
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    setEmailSending(true);
    setEmailResult(null);
    try {
      const { data } = await sendEmail(emailForm);
      setEmailResult({ success: true, message: data.message || 'Email sent successfully!' });
      setEmailForm({ to: '', subject: '', content: '' });
    } catch (err) {
      setEmailResult({ success: false, message: err.response?.data?.error || 'Failed to send email' });
    } finally { setEmailSending(false); }
  };

  const active = AGENTS.find(a => a.type === activeType);

  return (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden', background: '#000000' }}>

      {/* Left panel */}
      <div style={{ width: '220px', flexShrink: 0, borderRight: '1px solid rgba(115,115,115,0.15)', display: 'flex', flexDirection: 'column', background: '#0a0a0a' }}>
        <div style={{ padding: '16px 12px', borderBottom: '1px solid rgba(115,115,115,0.15)' }}>
          <p style={{ fontSize: '10px', fontWeight: 600, color: '#737373', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '10px', paddingLeft: '4px' }}>Agent Type</p>
          {AGENTS.map(a => (
            <button key={a.type} onClick={() => setActiveType(a.type)}
              style={{ width: '100%', textAlign: 'left', padding: '9px 10px', borderRadius: '10px', marginBottom: '3px', background: activeType === a.type ? '#172B4D' : 'transparent', border: activeType === a.type ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '9px', transition: 'all 0.2s' }}
              onMouseEnter={e => { if (activeType !== a.type) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
              onMouseLeave={e => { if (activeType !== a.type) e.currentTarget.style.background = 'transparent'; }}
            >
              <a.Icon size={13} color={activeType === a.type ? '#FAFAFA' : '#737373'} />
              <p style={{ fontSize: '12px', fontWeight: activeType === a.type ? 600 : 400, color: activeType === a.type ? '#FAFAFA' : '#737373', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.label}</p>
            </button>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 8px' }}>
          <p style={{ fontSize: '10px', fontWeight: 600, color: '#737373', textTransform: 'uppercase', letterSpacing: '0.07em', padding: '4px 6px 8px' }}>Recent Runs</p>
          {runs.length === 0 && <p style={{ fontSize: '11px', color: '#505050', padding: '4px 6px' }}>No runs yet</p>}
          {runs.map(r => {
            const sm = statusMeta[r.status] || { color: '#505050', label: r.status };
            return (
              <button key={r._id} onClick={() => setSelectedRun(r)}
                style={{ width: '100%', textAlign: 'left', padding: '8px 10px', borderRadius: '8px', marginBottom: '2px', background: selectedRun?._id === r._id ? 'rgba(255,255,255,0.06)' : 'transparent', border: 'none', cursor: 'pointer', transition: 'background 0.15s' }}
                onMouseEnter={e => { if (selectedRun?._id !== r._id) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                onMouseLeave={e => { if (selectedRun?._id !== r._id) e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: sm.color }} />
                  <span style={{ fontSize: '12px', color: '#a0a0a0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{r.originalFileName || 'Document'}</span>
                </div>
                <p style={{ fontSize: '10px', color: '#505050', marginTop: '2px', paddingLeft: '13px' }}>{sm.label}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(115,115,115,0.15)', display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          <active.Icon size={16} color="#737373" />
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '14px', fontWeight: 600, color: '#FAFAFA' }}>{active.label}</h1>
            <p style={{ fontSize: '11px', color: '#737373', marginTop: '1px' }}>{active.desc}</p>
          </div>
          <button onClick={() => fileRef.current?.click()} disabled={uploading || activeType === 'email_sender'}
            style={{ display: activeType === 'email_sender' ? 'none' : 'flex', alignItems: 'center', gap: '7px', padding: '8px 16px', borderRadius: '10px', background: uploading ? 'rgba(255,255,255,0.04)' : '#172B4D', border: '1px solid rgba(59,130,246,0.3)', color: uploading ? '#737373' : '#FAFAFA', fontSize: '12px', fontWeight: 600, cursor: uploading ? 'not-allowed' : 'pointer', transition: 'all 0.2s', boxShadow: uploading ? 'none' : '0 1px 8px rgba(23,43,77,0.4)' }}>
            {uploading ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Upload size={13} />}
            {uploading ? 'Uploading…' : 'Upload PDF'}
          </button>
          <input ref={fileRef} type="file" accept=".pdf" onChange={handleUpload} style={{ display: 'none' }} />
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '600px', margin: '0 auto', width: '100%' }}>

          {/* Email Sender UI */}
          {activeType === 'email_sender' && (
            <>
              <form onSubmit={handleSendEmail} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ borderRadius: '14px', padding: '20px', background: '#0a0a0a', border: '1px solid rgba(115,115,115,0.25)', boxShadow: '0 0 0 1px rgba(255,255,255,0.02)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '12px', borderBottom: '1px solid rgba(115,115,115,0.12)' }}>
                    <Mail size={15} color="#737373" />
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#FAFAFA' }}>Compose Email</p>
                  </div>

                  <div>
                    <label style={lbl}>To</label>
                    <input value={emailForm.to} onChange={e => setEmailForm(f => ({ ...f, to: e.target.value }))} placeholder="recipient@company.com" required type="email" style={inp}
                      onFocus={e => { e.target.style.borderColor = 'rgba(59,130,246,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(23,43,77,0.25)'; }}
                      onBlur={e => { e.target.style.borderColor = 'rgba(115,115,115,0.25)'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>

                  <div>
                    <label style={lbl}>Subject</label>
                    <input value={emailForm.subject} onChange={e => setEmailForm(f => ({ ...f, subject: e.target.value }))} placeholder="Email subject" required style={inp}
                      onFocus={e => { e.target.style.borderColor = 'rgba(59,130,246,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(23,43,77,0.25)'; }}
                      onBlur={e => { e.target.style.borderColor = 'rgba(115,115,115,0.25)'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>

                  <div>
                    <label style={lbl}>Content</label>
                    <textarea value={emailForm.content} onChange={e => setEmailForm(f => ({ ...f, content: e.target.value }))} placeholder="Write your email content here... The AI agent will refine and send it." required rows={8}
                      style={{ ...inp, resize: 'vertical', lineHeight: 1.6 }}
                      onFocus={e => { e.target.style.borderColor = 'rgba(59,130,246,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(23,43,77,0.25)'; }}
                      onBlur={e => { e.target.style.borderColor = 'rgba(115,115,115,0.25)'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>

                  <button type="submit" disabled={emailSending}
                    style={{ padding: '10px', borderRadius: '10px', background: emailSending ? 'rgba(255,255,255,0.04)' : 'linear-gradient(135deg, #172B4D 0%, #1e3a6e 100%)', border: '1px solid rgba(59,130,246,0.3)', color: emailSending ? '#737373' : '#FAFAFA', fontSize: '13px', fontWeight: 600, cursor: emailSending ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: emailSending ? 'none' : '0 1px 8px rgba(23,43,77,0.5)', transition: 'all 0.2s' }}
                    onMouseEnter={e => { if (!emailSending) e.currentTarget.style.opacity = '0.9'; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                  >
                    {emailSending ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={14} />}
                    {emailSending ? 'Sending…' : 'Send Email'}
                  </button>
                </div>
              </form>

              {emailResult && (
                <div style={{ borderRadius: '12px', padding: '14px 16px', background: emailResult.success ? 'rgba(34,197,94,0.05)' : 'rgba(239,68,68,0.05)', border: `1px solid ${emailResult.success ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {emailResult.success ? <CheckCircle2 size={15} color="#22c55e" /> : <XCircle size={15} color="#ef4444" />}
                  <span style={{ fontSize: '13px', fontWeight: 500, color: emailResult.success ? '#22c55e' : '#ef4444' }}>{emailResult.message}</span>
                </div>
              )}
            </>
          )}

          {/* Other agents UI */}
          {activeType !== 'email_sender' && (
            <>
          {!selectedRun && (
            <div onClick={() => fileRef.current?.click()}
              style={{ border: '1px dashed rgba(115,115,115,0.3)', borderRadius: '14px', padding: '60px 32px', cursor: 'pointer', textAlign: 'center', background: 'rgba(255,255,255,0.01)', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(115,115,115,0.5)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(115,115,115,0.3)'; e.currentTarget.style.background = 'rgba(255,255,255,0.01)'; }}
            >
              <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(115,115,115,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <Upload size={18} color="#737373" />
              </div>
              <p style={{ fontSize: '14px', fontWeight: 600, color: '#FAFAFA', marginBottom: '6px' }}>Upload PDF to run {active.label}</p>
              <p style={{ fontSize: '12px', color: '#505050' }}>PDF only · AI agents will process automatically</p>
            </div>
          )}

          {selectedRun?.status === 'processing' && (
            <div style={{ borderRadius: '14px', padding: '40px 32px', textAlign: 'center', background: '#0a0a0a', border: '1px solid rgba(115,115,115,0.2)' }}>
              <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(115,115,115,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <Loader2 size={18} color="#737373" style={{ animation: 'spin 1s linear infinite' }} />
              </div>
              <p style={{ fontSize: '14px', fontWeight: 600, color: '#FAFAFA', marginBottom: '6px' }}>AI Agents Processing</p>
              <p style={{ fontSize: '12px', color: '#505050' }}>Extraction → Compliance → Risk Assessment</p>
            </div>
          )}

          {selectedRun?.status === 'error' && (
            <div style={{ borderRadius: '12px', padding: '16px', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <XCircle size={15} color="#ef4444" style={{ flexShrink: 0, marginTop: '1px' }} />
              <div>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#ef4444', marginBottom: '3px' }}>Processing Failed</p>
                <p style={{ fontSize: '12px', color: '#ef4444', opacity: 0.7 }}>{selectedRun.errorMessage}</p>
              </div>
            </div>
          )}

          {selectedRun?.extractedData && <DataCard title="Extracted Data" data={selectedRun.extractedData} />}
          {selectedRun?.complianceResult && <ComplianceCard data={selectedRun.complianceResult} />}
          {selectedRun?.riskResult && <RiskCard data={selectedRun.riskResult} retryCount={selectedRun.retryCount} />}

          {selectedRun?.auditLog?.length > 0 && (
            <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(115,115,115,0.2)', background: '#0a0a0a' }}>
              <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(115,115,115,0.15)', display: 'flex', justifyContent: 'space-between' }}>
                <p style={{ fontSize: '11px', fontWeight: 600, color: '#737373', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Audit Log</p>
                <span style={{ fontSize: '11px', color: '#505050' }}>{selectedRun.auditLog.length} agents</span>
              </div>
              {selectedRun.auditLog.map((log, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '9px 16px', borderBottom: i < selectedRun.auditLog.length - 1 ? '1px solid rgba(115,115,115,0.1)' : 'none' }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <CheckCircle2 size={10} color="#22c55e" />
                  </div>
                  <span style={{ fontSize: '12px', color: '#737373', fontWeight: 500, flex: 1 }}>{log.agent}</span>
                  <span style={{ fontSize: '10px', color: '#505050', fontFamily: 'monospace' }}>{log.timeTakenSec?.toFixed(1)}s</span>
                </div>
              ))}
            </div>
          )}

          {selectedRun?.status === 'awaiting_approval' && (
            <div style={{ borderRadius: '12px', padding: '16px', background: '#0a0a0a', border: '1px solid rgba(115,115,115,0.2)' }}>
              <p style={{ fontSize: '14px', fontWeight: 600, color: '#FAFAFA', marginBottom: '14px' }}>Ready for approval</p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => handleDecision('approved')} disabled={deciding}
                  style={{ flex: 1, padding: '9px', borderRadius: '9px', fontSize: '13px', fontWeight: 600, color: '#FAFAFA', background: 'linear-gradient(135deg, #172B4D 0%, #1e3a6e 100%)', border: '1px solid rgba(59,130,246,0.3)', cursor: 'pointer', boxShadow: '0 1px 8px rgba(23,43,77,0.5)' }}>
                  ✓ Approve
                </button>
                <button onClick={() => handleDecision('rejected')} disabled={deciding}
                  style={{ flex: 1, padding: '9px', borderRadius: '9px', fontSize: '13px', fontWeight: 500, color: '#737373', background: 'transparent', border: '1px solid rgba(115,115,115,0.25)', cursor: 'pointer' }}>
                  Reject
                </button>
              </div>
            </div>
          )}

          {selectedRun?.status === 'approved' && (
            <div style={{ borderRadius: '12px', padding: '14px 16px', background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={15} color="#22c55e" />
              <span style={{ fontSize: '13px', fontWeight: 500, color: '#22c55e' }}>Approved and processed.</span>
            </div>
          )}
          {selectedRun?.status === 'rejected' && (
            <div style={{ borderRadius: '12px', padding: '14px 16px', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <XCircle size={15} color="#ef4444" />
              <span style={{ fontSize: '13px', fontWeight: 500, color: '#ef4444' }}>Rejected.</span>
            </div>
          )}
          </>
          )}
        </div>
      </div>
    </div>
  );
}

function DataCard({ title, data }) {
  const [open, setOpen] = useState(true);
  const entries = Object.entries(data).filter(([, v]) => v !== null && v !== undefined && v !== '');
  return (
    <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(115,115,115,0.2)', background: '#0a0a0a' }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: '100%', padding: '10px 16px', borderBottom: open ? '1px solid rgba(115,115,115,0.15)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer' }}>
        <p style={{ fontSize: '11px', fontWeight: 600, color: '#737373', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{title}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: '#505050' }}>{entries.length} fields</span>
          <ChevronDown size={12} color="#505050" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </div>
      </button>
      {open && entries.map(([k, v]) => (
        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '8px 16px', borderBottom: '1px solid rgba(115,115,115,0.06)' }}>
          <span style={{ fontSize: '12px', color: '#737373', textTransform: 'capitalize' }}>{k.replace(/_/g, ' ')}</span>
          <span style={{ fontSize: '12px', color: '#FAFAFA', fontWeight: 500, maxWidth: '60%', textAlign: 'right', wordBreak: 'break-word' }}>
            {typeof v === 'object' ? JSON.stringify(v) : String(v)}
          </span>
        </div>
      ))}
    </div>
  );
}

function ComplianceCard({ data }) {
  const passed = data.passed && !data.issues?.length;
  return (
    <div style={{ borderRadius: '12px', overflow: 'hidden', border: `1px solid ${passed ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`, background: passed ? 'rgba(34,197,94,0.04)' : 'rgba(239,68,68,0.04)' }}>
      <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(115,115,115,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ fontSize: '11px', fontWeight: 600, color: '#737373', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Compliance</p>
        <span style={{ fontSize: '11px', fontWeight: 600, color: passed ? '#22c55e' : '#ef4444' }}>{passed ? '✓ Passed' : '✗ Failed'}</span>
      </div>
      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {(data.issues || []).map((issue, i) => <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#ef4444', lineHeight: 1.5 }}><span>⚠</span><span>{issue}</span></div>)}
        {(data.warnings || []).map((w, i) => <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#f59e0b', lineHeight: 1.5 }}><span>ℹ</span><span>{w}</span></div>)}
        {passed && <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12px', color: '#22c55e' }}><CheckCircle2 size={12} />All compliance rules passed</div>}
      </div>
    </div>
  );
}

function RiskCard({ data, retryCount }) {
  const map = { Low: { c: '#22c55e', bg: 'rgba(34,197,94,0.08)', b: 'rgba(34,197,94,0.2)' }, Medium: { c: '#f59e0b', bg: 'rgba(245,158,11,0.08)', b: 'rgba(245,158,11,0.2)' }, High: { c: '#ef4444', bg: 'rgba(239,68,68,0.08)', b: 'rgba(239,68,68,0.2)' } };
  const s = map[data.score] || { c: '#737373', bg: 'rgba(255,255,255,0.04)', b: 'rgba(115,115,115,0.2)' };
  return (
    <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(115,115,115,0.2)', background: '#0a0a0a' }}>
      <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(115,115,115,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ fontSize: '11px', fontWeight: 600, color: '#737373', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Risk Assessment</p>
        <span style={{ fontSize: '12px', fontWeight: 700, padding: '2px 10px', borderRadius: '20px', background: s.bg, color: s.c, border: `1px solid ${s.b}` }}>{data.score}</span>
      </div>
      {retryCount > 0 && <div style={{ padding: '8px 16px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(115,115,115,0.08)' }}><span style={{ fontSize: '12px', color: '#505050' }}>Self-corrections applied</span><span style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 600 }}>{retryCount}×</span></div>}
      {(data.reasons || []).length > 0 && (
        <div style={{ padding: '10px 16px 12px' }}>
          {data.reasons.map((r, i) => <p key={i} style={{ fontSize: '12px', color: '#737373', marginBottom: '4px', lineHeight: 1.5 }}>• {r}</p>)}
        </div>
      )}
    </div>
  );
}

const lbl = { display: 'block', fontSize: '12px', fontWeight: 500, color: '#737373', marginBottom: '6px', fontFamily: "'Inter', sans-serif" };
const inp = { width: '100%', padding: '9px 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(115,115,115,0.25)', color: '#FAFAFA', fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif", transition: 'all 0.2s' };
