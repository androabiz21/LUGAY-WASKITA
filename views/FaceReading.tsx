
import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Loader2, Sparkles, RefreshCw, UserCircle, SwitchCamera, Home, ScanFace, User, Calendar, Heart } from 'lucide-react';
import { analyzeFaceReading } from '../services/gemini.ts';
import ShareResult from '../components/ShareResult.tsx';
import { AppView } from '../types.ts';

const FaceReadingView: React.FC<{ onNavigate: (view: AppView) => void }> = ({ onNavigate }) => {
  const [name, setName] = useState(localStorage.getItem('waskita_user') || '');
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
      console.error("Camera Error:", err);
      alert("Gagal mengakses kamera. Mohon pastikan izin kamera diberikan.");
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
    if (isCameraActive) {
      stopCamera();
      await startCamera(newMode);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context && video.videoWidth > 0) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Mirror effect for user camera
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

  const handleAnalyze = async () => {
    if (!image || !name.trim() || !birthDate.trim() || !motherName.trim()) {
      alert("Mohon lengkapi seluruh data sanad batin.");
      return;
    }
    setLoading(true);
    setAnalysis('');
    
    try {
      const base64Data = image.split(',')[1];
      const result = await analyzeFaceReading(base64Data, name, birthDate, motherName);
      setAnalysis(result);
    } catch (err: any) {
      console.error(err);
      setAnalysis(err.message || "Gagal menembus tirai paras batin. Sila coba kembali.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20 px-0 md:px-6 pt-8 bg-stone-950 min-h-screen text-stone-100">
      <style>{`
        @keyframes scanFace {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
        .scan-line-face {
          position: absolute;
          left: 0;
          width: 100%;
          height: 6px;
          background: linear-gradient(to bottom, transparent, #f59e0b, transparent);
          box-shadow: 0 0 25px 4px rgba(245, 158, 11, 0.9);
          animation: scanFace 3.5s ease-in-out infinite;
          z-index: 30;
        }
      `}</style>

      <header className="px-4">
        <button onClick={() => onNavigate(AppView.HOME)} className="flex items-center gap-2 text-stone-500 hover:text-amber-500 transition-colors mb-6 group">
          <div className="p-2 rounded-full group-hover:bg-amber-900/20 transition-colors">
            <Home size={18} />
          </div>
          <span className="font-bold uppercase tracking-widest text-[10px]">Beranda</span>
        </button>
        <div className="flex items-center gap-4">
          <div className="p-4 bg-stone-900 border border-stone-800 rounded-2xl text-amber-500 shadow-2xl shadow-black">
            <ScanFace size={32} />
          </div>
          <div>
            <h2 className="text-3xl md:text-5xl font-heritage font-bold text-white text-glow-amber tracking-tight uppercase leading-none">Firasat Paras</h2>
            <p className="text-stone-500 uppercase text-[10px] tracking-[0.4em] font-black mt-1">Membaca Karakter Melalui Paras</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 px-0">
        <div className="xl:col-span-4 space-y-8 px-4">
          <div className="p-8 bg-stone-900/40 rounded-[40px] border border-stone-800 space-y-8 shadow-inner backdrop-blur-md">
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-stone-500 uppercase tracking-widest flex items-center gap-2">
                  <User size={12} className="text-amber-600" /> Nama Lengkap Sesuai Sanad
                </label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Contoh: Raden Gatotkaca..." 
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-4 text-white focus:border-amber-600 outline-none text-sm font-bold shadow-inner placeholder:text-stone-700" 
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-stone-500 uppercase tracking-widest flex items-center gap-2">
                    <Calendar size={12} className="text-amber-600" /> Tgl Lahir (HH-BB-TTTT)
                  </label>
                  <input 
                    type="text" 
                    value={birthDate} 
                    onChange={(e) => setBirthDate(e.target.value)} 
                    placeholder="Contoh: 17-08-1945" 
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-4 text-white focus:border-amber-600 outline-none text-sm font-bold shadow-inner placeholder:text-stone-700" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-stone-500 uppercase tracking-widest flex items-center gap-2">
                    <Heart size={12} className="text-rose-600" /> Nama Ibu Kandung
                  </label>
                  <input 
                    type="text" 
                    value={motherName} 
                    onChange={(e) => setMotherName(e.target.value)} 
                    placeholder="Contoh: Dewi Arimbi..." 
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-4 text-white focus:border-amber-600 outline-none text-sm font-bold shadow-inner placeholder:text-stone-700" 
                  />
                </div>
              </div>
            </div>

            <div className="aspect-[3/4] bg-stone-950 rounded-[40px] border-2 border-dashed border-stone-800 overflow-hidden relative shadow-inner">
              {loading && <div className="scan-line-face" />}
              
              {!image && !isCameraActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center space-y-8">
                  <UserCircle size={80} className="text-stone-800" />
                  <div className="space-y-2">
                    <p className="text-white font-bold uppercase tracking-widest text-xs">Pindai Citra Paras</p>
                    <p className="text-stone-600 text-xs italic">Cermin batin dalam digital.</p>
                  </div>
                  <div className="flex gap-4 w-full max-w-xs">
                    <button onClick={() => startCamera()} className="flex-1 py-4 bg-amber-600 text-stone-950 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-transform">KAMERA</button>
                    <button onClick={() => fileInputRef.current?.click()} className="flex-1 py-4 bg-stone-800 border border-stone-700 rounded-xl text-stone-400 text-[10px] font-black shadow-sm uppercase tracking-widest">UNGGAH</button>
                  </div>
                </div>
              )}
              
              {isCameraActive && (
                <div className="absolute inset-0">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted
                    className={`w-full h-full object-cover grayscale brightness-50 ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`} 
                  />
                  <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-6 z-20">
                    <button onClick={toggleCamera} className="p-4 bg-black/40 backdrop-blur rounded-full text-stone-300 border border-stone-700 transition-all hover:bg-stone-800"><SwitchCamera size={24} /></button>
                    <button onClick={capturePhoto} className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center text-stone-950 shadow-lg active:scale-90 transition-transform"><Camera size={28} /></button>
                    <button onClick={stopCamera} className="p-4 bg-black/40 backdrop-blur rounded-full text-stone-300 border border-stone-700 transition-all hover:bg-rose-900"><RefreshCw size={24} /></button>
                  </div>
                </div>
              )}

              {image && (
                <div className="absolute inset-0 group">
                  <img src={image} alt="Face" className="w-full h-full object-cover grayscale opacity-40 brightness-75" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[1px]">
                     <p className="text-amber-500 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Citra Terkunci</p>
                  </div>
                  <button 
                    onClick={() => { setImage(null); setAnalysis(''); startCamera(); }} 
                    className="absolute top-4 right-4 p-3 bg-stone-900/80 rounded-full text-white shadow-xl hover:bg-amber-600 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <RefreshCw size={18} />
                  </button>
                </div>
              )}
              
              <canvas ref={canvasRef} className="hidden" />
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onloadend = () => setImage(r.result as string); r.readAsDataURL(f); stopCamera(); } }} />
            </div>
            <button onClick={handleAnalyze} disabled={!image || loading || !name.trim()} className="w-full py-6 bg-stone-100 hover:bg-white text-stone-950 font-black rounded-2xl shadow-2xl transition-all uppercase tracking-widest text-[11px]">{loading ? <Loader2 className="animate-spin mx-auto" /> : "SINGKAP FIRASAT PARAS"}</button>
          </div>
        </div>

        <div className="xl:col-span-8 space-y-6 px-0 pb-10">
          <div className="p-0 md:p-12 glass-panel md:rounded-[60px] border-y md:border border-stone-800 bg-stone-900/20 min-h-[500px] flex flex-col shadow-2xl relative z-10">
            <div className="flex items-center gap-4 text-amber-500 mb-10 border-b border-stone-800 pb-8 px-6 pt-8 md:pt-0 md:px-0 relative z-10">
               <Sparkles size={28} className="animate-pulse" />
               <h3 className="font-heritage text-2xl md:text-3xl font-bold uppercase tracking-wider">Hasil Firasat Waskita</h3>
            </div>
            
            <div className="flex-1 w-full px-0 overflow-visible relative z-10">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center space-y-8 py-20 px-6 text-center">
                  <Loader2 className="animate-spin text-amber-600" size={48} />
                  <p className="text-amber-600 font-heritage italic text-2xl animate-pulse">Membedah guratan paras batin...</p>
                </div>
              ) : analysis ? (
                <div className="space-y-12 animate-in fade-in duration-1000 px-0 w-full">
                  <div className="text-stone-100 leading-relaxed italic text-justify text-lg md:text-5xl whitespace-pre-wrap font-medium p-6 md:p-16 bg-stone-950/50 md:rounded-[40px] border-y md:border border-stone-800 shadow-inner w-full overflow-visible">
                    {analysis}
                  </div>
                  <div className="px-6 md:px-0 pb-10">
                    <ShareResult title="Risalah Firasat Paras" text={analysis} context={`Sanad: ${name}`} />
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-stone-800 space-y-6 opacity-30 py-20">
                  <UserCircle size={80} />
                  <p className="font-heritage text-2xl italic text-center px-6">Menanti pantulan wajah untuk disingkap...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaceReadingView;
