
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AppView } from './types.ts';
import { NAV_GROUPS, PATTERNS } from './constants.tsx';
import HomeView from './views/Home.tsx';
import LibraryView from './views/Library.tsx';
import CultureTreasuryView from './views/CultureTreasury.tsx';
import CalculatorView from './views/Calculator.tsx';
import OralTraditionView from './views/OralTradition.tsx';
import PalmistryView from './views/Palmistry.tsx';
import SilatView from './views/Silat.tsx';
import DreamInterpretationView from './views/DreamInterpretation.tsx';
import MatchmakingView from './views/Matchmaking.tsx';
import CardReadingView from './views/CardReading.tsx';
import AmalanView from './views/Amalan.tsx';
import FaceReadingView from './views/FaceReading.tsx';
import FengShuiView from './views/FengShui.tsx';
import MysticalDetectionView from './views/MysticalDetection.tsx';
import HealingView from './views/Healing.tsx';
import HandwritingReadingView from './views/HandwritingReading.tsx';
import AksaraWaskitaView from './views/AksaraWaskita.tsx';
import KhodamCheckView from './views/KhodamCheck.tsx';
import AncientKnowledgeView from './views/AncientKnowledge.tsx';
import GhostPortalView from './views/GhostPortal.tsx';
import ProfileView from './views/Profile.tsx';
import SplashScreen from './components/SplashScreen.tsx';
import { Menu, X, Maximize2, Minimize2, Monitor, LogOut } from 'lucide-react';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<AppView>(AppView.HOME);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [userConfig, setUserConfig] = useState<{ userName: string } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Sync state dengan event asli fullscreen browser
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, []);

  const handleLogout = () => {
    if (confirm("Apakah Anda ingin menutup gerbang waskita? Kredensial akan tetap tersimpan di perangkat ini.")) {
      setIsStarted(false);
      setUserConfig(null);
      if (document.fullscreenElement) document.exitFullscreen();
    }
  };

  useEffect(() => {
    const mainContent = document.getElementById('main-scroll-area');
    if (mainContent) mainContent.scrollTop = 0;
  }, [activeView]);

  const CurrentView = useMemo(() => {
    switch (activeView) {
      case AppView.HOME: return <HomeView onNavigate={setActiveView} />;
      case AppView.LIBRARY: return <LibraryView onNavigate={setActiveView} />;
      case AppView.CULTURE_TREASURY: return <CultureTreasuryView onNavigate={setActiveView} />;
      case AppView.CALCULATOR: return <CalculatorView onNavigate={setActiveView} />;
      case AppView.ORAL_TRADITION: return <OralTraditionView onNavigate={setActiveView} />;
      case AppView.PALMISTRY: return <PalmistryView onNavigate={setActiveView} />;
      case AppView.SILAT: return <SilatView onNavigate={setActiveView} />;
      case AppView.DREAM: return <DreamInterpretationView onNavigate={setActiveView} />;
      case AppView.MATCHMAKING: return <MatchmakingView onNavigate={setActiveView} />;
      case AppView.CARD_READING: return <CardReadingView onNavigate={setActiveView} />;
      case AppView.AMALAN: return <AmalanView onNavigate={setActiveView} />;
      case AppView.FACE_READING: return <FaceReadingView onNavigate={setActiveView} />;
      case AppView.FENG_SHUI: return <FengShuiView onNavigate={setActiveView} />;
      case AppView.MYSTICAL_DETECTION: return <MysticalDetectionView onNavigate={setActiveView} />;
      case AppView.HEALING: return <HealingView onNavigate={setActiveView} />;
      case AppView.HANDWRITING_READING: return <HandwritingReadingView onNavigate={setActiveView} />;
      case AppView.AKSARA_WASKITA: return <AksaraWaskitaView onNavigate={setActiveView} />;
      case AppView.KHODAM_CHECK: return <KhodamCheckView onNavigate={setActiveView} />;
      case AppView.ANCIENT_KNOWLEDGE: return <AncientKnowledgeView onNavigate={setActiveView} />;
      case AppView.GHOST_PORTAL: return <GhostPortalView onNavigate={setActiveView} />;
      case AppView.PROFILE: return <ProfileView onNavigate={setActiveView} />;
      default: return <HomeView onNavigate={setActiveView} />;
    }
  }, [activeView]);

  return (
    <div className="group/app h-screen w-full flex flex-col md:flex-row relative bg-stone-950 overflow-hidden text-stone-100 font-sans">
      {!isStarted && (
        <SplashScreen 
          onEnter={(config) => {
            setUserConfig(config);
            setIsStarted(true);
          }} 
        />
      )}
      
      <div 
        className="fixed inset-0 opacity-[0.04] pointer-events-none z-0 grayscale invert" 
        style={{ 
          backgroundImage: `url("${PATTERNS.megaMendung}")`,
          backgroundSize: '400px auto',
          backgroundRepeat: 'repeat',
        }}
      />
      
      {/* Mobile Header */}
      <header className={`
        md:hidden flex items-center justify-between p-4 sticky top-0 z-[60] shrink-0 transition-all duration-300
        ${isSidebarOpen 
          ? 'bg-stone-900 border-b border-stone-800' 
          : 'bg-stone-950/90 backdrop-blur-md border-b border-stone-900 shadow-xl'}
      `}>
        <button 
          onClick={() => setActiveView(AppView.HOME)}
          className="flex items-center gap-3 active:scale-95 transition-transform"
        >
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-blue-900/20">G</div>
          <div>
            <span className="font-heritage text-sm font-bold tracking-tight text-white block leading-none text-left text-glow-amber">GALURA LUGAY KANCANA</span>
            <span className="text-[7px] uppercase tracking-[0.4em] font-black text-blue-500 mt-1 block">Waskita Pasundan</span>
          </div>
        </button>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleFullscreen}
            className={`p-2.5 rounded-xl border transition-all ${isFullscreen ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-stone-900 border-stone-800 text-stone-500'}`}
          >
            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-2.5 rounded-xl transition-all duration-300 ${isSidebarOpen ? 'bg-blue-600 text-white' : 'bg-stone-900 border border-stone-800 text-stone-100 hover:bg-stone-800'}`}
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <nav className={`
        fixed md:relative z-[55] h-full w-72 bg-stone-950/50 backdrop-blur-xl border-r border-stone-900 transition-all duration-500 ease-in-out
        ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
        flex flex-col
      `}>
        <div className="p-8 hidden md:block shrink-0">
          <button 
            onClick={() => setActiveView(AppView.HOME)}
            className="flex items-center gap-4 mb-2 hover:opacity-80 transition-opacity text-left"
          >
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-blue-900/30">G</div>
            <div>
              <h1 className="font-heritage text-sm font-bold text-white tracking-tight text-glow-amber leading-tight uppercase">Galura Lugay</h1>
              <p className="text-[8px] uppercase tracking-[0.4em] font-black text-blue-500">Waskita Pasundan</p>
            </div>
          </button>
        </div>

        {/* User Info Tooltip in Sidebar */}
        {userConfig && (
          <div className="px-6 mb-4">
             <div className="p-4 bg-blue-900/10 border border-blue-900/20 rounded-2xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-black text-[10px] text-white uppercase">
                  {userConfig.userName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[8px] font-black text-stone-500 uppercase tracking-widest">Inohong Aktif</p>
                  <p className="text-[10px] font-bold text-white truncate">{userConfig.userName}</p>
                </div>
             </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-8 scrollbar-hide">
          {NAV_GROUPS.map((group, gIdx) => (
            <div key={gIdx} className="space-y-2">
              <h3 className="px-2 text-[10px] font-black uppercase tracking-[0.2em] text-stone-600 border-b border-stone-900 pb-1.5 mb-2">
                {group.label}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveView(item.id as AppView);
                      setIsSidebarOpen(false);
                    }}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group
                      ${activeView === item.id 
                        ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/20' 
                        : 'text-stone-400 hover:bg-stone-900 hover:text-stone-100 border border-transparent hover:border-stone-800'}
                    `}
                  >
                    <div className={activeView === item.id ? 'text-white' : 'opacity-60 transition-opacity group-hover:opacity-100'}>{item.icon}</div>
                    <span className="font-bold text-xs tracking-wide">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Sidebar with Fullscreen Control & Logout */}
        <div className="p-4 shrink-0 space-y-3">
          <div className="flex gap-2">
            <button 
              onClick={toggleFullscreen}
              className={`
                flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all group
                ${isFullscreen 
                  ? 'bg-blue-600/10 border-blue-500/30 text-blue-400' 
                  : 'bg-stone-900/40 border-stone-800 text-stone-500 hover:border-stone-700 hover:text-stone-300'}
              `}
            >
              {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              <span className="font-black text-[8px] uppercase tracking-widest">{isFullscreen ? 'Kecil' : 'Full'}</span>
            </button>
            <button 
              onClick={handleLogout}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-rose-900/10 border border-rose-900/30 text-rose-500 rounded-xl hover:bg-rose-900/20 transition-all uppercase font-black text-[8px] tracking-widest"
            >
              <LogOut size={14} />
              Keluar
            </button>
          </div>

          <div className="p-3 rounded-xl bg-stone-900/50 border border-stone-800 text-[8px] text-stone-600 leading-relaxed italic text-center">
            &copy; 2026 GALURA LUGAY KANCANA <br/> 
            <span className="font-bold text-stone-500">Waskita Pasundan Digital</span>
          </div>
        </div>
      </nav>

      <main 
        id="main-scroll-area"
        className="flex-1 overflow-y-auto relative z-10 bg-stone-950 scroll-smooth"
      >
        <div className="w-full mx-auto min-h-full px-0">
           {isStarted && (
             <div key={activeView} className="view-transition">
                {CurrentView}
             </div>
           )}
        </div>
      </main>
    </div>
  );
};

export default App;
