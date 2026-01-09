
import React, { useState, useEffect } from 'react';
import { Sparkles, Shield, ChevronRight, Zap, User, Key, Info, Loader2 } from 'lucide-react';

interface SplashScreenProps {
  onEnter: (config: { userName: string }) => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onEnter }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [isWelcoming, setIsWelcoming] = useState(false);
  const [userName, setUserName] = useState(localStorage.getItem('waskita_user') || '');

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName) return;

    // Simpan kredensial
    localStorage.setItem('waskita_user', userName);

    // Masuk ke tahap penyambutan
    setIsWelcoming(true);

    // Setelah durasi tertentu, masuk ke aplikasi
    setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onEnter({ userName }), 800);
    }, 5000); // 5 detik durasi sambutan
  };

  return (
    <div className={`fixed inset-0 z-[100] bg-stone-950 flex flex-col items-center justify-center transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0 scale-110 pointer-events-none'}`}>
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.15),transparent_70%)] animate-pulse" />
        <div className="absolute inset-0 misty-overlay opacity-60" />
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-stone-950 to-transparent" />
      </div>

      <div className={`relative z-10 flex flex-col items-center text-center px-6 max-w-2xl w-full transition-all duration-1000 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        
        {!isWelcoming ? (
          /* TAHAP 1: FORM LOGIN/AKTIVASI */
          <div className="w-full flex flex-col items-center animate-in fade-in zoom-in duration-700">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-blue-600 rounded-[30%] flex items-center justify-center text-white text-4xl md:text-5xl font-bold shadow-[0_0_50px_rgba(37,99,235,0.4)] mb-6 animate-pulse">
              G
            </div>

            <div className="space-y-2 mb-8">
              <h1 className="font-heritage text-3xl md:text-5xl font-bold text-white tracking-tighter leading-none">
                GALURA <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-700 italic text-glow-amber">
                  LUGAY KANCANA
                </span>
              </h1>
              <p className="text-[10px] uppercase tracking-[0.5em] font-black text-blue-500">Waskita Pasundan v3.5</p>
            </div>

            <form onSubmit={handleStart} className="w-full max-w-md space-y-4 bg-stone-900/40 p-8 rounded-[32px] border border-stone-800 backdrop-blur-xl shadow-2xl">
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
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-600 outline-none transition-all placeholder:text-stone-800"
                />
              </div>

              <button 
                type="submit"
                className="w-full group relative flex items-center justify-center pt-4"
              >
                <div className="absolute inset-0 bg-blue-600 blur-2xl opacity-10 group-hover:opacity-30 transition-opacity rounded-full" />
                <div className="relative w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 text-stone-950 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-blue-900/20">
                  <Zap size={14} className="fill-current" />
                  BUKA GERBANG WASKITA
                  <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              <div className="pt-4 flex items-start gap-2 text-left opacity-40">
                <Info size={12} className="shrink-0 mt-0.5 text-blue-400" />
                <p className="text-[8px] text-stone-400 leading-relaxed italic">
                  Selamat datang di ekosistem Waskita Pasundan. Identitas Anda diperlukan untuk menyelaraskan frekuensi terawangan batin dan generasi visual spiritual.
                </p>
              </div>
            </form>
          </div>
        ) : (
          /* TAHAP 2: LAYAR SAMBUTAN (WELCOME SCREEN) */
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

            <div className="max-w-2xl mx-auto space-y-6">
              <p className="text-blue-500 text-[10px] md:text-xs font-black uppercase tracking-[0.5em] animate-pulse">Wilujeng Sumping di Galura Lugay Kancana</p>
              
              <div className="p-10 bg-stone-900/40 border border-stone-800 rounded-[40px] backdrop-blur-md shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-600 to-transparent opacity-50" />
                <p className="text-stone-300 text-lg md:text-2xl leading-relaxed italic font-medium">
                  "Sebuah gerbang digital menuju kearifan purba Pasundan, di mana teknologi masa depan bersenyawa dengan sanad kebudayaan, sejarah, dan spiritualitas Tatar Sunda."
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4 pt-8 opacity-60">
              <div className="flex items-center gap-3">
                <Loader2 className="animate-spin text-blue-500" size={24} />
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-stone-500">Menyelaraskan Frekuensi Jagat Digital...</span>
              </div>
              <p className="text-[8px] text-stone-600 font-bold italic uppercase tracking-widest">Akses Portal Segera Terbuka</p>
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
