import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, Send, Zap } from 'lucide-react';
import { getPublicSession, sendPublicChat } from '../api';

export default function PublicAgentChat() {
  const { token } = useParams();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [completionPercent, setCompletionPercent] = useState(0);
  const [completed, setCompleted] = useState(false);
  const endRef = useRef();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getPublicSession(token);
        setSession(data.session);
        setCompletionPercent(data.session.completionPercent || 0);
        if (data.alreadyCompleted || data.session.status === 'completed') {
          setCompleted(true);
        }
        // Restore chat history
        if (data.session.chatHistory?.length > 0) {
          setMessages(data.session.chatHistory.map(m => ({ role: m.role, text: m.content })));
        } else {
          // First time - send greeting trigger
          setMessages([{ role: 'assistant', text: `Namaste ${data.session.employeeData?.name || 'there'}! 👋 I'm Aria, your onboarding assistant for ${data.session.companyName || 'the company'}. I'll help you complete your onboarding. Let's get started!` }]);
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Invalid or expired link');
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending || completed) return;
    const msg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setSending(true);
    try {
      const { data } = await sendPublicChat(token, msg);
      setMessages(prev => [...prev, { role: 'assistant', text: data.reply }]);
      setCompletionPercent(data.completionPercent || 0);
      if (data.status === 'completed') setCompleted(true);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: "I'm having trouble right now. Please try again." }]);
    } finally {
      setSending(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
      <Loader2 size={28} color="#3b82f6" style={{ animation: 'spin 1s linear infinite' }} />
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', flexDirection: 'column', gap: '12px' }}>
      <p style={{ fontSize: '16px', fontWeight: 600, color: '#ef4444' }}>Link Error</p>
      <p style={{ fontSize: '13px', color: '#737373' }}>{error}</p>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#000', color: '#FAFAFA', fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(115,115,115,0.15)', display: 'flex', alignItems: 'center', gap: '12px', background: '#0a0a0a', flexShrink: 0 }}>
        <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'linear-gradient(135deg,#172B4D,#1e3a6e)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(115,115,115,0.3)' }}>
          <Zap size={14} color="#FAFAFA" />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '13px', fontWeight: 600 }}>{session?.agentName || 'Onboarding Assistant'}</p>
          <p style={{ fontSize: '11px', color: '#737373' }}>{session?.companyName || 'Company'} · {session?.employeeData?.name}</p>
        </div>
        {/* Progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '80px', height: '4px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: '4px', width: `${completionPercent}%`, background: completed ? '#22c55e' : '#3b82f6', transition: 'width 0.5s' }} />
          </div>
          <span style={{ fontSize: '11px', color: completed ? '#22c55e' : '#737373', fontWeight: 600 }}>{completionPercent}%</span>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '680px', margin: '0 auto', width: '100%' }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            {m.role === 'assistant' && (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                <div style={{ width: 28, height: 28, borderRadius: '8px', background: 'linear-gradient(135deg,#172B4D,#1e3a6e)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginBottom: '2px' }}>
                  <Zap size={12} color="#FAFAFA" />
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(115,115,115,0.2)', padding: '12px 16px', borderRadius: '14px', borderTopLeftRadius: '4px', maxWidth: '80%' }}>
                  <p style={{ fontSize: '13px', lineHeight: 1.6, color: '#FAFAFA' }}>{m.text}</p>
                </div>
              </div>
            )}
            {m.role === 'user' && (
              <div style={{ background: '#172B4D', border: '1px solid rgba(59,130,246,0.3)', padding: '12px 16px', borderRadius: '14px', borderTopRightRadius: '4px', maxWidth: '80%' }}>
                <p style={{ fontSize: '13px', lineHeight: 1.6, color: '#FAFAFA' }}>{m.text}</p>
              </div>
            )}
          </div>
        ))}
        {sending && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
            <div style={{ width: 28, height: 28, borderRadius: '8px', background: 'linear-gradient(135deg,#172B4D,#1e3a6e)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Loader2 size={12} color="#FAFAFA" style={{ animation: 'spin 1s linear infinite' }} />
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(115,115,115,0.2)', padding: '12px 16px', borderRadius: '14px', borderTopLeftRadius: '4px' }}>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                {[0, 1, 2].map(i => <span key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: '#505050', animation: `pulse 1.2s ${i * 0.2}s infinite` }} />)}
              </div>
            </div>
          </div>
        )}
        {completed && (
          <div style={{ borderRadius: '12px', padding: '16px', background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.2)', textAlign: 'center' }}>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#22c55e', marginBottom: '4px' }}>🎉 Onboarding Complete!</p>
            <p style={{ fontSize: '12px', color: '#737373' }}>All information collected. HR will be in touch soon.</p>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      {!completed && (
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(115,115,115,0.15)', background: '#000', flexShrink: 0 }}>
          <form onSubmit={handleSend} style={{ maxWidth: '680px', margin: '0 auto' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input value={input} onChange={e => setInput(e.target.value)} placeholder="Type your response..." disabled={sending}
                style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(115,115,115,0.25)', color: '#FAFAFA', fontSize: '13px', outline: 'none' }}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); } }}
              />
              <button type="submit" disabled={!input.trim() || sending} style={{ width: 44, height: 44, borderRadius: '12px', background: input.trim() ? '#172B4D' : 'rgba(255,255,255,0.04)', border: `1px solid ${input.trim() ? 'rgba(59,130,246,0.3)' : 'rgba(115,115,115,0.2)'}`, color: input.trim() ? '#FAFAFA' : '#505050', cursor: input.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Send size={16} />
              </button>
            </div>
          </form>
        </div>
      )}

      <style>{`@keyframes pulse { 0%,100%{opacity:0.3} 50%{opacity:1} }`}</style>
    </div>
  );
}
