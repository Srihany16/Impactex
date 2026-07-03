
import React, { useState } from 'react';
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { IMPACT_PROJECTS } from '../src/constants';
import { ImpactProject } from '../src/types';

const performanceData = [
  { month: 'jan', score: 120 },
  { month: 'feb', score: 180 },
  { month: 'mar', score: 160 },
  { month: 'apr', score: 240 },
  { month: 'may', score: 380 },
  { month: 'jun', score: 420 },
  { month: 'jul', score: 550 },
];

const allocationData = [
  { name: 'environment', value: 45 },
  { name: 'education', value: 25 },
  { name: 'health', value: 20 },
  { name: 'infra', value: 10 },
];

const COLORS = ['#1e2a5e', '#e05c9d', '#f4d89f', '#bdc69a'];

interface DashboardProps {
  onBack?: () => void;
  setImpactScore?: (score: number) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onBack, setImpactScore }) => {
  const [selectedProject, setSelectedProject] = useState<ImpactProject | null>(null);
  const [projects, setProjects] = useState<ImpactProject[]>(IMPACT_PROJECTS);
  const [newsFeed, setNewsFeed] = useState<{text: string, score: number}[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [globalEvents, setGlobalEvents] = useState<any[]>([]);
  
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('http://localhost:8000/api/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.email === 'yadalla.srihan@gmail.com') {
          setIsAdmin(true);
        }
      })
      .catch(err => console.error("Admin check failed:", err));
    }
    fetch('http://localhost:8000/api/charities')
      .then(res => res.json())
      .then(data => {
        // Map the backend charities to the ImpactProject interface used by the UI
        const mapped = data.map((charity: any) => {
          // Find matching project from constants to keep the images and static campaign info
          const baseProject = IMPACT_PROJECTS.find(p => p.name === charity.name) || IMPACT_PROJECTS[0];
          return {
            ...baseProject,
            id: charity.id.toString(),
            name: charity.name,
            description: charity.description,
            costPerOutcome: charity.current_price, // Live dynamic price!
            currentRisk: charity.current_risk,
          };
        });
        setProjects(mapped);
      })
      .catch(err => console.error("Error fetching charities:", err));
      
    fetch('http://localhost:8000/api/news/events')
      .then(res => res.json())
      .then(data => setGlobalEvents(data))
      .catch(err => console.error("Error fetching events:", err));
  }, []);

  const handleAllocate = async (campaign: any) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return alert('Please log in first!');
      
      const res = await fetch('http://localhost:8000/api/donate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          charity_id: parseInt(selectedProject!.id),
          amount: selectedProject!.costPerOutcome
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);
      
      if (setImpactScore) setImpactScore(data.total_impact_score);
      setSelectedProject({ ...selectedProject!, costPerOutcome: data.new_charity_price });
      setProjects(projects.map(p => p.id === selectedProject!.id ? { ...p, costPerOutcome: data.new_charity_price } : p));
      
      alert(`Success! You earned ${data.impact_earned.toFixed(2)} impact points.`);
    } catch(err: any) {
      alert(err.message);
    }
  };

  const handleGenerateNews = async (charityId: string) => {
    try {
      const genRes = await fetch('http://localhost:8000/api/news/generate');
      const genData = await genRes.json();
      
      const impRes = await fetch('http://localhost:8000/api/news/impact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ charity_id: parseInt(charityId), news_text: genData.headline })
      });
      const impData = await impRes.json();
      
      setNewsFeed([{text: genData.headline, score: impData.sentiment_score}, ...newsFeed]);
      
      // Update global events
      fetch('http://localhost:8000/api/news/events')
        .then(res => res.json())
        .then(data => setGlobalEvents(data));
      
      // Update UI with new risk and price
      setSelectedProject(prev => prev ? { ...prev, costPerOutcome: impData.new_base_price, currentRisk: impData.new_risk } : null);
      setProjects(projects.map(p => p.id === charityId ? { ...p, costPerOutcome: impData.new_base_price, currentRisk: impData.new_risk } : p));
      
      if (impData.sentiment_score > 0) alert(`BULLISH NEWS: Asset value pumped! Sentiment: ${impData.sentiment_score.toFixed(2)}`);
      else if (impData.sentiment_score < 0) alert(`BEARISH NEWS: Asset crashed! Risk increased. Sentiment: ${impData.sentiment_score.toFixed(2)}`);
      else alert(`NEUTRAL NEWS: Market is stable.`);
    } catch(err) {
      console.error(err);
      alert("Failed to generate AI news.");
    }
  };

  const renderDetailView = (project: ImpactProject) => (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start gap-12">
        <div className="space-y-6">
          <button 
            onClick={() => setSelectedProject(null)}
            className="text-[10px] font-bold uppercase tracking-[0.5em] text-white/40 hover:text-[#e05c9d] transition-colors flex items-center gap-2"
          >
            <span className="text-lg">←</span> back to portfolio overview
          </button>
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-[#e05c9d] uppercase tracking-[0.3em]">{project.projectCode} / {project.category}</span>
            <h1 className="text-8xl font-serif italic leading-none text-lowercase">{project.name}.</h1>
          </div>
          <p className="text-2xl text-white font-medium text-lowercase tracking-tight max-w-2xl leading-tight">
            {project.description}
          </p>
        </div>
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-12 text-right space-y-8 min-w-[300px]">
           <div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-2">efficiency rating</p>
              <p className="text-7xl font-bold tracking-tighter text-[#bdc69a]">{project.efficiencyRating}%</p>
           </div>
           <div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-2">unit cost</p>
              <p className="text-5xl font-bold tracking-tighter">${project.costPerOutcome.toFixed(2)}</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-12">
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <h2 className="text-4xl font-serif italic text-white text-lowercase">strategic campaigns.</h2>
              <div className="flex-1 h-[1px] bg-white/10"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {project.campaigns?.map((campaign) => (
                <div key={campaign.id} className="p-10 bg-black/40 backdrop-blur-xl border border-white/10 space-y-6 group hover:border-[#e05c9d]/40 transition-all">
                  <div className="flex justify-between items-start">
                    <h3 className="text-2xl font-bold text-lowercase leading-tight">{campaign.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${campaign.status === 'active' ? 'bg-[#bdc69a] text-black' : 'bg-white/10 text-white/40'}`}>
                      {campaign.status}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] text-white/40 uppercase font-black tracking-widest">impact target</p>
                    <p className="text-4xl font-mono font-bold">{campaign.goal}</p>
                  </div>
                  <button 
                    onClick={() => handleAllocate(campaign)}
                    className="w-full py-4 bg-white text-black text-[10px] font-black uppercase tracking-[0.4em] hover:bg-[#e05c9d] hover:text-white transition-all">
                    allocate capital
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="p-12 bg-black/40 backdrop-blur-xl border border-white/10 space-y-8">
            <h2 className="text-2xl font-serif italic text-white text-lowercase">outcome projections.</h2>
            <div className="h-64 w-full opacity-40">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={areaDataDetail}>
                  <Area type="monotone" dataKey="val" stroke="#fff" fill="#fff" fillOpacity={0.1} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {isAdmin && (
            <div className="p-12 bg-black/40 backdrop-blur-xl border border-[#bdc69a]/30 space-y-8 relative overflow-hidden">
               <div className="absolute -top-10 -right-10 p-8 text-[#bdc69a] opacity-5 font-serif italic text-9xl pointer-events-none">ml</div>
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
                 <div className="space-y-1">
                   <h2 className="text-2xl font-serif italic text-white text-lowercase">market news feed.</h2>
                   <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">ai generated sentiment shocks (admin only)</p>
                 </div>
                 <button onClick={() => handleGenerateNews(project.id)} className="px-6 py-4 bg-white text-black font-black uppercase text-[10px] tracking-widest hover:bg-[#bdc69a] transition-all whitespace-nowrap shadow-[0_0_20px_rgba(189,198,154,0.3)]">
                    generate ai event
                 </button>
               </div>
               {newsFeed.length > 0 ? (
                 <div className="space-y-4 relative z-10 max-h-[300px] overflow-y-auto pr-4 custom-scrollbar">
                   {newsFeed.map((news, i) => (
                     <div key={i} className={`p-6 border-l-4 backdrop-blur-md ${news.score > 0 ? 'border-[#bdc69a] bg-[#bdc69a]/5' : (news.score < 0 ? 'border-[#e05c9d] bg-[#e05c9d]/5' : 'border-white/20 bg-white/5')}`}>
                        <p className="text-sm font-medium leading-relaxed">{news.text}</p>
                        <div className="flex justify-between items-center mt-4">
                          <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${news.score > 0 ? 'text-[#bdc69a]' : (news.score < 0 ? 'text-[#e05c9d]' : 'text-white/40')}`}>
                             Sentiment: {news.score > 0 ? 'BULLISH' : (news.score < 0 ? 'BEARISH' : 'NEUTRAL')}
                          </p>
                          <p className="font-mono text-xs opacity-50">{news.score.toFixed(2)}</p>
                        </div>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="p-8 border border-dashed border-white/20 text-center relative z-10">
                   <p className="text-sm text-white/40 italic">No recent events for this asset.</p>
                 </div>
               )}
            </div>
          )}
        </div>

        <div className="lg:col-span-4 space-y-12">
          <div className="bg-[#0a0a0a] border border-white/5 p-12 space-y-10">
            <h3 className="text-xl font-serif italic text-lowercase">financials.</h3>
            <div className="space-y-6">
              <div className="flex justify-between border-b border-white/5 pb-4">
                 <span className="text-[10px] font-bold text-white/40 uppercase">funding target</span>
                 <span className="text-lg font-mono font-bold">{project.fundingTarget}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-4">
                 <span className="text-[10px] font-bold text-white/40 uppercase">verified outcomes</span>
                 <span className="text-lg font-mono font-bold">{project.totalOutcomes.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-4">
                 <span className="text-[10px] font-bold text-white/40 uppercase">impact unit</span>
                 <span className="text-lg text-lowercase">{project.unitName}</span>
              </div>
            </div>
          </div>

          <div className="p-12 bg-[#e05c9d]/10 border border-[#e05c9d]/20 space-y-6">
             <div className="flex justify-between items-center">
               <h3 className="text-xl font-serif italic text-lowercase">impact risk.</h3>
               <span className="font-mono text-xl font-bold text-[#e05c9d]">{project.currentRisk?.toFixed(1) || '1.0'}x</span>
             </div>
             <p className="text-sm text-white/60 leading-relaxed text-lowercase">
               capital allocated to this project carries a dynamic risk factor. higher risk yields higher impact returns upon verification.
             </p>
             <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#e05c9d]" style={{ width: `${Math.min(((project.currentRisk || 1) / 5) * 100, 100)}%` }}></div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );

  const areaDataDetail = [
    { x: 0, val: 30 }, { x: 1, val: 45 }, { x: 2, val: 35 }, { x: 3, val: 60 }, { x: 4, val: 55 }, { x: 5, val: 80 }
  ];

  return (
    <main 
      className="min-h-screen text-white pt-40 pb-32 relative overflow-hidden" 
      style={{
        background: 'linear-gradient(to bottom, #e8a86c 0%, #d49055 15%, #c07840 30%, #8a5230 50%, #3a3a3a 70%, #000000 100%)'
      }}
    >
      <div className="max-w-7xl mx-auto px-8 space-y-16 relative z-10">
        
        {selectedProject ? renderDetailView(selectedProject) : (
          <>
            <div className="flex flex-col md:flex-row justify-between items-end gap-12 border-b border-white/10 pb-16">
              <div className="space-y-6">
                <button 
                  onClick={onBack}
                  className="text-[10px] font-bold uppercase tracking-[0.5em] text-white/40 hover:text-[#e05c9d] transition-colors flex items-center gap-2"
                >
                  <span className="text-lg">←</span> back to home
                </button>
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#e05c9d]">authorized: team pentagon</p>
                  <h1 className="text-8xl font-serif italic leading-none text-lowercase">your portfolio.</h1>
                </div>
                <p className="text-xl text-white/40 font-medium text-lowercase tracking-tight max-w-lg">
                  pro-tier oversight of capital allocation and verified social outcomes. active since fiscal year 2024.
                </p>
              </div>
              <div className="text-right flex flex-col items-end">
                 <span className="px-4 py-1 border border-[#e05c9d] text-[#e05c9d] rounded-full text-[10px] font-bold uppercase tracking-[0.2em]">account verified</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-1">
              <div className="p-10 bg-black/40 backdrop-blur-xl border border-white/10 space-y-4">
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.4em] text-lowercase">net contribution</p>
                <p className="text-5xl font-bold tracking-tight">$4,250.00</p>
              </div>
              <div className="p-10 bg-black/40 backdrop-blur-xl border border-white/10 space-y-4">
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.4em] text-lowercase">impact units (iv)</p>
                <p className="text-5xl font-bold tracking-tight">2,108.4</p>
              </div>
              <div className="p-10 bg-black/40 backdrop-blur-xl border border-white/10 space-y-4">
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.4em] text-lowercase">conversion rate</p>
                <p className="text-5xl font-bold tracking-tight text-[#bdc69a]">94.2%</p>
              </div>
              <div className="p-10 bg-black/40 backdrop-blur-xl border border-white/10 space-y-4">
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.4em] text-lowercase">lives touched</p>
                <p className="text-5xl font-bold tracking-tight">1,420</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-8 space-y-12">
                <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-12 rounded-[2px] space-y-12">
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <h2 className="text-2xl font-serif italic text-white text-lowercase">performance trajectory.</h2>
                      <p className="text-[10px] uppercase font-bold text-white/20 tracking-widest">impact value over time</p>
                    </div>
                    <div className="flex bg-white/5 rounded-sm p-1">
                      {['1d', '1w', '1m', 'max'].map(t => (
                        <button key={t} className={`px-4 py-1 text-[10px] font-bold uppercase tracking-widest ${t === 'max' ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="h-[450px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={performanceData}>
                        <defs>
                          <linearGradient id="impactGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#e05c9d" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#e05c9d" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis 
                          dataKey="month" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: '900'}}
                          dy={20}
                        />
                        <Tooltip 
                          contentStyle={{backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0px'}}
                          itemStyle={{color: '#e05c9d'}}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="score" 
                          stroke="#e05c9d" 
                          strokeWidth={3} 
                          fillOpacity={1} 
                          fill="url(#impactGradient)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-serif italic text-white text-lowercase">active assets.</h2>
                    <div className="flex-1 h-[1px] bg-white/10"></div>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {projects.map((project) => (
                      <div 
                        key={project.id} 
                        onClick={() => setSelectedProject(project)}
                        className="flex items-center justify-between p-8 bg-black/40 backdrop-blur-xl border border-white/10 hover:border-white/50 transition-all group cursor-pointer hover:translate-x-2"
                      >
                        <div className="flex items-center gap-8">
                           <span className="text-[10px] font-black text-white/20 font-mono group-hover:text-[#e05c9d] transition-colors">{project.projectCode}</span>
                           <div>
                              <p className="font-bold text-lg text-lowercase">{project.name}</p>
                              <p className="text-[10px] uppercase font-bold text-white/30 tracking-widest">{project.unitName}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-16 text-right">
                           <div className="hidden md:block">
                              <p className="text-[10px] text-white/20 uppercase font-black mb-1">risk factor</p>
                              <p className="text-xl font-bold font-mono text-[#f4d89f]">{project.currentRisk?.toFixed(1) || '1.0'}x</p>
                           </div>
                           <div className="hidden md:block">
                              <p className="text-[10px] text-white/20 uppercase font-black mb-1">efficiency</p>
                              <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden">
                                 <div className="h-full bg-[#bdc69a]" style={{width: `${project.efficiencyRating}%`}}></div>
                              </div>
                           </div>
                           <div>
                              <p className="font-mono text-xl">${project.costPerOutcome.toFixed(2)}</p>
                              <p className="text-[10px] text-[#bdc69a] font-black uppercase">+{ (Math.random() * 10 + 2).toFixed(1) }% gain</p>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 space-y-12">
                <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-12 space-y-12">
                   <div className="space-y-1">
                     <h3 className="text-xl font-serif italic text-lowercase">sector mix.</h3>
                     <p className="text-[10px] uppercase font-bold text-white/20 tracking-widest">capital distribution</p>
                   </div>
                   <div className="h-64 w-full relative flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={allocationData}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                          >
                            {allocationData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} opacity={0.8} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute text-center space-y-1">
                         <p className="text-3xl font-mono font-bold">82.0</p>
                         <p className="text-[8px] uppercase font-black tracking-[0.4em] text-white/40">purity index</p>
                      </div>
                   </div>
                   <div className="space-y-4">
                      {allocationData.map((item, idx) => (
                        <div key={item.name} className="flex justify-between items-center text-[10px] font-bold uppercase tracking-[0.2em]">
                          <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: COLORS[idx % COLORS.length]}}></div>
                            <span className="text-white/40">{item.name}</span>
                          </div>
                          <span className="font-mono">{item.value}%</span>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-12 space-y-8">
                   <h3 className="text-xl font-serif italic text-lowercase">live ticker.</h3>
                   <div className="space-y-6">
                      {globalEvents.length > 0 ? globalEvents.map((evt, i) => (
                        <div key={i} className="flex gap-4 items-start border-l border-white/10 pl-6 py-2">
                           <div className={`w-1.5 h-1.5 mt-1.5 rounded-full ${evt.sentiment_score > 0 ? 'bg-[#bdc69a] shadow-[0_0_10px_#bdc69a]' : 'bg-[#e05c9d] shadow-[0_0_10px_#e05c9d]'}`}></div>
                           <div className="space-y-1">
                              <p className="text-white/90 font-medium text-[11px] leading-snug">{evt.news_text} <span className="opacity-40">/ {evt.charity_name}</span></p>
                              <p className={`text-[9px] font-black uppercase tracking-widest ${evt.sentiment_score > 0 ? 'text-[#bdc69a]' : 'text-[#e05c9d]'}`}>
                                {evt.sentiment_score > 0 ? 'BULLISH' : 'BEARISH'} ({evt.sentiment_score.toFixed(2)})
                              </p>
                           </div>
                        </div>
                      )) : (
                        <p className="text-xs text-white/40 italic text-center">No market events.</p>
                      )}
                   </div>
                   <button className="w-full py-4 bg-white text-black font-black text-[10px] uppercase tracking-[0.4em] hover:bg-[#e05c9d] hover:text-white transition-all mt-4">
                      open data logs
                   </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
};

export default Dashboard;
