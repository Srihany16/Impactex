
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area } from 'recharts';

const pieData = [
  { name: 'nature', value: 450 },
  { name: 'learning', value: 350 },
  { name: 'welfare', value: 250 },
  { name: 'systems', value: 150 },
];
// Colors from the branding palette
const COLORS = ['#1e2a5e', '#e05c9d', '#f4d89f', '#bdc69a'];

const areaData = [
  { x: 0, y: 50 }, { x: 1, y: 30 }, { x: 2, y: 70 }, { x: 3, y: 40 }, { x: 4, y: 90 }, { x: 5, y: 60 }
];

const InsightsPanel: React.FC = () => {
  return (
    <div className="contents">
      {/* Column 2: Choose what you impact */}
      <div className="bg-white/40 backdrop-blur-3xl p-12 rounded-[60px] relative overflow-hidden group border border-white/60 shadow-2xl animate-float lg:sticky lg:top-32">
        <div className="relative z-10">
          <h3 className="text-6xl font-serif italic text-[#1e2a5e] leading-[0.8] mb-8 text-lowercase">
            choose <br /> what you <br /> <span className="text-[#e05c9d] not-italic font-sans font-black">impact.</span>
          </h3>
          <p className="text-xl text-[#1e2a5e]/70 font-medium mb-12 leading-tight text-lowercase max-w-[240px]">
            every donation is backed by rigorous data. we ensure your capital goes exactly where it's needed most.
          </p>
          
          <div className="h-32 w-full mb-12 opacity-20">
            <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={areaData}>
                  <Area type="stepBefore" dataKey="y" stroke="#1e2a5e" fill="#1e2a5e" fillOpacity={0.3} strokeWidth={5} />
               </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex -space-x-6">
                {[1, 2, 3, 4].map(i => (
                  <img key={i} src={`https://picsum.photos/seed/${i + 200}/100/100`} className="w-14 h-14 rounded-full border-2 border-white shadow-xl transition-transform hover:scale-110" alt="contributor" />
                ))}
            </div>
            <div>
                <p className="text-2xl font-black text-[#1e2a5e] tracking-tighter">24.8k+</p>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1e2a5e]/40 text-lowercase">impact earners</p>
            </div>
          </div>
        </div>
      </div>

      {/* Column 3: Real-time tracking / Calculated Insights */}
      <div className="bg-[#1e2a5e] p-12 rounded-[60px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] text-white lg:sticky lg:top-32">
        <div className="mb-10">
          <p className="text-[10px] font-black uppercase tracking-[0.6em] text-white/40 mb-3 text-lowercase">real-time tracking</p>
          <h4 className="text-5xl font-serif italic text-white text-lowercase leading-tight">calculated <br /> insights.</h4>
        </div>
        
        <div className="h-56 w-full mb-10 relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={10}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute text-center bg-[#1e2a5e] w-20 h-20 flex flex-col justify-center rounded-full border-2 border-white/10">
             <p className="text-3xl font-serif italic">100</p>
             <p className="text-[8px] uppercase font-black tracking-widest text-white/40">% val</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {pieData.map((entry, index) => (
            <div key={entry.name} className="space-y-1 border-l-2 pl-4" style={{ borderColor: COLORS[index % COLORS.length] }}>
              <span className="font-bold text-white text-[10px] text-lowercase block opacity-60">{entry.name}</span>
              <p className="font-serif italic text-2xl text-white leading-none">{Math.round((entry.value / 1200) * 100)}%</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InsightsPanel;
