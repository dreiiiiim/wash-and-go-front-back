import React, { useState } from 'react';
import { Mail, Lock, User, Phone, Eye, EyeOff, AlertCircle } from 'lucide-react';
import type { AppUser } from '../App';
import { supabase } from '../lib/supabase';
import { api } from '../lib/api';
import washngobg from '../assets/washngobg.jpg';

type AuthMode = 'login' | 'signup';
interface AuthPageProps { onAuthSuccess: (user: AppUser) => void; }

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

@keyframes wng-rise    { from{opacity:0;transform:translateY(32px)} to{opacity:1;transform:none} }
@keyframes wng-left    { from{opacity:0;transform:translateX(-24px)} to{opacity:1;transform:none} }
@keyframes wng-shimmer { from{left:-80%} to{left:130%} }
@keyframes wng-crawl   { 0%{background-position:0% 0} 100%{background-position:200% 0} }
@keyframes wng-vglow   { 0%,100%{opacity:.35} 50%{opacity:.9} }
.wng-w   { animation: wng-left  .9s cubic-bezier(.16,1,.3,1) .05s both; }
.wng-amp { animation: wng-left  .9s cubic-bezier(.16,1,.3,1) .16s both; }
.wng-go  { animation: wng-left  .9s cubic-bezier(.16,1,.3,1) .27s both; }
.wng-sub { animation: wng-rise  .9s cubic-bezier(.16,1,.3,1) .42s both; }
.wng-svc { animation: wng-rise  .9s cubic-bezier(.16,1,.3,1) .55s both; }
.wng-form{ animation: wng-rise  .7s cubic-bezier(.16,1,.3,1) .1s  both; }

