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
    if (!isLogin && password!== confirmPassword) { setMsg('Passwords do not match!'); return; }
    const key = email.trim().toLowerCase();
    const users = getUsers();
    if (isLogin) {
      const user = users.find(x => x.email.toLowerCase() === key && x.password === password);
      if (user) { localStorage.setItem('currentUser', JSON.stringify(user)); localStorage.setItem('isLoggedIn','true'); if(onLogin) onLogin(user); }
      else { setMsg('User not found! Please REGISTER first.'); }
    } else {
      if (users.find(x => x.email.toLowerCase() === key)) { setMsg('Already registered! Please LOGIN.'); setIsLogin(true); return; }
      const newUser = { id: Date.now(), name: name||'RMBD User', email: key, password };
      users.push(newUser); saveUsers(users); setMsg('Account Created! Now LOGIN.'); setIsLogin(true);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#e89e9e] flex flex-col font-serif overflow-hidden">
      <div className="flex-1 flex flex-col lg:flex-row px-4 md:px-8 gap-6 items-center justify-center py-4">
        <div className="flex-1 max-w-[45%]">
          <h1 className="text-4xl md:text-5xl font-serif leading-[0.9] text-black">Talk<br/><span className="italic font-light ml-1">less,</span><br/>connect<br/><span className="italic font-light ml-3">more.</span></h1>
        </div>
        <div className="flex-1 max-w- w-full">
          <div className="bg-[#fff6f0] rounded- p-5 shadow-xl">
            <div className="flex gap-1.5 mb-4">
              <button onClick={()=>{setIsLogin(true); setMsg('');}} className={`flex-1 py-2 rounded-full text- font-bold ${isLogin?'bg-black text-white':'bg-[#f5e6d8]'}`}>LOGIN</button>
              <button onClick={()=>{setIsLogin(false); setMsg('');}} className={`flex-1 py-2 rounded-full text- font-bold ${!isLogin?'bg-black text-white':'bg-[#f5e6d8]'}`}>REGISTER</button>
            </div>
            {msg && <div className="mt-3 text- p-2.5 rounded-xl text-center border bg-red-100">{msg}</div>}
            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              {!isLogin && <input value={name} onChange={e=>setName(e.target.value)} placeholder="Full Name" required className="w-full bg-[#f5e6d8]/70 rounded-full px-3.5 py-2.5 text- outline-none" />}
              <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email or Mobile" required className="w-full bg-[#f5e6d8]/70 rounded-full px-3.5 py-2.5 text- outline-none" />
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" required className="w-full bg-[#f5e6d8]/70 rounded-full px-3.5 py-2.5 text- outline-none" />
              {!isLogin && <input type="password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} placeholder="Confirm Password" required className="w-full bg-[#f5e6d8]/70 rounded-full px-3.5 py-2.5 text- outline-none" />}
              <button type="submit" className="w-full bg-black text-white rounded-full py-3 text-"> {isLogin? 'Login' : 'Create Account'} </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
