
import React, { useState } from 'react';

interface AuthPageProps {
  mode: 'login' | 'signup';
  onLoginSuccess: (userName: string, impactScore?: number) => void;
  onSwitchMode: (mode: 'login' | 'signup') => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ mode, onLoginSuccess, onSwitchMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/signup';
      const res = await fetch(`http://localhost:8000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.detail || 'Authentication failed');
      }

      let token = data.access_token;

      if (mode === 'signup') {
        alert(data.message);
        onSwitchMode('login');
        return;
      }
      
      localStorage.setItem('token', token);

      const userRes = await fetch(`http://localhost:8000/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const userData = await userRes.json();
      
      onLoginSuccess(userData.email.split('@')[0], userData.impact_score);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTestLogin = async () => {
    try {
      // For test login, just use team pentagon if it exists, or random
      onLoginSuccess('Team Pentagon', 0);
    } catch(err) {}
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-8 hero-gradient">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-3xl border border-white/20 p-12 rounded-[40px] shadow-2xl space-y-10 animate-in fade-in zoom-in duration-500">
        <div className="text-center space-y-2">
          <h2 className="text-5xl font-serif italic text-[#1e2a5e] text-lowercase">
            {mode === 'login' ? 'welcome back.' : 'join the market.'}
          </h2>
          <p className="text-[#1e2a5e]/60 text-sm font-bold uppercase tracking-[0.3em]">
            {mode === 'login' ? 'access your impact portfolio' : 'start your impact journey'}
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-[#1e2a5e]/40 ml-4">email address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-8 py-5 bg-white/20 border border-white/40 rounded-full focus:outline-none focus:border-[#1e2a5e] transition-colors placeholder:text-[#1e2a5e]/20"
              placeholder="name@agency.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-[#1e2a5e]/40 ml-4">password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-8 py-5 bg-white/20 border border-white/40 rounded-full focus:outline-none focus:border-[#1e2a5e] transition-colors placeholder:text-[#1e2a5e]/20"
              placeholder="••••••••"
            />
          </div>
        </div>

        {error && <div className="text-red-400 text-sm font-bold text-center bg-red-400/10 py-2 rounded-xl border border-red-400/20">{error}</div>}

        <div className="space-y-4">
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-5 bg-[#1e2a5e] text-white rounded-full font-black text-lg hover:scale-[1.02] transition-transform shadow-xl text-lowercase disabled:opacity-50"
          >
            {loading ? 'processing...' : (mode === 'login' ? 'authenticate' : 'create account')}
          </button>
          
          <div className="flex items-center gap-4 py-2">
            <div className="flex-1 h-[1px] bg-[#1e2a5e]/10"></div>
            <span className="text-[10px] font-black text-[#1e2a5e]/20 uppercase tracking-widest">or</span>
            <div className="flex-1 h-[1px] bg-[#1e2a5e]/10"></div>
          </div>

          <button 
            onClick={handleTestLogin}
            className="w-full py-5 border-2 border-[#e05c9d] text-[#e05c9d] rounded-full font-black text-lg hover:bg-[#e05c9d] hover:text-white transition-all text-lowercase group flex items-center justify-center gap-3"
          >
            <span>test login: team pentagon</span>
            <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">→</span>
          </button>
        </div>

        <div className="text-center">
          <button 
            onClick={() => onSwitchMode(mode === 'login' ? 'signup' : 'login')}
            className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1e2a5e]/60 hover:text-[#e05c9d] transition-colors"
          >
            {mode === 'login' ? "don't have an account? sign up" : "already a member? log in"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
