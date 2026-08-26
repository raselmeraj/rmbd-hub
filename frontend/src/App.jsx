import { useState, useEffect } from 'react';
import Login from './pages/Login.jsx';

function Feed({ user, posts, onLike, onComment, commentText, setCommentText, newPost, setNewPost, newImage, setNewImage, onCreatePost, onImageUpload, onViewProfile, onLogout, onNavigate }) {
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
        <div className="flex items-center gap-2 cursor-pointer" onClick={()=>onNavigate('feed')}>
          <div className="w-9 h-9 rounded-full bg-[#fff6f0] flex items-center justify-center text-[8px] font-bold shadow overflow-hidden">
            {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : 'RMBD'}
          </div>
          <span className="font-serif font-bold text-[16px]">RMBD HUB</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={()=>onViewProfile(user)} className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-[11px] font-bold overflow-hidden">
            {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : (user?.name||'U')[0]}
          </button>
          <span className="text-[11px] hidden md:block cursor-pointer" onClick={()=>onViewProfile(user)}>Hi, {user?.name}</span>
          <button onClick={onLogout} className="bg-black text-white rounded-full px-4 py-1.5 text-[10px] font-bold">Logout</button>
        </div>
      </div>

      <div className="max-w-[600px] mx-auto p-3 md:p-4 space-y-4">
        <div className="bg-white rounded-[18px] p-4 shadow-sm border border-black/5">
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center text-[11px] font-bold shrink-0 overflow-hidden cursor-pointer" onClick={()=>onViewProfile(user)}>
              {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : (user?.name || 'U')[0]}
            </div>
            <div className="flex-1">
              <textarea value={newPost} onChange={e=>setNewPost(e.target.value)} placeholder={`What's on your mind, ${user?.name}?`} className="w-full bg-[#f5e6d8]/60 rounded-2xl p-3 text-[12px] outline-none resize-none min-h-[60px]" rows={2} />
              {newImage && <div className="mt-2 relative"><img src={newImage} className="rounded-xl max-h-[200px] w-full object-cover" /><button onClick={()=>setNewImage(null)} className="absolute top-1 right-1 bg-black text-white rounded-full w-6 h-6 text-[10px]">✕</button></div>}
              <div className="flex justify-between items-center mt-3">
                <label className="text-[10px] bg-[#f5e6d8] px-3 py-1.5 rounded-full cursor-pointer font-bold">📷 Photo<input type="file" accept="image/*" onChange={onImageUpload} className="hidden" /></label>
                <button onClick={onCreatePost} className="bg-black text-white rounded-full px-5 py-2 text-[11px] font-bold">Post</button>
              </div>
            </div>
          </div>
        </div>

        {posts.map(post => (
          <div key={post.id} className="bg-white rounded-[18px] p-4 shadow-sm border border-black/5">
            <div className="flex gap-3 items-start">
              <div onClick={()=>onViewProfile({ name: post.author, email: post.email, avatar: post.authorAvatar })} className="w-9 h-9 rounded-full bg-[#e89e9e] flex items-center justify-center text-[11px] font-bold shrink-0 cursor-pointer overflow-hidden">
                {post.authorAvatar ? <img src={post.authorAvatar} className="w-full h-full object-cover" /> : post.author[0]}
              </div>
              <div className="flex-1">
                <p onClick={()=>onViewProfile({ name: post.author, email: post.email, avatar: post.authorAvatar })} className="text-[12px] font-bold cursor-pointer hover:underline">{post.author}</p>
                <p className="text-[9px] opacity-50">{timeAgo(post.time)} • {post.email}</p>
              </div>
            </div>
            <p className="text-[12px] mt-3 leading-relaxed whitespace-pre-wrap">{post.content}</p>
            {post.image && <img src={post.image} className="mt-3 rounded-xl w-full max-h-[350px] object-cover" />}
            <div className="flex gap-4 mt-3 text-[10px] opacity-60 border-t pt-2.5">
              <button onClick={()=>onLike(post.id)} className={`flex items-center gap-1.5 font-bold ${post.likedBy?.includes(user?.email) ? 'text-red-500' : ''}`}>❤️ {post.likes} Like</button>
              <span className="flex items-center gap-1">💬 {post.comments.length} Comment</span>
            </div>
            <div className="mt-3 space-y-2">
              {post.comments.map((c,i)=>(
                <div key={i} className="bg-[#f5e6d8]/60 rounded-xl px-3 py-2">
                  <p onClick={()=>onViewProfile({ name: c.user, email: c.email || c.user, avatar: c.avatar })} className="text-[10px] font-bold cursor-pointer hover:underline">{c.user}</p>
                  <p className="text-[10px]">{c.text}</p>
                </div>
              ))}
              <div className="flex gap-2 mt-2">
                <input value={commentText[post.id] || ''} onChange={e=>setCommentText({...commentText, [post.id]: e.target.value})} placeholder="Write a comment..." className="flex-1 bg-[#f5e6d8]/60 rounded-full px-3 py-2 text-[10px] outline-none" />
                <button onClick={()=>onComment(post.id)} className="bg-black text-white rounded-full px-3 py-1.5 text-[10px]">Send</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Profile({ profileUser, posts, currentUser, onBack, onLike, onComment, commentText, setCommentText, onUpdateAvatar }) {
  const userPosts = posts.filter(p => p.author === profileUser.name || p.email === profileUser.email);
  const isOwn = currentUser?.email === profileUser.email;
  const [isEditingPic, setIsEditingPic] = useState(false);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        onUpdateAvatar(ev.target.result);
        setIsEditingPic(false);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f1e8] font-sans">
      <div className="w-full bg-[#e89e9e] px-3 md:px-6 py-2.5 flex justify-between items-center">
        <button onClick={onBack} className="bg-black text-white rounded-full px-4 py-1.5 text-[10px] font-bold">← Back to Feed</button>
        <span className="font-serif font-bold">Profile</span>
        <div className="w-20"></div>
      </div>

      <div className="max-w-[600px] mx-auto">
        <div className="bg-white rounded-b-[24px] p-6 shadow-sm text-center border-b">
          <div className="relative w-24 h-24 mx-auto">
            <div className="w-24 h-24 rounded-full bg-[#e89e9e] flex items-center justify-center text-3xl font-bold overflow-hidden">
              {profileUser.avatar ? <img src={profileUser.avatar} className="w-full h-full object-cover" /> : profileUser.name[0]}
            </div>
            {isOwn && (
              <label className="absolute bottom-0 right-0 bg-black text-white w-7 h-7 rounded-full flex items-center justify-center text-[10px] cursor-pointer border-2 border-white">
                📷
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </label>
            )}
          </div>
          <h1 className="text-2xl font-serif mt-3 font-bold">{profileUser.name}</h1>
          <p className="text-[11px] opacity-60 mt-1">{profileUser.email}</p>
          {isOwn && <p className="text-[9px] opacity-50 mt-2">Click 📷 to change profile picture</p>}
          <div className="flex justify-center gap-6 mt-4">
            <div><p className="font-bold text-sm">{userPosts.length}</p><p className="text-[10px] opacity-60">Posts</p></div>
            <div><p className="font-bold text-sm">{userPosts.reduce((a,p)=>a+p.likes,0)}</p><p className="text-[10px] opacity-60">Likes</p></div>
            <div><p className="font-bold text-sm">{userPosts.reduce((a,p)=>a+p.comments.length,0)}</p><p className="text-[10px] opacity-60">Comments</p></div>
          </div>
          {isOwn && <p className="mt-4 text-[10px] bg-green-100 text-green-700 inline-block px-3 py-1 rounded-full">This is your profile</p>}
        </div>

        <div className="p-3 md:p-4 space-y-4">
          <h2 className="font-bold text-[13px]">{profileUser.name}'s Posts ({userPosts.length})</h2>
          {userPosts.length === 0 && <div className="bg-white rounded-xl p-6 text-center text-[11px] opacity-60">No posts yet! Start posting from feed!</div>}
          {userPosts.map(post => (
            <div key={post.id} className="bg-white rounded-[18px] p-4 shadow-sm border border-black/5">
              <p className="text-[12px] leading-relaxed">{post.content}</p>
              {post.image && <img src={post.image} className="mt-3 rounded-xl w-full max-h-[300px] object-cover" />}
              <div className="flex gap-4 mt-3 text-[10px] opacity-60 border-t pt-2.5">
                <button onClick={()=>onLike(post.id)} className={`font-bold ${post.likedBy?.includes(currentUser?.email) ? 'text-red-500' : ''}`}>❤️ {post.likes} Like</button>
                <span>💬 {post.comments.length} Comment</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [newImage, setNewImage] = useState(null);
  const [commentText, setCommentText] = useState({});
  const [view, setView] = useState('feed');
  const [selectedProfile, setSelectedProfile] = useState(null);

  useEffect(() => {
    const logged = localStorage.getItem('isLoggedIn') === 'true';
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (logged && user) { setIsLoggedIn(true); setCurrentUser(user); }
    const saved = JSON.parse(localStorage.getItem('rmbd_posts') || '[]');
    if (saved.length === 0) {
      const defaultPosts = [
        { id: 1, author: 'RMBD Hub Official', email: 'official@rmbd.hub', content: 'Welcome to RMBD Hub! 🎉 Profile Picture Change করা যায়! নিজের Profile এ গিয়ে 📷 Click করুন!', image: null, likes: 13, likedBy: [], comments: [{ user: 'Rasel Miah', text: 'First comment! Amazing!' }], time: new Date().toISOString(), authorAvatar: null },
        { id: 2, author: 'Rasel Miah', email: '01842511200', content: 'আমার নতুন সোশ্যাল সাইট! এখন Profile Picture Change করা যায়!', image: null, likes: 5, likedBy: [], comments: [], time: new Date(Date.now() - 3600000).toISOString(), authorAvatar: null }
      ];
      setPosts(defaultPosts);
      localStorage.setItem('rmbd_posts', JSON.stringify(defaultPosts));
    } else setPosts(saved);
  }, []);

  const savePosts = (newPosts) => { setPosts(newPosts); localStorage.setItem('rmbd_posts', JSON.stringify(newPosts)); };
  
  const handleImageUpload = (e) => { const file = e.target.files[0]; if (file) { const reader = new FileReader(); reader.onload = (ev) => setNewImage(ev.target.result); reader.readAsDataURL(file); } };

  const handleCreatePost = () => {
    if (!newPost.trim() && !newImage) return;
    const post = { id: Date.now(), author: currentUser?.name || 'User', email: currentUser?.email || 'user', content: newPost, image: newImage, likes: 0, likedBy: [], comments: [], time: new Date().toISOString(), authorAvatar: currentUser?.avatar || null };
    savePosts([post, ...posts]); setNewPost(''); setNewImage(null);
  };

  const handleLike = (postId) => {
    const updated = posts.map(p => {
      if (p.id === postId) {
        const alreadyLiked = p.likedBy?.includes(currentUser?.email);
        return { ...p, likes: alreadyLiked ? p.likes - 1 : p.likes + 1, likedBy: alreadyLiked ? p.likedBy.filter(e => e !== currentUser?.email) : [...(p.likedBy || []), currentUser?.email] };
      }
      return p;
    }); savePosts(updated);
  };

  const handleComment = (postId) => {
    const text = commentText[postId]; if (!text?.trim()) return;
    const updated = posts.map(p => p.id === postId ? { ...p, comments: [...p.comments, { user: currentUser?.name || 'User', text, email: currentUser?.email, avatar: currentUser?.avatar }] } : p);
    savePosts(updated); setCommentText({ ...commentText, [postId]: '' });
  };

  const handleViewProfile = (profileUser) => {
    const allUsers = JSON.parse(localStorage.getItem('rmbd_users') || '[]');
    const fullUser = allUsers.find(u => u.email === profileUser.email) || profileUser;
    setSelectedProfile(fullUser);
    setView('profile');
  };

  const handleUpdateAvatar = (newAvatar) => {
    const allUsers = JSON.parse(localStorage.getItem('rmbd_users') || '[]');
    const updatedUsers = allUsers.map(u => u.email === currentUser.email ? { ...u, avatar: newAvatar } : u);
    localStorage.setItem('rmbd_users', JSON.stringify(updatedUsers));
    const updatedCurrent = { ...currentUser, avatar: newAvatar };
    localStorage.setItem('currentUser', JSON.stringify(updatedCurrent));
    setCurrentUser(updatedCurrent);
    setSelectedProfile(updatedCurrent);
    const updatedPosts = posts.map(p => p.email === currentUser.email ? { ...p, authorAvatar: newAvatar } : p);
    savePosts(updatedPosts);
  };

  const handleBack = () => setView('feed');
  const handleLogin = (user) => { setIsLoggedIn(true); setCurrentUser(user); localStorage.setItem('isLoggedIn', 'true'); };
  const handleLogout = () => { localStorage.removeItem('isLoggedIn'); localStorage.removeItem('currentUser'); setIsLoggedIn(false); setCurrentUser(null); setView('feed'); };

  if (!isLoggedIn) return <Login onLogin={handleLogin} />;
  if (view === 'profile' && selectedProfile) return <Profile profileUser={selectedProfile} posts={posts} currentUser={currentUser} onBack={handleBack} onLike={handleLike} onComment={handleComment} commentText={commentText} setCommentText={setCommentText} onUpdateAvatar={handleUpdateAvatar} />;
  return <Feed user={currentUser} posts={posts} onLike={handleLike} onComment={handleComment} commentText={commentText} setCommentText={setCommentText} newPost={newPost} setNewPost={setNewPost} newImage={newImage} setNewImage={setNewImage} onCreatePost={handleCreatePost} onImageUpload={handleImageUpload} onViewProfile={handleViewProfile} onLogout={handleLogout} onNavigate={setView} />;
}
