import { useState } from "react";

export default function Login({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState('');
  const [msg, setMsg] = useState('');

  const getUsers = () => { try { return JSON.parse(localStorage.getItem('rmbd_users') || '[]'); } catch { return []; } };
  const saveUsers = (u) => localStorage.setItem('rmbd_users', JSON.stringify(u));

  const handleAvatar = (e) => {
    const file = e.target.files[0]; if(!file) return;
    const r = new FileReader(); r.onload = (ev) => setAvatar(ev.target.result); r.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault(); setMsg('');
    const key = email.trim().toLowerCase();
    const users = getUsers();
    if (isLogin) {
      const user = users.find(x => x.email.toLowerCase() === key && x.password === password);
      if (user) { localStorage.setItem('currentUser', JSON.stringify(user)); localStorage.setItem('isLoggedIn','true'); onLogin(user); }
      else { setMsg('User not found! Please REGISTER first.'); }
    } else {
      if (users.find(x => x.email.toLowerCase() === key)) { setMsg('Already registered! Please LOGIN.'); setIsLogin(true); return; }
      if (!name.trim()) { setMsg('Name required!'); return; }
      const newUser = { id: Date.now(), name: name, email: key, password, avatar: avatar || '' };
      users.push(newUser); saveUsers(users); setMsg('Account Created! Now LOGIN.'); setIsLogin(true); setAvatar('');
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center p-4">
      <div className="max-w-6xl w-full flex flex-col lg:flex-row items-center justify-between gap-10">
        <div className="flex-1 text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
            <div className="w-20 h-20 bg-[#0866ff] rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-4xl">R</span>
            </div>
            <div>
              <h1 className="text-[#0866ff] font-black text-5xl leading-none tracking-tighter">RMBD-HUB</h1>
              <p className="text-gray-800 font-bold text-xl mt-1">সব বন্ধু একসাথে</p>
            </div>
          </div>
          <p className="text-[22px] leading-8 text-gray-800 max-w-[500px] mx-auto lg:mx-0">RMBD Hub helps you connect and share with the people in your life.</p>
        </div>

        <div className="bg-white rounded-xl shadow-[0_2px_15px_rgba(0,0,0,0.15)] p-5 w-full max-w-[400px]">
          <div className="flex gap-2 mb-4">
            <button type="button" onClick={() => setIsLogin(true)} className={`flex-1 py-2.5 rounded-lg font-bold transition ${isLogin ? "bg-[#0866ff] text-white" : "bg-gray-100 text-gray-700"}`}>Login</button>
            <button type="button" onClick={() => setIsLogin(false)} className={`flex-1 py-2.5 rounded-lg font-bold transition ${!isLogin ? "bg-[#0866ff] text-white" : "bg-gray-100 text-gray-700"}`}>Register</button>
          </div>

          {avatar && <img src={avatar} alt="preview" className="w-16 h-16 rounded-full mx-auto mb-3 object-cover border-2 border-blue-500" />}
          {msg && <div className={`mb-3 text-[12px] p-2.5 rounded-lg text-center ${msg.includes('Created') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{msg}</div>}

          <form onSubmit={handleSubmit} className="space-y-3">
            {!isLogin && (
              <>
                <input value={name} onChange={e=>setName(e.target.value)} placeholder="Full Name" required={!isLogin} className="w-full border border-gray-300 p-3.5 rounded-lg bg-[#f5f6f7] focus:outline-none focus:border-blue-500 text-[15px]" />
                <label className="w-full border border-dashed border-gray-300 p-2.5 rounded-lg bg-[#f5f6f7] text-[13px] text-center block cursor-pointer">📷 Profile Photo <input type="file" accept="image/*" onChange={handleAvatar} className="hidden" /></label>
              </>
            )}
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email address" required className="w-full border border-gray-300 p-3.5 rounded-lg bg-[#f5f6f7] focus:outline-none focus:border-blue-500 text-[15px]" />
            <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" type="password" required className="w-full border border-gray-300 p-3.5 rounded-lg bg-[#f5f6f7] focus:outline-none focus:border-blue-500 text-[15px]" />
            <button type="submit" className="w-full bg-[#0866ff] hover:bg-[#075eec] text-white py-3 rounded-lg font-bold text-[18px] transition">{isLogin ? 'Log in' : 'Create Account'}</button>
          </form>
          <p className="text-center text-[11px] text-gray-500 mt-4">Your Facebook is Live! 🔴</p>
        </div>
      </div>
    </div>
  );
}
