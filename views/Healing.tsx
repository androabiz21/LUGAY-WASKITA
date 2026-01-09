
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Activity, Sparkles, Loader2, Info, Heart, ShieldAlert, Zap, Droplet, Ghost, Calendar, Waves, Flame, Mountain, Wind, Camera, RefreshCw, Upload, Sun, SwitchCamera, Home } from 'lucide-react';
import { generateHealingProtocol, getMysticalProtection, analyzeAura } from '../services/gemini.ts';
import { calculateWeton } from '../services/calculator.ts';
import { AppView } from '../types.ts';
import ShareResult from '../components/ShareResult.tsx';

const HealingView: React.FC<{ onNavigate: (view: AppView) => void }> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'healing' | 'protection' | 'aura'>('healing');
  const [userName, setUserName] = useState('');
  const [condition, setCondition] = useState('');
  const [birthDate, setBirthDate] = useState(''); 
  const [healingType, setHealingType] = useState<'medis' | 'non-medis'>('medis');
  const [image, setImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = async (mode: 'user' | 'environment' = facingMode) => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
        };
      }
    } catch (err) {
      setIsCameraActive(false);
      alert("Gagal mengakses kamera.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context && video.videoWidth > 0) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        if (facingMode === 'user') {
          context.translate(canvas.width, 0);
          context.scale(-1, 1);
        }
        
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        setImage(dataUrl);
        stopCamera();
      }
    }
  };

  const handleAction = async () => {
    if (activeTab !== 'aura' && (!condition.trim() || !userName.trim())) { alert("Lengkapi data."); return; }
    setLoading(true); setResult('');
    try {
      let res = '';
      if (activeTab === 'healing') res = await generateHealingProtocol(userName, condition, healingType);
      else if (activeTab === 'protection') res = await getMysticalProtection(userName, condition);
      else { const b64 = image!.split(',')[1]; res = await analyzeAura(b64, userName); }
      setResult(res);
    } catch (err) { alert("Gagal."); } finally { setLoading(false); }
  };

  useEffect(() => { return () => stopCamera(); }, []);

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20 bg-stone-950 min-h-screen pt-8 text-stone-100">
      <header className="px-4 md:px-10">
        <button onClick={() => onNavigate(AppView.HOME)} className="flex items-center gap-2 text-stone-500 hover:text-amber-500 transition-colors mb-6 group">
          <div className="p-2 rounded-full group-hover:bg-amber-900/20 transition-colors"><Home size={18} /></div>
          <span className="font-bold uppercase tracking-widest text-[10px]">Beranda</span>
        </button>
        <div className="flex items-center gap-4">
          <div className="p-4 bg-stone-900 border border-stone-800 rounded-2xl text-teal-500 shadow-2xl"><Activity size={32} /></div>
          <div>
            <h2 className="text-3xl md:text-5xl font-heritage font-bold text-white text-glow-amber tracking-tight uppercase">Usada Waskita</h2>
            <p className="text-stone-500 uppercase text-[10px] tracking-[0.4em] font-black mt-1">Kearifan Penyembuhan & Energi Nusantara</p>
          </div>
        </div>
      </header>

      <div className="flex overflow-x-auto gap-2 p-1 bg-stone-900/40 rounded-2xl border border-stone-800 w-fit mx-4 md:mx-10 backdrop-blur-md mb-8">
        {(['healing', 'protection', 'aura'] as const).map(tab => (
          <button key={tab} onClick={() => { setActiveTab(tab); setResult(''); }} className={`shrink-0 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-amber-600 text-stone-950 shadow-xl' : 'text-stone-600 hover:text-stone-300'}`}>{tab === 'healing' ? 'Usada' : tab === 'protection' ? 'Pagar' : 'Aura'}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 px-4 md:px-10">
        <div className="lg:col-span-4 space-y-8">
          <div className="p-8 md:p-10 bg-stone-900/40 rounded-[40px] border border-stone-800 space-y-8 shadow-inner backdrop-blur-md">
            <div className="space-y-6">
              <div className="space-y-2"><label className="text-[10px] font-black text-stone-500 uppercase tracking-widest">Nama Pasien</label><input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Nama..." className="w-full bg-stone-950 border border-stone-800 rounded-xl p-4 text-white outline-none focus:border-teal-600 shadow-inner placeholder:text-stone-800" /></div>
              {activeTab === 'aura' ? (
                <div className="aspect-[3/4] bg-stone-950 rounded-[40px] border-2 border-dashed border-stone-800 overflow-hidden relative group shadow-inner">
                  {!image && !isCameraActive && <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-6"><Sun size={50} className="text-stone-800" /><div className="flex gap-2 w-full"><button onClick={() => startCamera()} className="flex-1 py-4 bg-amber-600 text-stone-950 rounded-xl text-[10px] font-black uppercase shadow-2xl active:scale-95">KAMERA</button><button onClick={() => fileInputRef.current?.click()} className="flex-1 py-4 bg-stone-800 border border-stone-700 text-stone-400 rounded-xl text-[10px] font-black uppercase">UNGGAH</button></div></div>}
                  {isCameraActive && <div className="absolute inset-0"><video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover grayscale brightness-50" /><div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-6 z-20"><button onClick={capturePhoto} className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center text-stone-950 shadow-lg active:scale-90"><Camera size={28} /></button><button onClick={stopCamera} className="p-4 bg-black/40 backdrop-blur rounded-full text-stone-300"><RefreshCw size={24} /></button></div></div>}
                  {image && <div className="absolute inset-0 group"><img src={image} alt="Aura" className="w-full h-full object-cover grayscale opacity-40 brightness-75" /><button onClick={() => { setImage(null); startCamera(); }} className="absolute top-4 right-4 p-3 bg-stone-900/80 rounded-full text-white shadow-xl opacity-0 group-hover:opacity-100"><RefreshCw size={18} /></button></div>}
                  
                  <canvas ref={canvasRef} className="hidden" />
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onloadend = () => setImage(r.result as string); r.readAsDataURL(f); stopCamera(); } }} />
                </div>
              ) : (
                <div className="space-y-6"><div className="space-y-2"><label className="text-[10px] font-black text-stone-500 uppercase tracking-widest">Hajat / Keluhan</label><textarea value={condition} onChange={(e) => setCondition(e.target.value)} placeholder="Tuliskan di sini..." className="w-full h-48 bg-stone-950 border border-stone-800 rounded-2xl p-6 text-white outline-none focus:border-teal-600 shadow-inner italic placeholder:text-stone-800" /></div></div>
              )}
            </div>
            <button onClick={handleAction} disabled={loading || (activeTab === 'aura' ? !image : !condition)} className={`w-full py-6 font-black rounded-2xl transition-all flex items-center justify-center gap-3 shadow-2xl uppercase tracking-widest text-[11px] ${activeTab === 'aura' ? 'bg-amber-600 text-stone-950 hover:bg-amber-500' : 'bg-stone-100 hover:bg-white text-stone-950'}`}>
              {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={18} className="text-teal-600" />} {activeTab === 'aura' ? 'PINDAI AURA' : activeTab === 'healing' ? 'SINGKAP USADA' : 'CARI PAGAR GHOIB'}
            </button>
          </div>
        </div>

        <div className="lg:col-span-8 pb-10 px-0">
          <div className="p-0 md:p-16 glass-panel md:rounded-[60px] border border-stone-800 bg-stone-900/20 h-full min-h-[600px] flex flex-col shadow-2xl relative overflow-hidden">
            <div className="flex items-center gap-4 text-amber-500 mb-10 border-b border-stone-800 pb-8 px-6 pt-8 md:pt-0 md:px-0">
               <Sparkles size={28} className="animate-pulse" /><h3 className="font-heritage text-2xl md:text-5xl font-bold uppercase tracking-wider">{activeTab === 'aura' ? 'Interpretasi Aura' : 'Risalah Usada'}</h3>
            </div>
            <div className="flex-1 w-full px-0">
              {loading ? <div className="h-full flex flex-col items-center justify-center space-y-8 py-20 px-6"><Loader2 className="animate-spin text-teal-600" size={48} /><p className="text-teal-500 font-heritage italic text-2xl animate-pulse">Meresonansi frekuensi batin...</p></div> : result ? (
                <div className="animate-in fade-in duration-1000 px-0 space-y-12">
                   <div className="text-stone-100 leading-relaxed italic text-justify text-lg md:text-5xl whitespace-pre-wrap font-medium p-6 md:p-16 bg-stone-950/50 md:rounded-[40px] border-y md:border border-stone-800 shadow-inner w-full overflow-visible">{result}</div>
                   <div className="px-6 md:px-0 pb-10"><ShareResult title="Risalah Usada Waskita" text={result} /></div>
                </div>
              ) : <div className="h-full flex flex-col items-center justify-center text-stone-800 space-y-6 opacity-30 py-20"><Droplet size={80} className="animate-bounce" /><p className="font-heritage text-2xl italic text-center">Menanti telaga waskita...</p></div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealingView;
