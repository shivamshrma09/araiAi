import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Zap, 
  Users, 
  ArrowRight, 
  Clock, 
  FileText, 
  Link2, 
  ChevronRight,
  Globe,
  Cpu,
  Trophy,
  Activity,
  Layers
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#000000', 
      color: '#FAFAFA', 
      overflowX: 'hidden',
      position: 'relative'
    }}>
      {/* Background Layer */}
      <div className="mesh-bg" />
      <div className="blob" style={{ top: '10%', left: '10%', background: 'radial-gradient(circle, rgba(23,43,77,0.15) 0%, transparent 70%)' }} />
      <div className="blob" style={{ bottom: '10%', right: '10%', background: 'radial-gradient(circle, rgba(29,158,117,0.08) 0%, transparent 70%)', animationDelay: '-5s' }} />

      {/* Global Spotlight */}
      <div style={{
        position: 'fixed',
        top: mousePos.y - 400,
        left: mousePos.x - 400,
        width: '800px',
        height: '800px',
        background: 'radial-gradient(circle, rgba(59,130,246,0.03) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 1,
        transition: 'top 0.1s ease-out, left 0.1s ease-out'
      }} />

      {/* Navigation */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '20px 6%',
        background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ 
            width: '36px', height: '36px', borderRadius: '10px', 
            background: 'linear-gradient(135deg, #172B4D 0%, #3b82f6 100%)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(59,130,246,0.4)'
          }}>
            <Zap size={20} fill="white" color="white" />
          </div>
          <span style={{ fontSize: '24px', fontWeight: 900, letterSpacing: '-0.05em', color: '#FFF' }}>Aria</span>
        </div>
        
        <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
          {['Features', 'Integrations', 'Pricing'].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`} style={{ 
              color: 'rgba(255,255,255,0.5)', textDecoration: 'none', 
              fontSize: '13px', fontWeight: 600, letterSpacing: '0.02em', 
              transition: 'all 0.3s' 
            }} onMouseEnter={e => e.target.style.color = '#FFF'} onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.5)'}>
              {item}
            </a>
          ))}
          <button 
            onClick={() => navigate('/login')}
            style={{ 
              background: '#FFF', color: '#000', border: 'none', 
              padding: '10px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: 700, 
              cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: '0 4px 14px rgba(255,255,255,0.2)'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(255,255,255,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(255,255,255,0.2)'; }}
          >
            Launch Studio
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} style={{ 
        padding: '240px 6% 160px', 
        display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
        position: 'relative', zIndex: 10
      }}>
        <div className="fade-in">
          <div style={{ 
            display: 'inline-flex', alignItems: 'center', gap: '8px', 
            padding: '8px 16px', borderRadius: '24px', 
            background: 'rgba(59,130,246,0.05)', 
            border: '1px solid rgba(59,130,246,0.15)', 
            marginBottom: '32px',
            backdropFilter: 'blur(10px)'
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3b82f6', boxShadow: '0 0 8px #3b82f6' }} />
            <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#3b82f6' }}>
              Built for Enterprise 2026
            </span>
          </div>

          <h1 style={{ 
            fontSize: 'max(56px, 7vw)', fontWeight: 900, letterSpacing: '-0.06em', lineHeight: 0.95,
            marginBottom: '32px', maxWidth: '1000px', color: '#FFF'
          }}>
            Orchestrate <span className="text-shimmer">Autonomous</span> <br /> Intelligence at Scale.
          </h1>

          <p style={{ 
            fontSize: 'max(18px, 1.25vw)', color: 'rgba(255,255,255,0.5)', 
            maxWidth: '700px', marginBottom: '56px', lineHeight: 1.6,
            fontWeight: 400
          }}>
            Aria is the foundational operating system for deploying specialized AI agents that monitor, process, and interact on your behalf.
          </p>

          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <button 
              onClick={() => navigate('/login')}
              style={{ 
                padding: '20px 48px', borderRadius: '16px', background: '#172B4D', color: '#FFF', 
                border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontSize: '18px', 
                fontWeight: 700, display: 'flex', alignItems: 'center', gap: '12px', 
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.background = '#1e3a6e'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = '#172B4D'; }}
            >
              Get Started <ArrowRight size={20} />
            </button>
            <button style={{ 
              padding: '20px 40px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', 
              color: '#FFF', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', 
              fontSize: '18px', fontWeight: 600, transition: 'all 0.3s' 
            }} onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.08)'} onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.03)'}>
              Book Demo
            </button>
          </div>
        </div>

        {/* Dynamic App Preview */}
        <div className="float-anim" style={{ 
          marginTop: '120px', width: '100%', maxWidth: '1100px', height: '600px', 
          background: 'linear-gradient(135deg, #0a0a0a 0%, #050505 100%)', 
          border: '1px solid rgba(255,255,255,0.08)', 
          borderRadius: '32px', boxShadow: '0 80px 160px rgba(0,0,0,0.9), inset 0 0 80px rgba(59,130,246,0.05)',
          display: 'flex', position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '50px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '10px', padding: '0 24px' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f56' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffbd2e' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#27c93f' }} />
            <div style={{ ml: '20px', color: 'rgba(255,255,255,0.2)', fontSize: '11px', fontWeight: 600 }}>aria-studio.app/main</div>
          </div>
          
          <div style={{ flex: 1, padding: '80px 40px 40px', display: 'flex', gap: '24px' }}>
             <aside style={{ width: '200px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }} />
             <main style={{ flex: 1, background: 'rgba(255,255,255,0.01)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Activity size={32} color="rgba(59,130,246,0.3)" />
             </main>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section style={{ padding: '80px 6%', background: '#030303' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '40px', textAlign: 'center' }}>
           {[
             { label: 'Uptime', val: '99.99%' },
             { label: 'Agents Deployed', val: '2.4M+' },
             { label: 'Latency', val: '< 120ms' },
             { label: 'Compliance', val: 'SOC2/HIPAA' },
           ].map(stat => (
             <div key={stat.label}>
                <p style={{ fontSize: '32px', fontWeight: 800, color: '#FFF', marginBottom: '8px' }}>{stat.val}</p>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{stat.label}</p>
             </div>
           ))}
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" style={{ padding: '160px 6%' }}>
        <div style={{ textAlign: 'center', marginBottom: '100px' }}>
          <h2 style={{ fontSize: '48px', fontWeight: 800, marginBottom: '24px', letterSpacing: '-0.04em' }}>Three Core Engines.</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '18px', maxWidth: '600px', mx: 'auto' }}>Aria provides three specialized agent frameworks for complete automation coverage.</p>
        </div>
        
        <div style={{ 
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', 
          gap: '40px'
        }}>
          <HighEndFeatureCard 
            icon={<Clock size={28} color="#3b82f6" />} 
            title="Schedule Engines" 
            desc="Continuous monitoring of regulatory data and portals. Automatically triggers actions based on detected changes."
            accent="#3b82f6"
            mousePos={mousePos}
          />
          <HighEndFeatureCard 
            icon={<Layers size={28} color="#1d9e75" />} 
            title="Extraction Engines" 
            desc="LLM-native document processing with specialized schemas for enterprise workflows like ERP onboarding and invoicing."
            accent="#1d9e75"
            mousePos={mousePos}
          />
          <HighEndFeatureCard 
            icon={<Users size={28} color="#8b5cf6" />} 
            title="Interaction Engines" 
            desc="Dynamic, conversational workflows that collect information and verify credentials through unique per-user AI links."
            accent="#8b5cf6"
            mousePos={mousePos}
          />
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ padding: '120px 6% 200px' }}>
        <div style={{ 
          background: 'linear-gradient(225deg, #0a0a0a 0%, #030303 100%)', 
          padding: '100px 60px', borderRadius: '40px', border: '1px solid rgba(255,255,255,0.1)',
          position: 'relative', overflow: 'hidden', textAlign: 'center'
        }}>
          <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', background: 'rgba(59,130,246,0.1)', filter: 'blur(80px)', borderRadius: '50%' }} />
          
          <h2 style={{ fontSize: '56px', fontWeight: 900, marginBottom: '24px', letterSpacing: '-0.05em' }}>Join the AI Vanguard.</h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '56px', fontSize: '20px', maxWidth: '700px', margin: '0 auto 56px' }}>Start building specialized agents today. Secure, scalable, and fully autonomous.</p>
          
          <button 
            onClick={() => navigate('/login')}
            style={{ 
              padding: '24px 64px', borderRadius: '20px', background: '#FFF', color: '#000', 
              border: 'none', cursor: 'pointer', fontSize: '20px', fontWeight: 800,
              boxShadow: '0 20px 48px rgba(255,255,255,0.3)',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05) translateY(-4px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1) translateY(0)'; }}
          >
            Enter the Studio
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '100px 6% 60px', borderTop: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.2)', fontSize: '13px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', color: '#FFF' }}>
              <Zap size={18} fill="#3b82f6" color="#3b82f6" />
              <span style={{ fontSize: '20px', fontWeight: 800 }}>Aria</span>
            </div>
            <p style={{ maxWidth: '300px', lineHeight: 1.6 }}>The world's first autonomous multi-agent operating system for high-scale enterprise automation.</p>
          </div>
          <div style={{ display: 'flex', gap: '80px' }}>
             <FooterNav title="Product" links={['Studio', 'Agents', 'Enterprise']} />
             <FooterNav title="Company" links={['About', 'Security', 'Hackathon']} />
             <FooterNav title="Legal" links={['Privacy', 'Terms', 'License']} />
          </div>
        </div>
        <div style={{ marginTop: '80px', paddingTop: '40px', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
          © 2026 Aria Systems Inc. Built for the ET AI Hackathon 2026.
        </div>
      </footer>
    </div>
  );
}

function HighEndFeatureCard({ icon, title, desc, accent, mousePos }) {
  const cardRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [localMouse, setLocalMouse] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setLocalMouse({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div 
      ref={cardRef} 
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ 
        padding: '56px 48px', borderRadius: '32px', background: 'rgba(255,255,255,0.02)', 
        border: '1px solid rgba(255,255,255,0.08)', position: 'relative', overflow: 'hidden',
        transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: isHovered ? 'translateY(-12px)' : 'translateY(0)',
        boxShadow: isHovered ? `0 40px 80px rgba(0,0,0,0.6), inset 0 0 0 1px ${accent}20` : 'none'
      }} 
    >
      {/* Internal Spotlight */}
      <div style={{
        position: 'absolute',
        top: localMouse.y - 200,
        left: localMouse.x - 200,
        width: '400px',
        height: '400px',
        background: `radial-gradient(circle, ${accent}15 0%, transparent 70%)`,
        opacity: isHovered ? 1 : 0,
        transition: 'opacity 0.3s ease',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ 
          width: '64px', height: '64px', borderRadius: '20px', 
          background: 'rgba(255,255,255,0.03)', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          marginBottom: '40px', border: '1px solid rgba(255,255,255,0.05)'
        }}>
          {icon}
        </div>
        <h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '20px', color: '#FFF' }}>{title}</h3>
        <p style={{ color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, fontSize: '16px', marginBottom: '32px' }}>{desc}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: accent, fontWeight: 700, fontSize: '15px', cursor: 'pointer' }}>
          Explore Engine <ChevronRight size={16} />
        </div>
      </div>
    </div>
  );
}

function FooterNav({ title, links }) {
  return (
    <div>
      <p style={{ color: '#FFF', fontWeight: 700, marginBottom: '24px', fontSize: '14px' }}>{title}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {links.map(l => (
          <a key={l} href="#" style={{ color: 'rgba(255,255,255,0.3)', textDecoration: 'none', transition: '0.2s' }} onMouseEnter={e => e.target.style.color = '#FFF'} onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.3)'}>{l}</a>
        ))}
      </div>
    </div>
  );
}
