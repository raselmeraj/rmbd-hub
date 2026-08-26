import { useState } from 'react';

export default function Login({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isLogin && password !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    if (onLogin) onLogin({ email, password, name, isLogin });
  };

  return (
    <div className="min-h-screen w-full bg-[#e89e9e] flex flex-col relative overflow-hidden font-serif">
      <div className="w-full flex justify-between items-start p-6 md:p-10">
        <div className="relative">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-[#fff6f0] border border-white flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.1)]">
            <div className="w-[85%] h-[85%] rounded-full border border-black/80 flex flex-col items-center justify-center">
              <span className="text-[10px] tracking-[0.2em] font-sans font-bold">RMBD-HUB</span>
              <div className="w-8 h-[1px] bg-black/60 my-1"></div>
              <span className="text-[6px] font-sans">SINCE 2025</span>
            </div>
          </div>
          <div className="absolute -top-1 -right-1 bg-black text-white text-[7px] px-1.5 py-0.5 rounded-full font-sans">ESTD</div>
        </div>
        <div className="text-center flex-1 -ml-20 md:-ml-24">
          <h1 className="text-xl md:text-2xl font-serif text-black/80 leading-tight">Welcome to Communication</h1>
          <h2 className="text-xl md:text-2xl font-serif italic text-black/80 -mt-1">Social Site</h2>
          <div className="flex items-center justify-center gap-3 mt-3">
            <div className="h-[1px] w-10 bg-black/20"></div>
            <p className="text-[11px] tracking-[0.25em] font-sans font-semibold text-black/60">REPRESENTED BY RMBD HUB</p>
            <div className="h-[1px] w-10 bg-black/20"></div>
          </div>
          <p className="text-[11px] font-sans text-black/50 mt-3 max-w-[280px] mx-auto leading-relaxed">RMBD Hub helps you connect and share with the<br/>people in your life.</p>
        </div>
        <div className="w-20 md:w-24"></div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row px-6 md:px-12 lg:px-16 gap-8 items-center">
        <div className="flex-1 flex flex-col justify-center">
          <div className="inline-flex items-center gap-2 bg-[#f5e6d8]/80 backdrop-blur rounded-full px-3 py-1 w-fit border border-black/5">
            <div className="w-1.5 h-1.5 rounded-full bg-black animate-pulse"></div>
            <span className="text-[9px] tracking-[0.15em] font-sans font-bold text-black/60">LIVE COMMUNITY • 12.4K ONLINE</span>
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-black leading-[0.9] mt-6">Talk<br/><span className="italic font-light ml-2">less,</span><br/>connect<br/><span className="italic font-light ml-8">more.</span></h1>
          <div className="mt-8 bg-[#f5e6d8]/60 backdrop-blur-md rounded-2xl p-4 max-w-[320px] border border-white/40 shadow-sm">
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-serif flex-shrink-0">R</div>
              <p className="text-[11px] font-sans leading-relaxed text-black/70"><span className="font-bold text-black">RMBD Hub</span> helps you connect and share with the people in your life. A warm, premium identity hub built for real conversations — from Dhaka to the world</p>
            </div>
          </div>
        </div>

        <div className="hidden md:flex w-12 h-12 rounded-full bg-black text-white items-center justify-center self-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 9l-7 7-7-7"/></svg>
        </div>

        <div className="flex-1 max-w-[400px] w-full">
          <div className="relative bg-[#fff6f0] rounded-[20px] p-6 md:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-white/60">
            <div className="flex gap-2 mb-5">
              <button onClick={()=>setIsLogin(true)} className={`flex-1 py-2 rounded-full text-[11px] font-sans font-bold tracking-widest transition ${isLogin ? 'bg-black text-white' : 'bg-[#f5e6d8] text-black/50'}`}>LOGIN</button>
              <button onClick={()=>setIsLogin(false)} className={`flex-1 py-2 rounded-full text-[11px] font-sans font-bold tracking-widest transition ${!isLogin ? 'bg-black text-white' : 'bg-[#f5e6d8] text-black/50'}`}>REGISTER</button>
            </div>

            <h2 className="text-2xl font-serif leading-tight text-black">{isLogin ? <>Login your<br/><span className="italic">Identity</span></> : <>Create your<br/><span className="italic">Account</span></>}</h2>
            <p className="text-[11px] font-sans text-black/50 mt-2 leading-relaxed">{isLogin ? <>RMBD Hub helps you connect and share with<br/>the people in your life.</> : <>Join RMBD Hub and start connecting with<br/>people in your life today.</>}</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {!isLogin && (
                <div>
                  <label className="text-[11px] font-sans font-semibold text-black/70">Full Name</label>
                  <div className="mt-2 relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
                    <input type="text" value={name} onChange={(e)=>setName(e.target.value)} placeholder="Rasel Meraj" required={!isLogin} className="w-full bg-[#f5e6d8]/70 border border-black/5 rounded-full pl-10 pr-4 py-3 text-[12px] font-sans placeholder:text-black/30 focus:outline-none focus:ring-2 focus:ring-black/10" />
                  </div>
                </div>
              )}
              <div>
                <label className="text-[11px] font-sans font-semibold text-black/70">Email Address or Mobile Phone</label>
                <div className="mt-2 relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></div>
                  <input type="text" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@rmbd.hub or +880..." required className="w-full bg-[#f5e6d8]/70 border border-black/5 rounded-full pl-10 pr-4 py-3 text-[12px] font-sans placeholder:text-black/30 focus:outline-none focus:ring-2 focus:ring-black/10" />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center"><label className="text-[11px] font-sans font-semibold text-black/70">Password</label>{isLogin && <a href="#" className="text-[10px] font-sans underline text-black/50">Recovery Password</a>}</div>
                <div className="mt-2 relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div>
                  <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="••••••••••" required className="w-full bg-[#f5e6d8]/70 border border-black/5 rounded-full pl-10 pr-10 py-3 text-[12px] font-sans placeholder:text-black/30 focus:outline-none focus:ring-2 focus:ring-black/10" />
                </div>
              </div>
              {!isLogin && (
                <div>
                  <label className="text-[11px] font-sans font-semibold text-black/70">Confirm Password</label>
                  <div className="mt-2 relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div>
                    <input type="password" value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} placeholder="••••••••••" required={!isLogin} className="w-full bg-[#f5e6d8]/70 border border-black/5 rounded-full pl-10 pr-4 py-3 text-[12px] font-sans placeholder:text-black/30 focus:outline-none focus:ring-2 focus:ring-black/10" />
                  </div>
                </div>
              )}
              {isLogin && (
                <div className="flex justify-between items-center pt-1">
                  <label className="flex items-center gap-2 cursor-pointer"><div className="w-8 h-5 rounded-full bg-black flex items-center p-0.5"><div className="w-4 h-4 rounded-full bg-white"></div></div><span className="text-[11px] font-sans text-black/60">Remember me</span></label>
                  <span className="text-[9px] font-sans text-black/40">Secure - Encrypted</span>
                </div>
              )}
              <button type="submit" className="w-full bg-black text-white rounded-full py-3.5 text-[13px] font-sans font-medium flex items-center justify-center gap-2 hover:bg-black/90 transition mt-2">
                {isLogin ? 'Login' : 'Create Account'}
                <div className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17L17 7M7 7h10v10"/></svg></div>
              </button>
              <p className="text-[9px] font-sans text-black/30 text-center leading-relaxed">By continuing you agree to RMBD Hub Terms & Privacy</p>
            </form>
            <div className="mt-4 text-center">
              <p className="text-[11px] font-sans text-black/50">{isLogin ? "Don't have an account? " : "Already have an account? "}<button onClick={()=>setIsLogin(!isLogin)} className="font-bold text-black underline">{isLogin ? "Create New" : "Login"}</button></p>
            </div>
          </div>
        </div>
      </div>
      <div className="h-10"></div>
    </div>
  );
}
