import { useState, useEffect, useRef } from 'react';
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
  const [notifs, setNotifs] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [showMessenger, setShowMessenger] = useState(false);
  const [messages, setMessages] = useState([]);
  const [msgText, setMsgText] = useState('');
  const [chatUser, setChatUser] = useState(null);
  const [callType, setCallType] = useState(null); // 'video' | 'audio'
  const [callUser, setCallUser] = useState(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const localVideoRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (localStorage.getItem('isLoggedIn') === 'true') setIsLoggedIn(true);
    onValue(ref(db, 'posts'), (snap) => {
      const data = snap.val();
      if (!data) { setPosts([]); return; }
      const arr = Object.entries(data).map(([id, v]) => ({...v, id, likes: v.likes||{}, comments: v.comments||{}}));
      arr.sort((a,b) => (b.createdAt||0)-(a.createdAt||0));
      setPosts(arr);
    });
    onValue(ref(db, 'messages'), (snap) => {
      const data = snap.val();
      if (!data) { setMessages([]); return; }
      const arr = Object.entries(data).map(([id, v])=>({id, ...v}));
      arr.sort((a,b)=>a.at-b.at);
      setMessages(arr);
    });
    onValue(ref(db, 'calls'), (snap)=>{
      const data=snap.val();
      if(!data) return;
      const arr=Object.values(data);
      const incoming = arr.find(c=> c.to===JSON.parse(localStorage.getItem('currentUser')||'{}').email && c.status==='ringing');
      if(incoming){ setCallType(incoming.type); setCallUser({name:incoming.from, email:incoming.fromEmail}); setIsCallActive(true); }
    });
  }, []);

  useEffect(()=>{ chatEndRef.current?.scrollIntoView({behavior:'smooth'}); }, [messages, showMessenger, chatUser]);
  useEffect(()=>{
    if(isCallActive && callType==='video' && localVideoRef.current){
      navigator.mediaDevices.getUserMedia({video:true, audio:true}).then(s=>{ localVideoRef.current.srcObject=s; }).catch(()=>{});
    }
    if(isCallActive && callType==='audio' && localVideoRef.current){
      navigator.mediaDevices.getUserMedia({audio:true}).then(s=>{ /* audio only */ }).catch(()=>{});
    }
  }, [isCallActive, callType]);

  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{"name":"User","email":"a@b.com","avatar":""}');
  const allUsers = JSON.parse(localStorage.getItem('rmbd_users')||'[]');
  const myKey = safeKey(currentUser.email);

  useEffect(()=>{
    const myPosts = posts.filter(p=>p.authorEmail===currentUser.email);
    let n = [];
    myPosts.forEach(p=>{
      Object.entries(p.likes||{}).forEach(([k,v])=>{ if(k!==myKey) n.push({id: p.id+'_'+k, text: `${v.name||k} liked your post`, time: Date.now() }); });
      Object.entries(p.comments||{}).forEach(([cid,c])=>{ if(c.author!==currentUser.name) n.push({id: cid, text: `${c.author} commented: ${c.text?.slice(0,30)}`, time: c.at }); });
    });
    n.sort((a,b)=>b.time-a.time);
    setNotifs(n.slice(0,10));
  }, [posts]);

  const doPost = () => {
    if(!text.trim() && !img) return;
    const nr = push(ref(db, 'posts'));
    set(nr, { text, image: img, author: currentUser.name, authorEmail: currentUser.email, authorAvatar: currentUser.avatar||'', likes: {}, comments: {}, createdAt: Date.now() });
    setText(''); setImg('');
  };
  const doLike = (p) => { const r = ref(db, `posts/${p.id}/likes/${myKey}`); if (p.likes && p.likes[myKey]) set(r, null); else set(r, { name: currentUser.name, at: Date.now() }); };
  const doComment = (p) => {
    const t = cmt[p.id]; if(!t || !t.trim()) return;
    const cr = push(ref(db, `posts/${p.id}/comments`));
    set(cr, { text: t, author: currentUser.name, authorAvatar: currentUser.avatar||'', at: Date.now(), replies: {} });
    setCmt({...cmt, [p.id]: ''});
  };
  const doShare = (p) => { navigator.clipboard.writeText(window.location.href); alert('Link copied! 📋'); };

  const sendMessage = (extra={}) => {
    if(!msgText.trim() && !extra.image && !extra.file) return;
    const mr = push(ref(db, 'messages'));
    set(mr, { text: msgText, from: currentUser.name, fromEmail: currentUser.email, to: chatUser?.email||'all', avatar: currentUser.avatar||'', at: Date.now(), type: extra.type||'text', image: extra.image||'', fileName: extra.fileName||'', fileData: extra.fileData||'' });
    setMsgText('');
  };

  const handleImageSend = (e)=>{
    const f=e.target.files[0]; if(!f) return;
    const r=new FileReader(); r.onload=ev=>{ sendMessage({type:'image', image: ev.target.result}); }; r.readAsDataURL(f);
  };
  const handleFileSend = (e)=>{
    const f=e.target.files[0]; if(!f) return;
    if(f.size> 2*1024*1024){ alert('File too big! Max 2MB for demo'); return; }
    const r=new FileReader(); r.onload=ev=>{ sendMessage({type:'file', fileName: f.name, fileData: ev.target.result}); }; r.readAsDataURL(f);
  };

  const startCall = (type)=>{
    const targetEmail = chatUser?.email || 'all';
    if(targetEmail==='all'){ alert('Please select a friend to call!'); return; }
    setCallType(type); setCallUser(chatUser); setIsCallActive(true);
    const cr=push(ref(db,'calls')); set(cr,{ from: currentUser.name, fromEmail: currentUser.email, to: targetEmail, type, status:'ringing', at: Date.now() });
  };
  const endCall = ()=>{
    setIsCallActive(false); setCallType(null); setCallUser(null);
    if(localVideoRef.current && localVideoRef.current.srcObject){ localVideoRef.current.srcObject.getTracks().forEach(t=>t.stop()); }
  };

  const filteredMessages = chatUser ? messages.filter(m=> (m.fromEmail===currentUser.email && m.to===chatUser.email) || (m.fromEmail===chatUser.email && m.to===currentUser.email)) : messages.filter(m=>m.to==='all' || m.fromEmail===currentUser.email);

  if(!isLoggedIn) return <Login onLogin={()=>{localStorage.setItem('isLoggedIn','true'); setIsLoggedIn(true);}} />;

  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      <div className="bg-white shadow sticky top-0 z-30">
        <div className="max-w-[1200px] mx-auto flex justify-between items-center p-3">
          <h1 className="font-black text-[22px] text-[#0866ff]">rmbd-hub</h1>
          <div className="flex items-center gap-2">
            <button onClick={()=>setShowMessenger(true)} className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center">💬</button>
            <div className="relative">
              <button onClick={()=>setShowNotif(!showNotif)} className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center">🔔{notifs.length>0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">{notifs.length}</span>}</button>
              {showNotif && <div className="absolute right-0 top-11 w-[320px] bg-white rounded-xl shadow-xl p-3 max-h-[400px] overflow-auto z-40"><h3 className="font-bold text-[14px] mb-2">Notifications</h3>{notifs.length===0 ? <p className="text-[12px] text-gray-500">No notifications</p> : notifs.map(n=>(<div key={n.id} className="p-2 hover:bg-gray-50 rounded-lg text-[12px] border-b">{n.text}</div>))}</div>}
            </div>
            <button onClick={()=>{ setIsOwn(true); setShowProfile(currentUser); }} className="flex items-center gap-2 font-bold text-[13px]">
              {currentUser.avatar ? <img src={currentUser.avatar} className="w-8 h-8 rounded-full object-cover" /> : <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">{currentUser.name[0]}</div>}
              {currentUser.name.split(' ')[0]}
            </button>
            <button onClick={()=>{localStorage.removeItem('isLoggedIn'); location.reload();}} className="bg-gray-200 px-3 py-1 rounded-full text-[11px] font-bold">Logout</button>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto flex gap-4 p-3">
        <div className="hidden md:block w-[250px] shrink-0">
          <div className="bg-white rounded-xl p-3 shadow-sm"><p className="font-bold text-[13px] mb-3">Menu</p><div className="space-y-2 text-[13px]"><div className="bg-blue-50 text-[#0866ff] p-2 rounded-lg font-bold">🏠 Timeline</div><div className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer" onClick={()=>setShowMessenger(true)}>💬 Messenger</div><div className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer" onClick={()=>setShowNotif(true)}>🔔 Notifications</div></div></div>
        </div>

        <div className="flex-1 max-w-[600px]">
          <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
            <div className="flex gap-3"><div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold">{currentUser.name[0]}</div><textarea value={text} onChange={e=>setText(e.target.value)} placeholder={`What's on your mind, ${currentUser.name}?`} className="flex-1 bg-[#f0f2f5] rounded-2xl p-3 text-[15px] outline-none min-h-[50px]" /></div>
            {img && <img src={img} className="mt-3 rounded-xl w-full" />}
            <div className="flex justify-between mt-3 border-t pt-3"><label className="font-bold text-gray-500 text-[13px] px-3 py-2 hover:bg-gray-100 rounded-lg cursor-pointer">📷 Photo<input type="file" accept="image/*" onChange={e=>{const f=e.target.files[0]; if(!f)return; const r=new FileReader(); r.onload=ev=>setImg(ev.target.result); r.readAsDataURL(f);}} className="hidden" /></label><button onClick={doPost} className="bg-[#0866ff] text-white px-6 py-2 rounded-full font-bold text-[14px]">Post</button></div>
          </div>

          {posts.map(p=>{
            const lc = Object.keys(p.likes||{}).length;
            const cc = Object.entries(p.comments||{}).map(([id,v])=>({id,...v}));
            const liked = p.likes && p.likes[myKey];
            return (
            <div key={p.id} className="bg-white rounded-xl p-4 mb-3 shadow-sm">
              <div className="flex items-center gap-3 cursor-pointer" onClick={()=>{ if(p.authorEmail===currentUser.email){ setIsOwn(true); setShowProfile(currentUser);} else { setIsOwn(false); setShowProfile({name:p.author, email:p.authorEmail, avatar:p.authorAvatar||''}); } }}>
                {p.authorAvatar? <img src={p.authorAvatar} className="w-10 h-10 rounded-full object-cover" /> : <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold">{p.author?.[0]}</div>}
                <div><p className="font-bold text-[14px]">{p.author}</p><p className="text-[11px] text-gray-500">{new Date(p.createdAt||Date.now()).toLocaleString()}</p></div>
              </div>
              {p.text && <p className="mt-3 text-[15px]">{p.text}</p>}
              {p.image && <img src={p.image} className="mt-3 rounded-xl w-full" />}
              <div className="flex justify-between text-[12px] text-gray-500 mt-3"><span>{lc>0? `${lc} Likes`:''}</span><span>{cc.length>0? `${cc.length} Comments`:''}</span></div>
              <div className="flex border-t border-b py-1 mt-2"><button onClick={()=>doLike(p)} className={`flex-1 py-1.5 font-bold text-[13px] rounded-lg ${liked?'text-[#0866ff] bg-blue-50':'text-gray-500 hover:bg-gray-100'}`}>{liked?'👍 Liked':'👍 Like'}</button><button onClick={()=>document.getElementById(`c-${p.id}`)?.focus()} className="flex-1 py-1.5 font-bold text-[13px] text-gray-500 hover:bg-gray-100 rounded-lg">💬 Comment</button><button onClick={()=>doShare(p)} className="flex-1 py-1.5 font-bold text-[13px] text-gray-500 hover:bg-gray-100 rounded-lg">↗️ Share</button></div>
              <div className="mt-3 space-y-2">{cc.map(c=>(<div key={c.id} className="flex gap-2"><div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center text-[10px] font-bold">{c.author?.[0]}</div><div className="flex-1"><div className="bg-[#f0f2f5] rounded-2xl px-3 py-2"><p className="font-bold text-[12px]">{c.author}</p><p className="text-[13px]">{c.text}</p></div>{c.replies && Object.entries(c.replies).map(([rid,r])=>(<div key={rid} className="flex gap-2 mt-2 ml-6"><div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-[9px] font-bold">{r.author?.[0]}</div><div className="bg-[#e4e6eb] rounded-2xl px-3 py-1 flex-1"><p className="font-bold text-[11px]">{r.author}</p><p className="text-[12px]">{r.text}</p></div></div>))}</div></div>))}
                <div className="flex gap-2 mt-3"><input id={`c-${p.id}`} value={cmt[p.id]||''} onChange={e=>setCmt({...cmt, [p.id]: e.target.value})} placeholder="Write a comment..." className="flex-1 bg-[#f0f2f5] rounded-full px-3 py-2 text-[13px] outline-none" onKeyDown={e=>{ if(e.key==='Enter') doComment(p); }} /><button onClick={()=>doComment(p)} className="text-[#0866ff] font-bold text-[13px]">Post</button></div>
              </div>
            </div>
          )})}
        </div>

        <div className="hidden lg:block w-[280px] shrink-0"><div className="bg-white rounded-xl p-3 shadow-sm sticky top-[70px]"><p className="font-bold text-[13px] mb-3">Contacts</p>{allUsers.filter(u=>u.email!==currentUser.email).map(u=>(<div key={u.email} onClick={()=>{ setChatUser(u); setShowMessenger(true); }} className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg cursor-pointer">{u.avatar? <img src={u.avatar} className="w-8 h-8 rounded-full object-cover" /> : <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center font-bold text-[12px]">{u.name[0]}</div>}<p className="text-[13px] font-bold">{u.name}</p><span className="ml-auto w-2 h-2 bg-green-500 rounded-full"></span></div>))}</div></div>
      </div>

      {showMessenger && (
        <div className="fixed bottom-4 right-4 w-[380px] h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col z-40 border">
          <div className="p-3 border-b flex justify-between items-center bg-[#0866ff] text-white rounded-t-2xl">
            <p className="font-bold text-[13px]">💬 {chatUser ? chatUser.name : 'Messenger'}</p>
            <div className="flex gap-1 items-center">
              <button onClick={()=>startCall('audio')} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">📞</button>
              <button onClick={()=>startCall('video')} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">📹</button>
              <button onClick={()=>setShowMessenger(false)} className="w-7 h-7 bg-white/20 rounded-full ml-1">✕</button>
            </div>
          </div>
          {!chatUser && <div className="p-2 border-b"><div className="flex gap-2 overflow-x-auto"><button onClick={()=>setChatUser(null)} className={`px-3 py-1 rounded-full text-[11px] ${!chatUser?'bg-[#0866ff] text-white':'bg-gray-100'}`}>Group</button>{allUsers.filter(u=>u.email!==currentUser.email).map(u=>(<button key={u.email} onClick={()=>setChatUser(u)} className={`px-3 py-1 rounded-full text-[11px] ${chatUser?.email===u.email?'bg-[#0866ff] text-white':'bg-gray-100'}`}>{u.name}</button>))}</div></div>}
          {chatUser && <div className="p-2 bg-gray-50 flex justify-between items-center"><p className="text-[12px] font-bold">Chat with {chatUser.name}</p><button onClick={()=>setChatUser(null)} className="text-[11px] text-blue-500 font-bold">Back</button></div>}
          <div className="flex-1 overflow-auto p-3 space-y-2 bg-[#f0f2f5]">
            {filteredMessages.map(m=>(
              <div key={m.id} className={`flex ${m.fromEmail===currentUser.email?'justify-end':'justify-start'}`}>
                <div className={`max-w-[70%] px-3 py-2 rounded-2xl text-[13px] ${m.fromEmail===currentUser.email?'bg-[#0866ff] text-white rounded-br-none':'bg-white rounded-bl-none shadow-sm'}`}>
                  <p className="text-[10px] opacity-70 font-bold">{m.fromEmail===currentUser.email?'You':m.from}</p>
                  {m.type==='text' && <p>{m.text}</p>}
                  {m.type==='image' && <><img src={m.image} className="rounded-lg max-w-[200px] mt-1" />{m.text && <p className="mt-1">{m.text}</p>}</>}
                  {m.type==='file' && <><a href={m.fileData} download={m.fileName} className="underline font-bold">📎 {m.fileName}</a>{m.text && <p>{m.text}</p>}</>}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="p-2 border-t bg-white rounded-b-2xl">
            <div className="flex items-center gap-2 mb-2">
              <label className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-200">📷<input type="file" accept="image/*" onChange={handleImageSend} className="hidden" /></label>
              <label className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-200">📎<input type="file" onChange={handleFileSend} className="hidden" /></label>
              <button onClick={()=>startCall('audio')} className="w-8 h-8 bg-gray-100 rounded-full hover:bg-gray-200">🎙️</button>
              <button onClick={()=>startCall('video')} className="w-8 h-8 bg-gray-100 rounded-full hover:bg-gray-200">🎥</button>
              <span className="text-[10px] text-gray-400 ml-auto">Photo • File • Audio • Video</span>
            </div>
            <div className="flex gap-2">
              <input value={msgText} onChange={e=>setMsgText(e.target.value)} placeholder="Aa" className="flex-1 bg-[#f0f2f5] rounded-full px-4 py-2 text-[13px] outline-none" onKeyDown={e=>{ if(e.key==='Enter') sendMessage(); }} />
              <button onClick={()=>sendMessage()} className="bg-[#0866ff] text-white w-9 h-9 rounded-full font-bold">➤</button>
            </div>
          </div>
        </div>
      )}

      {isCallActive && (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4">
          <div className="bg-[#1c1e21] rounded-2xl p-6 w-full max-w-[400px] text-center text-white">
            <div className="w-24 h-24 bg-[#0866ff] rounded-full mx-auto flex items-center justify-center text-3xl font-bold">{callUser?.name?.[0]||'?'}</div>
            <h2 className="font-bold mt-4 text-[20px]">{callUser?.name||'Unknown'}</h2>
            <p className="text-[13px] opacity-70 mt-1">{callType==='video' ? '📹 Video Call...' : '📞 Audio Call...'}</p>
            <video ref={localVideoRef} autoPlay muted playsInline className={`w-full h-[200px] bg-black rounded-xl mt-4 object-cover ${callType==='audio'?'hidden':''}`}></video>
            <p className="text-[11px] opacity-50 mt-3">Demo Call - Camera/Mic permission will be asked. This is P2P demo, other user will get ringing notification in Firebase.</p>
            <div className="flex justify-center gap-4 mt-6">
              <button onClick={endCall} className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center text-xl">📵</button>
              <button onClick={()=>{ alert('Call Connected! (Demo)'); }} className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center text-xl">📞</button>
            </div>
          </div>
        </div>
      )}

      {showProfile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={()=>setShowProfile(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-[350px] text-center" onClick={e=>e.stopPropagation()}>
            {showProfile.avatar? <img src={showProfile.avatar} className="w-24 h-24 rounded-full mx-auto object-cover" /> : <div className="w-24 h-24 bg-[#0866ff] rounded-full mx-auto flex items-center justify-center text-3xl font-bold text-white">{showProfile.name?.[0]}</div>}
            <h2 className="font-bold mt-4 text-[20px]">{showProfile.name}</h2>
            <p className="text-[12px] text-gray-500">{showProfile.email}</p>
            {isOwn ? <label className="block mt-5 bg-[#0866ff] text-white px-5 py-2.5 rounded-full text-[13px] font-bold cursor-pointer">📷 Change Photo<input type="file" accept="image/*" onChange={e=>{const f=e.target.files[0]; if(!f)return; const r=new FileReader(); r.onload=ev=>{ const na=ev.target.result; const users=JSON.parse(localStorage.getItem('rmbd_users')||'[]'); const idx=users.findIndex(u=>u.email===currentUser.email); if(idx>=0){ users[idx].avatar=na; localStorage.setItem('rmbd_users', JSON.stringify(users)); localStorage.setItem('currentUser', JSON.stringify({...currentUser, avatar:na})); location.reload(); }}; r.readAsDataURL(f);}} className="hidden" /></label> : <div className="mt-5 grid grid-cols-2 gap-2"><button onClick={()=>{ setChatUser({name:showProfile.name, email:showProfile.email, avatar:showProfile.avatar}); setShowMessenger(true); setShowProfile(null); }} className="bg-[#0866ff] text-white py-2.5 rounded-full text-[13px] font-bold">💬 Message</button><button onClick={()=>{ setChatUser({name:showProfile.name, email:showProfile.email}); setCallType('video'); setCallUser({name:showProfile.name, email:showProfile.email}); setIsCallActive(true); setShowProfile(null); }} className="bg-green-500 text-white py-2.5 rounded-full text-[13px] font-bold">📹 Video</button></div>}
            <button onClick={()=>setShowProfile(null)} className="mt-4 w-full bg-gray-200 py-2.5 rounded-full text-[13px] font-bold">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
