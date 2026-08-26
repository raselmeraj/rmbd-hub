import { useState, useEffect } from 'react';
import Login from './pages/Login.jsx';

function Feed({ user, onLogout }) {
  return (
    <div className="min-h-screen bg-[#fff6f0] font-sans">
      <div className="w-full bg-[#e89e9e] p-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[8px] font-bold">RMBD</div>
          <span className="font-serif font-bold text-sm">RMBD HUB</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px]">Hi, {user?.name || user?.email}</span>
          <button onClick={onLogout} className="bg-black text-white rounded-full px-3 py-1 text-[10px]">Logout</button>
        </div>
      </div>
      <div className="max-w-[600px] mx-auto p-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <h1 className="text-2xl font-serif">Welcome to RMBD Hub! 🎉</h1>
          <p className="text-[12px] mt-2 opacity-60">Login Successful! This is your Newsfeed.</p>
          <div className="mt-4 bg-[#f5e6d8]/60 rounded-xl p-4">
            <p className="text-[11px]"><span className="font-bold">User:</span> {user?.email}</p>
            <p className="text-[11px]"><span className="font-bold">Name:</span> {user?.name}</p>
            <p className="text-[11px]"><span className="font-bold">Joined:</span> {new Date().toLocaleDateString()}</p>
          </div>
          <div className="mt-6 space-y-3">
            <div className="bg-[#e89e9e]/20 rounded-xl p-4">
              <p className="text-[12px] font-bold">📢 First Post from RMBD Hub</p>
              <p className="text-[11px] mt-1 opacity-70">Talk less, connect more. Your social journey starts here!</p>
            </div>
          </div>
        </div>
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
    if (logged && user) {
      setIsLoggedIn(true);
      setCurrentUser(user);
    }
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

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return <Feed user={currentUser} onLogout={handleLogout} />;
}
