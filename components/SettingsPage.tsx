
import React, { useState } from 'react';

interface SettingsPageProps {
  onBack: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ onBack }) => {
  const [notifications, setNotifications] = useState(true);
  const [privacy, setPrivacy] = useState(false);

  return (
    <div className="min-h-screen pt-40 pb-32 px-12 hero-gradient">
      <div className="max-w-4xl mx-auto space-y-16">
        <div className="space-y-6 border-b border-[#1e2a5e]/10 pb-12">
          <button 
            onClick={onBack}
            className="text-[10px] font-black uppercase tracking-[0.5em] text-[#1e2a5e]/40 hover:text-[#1e2a5e] transition-colors"
          >
            ← return to hub
          </button>
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#e05c9d]">protocol configuration</span>
            <h1 className="text-8xl font-serif italic text-[#1e2a5e] text-lowercase leading-none">settings.</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-16">
          <div className="md:col-span-8 space-y-16">
            <section className="space-y-10">
              <div className="space-y-2">
                 <h2 className="text-3xl font-serif italic text-[#1e2a5e] text-lowercase">market notifications.</h2>
                 <p className="text-sm text-[#1e2a5e]/60 text-lowercase">how you receive real-time impact outcome alerts.</p>
              </div>
              
              <div className="space-y-6">
                {[
                  { label: 'outcome verified', desc: 'alerts when capital converts to verified units' },
                  { label: 'project milestone', desc: 'notifications for major project completions' },
                  { label: 'portfolio summary', desc: 'weekly analysis of your impact growth' }
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center p-8 bg-white/20 border border-white/40 rounded-3xl group hover:bg-white/40 transition-all">
                    <div className="space-y-1">
                      <p className="font-bold text-[#1e2a5e] text-lowercase">{item.label}</p>
                      <p className="text-[10px] font-black text-[#1e2a5e]/40 uppercase tracking-widest">{item.desc}</p>
                    </div>
                    <div 
                      onClick={() => setNotifications(!notifications)}
                      className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-colors ${notifications ? 'bg-[#bdc69a]' : 'bg-[#1e2a5e]/20'}`}
                    >
                      <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${notifications ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-10">
              <div className="space-y-2">
                 <h2 className="text-3xl font-serif italic text-[#1e2a5e] text-lowercase">market privacy.</h2>
                 <p className="text-sm text-[#1e2a5e]/60 text-lowercase">control who can see your impact trajectory.</p>
              </div>
              
              <div className="p-8 bg-white/20 border border-white/40 rounded-3xl flex justify-between items-center">
                <div className="space-y-1">
                  <p className="font-bold text-[#1e2a5e] text-lowercase">public impact feed</p>
                  <p className="text-[10px] font-black text-[#1e2a5e]/40 uppercase tracking-widest">show your verified wins on the global leaderboards</p>
                </div>
                <div 
                  onClick={() => setPrivacy(!privacy)}
                  className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-colors ${privacy ? 'bg-[#bdc69a]' : 'bg-[#1e2a5e]/20'}`}
                >
                  <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${privacy ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </div>
              </div>
            </section>
          </div>

          <div className="md:col-span-4 space-y-12">
            <div className="p-10 bg-[#1e2a5e] text-white rounded-[40px] space-y-8">
               <h3 className="text-xl font-serif italic text-lowercase">security vault.</h3>
               <div className="space-y-6">
                 <button className="w-full py-4 border border-white/20 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors">update credentials</button>
                 <button className="w-full py-4 border border-white/20 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors">biometric reset</button>
                 <button className="w-full py-4 bg-[#e05c9d] text-white text-[10px] font-black uppercase tracking-widest shadow-xl">deactivate account</button>
               </div>
            </div>

            <div className="p-10 border border-[#1e2a5e]/20 rounded-[40px] space-y-4">
               <p className="text-[10px] font-black text-[#1e2a5e]/40 uppercase tracking-widest">system version</p>
               <p className="font-mono text-[#1e2a5e] text-sm">v4.20.9-stable</p>
               <p className="text-[10px] text-[#1e2a5e]/60 text-lowercase leading-snug">last synchronized with the central exchange: 4 minutes ago.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
