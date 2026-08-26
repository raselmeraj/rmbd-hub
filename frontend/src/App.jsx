import { useState, useEffect } from 'react';
import { db } from './firebase';
import { ref, onValue, set, push } from 'firebase/database';
import Login from './Login.jsx';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [posts, setPosts] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => {
    if(localStorage.getItem('isLoggedIn') === 'true') setIsLoggedIn(true);

    const postsRef = ref(db, 'posts');
    return onValue(postsRef, (snap) => {
      const val = snap.val();
      if(val){
        const arr = Object.keys(val).map(k => ({...val[k], id: k}));
        arr.sort((a,b)=> (b.createdAt||0)-(a.createdAt||0));
        setPosts(arr);
      } else {
        setPosts([]);
      }
    });
  }, []);

  const handleLogin = () => {
    localStorage.setItem('isLoggedIn','true');
    setIsLoggedIn(true);
  };

  const handlePost = () => {
    if(!text.trim()) return;
    const newRef = push(ref(db, 'posts'));
    set(newRef, {
      text: text,
      author: 'Rasel Miah',
      createdAt: Date.now()
    });
    setText('');
  };

  if(!isLoggedIn) return <Login onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-[#e89e9e] p-4 font-sans">
      <div className="max-w- mx-auto">
        <h1 className="text-center font-bold mb-4 text-xl">RMBD HUB - LIVE 🔴</h1>
        <div className="bg-white rounded-2xl p-4 shadow mb-4">
          <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="What's on your mind?" className="w-full bg-gray-100 rounded-xl p-3 text-sm outline-none min-h-"></textarea>
          <button onClick={handlePost} className="mt-3 w-full bg-black text-white rounded-full py-2.5 text-sm font-bold">Post</button>
        </div>
        <div className="space-y-3">
          {posts && posts.length > 0? posts.map((p)=>(
            <div key={p.id} className="bg-white rounded-2xl p-4 shadow">
              <p className="text-xs font-bold opacity-60">{p.author || 'User'}</p>
              <p className="text-sm mt-1">{p.text || ''}</p>
            </div>
          )) : <p className="text-center text-sm mt-10 opacity-70">No posts yet. Be the first! 👇</p>}
        </div>
      </div>
    </div>
  );
}
