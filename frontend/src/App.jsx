import { useState } from 'react';
import { LogOut, ChevronDown, Clock, FileText, Link2, Settings } from 'lucide-react';
import ScheduleAgentView from './views/ScheduleAgentView';
import PretrainedAgentView from './views/PretrainedAgentView';
import CustomLinkAgentView from './views/CustomLinkAgentView';

const VIEWS = [
  { id: 'schedule', label: 'Schedule Agents', icon: Clock, desc: 'Auto-monitor policy changes' },
  { id: 'pretrained', label: 'Pretrained Agents', icon: FileText, desc: 'Invoice · Vendor · Contract' },
  { id: 'custom-link', label: 'Custom Link Agents', icon: Link2, desc: 'Unique URL per employee' },
];

export default function App({ user, onLogout }) {
  const [view, setView] = useState('pretrained');
  const [dropOpen, setDropOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const active = VIEWS.find(v => v.id === view);
  const ActiveIcon = active.icon;

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#000000', color: '#FAFAFA', fontFamily: "'Inter', sans-serif" }}>

      {/* Sidebar */}
      <aside style={{ width: '240px', flexShrink: 0, display: 'flex', flexDirection: 'column', background: '#0a0a0a', borderRight: '1px solid rgba(115,115,115,0.2)' }}>

        {/* Logo */}
        <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid rgba(115,115,115,0.15)' }}>
          <p style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.03em', color: '#FAFAFA' }}>Aria</p>
          <p style={{ fontSize: '11px', color: '#737373', marginTop: '3px' }}>Multi-Agent Platform</p>
        </div>

        {/* Agent Type Dropdown */}
        <div style={{ padding: '14px 12px 10px' }}>
          <p style={{ fontSize: '10px', fontWeight: 600, color: '#737373', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '8px', paddingLeft: '4px' }}>Agent Type</p>
          <div style={{ position: 'relative' }}>
            <button onClick={() => setDropOpen(o => !o)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', background: '#172B4D', border: '1px solid rgba(59,130,246,0.3)', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 1px 8px rgba(23,43,77,0.3)' }}>
              <ActiveIcon size={14} color="#FAFAFA" />
              <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
                <p style={{ fontSize: '12px', fontWeight: 600, color: '#FAFAFA', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{active.label}</p>
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '1px' }}>{active.desc}</p>
              </div>
              <ChevronDown size={13} color="rgba(255,255,255,0.5)" style={{ transform: dropOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
            </button>

            {dropOpen && (
              <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: '#0a0a0a', border: '1px solid rgba(115,115,115,0.25)', borderRadius: '10px', overflow: 'hidden', zIndex: 50, boxShadow: '0 0 0 1px rgba(255,255,255,0.02), 0 16px 40px rgba(0,0,0,0.7)' }}>
                {VIEWS.map(v => {
                  const Icon = v.icon;
                  const isActive = view === v.id;
                  return (
                    <button key={v.id} onClick={() => { setView(v.id); setDropOpen(false); }}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: isActive ? '#172B4D' : 'transparent', border: 'none', cursor: 'pointer', transition: 'background 0.15s' }}
                      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <Icon size={13} color={isActive ? '#FAFAFA' : '#737373'} />
                      <div style={{ textAlign: 'left' }}>
                        <p style={{ fontSize: '12px', fontWeight: isActive ? 600 : 400, color: isActive ? '#FAFAFA' : '#737373' }}>{v.label}</p>
                        <p style={{ fontSize: '10px', color: '#505050' }}>{v.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* History */}
        <div style={{ padding: '4px 16px 8px' }}>
          <p style={{ fontSize: '10px', fontWeight: 600, color: '#737373', textTransform: 'uppercase', letterSpacing: '0.07em' }}>History</p>
        </div>
        <div id="agent-history-portal" style={{ flex: 1, overflowY: 'auto', padding: '0 8px 8px' }} />

        {/* User */}
        <div style={{ padding: '12px', borderTop: '1px solid rgba(115,115,115,0.15)', position: 'relative' }}>
          <button onClick={() => setProfileOpen(o => !o)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', borderRadius: '9px', background: 'transparent', border: '1px solid transparent', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(115,115,115,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
          >
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#172B4D', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#FAFAFA', border: '1px solid rgba(115,115,115,0.3)', flexShrink: 0 }}>
              {(user?.name || '?').slice(0, 1).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
              <p style={{ fontSize: '12px', fontWeight: 500, color: '#FAFAFA', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</p>
              <p style={{ fontSize: '10px', color: '#737373', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
            </div>
            <Settings size={13} color="#737373" />
          </button>

          {profileOpen && (
            <div style={{ position: 'absolute', bottom: '100%', left: '12px', right: '12px', marginBottom: '6px', background: '#0a0a0a', border: '1px solid rgba(115,115,115,0.25)', borderRadius: '10px', overflow: 'hidden', zIndex: 50, boxShadow: '0 0 0 1px rgba(255,255,255,0.02), 0 -8px 32px rgba(0,0,0,0.6)' }}>
              <button onClick={() => { setProfileOpen(false); onLogout?.(); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#ef4444', fontFamily: "'Inter', sans-serif" }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <LogOut size={13} /> Sign out
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, display: 'flex', overflow: 'hidden' }} onClick={() => { setDropOpen(false); setProfileOpen(false); }}>
        {view === 'schedule' && <ScheduleAgentView />}
        {view === 'pretrained' && <PretrainedAgentView />}
        {view === 'custom-link' && <CustomLinkAgentView />}
      </main>
    </div>
  );
}
