
import React, { useState, useMemo, useEffect } from 'react';
import { Palette, Search, Star, Sparkles, Loader2, ArrowLeft, MapPin, Globe, ArrowUpRight, ChevronRight, Award, Crown, Landmark, History, Ship, Mountain, Shield, BookOpen, Home } from 'lucide-react';
import { getCulturalSynthesis, searchCultureDiscovery } from '../services/gemini.ts';
import { AppView } from '../types.ts';

interface CulturalItem {
  id: string; title: string; origin: string; category: 'Pasundan' | 'Situs & Ritus' | 'Majapahit' | 'Sriwijaya' | 'UNESCO' | 'Megalitikum'; description: string; image: string; isUnesco?: boolean;
}

const CultureTreasuryView: React.FC<{ onNavigate: (view: AppView) => void }> = ({ onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<CulturalItem | null>(null);
  const [aiInsight, setAiInsight] = useState('');
  const [historicalData, setHistoricalData] = useState('');
  const [groundingSources, setGroundingSources] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const categories = [
    { id: 'all', label: 'Semua', icon: <Star size={14} /> },
    { id: 'Pasundan', label: 'Tatar Pasundan', icon: <Crown size={14} /> },
    { id: 'UNESCO', label: 'UNESCO', icon: <Award size={14} /> },
    { id: 'Majapahit', label: 'Majapahit', icon: <Landmark size={14} /> },
    { id: 'Sriwijaya', label: 'Sriwijaya', icon: <Ship size={14} /> },
    { id: 'Megalitikum', label: 'Megalitikum', icon: <Mountain size={14} /> },
  ];

  const initialItems: CulturalItem[] = [
    { id: 'debus-banten', title: 'Seni Debus Banten', origin: 'Kesultanan Banten', category: 'Pasundan', description: 'Kesenian bela diri sakral yang mempertunjukkan keteguhan batin and kekebalan raga terhadap senjata tajam.', image: 'https://images.unsplash.com/photo-1540331547168-8b6472b78339?auto=format&fit=crop&q=80&w=1200' },
    { id: 'gunung-padang', title: 'Gunung Padang', origin: 'Cianjur', category: 'Megalitikum', description: 'Situs megalitikum punden berundak tertua di dunia.', image: 'https://images.unsplash.com/photo-1596436889106-be35e843f974?auto=format&fit=crop&q=80&w=1200' },
    { id: 'borobudur-unesco', title: 'Candi Borobudur', origin: 'Magelang', category: 'UNESCO', isUnesco: true, description: 'Mandala Buddha terbesar di dunia.', image: 'https://images.unsplash.com/photo-1584810359583-96fc3448beaa?auto=format&fit=crop&q=80&w=1200' },
    { id: 'prabu-siliwangi-lineage', title: 'Pajajaran Heritage', origin: 'Tatar Pasundan', category: 'Pasundan', description: 'Risalah agung Sri Baduga Maharaja.', image: 'https://images.unsplash.com/photo-1571401835393-8c5f3b39c6ec?auto=format&fit=crop&q=80&w=1200' },
    { id: 'bajang-ratu-majapahit', title: 'Gapura Bajang Ratu', origin: 'Mojokerto', category: 'Majapahit', description: 'Gerbang sakral bertipe paduraksa peninggalan Majapahit.', image: 'https://images.unsplash.com/photo-1605806616949-1e87b487fc2f?auto=format&fit=crop&q=80&w=1200' },
  ];

  const filteredItems = useMemo(() => initialItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }), [searchTerm, selectedCategory]);

  const handleOpenItem = async (item: CulturalItem) => {
    setSelectedItem(item); setLoadingHistory(true); setAiInsight(''); setHistoricalData(''); setGroundingSources([]);
    getCulturalSynthesis(`Risalah filosofis mendalam tentang "${item.title}". Jelaskan laku batin, sejarah, and maknanya dalam kacamata Waskita Nusantara. Gunakan gaya puitis Sunda Buhun polos tanpa bintang.`).then(setAiInsight);
    searchCultureDiscovery(`Sejarah resmi ${item.title}.`).then(data => { setHistoricalData(data.text); setGroundingSources(data.sources); setLoadingHistory(false); });
  };

  return (
    <div className="space-y-12 bg-stone-950 pt-8 pb-20 px-4 md:px-10 min-h-screen text-stone-100">
      {!selectedItem ? (
        <>
          <header className="space-y-8">
            <button onClick={() => onNavigate(AppView.HOME)} className="flex items-center gap-2 text-stone-500 hover:text-amber-500 transition-colors mb-6 group"><div className="p-2 rounded-full group-hover:bg-amber-900/20 transition-colors"><Home size={18} /></div><span className="font-bold uppercase tracking-widest text-[10px]">Beranda</span></button>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="flex items-center gap-4"><div className="p-4 bg-stone-900 border border-stone-800 rounded-2xl text-amber-500 shadow-2xl"><Palette size={28} /></div><div><h2 className="text-4xl md:text-5xl font-heritage font-bold text-white text-glow-amber tracking-tight uppercase">Seni & Budaya</h2><p className="text-stone-500 uppercase text-[10px] tracking-[0.4em] font-black mt-1">Situs & Kemaharajaan Nusantara</p></div></div>
              <div className="relative w-full md:w-[450px]"><input type="text" placeholder="Cari..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-stone-900/50 border border-stone-800 rounded-2xl py-4 px-6 pl-12 text-stone-100 focus:border-amber-600 outline-none shadow-inner placeholder:text-stone-800" /><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-700" size={20} /></div>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">{categories.map(cat => (<button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`flex shrink-0 items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${selectedCategory === cat.id ? 'bg-amber-600 text-stone-950 border-amber-600 shadow-xl' : 'bg-stone-900/40 border-stone-800 text-stone-500 hover:text-stone-300'}`}>{cat.icon} {cat.label}</button>))}</div>
          </header>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">{filteredItems.map((item) => (
            <div key={item.id} onClick={() => handleOpenItem(item)} className="group bg-stone-900/40 rounded-[40px] border border-stone-800 overflow-hidden hover:border-amber-600 transition-all cursor-pointer shadow-xl flex flex-col h-full backdrop-blur-sm">
              <div className="h-64 relative overflow-hidden"><img src={item.image} alt={item.title} className="w-full h-full object-cover grayscale opacity-30 group-hover:scale-110 group-hover:opacity-60 transition-all duration-1000 brightness-50" /><div className="absolute top-4 left-4 flex gap-2"><div className="px-3 py-1 bg-amber-600 text-stone-950 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg">{item.category}</div></div></div>
              <div className="p-8 flex-1 flex flex-col space-y-4"><h3 className="text-2xl font-heritage font-bold text-white group-hover:text-amber-500 transition-colors leading-tight">{item.title}</h3><p className="text-stone-500 text-xs italic line-clamp-2">"{item.description}"</p><div className="mt-auto pt-4 border-t border-stone-800 flex items-center justify-between"><span className="text-[9px] font-black text-amber-900 uppercase tracking-widest italic">Singkap Waskita</span><ChevronRight size={18} className="text-stone-700 group-hover:text-amber-600 transition-all transform group-hover:translate-x-1" /></div></div>
            </div>
          ))}</div>
        </>
      ) : (
        <div className="space-y-0 bg-stone-950 min-h-screen animate-in fade-in duration-500 pb-20">
          <div className="py-6 flex items-center justify-between border-b border-stone-900 bg-stone-950/80 backdrop-blur-md sticky top-0 z-40 px-4 md:px-10"><button onClick={() => { setSelectedItem(null); }} className="flex items-center gap-2 text-stone-500 hover:text-amber-600 transition-colors"><ArrowLeft size={20} /><span className="font-bold uppercase tracking-widest text-[10px]">Kembali</span></button><div className="px-3 py-1 bg-amber-600 text-stone-950 rounded-full text-[9px] font-black uppercase tracking-widest">{selectedItem.category}</div></div>
          <div className="relative h-[300px] md:h-[600px] overflow-hidden"><img src={selectedItem.image} alt={selectedItem.title} className="w-full h-full object-cover grayscale opacity-30 brightness-50" /><div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent" /><div className="absolute bottom-10 left-6 right-6 md:left-20 md:right-20"><h3 className="text-4xl md:text-8xl font-heritage font-bold text-white text-glow-amber leading-tight">{selectedItem.title}</h3><p className="text-stone-500 text-sm md:text-xl mt-4 italic flex items-center gap-2"><MapPin size={18} className="text-amber-600" /> {selectedItem.origin}</p></div></div>
          <section className="p-6 md:p-20 bg-stone-900/30 border-y border-stone-900"><div className="flex items-center gap-4 text-amber-500 mb-10 border-b border-stone-800 pb-8"><History size={28} className="animate-pulse" /><h3 className="font-heritage text-3xl font-bold uppercase tracking-wider">Kronik Arkeologi</h3></div>{loadingHistory ? <div className="py-20 flex flex-col items-center justify-center space-y-6"><Loader2 className="animate-spin text-amber-600" size={48} /><p className="text-amber-600 font-heritage italic text-xl animate-pulse">Membedah Sanad...</p></div> : <div className="text-stone-100 leading-relaxed italic text-justify text-lg md:text-4xl whitespace-pre-wrap bg-stone-950/50 p-6 md:p-20 md:rounded-[40px] border border-stone-800 shadow-inner font-medium">{historicalData}</div>}</section>
          <section className="p-6 md:p-20"><div className="flex items-center gap-4 text-amber-500 mb-10 border-b border-stone-800 pb-8"><Sparkles size={28} className="animate-pulse" /><h3 className="font-heritage text-3xl font-bold uppercase tracking-wider">Filosofi Waskita</h3></div><div className="text-stone-100 leading-relaxed italic text-justify text-lg md:text-4xl whitespace-pre-wrap font-medium">{aiInsight}</div></section>
        </div>
      )}
    </div>
  );
};

export default CultureTreasuryView;
