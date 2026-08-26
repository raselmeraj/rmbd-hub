import { useState } from 'react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [name, setName] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    const url = isLogin ? 'https://rmbd-hub-backend.onrender.com/api/auth/login' : 'https://rmbd-hub-backend.onrender.com/api/auth/register'
    const body = isLogin ? { email, password } : { name, email, password }
    try {
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await res.json()
      if(data.token){ localStorage.setItem('token', data.token); localStorage.setItem('user', JSON.stringify(data.user)); window.location.reload() }
      else alert(data.message)
    } catch { alert('Backend waking up, 30s wait') }
  }

  return (
    <div style={{display:'flex', minHeight:'100vh', alignItems:'center', justifyContent:'space-around', background:'#f0f2f5', padding:'20px', flexWrap:'wrap'}}>
      <div style={{maxWidth:'500px'}}>
        <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
          <div style={{width:'65px', height:'65px', background:'#1877f2', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:'900', fontSize:'38px'}}>R</div>
          <h1 style={{fontSize:'50px', fontWeight:'900', color:'#1877f2', margin:0}}>RMBD-HUB</h1>
        </div>
        <h2 style={{fontSize:'28px', marginTop:'15px'}}>সব বন্ধু একসাথে, RMBD হাবে।</h2>
      </div>
      <div style={{background:'white', padding:'20px', borderRadius:'8px', boxShadow:'0 2px 4px rgba(0,0,0,.1), 0 8px 16px rgba(0,0,0,.1)', width:'400px'}}>
        <div style={{display:'flex', gap:'10px', marginBottom:'15px'}}>
          <button onClick={()=>setIsLogin(true)} style={{flex:1, padding:'12px', background: isLogin?'#1877f2':'#e4e6eb', color: isLogin?'white':'black', border:'none', borderRadius:'6px', fontWeight:'bold'}}>Login</button>
          <button onClick={()=>setIsLogin(false)} style={{flex:1, padding:'12px', background: !isLogin?'#1877f2':'#e4e6eb', color: !isLogin?'white':'black', border:'none', borderRadius:'6px', fontWeight:'bold'}}>Register</button>
        </div>
        <form onSubmit={handleSubmit}>
          {!isLogin && <input value={name} onChange={e=>setName(e.target.value)} placeholder="Full Name" required style={{width:'100%', padding:'14px', marginBottom:'10px', border:'1px solid #dddfe2', borderRadius:'6px'}}/>}
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" required style={{width:'100%', padding:'14px', marginBottom:'10px', border:'1px solid #dddfe2', borderRadius:'6px'}}/>
          <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" type="password" required style={{width:'100%', padding:'14px', marginBottom:'10px', border:'1px solid #dddfe2', borderRadius:'6px'}}/>
          <button type="submit" style={{width:'100%', padding:'14px', background:'#1877f2', color:'white', border:'none', borderRadius:'6px', fontSize:'20px', fontWeight:'bold'}}>{isLogin?'Log in':'Sign Up'}</button>
        </form>
      </div>
    </div>
  )
}
