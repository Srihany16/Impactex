
import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import InsightsPanel from '../components/InsightsPanel';
import Dashboard from '../components/Dashboard';
import AuthPage from '../components/AuthPage';
import ProfilePage from '../components/ProfilePage';
import SettingsPage from '../components/SettingsPage';

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'portfolio' | 'login' | 'signup' | 'profile' | 'settings'>('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const [impactScore, setImpactScore] = useState<number>(0);
  const [scrollY, setScrollY] = useState(0);
  const hubRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    
    // Check URL for verification token
    const urlParams = new URLSearchParams(window.location.search);
    const verifyToken = urlParams.get('verify_token');
    
    if (verifyToken) {
      fetch(`http://localhost:8000/auth/verify?token=${verifyToken}`)
        .then(res => res.json())
        .then(data => {
          alert(data.message || data.detail);
          window.history.replaceState({}, document.title, "/");
        });
    }

    // Check auth on mount
    const token = localStorage.getItem('token');
    if (token) {
      fetch('http://localhost:8000/api/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        if (!res.ok) throw new Error('Invalid token');
        return res.json();
      })
      .then(data => {
        setUserName(data.email.split('@')[0]);
        setImpactScore(data.impact_score);
        setIsLoggedIn(true);
      })
      .catch(() => {
        localStorage.removeItem('token');
      });
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToHub = () => {
    hubRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLoginSuccess = (name: string, newImpactScore: number = 0) => {
    setUserName(name);
    setImpactScore(newImpactScore);
    setIsLoggedIn(true);
    setView('portfolio');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUserName('');
    setImpactScore(0);
    setView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderContent = () => {
    if (view === 'login' || view === 'signup') {
      return (
        <AuthPage 
          mode={view as 'login' | 'signup'} 
          onLoginSuccess={handleLoginSuccess}
          onSwitchMode={setView}
        />
      );
    }

    if (view === 'portfolio') {
      return <Dashboard onBack={() => setView('home')} setImpactScore={setImpactScore} />;
    }

    if (view === 'profile') {
      return <ProfilePage userName={userName} onBack={() => setView('portfolio')} />;
    }

    if (view === 'settings') {
      return <SettingsPage onBack={() => setView('portfolio')} />;
    }

    return (
      <div className="relative">
        {/* Section 1: Sticky Hero */}
        <div className="sticky-hero overflow-hidden">
           <Hero scrollY={scrollY} onExplore={scrollToHub} />
        </div>

        {/* Section 2: Flowing Content Overlay */}
        <main className="content-overlay" ref={hubRef}>
          <section className="max-w-[1600px] mx-auto px-8 md:px-16 py-32">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
              
              {/* Column 1: Operative Insights */}
              <div className="space-y-16">
                <div className="text-left">
                   <h2 className="text-6xl font-serif italic text-white mb-6 text-lowercase leading-none">how we <br/> operate.</h2>
                   <p className="text-white/70 text-xl max-w-sm text-lowercase leading-tight">all based on calculated insights. we bridge the gap between intent and measurable results.</p>
                </div>

                <div className="space-y-12">
                  <div className="flex gap-8 items-start group">
                    <div className="text-4xl font-serif italic text-white opacity-20 group-hover:opacity-60 transition-all">01</div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-white text-lowercase">choose your charity</h3>
                      <p className="text-white/60 text-lg text-lowercase leading-snug max-w-[280px]">browse verified projects vetted for transparency and direct effectiveness.</p>
                    </div>
                  </div>

                  <div className="flex gap-8 items-start group">
                    <div className="text-4xl font-serif italic text-white opacity-20 group-hover:opacity-60 transition-all">02</div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-white text-lowercase">donate for a cause</h3>
                      <p className="text-white/60 text-lg text-lowercase leading-snug max-w-[280px]">allocate funds to specific outcomes. your contribution is converted into tangible impact units.</p>
                    </div>
                  </div>

                  <div className="flex gap-8 items-start group">
                    <div className="text-4xl font-serif italic text-white opacity-20 group-hover:opacity-60 transition-all">03</div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-white text-lowercase">earn impacts</h3>
                      <p className="text-white/60 text-lg text-lowercase leading-snug max-w-[280px]">track your personal contribution feed. see exactly where every dollar goes in real-time.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 2 & 3: Insights Panel Components */}
              <InsightsPanel />
              
            </div>
          </section>
        </main>

        {/* Floating Get Started Button */}
        {!isLoggedIn && scrollY > 400 && (
          <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 duration-500">
            <button 
              onClick={() => setView('login')}
              className="px-12 py-5 bg-[#e05c9d] text-white rounded-full font-black text-sm uppercase tracking-[0.4em] shadow-[0_20px_50px_rgba(224,92,157,0.4)] hover:scale-105 transition-all active:scale-95"
            >
              get started
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar 
        onNavigate={setView} 
        activeView={view} 
        scrollY={scrollY} 
        isLoggedIn={isLoggedIn}
        userName={userName}
        impactScore={impactScore}
        onLogout={handleLogout}
      />
      
      {renderContent()}

      <footer className="border-t border-white/10 py-32 bg-[#1e2a5e] text-white">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-16">
          <div className="font-bold text-4xl tracking-tighter">
            <span className="text-lowercase">impact</span><span className="text-[#f97099] font-light text-lowercase">ex</span>
          </div>
          <p className="text-white/40 text-center max-w-md text-2xl text-lowercase">earn impacts. donate today. all based on calculated insights.</p>
          <div className="flex gap-16">
            <a href="#" className="text-sm font-bold hover:text-[#f97099] transition-colors uppercase tracking-[0.5em] text-lowercase">about</a>
            <a href="#" className="text-sm font-bold hover:text-[#f97099] transition-colors uppercase tracking-[0.5em] text-lowercase">trust</a>
            <a href="#" className="text-sm font-bold hover:text-[#f97099] transition-colors uppercase tracking-[0.5em] text-lowercase">legal</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
