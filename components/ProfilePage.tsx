
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { jsPDF } from "jspdf";

interface ProfilePageProps {
  userName: string;
  onBack: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ userName, onBack }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState('');

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress('accessing secure vaults...');
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      setExportProgress('generating impact report...');
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate a professional, structured Impact Investment Statement for "${userName}". 
        The report should be organized with the following sections:
        1. ACCOUNT OVERVIEW: Primary Sector: Environment, Tier: Visionary, Reach: 14 countries.
        2. VERIFIED MILESTONES: Ocean Guardian (Jul 2024), Reforest Vanguard (May 2024), Literacy Advocate (Dec 2023), System Pilot (Oct 2023).
        3. PERFORMANCE ANALYTICS: Efficiency Rating: 94.2%, Total Contribution Impact Units: 2,108.4.
        4. OPERATIVE SUMMARY: A 2-sentence sophisticated summary of their contribution to global social stock markets.
        The tone should be futuristic, precise, and professional. Do not use markdown bolding like **, use plain text suitable for a PDF.`,
      });

      const reportText = response.text;
      
      if (reportText) {
        setExportProgress('compiling verified pdf...');
        await new Promise(r => setTimeout(r, 800));
        
        // Initialize PDF
        const doc = new jsPDF();
        
        // Brand Header
        doc.setFillColor(30, 42, 94); // #1e2a5e
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.text("impact ex", 15, 25);
        
        doc.setFontSize(10);
        doc.text("OFFICIAL IMPACT STATEMENT // " + new Date().toLocaleDateString(), 15, 33);
        
        // Content
        doc.setTextColor(30, 42, 94);
        doc.setFontSize(18);
        doc.text(`Statement for ${userName}`, 15, 55);
        
        doc.setFontSize(11);
        const splitText = doc.splitTextToSize(reportText, 180);
        doc.text(splitText, 15, 70);
        
        // Footer
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text("This document is cryptographically verified by the ImpactEx Protocol.", 15, 280);
        
        // Save
        doc.save(`ImpactEx_Statement_${userName.replace(/\s+/g, '_')}.pdf`);
      }
    } catch (error) {
      console.error("Export failed:", error);
      alert("System sync error during export. Please re-authenticate.");
    } finally {
      setIsExporting(false);
      setExportProgress('');
    }
  };

  return (
    <div className="min-h-screen pt-40 pb-32 px-12 hero-gradient">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header section */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 border-b border-[#1e2a5e]/10 pb-12">
          <div className="space-y-6">
            <button 
              onClick={onBack}
              className="text-[10px] font-black uppercase tracking-[0.5em] text-[#1e2a5e]/40 hover:text-[#1e2a5e] transition-colors"
            >
              ← return to hub
            </button>
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#e05c9d]">authorized operative</span>
              <h1 className="text-8xl font-serif italic text-[#1e2a5e] text-lowercase leading-none">{userName}.</h1>
            </div>
          </div>
          <div className="bg-white/40 backdrop-blur-xl p-6 rounded-full border border-white/60 shadow-lg">
            <img src="https://picsum.photos/seed/team-pentagon/200/200" className="w-28 h-28 rounded-full grayscale brightness-125" alt="profile" />
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left/Main Column (8 spans) */}
          <div className="lg:col-span-8 space-y-10">
            {/* Impact Resume Section */}
            <section className="space-y-6">
              <h2 className="text-2xl font-serif italic text-[#1e2a5e] text-lowercase">impact resume.</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'ocean guardian', date: 'verified jul 2024', color: '#1e2a5e' },
                  { label: 'reforest vanguard', date: 'verified may 2024', color: '#bdc69a' },
                  { label: 'literacy advocate', date: 'verified dec 2023', color: '#f4d89f' },
                  { label: 'system pilot', date: 'verified oct 2023', color: '#e05c9d' },
                ].map((badge) => (
                  <div key={badge.label} className="p-10 bg-white/20 border border-white/40 rounded-[32px] space-y-5 group hover:bg-white/40 transition-all shadow-sm">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-inner" style={{ backgroundColor: badge.color }}>
                       <div className="w-5 h-5 rounded-full border border-white/30"></div>
                    </div>
                    <div>
                      <p className="font-bold text-xl text-[#1e2a5e] text-lowercase">{badge.label}</p>
                      <p className="text-[10px] font-black text-[#1e2a5e]/40 uppercase tracking-widest">{badge.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Identity Verification Section */}
            <section className="p-12 bg-[#1e2a5e] text-white rounded-[40px] shadow-2xl space-y-10">
              <h2 className="text-2xl font-serif italic text-lowercase border-b border-white/10 pb-6">identity verification.</h2>
              <div className="space-y-6">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.3em]">
                  <span className="text-white/40">biometric sync</span>
                  <span className="text-[#bdc69a] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#bdc69a] animate-pulse"></span>
                    active
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.3em]">
                  <span className="text-white/40">kyc compliance</span>
                  <span className="text-white">level 3 (max)</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.3em]">
                  <span className="text-white/40">capital source</span>
                  <span className="text-[#bdc69a]">verified</span>
                </div>
              </div>
            </section>
          </div>

          {/* Right Sidebar (4 spans) */}
          <div className="lg:col-span-4 space-y-10">
            {/* Account DNA Card */}
            <div className="p-12 bg-white/40 backdrop-blur-3xl border border-white/60 rounded-[40px] shadow-xl space-y-12">
               <h3 className="text-2xl font-serif italic text-[#1e2a5e] text-lowercase border-b border-[#1e2a5e]/10 pb-6">account dna.</h3>
               <div className="space-y-10">
                 <div>
                   <p className="text-[10px] font-black text-[#1e2a5e]/40 uppercase tracking-[0.3em] mb-2">primary sector</p>
                   <p className="text-3xl font-bold text-[#1e2a5e] text-lowercase tracking-tighter">environment</p>
                 </div>
                 <div>
                   <p className="text-[10px] font-black text-[#1e2a5e]/40 uppercase tracking-[0.3em] mb-2">contribution tier</p>
                   <p className="text-3xl font-bold text-[#e05c9d] text-lowercase tracking-tighter">visionary</p>
                 </div>
                 <div>
                   <p className="text-[10px] font-black text-[#1e2a5e]/40 uppercase tracking-[0.3em] mb-2">impact reach</p>
                   <p className="text-3xl font-bold text-[#1e2a5e] text-lowercase tracking-tighter">14 countries</p>
                 </div>
               </div>
            </div>

            <div className="p-8 border border-[#1e2a5e]/10 rounded-[40px] bg-black/5 flex items-center gap-4">
               <div className="w-3 h-3 rounded-full bg-[#bdc69a]"></div>
               <p className="text-[10px] font-black text-[#1e2a5e]/60 uppercase tracking-widest">encrypted link established</p>
            </div>
          </div>
        </div>

        {/* Data Export Button - Refined Size & Text Spacing */}
        <div className="pt-12 border-t border-[#1e2a5e]/5 flex justify-center">
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className={`group relative w-fit min-w-[400px] px-16 overflow-hidden py-6 rounded-full font-black text-[11px] uppercase tracking-[0.25em] transition-all duration-500 shadow-2xl ${
              isExporting 
                ? 'bg-[#1e2a5e]/20 text-[#1e2a5e] cursor-wait' 
                : 'bg-[#1e2a5e] text-white hover:bg-[#e05c9d] hover:-translate-y-1 active:scale-95'
            }`}
          >
            <span className="relative z-10 flex items-center justify-center gap-4">
              {isExporting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-[#1e2a5e]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {exportProgress}
                </>
              ) : 'request impact data (.pdf)'}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
