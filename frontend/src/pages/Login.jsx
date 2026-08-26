import { useState } from 'react';

export default function Login({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [msg, setMsg] = useState('');

  const getUsers = () => { try { return JSON.parse(localStorage.getItem('rmbd_users') || '[]'); } catch { return []; } };
  const saveUsers = (u) => localStorage.setItem('rmbd_users', JSON.stringify(u));

  const handleSubmit = (e) => {
    e.preventDefault(); setMsg('');
    if (!isLogin && password !== confirmPassword) { setMsg('Passwords do not match!'); return; }
    const key = email.trim().toLowerCase();
    const users = getUsers();
    if (isLogin) {
      const user = users.find(x => x.email.toLowerCase() === key && x.password === password);
      if (user) { localStorage.setItem('currentUser', JSON.stringify(user)); localStorage.setItem('isLoggedIn','true'); setMsg('Login Successful!'); if(onLogin) onLogin(user); else window.location.href='/'; }
      else { setMsg('User not found! Please REGISTER first.'); }
    } else {
      if (users.find(x => x.email.toLowerCase() === key)) { setMsg('Already registered! Please LOGIN.'); setIsLogin(true); return; }
      const newUser = { id: Date.now(), name: name||'RMBD User', email: key, password };
      users.push(newUser); saveUsers(users); setMsg('Account Created! Now LOGIN.'); setIsLogin(true); setName(''); setPassword(''); setConfirmPassword('');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#e89e9e] flex flex-col font-serif overflow-hidden">
      <div className="w-full flex justify-between items-center p-3 shrink-0">
        <div className="w-9 h-9 rounded-full bg-[#fff6f0] flex items-center justify-center shadow"><span className="text-[7px] font-bold">RMBD</span></div>
        <div className="text-center flex-1"><h1 className="text-[11px] font-serif">Welcome to Communication Social Site</h1><p className="text-[7px] tracking-[0.2em] opacity-60 font-sans">REPRESENTED BY RMBD HUB</p></div>
        <div className="w-9"></div>
      </div>
      <div className="flex-1 flex flex-col lg:flex-row px-4 md:px-8 gap-6 items-center justify-center py-4">
        <div className="flex-1 max-w-[45%]">
          <h1 className="text-4xl md:text-5xl font-serif leading-[0.9] text-black">Talk<br/><span className="italic font-light ml-1">less,</span><br/>connect<br/><span className="italic font-light ml-3">more.</span></h1>
          <p className="mt-4 text-[10px] bg-[#f5e6d8]/70 p-3 rounded-xl max-w-[280px] font-sans">RMBD Hub - A real social network where you can post, like, comment and share photos!</p>
        </div>
        <div className="flex-1 max-w-[360px] w-full">
          <div className="bg-[#fff6f0] rounded-[18px] p-5 shadow-xl">
            <div className="flex gap-1.5 mb-4">
              <button type="button" onClick={()=>{setIsLogin(true); setMsg('');}} className={`flex-1 py-2 rounded-full text-[10px] font-bold tracking-widest font-sans ${isLogin?'bg-black text-white':'bg-[#f5e6d8] text-black/50'}`}>LOGIN</button>
              <button type="button" onClick={()=>{setIsLogin(false); setMsg('');}} className={`flex-1 py-2 rounded-full text-[10px] font-bold tracking-widest font-sans ${!isLogin?'bg-black text-white':'bg-[#f5e6d8] text-black/50'}`}>REGISTER</button>
            </div>
            <h2 className="text-[18px] font-serif text-black">{isLogin ? 'Login your Identity' : 'Create Account'}</h2>
            {msg && <div className={`mt-3 text-[10px] p-2.5 rounded-xl text-center font-sans border ${msg.includes('Successful') || msg.includes('Created') ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>{msg}</div>}
            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              {!isLogin && <div><label className="text-[9px] font-semibold opacity-60 font-sans">Full Name</label><input value={name} onChange={e=>setName(e.target.value)} placeholder="Rasel Miah" required={!isLogin} className="mt-1 w-full bg-[#f5e6d8]/70 border border-black/5 rounded-full px-3.5 py-2.5 text-[11px] font-sans outline-none" /></div>}
              <div><label className="text-[9px] font-semibold opacity-60 font-sans">Email or Mobile</label><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="01842511200" required className="mt-1 w-full bg-[#f5e6d8]/70 border border-black/5 rounded-full px-3.5 py-2.5 text-[11px] font-sans outline-none" /></div>
              <div><label className="text-[9px] font-semibold opacity-60 font-sans">Password</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} required className="mt-1 w-full bg-[#f5e6d8]/70 border border-black/5 rounded-full px-3.5 py-2.5 text-[11px] font-sans outline-none" /></div>
              {!isLogin && <div><label className="text-[9px] font-semibold opacity-60 font-sans">Confirm Password</label><input type="password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} required={!isLogin} className="mt-1 w-full bg-[#f5e6d8]/70 border border-black/5 rounded-full px-3.5 py-2.5 text-[11px] font-sans outline-none" /></div>}
              <button type="submit" className="w-full bg-black text-white rounded-full py-3 text-[11px] font-medium font-sans"> {isLogin ? 'Login' : 'Create Account'} </button>
            </form>
            <p className="mt-3 text-center text-[10px] font-sans opacity-60">{isLogin ? "No account? " : "Have account? "}<button onClick={()=>{setIsLogin(!isLogin); setMsg('');}} className="font-bold text-black underline">{isLogin ? "Create New" : "Login"}</button></p>
          </div>
        </div>
      </div>
    </div>
  );
}
