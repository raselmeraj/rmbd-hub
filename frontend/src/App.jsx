{showProfile && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={()=>setShowProfile(null)}>
    <div className="bg-white rounded-2xl p-6 w-full max-w- text-center" onClick={e=>e.stopPropagation()}>
      {showProfile.avatar? <img src={showProfile.avatar} className="w-20 h-20 rounded-full mx-auto object-cover" /> : <div className="w-20 h-20 bg-[#e89e9e] rounded-full mx-auto flex items-center justify-center text-2xl font-bold">{showProfile.name?.[0]}</div>}
      <h2 className="font-bold mt-3">{showProfile.name}</h2>
      <p className="text- opacity-60 mt-1">{showProfile.email}</p>

      {showProfile.email === currentUser.email && (
        <label className="block mt-4 bg-black text-white px-4 py-2 rounded-full text- cursor-pointer">
          📷 Change Photo <input type="file" accept="image/*" className="hidden" onChange={(e)=>{
            const f=e.target.files[0]; if(!f) return;
            const r=new FileReader(); r.onload=(ev)=>{
              const newAvatar=ev.target.result;
              const users=JSON.parse(localStorage.getItem('rmbd_users')||'[]');
              const idx=users.findIndex(u=>u.email===currentUser.email);
              if(idx>=0){ users[idx].avatar=newAvatar; localStorage.setItem('rmbd_users', JSON.stringify(users)); const cu={...currentUser, avatar:newAvatar}; localStorage.setItem('currentUser', JSON.stringify(cu)); setShowProfile(cu); window.location.reload(); }
            }; r.readAsDataURL(f);
          }} />
        </label>
      )}

      <button onClick={()=>setShowProfile(null)} className="mt-3 w-full bg-[#f5f5f5] py-2 rounded-full text-xs">Close</button>
    </div>
  </div>
)}
