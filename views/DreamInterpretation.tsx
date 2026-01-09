
import React, { useState } from 'react';
import { Moon, Sparkles, Loader2, Send, Info, Star, CloudMoon, Home } from 'lucide-react';
import { getDreamInterpretation } from '../services/gemini.ts';
import ShareResult from '../components/ShareResult.tsx';
import { AppView } from '../types.ts';

const DreamInterpretationView: React.FC<{ onNavigate: (view: AppView) => void }> = ({ onNavigate }) => {
  const [dreamText, setDreamText] = useState('');
  const [interpretation, setInterpretation] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInterpret = async () => {
    if (!dreamText.trim()) return;
    setLoading(true);
    setInterpretation('');
    
    const result = await getDreamInterpretation(dreamText);
    setInterpretation(result);
    setLoading(false);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20 px-4 md:px-10 pt-8 bg-stone-950 min-h-screen text-stone-100">
      <header className="space-y-4">
        <button 
          onClick={() => onNavigate(AppView.HOME)}
          className="flex items-center gap-2 text-stone-500 hover:text-amber-500 transition-colors mb-6 group"
        >
          <div className="p-2 rounded-full group-hover:bg-amber-900/20 transition-colors">
            <Home size={18} />
          </div>
          <span className="font-bold uppercase tracking-widest text-[10px]">Beranda</span>
        </button>
        <div className="flex items-center gap-4">
          <div className="p-4 bg-stone-900 border border-stone-800 rounded-2xl text-amber-500 shadow-2xl shadow-black">
            <Moon size={32} />
          </div>
          <div>
            <h2 className="text-4xl md:text-5xl font-heritage font-bold text-white text-glow-amber tracking-tight uppercase">Tafsir Mimpi</h2>
            <p className="text-stone-500 uppercase text-[10px] tracking-[0.3em] font-black mt-1">Membuka Tabir Alam Bawah Sadar</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
        <div className="space-y-6">
          <div className="p-6 md:p-8 bg-stone-900/40 rounded-[32px] md:rounded-[40px] border border-stone-800 space-y-6 relative overflow-hidden group shadow-inner backdrop-blur-md">
            <label className="block text-[10px] font-black text-amber-700 uppercase tracking-widest flex items-center gap-2">
              <Star size={12} className="animate-pulse" /> Deskripsi Mimpi
            </label>
            
            <textarea 
              value={dreamText}
              onChange={(e) => setDreamText(e.target.value)}
              placeholder="Ceritakan mimpi Anda... (misal: melihat macan putih)"
              className="w-full h-48 md:h-64 bg-stone-950 border border-stone-800 rounded-3xl p-6 text-white focus:outline-none focus:border-amber-600 transition-all resize-none italic placeholder:text-stone-800 leading-relaxed text-sm md:text-base shadow-inner"
            />
            
            <button 
              onClick={handleInterpret}
              disabled={loading || !dreamText.trim()}
              className="w-full py-5 bg-stone-100 hover:bg-white text-stone-950 font-black rounded-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-2xl uppercase tracking-widest text-[10px]"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Send size={18} className="text-amber-600" />}
              SINGKAP MAKNA
            </button>
          </div>

          <div className="p-6 bg-stone-900/50 border border-stone-800 rounded-3xl flex gap-4 shadow-sm">
            <Info className="text-amber-800 shrink-0" size={20} />
            <div className="text-[11px] text-stone-500 leading-relaxed italic">
              "Mimpi dudu mung kembang turu, nanging pralampita kang nyata." 
              <span className="block mt-1 text-stone-600">(Mimpi bukan sekadar bunga tidur, melainkan pertanda nyata.)</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 md:p-12 glass-panel rounded-[32px] md:rounded-[40px] border border-stone-800 bg-stone-900/20 h-full min-h-[400px] md:min-h-[500px] relative overflow-hidden flex flex-col shadow-2xl">
            <div className="flex items-center gap-3 text-amber-500 mb-8 border-b border-stone-800 pb-6">
              <Sparkles size={24} className="animate-pulse" />
              <h3 className="font-heritage text-xl md:text-2xl font-bold uppercase tracking-wider">Tafsir Waskita</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {!interpretation && !loading && (
                <div className="h-full flex flex-col items-center justify-center text-stone-800 space-y-6 opacity-30 italic py-20">
                  <CloudMoon size={80} />
                  <p className="text-center font-heritage text-xl">Menanti bayangan dari alam mimpi...</p>
                </div>
              )}

              {loading && (
                <div className="h-full flex flex-col items-center justify-center space-y-6 py-20">
                  <Loader2 className="animate-spin text-amber-600" size={40} />
                  <p className="text-amber-600 font-heritage italic text-xl animate-pulse text-center">Menghubungkan sanubari...</p>
                </div>
              )}

              {interpretation && (
                <div className="space-y-10 animate-in fade-in duration-1000">
                  <div className="text-stone-100 leading-relaxed whitespace-pre-wrap italic text-justify text-lg md:text-3xl font-medium">
                    {interpretation}
                  </div>
                  <ShareResult 
                    title="Tafsir Mimpi Nusantara" 
                    text={interpretation} 
                    context={`Mimpi: ${dreamText.slice(0, 50)}...`}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DreamInterpretationView;
