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
        // খালি post filter
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
    const user = JSON.parse(localStorage.getItem('currentUser') || '{"name":"Rasel Miah"}');
    set(r, { text, author: user.name || 'Rasel Miah', createdAt: Date.now() });
    setText('');
  };

  if (!isLoggedIn) return <Login onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-[#e89e9e] p-4">
      <div className="max-w- mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="font-bold text-lg">RMBD HUB - LIVE 🔴</h1>
          <button onClick={handleLogout} className="bg-black text-white px-5 py-2 rounded-full text-xs font-bold">Logout</button>
        </div>

        <div className="bg-white rounded-2xl p-4 mb-4 shadow">
          <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="What's on your mind?" className="w-full bg-gray-100 rounded-xl p-3 text-sm outline-none min-h-" />
          <button onClick={handlePost} className="mt-3 w-full bg-black text-white rounded-full py-2.5 text-sm font-bold">Post</button>
        </div>

        <div className="space-y-3">
          {posts.map(p=>(
            <div key={p.id} className="bg-white rounded-2xl p-4 shadow">
              <p className="text-xs font-bold opacity-60">{p.author}</p>
              <p className="text-sm mt-1">{p.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
