
import React, { useState, useMemo } from 'react';
import { Search, BookOpen, Clock, Star, ScrollText, Sparkles, Loader2, ArrowLeft, History, ChevronRight, Home } from 'lucide-react';
import { getCulturalSynthesis } from '../services/gemini.ts';
import ShareResult from '../components/ShareResult.tsx';
import { AppView } from '../types.ts';

interface Manuscript {
  id: string;
  title: string;
  origin: string;
  category: string;
  summary: string;
  image: string;
  fullContent?: string;
}

const LibraryView: React.FC<{ onNavigate: (view: AppView) => void }> = ({ onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [readingManuscript, setReadingManuscript] = useState<Manuscript | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [loading, setLoading] = useState(false);

  const manuscripts: Manuscript[] = [
    { 
      id: 'lontar-bali', 
      title: 'Koleksi Lontar Kuno Nusantara', 
      origin: 'Khas Nusantara', 
      category: 'Manuskrip', 
      summary: 'Koleksi naskah daun lontar yang mencatat hukum, adat, dan rahasia batin para leluhur.',
      image: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&q=80&w=800",
      fullContent: "Naskah lontar ini merupakan saksi bisu perjalanan intelektual Nusantara. Setiap goresan adalah rekaman laku batin dan hukum alam."
    },
    { 
      id: 'serat-centhini', 
      title: 'Serat Centhini: Ensiklopedia Jawa', 
      origin: 'Surakarta, Jawa Tengah', 
      category: 'Kejawen', 
      summary: 'Koleksi pengetahuan tentang agama, sains, dan mistisisme Jawa dalam format puitis.',
      image: "https://images.unsplash.com/photo-1598124146163-36819847286d?auto=format&fit=crop&q=80&w=800",
      fullContent: "Karya sastra agung yang memuat perjalanan batin dan lahiriah manusia Jawa dalam menari bersama takdir. Mencakup ilmu kesempurnaan, seni rupa, hingga tata cara hidup yang selaras dengan semesta."
    }
  ];

  const handleOpenManuscript = async (doc: Manuscript) => {
    setReadingManuscript(doc);
    setLoading(true);
    setAiAnalysis('');
    const analysis = await getCulturalSynthesis(`Bedah filosofis naskah: "${doc.title}". Gunakan gaya puitis waskita tanpa simbol bintang.`);
    setAiAnalysis(analysis);
    setLoading(false);
  };

  if (readingManuscript) {
    return (
      <div className="space-y-6 bg-stone-950 min-h-screen animate-in fade-in duration-500 pb-20 px-4 pt-8 text-stone-100">
        <div className="flex items-center justify-between py-6">
          <button 
            onClick={() => setReadingManuscript(null)}
            className="flex items-center gap-2 text-stone-500 hover:text-amber-500 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-bold uppercase tracking-widest text-[10px]">Kembali</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="aspect-[3/4] rounded-[40px] overflow-hidden border border-stone-800 shadow-2xl">
              <img src={readingManuscript.image} className="w-full h-full object-cover grayscale opacity-50" alt={readingManuscript.title} />
            </div>
            <div className="mt-6 p-6 bg-stone-900/50 rounded-3xl border border-stone-800 backdrop-blur-md">
              <h5 className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-2">Asal Sanad</h5>
              <p className="text-stone-100 font-bold text-sm">{readingManuscript.origin}</p>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-10">
            <section className="p-6 md:p-16 bg-stone-900/30 border border-stone-800 rounded-[40px] shadow-inner">
              <h4 className="text-3xl font-heritage font-bold text-white border-b border-stone-800 pb-6 mb-8 text-glow-amber">Sinopsis Tekstual</h4>
              <p className="text-stone-300 text-lg md:text-2xl leading-relaxed italic text-justify font-medium">
                {readingManuscript.fullContent}
              </p>
            </section>

            <section className="p-6 md:p-16 bg-stone-900/50 border border-stone-800 rounded-[40px] shadow-2xl">
              <div className="flex items-center gap-3 text-amber-500 mb-8 border-b border-stone-800 pb-6">
                <Sparkles size={28} className="animate-pulse" />
                <h4 className="font-heritage text-3xl font-bold uppercase tracking-wider">Bedah Waskita</h4>
              </div>
              {loading ? (
                <div className="py-20 flex flex-col items-center justify-center space-y-6">
                  <Loader2 className="animate-spin text-amber-600" size={48} />
                  <p className="text-amber-600 font-heritage italic text-lg animate-pulse">Menerjemahkan sanad batin...</p>
                </div>
              ) : (
                <div className="space-y-8 animate-in fade-in duration-1000">
                  <div className="text-stone-100 text-lg md:text-3xl leading-relaxed italic text-justify whitespace-pre-wrap bg-stone-950/50 p-8 md:p-16 rounded-[40px] border border-stone-800 shadow-inner font-medium">
                    {aiAnalysis}
                  </div>
                  {aiAnalysis && <ShareResult title={`Bedah Naskah: ${readingManuscript.title}`} text={aiAnalysis} />}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 bg-stone-950 pt-8 pb-20 px-4 md:px-10 text-stone-100 min-h-screen">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-6">
          <button 
            onClick={() => onNavigate(AppView.HOME)}
            className="flex items-center gap-2 text-stone-500 hover:text-amber-500 transition-colors group"
          >
            <div className="p-2 rounded-full group-hover:bg-amber-900/20 transition-colors">
              <Home size={18} />
            </div>
            <span className="font-bold uppercase tracking-widest text-[10px]">Beranda</span>
          </button>
          <div className="flex items-center gap-4">
             <div className="p-4 bg-stone-900 border border-stone-800 rounded-2xl text-amber-500 shadow-xl"><BookOpen size={28} /></div>
             <div>
               <h2 className="text-4xl md:text-5xl font-heritage font-bold text-white tracking-tight text-glow-amber">Pustaka Naskah</h2>
               <p className="text-[10px] uppercase tracking-[0.4em] font-black text-stone-500 mt-1">Preservasi Digital Khazanah Nusantara</p>
             </div>
          </div>
        </div>
        <div className="relative w-full md:w-[450px]">
          <input 
            type="text" 
            placeholder="Cari naskah..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-stone-900/50 border border-stone-800 rounded-2xl py-4 px-6 pl-12 text-stone-100 focus:border-amber-600 text-sm outline-none shadow-inner placeholder:text-stone-700"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-600" size={20} />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {manuscripts.map((doc) => (
          <div 
            key={doc.id} 
            className="group bg-stone-900/40 rounded-[40px] border border-stone-800 overflow-hidden hover:border-amber-600 transition-all cursor-pointer shadow-xl flex flex-col h-full backdrop-blur-sm"
            onClick={() => handleOpenManuscript(doc)}
          >
            <div className="h-64 relative overflow-hidden">
              <img src={doc.image} className="w-full h-full object-cover grayscale opacity-30 transition-transform duration-1000 group-hover:scale-110 group-hover:opacity-60 brightness-50" alt={doc.title} />
              <div className="absolute top-4 left-4 px-3 py-1 bg-amber-600 text-stone-950 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg">
                {doc.category}
              </div>
            </div>
            <div className="p-8 flex-1 flex flex-col space-y-4">
              <h3 className="text-2xl font-heritage font-bold text-white group-hover:text-amber-500 transition-colors leading-tight">{doc.title}</h3>
              <p className="text-stone-500 text-xs italic leading-relaxed line-clamp-3">"{doc.summary}"</p>
              <div className="mt-auto pt-4 border-t border-stone-800 flex items-center justify-between">
                 <span className="text-[10px] font-black text-amber-900 uppercase tracking-widest italic">{doc.origin}</span>
                 <ChevronRight size={18} className="text-stone-700 group-hover:text-amber-600 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LibraryView;
