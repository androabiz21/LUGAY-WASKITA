
import React, { useState, useMemo } from 'react';
import { Shield, Sparkles, BookOpen, Info, Zap, Eye, Target, Wind, Hammer, Loader2, Music, List, History, Move, ChevronRight, PlayCircle, Waves, Maximize2, Calendar, UserCheck, Home, Landmark, Briefcase, Drum, Flame } from 'lucide-react';
import { getCulturalSynthesis } from '../services/gemini.ts';
import ShareResult from '../components/ShareResult.tsx';
import { AppView } from '../types.ts';

type SilatSection = 'philosophy' | 'history' | 'lineage' | 'technique' | 'music' | 'ibing' | 'organization';

interface SilatItem {
  id: string;
  name: string;
  context: string;
  icon: React.ReactNode;
  desc: string;
  category: string;
}

const SilatView: React.FC<{ onNavigate: (view: AppView) => void }> = ({ onNavigate }) => {
  const [activeSection, setActiveSection] = useState<SilatSection>('history');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [aiInsight, setAiInsight] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const sections = [
    { id: 'history', label: 'Sejarah', icon: <History size={16} /> },
    { id: 'philosophy', label: 'Olah Rasa', icon: <Sparkles size={16} /> },
    { id: 'lineage', label: 'Aliran', icon: <Landmark size={16} /> },
    { id: 'technique', label: 'Jurus & Teknik', icon: <Move size={16} /> },
    { id: 'music', label: 'Gendang Pencak', icon: <Drum size={16} /> },
    { id: 'ibing', label: 'Ibing Tepakan', icon: <PlayCircle size={16} /> },
    { id: 'organization', label: 'Organisasi', icon: <Briefcase size={16} /> },
  ];

  const silatData: Record<SilatSection, SilatItem[]> = {
    history: [
      { id: 'asal-usul', name: 'Sanad Silat Nusantara', context: 'Kronik Sejarah', icon: <History size={20} />, desc: 'Perjalanan bela diri dari zaman kerajaan purba hingga menjadi identitas nasional dan warisan dunia.', category: 'Sejarah' },
      { id: 'silat-pasundan', name: 'Silat Tatar Pasundan', context: 'Jawa Barat', icon: <Landmark size={20} />, desc: 'Keunikan Pencak Silat di tanah Sunda yang kental dengan nilai silih asah, silih asih, silih asuh.', category: 'Sejarah' }
    ],
    philosophy: [
      { id: 'gerak-rasa', name: 'Gerak Rasa', context: 'Spontanitas Batin', icon: <Wind size={20} />, desc: 'Spontanitas gerak yang lahir dari intuisi murni sebelum pikiran sadar memutuskan.', category: 'Olah Rasa' },
      { id: 'tahan-rasa', name: 'Tahan Rasa', context: 'Kestabilan Jiwa', icon: <Shield size={20} />, desc: 'Kestabilan emosi dan kejernihan batin saat menghadapi tekanan luar biasa.', category: 'Olah Rasa' },
      { id: 'tembus-rasa', name: 'Tembus Rasa', context: 'Ketajaman Intuisi', icon: <Eye size={20} />, desc: 'Ketajaman intuisi membaca niat lawan sebelum serangan mewujud.', category: 'Olah Rasa' },
      { id: 'panyinglang-rasa', name: 'Panyinglang Rasa', context: 'Filter Energi', icon: <Waves size={20} />, desc: 'Kemampuan memilah energi luar agar tidak merusak keseimbangan batin.', category: 'Olah Rasa' },
      { id: 'daya-cipta-rasa', name: 'Daya Cipta Rasa', context: 'Manifestasi Niat', icon: <Zap size={20} />, desc: 'Puncak pencapaian dimana kehendak batin termanifestasi menjadi gerak nyata.', category: 'Olah Rasa' }
    ],
    lineage: [
      { 
        id: 'cimande', 
        name: 'Aliran Cimande', 
        context: 'Abah Kahir (±1760) | Bogor', 
        icon: <Landmark size={20} />, 
        desc: 'Aliran tertua di tanah Pasundan yang menekankan pertahanan kokoh (kelid) dan ketajaman serangan tangan kosong.', 
        category: 'Aliran' 
      },
      { 
        id: 'cikalong', 
        name: 'Aliran Cikalong', 
        context: 'R.H. Ibrahim (±1800-an) | Cianjur', 
        icon: <Landmark size={20} />, 
        desc: 'Sintesis kelembutan gerak dan kepekaan rasa (usik) yang mampu menaklukkan lawan tanpa tenaga besar.', 
        category: 'Aliran' 
      },
      { 
        id: 'sabandar', 
        name: 'Aliran Sabandar', 
        context: 'Moh. Kosim (±1834) | Pagaruyung - Cianjur', 
        icon: <Landmark size={20} />, 
        desc: 'Keunikan pola langkah (pancer) dan ledakan tenaga eksplosif yang diadaptasi dari tradisi Pagaruyung ke bumi Sunda.', 
        category: 'Aliran' 
      }
    ],
    technique: [
      { id: 'kedet-gedig', name: 'Kedet & Gedig', context: 'Pemutusan Irama', icon: <Zap size={20} />, desc: 'Gerak potong cepat dan hentakan tenaga untuk memecah keseimbangan.', category: 'Teknik' },
      { id: 'pepeh-siku', name: 'Pepeh & Siku', context: 'Penetrasi Jarak', icon: <Target size={20} />, desc: 'Masuk jarak rapat diikuti serangan siku atau kuncian bahu.', category: 'Teknik' },
      { id: 'beulit-jejek', name: 'Beulit & Jejek', context: 'Penguncian Anggota', icon: <Move size={20} />, desc: 'Melilit anggota tubuh lawan dan teknik injakan maut.', category: 'Teknik' },
      { id: 'sered-tibra', name: 'Sered & Tibra', context: 'Momen Tarikan', icon: <Waves size={20} />, desc: 'Menarik lawan dan menjatuhkan dengan momentum putaran tubuh.', category: 'Teknik' }
    ],
    music: [
      { id: 'gendang-pencak', name: 'Gendang Pencak Jabar', context: 'Instrumen Pengiring', icon: <Drum size={20} />, desc: 'Perangkat musik khas: Kendang Gede, Kulanter, Terompet, dan Gong.', category: 'Musik' }
    ],
    ibing: [
      { id: 'pareredan', name: 'Pareredan', context: 'Irama Pembuka', icon: <Music size={20} />, desc: 'Irama pembuka yang lambat dan khidmat sebagai simbol penghormatan.', category: 'Ibing' },
      { id: 'tepak-dua-tiga', name: 'Tepak 2 & Tepak 3', context: 'Irama Laga', icon: <PlayCircle size={20} />, desc: 'Variasi irama iringan jurus standar hingga atraktif.', category: 'Ibing' },
      { id: 'padudung', name: 'Padudung', context: 'Semangat Meluap', icon: <Flame size={20} />, desc: 'Tepakan dinamis yang menggambarkan semangat menggebu.', category: 'Ibing' },
      { id: 'golempangan-mincig', name: 'Golempangan & Mincig', context: 'Estetika Langkah', icon: <Move size={20} />, desc: 'Seni langkah kaki lincah dan teknik gulingan bawah.', category: 'Ibing' },
      { id: 'liwung-bombang', name: 'Liwung & Bombang', context: 'Gelombang Rasa', icon: <Waves size={20} />, desc: 'Tepakan berat dan lebar yang meresonansi kedalaman batin pesilat.', category: 'Ibing' }
    ],
    organization: [
      { id: 'ppsi', name: 'PPSI', context: 'Persatuan Pencak Silat Seluruh Indonesia', icon: <Briefcase size={20} />, desc: 'Wadah pelestarian silat tradisi dan nilai luhur Nusantara.', category: 'Organisasi' },
      { id: 'ipsi', name: 'IPSI', context: 'Ikatan Pencak Silat Indonesia', icon: <Briefcase size={20} />, desc: 'Induk organisasi pencak silat nasional resmi.', category: 'Organisasi' },
      { id: 'apn', name: 'APN', context: 'Asosiasi Pencak Silat Nusantara', icon: <Briefcase size={20} />, desc: 'Wadah penguatan silat tradisi di kancah global.', category: 'Organisasi' }
    ]
  };

  const currentData = silatData[activeSection];

  const handleSelectItem = async (item: SilatItem) => {
    setSelectedId(item.id);
    setLoading(true);
    setAiInsight('');
    
    let prompt = `Bedah mendalam tentang Pencak Silat: '${item.name}' kategori ${item.category}. Gunakan gaya bahasa puitis waskita, teks polos tanpa simbol bintang, dan pastikan tulisan memenuhi SELURUH LEBAR LAYAR secara maksimal (edge-to-edge).`;

    const insight = await getCulturalSynthesis(prompt);
    setAiInsight(insight);
    setLoading(false);
  };

  const selectedItem = useMemo(() => currentData.find(c => c.id === selectedId), [selectedId, currentData]);

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-20 px-0 pt-8 bg-stone-950 min-h-screen text-stone-100">
      <header className="space-y-8 px-4 md:px-10">
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
          <div className="p-4 bg-stone-900 border border-stone-800 rounded-3xl text-amber-500 shadow-2xl shadow-black">
            <Shield size={32} />
          </div>
          <div>
            <h2 className="text-4xl md:text-6xl font-heritage font-bold text-white text-glow-amber tracking-tight uppercase">Pencak Silat</h2>
            <p className="text-stone-500 uppercase text-[10px] md:text-xs tracking-[0.4em] font-black mt-2">Penjaga Marwah & Warisan Agung Nusantara</p>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => { setActiveSection(s.id as SilatSection); setSelectedId(null); setAiInsight(''); }}
              className={`shrink-0 flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${activeSection === s.id ? 'bg-amber-600 text-stone-950 border-amber-600 shadow-lg shadow-amber-900/20' : 'bg-stone-900/40 border-stone-800 text-stone-500 hover:text-stone-300 hover:border-stone-700'}`}
            >
              {s.icon} {s.label}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-0 md:px-10">
        <div className="lg:col-span-4 space-y-3 px-4 md:px-0">
          <div className="px-2 pb-2">
            <h3 className="text-[10px] font-black text-stone-700 uppercase tracking-[0.3em]">Khasanah {sections.find(s => s.id === activeSection)?.label}</h3>
          </div>
          <div className="space-y-3">
            {currentData.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelectItem(item)}
                className={`w-full text-left p-6 bg-stone-900/30 rounded-3xl border transition-all flex items-center gap-5 group shadow-sm ${selectedId === item.id ? 'border-amber-600 bg-stone-900/60 ring-1 ring-amber-600' : 'border-stone-800 hover:border-stone-700'}`}
              >
                <div className={`p-4 rounded-2xl transition-all ${selectedId === item.id ? 'bg-amber-600 text-stone-950 shadow-lg shadow-amber-900/20' : 'bg-stone-950 text-stone-600'}`}>
                  {item.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-heritage text-xl font-bold text-white leading-tight group-hover:text-amber-500 transition-colors">{item.name}</h4>
                  <p className="text-[10px] text-stone-600 uppercase font-black tracking-widest mt-1 italic">{item.context}</p>
                </div>
                <ChevronRight size={20} className={`transition-all ${selectedId === item.id ? 'translate-x-1 text-amber-500' : 'opacity-0 group-hover:opacity-100 text-stone-700'}`} />
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-8 px-0">
          {selectedItem ? (
            <div className="space-y-0 animate-in slide-in-from-right duration-700 px-0 pb-10">
               <div className="mb-10 px-4 md:px-0">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-900/30 text-amber-500 border border-amber-600/30 rounded-full text-[9px] font-black uppercase tracking-widest mb-4">
                    Kategori: {selectedItem.category}
                  </div>
                  <h3 className="text-4xl md:text-7xl font-heritage font-bold text-white text-glow-amber tracking-tight leading-none mb-6">{selectedItem.name}</h3>
                  <p className="text-stone-400 text-lg md:text-xl italic font-medium max-w-3xl leading-relaxed">"{selectedItem.desc}"</p>
               </div>

               <div className="w-full px-0">
                  <div className="flex items-center gap-3 text-amber-500 mb-8 border-b border-stone-800 pb-6 px-4 md:px-0">
                    <Sparkles size={28} className="animate-pulse" />
                    <h4 className="font-heritage text-2xl md:text-3xl font-bold uppercase tracking-wider">Risalah Waskita</h4>
                  </div>
                  
                  {loading ? (
                    <div className="py-24 flex flex-col items-center justify-center space-y-6 px-4 md:px-0">
                      <div className="relative">
                        <div className="w-20 h-20 border-4 border-amber-900 border-t-amber-500 rounded-full animate-spin"></div>
                        <Shield className="absolute inset-0 m-auto text-amber-500" size={24} />
                      </div>
                      <p className="text-amber-600 font-heritage italic text-xl animate-pulse">Meresonansi sanad batin...</p>
                    </div>
                  ) : (
                    <div className="space-y-12 px-0">
                      <div className="text-stone-100 text-lg md:text-3xl leading-relaxed italic text-justify whitespace-pre-wrap w-full bg-stone-900/30 md:p-16 p-6 px-[1px] md:rounded-[40px] border-y md:border border-stone-800 shadow-inner font-medium">
                        {aiInsight || "Menanti wejangan waskita..."}
                      </div>
                      <div className="px-4 md:px-0">
                        {aiInsight && <ShareResult title={`Risalah Pencak Silat: ${selectedItem.name}`} text={aiInsight} context={selectedItem.context} />}
                      </div>
                    </div>
                  )}
               </div>
            </div>
          ) : (
            <div className="h-full min-h-[500px] bg-stone-900/20 md:rounded-[60px] border-2 border-dashed border-stone-800 flex flex-col items-center justify-center text-stone-800 p-16 text-center space-y-8 opacity-40 mx-4 md:mx-0">
              <Shield size={120} className="animate-pulse" />
              <div className="space-y-3">
                <h3 className="text-3xl font-heritage font-bold text-stone-600 uppercase tracking-widest">Gerbang Padepokan</h3>
                <p className="text-stone-700 italic text-xl max-w-lg mx-auto leading-relaxed">
                  Pilih salah satu khasanah silat untuk menyingkap rahasia batin melalui terawangan digital.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SilatView;
