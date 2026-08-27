import { useState, useEffect } from 'react';
import { db } from './firebase';
import { ref, onValue, push, set } from 'firebase/database';
import Login from './Login.jsx';

function safeKey(email) { return email ? email.replace(/[^a-zA-Z0-9]/g, '_') : 'guest'; }

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [posts, setPosts] = useState([]);
  const [text, setText] = useState('');
  const [img, setImg] = useState('');
  const [showProfile, setShowProfile] = useState(null);
  const [isOwn, setIsOwn] = useState(false);
  const [cmt, setCmt] = useState({});
  const [reply, setReply] = useState({});
  const [openReply, setOpenReply] = useState(null);

  useEffect(() => {
    if (localStorage.getItem('isLoggedIn') === 'true') setIsLoggedIn(true);
    return onValue(ref(db, 'posts'), (snap) => {
      const data = snap.val();
      if (!data) { setPosts([]); return; }
      const arr = Object.entries(data).map(([id, v]) => ({...v, id, likes: v.likes||{}, comments: v.comments||{}}));
      arr.sort((a,b) => (b.createdAt||0)-(a.createdAt||0));
      setPosts(arr);
    });
  }, []);

  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{"name":"User","email":"a@b.com","avatar":""}');
  const myKey = safeKey(currentUser.email);

  const doPost = () => {
    if(!text.trim() && !img) return;
    const nr = push(ref(db, 'posts'));
    set(nr, { text, image: img, author: currentUser.name, authorEmail: currentUser.email, authorAvatar: currentUser.avatar||'', likes: {}, comments: {}, createdAt: Date.now() });
    setText(''); setImg('');
  };

  const doLike = (p) => {
    const r = ref(db, `posts/${p.id}/likes/${myKey}`);
    if (p.likes && p.likes[myKey]) set(r, null); else set(r, { name: currentUser.name });
  };

  const doComment = (p) => {
    const t = cmt[p.id]; if(!t || !t.trim()) return;
    const cr = push(ref(db, `posts/${p.id}/comments`));
    set(cr, { text: t, author: currentUser.name, authorAvatar: currentUser.avatar||'', at: Date.now(), replies: {} });
    setCmt({...cmt, [p.id]: ''});
  };

  const doReply = (p, cid) => {
    const t = reply[cid]; if(!t || !t.trim()) return;
    const rr = push(ref(db, `posts/${p.id}/comments/${cid}/replies`));
    set(rr, { text: t, author: currentUser.name, at: Date.now() });
    setReply({...reply, [cid]: ''}); setOpenReply(null);
  };

  const doShare = (p) => {
    const url = window.location.href;
    if (navigator.share) navigator.share({ title: p.author, text: p.text, url }).catch(()=>{});
    else { navigator.clipboard.writeText(url); alert('Link copied! Share anywhere 📋'); }
  };

  const openProf = (p) => {
    if (p.authorEmail === currentUser.email) { setIsOwn(true); setShowProfile(currentUser); }
    else { setIsOwn(false); setShowProfile({ name: p.author, email: p.authorEmail, avatar: p.authorAvatar||'' }); }
  };

  const changeAv = (e) => {
    const f = e.target.files[0]; if(!f) return;
    const r = new FileReader(); r.onload = ev => {
      const newAv = ev.target.result;
      const users = JSON.parse(localStorage.getItem('rmbd_users')||'[]');
      const idx = users.findIndex(u=>u.email===currentUser.email);
      if(idx>=0){ users[idx].avatar=newAv; localStorage.setItem('rmbd_users', JSON.stringify(users)); localStorage.setItem('currentUser', JSON.stringify({...currentUser, avatar:newAv})); location.reload(); }
    }; r.readAsDataURL(f);
  };

  if(!isLoggedIn) return <Login onLogin={()=>{localStorage.setItem('isLoggedIn','true'); setIsLoggedIn(true);}} />;

  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      <div className="bg-white shadow sticky top-0 z-20">
        <div className="max-w-[600px] mx-auto flex justify-between items-center p-3">
          <h1 className="font-black text-[22px] text-[#0866ff]">rmbd-hub</h1>
          <div className="flex items-center gap-3">
            <button onClick={()=>{ setIsOwn(true); setShowProfile(currentUser); }} className="flex items-center gap-2 font-bold text-[13px]">
              {currentUser.avatar ? <img src={currentUser.avatar} className="w-8 h-8 rounded-full object-cover" /> : <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">{currentUser.name[0]}</div>}
              {currentUser.name}
            </button>
            <button onClick={()=>{localStorage.removeItem('isLoggedIn'); location.reload();}} className="bg-gray-200 px-3 py-1 rounded-full text-[11px] font-bold">Logout</button>
          </div>
        </div>
      </div>

      <div className="max-w-[600px] mx-auto p-3">
        <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold">{currentUser.name[0]}</div>
            <textarea value={text} onChange={e=>setText(e.target.value)} placeholder={`What's on your mind, ${currentUser.name}?`} className="flex-1 bg-[#f0f2f5] rounded-2xl p-3 text-[15px] outline-none min-h-[50px]" />
          </div>
          {img && <img src={img} className="mt-3 rounded-xl w-full" />}
          <div className="flex justify-between mt-3 border-t pt-3">
            <label className="font-bold text-gray-500 text-[13px] px-3 py-2 hover:bg-gray-100 rounded-lg cursor-pointer">📷 Photo<input type="file" accept="image/*" onChange={e=>{const f=e.target.files[0]; if(!f)return; const r=new FileReader(); r.onload=ev=>setImg(ev.target.result); r.readAsDataURL(f);}} className="hidden" /></label>
            <button onClick={doPost} className="bg-[#0866ff] text-white px-6 py-2 rounded-full font-bold text-[14px]">Post</button>
          </div>
        </div>

        {posts.map(p=>{
          const lc = Object.keys(p.likes||{}).length;
          const cc = Object.entries(p.comments||{}).map(([id,v])=>({id,...v}));
          const liked = p.likes && p.likes[myKey];
          return (
          <div key={p.id} className="bg-white rounded-xl p-4 mb-3 shadow-sm">
            <div className="flex items-center gap-3 cursor-pointer" onClick={()=>openProf(p)}>
              {p.authorAvatar? <img src={p.authorAvatar} className="w-10 h-10 rounded-full object-cover" /> : <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold">{p.author?.[0]}</div>}
              <div><p className="font-bold text-[14px]">{p.author}</p><p className="text-[11px] text-gray-500">{new Date(p.createdAt||Date.now()).toLocaleDateString()}</p></div>
            </div>
            {p.text && <p className="mt-3 text-[15px]">{p.text}</p>}
            {p.image && <img src={p.image} className="mt-3 rounded-xl w-full" />}
            <div className="flex justify-between text-[12px] text-gray-500 mt-3">
              <span>{lc>0? `${lc} Likes`:''}</span><span>{cc.length>0? `${cc.length} Comments`:''}</span>
            </div>
            <div className="flex border-t border-b py-1 mt-2">
              <button onClick={()=>doLike(p)} className={`flex-1 py-1.5 font-bold text-[13px] rounded-lg ${liked?'text-[#0866ff] bg-blue-50':'text-gray-500 hover:bg-gray-100'}`}>{liked?'👍 Liked':'👍 Like'}</button>
              <button onClick={()=>document.getElementById(`c-${p.id}`)?.focus()} className="flex-1 py-1.5 font-bold text-[13px] text-gray-500 hover:bg-gray-100 rounded-lg">💬 Comment</button>
              <button onClick={()=>doShare(p)} className="flex-1 py-1.5 font-bold text-[13px] text-gray-500 hover:bg-gray-100 rounded-lg">↗️ Share</button>
            </div>
            <div className="mt-3 space-y-2">
              {cc.map(c=>(
                <div key={c.id} className="flex gap-2">
                  <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center text-[10px] font-bold">{c.author?.[0]}</div>
                  <div className="flex-1">
                    <div className="bg-[#f0f2f5] rounded-2xl px-3 py-2"><p className="font-bold text-[12px]">{c.author}</p><p className="text-[13px]">{c.text}</p></div>
                    <div className="flex gap-3 ml-3 mt-1"><button onClick={()=>setOpenReply(openReply===c.id?null:c.id)} className="text-[11px] font-bold text-gray-500">Reply</button><span className="text-[10px] text-gray-400">{c.replies? Object.keys(c.replies).length+' replies':''}</span></div>
                    {c.replies && Object.entries(c.replies).map(([rid,r])=>(<div key={rid} className="flex gap-2 mt-2 ml-6"><div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-[9px] font-bold">{r.author?.[0]}</div><div className="bg-[#e4e6eb] rounded-2xl px-3 py-1 flex-1"><p className="font-bold text-[11px]">{r.author}</p><p className="text-[12px]">{r.text}</p></div></div>))}
                    {openReply===c.id && <div className="flex gap-2 mt-2"><input value={reply[c.id]||''} onChange={e=>setReply({...reply, [c.id]: e.target.value})} placeholder={`Reply to ${c.author}...`} className="flex-1 bg-[#f0f2f5] rounded-full px-3 py-1.5 text-[12px] outline-none" /><button onClick={()=>doReply(p,c.id)} className="bg-[#0866ff] text-white px-3 rounded-full text-[11px] font-bold">Reply</button></div>}
                  </div>
                </div>
              ))}
              <div className="flex gap-2 mt-3">
                <input id={`c-${p.id}`} value={cmt[p.id]||''} onChange={e=>setCmt({...cmt, [p.id]: e.target.value})} placeholder="Write a comment..." className="flex-1 bg-[#f0f2f5] rounded-full px-3 py-2 text-[13px] outline-none" onKeyDown={e=>{ if(e.key==='Enter') doComment(p); }} />
                <button onClick={()=>doComment(p)} className="text-[#0866ff] font-bold text-[13px]">Post</button>
              </div>
            </div>
          </div>
        )})}
      </div>

      {showProfile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={()=>setShowProfile(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-[350px] text-center" onClick={e=>e.stopPropagation()}>
            {showProfile.avatar? <img src={showProfile.avatar} className="w-24 h-24 rounded-full mx-auto object-cover" /> : <div className="w-24 h-24 bg-[#0866ff] rounded-full mx-auto flex items-center justify-center text-3xl font-bold text-white">{showProfile.name?.[0]}</div>}
            <h2 className="font-bold mt-4 text-[20px]">{showProfile.name}</h2>
            <p className="text-[12px] text-gray-500">{showProfile.email}</p>
            {isOwn ? <label className="block mt-5 bg-[#0866ff] text-white px-5 py-2.5 rounded-full text-[13px] font-bold cursor-pointer">📷 Change Photo<input type="file" accept="image/*" onChange={changeAv} className="hidden" /></label> : <p className="text-[12px] text-gray-500 mt-4 bg-gray-100 p-2 rounded-lg">Profile of {showProfile.name}</p>}
            <button onClick={()=>setShowProfile(null)} className="mt-4 w-full bg-gray-200 py-2.5 rounded-full text-[13px] font-bold">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
