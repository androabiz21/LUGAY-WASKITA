
import React, { useState, useMemo } from 'react';
import { calculateWeton, getWatak, getZodiac } from '../services/calculator.ts';
import { getCulturalSynthesis } from '../services/gemini.ts';
import { 
  Calendar, Search, Sparkles, Loader2, User, Compass, BookOpen, ScrollText, Waves, Flame, Mountain, Wind, Info, Zap, Star, Home
} from 'lucide-react';
import ShareResult from '../components/ShareResult.tsx';
import { AppView } from '../types.ts';

const CharacterConstellation = ({ data }: { data: { subject: string, value: number }[] }) => {
  const points = data.length;
  const radius = 38;
  const center = 50;

  const getCoordinates = (index: number, value: number) => {
    const angle = (index * (360 / points) - 90) * (Math.PI / 180);
    const x = center + radius * (value / 100) * Math.cos(angle);
    const y = center + radius * (value / 100) * Math.sin(angle);
    return { x, y };
  };

  const polygonPath = data.map((item, i) => {
    const coords = getCoordinates(i, item.value);
    return `${coords.x},${coords.y}`;
  }).join(' ');

  return (
    <div className="w-full aspect-square max-w-[450px] mx-auto relative group select-none">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(217,119,6,0.1),transparent_70%)] animate-pulse" />
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl overflow-visible">
        {[20, 40, 60, 80, 100].map((level) => (
          <circle
            key={level}
            cx={center}
            cy={center}
            r={(level / 100) * radius}
            fill="none"
            stroke="rgba(217, 119, 6, 0.1)"
            strokeWidth="0.2"
            strokeDasharray={level === 100 ? "none" : "1, 2"}
          />
        ))}
        {data.map((_, i) => {
          const coords = getCoordinates(i, 100);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={coords.x}
              y2={coords.y}
              stroke="rgba(217, 119, 6, 0.05)"
              strokeWidth="0.1"
            />
          );
        })}
        <polygon
          points={polygonPath}
          fill="rgba(217, 119, 6, 0.15)"
          stroke="#d97706"
          strokeWidth="0.6"
          className="transition-all duration-[2000ms] ease-out"
        />
        {data.map((item, i) => {
          const coords = getCoordinates(i, item.value);
          return (
            <circle key={i} cx={coords.x} cy={coords.y} r="1.5" fill="#f59e0b" className="shadow-amber-500 shadow-lg" />
          );
        })}
      </svg>
      {data.map((item, i) => {
        const angle = (i * (360 / points) - 90);
        const rad = angle * (Math.PI / 180);
        const dist = 56; 
        const lx = center + dist * Math.cos(rad);
        const ly = center + dist * Math.sin(rad);
        return (
          <div key={i} className="absolute transform -translate-x-1/2 -translate-y-1/2 text-center" style={{ left: `${lx}%`, top: `${ly}%` }}>
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-[7px] md:text-[10px] font-black text-amber-500 uppercase tracking-widest bg-stone-900 px-2 py-0.5 rounded-full border border-stone-800 shadow-xl">
                {item.subject}
              </span>
              <span className="text-[9px] font-heritage font-bold text-stone-100">{item.value}%</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const CalculatorView: React.FC<{ onNavigate: (view: AppView) => void }> = ({ onNavigate }) => {
  const [userName, setUserName] = useState('');
  const [birthDate, setBirthDate] = useState(''); 
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState('');

  const parseManualDate = (dateStr: string) => {
    if (!dateStr) return null;
    const parts = dateStr.trim().split(/[-/.]/);
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

  const getElementInfo = (pasaran: string) => {
    switch(pasaran) {
      case 'Legi': return { name: 'Air', icon: <Waves size={24} />, color: 'from-blue-900/40 to-stone-950', border: 'border-blue-900/50', text: 'text-blue-400', desc: 'Adaptabilitas batin.' };
      case 'Pahing': return { name: 'Api', icon: <Flame size={24} />, color: 'from-red-900/40 to-stone-950', border: 'border-red-900/50', text: 'text-red-400', desc: 'Gairah transformasi.' };
      case 'Pon': return { name: 'Tanah', icon: <Mountain size={24} />, color: 'from-amber-900/40 to-stone-950', border: 'border-amber-900/50', text: 'text-amber-400', desc: 'Stabilitas keteguhan.' };
      case 'Wage': return { name: 'Udara', icon: <Wind size={24} />, color: 'from-stone-800 to-stone-950', border: 'border-stone-700', text: 'text-stone-300', desc: 'Kecerdasan dinamika.' };
      case 'Kliwon': return { name: 'Aether', icon: <Sparkles size={24} />, color: 'from-amber-600/20 to-stone-950', border: 'border-amber-600/30', text: 'text-amber-500', desc: 'Keseimbangan spiritual.' };
      default: return { name: 'Unsur', icon: <Sparkles size={24} />, color: 'from-stone-900 to-stone-950', border: 'border-stone-800', text: 'text-stone-400', desc: 'Energi murni.' };
    }
  };

  const handleCalculate = async () => {
    const date = parseManualDate(birthDate);
    if (!date) return;
    setLoading(true);
    setResult(null); 
    setAiInsight('');
    const weton = calculateWeton(date);
    const zodiac = getZodiac(date);
    const watakText = getWatak(weton.totalNeptu);
    const element = getElementInfo(weton.pasaranName);
    const calcResult = { ...weton, zodiac, watak: watakText, elementInfo: element };
    const prompt = `Analisis Weton: ${weton.javaneseDate}, Neptu: ${weton.totalNeptu}, Zodiak: ${zodiac}. Berikan risalah puitis Nusantara yang mendalam tanpa simbol bintang. Manfaatkan seluruh lebar teks secara maksimal.`;
    const insight = await getCulturalSynthesis(prompt);
    setAiInsight(insight);
    setResult(calcResult);
    setLoading(false);
  };

  const characterData = useMemo(() => {
    if (!result) return [];
    const n = Number(result.totalNeptu);
    const safeNum = (v: number) => Math.max(25, Math.min(98, Math.floor(v)));
    return [
      { subject: 'AKHLAK', value: safeNum((n / 18) * 80 + 15) },
      { subject: 'REJEKI', value: safeNum(((n + 4) / 22) * 85 + 10) },
      { subject: 'BATIN', value: safeNum(((19 - n) / 12) * 65 + 30) },
      { subject: 'WIBAWA', value: safeNum((n / 18) * 75 + 20) },
      { subject: 'SABAR', value: safeNum((n % 6) * 12 + 40) },
      { subject: 'ALAM', value: safeNum((result.totalNeptu * 5) % 100 + 30) },
    ];
  }, [result]);

  return (
    <div className="space-y-8 pb-20 px-0 md:px-10 py-8 bg-stone-950 min-h-screen text-stone-100">
      <header className="space-y-4 px-4 md:px-0">
        <button onClick={() => onNavigate(AppView.HOME)} className="flex items-center gap-2 text-stone-500 hover:text-amber-500 transition-colors mb-6 group"><div className="p-2 rounded-full group-hover:bg-amber-900/20 transition-colors"><Home size={18} /></div><span className="font-bold uppercase tracking-widest text-[10px]">Beranda</span></button>
        <div className="flex items-center gap-4">
          <div className="p-4 bg-stone-900 border border-stone-800 rounded-3xl text-amber-500 shadow-2xl"><BookOpen size={32} /></div>
          <div>
            <h2 className="text-3xl md:text-5xl font-heritage font-bold text-white tracking-tight text-glow-amber uppercase leading-none">Paririmbon</h2>
            <p className="text-amber-600 uppercase text-[10px] tracking-[0.4em] font-black mt-1">Algoritma Kosmologis Nusantara</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 px-0">
        <div className="xl:col-span-4 px-4 md:px-0">
          <div className="p-8 bg-stone-900/40 border border-stone-800 rounded-[40px] space-y-8 shadow-inner backdrop-blur-md">
            <h3 className="text-2xl font-heritage font-bold text-white border-b border-stone-800 pb-4">Inisiasi Data</h3>
            <div className="space-y-6">
              <div className="space-y-2"><label className="text-[9px] font-black text-stone-500 uppercase tracking-widest">Nama Lengkap</label><input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Ahmad Satria..." className="w-full bg-stone-950 border border-stone-800 rounded-xl p-4 text-white focus:border-amber-600 outline-none shadow-inner" /></div>
              <div className="space-y-2"><label className="text-[9px] font-black text-stone-500 uppercase tracking-widest">Tanggal Lahir (HH-BB-TTTT)</label><input type="text" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} placeholder="17-08-1945" className="w-full bg-stone-950 border border-stone-800 rounded-xl p-4 text-white focus:border-amber-600 outline-none shadow-inner" /></div>
              <button onClick={handleCalculate} disabled={loading || !birthDate} className="w-full py-5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-black rounded-2xl shadow-2xl uppercase tracking-widest text-[11px]">
                {loading ? <Loader2 className="animate-spin mx-auto" /> : 'SINGKAP TAKDIR'}
              </button>
            </div>
          </div>
        </div>

        <div className="xl:col-span-8 space-y-8 px-0">
          {loading && (
            <div className="h-96 bg-stone-900/30 md:rounded-[48px] border-y md:border border-stone-800 flex flex-col items-center justify-center space-y-6">
               <Loader2 className="animate-spin text-amber-600" size={48} />
               <p className="text-amber-500 font-heritage italic text-xl animate-pulse">Membaca denyut semesta...</p>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-8 animate-in fade-in duration-1000 px-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 md:px-0">
                <div className="p-8 md:p-12 bg-stone-900/40 rounded-[40px] border border-stone-800 shadow-inner backdrop-blur-md">
                  <p className="text-[8px] font-black text-stone-500 uppercase tracking-widest mb-4">Hari & Pasaran</p>
                  <h3 className="text-4xl md:text-6xl font-heritage font-bold text-white mb-6 text-glow-amber">{result.javaneseDate}</h3>
                  <span className="px-6 py-2.5 bg-amber-600 text-stone-950 rounded-xl text-xl font-black tracking-widest shadow-xl">NEPTU {result.totalNeptu}</span>
                </div>
                <div className={`p-8 md:p-12 rounded-[40px] border ${result.elementInfo?.border} bg-gradient-to-br ${result.elementInfo?.color} shadow-inner backdrop-blur-md`}>
                   <p className="text-[8px] font-black text-stone-400 uppercase tracking-widest mb-4">Elemen Batin</p>
                   <h3 className={`text-4xl md:text-6xl font-heritage font-bold ${result.elementInfo?.text} mb-4`}>{result.elementInfo?.name}</h3>
                   <p className="text-stone-400 text-sm italic">"{result.elementInfo?.desc}"</p>
                </div>
              </div>

              <div className="p-6 md:p-20 bg-stone-900/20 md:rounded-[60px] border-y md:border border-stone-800 shadow-2xl mx-0">
                <CharacterConstellation data={characterData} />
              </div>

              <div className="p-0 md:p-16 bg-stone-900/50 md:rounded-[60px] border-y md:border border-stone-800 shadow-inner relative">
                <div className="flex items-center gap-3 text-amber-500 mb-10 border-b border-stone-800 pb-8 px-6 pt-8 md:pt-0 md:px-0 relative z-10">
                  <ScrollText size={32} />
                  <h3 className="font-heritage text-2xl md:text-3xl font-bold uppercase tracking-wider">Risalah Waskita</h3>
                </div>
                <div className="text-stone-100 text-lg md:text-4xl leading-relaxed italic text-justify whitespace-pre-wrap font-medium p-5 md:p-20 bg-stone-950/50 md:rounded-[40px] border-y md:border border-stone-800 shadow-inner w-full relative z-10">
                  {aiInsight}
                </div>
                <div className="px-6 md:px-0 pb-10 mt-10">
                  <ShareResult title="Risalah Paririmbon Nusantara" text={aiInsight} context={`Weton: ${result.javaneseDate}, Neptu: ${result.totalNeptu}`} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalculatorView;
