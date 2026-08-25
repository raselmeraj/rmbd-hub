import { useState, useEffect, createContext } from 'react'
import axios from 'axios'
import { io } from 'socket.io-client'

export const AuthContext = createContext()

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('rmbd_user')) || null)
  const [posts, setPosts] = useState([])
  const [newPost, setNewPost] = useState('')
  const [socket, setSocket] = useState(null)
  const [onlineUsers, setOnlineUsers] = useState([])

  const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

  useEffect(() => {
    const s = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000')
    setSocket(s)
    if (user) s.emit('addUser', user._id)
    s.on('getOnlineUsers', users => setOnlineUsers(users))
    return () => s.disconnect()
  }, [user])

  useEffect(() => {
    const fetchPosts = async () => {
      if (!user) return
      try {
        const res = await axios.get(API + '/posts/timeline/all', {
          headers: { Authorization: 'Bearer ' + localStorage.getItem('rmbd_token') }
        })
        setPosts(res.data)
      } catch {}
    }
    fetchPosts()
  }, [user])

  const handleLogin = async (e) => {
    e.preventDefault()
    const form = new FormData(e.target)
    try {
      const res = await axios.post(API + '/auth/login', {
        email: form.get('email'), password: form.get('password')
      })
      localStorage.setItem('rmbd_token', res.data.token)
      localStorage.setItem('rmbd_user', JSON.stringify(res.data))
      setUser(res.data)
    } catch (err) { alert(err.response?.data?.message || 'Login failed') }
  }

  const handlePost = async () => {
    if (!newPost) return
    try {
      const res = await axios.post(API + '/posts', { desc: newPost }, {
        headers: { Authorization: 'Bearer ' + localStorage.getItem('rmbd_token') }
      })
      setPosts([res.data, ...posts])
      setNewPost('')
    } catch {}
  }

  const handleLike = async (postId) => {
    try {
      await axios.put(API + '/posts/' + postId + '/like', {}, {
        headers: { Authorization: 'Bearer ' + localStorage.getItem('rmbd_token') }
      })
      setPosts(posts.map(p => p._id === postId ? { ...p, likes: p.likes.includes(user._id) ? p.likes.filter(id => id !== user._id) : [...p.likes, user._id] } : p))
    } catch {}
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5] p-4">
        <div className="max-w-5xl w-full flex flex-col md:flex-row gap-10 items-center">
          <div className="flex-1">
            <h1 className="text-5xl font-black"><span className="text-black">RMBD</span><span className="text-[#1877F2]">Hub</span></h1>
            <p className="text-2xl mt-4">সব বন্ধু একসাথে - Real Facebook Clone</p>
            <p className="text-gray-600 mt-2">Real Database দিয়ে বানানো, সবাই সবার পোস্ট দেখবে</p>
          </div>
          <form onSubmit={handleLogin} className="bg-white p-6 rounded-xl shadow-xl w-full max-w-[400px]">
            <input name="email" placeholder="Email" className="w-full p-3 border rounded-lg mb-3" required />
            <input name="password" type="password" placeholder="Password" className="w-full p-3 border rounded-lg mb-4" required />
            <button className="w-full bg-[#1877F2] text-white py-3 rounded-lg font-bold">Log In</button>
            <p className="text-sm text-center mt-4 text-gray-500">Demo: register via API first, then login</p>
          </form>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, socket, onlineUsers }}>
      <div className="min-h-screen bg-[#f0f2f5]">
        <header className="bg-white shadow sticky top-0 z-50 px-4 py-2 flex justify-between items-center">
          <h1 className="font-black text-xl"><span className="text-black">RMBD</span><span className="text-[#1877F2]">Hub</span></h1>
          <div className="flex gap-2 items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-sm">{user.username}</span>
          </div>
        </header>
        <main className="max-w-[600px] mx-auto p-4">
          <div className="bg-white rounded-xl p-4 shadow mb-4">
            <textarea value={newPost} onChange={e => setNewPost(e.target.value)} placeholder={user.username + ', কি ভাবছেন?'} className="w-full bg-gray-100 rounded-xl p-3 min-h-[80px]" />
            <button onClick={handlePost} className="mt-3 bg-[#1877F2] text-white px-6 py-2 rounded-lg font-bold">Post - Real DB তে Save হবে</button>
          </div>
          {posts.map(post => (
            <div key={post._id} className="bg-white rounded-xl p-4 shadow mb-4">
              <div className="flex gap-3 items-center mb-3">
                <div className="w-10 h-10 bg-[#1877F2] rounded-full flex items-center justify-center text-white font-bold">{post.userId?.username?.[0] || 'U'}</div>
                <div><p className="font-bold">{post.userId?.username || 'User'}</p><p className="text-xs text-gray-500">এখনই • Real DB</p></div>
              </div>
              <p className="mb-3">{post.desc}</p>
              {post.img && <img src={post.img} className="rounded-xl w-full mb-3" />}
              <div className="flex gap-6 border-t pt-3">
                <button onClick={() => handleLike(post._id)} className={'flex gap-2 ' + (post.likes?.includes(user._id) ? 'text-[#1877F2]' : 'text-gray-500')}><span>👍</span> Like ({post.likes?.length || 0}) - Real</button>
                <span className="text-gray-500">💬 Comment - Real DB</span>
                <span className="text-gray-500">↗️ Share</span>
              </div>
            </div>
          ))}
        </main>
      </div>
    </AuthContext.Provider>
  )
}
export default App
