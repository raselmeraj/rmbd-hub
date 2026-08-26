import { useState } from 'react'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [name, setName] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    const url = isLogin 
      ? 'https://rmbd-hub-backend.onrender.com/api/auth/login' 
      : 'https://rmbd-hub-backend.onrender.com/api/auth/register'
    
    const body = isLogin ? { email, password } : { name, email, password }
    
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if(data.token) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        window.location.reload()
      } else {
        alert(data.message || 'Error')
      }
    } catch(err) {
      alert('Backend waking up, try again after 30s')
    }
  }

  return (
    <div style={{display:'flex', minHeight:'100vh', alignItems:'center', justifyContent:'space-around', background:'#f0f2f5', padding:'20px', flexWrap:'wrap'}}>
      {/* LEFT - BRANDING LIKE FACEBOOK */}
      <div style={{maxWidth:'500px', marginBottom:'20px'}}>
        <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
          <div style={{width:'62px', height:'62px', background:'#1877f2', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:'900', fontSize:'36px', boxShadow:'0 2px 8px rgba(0,0,0,0.2)'}}>R</div>
          <h1 style={{fontSize:'48px', fontWeight:'900', color:'#1877f2', margin:0, letterSpacing:'-1px'}}>RMBD-HUB</h1>
        </div>
        <h2 style={{fontSize:'28px', fontWeight:'400', lineHeight:'1.2', marginTop:'16px', color:'#1c1e21'}}>সব বন্ধু একসাথে, RMBD হাবে।</h2>
        <p style={{fontSize:'18px', color:'#606770', marginTop:'8px'}}>RMBD Hub helps you connect and share with the people in your life.</p>
      </div>

      {/* RIGHT - LOGIN BOX */}
      <div style={{background:'white', padding:'20px', borderRadius:'8px', boxShadow:'0 2px 4px rgba(0,0,0,.1), 0 8px 16px rgba(0,0,0,.1)', width:'100%', maxWidth:'400px'}}>
        <div style={{display:'flex', gap:'10px', marginBottom:'20px'}}>
          <button onClick={()=>setIsLogin(true)} style={{flex:1, padding:'12px', background: isLogin ? '#1877f2' : '#e4e6eb', color: isLogin ? 'white' : 'black', border:'none', borderRadius:'6px', fontWeight:'bold', cursor:'pointer'}}>Login</button>
          <button onClick={()=>setIsLogin(false)} style={{flex:1, padding:'12px', background: !isLogin ? '#1877f2' : '#e4e6eb', color: !isLogin ? 'white' : 'black', border:'none', borderRadius:'6px', fontWeight:'bold', cursor:'pointer'}}>Register</button>
        </div>

        <form onSubmit={handleSubmit}>
          {!isLogin && <input value={name} onChange={e=>setName(e.target.value)} placeholder="Full Name" required style={{width:'100%', padding:'14px', marginBottom:'12px', border:'1px solid #dddfe2', borderRadius:'6px', fontSize:'17px', boxSizing:'border-box'}}/>}
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email address" required type="email" style={{width:'100%', padding:'14px', marginBottom:'12
