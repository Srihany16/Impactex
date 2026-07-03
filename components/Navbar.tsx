
import React, { useState, useRef, useEffect } from 'react';

interface NavbarProps {
  onNavigate: (view: 'home' | 'portfolio' | 'login' | 'signup' | 'profile' | 'settings') => void;
  activeView: 'home' | 'portfolio' | 'login' | 'signup' | 'profile' | 'settings';
  scrollY: number;
  isLoggedIn: boolean;
  userName?: string;
  impactScore?: number;
  onLogout?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, activeView, scrollY, isLoggedIn, userName, impactScore, onLogout }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const opacity = Math.min(scrollY / 200, 1);
  const blur = Math.min(scrollY / 10, 16);
  const bgColor = `rgba(30, 42, 94, ${opacity * 0.95})`;

  const isAuthPage = activeView === 'login' || activeView === 'signup';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav 
      className="fixed top-0 left-0 right-0 z-[100] px-12 py-6 flex justify-between items-center transition-all duration-300 border-b"
      style={{ 
        backgroundColor: bgColor,
        backdropFilter: `blur(${blur}px)`,
        borderColor: `rgba(255, 255, 255, ${opacity * 0.1})`,
        paddingTop: scrollY > 50 ? '1.5rem' : '2.5rem',
        paddingBottom: scrollY > 50 ? '1.5rem' : '2.5rem',
      }}
    >
      <div 
        className={`cursor-pointer font-bold text-3xl tracking-tighter flex items-center gap-1 group transition-colors duration-300 ${scrollY > 100 || isAuthPage ? 'text-white' : 'text-[#1e2a5e]'}`}
        onClick={() => {
          setIsDropdownOpen(false);
          onNavigate('home');
        }}
      >
        <span className="text-lowercase group-hover:italic transition-all">impact</span>
        <span className={`font-light text-lowercase ${scrollY > 100 || isAuthPage ? 'text-white/40' : 'text-[#1e2a5e]/40'}`}>ex</span>
      </div>
      
      <div className="flex items-center gap-12">
        {!isAuthPage && (
          <button 
            onClick={() => onNavigate('home')}
            className={`text-sm font-black tracking-[0.4em] uppercase transition-all text-lowercase pb-1 ${
              activeView === 'home' 
                ? `border-b-2 ${scrollY > 100 ? 'text-white border-white' : 'text-[#1e2a5e] border-[#1e2a5e]'}` 
                : `${scrollY > 100 ? 'text-white/60 hover:text-white' : 'text-[#1e2a5e]/60 hover:text-[#1e2a5e]'}`
            }`}
          >
            home
          </button>
        )}

        {isLoggedIn ? (
          <>
            <button 
              onClick={() => onNavigate('portfolio')}
              className={`text-sm font-black tracking-[0.4em] uppercase transition-all text-lowercase pb-1 ${
                activeView === 'portfolio' 
                  ? `border-b-2 ${scrollY > 100 ? 'text-white border-white' : 'text-[#1e2a5e] border-[#1e2a5e]'}` 
                  : `${scrollY > 100 ? 'text-white/60 hover:text-white' : 'text-[#1e2a5e]/60 hover:text-[#1e2a5e]'}`
              }`}
            >
              your portfolio
            </button>
            <div className="relative pl-4 border-l border-white/10" ref={dropdownRef}>
              <div 
                className="flex items-center gap-4 cursor-pointer group"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div className="flex flex-col items-end">
                  <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${scrollY > 100 ? 'text-white/60' : 'text-[#1e2a5e]/60'}`}>
                    {userName}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[9px] font-bold uppercase tracking-widest ${scrollY > 100 ? 'text-[#e05c9d]' : 'text-[#e05c9d]'}`}>
                      Impact: {impactScore?.toFixed(1) || '0.0'}
                    </span>
                    <div className="w-16 h-1 bg-white/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#e05c9d] transition-all duration-1000"
                        style={{ width: `${Math.min(((impactScore || 0) / 1000) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className={`w-10 h-10 rounded-full border p-1 flex items-center justify-center overflow-hidden transition-all group-hover:scale-110 ${scrollY > 100 ? 'bg-white/10 border-white/20' : 'bg-black/5 border-black/10'}`}>
                  <img src="https://picsum.photos/seed/team-pentagon/100/100" alt="avatar" className="w-full h-full rounded-full object-cover grayscale brightness-125" />
                </div>
              </div>

              {isDropdownOpen && (
                <div className="absolute top-14 right-0 w-64 bg-[#1e2a5e] border border-white/10 rounded-3xl p-6 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="space-y-4">
                    <button 
                      onClick={() => { onNavigate('profile'); setIsDropdownOpen(false); }}
                      className="w-full text-left text-[10px] font-black uppercase tracking-[0.4em] text-white/60 hover:text-white transition-colors"
                    >
                      impact profile
                    </button>
                    <button 
                      onClick={() => { onNavigate('settings'); setIsDropdownOpen(false); }}
                      className="w-full text-left text-[10px] font-black uppercase tracking-[0.4em] text-white/60 hover:text-white transition-colors"
                    >
                      market settings
                    </button>
                    <div className="h-[1px] bg-white/10 my-4"></div>
                    <button 
                      onClick={() => { if(onLogout) onLogout(); setIsDropdownOpen(false); }}
                      className="w-full text-left text-[10px] font-black uppercase tracking-[0.4em] text-[#e05c9d] hover:text-white transition-colors"
                    >
                      security protocol (exit)
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-6">
            <button 
              onClick={() => onNavigate('login')}
              className={`text-[10px] font-black uppercase tracking-[0.4em] transition-colors ${scrollY > 100 || isAuthPage ? 'text-white hover:text-[#e05c9d]' : 'text-[#1e2a5e] hover:text-[#e05c9d]'}`}
            >
              log in
            </button>
            <button 
              onClick={() => onNavigate('signup')}
              className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.4em] transition-all border ${
                scrollY > 100 || isAuthPage 
                  ? 'bg-white text-[#1e2a5e] border-white hover:bg-transparent hover:text-white' 
                  : 'bg-[#1e2a5e] text-white border-[#1e2a5e] hover:bg-transparent hover:text-[#1e2a5e]'
              }`}
            >
              sign up
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
