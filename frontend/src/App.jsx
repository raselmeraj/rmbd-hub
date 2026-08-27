import { useState, useEffect } from 'react';
import { db } from './firebase';
import { ref, onValue, push, set } from 'firebase/database';
import Login from './Login.jsx';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [posts, setPosts] = useState([]);
  const [text, setText] = useState('');
  const [img, setImg] = useState('');
  const [showProfile, setShowProfile] = useState(null);
  const [cmt, setCmt] = useState({});

  useEffect(() => {
    if (localStorage.getItem('isLoggedIn') === 'true') setIsLoggedIn(true);
    const postsRef = ref(db, 'posts');
    return onValue(postsRef, (snap) => {
      const data = snap.val();
      if (!data) { setPosts([]); return; }
      // সব Post - কোনো Filter ছাড়া, সবাই সবার Post দেখবে
      const arr = Object.entries(data).map(([id, val]) => ({...val, id}));
      arr.sort((a,b) => (b.createdAt||0)-(a.createdAt||0));
      setPosts(arr);
    });
  }, []);

  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{"name":"Rasel Miah","email":"user@rmbd.com","avatar":""}');

  const handleLogin = () => { localStorage.setItem('isLoggedIn','true'); setIsLoggedIn(true); };
  const handleLogout = () => { localStorage.removeItem('isLoggedIn'); setIsLoggedIn(false); location.reload(); };

  const onImg = (e) => {
    const f = e.target.files[0]; if(!f) return;
    const r = new FileReader(); r.onload = ev => setImg(ev.target.result); r.readAsDataURL(f);
  };

  const doPost = () => {
    if(!text.trim() &&!img) return;
    const nr = push(ref(db, 'posts'));
    set(nr, { text, image: img, author: currentUser.name, authorEmail: currentUser.email, authorAvatar: currentUser.avatar||'', createdAt: Date.now() });
    setText(''); setImg('');
  };

  const changeAvatar = (e) => {
    const f = e.target.files[0]; if(!f) return;
    const r = new FileReader();
    r.onload = ev => {
      const newAv = ev.target.result;
      const users = JSON.parse(localStorage.getItem('rmbd_users')||'[]');
      const idx = users.findIndex(u=>u.email===currentUser.email);
      if(idx>=0){ users[idx].avatar=newAv; localStorage.setItem('rmbd_users', JSON.stringify(users)); localStorage.setItem('currentUser', JSON.stringify({...currentUser, avatar:newAv})); location.reload(); }
    };
    r.readAsDataURL(f);
  };

  if(!isLoggedIn) return <Login onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-[#e89e9e] p-4 font-sans">
      <div className="max-w- mx-auto">
        <div className="flex justify-between items-center mb-4 bg-white/80 p-3 rounded-2xl">
          <h1 className="font-bold text-">RMBD HUB - LIVE 🔴</h1>
          <div className="flex items-center gap-2">
            <button onClick={()=>setShowProfile(currentUser)} className="text- font-bold flex items-center gap-2">{currentUser.avatar && <img src={currentUser.avatar} className="w-7 h-7 rounded-full object-cover" />}{currentUser.name}</button>
            <button onClick={handleLogout} className="bg-black text-white px-4 py-1.5 rounded-full text-">Logout</button>
          </div>
        </div>

        <div className="bg-white rounded- p-4 mb-4">
          <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="What's on your mind, Rasel?" className="w-full bg-[#f5f5f5] rounded-xl p-3 text- outline-none min-h-" />
          {img && <img src={img} className="mt-3 rounded-xl w-full max-h- object-cover" />}
          <div className="flex justify-between items-center mt-3">
            <label className="text- bg-[#f5f5f5] px-3 py-2 rounded-full cursor-pointer">📷 Photo <input type="file" accept="image/*" onChange={onImg} className="hidden" /></label>
            <button onClick={doPost} className="bg-black text-white px-8 py-2.5 rounded-full text- font-bold">Post</button>
          </div>
        </div>

        <p className="text- mb-2 opacity-60 text-center">{posts.length} Posts - সবাই সবার Post দেখতে পারবে</p>

        {posts.map(p=>(
          <div key={p.id} className="bg-white rounded- p-4 mb-3">
            <div className="flex items-center gap-2">
              {p.authorAvatar? <img src={p.authorAvatar} className="w-8 h-8 rounded-full object-cover" /> : <div className="w-8 h-8 bg-[#e89e9e] rounded-full flex items-center justify-center text- font-bold">{p.author?.[0]}</div>}
              <div><p className="text- font-bold">{p.author}</p><p className="text- opacity-50">{new Date(p.createdAt||Date.now()).toLocaleString()}</p></div>
            </div>
            <p className="text- mt-3">{p.text}</p>
            {p.image && <img src={p.image} className="mt-3 rounded-xl w-full object-cover" />}
          </div>
        ))}

        {showProfile && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50" onClick={()=>setShowProfile(null)}>
            <div className="bg-white rounded- p-6 w-full max-w- text-center" onClick={e=>e.stopPropagation()}>
              {showProfile.avatar? <img src={showProfile.avatar} className="w-24 h-24 rounded-full mx-auto object-cover border-2 border-black" /> : <div className="w-24 h-24 bg-[#e89e9e] rounded-full mx-auto flex items-center justify-center text-3xl font-bold">{showProfile.name?.[0]}</div>}
              <h2 className="font-bold mt-3">{showProfile.name}</h2>
              <p className="text- opacity-60">{showProfile.email}</p>
              <label className="block mt-5 bg-black text-white px-5 py-2.5 rounded-full text- font-bold cursor-pointer">📷 Change Photo<input type="file" accept="image/*" onChange={changeAvatar} className="hidden" /></label>
              <button onClick={()=>setShowProfile(null)} className="mt-3 w-full bg-[#f5f5f5] py-2.5 rounded-full text- font-bold">Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
