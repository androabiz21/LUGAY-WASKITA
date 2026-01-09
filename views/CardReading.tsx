
import React, { useState } from 'react';
import { Layers, Sparkles, Loader2, Star, HelpCircle, Clock, ShieldAlert, Zap, Heart, Eye, Home, X, Image as ImageIcon, User, Calendar } from 'lucide-react';
import { getCulturalSynthesis, generateCardVisual } from '../services/gemini.ts';
import ShareResult from '../components/ShareResult.tsx';
import { AppView } from '../types.ts';

interface Card {
  id: string;
  name: string;
  meaning: string;
  image?: string | null;
  imageLoading?: boolean;
}

interface SpreadType {
  id: string;
  label: string;
  description: string;
  positions: string[];
  icon: React.ReactNode;
}

const WASKITA_CARDS: Card[] = [
  { id: '1', name: 'Gunungan', meaning: 'Pusat jagad, awal dan akhir perjalanan.' },
  { id: '2', name: 'Keris Pusaka', meaning: 'Kedaulatan batin and martabat.' },
  { id: '3', name: 'Beringin Sakti', meaning: 'Pengayoman and perlindungan.' },
  { id: '4', name: 'Garuda Nusantara', meaning: 'Kebebasan jiwa and visi luas.' },
  { id: '5', name: 'Nyi Roro Kidul', meaning: 'Intuisi and rahasia laut batin.' },
  { id: '6', name: 'Merapi Maha Meru', meaning: 'Transformasi and energi alam.' },
  { id: '7', name: 'Kyai Semar', meaning: 'Kebijaksanaan and pembimbing jiwa.' },
  { id: '8', name: 'Gatotkaca', meaning: 'Ketangguhan and loyalitas.' },
  { id: '9', name: 'Candi Borobudur', meaning: 'Pencerahan and kesabaran.' },
  { id: '10', name: 'Maung Pasundan', meaning: 'Wibawa and penjaga marwah.' },
  { id: '11', name: 'Mandala Nusantara', meaning: 'Harmoni and keseimbangan.' },
  { id: '12', name: 'Padi Emas', meaning: 'Kemakmuran and kerendahan hati.' },
];

const SPREADS: SpreadType[] = [
  { id: 'time', label: 'Tritunggal Waktu', description: 'Masa Lalu, Kini, and Depan.', positions: ['Masa Lalu', 'Masa Kini', 'Masa Depan'], icon: <Clock size={16} /> },
  { id: 'action', label: 'Tiga Pilar Solusi', description: 'Tantangan and Saran.', positions: ['Tantangan', 'Saran', 'Hasil'], icon: <ShieldAlert size={16} /> },
  { id: 'mind', label: 'Keselarasan Batin', description: 'Pikiran, Perasaan, Tindakan.', positions: ['Pikiran', 'Perasaan', 'Tindakan'], icon: <Heart size={16} /> }
];

