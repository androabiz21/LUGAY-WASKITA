
import React, { useState } from 'react';
import { Flame, Sparkles, Loader2, Scroll, Heart, Zap, Shield, Star, Home } from 'lucide-react';
import { generateAmalan } from '../services/gemini.ts';
import ShareResult from '../components/ShareResult.tsx';
import { AppView } from '../types.ts';

const AMALAN_CATEGORIES = [
  { id: 'doa', label: 'Doa Umum', icon: <Heart size={16} /> },
  { id: 'amalan-ilmu', label: 'Amalan Ilmu', icon: <Scroll size={16} /> },
  { id: 'doa-niat', label: 'Doa Niat', icon: <Zap size={16} /> },
  { id: 'dzikir', label: 'Dzikir Waskita', icon: <Flame size={16} /> },
  { id: 'ilmu-kejawen', label: 'Ilmu Kejawen', icon: <Shield size={16} /> },
];

const AmalanView: React.FC<{ onNavigate: (view: AppView) => void }> = ({ onNavigate }) => {
  const [hajat, setHajat] = useState('');
  const [category, setCategory] = useState('doa');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!hajat.trim()) return;
    setLoading(true); setResult('');
    try {
      const catLabel = AMALAN_CATEGORIES.find(c => c.id === category)?.label || category;
      const response = await generateAmalan(catLabel, hajat);
      setResult(response);
    } catch (err) { alert("Gagal meresonansi amalan."); } finally { setLoading(false); }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 px-0 md:px-6 pt-8 bg-stone-950 min-h-screen text-stone-100">
      <header className="px-4">
        <button onClick={() => onNavigate(AppView.HOME)} className="flex items-center gap-2 text-stone-500 hover:text-amber-500 transition-colors mb-6 group"><div className="p-2 rounded-full group-hover:bg-amber-900/20 transition-colors"><Home size={18} /></div><span className="font-bold uppercase tracking-widest text-[10px]">Beranda</span></button>
        <div className="flex items-center gap-4">
          <div className="p-4 bg-stone-900 border border-stone-800 rounded-2xl text-amber-500 shadow-2xl"><Flame size={28} /></div>
          <div>
            <h2 className="text-3xl md:text-5xl font-heritage font-bold text-white text-glow-amber uppercase leading-none">Amalan Waskita</h2>
            <p className="text-stone-500 uppercase text-[10px] tracking-[0.4em] font-black mt-1">Sintesis Spiritual Nusantara</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 px-0">
        <div className="xl:col-span-4 space-y-6 px-4">
          <div className="p-8 md:p-12 bg-stone-900/40 rounded-[40px] border border-stone-800 space-y-8 shadow-inner backdrop-blur-md">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-stone-500 uppercase tracking-widest">Kategori Amalan</label>
              <div className="grid grid-cols-2 gap-2">
                {AMALAN_CATEGORIES.map(cat => (
                  <button key={cat.id} onClick={() => setCategory(cat.id)} className={`flex items-center gap-3 px-4 py-4 rounded-xl text-[9px] font-black uppercase transition-all border ${category === cat.id ? 'bg-amber-600 text-stone-950 border-amber-600 shadow-xl' : 'bg-stone-950 border-stone-800 text-stone-600 hover:text-stone-300'}`}>
                    {cat.icon} {cat.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black text-stone-500 uppercase tracking-widest">Niat Suci Anda</label>
              <textarea value={hajat} onChange={(e) => setHajat(e.target.value)} placeholder="Hajat batin Anda..." className="w-full h-48 bg-stone-950 border border-stone-800 rounded-2xl p-6 text-white outline-none focus:border-amber-600 italic placeholder:text-stone-800 shadow-inner" />
            </div>
            <button onClick={handleGenerate} disabled={loading || !hajat.trim()} className="w-full py-6 bg-stone-100 hover:bg-white text-stone-950 font-black rounded-2xl shadow-2xl uppercase tracking-widest text-[11px]">
              {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={16} className="text-amber-600" />} TERBITKAN AMALAN
            </button>
          </div>
        </div>

        <div className="xl:col-span-8 space-y-6 px-0">
          <div className="p-0 md:p-16 glass-panel md:rounded-[60px] border-y md:border border-stone-800 bg-stone-900/20 min-h-[500px] flex flex-col shadow-2xl relative">
            <div className="flex items-center gap-4 text-amber-500 mb-10 border-b border-stone-800 pb-8 px-6 pt-8 md:pt-0 md:px-0 relative z-10">
              <Sparkles size={28} className="animate-pulse" />
              <h3 className="font-heritage text-2xl md:text-3xl font-bold uppercase tracking-wider">Serat Amalan</h3>
            </div>
            <div className="flex-1 w-full px-0 overflow-visible relative z-10">
              {!result && !loading && (
                <div className="h-full flex flex-col items-center justify-center text-stone-800 space-y-6 opacity-30 py-20 px-6">
                  <Scroll size={80} />
                  <p className="font-heritage text-2xl italic text-center">Menanti niat yang terpatri...</p>
                </div>
              )}
              {loading && (
                <div className="h-full flex flex-col items-center justify-center space-y-8 py-20 px-6">
                  <Loader2 className="animate-spin text-amber-600" size={48} />
                  <p className="text-amber-600 font-heritage italic text-2xl animate-pulse">Menghimpun energi semesta...</p>
                </div>
              )}
              {result && (
                <div className="space-y-12 animate-in fade-in duration-1000 w-full">
                  <div className="text-stone-100 leading-relaxed italic text-justify text-lg md:text-4xl whitespace-pre-wrap font-medium p-5 md:p-20 bg-stone-950/50 md:rounded-[40px] border-y md:border border-stone-800 shadow-inner w-full">
                    {result}
                  </div>
                  <div className="px-6 md:px-0 pb-10"><ShareResult title="Serat Amalan Nusantara" text={result} /></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AmalanView;