/* Top running bar */
.wng-bar {
  position:absolute; top:0; left:0; right:0; height:3px;
  background:linear-gradient(90deg, #f5f6f8 0%, #ee4923 35%, #f4721f 55%, #ee4923 75%, #f5f6f8 100%);
  background-size:200% 100%;
  animation: wng-crawl 4s linear infinite;
}

/* Vertical accent line */
.wng-vline {
  position:absolute;
  width:2px; top:12%; bottom:12%;
  background:linear-gradient(to bottom, transparent, #ee4923 30%, #ee4923 70%, transparent);
  animation: wng-vglow 3s ease-in-out infinite;
}

/* Grid texture */
.wng-grid {
  position:absolute; inset:0; pointer-events:none;
  background-image:
    linear-gradient(rgba(255,255,255,.028) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.028) 1px, transparent 1px);
  background-size:52px 52px;
}

/* Inputs ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â light panel */
.wng-inp { transition: border-color .2s, box-shadow .2s, background .2s; }
.wng-inp:focus {
  outline:none !important;
  border-color: #ee4923 !important;
  box-shadow: 0 0 0 3px rgba(238,73,35,.14) !important;
  background: #ffffff !important;
}
.wng-inp::placeholder { color:#b0b8c4; }

/* Google button */
.wng-google:hover { border-color:#ee4923 !important; background:rgba(238,73,35,.05) !important; }
.wng-google:hover .wng-gt { color:#ee4923 !important; }

/* Submit shimmer */
.wng-btn { position:relative; overflow:hidden; }
.wng-btn::after {
  content:''; position:absolute; top:0; left:-80%; width:50%; height:100%;
  background:linear-gradient(90deg,transparent,rgba(255,255,255,.22),transparent);
  transform:skewX(-12deg);
}
.wng-btn:hover:not(:disabled)::after { animation:wng-shimmer .7s ease forwards; }
.wng-btn:hover:not(:disabled)        { filter:brightness(1.08); }
.wng-btn:disabled { opacity:.45; cursor:not-allowed; }

/* Service tags (left panel ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â dark) */
.wng-tag:hover { border-color:rgba(238,73,35,.35) !important; color:#ee4923 !important; background:rgba(238,73,35,.07) !important; }

/* Eye toggle + mode link */
.wng-eye:hover    { color:#666 !important; }
.wng-toggle:hover { color:#c93d1b !important; }

@media (max-width:1023px) { .wng-lp { display:none !important; } }
`;

/* ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â */
export default function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password: pw });
        if (error) throw error;
        const { data: profile } = await supabase.from('profiles').select('role, full_name').eq('id', data.user.id).single();
        onAuthSuccess({ name: profile?.full_name || data.user.email || '', email: data.user.email || '', isStaff: profile?.role === 'admin' });
      } else {
        await api.signup({
          fullName: name.trim(),
          email: email.trim(),
          password: pw,
          phone: phone.trim() || undefined,
          redirectTo: window.location.origin,
        });
        setConfirmed(true);
        return;
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed.');
    } finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });
    if (error) setError(error.message);
  };

  const toggle = () => {
    setMode(p => p === 'login' ? 'signup' : 'login');
    setName(''); setPhone(''); setEmail(''); setPw(''); setError(''); setConfirmed(false);
  };

  /* Left panel ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â dark photo overlay palette */
  const LP = {
    panel:   '#17171b',
    border:  '#2e2e36',
    text:    '#e8e8f0',
    muted:   '#888896',
    dim:     '#404050',
    orange:  '#ee4923',
  };

  /* Right panel ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â light, matches rest of site */
  const R = {
    bg:      '#f5f6f8',   // light gray page bg
    card:    '#ffffff',   // white card
    inp:     '#f0f2f5',   // light input bg
    border:  '#dde1e8',   // soft border
    text:    '#1a1a2e',   // near-black text
    muted:   '#6b7280',   // gray subtext
    label:   '#9ca3af',   // uppercase label
    orange:  '#ee4923',   // brand orange
    dark:    '#383838',   // brand dark
  };

  const inp: React.CSSProperties = {
    width:'100%', padding:'13px 14px 13px 42px',
    background: R.inp, border:`1.5px solid ${R.border}`,
    borderRadius:'10px', color: R.text,
    fontSize:'14px', fontFamily:"'DM Sans', sans-serif",
    boxSizing:'border-box',
  };

  const lbl: React.CSSProperties = {
    display:'block', fontSize:'10px', fontWeight:600,
    letterSpacing:'0.14em', textTransform:'uppercase',
    color: R.label, marginBottom:'8px', fontFamily:"'DM Sans', sans-serif",
  };

  const ico: React.CSSProperties = {
    position:'absolute', left:'13px', top:'50%',
    transform:'translateY(-50%)', color:'#c4c9d4', pointerEvents:'none', display:'flex',
  };

  return (
    <>
      <style>{CSS}</style>
      <div style={{
        height:'calc(100vh - 64px)',   /* fill remaining screen after navbar */
        display:'flex', background: R.bg,
        fontFamily:"'DM Sans', sans-serif", overflow:'hidden',
      }}>

        {/* ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â
            LEFT  Ãƒâ€šÃ‚Â·  BRAND + CAR PANEL
        ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â */}
        <div
          className="wng-lp"
          style={{
            width:'52%', position:'relative', overflow:'hidden',
            display:'flex', flexDirection:'column', justifyContent:'space-between',
            padding:'2.8rem 4rem',
            backgroundImage:`url(${washngobg})`,
            backgroundSize:'cover', backgroundPosition:'center',
            borderRight:`1px solid ${LP.border}`,
          }}
        >
          {/* Dark overlay so text stays readable */}
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg, rgba(23,23,27,0.88) 0%, rgba(23,23,27,0.72) 60%, rgba(23,23,27,0.85) 100%)', zIndex:1 }} />
          <div className="wng-grid" style={{ zIndex:2 }} />

          {/* Diagonal slash decorations */}
          <div style={{ position:'absolute', top:'-20%', right:'9%', width:'2px', height:'140%', background:'linear-gradient(to bottom,transparent,rgba(238,73,35,.22),transparent)', transform:'rotate(12deg)', zIndex:2 }} />
          <div style={{ position:'absolute', top:'-20%', right:'14%', width:'1px', height:'140%', background:'linear-gradient(to bottom,transparent,rgba(238,73,35,.08),transparent)', transform:'rotate(12deg)', zIndex:2 }} />

          {/* Left vertical accent */}
          <div className="wng-vline" style={{ left:'3rem', zIndex:2 }} />

          {/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Branch tag ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */}
          <div className="wng-sub" style={{ position:'relative', zIndex:3 }}>
            <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
              <div style={{ width:'26px', height:'2px', background: LP.orange, borderRadius:'2px' }} />
              <span style={{ fontFamily:"'DM Sans', sans-serif", fontSize:'10px', fontWeight:600, letterSpacing:'0.25em', textTransform:'uppercase', color:'#3a3a46' }}>
                Auto Salon - Baliwag Branch
              </span>
            </div>
          </div>

          {/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Massive brand type ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */}
          <div style={{ position:'relative', zIndex:3, paddingLeft:'1.5rem', marginTop:'-1rem' }}>
            <div className="wng-w" style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'clamp(80px,10vw,140px)', lineHeight:.88, color: LP.text, letterSpacing:'.02em' }}>
              WASH
            </div>
            <div className="wng-amp" style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'clamp(60px,7.5vw,104px)', lineHeight:1, color: LP.orange, letterSpacing:'.04em', marginLeft:'6px' }}>
              &amp;
            </div>
            <div className="wng-go" style={{ position:'relative', display:'inline-block' }}>
              <span style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'clamp(80px,10vw,140px)', lineHeight:.88, color: LP.text, letterSpacing:'.02em' }}>
                GO
              </span>
              <div style={{ position:'absolute', bottom:'-2px', left:0, width:'65%', height:'4px', background:`linear-gradient(90deg,${LP.orange},rgba(238,73,35,0))`, borderRadius:'2px' }} />
            </div>
            <div className="wng-sub" style={{ marginTop:'1.6rem', display:'flex', alignItems:'center', gap:'12px' }}>
              <div style={{ height:'1px', width:'28px', background:'#2a2a32' }} />
              <p style={{ fontFamily:"'DM Sans', sans-serif", fontSize:'11px', color:'#38383e', letterSpacing:'.18em', textTransform:'uppercase', fontWeight:500, margin:0 }}>
                Premium Auto Care
              </p>
            </div>
          </div>

          {/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Service list ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */}
          <div className="wng-svc" style={{ position:'relative', zIndex:3 }}>
            <p style={{ fontFamily:"'DM Sans', sans-serif", fontSize:'10px', color:'#2e2e38', letterSpacing:'.18em', textTransform:'uppercase', fontWeight:600, marginBottom:'10px' }}>
              Our Services
            </p>
            <div style={{ display:'flex', flexDirection:'column', gap:'7px' }}>
              {['Lube & Go', 'Auto Grooming', 'Ceramic Coating'].map(s => (
                <div key={s} className="wng-tag" style={{
                  display:'flex', alignItems:'center', gap:'10px',
                  padding:'8px 13px', border:`1px solid #202028`, borderRadius:'8px',
                  background:'rgba(255,255,255,.015)', cursor:'default',
                  transition:'all .2s', color:'#78788a',
                }}>
                  <div style={{ width:'5px', height:'5px', borderRadius:'50%', background: LP.orange, flexShrink:0 }} />
                  <span style={{ fontFamily:"'DM Sans', sans-serif", fontSize:'12px' }}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â
            RIGHT  Ãƒâ€šÃ‚Â·  FORM PANEL
        ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â */}
        <div style={{
          flex:1, display:'flex', alignItems:'center', justifyContent:'center',
          padding:'1.5rem', background: R.bg, position:'relative',
          overflowY:'auto',
        }}>
          {/* Animated top bar */}
          <div className="wng-bar" />

          {/* Soft radial glow */}
          <div style={{
            position:'absolute', top:'45%', left:'50%', transform:'translate(-50%,-50%)',
            width:'420px', height:'420px', borderRadius:'50%',
            background:'radial-gradient(circle,rgba(238,73,35,.05) 0%,transparent 70%)',
            pointerEvents:'none',
          }} />

          <div className="wng-form" style={{ width:'100%', maxWidth:'380px' }}>

            {/* Mobile brand */}
            <div style={{ textAlign:'center', marginBottom:'2rem' }}>
              <div style={{ display:'inline-flex', alignItems:'baseline', gap:'6px' }}>
                {(['WASH','&','GO'] as const).map((w) => (
                  <span key={w} style={{
                    fontFamily:"'Bebas Neue', sans-serif",
                    fontSize: w === '&' ? '34px' : '42px',
                    color: w === '&' ? R.orange : R.dark,
                    letterSpacing:'.05em', lineHeight:1,
                  }}>{w}</span>
                ))}
              </div>
              <p style={{ fontFamily:"'DM Sans', sans-serif", fontSize:'10px', color: R.muted, letterSpacing:'.22em', textTransform:'uppercase', marginTop:'4px' }}>
                Baliwag Branch
              </p>
            </div>

            {/* Card */}
            <div style={{
              background: R.card, border:`1px solid ${R.border}`,
              borderRadius:'16px', padding:'1.75rem',
              boxShadow:'0 4px 24px rgba(0,0,0,.08), 0 1px 3px rgba(0,0,0,.06)',
            }}>
              {/* Heading */}
              <div style={{ marginBottom:'1.5rem' }}>
                <h2 style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'34px', color: R.dark, letterSpacing:'.06em', lineHeight:1, margin:0 }}>
                  {confirmed ? 'CHECK YOUR EMAIL' : mode === 'login' ? 'WELCOME BACK' : 'CREATE ACCOUNT'}
                </h2>
                <div style={{ width:'34px', height:'3px', background: R.orange, borderRadius:'2px', marginTop:'9px' }} />
                <p style={{ fontFamily:"'DM Sans', sans-serif", fontSize:'13px', color: R.muted, marginTop:'9px', lineHeight:1.5 }}>
                  {confirmed ? 'Confirm your email to activate your account.' : mode === 'login' ? 'Sign in to manage your appointments.' : 'Register to start booking auto services.'}
                </p>
              </div>

              {confirmed && (
                <div style={{ textAlign:'center', marginBottom:'8px' }}>
                  <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:'64px', height:'64px', borderRadius:'999px', background:'rgba(238,73,35,.12)', marginBottom:'12px' }}>
                    <Mail size={28} color={R.orange} />
                  </div>
                  <p style={{ fontFamily:"'DM Sans', sans-serif", fontSize:'13px', color: R.muted, margin:'0 0 6px', lineHeight:1.6 }}>
                    We sent a confirmation link to:
                  </p>
                  <p style={{ fontFamily:"'DM Sans', sans-serif", fontSize:'14px', color: R.dark, fontWeight:700, margin:'0 0 10px', wordBreak:'break-word' }}>
                    {email}
                  </p>
                  <p style={{ fontFamily:"'DM Sans', sans-serif", fontSize:'13px', color: R.muted, margin:0, lineHeight:1.6 }}>
                    Click the link in the email to activate your account.
                  </p>
                  <p style={{ fontFamily:"'DM Sans', sans-serif", fontSize:'13px', color: R.muted, margin:'4px 0 0', lineHeight:1.6 }}>
                    It may take a minute to arrive. Check your spam folder too.
                  </p>
                  <button
                    type="button"
                    className="wng-toggle"
                    onClick={() => { setConfirmed(false); setMode('login'); setPw(''); setError(''); }}
                    style={{ marginTop:'14px', background:'none', border:'none', color: R.orange, fontWeight:600, cursor:'pointer', padding:0, fontSize:'13px', fontFamily:"'DM Sans', sans-serif", transition:'color .15s' }}
                  >
                    Back to Sign In
                  </button>
                </div>
              )}

              {!confirmed && (
                <>
              {/* Error banner */}
              {error && (
                <div style={{ display:'flex', gap:'10px', background:'#fff5f5', border:'1px solid #fecaca', borderRadius:'10px', padding:'11px 13px', marginBottom:'16px' }}>
                  <AlertCircle size={15} style={{ color:'#dc2626', flexShrink:0, marginTop:'1px' }} />
                  <p style={{ fontFamily:"'DM Sans', sans-serif", fontSize:'13px', color:'#dc2626', margin:0, lineHeight:1.45 }}>{error}</p>
                </div>
              )}

              {/* Google button */}
              <button type="button" onClick={handleGoogle} className="wng-google" style={{
                width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:'11px',
                padding:'12px 18px', background:'#ffffff', border:`1.5px solid ${R.border}`,
                borderRadius:'10px', cursor:'pointer', transition:'border-color .2s,background .2s', marginBottom:'16px',
                boxShadow:'0 1px 3px rgba(0,0,0,.06)',
              }}>
                <svg width="17" height="17" viewBox="0 0 48 48">
                  <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.5 6.5 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
                  <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.5 6.5 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
                  <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.3 26.8 36 24 36c-5.2 0-9.7-3.1-11.3-7.7l-6.5 5C9.6 39.5 16.3 44 24 44z"/>
                  <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.6l6.2 5.2C37 39 44 34 44 24c0-1.3-.1-2.6-.4-3.9z"/>
                </svg>
                <span className="wng-gt" style={{ fontFamily:"'DM Sans', sans-serif", fontSize:'12px', fontWeight:600, color:'#5f6368', letterSpacing:'.08em', textTransform:'uppercase', transition:'color .2s' }}>
                  Continue with Google
                </span>
              </button>

              {/* Divider */}
              <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'16px' }}>
                <div style={{ flex:1, height:'1px', background: R.border }} />
                <span style={{ fontFamily:"'DM Sans', sans-serif", fontSize:'10px', color: R.muted, letterSpacing:'.14em', textTransform:'uppercase', fontWeight:500 }}>
                  or email
                </span>
                <div style={{ flex:1, height:'1px', background: R.border }} />
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'13px' }}>
                {mode === 'signup' && (
                  <>
                    <div>
                      <label style={lbl}>Full Name</label>
                      <div style={{ position:'relative' }}>
                        <span style={ico}><User size={14} /></span>
                        <input className="wng-inp" type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Juan Dela Cruz" style={inp} />
                      </div>
                    </div>
                    <div>
                      <label style={lbl}>Phone Number</label>
                      <div style={{ position:'relative' }}>
                        <span style={ico}><Phone size={14} /></span>
                        <input className="wng-inp" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="0917 123 4567" style={inp} />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label style={lbl}>Email Address</label>
                  <div style={{ position:'relative' }}>
                    <span style={ico}><Mail size={14} /></span>
                    <input className="wng-inp" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="juan@email.com" style={inp} />
                  </div>
                </div>

                <div>
                  <label style={lbl}>Password</label>
                  <div style={{ position:'relative' }}>
                    <span style={ico}><Lock size={14} /></span>
                    <input className="wng-inp" type={showPw ? 'text' : 'password'} required value={pw} onChange={e => setPw(e.target.value)} placeholder="********" style={{ ...inp, paddingRight:'42px' }} />
                    <button type="button" className="wng-eye" onClick={() => setShowPw(p => !p)} style={{ position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'#9ca3af', cursor:'pointer', padding:0, display:'flex', transition:'color .15s' }}>
                      {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button type="submit" disabled={loading} className="wng-btn" style={{
                  width:'100%', padding:'14px', marginTop:'2px',
                  background: R.orange, border:'none', borderRadius:'10px',
                  color:'#fff', fontFamily:"'Bebas Neue', sans-serif",
                  fontSize:'17px', letterSpacing:'.14em',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition:'filter .2s, opacity .2s',
                }}>
                  {loading ? 'PLEASE WAIT...' : mode === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}
                </button>
              </form>

              {/* Toggle */}
              <p style={{ textAlign:'center', fontFamily:"'DM Sans', sans-serif", fontSize:'13px', color: R.muted, marginTop:'18px' }}>
                {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <button type="button" onClick={toggle} className="wng-toggle" style={{ background:'none', border:'none', color: R.orange, fontWeight:600, cursor:'pointer', padding:0, fontSize:'13px', fontFamily:"'DM Sans', sans-serif", transition:'color .15s' }}>
                  {mode === 'login' ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
                </>
              )}
            </div>

            <p style={{ textAlign:'center', fontFamily:"'DM Sans', sans-serif", fontSize:'11px', color:'#9ca3af', marginTop:'1.2rem', letterSpacing:'.05em' }}>
              Staff or owner? Your account is managed by the system admin.
            </p>
          </div>
        </div>

      </div>
    </>
  );
}
