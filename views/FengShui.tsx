
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Camera, Upload, Loader2, Sparkles, RefreshCw, Layout, Home as HomeIcon, Store, Info, Zap, Eye, EyeOff, Wind, HelpCircle, X, ArrowUpRight, SwitchCamera, Home } from 'lucide-react';
import { analyzeFengShui } from '../services/gemini.ts';
import ShareResult from '../components/ShareResult.tsx';
import { AppView } from '../types.ts';

interface FengShuiZone {
  box_2d: number[];
  label: string;
  type: 'positive' | 'negative' | 'neutral';
  description: string;
}

const FengShuiView: React.FC<{ onNavigate: (view: AppView) => void }> = ({ onNavigate }) => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysisText, setAnalysisText] = useState('');
  const [zones, setZones] = useState<FengShuiZone[]>([]);
  const [selectedZone, setSelectedZone] = useState<FengShuiZone | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = async (mode: 'user' | 'environment' = facingMode) => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) { setIsCameraActive(false); alert("Gagal mengakses kamera."); }
  };

  const stopCamera = () => { if (videoRef.current?.srcObject) { (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop()); videoRef.current.srcObject = null; } setIsCameraActive(false); };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth; canvasRef.current.height = videoRef.current.videoHeight;
      ctx?.drawImage(videoRef.current, 0, 0); setImage(canvasRef.current.toDataURL('image/jpeg')); stopCamera();
    }
  };

  const handleAnalyze = async () => {
    if (!image) return; setLoading(true); setAnalysisText(''); setZones([]); setSelectedZone(null);
    try {
      const res = await analyzeFengShui(image.split(',')[1]);
      setAnalysisText(res.analysisText); setZones(res.zones || []);
    } catch (err: any) { alert(err.message || "Gagal memproses tata ruang."); } finally { setLoading(false); }
  };

  useEffect(() => { return () => stopCamera(); }, []);

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20 px-0 md:px-10 pt-8 bg-stone-950 min-h-screen text-stone-100">
      <header className="px-4">
        <button onClick={() => onNavigate(AppView.HOME)} className="flex items-center gap-2 text-stone-500 hover:text-amber-500 transition-colors mb-6 group"><div className="p-2 rounded-full group-hover:bg-amber-900/20 transition-colors"><Home size={18} /></div><span className="font-bold uppercase tracking-widest text-[10px]">Beranda</span></button>
        <div className="flex items-center gap-4">
          <div className="p-4 bg-stone-900 border border-stone-800 rounded-2xl text-amber-500 shadow-2xl shadow-black"><Layout size={32} /></div>
          <div>
            <h2 className="text-3xl md:text-5xl font-heritage font-bold text-white text-glow-amber tracking-tight uppercase leading-none">Tata Ruang</h2>
            <p className="text-stone-500 uppercase text-[10px] tracking-[0.4em] font-black mt-1 text-left">Harmonisasi Energi Batin & Bangunan</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 px-4 md:px-0">
        <div className="space-y-8">
          <div className="aspect-[3/4] bg-stone-950 rounded-[40px] border-2 border-dashed border-stone-800 overflow-hidden relative shadow-inner group">
            {!image && !isCameraActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center space-y-8">
                <Layout size={80} className="text-stone-800" />
                <div className="space-y-1"><p className="text-white font-bold uppercase tracking-widest text-[10px]">Cermin Lokasi</p><p className="text-stone-700 text-[10px] italic">Unggah foto denah atau sudut ruangan.</p></div>
                <div className="flex gap-4 w-full max-w-xs"><button onClick={() => startCamera()} className="flex-1 py-4 bg-amber-600 text-stone-950 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-transform">KAMERA</button><button onClick={() => fileInputRef.current?.click()} className="flex-1 py-4 bg-stone-800 border border-stone-700 rounded-xl text-stone-400 text-[10px] font-black uppercase">UNGGAH</button></div>
              </div>
            )}
            {isCameraActive && (
              <div className="absolute inset-0">
                <video ref={videoRef} autoPlay playsInline className={`w-full h-full object-cover grayscale brightness-50`} />
                <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-6 z-20"><button onClick={capturePhoto} className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center text-stone-950 shadow-lg active:scale-90 transition-transform"><Camera size={28} /></button><button onClick={stopCamera} className="p-4 bg-black/40 backdrop-blur rounded-full text-stone-300 border border-stone-700 hover:bg-rose-900 transition-colors"><RefreshCw size={24} /></button></div>
              </div>
            )}
            {image && (
              <div className="absolute inset-0">
                <img src={image} alt="Location" className={`w-full h-full object-cover transition-all duration-700 ${loading ? 'blur-md grayscale opacity-30' : 'grayscale opacity-40'}`} />
                {!loading && zones.map((zone, idx) => {
                  const [ymin, xmin, ymax, xmax] = zone.box_2d;
                  return (
                    <div key={idx} onClick={() => setSelectedZone(zone)} className={`absolute border-2 cursor-pointer transition-all ${zone.type === 'positive' ? 'border-teal-500 bg-teal-500/10' : 'border-rose-500 bg-rose-500/10'}`} style={{ top: `${ymin/10}%`, left: `${xmin/10}%`, height: `${(ymax-ymin)/10}%`, width: `${(xmax-xmin)/10}%` }} />
                  );
                })}
              </div>
            )}
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onloadend = () => setImage(r.result as string); r.readAsDataURL(f); stopCamera(); } }} />
          </div>
          <button onClick={handleAnalyze} disabled={!image || loading} className="w-full py-6 bg-stone-100 hover:bg-white text-stone-950 font-black rounded-2xl shadow-2xl transition-all uppercase tracking-widest text-[11px]">{loading ? <Loader2 className="animate-spin mx-auto" /> : "SINGKAP TATA RUANG DIGITAL"}</button>
        </div>

        <div className="space-y-6 pb-10">
          <div className="p-0 md:p-12 glass-panel md:rounded-[60px] border-y md:border border-stone-800 bg-stone-900/20 h-full min-h-[500px] flex flex-col shadow-2xl relative">
            <div className="flex items-center gap-4 text-amber-500 mb-8 border-b border-stone-800 pb-8 pt-8 px-6 md:pt-0 md:px-0">
               <Sparkles size={28} className="animate-pulse" /><h3 className="font-heritage text-2xl md:text-5xl font-bold uppercase tracking-wider leading-none">Risalah Ruang</h3>
            </div>
            <div className="flex-1 w-full px-0">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center space-y-8 py-20 text-center px-6">
                  <Loader2 className="animate-spin text-amber-600" size={48} /><p className="text-amber-600 font-heritage italic text-2xl animate-pulse">Memetakan aliran prana dimensi...</p>
                </div>
              ) : selectedZone ? (
                <div className="animate-in fade-in duration-300 space-y-8 p-6 md:p-16">
                   <div className="flex items-center justify-between"><span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${selectedZone.type === 'positive' ? 'bg-teal-900/30 text-teal-400 border border-teal-800' : 'bg-rose-900/30 text-rose-400 border border-rose-800'}`}>{selectedZone.label}</span><button onClick={() => setSelectedZone(null)} className="p-2 text-stone-500 hover:text-white"><X size={20} /></button></div>
                   <p className="text-stone-100 text-lg md:text-4xl italic leading-relaxed text-justify font-medium">{selectedZone.description}</p>
                </div>
              ) : analysisText ? (
                <div className="space-y-12 animate-in fade-in duration-1000">
                  <div className="text-stone-100 text-lg md:text-4xl leading-relaxed italic text-justify font-medium whitespace-pre-wrap bg-stone-950/50 p-6 md:p-20 md:rounded-[40px] border-y md:border border-stone-800 shadow-inner w-full overflow-visible">{analysisText}</div>
                  <div className="px-6 md:px-0 pb-10"><ShareResult title="Risalah Tata Ruang Waskita" text={analysisText} /></div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-stone-800 space-y-6 opacity-30 py-20 px-6 text-center">
                  <Wind size={80} /><p className="font-heritage text-2xl italic leading-tight">Menanti pemetaan dimensi and aliran batin...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FengShuiView;
