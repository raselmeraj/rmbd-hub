import { useState, useEffect } from 'react';
import { db, ref, onValue, set, push, update } from './firebase';
import Login from './Login.jsx';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');
  const [currentUser, setCurrentUser] = useState(() => { try { return JSON.parse(localStorage.getItem('currentUser')||'null'); } catch { return null; } });
  const [posts, setPosts] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => {
    const postsRef = ref(db, 'posts');
    return onValue(postsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.values(data);
        list.sort((a,b) => (b.createdAt||0) - (a.createdAt||0));
        setPosts(list);
      } else {
        setPosts([]);
      }
    });
  }, []);

  const handleLogin = (u) => { setCurrentUser(u); setIsLoggedIn(true); };

  const handlePost = () => {
    if(!text.trim()) return;
    const newPostRef = push(ref(db, 'posts'));
    set(newPostRef, {
      id: newPostRef.key,
      text: text,
      author: currentUser?.name || 'Rasel',
      email: currentUser?.email || '',
      createdAt: Date.now(),
      likes: {},
      comments: []
    });
    setText('');
  };

  if (!isLoggedIn) return <Login onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-[#e89e9e] p-4 font-sans">
      <div className="max-w- mx-auto">
        <div className="bg-[#fff6f0] rounded- p-4 shadow mb-4">
          <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="What's on your mind?" className="w-full bg-[#f5e6d8]/70 rounded-xl p-3 text-sm outline-none min-h-"></textarea>
          <button onClick={handlePost} className="mt-3 w-full bg-black text-white rounded-full py-2.5 text-sm">Post</button>
        </div>
        <div className="space-y-4">
          {posts && posts.length > 0? posts.map((p) => (
            <div key={p.id} className="bg-[#fff6f0] rounded- p-4 shadow">
              <p className="text-xs font-bold opacity-60">{p.author || 'User'}</p>
              <p className="text-sm mt-2">{p.text || ''}</p>
            </div>
          )) : <p className="text-center text-sm opacity-60 mt-10">No posts yet. Be the first!</p>}
        </div>
      </div>
    </div>
  );
}
