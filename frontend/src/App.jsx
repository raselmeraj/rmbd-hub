import { useState, useEffect, useRef } from 'react';
import { db } from './firebase';
import { ref, onValue, push, set, onDisconnect } from 'firebase/database';
import Login from './Login.jsx';
function safeKey(e){return e?e.replace(/[^a-zA-Z0-9]/g,'_'):'guest';}
export default function App(){
  const [isLoggedIn,setIsLoggedIn]=useState(false);
  const [posts,setPosts]=useState([]);
  const [text,setText]=useState('');
  const [img,setImg]=useState('');
  const [showProfile,setShowProfile]=useState(null);
  const [isOwn,setIsOwn]=useState(false);
  const [cmt,setCmt]=useState({});
  const [showMessenger,setShowMessenger]=useState(false);
  const [messages,setMessages]=useState([]);
  const [msgText,setMsgText]=useState('');
  const [chatUser,setChatUser]=useState(null);
  const [callType,setCallType]=useState(null);
  const [callUser,setCallUser]=useState(null);
  const [isCallActive,setIsCallActive]=useState(false);
  const [friends,setFriends]=useState({});
  const [presences,setPresences]=useState({});
  const [notifs,setNotifs]=useState([]);
  const [showNotif,setShowNotif]=useState(false);
  const localVideoRef=useRef(null);
  const chatEndRef=useRef(null);

  useEffect(()=>{
    if(localStorage.getItem('isLoggedIn')==='true') setIsLoggedIn(true);
    onValue(ref(db,'posts'),snap=>{
      const d=snap.val(); if(!d){setPosts([]);return;}
      const arr=Object.entries(d).map(([id,v])=>({...v,id,likes:v.likes||{},comments:v.comments||{}}));
      arr.sort((a,b)=>(b.createdAt||0)-(a.createdAt||0)); setPosts(arr);
    });
    onValue(ref(db,'messages'),snap=>{
      const d=snap.val(); if(!d){setMessages([]);return;}
      const arr=Object.entries(d).map(([id,v])=>({id,...v})); arr.sort((a,b)=>a.at-b.at); setMessages(arr);
    });
    onValue(ref(db,'presence'),snap=>{ setPresences(snap.val()||{}); });
  },[]);

  const currentUser=JSON.parse(localStorage.getItem('currentUser')||'{"name":"User","email":"a@b.com"}');
  const myKey=safeKey(currentUser.email);

  useEffect(()=>{
    if(!isLoggedIn) return;
    const myPresenceRef = ref(db, `presence/${myKey}`);
    set(myPresenceRef, { online: true, name: currentUser.name, email: currentUser.email, avatar: currentUser.avatar||'', lastSeen: Date.now() });
    onDisconnect(myPresenceRef).set({ online: false, name: currentUser.name, email: currentUser.email, lastSeen: Date.now() });
    const handleBeforeUnload = () => { set(myPresenceRef, { online: false, lastSeen: Date.now(), name: currentUser.name, email: currentUser.email }); };
    window.addEventListener('beforeunload', handleBeforeUnload);
    const interval = setInterval(()=>{ set(myPresenceRef, { online: true, name: currentUser.name, email: currentUser.email, avatar: currentUser.avatar||'', lastSeen: Date.now() }); }, 30000);
    return ()=>{ clearInterval(interval); window.removeEventListener('beforeunload', handleBeforeUnload); set(myPresenceRef, { online: false, lastSeen: Date.now(), name: currentUser.name, email: currentUser.email }); };
  },[isLoggedIn, myKey]);

  useEffect(()=>{ onValue(ref(db,`friends/${myKey}`),snap=>{ setFriends(snap.val()||{}); }); },[myKey]);
  useEffect(()=>{chatEndRef.current?.scrollIntoView({behavior:'smooth'});},[messages,showMessenger,chatUser]);
  useEffect(()=>{ if(isCallActive && callType==='video' && localVideoRef.current){ navigator.mediaDevices.getUserMedia({video:true,audio:true}).then(s=>{localVideoRef.current.srcObject=s;}).catch(()=>{}); } },[isCallActive,callType]);

  // Notifications with postId - CLICKABLE
  useEffect(()=>{
    const myPosts=posts.filter(p=>p.authorEmail===currentUser.email);
    let n=[];
    myPosts.forEach(p=>{
      Object.entries(p.likes||{}).forEach(([k,v])=>{ if(k!==myKey) n.push({id: p.id+'_like_'+k, postId: p.id, type:'like', text: `${v.name||k} liked your post`, subtext: p.text?.slice(0,30)||'Photo', time: v.at||Date.now(), read:false }); });
      Object.entries(p.comments||{}).forEach(([cid,c])=>{ if(c.author!==currentUser.name) n.push({id: cid, postId: p.id, type:'comment', text: `${c.author} commented on your post`, subtext: c.text?.slice(0,30), time: c.at||Date.now(), read:false }); });
    });
    n.sort((a,b)=>b.time-a.time);
    setNotifs(n.slice(0,20));
  },[posts, myKey]);

  const allUsers=JSON.parse(localStorage.getItem('rmbd_users')||'[]');
  const contactsMap={};
  posts.forEach(p=>{ if(p.authorEmail!==currentUser.email) contactsMap[p.authorEmail]={name:p.author,email:p.authorEmail,avatar:p.authorAvatar||''}; });
  allUsers.forEach(u=>{ if(u.email!==currentUser.email) contactsMap[u.email]=u; });
  Object.values(presences).forEach(p=>{ if(p.email!==currentUser.email) contactsMap[p.email]={name:p.name,email:p.email,avatar:p.avatar||''}; });
  const contacts=Object.values(contactsMap);

  const doPost=()=>{ if(!text.trim()&&!img) return; const nr=push(ref(db,'posts')); set(nr,{text,image:img,author:currentUser.name,authorEmail:currentUser.email,authorAvatar:currentUser.avatar||'',likes:{},comments:{},createdAt:Date.now()}); setText(''); setImg(''); };
  const doLike=(p)=>{ const r=ref(db,`posts/${p.id}/likes/${myKey}`); if(p.likes&&p.likes[myKey]) set(r,null); else set(r,{name:currentUser.name,at:Date.now()}); };
  const doComment=(p)=>{ const t=cmt[p.id]; if(!t||!t.trim()) return; const cr=push(ref(db,`posts/${p.id}/comments`)); set(cr,{text:t,author:currentUser.name,at:Date.now()}); setCmt({...cmt,[p.id]:''}); };
  const sendMessage=(extra={})=>{ if(!msgText.trim()&&!extra.image&&!extra.fileData) return; const mr=push(ref(db,'messages')); set(mr,{text:msgText,from:currentUser.name,fromEmail:currentUser.email,to:chatUser?.email||'all',at:Date.now(),type:extra.type||'text',image:extra.image||'',fileName:extra.fileName||'',fileData:extra.fileData||''}); setMsgText(''); };
  const handleImageSend=(e)=>{ const f=e.target.files[0]; if(!f) return; const r=new FileReader(); r.onload=ev=>{ sendMessage({type:'image',image:ev.target.result}); }; r.readAsDataURL(f); };
  const handleFileSend=(e)=>{ const f=e.target.files[0]; if(!f) return; if(f.size>2*1024*1024){alert('Max 2MB');return;} const r=new FileReader(); r.onload=ev=>{ sendMessage({type:'file',fileName:f.name,fileData:ev.target.result}); }; r.readAsDataURL(f); };
  const startCall=(type)=>{ const target=chatUser?.email||'all'; if(target==='all'){alert('Select a friend first!');return;} setCallType(type); setCallUser(chatUser); setIsCallActive(true); const cr=push(ref(db,'calls')); set(cr,{from:currentUser.name,fromEmail:currentUser.email,to:target,type,status:'ringing',at:Date.now()}); };
  const endCall=()=>{ setIsCallActive(false); setCallType(null); setCallUser(null); if(localVideoRef.current?.srcObject){localVideoRef.current.srcObject.getTracks().forEach(t=>t.stop());} };
  const addFriend=(u)=>{ const fk=safeKey(u.email); set(ref(db,`friends/${myKey}/${fk}`),{name:u.name,email:u.email,avatar:u.avatar||'',addedAt:Date.now()}); };

  const handleNotifClick=(n)=>{
    setShowNotif(false);
    const el=document.getElementById(`post-${n.postId}`);
    if(el){ el.scrollIntoView({behavior:'smooth', block:'center'}); el.classList.add('ring-2','ring-blue-500'); setTimeout(()=>el.classList.remove('ring-2','ring-blue-500'),2000); }
  };

  const filteredMessages=chatUser? messages.filter(m=> (m.fromEmail===currentUser.email&&m.to===chatUser.email)||(m.fromEmail===chatUser.email&&m.to===currentUser.email)) : messages.filter(m=>m.to==='all');
  const getPresenceStatus=(email)=>{
    const key=safeKey(email); const pres=presences[key]; if(!pres) return {online:false, text:'Offline'};
    if(pres.online) return {online:true, text:'Active now'};
    const diff=Date.now()-(pres.lastSeen||0); const mins=Math.floor(diff/60000);
    if(mins<1) return {online:false, text:'Just now'}; if(mins<60) return {online:false, text:`${mins}m ago`}; const hrs=Math.floor(mins/60); if(hrs<24) return {online:false, text:`${hrs}h ago`}; return {online:false, text:'Offline'};
  };

  if(!isLoggedIn) return <Login onLogin={()=>{localStorage.setItem('isLoggedIn','true');setIsLoggedIn(true);}} />;

  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      <div className="bg-white shadow sticky top-0 z-30">
        <div className="max-w-[1200px] mx-auto flex justify-between items-center p-3">
          <h1 className="font-black text-[22px] text-[#0866ff]">rmbd-hub</h1>
          <div className="flex items-center gap-2">
            <button onClick={()=>setShowMessenger(true)} className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center">💬</button>
            <div className="relative">
              <button onClick={()=>setShowNotif(!showNotif)} className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center relative">🔔{notifs.length>0&&<span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">{notifs.length}</span>}</button>
              {showNotif&&(
                <div className="absolute right-0 top-11 w-[360px] bg-white rounded-xl shadow-2xl z-50 overflow-hidden border">
                  <div className="p-3 border-b flex justify-between items-center"><h3 className="font-bold text-[15px]">Notifications ({notifs.length})</h3><button onClick={()=>setShowNotif(false)} className="text-[12px] text-blue-500 font-bold">Close</button></div>
                  <div className="max-h-[400px] overflow-auto">
                    {notifs.length===0?<p className="p-4 text-[12px] text-gray-500 text-center">No notifications</p>:notifs.map(n=>(
                      <div key={n.id} onClick={()=>handleNotifClick(n)} className="p-3 hover:bg-blue-50 cursor-pointer border-b flex gap-3 items-start">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold ${n.type==='like'?'bg-blue-500':'bg-green-500'}`}>{n.type==='like'?'👍':'💬'}</div>
                        <div className="flex-1"><p className="text-[13px] font-bold">{n.text}</p><p className="text-[11px] text-gray-500">{n.subtext}</p><p className="text-[10px] text-gray-400 mt-1">{new Date(n.time).toLocaleString()}</p></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      </div>
                    ))}
                  </div>
                  <div className="p-2 bg-gray-50 text-center"><button onClick={()=>{setNotifs([]); setShowNotif(false);}} className="text-[11px] text-gray-500 font-bold">Mark all as read</button></div>
                </div>
              )}
            </div>
            <button onClick={()=>{setIsOwn(true);setShowProfile(currentUser);}} className="flex items-center gap-2 font-bold text-[13px]">{currentUser.avatar?<img src={currentUser.avatar} className="w-8 h-8 rounded-full object-cover"/>:<div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">{currentUser.name[0]}</div>}{currentUser.name.split(' ')[0]} <span className="w-2 h-2 bg-green-500 rounded-full ml-1"></span></button>
            <button onClick={()=>{ const myPresenceRef=ref(db,`presence/${myKey}`); set(myPresenceRef,{online:false,lastSeen:Date.now(),name:currentUser.name,email:currentUser.email}); localStorage.removeItem('isLoggedIn'); location.reload(); }} className="bg-gray-200 px-3 py-1 rounded-full text-[11px] font-bold">Logout</button>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto flex gap-4 p-3">
        <div className="hidden md:block w-[250px] shrink-0"><div className="bg-white rounded-xl p-3 shadow-sm"><p className="font-bold text-[13px] mb-3">Menu - {Object.values(presences).filter(p=>p.online).length} Online</p><div className="space-y-1 text-[13px]"><div className="bg-blue-50 text-[#0866ff] p-2.5 rounded-lg font-bold">🏠 Timeline / Feed</div><div onClick={()=>setShowMessenger(true)} className="p-2.5 hover:bg-gray-100 rounded-lg cursor-pointer">💬 Messenger ({contacts.filter(c=>getPresenceStatus(c.email).online).length} online)</div><div onClick={()=>setShowNotif(true)} className="p-2.5 hover:bg-gray-100 rounded-lg cursor-pointer">🔔 Notifications ({notifs.length})</div><div className="p-2.5 hover:bg-gray-100 rounded-lg cursor-pointer">👥 Friends ({Object.keys(friends).length})</div></div></div></div>

        <div className="flex-1 max-w-[600px]">
          <div className="bg-white rounded-xl p-4 shadow-sm mb-4"><div className="flex gap-3"><div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold">{currentUser.name[0]}</div><textarea value={text} onChange={e=>setText(e.target.value)} placeholder={`What's on your mind, ${currentUser.name}?`} className="flex-1 bg-[#f0f2f5] rounded-2xl p-3 text-[15px] outline-none min-h-[50px]" /></div>{img&&<img src={img} className="mt-3 rounded-xl w-full" />}<div className="flex justify-between mt-3 border-t pt-3"><label className="font-bold text-gray-500 text-[13px] px-3 py-2 hover:bg-gray-100 rounded-lg cursor-pointer">📷 Photo<input type="file" accept="image/*" onChange={e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>setImg(ev.target.result);r.readAsDataURL(f);}} className="hidden" /></label><button onClick={doPost} className="bg-[#0866ff] text-white px-6 py-2 rounded-full font-bold text-[14px]">Post</button></div></div>
          {posts.map(p=>{const lc=Object.keys(p.likes||{}).length;const cc=Object.entries(p.comments||{}).map(([id,v])=>({id,...v}));const liked=p.likes&&p.likes[myKey];return(<div id={`post-${p.id}`} key={p.id} className="bg-white rounded-xl p-4 mb-3 shadow-sm transition-all"><div className="flex items-center gap-3 cursor-pointer" onClick={()=>{if(p.authorEmail===currentUser.email){setIsOwn(true);setShowProfile(currentUser);}else{setIsOwn(false);setShowProfile({name:p.author,email:p.authorEmail,avatar:p.authorAvatar||''});}}}>{p.authorAvatar?<img src={p.authorAvatar} className="w-10 h-10 rounded-full object-cover"/>:<div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold">{p.author?.[0]}</div>}<div><p className="font-bold text-[14px]">{p.author}</p><p className="text-[11px] text-gray-500">{new Date(p.createdAt||Date.now()).toLocaleString()}</p></div></div>{p.text&&<p className="mt-3 text-[15px]">{p.text}</p>}{p.image&&<img src={p.image} className="mt-3 rounded-xl w-full" />}<div className="flex justify-between text-[12px] text-gray-500 mt-3"><span>{lc>0?`${lc} Likes`:''}</span><span>{cc.length>0?`${cc.length} Comments`:''}</span></div><div className="flex border-t border-b py-1 mt-2"><button onClick={()=>doLike(p)} className={`flex-1 py-1.5 font-bold text-[13px] rounded-lg ${liked?'text-[#0866ff] bg-blue-50':'text-gray-500 hover:bg-gray-100'}`}>{liked?'👍 Liked':'👍 Like'}</button><button onClick={()=>document.getElementById(`c-${p.id}`)?.focus()} className="flex-1 py-1.5 font-bold text-[13px] text-gray-500 hover:bg-gray-100 rounded-lg">💬 Comment</button></div><div className="mt-3 space-y-2">{cc.map(c=>(<div key={c.id} className="flex gap-2"><div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center text-[10px] font-bold">{c.author?.[0]}</div><div className="flex-1"><div className="bg-[#f0f2f5] rounded-2xl px-3 py-2"><p className="font-bold text-[12px]">{c.author}</p><p className="text-[13px]">{c.text}</p></div></div></div>))}<div className="flex gap-2 mt-3"><input id={`c-${p.id}`} value={cmt[p.id]||''} onChange={e=>setCmt({...cmt,[p.id]:e.target.value})} placeholder="Write a comment..." className="flex-1 bg-[#f0f2f5] rounded-full px-3 py-2 text-[13px] outline-none" onKeyDown={e=>{if(e.key==='Enter')doComment(p);}} /><button onClick={()=>doComment(p)} className="text-[#0866ff] font-bold text-[13px]">Post</button></div></div></div>);})}
        </div>

        <div className="hidden lg:block w-[320px] shrink-0">
          <div className="bg-white rounded-xl p-3 shadow-sm sticky top-[70px]">
            <p className="font-bold text-[13px] mb-3">Contacts - {contacts.filter(c=>getPresenceStatus(c.email).online).length} Online / {contacts.length} Total</p>
            {contacts.map(u=>{
              const status=getPresenceStatus(u.email);
              return (
              <div key={u.email} className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg">
                <div onClick={()=>{setChatUser(u);setShowMessenger(true);}} className="flex items-center gap-3 flex-1 cursor-pointer">
                  <div className="relative">{u.avatar?<img src={u.avatar} className="w-9 h-9 rounded-full object-cover"/>:<div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center font-bold text-[12px]">{u.name[0]}</div>}<span className={`absolute -bottom-0 -right-0 w-3 h-3 rounded-full border-2 border-white ${status.online?'bg-green-500':'bg-gray-400'}`}></span></div>
                  <div><p className="text-[12px] font-bold">{u.name}</p><p className={`text-[10px] ${status.online?'text-green-600 font-bold':'text-gray-400'}`}>{status.text}</p></div>
                </div>
                {!friends[safeKey(u.email)] ? <button onClick={()=>addFriend(u)} className="bg-[#0866ff] text-white px-3 py-1 rounded-full text-[10px] font-bold">Add</button> : <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-full">Friend</span>}
              </div>
            )})}
          </div>
        </div>
      </div>

      {showMessenger&&(
        <div className="fixed bottom-4 right-4 w-[380px] h-[520px] bg-white rounded-2xl shadow-2xl flex flex-col z-40 border">
          <div className="p-3 border-b flex justify-between items-center bg-[#0866ff] text-white rounded-t-2xl"><div><p className="font-bold text-[13px]">💬 {chatUser?chatUser.name:'Messenger'}</p>{chatUser&&<p className="text-[10px] opacity-80">{getPresenceStatus(chatUser.email).text}</p>}</div><div className="flex gap-1 items-center"><button onClick={()=>startCall('audio')} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">📞</button><button onClick={()=>startCall('video')} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">📹</button><button onClick={()=>setShowMessenger(false)} className="w-7 h-7 bg-white/20 rounded-full ml-1">✕</button></div></div>
          <div className="flex-1 overflow-auto p-3 space-y-2 bg-[#f0f2f5]">{filteredMessages.map(m=>(<div key={m.id} className={`flex ${m.fromEmail===currentUser.email?'justify-end':'justify-start'}`}><div className={`max-w-[75%] px-3 py-2 rounded-2xl text-[13px] ${m.fromEmail===currentUser.email?'bg-[#0866ff] text-white rounded-br-none':'bg-white rounded-bl-none shadow-sm'}`}><p className="text-[10px] opacity-70 font-bold">{m.fromEmail===currentUser.email?'You':m.from}</p>{m.type==='text'&&<p>{m.text}</p>}{m.type==='image'&&<img src={m.image} className="rounded-lg max-w-[200px] mt-1" />}{m.type==='file'&&<a href={m.fileData} download={m.fileName} className="underline font-bold text-[12px]">📎 {m.fileName}</a>}</div></div>))}<div ref={chatEndRef}/></div>
          <div className="p-2 border-t bg-white rounded-b-2xl"><div className="flex items-center gap-2 mb-2"><label className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center cursor-pointer">📷<input type="file" accept="image/*" onChange={handleImageSend} className="hidden" /></label><label className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center cursor-pointer">📎<input type="file" onChange={handleFileSend} className="hidden" /></label><button onClick={()=>startCall('audio')} className="w-9 h-9 bg-gray-100 rounded-full">🎙️</button><button onClick={()=>startCall('video')} className="w-9 h-9 bg-gray-100 rounded-full">🎥</button></div><div className="flex gap-2"><input value={msgText} onChange={e=>setMsgText(e.target.value)} placeholder="Aa" className="flex-1 bg-[#f0f2f5] rounded-full px-4 py-2 text-[13px] outline-none" onKeyDown={e=>{if(e.key==='Enter')sendMessage();}} /><button onClick={()=>sendMessage()} className="bg-[#0866ff] text-white w-9 h-9 rounded-full font-bold">➤</button></div></div>
        </div>
      )}

      {isCallActive&&(<div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4"><div className="bg-[#1c1e21] rounded-2xl p-6 w-full max-w-[400px] text-center text-white"><div className="w-24 h-24 bg-[#0866ff] rounded-full mx-auto flex items-center justify-center text-3xl font-bold">{callUser?.name?.[0]||'?'}</div><h2 className="font-bold mt-4 text-[20px]">{callUser?.name||'Unknown'}</h2><p className="text-[13px] opacity-70 mt-1">{callType==='video'?'📹 Video Calling...':'📞 Audio Calling...'}</p><video ref={localVideoRef} autoPlay muted playsInline className={`w-full h-[200px] bg-black rounded-xl mt-4 object-cover ${callType==='audio'?'hidden':''}`}></video><div className="flex justify-center gap-4 mt-6"><button onClick={endCall} className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center text-xl">📵 End</button></div></div></div>)}

      {showProfile&&(<div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={()=>setShowProfile(null)}><div className="bg-white rounded-2xl p-6 w-full max-w-[350px] text-center" onClick={e=>e.stopPropagation()}>{showProfile.avatar?<img src={showProfile.avatar} className="w-24 h-24 rounded-full mx-auto object-cover"/>:<div className="w-24 h-24 bg-[#0866ff] rounded-full mx-auto flex items-center justify-center text-3xl font-bold text-white">{showProfile.name?.[0]}</div>}<h2 className="font-bold mt-4 text-[20px]">{showProfile.name}</h2><p className="text-[12px] text-gray-500">{showProfile.email}</p><p className={`text-[12px] mt-1 font-bold ${getPresenceStatus(showProfile.email).online?'text-green-600':'text-gray-400'}`}>{getPresenceStatus(showProfile.email).online?'● Online':'○ '+getPresenceStatus(showProfile.email).text}</p><div className="mt-5 grid grid-cols-2 gap-2"><button onClick={()=>{setChatUser({name:showProfile.name,email:showProfile.email,avatar:showProfile.avatar});setShowMessenger(true);setShowProfile(null);}} className="bg-[#0866ff] text-white py-2.5 rounded-full text-[13px] font-bold">💬 Message</button><button onClick={()=>{setChatUser({name:showProfile.name,email:showProfile.email});setCallType('video');setCallUser({name:showProfile.name,email:showProfile.email});setIsCallActive(true);setShowProfile(null);}} className="bg-green-500 text-white py-2.5 rounded-full text-[13px] font-bold">📹 Video</button></div><button onClick={()=>setShowProfile(null)} className="mt-4 w-full bg-gray-200 py-2.5 rounded-full text-[13px] font-bold">Close</button></div></div>)}
    </div>
  );
}
