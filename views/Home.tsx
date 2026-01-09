
import React, { useMemo } from 'react';
import { AppView } from '../types.ts';
import { ArrowUpRight, BookOpen, Calculator, Sparkles, Shield, Activity, ChevronRight, Compass, Star, Share2 } from 'lucide-react';
import { PATTERNS, DYNAMIC_QUOTES } from '../constants.tsx';

interface HomeProps {
  onNavigate: (view: AppView) => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  // Memilih kutipan acak setiap kali komponen dimuat
  const randomQuote = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * DYNAMIC_QUOTES.length);
    return DYNAMIC_QUOTES[randomIndex];
  }, []);

  const handleShare = async () => {
    const shareData = {
      title: 'GALURA LUGAY KANCANA Waskita Pasundan',
      text: 'Buka gerbang kearifan purba Pasundan melalui teknologi masa depan di GALURA LUGAY KANCANA.',
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        alert('Tersalin ke papan klip!');
      }
    } catch (err) {
      console.error('Gagal membagikan:', err);
    }
  };

  return (
    <div className="space-y-16 md:space-y-24 bg-stone-950 pb-20 text-stone-100">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex flex-col justify-center px-4 md:px-12 overflow-hidden py-20">
        <div className="absolute inset-0 z-0">
           <img 
             src="https://images.unsplash.com/photo-1590490359854-dfba19688d70?auto=format&fit=crop&q=80&w=1600" 
             className="w-full h-full object-cover opacity-[0.2] grayscale brightness-50" 
             alt="Background Pasundan"
           />
           <div className="absolute inset-0 bg-gradient-to-b from-stone-950 via-transparent to-stone-950" />
           <div className="absolute inset-0 misty-overlay" />
        </div>

        <div className="relative z-10 space-y-10 max-w-6xl">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-blue-900/20 border border-blue-600/30 rounded-full text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] mb-4 shadow-2xl backdrop-blur-md">
            <Sparkles size={12} /> GALURA LUGAY KANCANA v3.5
          </div>
          
          <div className="space-y-6">
            <h1 className="text-7xl md:text-[10rem] font-heritage font-bold leading-[0.85] tracking-tighter text-white">
              Cahaya <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-blue-700 italic text-glow-amber">
                Parahyangan
              </span>
            </h1>
            <p className="text-stone-400 text-xl md:text-4xl max-w-4xl leading-relaxed italic font-medium animate-in fade-in slide-in-from-bottom-4 duration-1000">
              "{randomQuote}"
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4 md:gap-6 pt-10">
             <button 
               onClick={() => onNavigate(AppView.CULTURE_TREASURY)}
               className="px-10 py-6 bg-blue-600 hover:bg-blue-500 text-stone-950 font-black rounded-2xl transition-all shadow-2xl shadow-blue-900/40 flex items-center gap-3 active:scale-95 text-xs uppercase tracking-widest w-full md:w-auto justify-center"
             >
               Mulai Perjalanan <ArrowUpRight size={18} />
             </button>
             <button 
               onClick={() => onNavigate(AppView.LIBRARY)}
               className="px-10 py-6 bg-stone-900 hover:bg-stone-800 text-white font-bold border border-stone-800 rounded-2xl transition-all flex items-center gap-3 text-xs uppercase tracking-widest shadow-xl w-full md:w-auto justify-center"
             >
               <BookOpen size={18} /> Pustaka Pajajaran
             </button>
             <button 
               onClick={handleShare}
               className="px-10 py-6 bg-stone-950/50 backdrop-blur-md hover:bg-stone-900 text-blue-500 font-black border border-blue-900/30 rounded-2xl transition-all flex items-center gap-3 text-xs uppercase tracking-widest shadow-sm w-full md:w-auto justify-center"
             >
               <Share2 size={18} /> Bagikan Risalah
             </button>
          </div>
        </div>
      </section>

      {/* Main Features */}
      <section className="px-1 md:px-12 space-y-16">
        <div className="flex items-center gap-4 px-4 md:px-0">
          <div className="p-4 bg-stone-900 border border-stone-800 rounded-2xl text-blue-500 shadow-2xl"><Compass size={28} /></div>
          <div>
            <h2 className="text-4xl font-heritage font-bold text-white tracking-tight">Simpul Kebijaksanaan</h2>
            <p className="text-[10px] font-black text-stone-600 uppercase tracking-[0.4em] mt-2">Akses Portal Jagad Kasundaan</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-10">
          {[
            { 
              view: AppView.CALCULATOR, 
              title: 'Paririmbon', 
              icon: <Calculator size={32} />, 
              desc: 'Menyingkap garis takdir melalui pancadaya and paririmbon Sunda.',
              img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800'
            },
            { 
              view: AppView.SILAT, 
              title: 'Olah Maenpo', 
              icon: <Shield size={32} />, 
              desc: 'Olah batin and kejernihan rasa dalam beladiri tradisi Pasundan.',
              img: 'https://images.unsplash.com/photo-1540331547168-8b6472b78339?auto=format&fit=crop&q=80&w=800'
            },
            { 
              view: AppView.HEALING, 
              title: 'Usada Waskita', 
              icon: <Activity size={32} />, 
              desc: 'Kearifan penyembuhan spiritual and energi alam Tatar Sunda.',
              img: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&q=80&w=800'
            }
          ].map((item) => (
            <button
              key={item.title}
              onClick={() => onNavigate(item.view)}
              className="group relative h-[500px] md:h-[600px] bg-stone-900 rounded-[50px] border border-stone-800 overflow-hidden transition-all duration-700 hover:shadow-[0_0_50px_-12px_rgba(59,130,246,0.3)] flex flex-col justify-end p-8 md:p-12 text-left"
            >
              <img src={item.img} className="absolute inset-0 w-full h-full object-cover grayscale opacity-20 group-hover:grayscale-0 group-hover:opacity-40 transition-all duration-1000 group-hover:scale-110 brightness-50" alt={item.title} />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-transparent" />
              
              <div className="relative z-10 space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                  {item.icon}
                </div>
                <h3 className="font-heritage text-4xl md:text-5xl font-bold text-white group-hover:text-blue-500 transition-colors">{item.title}</h3>
                <p className="text-stone-400 text-lg italic font-medium leading-relaxed">"{item.desc}"</p>
                <div className="pt-6 flex items-center gap-3 text-[10px] font-black text-blue-600 uppercase tracking-[0.4em]">
                   BUKA PORTAL <ChevronRight size={14} className="group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Quote Banner */}
      <section className="bg-stone-900 border-y border-stone-800 py-24 px-4 md:px-12 flex flex-col md:flex-row items-center gap-16">
        <div className="flex-1 space-y-8">
           <div className="text-blue-500 text-xs font-black uppercase tracking-[0.6em]">Intisari Kasundaan</div>
           <h2 className="text-6xl md:text-8xl font-heritage font-bold text-white italic leading-[0.9]">
             "Silih asah, asih, asuh"
           </h2>
           <p className="text-stone-500 text-2xl md:text-3xl italic leading-relaxed max-w-2xl">
             Kebijaksanaan purba Pasundan yang mengajarkan pentingnya saling mencerdaskan, menyayangi, dan menjaga harmoni antar sesama.
           </p>
        </div>
        <div className="w-full md:w-[550px] aspect-square rounded-[80px] overflow-hidden border border-stone-800 shadow-2xl rotate-2">
           <img 
             src="https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?auto=format&fit=crop&q=80&w=1000" 
             className="w-full h-full object-cover grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-1000 brightness-75" 
             alt="Tradisi Pasundan"
           />
        </div>
      </section>
    </div>
  );
};

export default Home;
