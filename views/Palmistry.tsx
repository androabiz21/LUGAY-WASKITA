
import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Loader2, Sparkles, AlertCircle, Home, SwitchCamera, RefreshCw, Hand } from 'lucide-react';
import { analyzePalmistry } from '../services/gemini.ts';
import ShareResult from '../components/ShareResult.tsx';
import { AppView } from '../types.ts';

const PalmistryView: React.FC<{ onNavigate: (view: AppView) => void }> = ({ onNavigate }) => {
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        stopCamera();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setLoading(true);
    setAnalysis('');
    
    try {
      const base64Data = image.split(',')[1];
      const result = await analyzePalmistry(base64Data);
      setAnalysis(result);
    } catch (err) {
      console.error(err);
      setAnalysis("Maaf, waskita batin sedang terhalang kabut ghaib. Sila coba kembali beberapa saat lagi.");
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
        @keyframes scan {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
        .scan-line {
          position: absolute;
          left: 0;
          width: 100%;
          height: 4px;
          background: linear-gradient(to bottom, transparent, #d97706, transparent);
          box-shadow: 0 0 15px 2px rgba(217, 119, 6, 0.8);
          animation: scan 3s ease-in-out infinite;
          z-index: 25;
        }
      `}</style>
      
      <header className="space-y-4 px-4">
        <button 
          onClick={() => { stopCamera(); onNavigate(AppView.HOME); }}
          className="flex items-center gap-2 text-stone-500 hover:text-amber-500 transition-colors mb-6 group"
        >
          <div className="p-2 rounded-full group-hover:bg-amber-900/20 transition-colors">
            <Home size={18} />
          </div>
          <span className="font-bold uppercase tracking-widest text-[10px]">Beranda</span>
        </button>
        <div className="flex items-center gap-4">
          <div className="p-4 bg-stone-900 border border-stone-800 rounded-2xl text-amber-500 shadow-2xl">
            <Hand size={32} />
          </div>
          <div>
            <h2 className="text-3xl md:text-5xl font-heritage font-bold text-white text-glow-amber tracking-tight uppercase">Rajah Leungeun</h2>
            <p className="text-stone-500 uppercase text-[10px] tracking-[0.3em] font-black mt-1">Nyungsi Karsa Batin Melalui Garis Tangan.</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 px-0">
        <div className="xl:col-span-4 space-y-8 px-4">
          <div 
            className={`
              aspect-[3/4] rounded-[40px] border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden relative bg-stone-900/40 backdrop-blur-md
              ${image || isCameraActive ? 'border-amber-600/30' : 'border-stone-800'}
            `}
          >
            {loading && <div className="scan-line" />}
            
            {!image && !isCameraActive && (
              <div className="text-center p-8 md:p-12 space-y-6">
                <div className="w-20 h-20 bg-stone-950 rounded-3xl flex items-center justify-center text-stone-700 mx-auto shadow-inner border border-stone-800">
                  <Camera size={32} />
                </div>
                <div className="space-y-2">
                  <p className="text-stone-100 font-bold uppercase tracking-widest text-xs">Pindai Telapak Tangan</p>
                  <p className="text-stone-600 text-xs italic">Arahkan pada cahaya yang benderang agar rajah terlihat nyata.</p>
                </div>
                <div className="flex gap-4 w-full max-w-xs mx-auto">
                  <button onClick={() => startCamera()} className="flex-1 py-4 bg-amber-600 text-stone-950 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-2xl">KAMERA</button>
                  <button onClick={() => fileInputRef.current?.click()} className="flex-1 py-4 bg-stone-800 border border-stone-700 rounded-xl text-stone-400 text-[10px] font-black uppercase">UNGGAH</button>
                </div>
              </div>
            )}

            {isCameraActive && (
              <div className="absolute inset-0">
                <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover grayscale brightness-50 ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`} />
                <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-6 z-20">
                  <button onClick={toggleCamera} className="p-4 bg-black/40 backdrop-blur rounded-full text-stone-300 border border-stone-700 transition-all hover:bg-stone-800"><SwitchCamera size={24} /></button>
                  <button onClick={capturePhoto} className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center text-stone-950 shadow-lg active:scale-90"><Camera size={28} /></button>
                  <button onClick={stopCamera} className="p-4 bg-black/40 backdrop-blur rounded-full text-stone-300 border border-stone-700 transition-all hover:bg-rose-900"><RefreshCw size={24} /></button>
                </div>
              </div>
            )}

            {image && (
              <div className="absolute inset-0 group">
                <img src={image} alt="Palm" className="w-full h-full object-cover grayscale opacity-50 brightness-75" />
                <button onClick={() => { setImage(null); setAnalysis(''); startCamera(); }} className="absolute top-6 right-6 p-4 bg-stone-900/80 backdrop-blur rounded-full text-stone-100 shadow-xl opacity-0 group-hover:opacity-100"><RefreshCw size={20} /></button>
              </div>
            )}
            <canvas ref={canvasRef} className="hidden" />
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
          </div>

          <div className="flex gap-4">
            <button onClick={() => { setImage(null); setAnalysis(''); stopCamera(); }} className="flex-1 py-4 border border-stone-800 bg-stone-900/50 rounded-2xl text-stone-500 font-bold hover:text-stone-300 transition-all uppercase tracking-widest text-[10px]">RESET</button>
            <button onClick={handleAnalyze} disabled={!image || loading} className="flex-[2] py-4 bg-stone-100 hover:bg-white text-stone-950 font-black rounded-2xl transition-all flex items-center justify-center gap-2 shadow-2xl uppercase tracking-widest text-[10px]">
              {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={18} className="text-amber-600" />} {loading ? 'NYUNGSI...' : 'BEDAH RAJAH'}
            </button>
          </div>
        </div>

        <div className="xl:col-span-8 space-y-6 px-0">
          <div className="p-0 md:p-12 glass-panel md:rounded-[60px] border-y md:border border-stone-800 bg-stone-900/20 h-full min-h-[500px] flex flex-col shadow-2xl relative">
            <div className="flex items-center gap-2 text-amber-500 mb-8 border-b border-stone-800 pb-6 pt-8 px-6 md:pt-0 md:px-0 relative z-10">
              <Sparkles size={24} className="animate-pulse" />
              <h3 className="font-heritage text-2xl md:text-3xl font-bold uppercase tracking-wider">Risalah Waskita</h3>
            </div>
            
            <div className="flex-1 overflow-visible relative z-10 w-full">
              {!analysis && !loading && (
                <div className="h-full flex flex-col items-center justify-center text-stone-700 space-y-4 opacity-40 italic py-20">
                  <Hand size={48} className="animate-bounce" />
                  <p className="font-heritage text-lg text-center">Menanti pantulan rajah dari telaga batin...</p>
                </div>
              )}

              {loading && (
                <div className="h-full flex flex-col items-center justify-center space-y-6 py-20">
                  <Loader2 className="animate-spin text-amber-600" size={40} />
                  <p className="text-amber-600 font-heritage italic text-xl animate-pulse text-center">Menyingkap suratan batin...</p>
                </div>
              )}

              {analysis && (
                <div className="space-y-12 animate-in fade-in duration-1000 w-full">
                  <div className="text-stone-100 text-lg md:text-4xl leading-relaxed italic text-justify whitespace-pre-wrap font-medium p-5 md:p-20 bg-stone-950/50 md:rounded-[40px] border-y md:border border-stone-800 shadow-inner w-full">
                    {analysis}
                  </div>
                  <div className="px-6 md:px-0 pb-10">
                    <ShareResult title="Risalah Rajah Lengeun Waskita" text={analysis} />
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

export default PalmistryView;
