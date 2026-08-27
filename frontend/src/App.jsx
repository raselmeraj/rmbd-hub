import { useState, useEffect } from 'react';
import { db } from './firebase';
import { ref, onValue, push, set } from 'firebase/database';
import Login from './Login.jsx';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [posts, setPosts] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => {
    if (localStorage.getItem('isLoggedIn') === 'true') setIsLoggedIn(true);
    const postsRef = ref(db, 'posts');
    return onValue(postsRef, (snap) => {
      const data = snap.val();
      if (data) {
        const arr = Object.keys(data).map(k => ({...data[k], id: k}));
        arr.sort((a,b)=> (b.createdAt||0)-(a.createdAt||0));
        setPosts(arr.filter(p => p.text && p.text.trim()!== ''));
      } else {
        setPosts([]);
      }
    });
  }, []);

  const handleLogin = () => {
    localStorage.setItem('isLoggedIn','true');
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    setIsLoggedIn(false);
    window.location.reload();
  };

  const handlePost = () => {
    if (!text.trim()) return;
    const r = push(ref(db, 'posts'));
    const u = JSON.parse(localStorage.getItem('currentUser') || '{"name":"Rasel Miah"}');
    set(r, { text, author: u.name || 'Rasel Miah', createdAt: Date.now() });
    setText('');
  };

  if (!isLoggedIn) return <Login onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-[#e89e9e] p-4 font-sans">
      <div className="max-w- mx-auto">
        <div className="flex justify-between items-center mb-5 bg-white/50 backdrop-blur p-3 rounded-2xl">
          <h1 className="font-bold text-">RMBD HUB - LIVE 🔴</h1>
          <button onClick={handleLogout} className="bg-black text-white px-5 py-2 rounded-full text- font-bold">Logout</button>
        </div>

        <div className="bg-white rounded- p-4 shadow-sm mb-5">
          <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="What's on your mind?" className="w-full bg-[#f5f5f5] rounded-xl p-3.5 text- outline-none min-h- resize-none" />
          <button onClick={handlePost} className="mt-3 w-full bg-black text-white rounded-full py-3 text- font-bold">Post</button>
        </div>

        <div className="space-y-3">
          {posts.length > 0? posts.map(p=>(
            <div key={p.id} className="bg-white rounded- p-4 shadow-sm">
              <p className="text- font-bold opacity-50">{p.author}</p>
              <p className="text- mt-2 leading-snug">{p.text}</p>
              <div className="flex gap-4 mt-3 pt-3 border-t border-black/5 text- opacity-60">
                <span>❤️ Like</span><span>💬 Comment</span><span>↗️ Share</span>
              </div>
            </div>
          )) : <p className="text-center text-sm mt-10 opacity-60">No posts yet. Be the first!</p>}
        </div>
      </div>
    </div>
  );
}
