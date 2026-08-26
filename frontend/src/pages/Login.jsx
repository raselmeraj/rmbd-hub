import { useState } from 'react';
const API_URL = import.meta.env.VITE_API_URL || "https://rmbd-hub-backend.vercel.app";
export default function Login({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!isLogin && password !== confirmPassword) { setError("Passwords don't match!"); return; }
    setLoading(true);
    try {
      const endpoint = isLogin ? `${API_URL}/api/auth/login` : `${API_URL}/api/auth/register`;
      const payload = isLogin ? { email: email||phone, password } : { name, email: email||phone, phone, password };
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error');
      if (data.token) localStorage.setItem('token', data.token);
      if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
      if (onLogin) onLogin(data); else { alert(isLogin?'Login Success!':'Account Created!'); if(!isLogin) setIsLogin(true); else window.location.href='/'; }
    } catch (err) {
      if (err.message.includes('Failed to fetch')) {
        if (isLogin) { alert(`Login Demo: ${email||phone}`); if(onLogin) onLogin({email}); }
        else { alert(`Registration Demo OK!\nName:${name}\nEmail:${email||phone}`); setIsLogin(true); }
      } else setError(err.message);
    } finally { setLoading(false); }
  };
  return (
    <div className="min-h-screen w-full bg-[#e89e9e] flex flex-col font-serif">
      <div className="w-full flex justify-between items-center p-3 md:p-4">
        <div className="w-10 h-10 rounded-full bg-[#fff6f0] flex items-center justify-center"><span className="text-[7px] font-bold">RMBD</span></div>
        <div className="text-center"><h1 className="text-[11px]">Welcome to Communication Social Site</h1><p className="text-[7px] tracking-widest">REPRESENTED BY RMBD HUB</p></div>
        <div className="w-10"></div>
      </div>
      <div className="flex-1 flex flex-col lg:flex-row px-4 gap-4 items-center justify-center py-2">
        <div className="flex-1 max-w-[45%]">
          <h1 className="text-3xl md:text-4xl font-serif leading-[0.9]">Talk<br/><span className="italic">less,</span><br/>connect<br/><span className="italic">more.</span></h1>
        </div>
        <div className="flex-1 max-w-[340px] w-full">
          <div className="bg-[#fff6f0] rounded-[16px] p-4 shadow-xl">
            <div className="flex gap-1.5 mb-3">
              <button type="button" onClick={()=>setIsLogin(true)} className={`flex-1 py-1.5 rounded-full text-[10px] font-bold ${isLogin?'bg-black text-white':'bg-[#f5e6d8]'}`}>LOGIN</button>
              <button type="button" onClick={()=>setIsLogin(false)} className={`flex-1 py-1.5 rounded-full text-[10px] font-bold ${!isLogin?'bg-black text-white':'bg-[#f5e6d8]'}`}>REGISTER</button>
            </div>
            <h2 className="text-[16px] font-serif">{isLogin?'Login your Identity':'Create Account'}</h2>
            {error && <div className="mt-2 bg-red-100 text-red-600 text-[9px] p-2 rounded-full text-center">{error}</div>}
            <form onSubmit={handleSubmit} className="mt-3 space-y-2.5">
              {!isLogin && <div><label className="text-[8px] font-semibold">Full Name</label><input value={name} onChange={e=>setName(e.target.value)} placeholder="Rasel Meraj" required={!isLogin} className="mt-1 w-full bg-[#f5e6d8]/70 rounded-full px-3 py-2 text-[11px]" /></div>}
              <div><label className="text-[8px] font-semibold">Email or Mobile</label><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@rmbd.hub or +880..." required className="mt-1 w-full bg-[#f5e6d8]/70 rounded-full px-3 py-2 text-[11px]" /></div>
              {!isLogin && <div><label className="text-[8px] font-semibold">Phone (Optional)</label><input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+880..." className="mt-1 w-full bg-[#f5e6d8]/70 rounded-full px-3 py-2 text-[11px]" /></div>}
              <div><label className="text-[8px] font-semibold">Password</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} required className="mt-1 w-full bg-[#f5e6d8]/70 rounded-full px-3 py-2 text-[11px]" /></div>
              {!isLogin && <div><label className="text-[8px] font-semibold">Confirm Password</label><input type="password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} required={!isLogin} className="mt-1 w-full bg-[#f5e6d8]/70 rounded-full px-3 py-2 text-[11px]" /></div>}
              <button type="submit" disabled={loading} className="w-full bg-black text-white rounded-full py-2.5 text-[11px] font-medium disabled:opacity-50">{loading?'Loading...':(isLogin?'Login':'Create Account')}</button>
            </form>
            <div className="mt-2 text-center"><p className="text-[9px]">{isLogin?"No account? ":"Have account? "}<button onClick={()=>setIsLogin(!isLogin)} className="font-bold underline">{isLogin?"Create New":"Login"}</button></p></div>
          </div>
        </div>
      </div>
    </div>
  );
}
