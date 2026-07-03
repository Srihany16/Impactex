
import React from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

const chartData = [
  { x: 0, y: 40 }, { x: 1, y: 65 }, { x: 2, y: 45 }, { x: 3, y: 90 }, { x: 4, y: 75 }, { x: 5, y: 100 }
];

interface HeroProps {
  scrollY: number;
  onExplore?: () => void;
}

const Hero: React.FC<HeroProps> = ({ scrollY, onExplore }) => {
  const opacity = Math.max(0, 1 - scrollY / 600);
  const translateY = scrollY * 0.4;

  return (
    <div className="w-full h-full relative flex flex-col justify-center px-8 md:px-24 hero-gradient">
      {/* Background Decorative Data Flow */}
      <div className="absolute right-[-10%] bottom-0 w-3/4 h-3/4 opacity-10 pointer-events-none -rotate-6 translate-y-1/4">
         <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
               <Area type="monotone" dataKey="y" stroke="#1e2a5e" fill="#1e2a5e" fillOpacity={1} strokeWidth={8} />
            </AreaChart>
         </ResponsiveContainer>
      </div>

      <div 
        className="max-w-7xl w-full text-left space-y-10 relative z-10 transition-all duration-300"
        style={{ opacity, transform: `translateY(${translateY}px)` }}
      >
        <div className="space-y-0">
          <h1 className="text-6xl md:text-[120px] font-bold text-[#1e2a5e] leading-[0.9] tracking-tighter text-lowercase">
            earn <br />
            <span className="font-serif italic font-normal">impacts.</span>
          </h1>
          <p className="text-3xl md:text-[60px] font-black text-[#e05c9d] tracking-tighter text-lowercase leading-none mt-4">
            donate today.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start gap-6 pt-6">
          <button 
            onClick={onExplore}
            className="px-10 py-5 bg-[#1e2a5e] text-white rounded-full font-black text-lg hover:scale-105 transition-transform shadow-[0_20px_40px_-10px_rgba(30,58,94,0.3)] text-lowercase"
          >
            choose your charity
          </button>
          <button 
            onClick={onExplore}
            className="px-10 py-5 border-2 border-[#1e2a5e] text-[#1e2a5e] rounded-full font-black text-lg hover:bg-white/30 transition-colors text-lowercase"
          >
            see our insights
          </button>
        </div>
      </div>

      {/* scroll arrow indicator */}
      <div 
        className="absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-6 transition-opacity duration-300"
        style={{ opacity: opacity * 0.4 }}
      >
        <div className="w-[2px] h-16 bg-gradient-to-b from-[#1e2a5e] to-transparent rounded-full animate-bounce"></div>
        <span className="text-xs uppercase font-black tracking-[0.6em] text-[#1e2a5e] text-lowercase opacity-60">scroll</span>
      </div>
    </div>
  );
};

export default Hero;
