import { useState } from "react";

export default function Login({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center p-4">
      <div className="max-w-6xl w-full flex flex-col lg:flex-row items-center justify-between gap-10">
        {/* LEFT SIDE - NEW BRANDING */}
        <div className="flex-1 text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
            <div className="w-20 h-20 bg-[#0866ff] rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-4xl">R</span>
            </div>
            <div>
              <h1 className="text-[#0866ff] font-black text-5xl leading-none tracking-tighter">RMBD-HUB</h1>
              <p className="text-gray-800 font-bold text-xl mt-1">সব বন্ধু একসাথে</p>
            </div>
          </div>
          <p className="text-[22px] leading-8 text-gray-800 max-w-[500px] mx-auto lg:mx-0">
            RMBD Hub helps you connect and share with the people in your life.
          </p>
        </div>

        {/* RIGHT SIDE - LOGIN BOX */}
        <div className="bg-white rounded-xl shadow-[0_2px_15px_rgba(0,0,0,0.15)] p-5 w-full max-w-[400px]">
          <div className="flex gap-2 mb-4">
            <button onClick={() => setIsLogin(true)} className={`flex-1 py-2.5 rounded-lg font-bold transition ${isLogin ? "bg-[#0866ff] text-white" : "bg-gray-100 text-gray-700"}`}>Login</button>
            <button onClick={() => setIsLogin(false)} className={`flex-1 py-2.5 rounded-lg font-bold transition ${!isLogin ? "bg-[#0866ff] text-white" : "bg-gray-100 text-gray-700"}`}>Register</button>
          </div>
          <div className="space-y-3">
            <input placeholder="Email address" className="w-full border border-gray-300 p-3.5 rounded-lg bg-[#f5f6f7] focus:outline-none focus:border-blue-500 text-[17px]" />
            <input placeholder="Password" type="password" className="w-full border border-gray-300 p-3.5 rounded-lg bg-[#f5f6f7] focus:outline-none focus:border-blue-500 text-[17px]" />
            <button className="w-full bg-[#0866ff] hover:bg-[#075eec] text-white py-3 rounded-lg font-bold text-[20px] transition">Log in</button>
          </div>
          <p className="text-center text-[13px] text-gray-500 mt-5">Backend on Render takes 30s to wake up first time!</p>
        </div>
      </div>
    </div>
  );
}
