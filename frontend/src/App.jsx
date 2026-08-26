import { useState, useEffect } from 'react';
import Login from './pages/Login.jsx';

function Feed({ user, onLogout }) {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [newImage, setNewImage] = useState(null);
  const [commentText, setCommentText] = useState({});

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('rmbd_posts') || '[]');
    if (saved.length === 0) {
      const defaultPosts = [
        { id: 1, author: 'RMBD Hub Official', email: 'official@rmbd.hub', content: 'Welcome to RMBD Hub! 🎉 Talk less, connect more. এখানে সবাই পোস্ট করতে পারবে, লাইক কমেন্ট করতে পারবে! আপনার যাত্রা শুরু করুন!', image: null, likes: 12, likedBy: [], comments: [{ user: 'Rasel Miah', text: 'First comment! Amazing!' }], time: new Date().toISOString() },
        { id: 2, author: 'Rasel Miah', email: '01842511200', content: 'আমার নতুন সোশ্যাল সাইট! সবাই জয়েন করো! rmbd-hub.vercel.app', image: null, likes: 5, likedBy: [], comments: [], time: new Date(Date.now() - 3600000).toISOString() }
      ];
      setPosts(defaultPosts);
      localStorage.setItem('rmbd_posts', JSON.stringify(defaultPosts));
    } else {
      setPosts(saved);
    }
  }, []);

  const savePosts = (newPosts) => {
    setPosts(newPosts);
    localStorage.setItem('rmbd_posts', JSON.stringify(newPosts));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setNewImage(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleCreatePost = () => {
    if (!newPost.trim() && !newImage) return;
    const post = {
      id: Date.now(),
      author: user?.name || 'User',
      email: user?.email || 'user',
      content: newPost,
      image: newImage,
      likes: 0,
      likedBy: [],
      comments: [],
      time: new Date().toISOString()
    };
    const updated = [post, ...posts];
    savePosts(updated);
    setNewPost('');
    setNewImage(null);
  };

  const handleLike = (postId) => {
    const updated = posts.map(p => {
      if (p.id === postId) {
        const alreadyLiked = p.likedBy?.includes(user?.email);
        return {
          ...p,
          likes: alreadyLiked ? p.likes - 1 : p.likes + 1,
          likedBy: alreadyLiked ? p.likedBy.filter(e => e !== user?.email) : [...(p.likedBy || []), user?.email]
        };
      }
      return p;
    });
    savePosts(updated);
  };

  const handleComment = (postId) => {
    const text = commentText[postId];
    if (!text?.trim()) return;
    const updated = posts.map(p => {
      if (p.id === postId) {
        return { ...p, comments: [...p.comments, { user: user?.name || 'User', text }] };
      }
      return p;
    });
    savePosts(updated);
    setCommentText({ ...commentText, [postId]: '' });
  };

  const timeAgo = (iso) => {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'Just now';
    if (m < 60) return m + 'm ago';
    const h = Math.floor(m / 60);
    if (h < 24) return h + 'h ago';
    return Math.floor(h / 24) + 'd ago';
  };

  return (
    <div className="min-h-screen bg-[#f9f1e8] font-sans">
      <div className="sticky top-0 z-20 w-full bg-[#e89e9e] px-3 md:px-6 py-2.5 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-[#fff6f0] flex items-center justify-center text-[8px] font-bold shadow">RMBD</div>
          <span className="font-serif font-bold text-[16px]">RMBD HUB</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] hidden md:block">Hi, {user?.name}</span>
          <button onClick={onLogout} className="bg-black text-white rounded-full px-4 py-1.5 text-[10px] font-bold">Logout</button>
        </div>
      </div>

      <div className="max-w-[600px] mx-auto p-3 md:p-4 space-y-4">
        <div className="bg-white rounded-[18px] p-4 shadow-sm border border-black/5">
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center text-[11px] font-bold shrink-0">{(user?.name || 'U')[0]}</div>
            <div className="flex-1">
              <textarea value={newPost} onChange={e=>setNewPost(e.target.value)} placeholder={`What's on your mind, ${user?.name}?`} className="w-full bg-[#f5e6d8]/60 rounded-2xl p-3 text-[12px] outline-none resize-none min-h-[60px]" rows={2} />
              {newImage && <div className="mt-2 relative"><img src={newImage} className="rounded-xl max-h-[200px] w-full object-cover" /><button onClick={()=>setNewImage(null)} className="absolute top-1 right-1 bg-black text-white rounded-full w-6 h-6 text-[10px]">✕</button></div>}
              <div className="flex justify-between items-center mt-3">
                <label className="text-[10px] bg-[#f5e6d8] px-3 py-1.5 rounded-full cursor-pointer font-bold">📷 Photo<input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" /></label>
                <button onClick={handleCreatePost} className="bg-black text-white rounded-full px-5 py-2 text-[11px] font-bold">Post</button>
              </div>
            </div>
          </div>
        </div>

        {posts.map(post => (
          <div key={post.id} className="bg-white rounded-[18px] p-4 shadow-sm border border-black/5">
            <div className="flex gap-3 items-start">
              <div className="w-9 h-9 rounded-full bg-[#e89e9e] flex items-center justify-center text-[11px] font-bold shrink-0">{post.author[0]}</div>
              <div className="flex-1">
                <p className="text-[12px] font-bold">{post.author}</p>
                <p className="text-[9px] opacity-50">{timeAgo(post.time)} • {post.email}</p>
              </div>
            </div>
            <p className="text-[12px] mt-3 leading-relaxed whitespace-pre-wrap">{post.content}</p>
            {post.image && <img src={post.image} className="mt-3 rounded-xl w-full max-h-[350px] object-cover" />}
            <div className="flex gap-4 mt-3 text-[10px] opacity-60 border-t pt-2.5">
              <button onClick={()=>handleLike(post.id)} className={`flex items-center gap-1.5 font-bold ${post.likedBy?.includes(user?.email) ? 'text-red-500' : ''}`}>❤️ {post.likes} Like</button>
              <span className="flex items-center gap-1">💬 {post.comments.length} Comment</span>
            </div>
            <div className="mt-3 space-y-2">
              {post.comments.map((c,i)=>(
                <div key={i} className="bg-[#f5e6d8]/60 rounded-xl px-3 py-2">
                  <p className="text-[10px] font-bold">{c.user}</p>
                  <p className="text-[10px]">{c.text}</p>
                </div>
              ))}
              <div className="flex gap-2 mt-2">
                <input value={commentText[post.id] || ''} onChange={e=>setCommentText({...commentText, [post.id]: e.target.value})} placeholder="Write a comment..." className="flex-1 bg-[#f5e6d8]/60 rounded-full px-3 py-2 text-[10px] outline-none" />
                <button onClick={()=>handleComment(post.id)} className="bg-black text-white rounded-full px-3 py-1.5 text-[10px]">Send</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const logged = localStorage.getItem('isLoggedIn') === 'true';
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (logged && user) { setIsLoggedIn(true); setCurrentUser(user); }
  }, []);

  const handleLogin = (user) => {
    setIsLoggedIn(true);
    setCurrentUser(user);
    localStorage.setItem('isLoggedIn', 'true');
  };
  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    setIsLoggedIn(false);
    setCurrentUser(null);
  };

  if (!isLoggedIn) return <Login onLogin={handleLogin} />;
  return <Feed user={currentUser} onLogout={handleLogout} />;
}
