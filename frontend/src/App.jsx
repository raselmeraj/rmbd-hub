import { useState, useEffect } from 'react';
import { db } from './firebase';
import { ref, onValue, push, set, update } from 'firebase/database';
import Login from './Login.jsx';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [posts, setPosts] = useState([]);
  const [text, setText] = useState('');
  const [image, setImage] = useState('');
  const [showProfile, setShowProfile] = useState(null);
  const [commentText, setCommentText] = useState({});

  useEffect(() => {
    if (localStorage.getItem('isLoggedIn') === 'true') setIsLoggedIn(true);
    const postsRef = ref(db, 'posts');
    return onValue(postsRef, (snap) => {
      const data = snap.val();
      if (data) {
        const arr = Object.keys(data).map(k => ({...data[k], id: k, likes: data[k].likes || {}, comments: data[k].comments || {}}));
        arr.sort((a,b)=> (b.createdAt||0)-(a.createdAt||0));
        setPosts(arr.filter(p => p.text || p.image));
      } else setPosts([]);
    });
  }, []);

  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{"name":"Rasel Miah","email":"user@rmbd.com"}');

  const handleLogin = () => { localStorage.setItem('isLoggedIn','true'); setIsLoggedIn(true); };
  const handleLogout = () => { localStorage.removeItem('isLoggedIn'); setIsLoggedIn(false); window.location.reload(); };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImage(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handlePost = () => {
    if (!text.trim() &&!image) return;
    const r = push(ref(db, 'posts'));
    set(r, { text, image, author: currentUser.name, authorEmail: currentUser.email, likes: {}, comments: {}, createdAt: Date.now() });
    setText(''); setImage('');
  };

  const handleLike = (post) => {
    const likeRef = ref(db, `posts/${post.id}/likes/${currentUser.email.replace(/[^a-zA-Z0-9]/g,'_')}`);
    const hasLiked = post.likes && post.likes[currentUser.email.replace(/[^a-zA-Z0-9]/g,'_')];
    if (hasLiked) { update(ref(db, `posts/${post.id}/likes`), {[currentUser.email.replace(/[^a-zA-Z0-9]/g,'_')]: null}); }
    else { set(likeRef, { name: currentUser.name, at: Date.now() }); }
  };

  const handleComment = (post) => {
    const txt = commentText[post.id];
    if (!txt?.trim()) return;
    const cRef = push(ref(db, `posts/${post.id}/comments`));
    set(cRef, { text: txt, author: currentUser.name, at: Date.now() });
    setCommentText({...commentText, [post.id]: ''});
  };

  if (!isLoggedIn) return <Login onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-[#e89e9e] p-4 font-sans">
      <div className="max-w- mx-auto">
        <div className="flex justify-between items-center mb-5 bg-white/60 p-3 rounded-2xl">
          <h1 className="font-bold text-">RMBD HUB - LIVE 🔴</h1>
          <div className="flex gap-2 items-center">
            <button onClick={()=>setShowProfile(currentUser)} className="text- font-bold underline">{currentUser.name}</button>
            <button onClick={handleLogout} className="bg-black text-white px-4 py-1.5 rounded-full text-">Logout</button>
          </div>
        </div>

        <div className="bg-white rounded- p-4 mb-5">
          <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="What's on your mind?" className="w-full bg-[#f5f5f5] rounded-xl p-3 text- outline-none min-h-" />
          {image && <img src={image} className="mt-3 rounded-xl max-h- w-full object-cover" />}
          <div className="flex justify-between items-center mt-3">
            <label className="text- bg-[#f5f5f5] px-3 py-2 rounded-full cursor-pointer">📷 Photo <input type="file" accept="image/*" onChange={handleImage} className="hidden" /></label>
            <button onClick={handlePost} className="bg-black text-white px-8 py-2.5 rounded-full text- font-bold">Post</button>
          </div>
        </div>

        {posts.map(p=>(
          <div key={p.id} className="bg-white rounded- p-4 mb-3">
            <p onClick={()=>setShowProfile({name:p.author, email:p.authorEmail})} className="text- font-bold cursor-pointer hover:underline">{p.author}</p>
            <p className="text- mt-2">{p.text}</p>
            {p.image && <img src={p.image} className="mt-3 rounded-xl w-full max-h- object-cover" />}
            <div className="flex gap-5 mt-3 pt-3 border-t text-">
              <button onClick={()=>handleLike(p)} className={`${p.likes && p.likes[currentUser.email.replace(/[^a-zA-Z0-9]/g,'_')]? 'text-red-500 font-bold' : 'opacity-60'}`}>❤️ Like ({Object.keys(p.likes||{}).length})</button>
              <span className="opacity-60">💬 {Object.keys(p.comments||{}).length} Comments</span>
            </div>
            <div className="mt-3">
              {Object.values(p.comments||{}).map((c,i)=><p key={i} className="text- bg-[#f5f5f5] rounded-full px-3 py-1.5 mt-1"><b>{c.author}:</b> {c.text}</p>)}
              <div className="flex gap-2 mt-2">
                <input value={commentText[p.id]||''} onChange={e=>setCommentText({...commentText, [p.id]: e.target.value})} placeholder="Write a comment..." className="flex-1 bg-[#f5f5f5] rounded-full px-3 py-1.5 text- outline-none" />
                <button onClick={()=>handleComment(p)} className="bg-black text-white px-4 rounded-full text-">Send</button>
              </div>
            </div>
          </div>
        ))}

        {showProfile && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={()=>setShowProfile(null)}>
            <div className="bg-white rounded-2xl p-6 w-full max-w- text-center" onClick={e=>e.stopPropagation()}>
              <div className="w-16 h-16 bg-[#e89e9e] rounded-full mx-auto flex items-center justify-center text-xl font-bold">{showProfile.name?.[0]}</div>
              <h2 className="font-bold mt-3">{showProfile.name}</h2>
              <p className="text- opacity-60 mt-1">{showProfile.email}</p>
              <button onClick={()=>setShowProfile(null)} className="mt-4 bg-black text-white px-6 py-2 rounded-full text-xs">Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
