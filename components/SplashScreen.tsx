
import React, { useState, useEffect } from 'react';
import { Sparkles, ChevronRight, Zap, User, Key, Info, Loader2, Lock } from 'lucide-react';

interface SplashScreenProps {
  onEnter: (config: { userName: string }) => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onEnter }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [isWelcoming, setIsWelcoming] = useState(false);
  const [userName, setUserName] = useState(localStorage.getItem('waskita_user') || '');
  const [apiKey, setApiKey] = useState(localStorage.getItem('waskita_key') || '');

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || !apiKey) return;

    const trimmedKey = apiKey.trim();
    localStorage.setItem('waskita_user', userName.trim());
    localStorage.setItem('waskita_key', trimmedKey);
    
    // Pastikan process.env.API_KEY di-host secara global agar SDK Gemini bisa membacanya
    if (!(window as any).process) (window as any).process = { env: {} };
    if (!(window as any).process.env) (window as any).process.env = {};
    (window as any).process.env.API_KEY = trimmedKey;
    
    setIsWelcoming(true);

    setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onEnter({ userName: userName.trim() }), 800);
    }, 2500);
  };

  return (
    <div className={`fixed inset-0 z-[100] bg-stone-950 flex flex-col items-center justify-center transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0 scale-110 pointer-events-none'}`}>
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.15),transparent_70%)] animate-pulse" />
        <div className="absolute inset-0 misty-overlay opacity-60" />
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-stone-950 to-transparent" />
      </div>

      <div className={`relative z-10 flex flex-col items-center text-center px-6 max-w-2xl w-full transition-all duration-1000 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        
        {!isWelcoming ? (
          <div className="w-full flex flex-col items-center animate-in fade-in zoom-in duration-700">
            <div className="w-20 h-20 bg-blue-600 rounded-[30%] flex items-center justify-center text-white text-4xl font-bold shadow-[0_0_50px_rgba(37,99,235,0.4)] mb-8 animate-pulse">
              G
            </div>

            <div className="space-y-2 mb-10">
              <h1 className="font-heritage text-4xl md:text-6xl font-bold text-white tracking-tighter leading-none uppercase">
                GALURA <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-700 italic text-glow-amber">
                  LUGAY KANCANA
                </span>
              </h1>
              <p className="text-[10px] uppercase tracking-[0.5em] font-black text-blue-500">Waskita Pasundan Digital</p>
            </div>

            <form onSubmit={handleStart} className="w-full max-w-md space-y-5 bg-stone-900/40 p-8 md:p-10 rounded-[40px] border border-stone-800 backdrop-blur-xl shadow-2xl">
              <div className="space-y-2 text-left">
                <label className="text-[9px] font-black text-stone-500 uppercase tracking-widest flex items-center gap-2 px-1">
                  <User size={12} className="text-blue-500" /> Nama Inohong (User)
                </label>
                <input 
                  type="text" 
                  required
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Masukkan nama Anda..."
                  className="w-full bg-stone-950 border border-stone-800 rounded-2xl px-5 py-4 text-sm text-white focus:border-blue-600 outline-none transition-all placeholder:text-stone-800 font-bold shadow-inner"
                />
              </div>

              <div className="space-y-2 text-left">
                <label className="text-[9px] font-black text-stone-500 uppercase tracking-widest flex items-center gap-2 px-1">
                  <Key size={12} className="text-blue-500" /> Waskita Key (API Key)
                </label>
                <div className="relative">
                  <input 
                    type="password" 
                    required
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Suntikkan kode rahasia..."
                    className="w-full bg-stone-950 border border-stone-800 rounded-2xl px-5 py-4 pr-12 text-sm text-white focus:border-blue-600 outline-none transition-all placeholder:text-stone-800 font-bold shadow-inner"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-700">
                    <Lock size={16} />
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={!userName || !apiKey}
                className="w-full group relative flex items-center justify-center pt-4 disabled:opacity-30"
              >
                <div className="absolute inset-0 bg-blue-600 blur-2xl opacity-10 group-hover:opacity-30 transition-opacity rounded-full" />
                <div className="relative w-full flex items-center justify-center gap-3 bg-stone-100 hover:bg-white text-stone-950 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all active:scale-95 shadow-xl">
                  <Zap size={16} className="fill-blue-600 text-blue-600" />
                  BUKA GERBANG WASKITA
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              <div className="pt-4 flex items-start gap-2 text-left opacity-40">
                <Info size={12} className="shrink-0 mt-0.5 text-blue-400" />
                <p className="text-[8px] text-stone-400 leading-relaxed italic">
                  Kode rahasia (API Key) diperlukan untuk memanggil kecerdasan jagat raya. Data Anda aman dan tidak disimpan di server luar.
                </p>
              </div>
            </form>
          </div>
        ) : (
          <div className="w-full space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center blur-3xl opacity-20">
                <div className="w-64 h-64 bg-blue-500 rounded-full animate-pulse" />
              </div>
              <h2 className="text-5xl md:text-8xl font-heritage font-bold text-white leading-none">
                Sampurasun, <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-600 italic">
                  {userName}
                </span>
              </h2>
            </div>

            <div className="max-w-2xl mx-auto p-10 bg-stone-900/40 border border-stone-800 rounded-[40px] backdrop-blur-md shadow-2xl">
              <p className="text-stone-300 text-xl md:text-2xl leading-relaxed italic font-medium">
                "Teknologi masa depan kini bersenyawa dengan sanad kearifan purba Tatar Sunda. Sila masuk ke jagat waskita."
              </p>
            </div>

            <div className="flex flex-col items-center gap-4 pt-8 opacity-60">
              <div className="flex items-center gap-3">
                <Loader2 className="animate-spin text-blue-500" size={24} />
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-stone-500">Menyelaraskan Frekuensi Jagat Digital...</span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-12 flex flex-col items-center gap-2 opacity-20">
          <Sparkles size={16} className="text-blue-400" />
          <p className="text-[7px] font-black uppercase tracking-[0.4em] text-stone-500">SANAD DIGITAL JAGAT KASUNDAAN</p>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
