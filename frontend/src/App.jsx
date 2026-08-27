import { useState, useEffect } from 'react';
import { db } from './firebase';
import { ref, onValue, push, set } from 'firebase/database';
import Login from './Login.jsx';

function safeKey(email) {
  return email.replace(/[^a-zA-Z0-9]/g, '_');
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [posts, setPosts] = useState([]);
  const [text, setText] = useState('');
  const [img, setImg] = useState('');
  const [showProfile, setShowProfile] = useState(null);
  const [cmt, setCmt] = useState({});

  useEffect(() => {
    if (localStorage.getItem('isLoggedIn') === 'true') setIsLoggedIn(true);
    const r = ref(db, 'posts');
    return onValue(r, (snap) => {
      const d = snap.val();
      if (!d) { setPosts([]); return; }
      const arr = Object.keys(d).map(k => ({...d[k], id: k, likes: d[k].likes || {}, comments: d[k].comments || {} }));
      arr.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setPosts(arr.filter(p => p.text || p.image));
    });
  }, []);

  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{"name":"Rasel Miah","email":"user@rmbd.com","avatar":""}');

  const onLogin = () => { localStorage.setItem('isLoggedIn', 'true'); setIsLoggedIn(true); };
  const onLogout = () => { localStorage.removeItem('isLoggedIn'); setIsLoggedIn(false); window.location.reload(); };

  const onImg = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImg(ev.target.result);
    reader.readAsDataURL(f);
  };

  const doPost = () => {
    if (!text.trim() &&!img) return;
    const newRef = push(ref(db, 'posts'));
    set(newRef, { text, image: img, author: currentUser.name, authorEmail: currentUser.email, authorAvatar: currentUser.avatar || '', likes: {}, comments: {}, createdAt: Date.now() });
    setText(''); setImg('');
  };

  const doLike = (p) => {
    const key = safeKey(currentUser.email);
    const has = p.likes && p.likes[key];
    const likeRef = ref(db, `posts/${p.id}/likes/${key}`);
    if (has) { set(likeRef, null); } else { set(likeRef, { name: currentUser.name }); }
  };

  const doComment = (p) => {
    const t = cmt[p.id];
    if (!t ||!t.trim()) return;
    const cr = push(ref(db, `posts/${p.id}/comments`));
    set(cr, { text: t, author: currentUser.name });
    setCmt({...cmt, [p.id]: '' });
  };

  const changeAvatar = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const newAv = ev.target.result;
      const users = JSON.parse(localStorage.getItem('rmbd_users') || '[]');
      const idx = users.findIndex(u => u.email === currentUser.email);
      if (idx >= 0) {
        users[idx].avatar = newAv;
        localStorage.setItem('rmbd_users', JSON.stringify(users));
        const cu = {...currentUser, avatar: newAv };
        localStorage.setItem('currentUser', JSON.stringify(cu));
        setShowProfile(cu);
        window.location.reload();
      }
    };
    reader.readAsDataURL(f);
  };

  if (!isLoggedIn) return <Login onLogin={onLogin} />;

  return (
    <div className="min-h-screen bg-[#e89e9e] p-4">
      <div className="max-w- mx-auto">
        <div className="flex justify-between items-center mb-4 bg-white/70 p-3 rounded-2xl">
          <h1 className="font-bold text-">RMBD HUB - LIVE 🔴</h1>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowProfile(currentUser)} className="text- font-bold underline">{currentUser.name}</button>
            <button onClick={onLogout} className="bg-black text-white px-4 py-1.5 rounded-full text-">Logout</button>
          </div>
        </div>

        <div className="bg-white rounded- p-4 mb-4">
          <textarea value={text} onChange={e => setText(e.target.value)} placeholder="What's on your mind?" className="w-full bg-[#f5f5f5] rounded-xl p-3 text- outline-none min-h-" />
          {img && <img src={img} alt="preview" className="mt-3 rounded-xl w-full max-h- object-cover" />}
          <div className="flex justify-between items-center mt-3">
            <label className="text- bg-[#f5f5f5] px-3 py-2 rounded-full cursor-pointer">📷 Photo <input type="file" accept="image/*" onChange={onImg} className="hidden" /></label>
            <button onClick={doPost} className="bg-black text-white px-8 py-2.5 rounded-full text- font-bold">Post</button>
          </div>
        </div>

        {posts.map(p => (
          <div key={p.id} className="bg-white rounded- p-4 mb-3">
            <div className="flex items-center gap-2">
              {p.authorAvatar? <img src={p.authorAvatar} alt="av" className="w-8 h-8 rounded-full object-cover" /> : <div className="w-8 h-8 bg-[#e89e9e] rounded-full flex items-center justify-center text- font-bold">{p.author?.[0]}</div>}
              <p onClick={() => setShowProfile({ name: p.author, email: p.authorEmail, avatar: p.authorAvatar })} className="text- font-bold cursor-pointer hover:underline">{p.author}</p>
            </div>
            <p className="text- mt-2">{p.text}</p>
            {p.image && <img src={p.image} alt="post" className="mt-3 rounded-xl w-full max-h- object-cover" />}
            <div className="flex gap-5 mt-3 pt-3 border-t text-">
              <button onClick={() => doLike(p)} className={p.likes && p.likes[safeKey(currentUser.email)]? 'text-red-500 font-bold' : 'opacity-60'}>❤️ Like ({Object.keys(p.likes || {}).length})</button>
              <span className="opacity-60">💬 {Object.keys(p.comments || {}).length}</span>
            </div>
            <div className="mt-3">
              {Object.values(p.comments || {}).map((cc, i) => <p key={i} className="text- bg-[#f5f5f5] rounded-full px-3 py-1.5 mt-1"><b>{cc.author}:</b> {cc.text}</p>)}
              <div className="flex gap-2 mt-2">
                <input value={cmt[p.id] || ''} onChange={e => setCmt({...cmt, [p.id]: e.target.value })} placeholder="Write a comment..." className="flex-1 bg-[#f5f5f5] rounded-full px-3 py-1.5 text- outline-none" />
                <button onClick={() => doComment(p)} className="bg-black text-white px-4 rounded-full text-">Send</button>
              </div>
            </div>
          </div>
        ))}

        {showProfile && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowProfile(null)}>
            <div className="bg-white rounded-2xl p-6 w-full max-w- text-center" onClick={e => e.stopPropagation()}>
              {showProfile.avatar? <img src={showProfile.avatar} alt="av" className="w-20 h-20 rounded-full mx-auto object-cover" /> : <div className="w-20 h-20 bg-[#e89e9e] rounded-full mx-auto flex items-center justify-center text-2xl font-bold">{showProfile.name?.[0]}</div>}
              <h2 className="font-bold mt-3">{showProfile.name}</h2>
              <p className="text- opacity-60 mt-1">{showProfile.email}</p>
              {showProfile.email === currentUser.email && (
                <label className="block mt-4 bg-black text-white px-4 py-2 rounded-full text- cursor-pointer">📷 Change Photo<input type="file" accept="image/*" onChange={changeAvatar} className="hidden" /></label>
              )}
              <button onClick={() => setShowProfile(null)} className="mt-3 w-full bg-[#f5f5f5] py-2 rounded-full text-xs">Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
