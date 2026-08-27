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
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('isLoggedIn') === 'true') setIsLoggedIn(true);
    const postsRef = ref(db, 'posts');
    return onValue(postsRef, (snap) => {
      const data = snap.val();
      if (!data) { setPosts([]); return; }
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
    if(!text.trim() && !img) return;
    const nr = push(ref(db, 'posts'));
    set(nr, { text, image: img, author: currentUser.name, authorEmail: currentUser.email, authorAvatar: currentUser.avatar||'', createdAt: Date.now() });
    setText(''); setImg('');
  };

  const openProfile = (p) => {
    // যদি নিজের Post হয়
    if (p.authorEmail === currentUser.email) {
      setIsOwnProfile(true);
      setShowProfile(currentUser);
    } else {
      // অন্যের Post - অন্যের Profile দেখাও
      setIsOwnProfile(false);
      setShowProfile({ name: p.author, email: p.authorEmail, avatar: p.authorAvatar || '' });
    }
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
    <div className="min-h-screen bg-[#f0f2f5] font-sans">
      <div className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-[600px] mx-auto flex justify-between items-center p-3">
          <h1 className="font-black text-[22px] text-[#0866ff]">rmbd-hub</h1>
          <div className="flex items-center gap-3">
            <button onClick={()=>{ setIsOwnProfile(true); setShowProfile(currentUser); }} className="flex items-center gap-2 text-[13px] font-bold">
              {currentUser.avatar ? <img src={currentUser.avatar} alt="av" className="w-8 h-8 rounded-full object-cover" /> : <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center font-bold">{currentUser.name?.[0]}</div>}
              {currentUser.name}
            </button>
            <button onClick={handleLogout} className="bg-gray-200 px-3 py-1.5 rounded-full text-[11px] font-bold">Logout</button>
          </div>
        </div>
      </div>

      <div className="max-w-[600px] mx-auto p-3">
        <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
          <div className="flex gap-3">
            {currentUser.avatar ? <img src={currentUser.avatar} alt="av" className="w-10 h-10 rounded-full object-cover" /> : <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold">{currentUser.name?.[0]}</div>}
            <textarea value={text} onChange={e=>setText(e.target.value)} placeholder={`What's on your mind, ${currentUser.name}?`} className="flex-1 bg-[#f0f2f5] rounded-2xl p-3 text-[15px] outline-none min-h-[50px] resize-none" />
          </div>
          {img && <img src={img} alt="preview" className="mt-3 rounded-xl w-full max-h-[350px] object-cover" />}
          <div className="flex justify-between items-center mt-3 pt-3 border-t">
            <label className="text-[13px] font-bold text-gray-500 px-3 py-2 rounded-lg hover:bg-gray-100 cursor-pointer">📷 Photo <input type="file" accept="image/*" onChange={onImg} className="hidden" /></label>
            <button onClick={doPost} className="bg-[#0866ff] text-white px-6 py-2 rounded-full text-[14px] font-bold">Post</button>
          </div>
        </div>

        {posts.map(p=>(
          <div key={p.id} className="bg-white rounded-xl p-4 mb-3 shadow-sm">
            <div className="flex items-center gap-3 cursor-pointer" onClick={()=>openProfile(p)}>
              {p.authorAvatar? <img src={p.authorAvatar} alt="av" className="w-10 h-10 rounded-full object-cover" /> : <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold">{p.author?.[0]}</div>}
              <div>
                <p className="text-[14px] font-bold hover:underline">{p.author}</p>
                <p className="text-[11px] text-gray-500">{new Date(p.createdAt||Date.now()).toLocaleDateString()}</p>
              </div>
            </div>
            {p.text && <p className="text-[15px] mt-3 leading-snug">{p.text}</p>}
            {p.image && <img src={p.image} alt="post" className="mt-3 rounded-xl w-full object-cover max-h-[500px]" />}
          </div>
        ))}

        {posts.length===0 && <p className="text-center text-gray-500 mt-10 text-sm">No posts yet. Be the first to post!</p>}
      </div>

      {showProfile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={()=>setShowProfile(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-[350px] text-center" onClick={e=>e.stopPropagation()}>
            {showProfile.avatar? <img src={showProfile.avatar} alt="av" className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-white shadow-lg" /> : <div className="w-24 h-24 bg-[#0866ff] rounded-full mx-auto flex items-center justify-center text-3xl font-bold text-white">{showProfile.name?.[0]}</div>}
            <h2 className="font-bold mt-4 text-[20px]">{showProfile.name}</h2>
            <p className="text-[12px] text-gray-500 mt-1">{showProfile.email}</p>
            {isOwnProfile ? (
              <>
                <label className="block mt-5 bg-[#0866ff] text-white px-5 py-2.5 rounded-full text-[13px] font-bold cursor-pointer">📷 Change Profile Photo<input type="file" accept="image/*" onChange={changeAvatar} className="hidden" /></label>
                <p className="text-[10px] text-gray-400 mt-2">Click to change your photo</p>
              </>
            ) : (
              <p className="text-[12px] text-gray-500 mt-4 bg-gray-100 p-2 rounded-lg">This is {showProfile.name}'s profile</p>
            )}
            <button onClick={()=>setShowProfile(null)} className="mt-4 w-full bg-gray-200 py-2.5 rounded-full text-[13px] font-bold">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