const CardReadingView: React.FC<{ onNavigate: (view: AppView) => void }> = ({ onNavigate }) => {
  const [userName, setUserName] = useState(localStorage.getItem('waskita_user') || '');
  const [birthDate, setBirthDate] = useState('');
  const [motherName, setMotherName] = useState('');
  const [question, setQuestion] = useState('');
  const [selectedSpread, setSelectedSpread] = useState<SpreadType>(SPREADS[0]);
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [interpretation, setInterpretation] = useState('');
  const [loading, setLoading] = useState(false);
  const [readingStarted, setReadingStarted] = useState(false);
  const [activeCardIndex, setActiveCardIndex] = useState<number | null>(null);

  const drawCards = async () => {
    if (!question.trim() || !userName.trim() || !birthDate.trim() || !motherName.trim()) { alert("Mohon lengkapi seluruh data batin."); return; }
    setReadingStarted(true); setLoading(true); setInterpretation(''); setActiveCardIndex(null);
    const shuffled = [...WASKITA_CARDS].sort(() => 0.5 - Math.random());
    const drawn = shuffled.slice(0, 3).map(c => ({ ...c, image: null, imageLoading: true }));
    setSelectedCards(drawn);
    handleInterpretation(drawn);
    drawn.forEach(async (card, idx) => {
      try {
        const imageUrl = await generateCardVisual(card.name);
        setSelectedCards(prev => { const next = [...prev]; if (next[idx]) next[idx] = { ...next[idx], image: imageUrl, imageLoading: false }; return next; });
      } catch (err) { setSelectedCards(prev => { const next = [...prev]; if (next[idx]) next[idx].imageLoading = false; return next; }); }
    });
    setTimeout(() => setActiveCardIndex(0), 1000);
  };

  const handleInterpretation = async (drawn: Card[]) => {
    const cardContext = drawn.map((c, i) => `${selectedSpread.positions[i]}: ${c.name}`).join(', ');
    const prompt = `Lakukan pembacaan kartu Waskita Nusantara. Subjek: ${userName}, ${birthDate}, Ibu: ${motherName}. Tanya: "${question}". Tebaran: "${selectedSpread.label}". Kartu: ${cardContext}. Berikan risalah puitis polos tanpa bintang.`;
    const result = await getCulturalSynthesis(prompt);
    setInterpretation(result); setLoading(false);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20 px-0 md:px-10 pt-8 bg-stone-950 min-h-screen text-stone-100">
      <header className="space-y-4 px-4">
        <button onClick={() => onNavigate(AppView.HOME)} className="flex items-center gap-2 text-stone-500 hover:text-amber-500 transition-colors mb-6 group">
          <div className="p-2 rounded-full group-hover:bg-amber-900/20 transition-colors"><Home size={18} /></div>
          <span className="font-bold uppercase tracking-widest text-[10px]">Beranda</span>
        </button>
        <div className="flex items-center gap-4">
          <div className="p-4 bg-stone-900 border border-stone-800 rounded-2xl text-amber-500 shadow-2xl"><Layers size={32} /></div>
          <div>
            <h2 className="text-4xl md:text-5xl font-heritage font-bold text-white text-glow-amber tracking-tight uppercase">Kartu Waskita</h2>
            <p className="text-stone-500 uppercase text-[10px] tracking-[0.4em] font-black mt-1">Refleksi Simbolik Perjalanan Hidup</p>
          </div>
        </div>
      </header>

      {!readingStarted ? (
        <div className="max-w-4xl mx-auto space-y-10 px-4">
          <div className="p-8 md:p-12 bg-stone-900/40 rounded-[40px] border border-stone-800 space-y-8 shadow-inner backdrop-blur-md">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-stone-800 pb-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-stone-500 uppercase tracking-widest flex items-center gap-2"><User size={12} className="text-amber-600" /> Nama Lengkap</label>
                <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Contoh: Asep Sunandar..." className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-white focus:border-amber-600 outline-none shadow-inner" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-stone-500 uppercase tracking-widest flex items-center gap-2"><Calendar size={12} className="text-amber-600" /> Tgl Lahir</label>
                <input type="text" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} placeholder="Contoh: 17-08-1945" className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-white focus:border-amber-600 outline-none shadow-inner" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-stone-500 uppercase tracking-widest flex items-center gap-2"><Heart size={12} className="text-rose-800" /> Nama Ibu</label>
                <input type="text" value={motherName} onChange={(e) => setMotherName(e.target.value)} placeholder="Contoh: Siti Fatimah..." className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-white focus:border-amber-600 outline-none shadow-inner" />
              </div>
            </div>
            <div className="space-y-4">
              <label className="block text-[10px] font-black text-stone-200 uppercase tracking-widest flex items-center gap-2"><HelpCircle size={14} className="text-amber-600" /> Apa Hajat Anda?</label>
              <textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Tuliskan pertanyaan Anda secara spesifik..." className="w-full h-32 bg-stone-950 border border-stone-800 rounded-3xl p-6 text-white focus:border-amber-600 outline-none shadow-inner italic" />
            </div>
            <button onClick={drawCards} disabled={!question.trim()} className="w-full py-6 bg-stone-100 hover:bg-white text-stone-950 font-black rounded-2xl shadow-2xl uppercase tracking-widest text-[11px]">BUKA TABIR KARTU</button>
          </div>
        </div>
      ) : (
        <div className="space-y-16 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 px-4">
            {selectedCards.map((card, idx) => (
              <div key={idx} className={`flex flex-col items-center gap-6 transition-all duration-1000 ${activeCardIndex === idx ? 'scale-110 z-30' : 'opacity-40 scale-95'}`} onClick={() => setActiveCardIndex(idx)}>
                <div className={`px-6 py-2 border rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] ${activeCardIndex === idx ? 'bg-amber-600 border-amber-400 text-stone-950 shadow-xl' : 'bg-stone-900 border-stone-800 text-stone-500'}`}>{selectedSpread.positions[idx]}</div>
                <div className="w-full aspect-[3/4] md:aspect-[4/5] rounded-[40px] overflow-hidden border border-stone-800 bg-stone-900 shadow-2xl flex flex-col items-center justify-center relative">
                  {card.imageLoading ? <Loader2 className="animate-spin text-amber-600" size={40} /> : <img src={card.image!} alt={card.name} className="w-full h-full object-cover brightness-75 grayscale-[0.3]" />}
                  <div className="absolute bottom-6 left-0 right-0 text-center z-20"><h4 className="text-2xl font-heritage font-bold text-white text-glow-amber">{card.name}</h4></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent" />
                </div>
              </div>
            ))}
          </div>
          <div className="p-0 md:p-16 glass-panel md:rounded-[60px] border-y md:border border-stone-800 bg-stone-900/30 shadow-2xl">
            <div className="flex items-center gap-4 text-amber-500 mb-10 border-b border-stone-800 pb-8 px-6 pt-8 md:pt-0 md:px-0">
               <Sparkles size={28} className="animate-pulse" /><h3 className="font-heritage text-3xl md:text-5xl font-bold uppercase tracking-wider">Risalah Waskita</h3>
            </div>
            <div className="bg-stone-950/50 p-6 md:p-20 md:rounded-[40px] border-y md:border border-stone-800 shadow-inner">
               <div className="text-stone-100 leading-relaxed italic text-justify text-lg md:text-4xl whitespace-pre-wrap font-medium">{interpretation || (loading && "Menenun nasib...")}</div>
               {interpretation && <div className="mt-12 pt-10 border-t border-stone-800"><ShareResult title="Risalah Kartu Waskita" text={interpretation} /></div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardReadingView;
