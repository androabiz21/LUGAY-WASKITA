
import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Loader2, Sparkles, AlertCircle, Home, SwitchCamera, RefreshCw, Hand, User, Calendar, Heart } from 'lucide-react';
import { analyzePalmistry } from '../services/gemini.ts';
import ShareResult from '../components/ShareResult.tsx';
import { AppView } from '../types.ts';

const PalmistryView: React.FC<{ onNavigate: (view: AppView) => void }> = ({ onNavigate }) => {
  const [userName, setUserName] = useState(localStorage.getItem('waskita_user') || '');
  const [birthDate, setBirthDate] = useState('');
  const [motherName, setMotherName] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = async (mode: 'user' | 'environment' = facingMode) => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      setIsCameraActive(false);
      alert("Gagal mengakses kamera. Mohon periksa izin perangkat.");
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

  const toggleCamera = async () => {
    const newMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newMode);
    if (isCameraActive) { stopCamera(); await startCamera(newMode); }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      ctx?.drawImage(videoRef.current, 0, 0);
      setImage(canvasRef.current.toDataURL('image/jpeg'));
      stopCamera();
    }
  };

  const handleAnalyze = async () => {
    if (!image || !userName.trim()) {
      alert("Mohon lengkapi nama and ambil foto rajah tangan.");
      return;
    }
    setLoading(true);
    setAnalysis('');
    
    try {
      const base64Data = image.split(',')[1];
      const result = await analyzePalmistry(base64Data);
      setAnalysis(result);
    } catch (err: any) {
      setAnalysis(err.message || "Gagal menyingkap rajah batin. Sila coba kembali.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { return () => stopCamera(); }, []);

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20 px-0 md:px-10 pt-8 bg-stone-950 min-h-screen text-stone-100">
      <style>{`
        @keyframes scanPalm { 0% { top: 0%; } 50% { top: 100%; } 100% { top: 0%; } }
        .scan-line-palm { position: absolute; left: 0; width: 100%; height: 4px; background: linear-gradient(to bottom, transparent, #d97706, transparent); box-shadow: 0 0 20px 2px rgba(217, 119, 6, 0.8); animation: scanPalm 3s ease-in-out infinite; z-index: 25; }
      `}</style>
      
      <header className="space-y-4 px-4">
        <button onClick={() => onNavigate(AppView.HOME)} className="flex items-center gap-2 text-stone-500 hover:text-amber-500 transition-colors mb-6 group"><div className="p-2 rounded-full group-hover:bg-amber-900/20 transition-colors"><Home size={18} /></div><span className="font-bold uppercase tracking-widest text-[10px]">Beranda</span></button>
        <div className="flex items-center gap-4">
          <div className="p-4 bg-stone-900 border border-stone-800 rounded-2xl text-amber-500 shadow-2xl"><Hand size={32} /></div>
          <div>
            <h2 className="text-3xl md:text-5xl font-heritage font-bold text-white text-glow-amber tracking-tight uppercase leading-none">Rajah Leungeun</h2>
            <p className="text-stone-500 uppercase text-[10px] tracking-[0.4em] font-black mt-1 text-left">Nyungsi Karsa Melalui Guratan Tangan</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 px-0">
        <div className="xl:col-span-4 px-4 space-y-8">
          <div className="p-8 bg-stone-900/40 rounded-[40px] border border-stone-800 space-y-8 shadow-inner backdrop-blur-md">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-stone-500 uppercase tracking-widest flex items-center gap-2 px-1"><User size={12} className="text-amber-600" /> Nama Sadhaka</label>
                <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Masukkan nama..." className="w-full bg-stone-950 border border-stone-800 rounded-xl p-4 text-white focus:border-amber-600 outline-none shadow-inner text-sm font-bold" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-stone-500 uppercase tracking-widest flex items-center gap-2 px-1"><Calendar size={12} className="text-amber-600" /> Tgl Lahir</label>
                  <input type="text" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} placeholder="17-08-1945" className="w-full bg-stone-950 border border-stone-800 rounded-xl p-4 text-white focus:border-amber-600 outline-none shadow-inner text-xs font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-stone-500 uppercase tracking-widest flex items-center gap-2 px-1"><Heart size={12} className="text-rose-800" /> Nama Ibu</label>
                  <input type="text" value={motherName} onChange={(e) => setMotherName(e.target.value)} placeholder="Nama Ibu..." className="w-full bg-stone-950 border border-stone-800 rounded-xl p-4 text-white focus:border-amber-600 outline-none shadow-inner text-xs font-bold" />
                </div>
              </div>
            </div>

            <div className="aspect-[3/4] rounded-[40px] border-2 border-dashed border-stone-800 flex flex-col items-center justify-center transition-all overflow-hidden relative bg-stone-950 shadow-inner">
              {loading && <div className="scan-line-palm" />}
              {!image && !isCameraActive && (
                <div className="text-center p-8 space-y-6">
                  <div className="w-20 h-20 bg-stone-900 rounded-3xl flex items-center justify-center text-stone-700 mx-auto border border-stone-800"><Camera size={32} /></div>
                  <div className="space-y-1"><p className="text-stone-300 font-bold uppercase tracking-widest text-[10px]">Cermin Rajah</p><p className="text-stone-700 text-[10px] italic">Tangkap telapak tangan Anda.</p></div>
                  <div className="flex gap-4 w-full"><button onClick={() => startCamera()} className="flex-1 py-4 bg-amber-600 text-stone-950 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-transform">KAMERA</button><button onClick={() => fileInputRef.current?.click()} className="flex-1 py-4 bg-stone-800 border border-stone-700 rounded-xl text-stone-400 text-[10px] font-black uppercase tracking-widest">UNGGAH</button></div>
                </div>
              )}
              {isCameraActive && (
                <div className="absolute inset-0">
                  <video ref={videoRef} autoPlay playsInline className={`w-full h-full object-cover grayscale brightness-50 ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`} />
                  <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-6 z-20"><button onClick={toggleCamera} className="p-4 bg-black/40 backdrop-blur rounded-full text-stone-300 border border-stone-700 hover:bg-stone-800 transition-colors"><SwitchCamera size={24} /></button><button onClick={capturePhoto} className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center text-stone-950 shadow-lg active:scale-90"><Camera size={28} /></button><button onClick={stopCamera} className="p-4 bg-black/40 backdrop-blur rounded-full text-stone-300 border border-stone-700 hover:bg-rose-900 transition-colors"><RefreshCw size={24} /></button></div>
                </div>
              )}
              {image && (
                <div className="absolute inset-0 group">
                  <img src={image} alt="Palm" className="w-full h-full object-cover grayscale opacity-40 brightness-75" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]"><p className="text-amber-500 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Rajah Terkunci</p></div>
                  <button onClick={() => { setImage(null); setAnalysis(''); startCamera(); }} className="absolute top-6 right-6 p-3 bg-stone-900/80 rounded-full text-white shadow-xl hover:bg-amber-600 transition-all opacity-0 group-hover:opacity-100"><RefreshCw size={18} /></button>
                </div>
              )}
              <canvas ref={canvasRef} className="hidden" />
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onloadend = () => setImage(r.result as string); r.readAsDataURL(f); stopCamera(); } }} />
            </div>
            <button onClick={handleAnalyze} disabled={!image || loading || !userName.trim()} className="w-full py-6 bg-stone-100 hover:bg-white text-stone-950 font-black rounded-2xl shadow-2xl transition-all uppercase tracking-widest text-[11px]">{loading ? <Loader2 className="animate-spin mx-auto" /> : "SINGKAP SURATAN TANGAN"}</button>
          </div>
        </div>

        <div className="xl:col-span-8 space-y-6 pb-10 px-0">
          <div className="p-0 md:p-16 glass-panel md:rounded-[60px] border-y md:border border-stone-800 bg-stone-900/20 h-full min-h-[600px] flex flex-col shadow-2xl relative">
            <div className="flex items-center gap-4 text-amber-500 mb-10 border-b border-stone-800 pb-8 px-6 pt-8 md:pt-0 md:px-0 relative z-10">
               <Sparkles size={28} className="animate-pulse" /><h3 className="font-heritage text-2xl md:text-5xl font-bold uppercase tracking-wider">Risalah Waskita</h3>
            </div>
            <div className="flex-1 w-full px-0 overflow-visible relative z-10">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center space-y-8 py-20 px-6 text-center">
                  <Loader2 className="animate-spin text-amber-600" size={48} /><p className="text-amber-600 font-heritage italic text-2xl animate-pulse">Menghitung guratan takdir...</p>
                </div>
              ) : analysis ? (
                <div className="space-y-12 animate-in fade-in duration-1000 px-0 w-full">
                  <div className="text-stone-100 leading-relaxed italic text-justify text-lg md:text-5xl whitespace-pre-wrap font-medium p-6 md:p-20 bg-stone-950/50 md:rounded-[40px] border-y md:border border-stone-800 shadow-inner w-full overflow-visible">{analysis}</div>
                  <div className="px-6 md:px-0 pb-10"><ShareResult title="Risalah Rajah Tangan" text={analysis} context={`Sadhaka: ${userName}`} /></div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-stone-800 space-y-6 opacity-30 py-20 px-6 text-center">
                  <Hand size={80} /><p className="font-heritage text-2xl italic">Menanti bayangan rajah batin untuk disingkap...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PalmistryView;
