
import React, { useState, useMemo, useEffect } from 'react';
import { Feather, Sparkles, Loader2, BookOpen, Calculator, Scroll, Download, Maximize2, Zap, Type, Info, ChevronRight, Star, Home, Copy, Check } from 'lucide-react';
import { getCulturalSynthesis, generateAksaraArt } from '../services/gemini.ts';
import { AKSARA_NEPTU, AKSARA_SUNDA } from '../constants.tsx';
import { AppView } from '../types.ts';

type AksaraTab = 'history' | 'generator' | 'neptu';

const AksaraWaskitaView: React.FC<{ onNavigate: (view: AppView) => void }> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<AksaraTab>('history');
  const [inputText, setInputText] = useState(localStorage.getItem('waskita_user') || '');
  const [aksaraType, setAksaraType] = useState('Aksara Sunda (Kaganga)');
  const [generatedArt, setGeneratedArt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState('');
  const [copied, setCopied] = useState(false);

  const N_SCRIPTS = [
    'Aksara Sunda (Kaganga)',
    'Aksara Jawa (Hanacaraka)',
    'Aksara Bali',
    'Aksara Lontara (Bugis/Makassar)',
    'Aksara Batak (Toba/Mandailing)',
    'Aksara Rejang',
    'Aksara Rencong (Aceh)',
    'Aksara Pegon'
  ];

  const convertToSunda = (text: string) => {
    if (!text) return '';
    let result = '';
    const lower = text.toLowerCase();
    let i = 0;
    while (i < lower.length) {
      let matched = false;
      const pairs = [
        { lat: 'nga', aks: 'ᮌ' }, { lat: 'nya', aks: 'ᮏ' },
        { lat: 'ka', aks: 'ᮊ' }, { lat: 'ga', aks: 'ᮋ' },
        { lat: 'ca', aks: 'ᮍ' }, { lat: 'ja', aks: 'ᮎ' },
        { lat: 'ta', aks: 'ᮐ' }, { lat: 'da', aks: 'ᮑ' },
        { lat: 'na', aks: 'ᮒ' }, { lat: 'pa', aks: 'ᮓ' },
        { lat: 'ba', aks: 'ᮔ' }, { lat: 'ma', aks: 'ᮕ' },
        { lat: 'ya', aks: 'ᮖ' }, { lat: 'ra', aks: 'ᮗ' },
        { lat: 'la', aks: 'ᮘ' }, { lat: 'wa', aks: 'ᮙ' },
        { lat: 'sa', aks: 'ᮚ' }, { lat: 'ha', aks: 'ᮛ' }
      ];
      const p3 = lower.substring(i, i + 3);
      const match3 = pairs.find(p => p.lat === p3);
      if (match3) { result += match3.aks; i += 3; matched = true; }
      if (!matched) {
        const p2 = lower.substring(i, i + 2);
        const match2 = pairs.find(p => p.lat === p2);
        if (match2) { result += match2.aks; i += 2; matched = true; }
        else if (AKSARA_SUNDA[lower[i]]) { result += AKSARA_SUNDA[lower[i]]; i++; matched = true; }
      }
      if (!matched) { result += lower[i]; i++; }
    }
    return result;
  };

  const sundaResult = useMemo(() => {
    if (aksaraType === 'Aksara Sunda (Kaganga)') return convertToSunda(inputText);
    return '';
  }, [inputText, aksaraType]);

  const neptuResult = useMemo(() => {
    if (activeTab !== 'neptu' || !inputText.trim()) return null;
    const text = inputText.toLowerCase().trim();
    let total = 0;
    const matched: string[] = [];
    const consonantMap = AKSARA_NEPTU;
    const p3Map: Record<string, string> = { 'dha': 'dha', 'tha': 'tha', 'nya': 'nya', 'nga': 'nga' };
    const p2Map: Record<string, string> = { 'dh': 'dha', 'th': 'tha', 'ny': 'nya', 'ng': 'nga' };
    const p1Map: Record<string, string> = {
      'h': 'ha', 'n': 'na', 'c': 'ca', 'r': 'ra', 'k': 'ka',
      'd': 'da', 't': 'ta', 's': 'sa', 'w': 'wa', 'l': 'la',
      'p': 'pa', 'j': 'ja', 'y': 'ya', 'm': 'ma', 'g': 'ga', 'b': 'ba'
    };
    let i = 0;
    while (i < text.length) {
      let found = false;
      const p3 = text.substring(i, i + 3);
      if (p3Map[p3]) { total += consonantMap[p3Map[p3]]; matched.push(p3Map[p3]); i += 3; found = true; }
      if (!found) {
        const p2 = text.substring(i, i + 2);
        if (p2Map[p2]) { total += consonantMap[p2Map[p2]]; matched.push(p2Map[p2]); i += 2; found = true; }
        else if (consonantMap[p2]) { total += consonantMap[p2]; matched.push(p2); i += 2; found = true; }
      }
      if (!found) {
        const p1 = text[i];
        if (['a', 'i', 'u', 'e', 'o'].includes(p1)) {
          const prev = i > 0 ? text[i-1] : '';
          if (i === 0 || ['a', 'i', 'u', 'e', 'o', ' '].includes(prev)) { total += consonantMap['ha']; matched.push('ha'); }
          i++; found = true;
        } else if (p1Map[p1]) { total += consonantMap[p1Map[p1]]; matched.push(p1Map[p1]); i++; found = true; }
        else { i++; }
      }
    }
    return { total, matched };
  }, [inputText, activeTab]);

  useEffect(() => {
    if (activeTab === 'neptu' && neptuResult && inputText.trim()) {
      const timer = setTimeout(() => {
        setLoading(true);
        getCulturalSynthesis(`Berikan risalah batin dan numerologi untuk nama "${inputText}" dengan total Neptu Aksara ${neptuResult.total}. Gunakan gaya bahasa waskita puitis Nusantara tanpa simbol bintang.`)
          .then(setAiInsight)
          .catch(err => setAiInsight(err.message))
          .finally(() => setLoading(false));
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [neptuResult, activeTab, inputText]);

  const handleGenerateArt = async () => {
    if (!inputText.trim()) return;
    setLoading(true); setGeneratedArt(null); setAiInsight('');
    try {
      const promptText = aksaraType === 'Aksara Sunda (Kaganga)' ? `${inputText} (visualized as ${sundaResult})` : inputText;
      const url = await generateAksaraArt(aksaraType, promptText);
      setGeneratedArt(url);
      const insight = await getCulturalSynthesis(`Risalah filosofis agung ${aksaraType} untuk teks "${inputText}". Jelaskan makna spiritual bentuk aksara tersebut. Teks polos puitis tanpa simbol bintang.`);
      setAiInsight(insight);
    } catch (err: any) {
      setAiInsight(err.message || "Gagal mengakses batin digital.");
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (type: string) => {
    setLoading(true); setAiInsight(''); setGeneratedArt(null);
    try {
      const insight = await getCulturalSynthesis(`Risalah mendalam sejarah aksara ${type} di Nusantara. Pallawa hingga lokal. Gaya waskita agung puitis tanpa simbol bintang.`);
      setAiInsight(insight);
    } catch (err: any) {
      setAiInsight(err.message || "Sanad sejarah terputus.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => { navigator.clipboard.writeText(sundaResult); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20 px-0 md:px-10 pt-8 bg-stone-950 min-h-screen text-stone-100">
      <header className="space-y-4 px-4">
        <button onClick={() => onNavigate(AppView.HOME)} className="flex items-center gap-2 text-stone-500 hover:text-amber-500 transition-colors mb-6 group">
          <div className="p-2 rounded-full group-hover:bg-amber-900/20 transition-colors"><Home size={18} /></div>
          <span className="font-bold uppercase tracking-widest text-[10px]">Beranda</span>
        </button>
        <div className="flex items-center gap-4">
          <div className="p-4 bg-stone-900 border border-stone-800 rounded-2xl text-amber-500 shadow-2xl"><Feather size={32} /></div>
          <div>
            <h2 className="text-4xl md:text-5xl font-heritage font-bold text-white text-glow-amber tracking-tight uppercase">Aksara Waskita</h2>
            <p className="text-stone-500 uppercase text-[10px] tracking-[0.4em] font-black mt-1">Transformasi Teks & Kaligrafi Nusantara</p>
          </div>
        </div>
      </header>

      <div className="flex flex-wrap gap-2 px-4 md:px-0 overflow-x-auto pb-4 scrollbar-hide">
        {['history', 'generator', 'neptu'].map((t) => (
          <button key={t} onClick={() => { setActiveTab(t as AksaraTab); setAiInsight(''); setGeneratedArt(null); setInputText(localStorage.getItem('waskita_user') || ''); }} className={`shrink-0 flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${activeTab === t ? 'bg-amber-600 text-stone-950 border-amber-600 shadow-xl' : 'bg-stone-900/40 border-stone-800 text-stone-500 hover:text-stone-300'}`}>
            {t === 'history' ? 'Sanad Sejarah' : t === 'generator' ? 'Konversi & Kaligrafi' : 'Neptu Aksara'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-0 md:px-0">
        <div className="lg:col-span-4 space-y-8 px-4 md:px-0">
          <div className="p-8 bg-stone-900/40 rounded-[40px] border border-stone-800 space-y-8 shadow-inner backdrop-blur-md">
            {activeTab === 'neptu' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-heritage font-bold text-white border-b border-stone-800 pb-4">Numerologi Batin</h3>
                <div className="space-y-2"><label className="text-[10px] font-black text-stone-500 uppercase tracking-widest">Masukkan Nama / Kata</label><input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Siliwangi..." className="w-full bg-stone-950 border border-stone-800 rounded-xl p-4 text-white focus:border-amber-600 outline-none shadow-inner placeholder:text-stone-800" /></div>
              </div>
            )}
            {activeTab === 'history' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-heritage font-bold text-white border-b border-stone-800 pb-4">Indeks Aksara</h3>
                <div className="grid grid-cols-1 gap-2">
                  {N_SCRIPTS.map((type) => (
                    <button key={type} onClick={() => fetchHistory(type)} className="w-full text-left p-4 bg-stone-950/50 border border-stone-800 rounded-xl text-stone-300 text-[10px] font-bold uppercase tracking-widest hover:border-amber-600 transition-all group flex items-center justify-between">
                      {type} <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            )}
            {activeTab === 'generator' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-heritage font-bold text-white border-b border-stone-800 pb-4">Konfigurator</h3>
                <div className="space-y-6">
                  <div className="space-y-2"><label className="text-[10px] font-black text-stone-500 uppercase tracking-widest">Pilih Aksara</label><select value={aksaraType} onChange={(e) => setAksaraType(e.target.value)} className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs font-bold text-white focus:border-amber-600 outline-none">{N_SCRIPTS.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                  <div className="space-y-2"><label className="text-[10px] font-black text-stone-500 uppercase tracking-widest">Teks Latin</label><input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Tulis kata..." className="w-full bg-stone-950 border border-stone-800 rounded-xl p-4 text-white text-sm focus:border-amber-600 outline-none shadow-inner" /></div>
                  {aksaraType === 'Aksara Sunda (Kaganga)' && sundaResult && (
                    <div className="space-y-4 animate-in fade-in duration-300"><label className="text-[10px] font-black text-stone-500 uppercase tracking-widest flex items-center justify-between">Hasil Kaganga <button onClick={handleCopy} className="text-amber-600 hover:text-amber-500 flex items-center gap-1">{copied ? <Check size={12} /> : <Copy size={12} />} {copied ? 'Tersalin' : 'Salin'}</button></label><div className="w-full bg-stone-950 border border-stone-800 rounded-xl p-8 text-4xl md:text-6xl text-white font-heritage text-center break-words shadow-inner">{sundaResult}</div></div>
                  )}
                  <button onClick={handleGenerateArt} disabled={loading || !inputText.trim()} className="w-full py-6 bg-stone-100 hover:bg-white text-stone-950 font-black rounded-2xl shadow-2xl transition-all uppercase tracking-widest text-[11px]">{loading ? <Loader2 className="animate-spin mx-auto" /> : "TENUN KALIGRAFI AI"}</button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-8 px-0">
          <div className="p-0 md:p-16 glass-panel md:rounded-[60px] border-y md:border border-stone-800 bg-stone-900/20 h-full min-h-[600px] flex flex-col shadow-2xl relative">
            <div className="flex items-center gap-4 text-amber-500 mb-10 border-b border-stone-800 pb-8 px-6 pt-8 md:pt-0 md:px-0">
               <Sparkles size={28} className="animate-pulse" /><h3 className="font-heritage text-2xl md:text-5xl font-bold uppercase tracking-wider">Hasil Waskita</h3>
            </div>
            <div className="flex-1 w-full px-0">
              {loading && !aiInsight ? (
                <div className="h-full flex flex-col items-center justify-center space-y-8 py-20 px-6"><Loader2 className="animate-spin text-amber-600" size={48} /><p className="text-amber-600 font-heritage italic text-2xl animate-pulse">Membedah sanad...</p></div>
              ) : (
                <div className="space-y-12 animate-in fade-in duration-1000 px-0">
                  {activeTab === 'neptu' && neptuResult && (
                    <div className="flex flex-col gap-8 px-4 md:px-0">
                      <div className="p-12 bg-stone-950/50 border border-stone-800 rounded-[40px] flex flex-col items-center justify-center shadow-inner"><p className="text-[10px] font-black text-stone-600 uppercase tracking-[0.3em] mb-4">Energi Numerologi</p><span className="text-8xl md:text-[10rem] font-heritage font-bold text-white text-glow-amber">{neptuResult.total}</span></div>
                      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide justify-center">{neptuResult.matched.map((m, i) => (<div key={i} className="px-8 py-6 bg-stone-950 border border-stone-800 rounded-3xl text-white flex flex-col items-center min-w-[100px] shadow-xl"><span className="text-4xl font-heritage mb-2">{m}</span><span className="text-[10px] text-amber-600 font-black uppercase tracking-widest">{AKSARA_NEPTU[m]}</span></div>))}</div>
                    </div>
                  )}
                  {generatedArt && activeTab === 'generator' && (
                    <div className="p-1 bg-stone-900 border border-stone-800 md:rounded-[40px] overflow-hidden shadow-2xl mx-0 md:mx-0"><img src={generatedArt} alt="Aksara Calligraphy" className="w-full h-auto grayscale opacity-40 brightness-75 transition-all duration-1000" /></div>
                  )}
                  <div className="text-stone-100 leading-relaxed italic text-justify text-lg md:text-4xl whitespace-pre-wrap font-medium p-6 px-[1px] md:p-20 bg-stone-950/50 md:rounded-[40px] border-y md:border border-stone-800 shadow-inner">
                    {aiInsight || <div className="h-full flex flex-col items-center justify-center text-stone-800 space-y-6 opacity-30 py-20"><Feather size={80} /><p className="font-heritage text-2xl italic text-center">Pilih aksara atau masukkan teks untuk menyingkap waskita.</p></div>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AksaraWaskitaView;
