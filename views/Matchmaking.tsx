
import { AppView } from '../types.ts';
import React, { useState } from 'react';
import { Heart, Sparkles, Loader2, Info, User, Users, Calendar, Crown, Star, Split, Mountain, Gem, Zap, Eye, HeartHandshake, Home } from 'lucide-react';
import { calculateWeton, calculateMatch } from '../services/calculator.ts';
import { getCulturalSynthesis } from '../services/gemini.ts';
import ShareResult from '../components/ShareResult.tsx';

const MatchmakingView: React.FC<{ onNavigate: (view: AppView) => void }> = ({ onNavigate }) => {
  const [date1, setDate1] = useState(''); 
  const [date2, setDate2] = useState(''); 
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState('');

  const parseManualDate = (dateStr: string) => {
    if (!dateStr) return null;
    const parts = dateStr.split(/[-/.]/);
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
      const date = new Date(year, month, day);
      return isNaN(date.getTime()) ? null : date;
    }
    return null;
  };

  const getMatchTheme = (label: string) => {
    switch (label) {
      case 'PESTHI': return { icon: <HeartHandshake size={50} />, color: 'text-emerald-400', bg: 'bg-emerald-950/20', border: 'border-emerald-800', label: 'Pesthi (Harmoni Abadi)' };
      case 'JODOH': return { icon: <Heart size={50} fill="currentColor" />, color: 'text-rose-400', bg: 'bg-rose-950/20', border: 'border-rose-800', label: 'Jodoh (Serasi)' };
      case 'RATU': return { icon: <Crown size={50} />, color: 'text-amber-400', bg: 'bg-amber-950/20', border: 'border-amber-800', label: 'Ratu (Mulia & Disegani)' };
      case 'TINARI': return { icon: <Gem size={50} />, color: 'text-amber-300', bg: 'bg-amber-900/10', border: 'border-amber-700', label: 'Tinari (Murah Rezeki)' };
      case 'TOPO': return { icon: <Mountain size={50} />, color: 'text-blue-400', bg: 'bg-blue-950/20', border: 'border-blue-800', label: 'Topo (Prihatin Dahulu)' };
      case 'PADU': return { icon: <Zap size={50} />, color: 'text-orange-400', bg: 'bg-orange-950/20', border: 'border-orange-800', label: 'Padu (Sering Cekcok)' };
      case 'PEGAT': return { icon: <Split size={50} />, color: 'text-red-400', bg: 'bg-red-950/20', border: 'border-red-800', label: 'Pegat (Risiko Pisah)' };
      case 'SUJANAN': return { icon: <Eye size={50} />, color: 'text-indigo-400', bg: 'bg-indigo-950/20', border: 'border-indigo-800', label: 'Sujanan (Pihak Ke-3)' };
      default: return { icon: <Star size={50} />, color: 'text-amber-400', bg: 'bg-stone-900/20', border: 'border-stone-800', label: 'Titis (Rahasia Semesta)' };
    }
  };

  const handleAnalyze = async () => {
    const parsed1 = parseManualDate(date1);
    const parsed2 = parseManualDate(date2);
    if (!parsed1 || !parsed2) { alert("Format tanggal HH-BB-TTTT."); return; }
    setLoading(true); setAiInsight(''); setResult(null);
    try {
      const weton1 = calculateWeton(parsed1);
      const weton2 = calculateWeton(parsed2);
      const match = calculateMatch(weton1.totalNeptu, weton2.totalNeptu);
      setResult({ person1: weton1, person2: weton2, match });
      const prompt = `Analisis kecocokan pasangan (Petung Jodoh) antara Weton ${weton1.javaneseDate} dan Weton ${weton2.javaneseDate}. Hasil Tradisional: ${match.label}. Berikan risalah waskita puitis mendalam, edge-to-edge, tanpa simbol bintang.`;
      const insight = await getCulturalSynthesis(prompt);
      setAiInsight(insight);
    } catch (err) { alert("Gagal memproses."); } finally { setLoading(false); }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20 bg-stone-950 min-h-screen pt-8 text-stone-100">
      <header className="px-4 md:px-10">
        <button 
          onClick={() => onNavigate(AppView.HOME)}
          className="flex items-center gap-2 text-stone-500 hover:text-rose-500 transition-colors mb-6 group"
        >
          <div className="p-2 rounded-full group-hover:bg-rose-900/20 transition-colors">
            <Home size={18} />
          </div>
          <span className="font-bold uppercase tracking-widest text-[10px]">Beranda</span>
        </button>
        <div className="flex items-center gap-4">
          <div className="p-4 bg-stone-900 border border-stone-800 rounded-2xl text-rose-500 shadow-2xl">
            <Heart size={32} />
          </div>
          <div>
            <h2 className="text-4xl md:text-5xl font-heritage font-bold text-white text-glow-amber tracking-tight uppercase">Petung Jodoh</h2>
            <p className="text-stone-500 uppercase text-[10px] tracking-[0.4em] font-black mt-1">Sinkronisasi Kosmologis Dua Jiwa</p>
          </div>
        </div>
      </header>

      <div className="px-4 md:px-10 space-y-10">
        <div className="p-8 md:p-12 bg-stone-900/40 rounded-[40px] border border-stone-800 space-y-8 shadow-inner backdrop-blur-md">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-2">
               <label className="text-[9px] font-black uppercase tracking-widest text-stone-500">Pihak I (HH-BB-TTTT)</label>
               <input type="text" value={date1} onChange={(e) => setDate1(e.target.value)} placeholder="Contoh: 17-08-1945" className="w-full bg-stone-950 border border-stone-800 rounded-xl p-4 text-white focus:border-rose-600 outline-none shadow-inner placeholder:text-stone-800" />
             </div>
             <div className="space-y-2">
               <label className="text-[9px] font-black uppercase tracking-widest text-stone-500">Pihak II (HH-BB-TTTT)</label>
               <input type="text" value={date2} onChange={(e) => setDate2(e.target.value)} placeholder="Contoh: 20-05-1948" className="w-full bg-stone-950 border border-stone-800 rounded-xl p-4 text-white focus:border-rose-600 outline-none shadow-inner placeholder:text-stone-800" />
             </div>
           </div>
           <button onClick={handleAnalyze} disabled={loading || !date1 || !date2} className="w-full py-6 bg-stone-100 hover:bg-white text-stone-950 font-black rounded-2xl transition-all flex items-center justify-center gap-3 shadow-2xl uppercase tracking-widest text-[11px]">
             {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} className="text-rose-600" />} SINGKAP TABIR JODOH
           </button>
        </div>

        {!result && !loading && (
           <div className="h-64 bg-stone-900/20 rounded-[40px] border-2 border-dashed border-stone-800 flex flex-col items-center justify-center text-stone-800 p-8 text-center opacity-40">
              <Heart size={64} className="mb-4" />
              <p className="font-heritage italic text-2xl">Masukkan data kedua pasangan untuk melihat jalinan nasib.</p>
           </div>
        )}

        {loading && (
           <div className="h-96 flex flex-col items-center justify-center space-y-8">
              <div className="relative">
                <div className="w-24 h-24 border-2 border-rose-900 rounded-full animate-ping"></div>
                <Heart className="absolute inset-0 m-auto text-rose-600 animate-pulse" size={40} />
              </div>
              <p className="text-rose-500 font-heritage italic text-2xl animate-pulse text-center">Menghitung denyut nadi semesta...</p>
           </div>
        )}

        {result && !loading && (
          <div className="space-y-12 animate-in fade-in duration-1000 pb-20">
             <div className="grid grid-cols-2 gap-4">
                <div className="p-8 bg-stone-900 border border-stone-800 rounded-[32px] text-center shadow-2xl">
                  <p className="text-[8px] text-stone-500 uppercase font-black mb-1">Pihak I</p>
                  <h4 className="text-white font-heritage text-2xl md:text-3xl font-bold">{result.person1.javaneseDate}</h4>
                </div>
                <div className="p-8 bg-stone-900 border border-stone-800 rounded-[32px] text-center shadow-2xl">
                  <p className="text-[8px] text-stone-500 uppercase font-black mb-1">Pihak II</p>
                  <h4 className="text-white font-heritage text-2xl md:text-3xl font-bold">{result.person2.javaneseDate}</h4>
                </div>
             </div>

             {(() => {
               const theme = getMatchTheme(result.match.label);
               return (
                 <div className={`p-10 md:p-20 border md:rounded-[60px] ${theme.border} ${theme.bg} text-center relative overflow-hidden shadow-2xl shadow-black/50`}>
                    <div className="mx-auto w-24 h-24 flex items-center justify-center rounded-3xl bg-stone-950 border border-stone-800 mb-8 text-white shadow-xl">
                      {theme.icon}
                    </div>
                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.6em] mb-4">Risalah Takdir</p>
                    <h3 className={`text-5xl md:text-9xl font-heritage font-bold tracking-widest ${theme.color} text-glow-amber`}>{theme.label}</h3>
                    <div className="text-stone-100 italic text-xl md:text-4xl mt-12 px-4 leading-relaxed font-medium max-w-5xl mx-auto">"{result.match.desc}"</div>
                 </div>
               );
             })()}

             <div className="p-0 md:p-16 bg-stone-900/30 border-y md:border border-stone-800 md:rounded-[60px] shadow-inner">
                <div className="flex items-center gap-4 text-amber-500 mb-10 border-b border-stone-800 pb-8 pt-8 px-6 md:pt-0 md:px-0">
                  <Sparkles size={32} className="animate-pulse" />
                  <h4 className="font-heritage text-3xl md:text-5xl font-bold uppercase tracking-wider">Tuntunan Waskita</h4>
                </div>
                <div className="bg-stone-950/50 p-6 md:p-20 md:rounded-[40px] border-y md:border border-stone-800 shadow-inner">
                  <div className="text-stone-100 leading-relaxed italic text-justify text-lg md:text-4xl whitespace-pre-wrap font-medium">
                    {aiInsight || "Menenun nasihat bijak..."}
                  </div>
                  {aiInsight && (
                    <div className="not-italic pt-10 border-t border-stone-800 mt-12">
                      <ShareResult title="Risalah Petung Jodoh" text={aiInsight} />
                    </div>
                  )}
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchmakingView;
