import { useState } from 'react';

export default function Login({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const getUsers = () => {
    try { return JSON.parse(localStorage.getItem('rmbd_users') || '[]'); } catch { return []; }
  };
  const saveUsers = (users) => localStorage.setItem('rmbd_users', JSON.stringify(users));

  const handleSubmit = (e) => {
    e.preventDefault();
    setMsg('');
    if (!isLogin && password !== confirmPassword) { setMsg('Passwords do not match!'); return; }
    if (password.length < 4) { setMsg('Password must be at least 4 characters'); return; }
    setLoading(true);
    setTimeout(() => {
      const users = getUsers();
      const key = email.trim().toLowerCase();
      if (isLogin) {
        const user = users.find(u => u.email.toLowerCase() === key && u.password === password);
        if (user) {
          localStorage.setItem('currentUser', JSON.stringify(user));
          setMsg('Login Successful! Redirecting...');
          if (onLogin) onLogin(user);
          else setTimeout(()=> { window.location.href = '/'; }, 800);
        } else {
          setMsg('User not found or wrong password. Please register first with this number.');
        }
      } else {
        if (users.find(u => u.email.toLowerCase() === key)) { 
          setMsg('This email/phone already registered! Please login.'); 
          setLoading(false); 
          return; 
        }
        const newUser = { id: Date.now(), name: name || 'RMBD User', email: key, password, createdAt: new Date().toISOString() };
        users.push(newUser);
        saveUsers(users);
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        setMsg('Account Created Successfully! Please login now.');
        setIsLogin(true);
        setName(''); setPassword(''); setConfirmPassword('');
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen w-full bg-[#e89e9e] flex flex-col font-serif overflow-hidden">
      <div className="w-full flex justify-between items-center p-3 shrink-0">
        <div className="w-9 h-9 rounded-full bg-[#fff6f0] flex items-center justify-center shadow"><span className="text-[7px] font-bold">RMBD</span></div>
        <div className="text-center"><h1 className="text-[11px]">Welcome to Communication Social Site</h1><p className="text-[7px] tracking-widest opacity-60">REPRESENTED BY RMBD HUB</p></div>
        <div className="w-9"></div>
      </div>
      <div className="flex-1 flex flex-col lg:flex-row px-4 gap-4 items-center justify-center">
        <div className="flex-1 max-w-[45%]">
          <h1 className="text-3xl md:text-4xl font-serif leading-[0.9]">Talk<br/><span className="italic">less,</span><br/>connect<br/><span className="italic">more.</span></h1>
          <p className="mt-3 text-[10px] bg-[#f5e6d8]/60 p-2 rounded-xl max-w-[260px]">RMBD Hub helps you connect and share with the people in your life.</p>
        </div>
        <div className="flex-1 max-w-[340px] w-full">
          <div className="bg-[#fff6f0] rounded-[16px] p-4 shadow-xl">
            <div className="flex gap-1.5 mb-3">
              <button type="button" onClick={()=>{setIsLogin(true); setMsg('');}} className={`flex-1 py-1.5 rounded-full text-[10px] font-bold ${isLogin?'bg-black text-white':'bg-[#f5e6d8] text-black/50'}`}>LOGIN</button>
              <button type="button" onClick={()=>{setIsLogin(false); setMsg('');}} className={`flex-1 py-1.5 rounded-full text-[10px] font-bold ${!isLogin?'bg-black text-white':'bg-[#f5e6d8] text-black/50'}`}>REGISTER</button>
            </div>
            <h2 className="text-[16px] font-serif">{isLogin?'Login your Identity':'Create Account'}</h2>
            {msg && <div className={`mt-2 text-[9px] p-2 rounded-full text-center ${msg.includes('Success')?'bg-green-100 text-green-700 border border-green-200':'bg-red-100 text-red-600 border border-red-200'}`}>{msg}</div>}
            <form onSubmit={handleSubmit} className="mt-3 space-y-2.5">
              {!isLogin && <div><label className="text-[8px] font-semibold opacity-60">Full Name</label><input value={name} onChange={e=>setName(e.target.value)} placeholder="RMBD" required={!isLogin} className="mt-1 w-full bg-[#f5e6d8]/70 rounded-full px-3 py-2 text-[11px] outline-none" /></div>}
              <div><label className="text-[8px] font-semibold opacity-60">Email or Mobile - 01842...</label><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="01842511200" required className="mt-1 w-full bg-[#f5e6d8]/70 rounded-full px-3 py-2 text-[11px] outline-none" /></div>
              <div><label className="text-[8px] font-semibold opacity-60">Password</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} required className="mt-1 w-full bg-[#f5e6d8]/70 rounded-full px-3 py-2 text-[11px] outline-none" /></div>
              {!isLogin && <div><label className="text-[8px] font-semibold opacity-60">Confirm Password</label><input type="password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} required={!isLogin} className="mt-1 w-full bg-[#f5e6d8]/70 rounded-full px-3 py-2 text-[11px] outline-none" /></div>}
              <button type="submit" disabled={loading} className="w-full bg-black text-white rounded-full py-2.5 text-[11px] disabled:opacity-50">{loading?'Please wait...':(isLogin?'Login':'Create Account')}</button>
            </form>
            <p className="mt-2 text-center text-[9px]">{isLogin?"No account? ":"Have account? "}<button onClick={()=>setIsLogin(!isLogin)} className="font-bold underline">{isLogin?"Create New":"Login"}</button></p>
          </div>
        </div>
      </div>
    </div>
  );
}
