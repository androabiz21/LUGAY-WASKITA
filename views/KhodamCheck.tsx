
import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Loader2, Sparkles, RefreshCw, Eye, Ghost, SwitchCamera, Home, User, Flame, Zap, Calendar, Heart, Download, ScrollText, Layers, AlertCircle } from 'lucide-react';
import { analyzeKhodam, generateKhodamVisual } from '../services/gemini.ts';
import ShareResult from '../components/ShareResult.tsx';
import { AppView } from '../types.ts';

const KhodamCheckView: React.FC<{ onNavigate: (view: AppView) => void }> = ({ onNavigate }) => {
  const [name, setName] = useState(localStorage.getItem('waskita_user') || '');
  const [birthDate, setBirthDate] = useState('');
  const [motherName, setMotherName] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [khodamVisual, setKhodamVisual] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = async (mode: 'user' | 'environment' = facingMode) => {
    try {
      setIsCameraActive(true);
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      setIsCameraActive(false);
      setError("Gagal mengakses kamera. Mohon pastikan izin kamera diberikan.");
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
      const context = canvasRef.current.getContext('2d');
      if (context) {
        // Capture at 640px width to balance quality and API limits
        canvasRef.current.width = 640;
        canvasRef.current.height = (videoRef.current.videoHeight / videoRef.current.videoWidth) * 640;
        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        // Standard quality JPEG
        setImage(canvasRef.current.toDataURL('image/jpeg', 0.8));
        stopCamera();
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            canvasRef.current.width = 640;
            canvasRef.current.height = (img.height / img.width) * 640;
            ctx?.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height);
            setImage(canvasRef.current.toDataURL('image/jpeg', 0.8));
          }
        };
        img.src = reader.result as string;
        stopCamera();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image || !name.trim()) {
      setError("Mohon lengkapi data batin and citra.");
      return;
    }
    setLoading(true);
    setAnalysis('');
    setKhodamVisual(null);
    setError(null);
    
    try {
      const base64Data = image.split(',')[1];
      
      // Step 1: Text analysis
      const resultText = await analyzeKhodam(base64Data, name, birthDate, motherName);
      if (!resultText) throw new Error("Gagal menyingkap sanad khodam.");
      setAnalysis(resultText);
      
      // Step 2: Visualization (Safe handling for potential filter blocks)
      try {
        const visualUrl = await generateKhodamVisual(base64Data, resultText);
        if (visualUrl) {
          setKhodamVisual(visualUrl);
        } else {
          console.warn("Visual generation returned null, possibly blocked by safety filters.");
        }
      } catch (visualErr) {
        console.warn("Image generation failed, but text result is preserved.");
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Tirai batin tertutup kabut. Pastikan koneksi atau sanad batin Anda valid.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!khodamVisual) return;
    const link = document.createElement('a');
    link.href = khodamVisual;
    link.download = `Kartu_Khodam_${name.replace(/\s+/g, '_')}.png`;
    link.click();
  };

  useEffect(() => { return () => stopCamera(); }, []);

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20 px-0 md:px-10 pt-8 bg-stone-950 min-h-screen text-stone-100">
      <header className="space-y-4 px-4">
        <button onClick={() => onNavigate(AppView.HOME)} className="flex items-center gap-2 text-stone-500 hover:text-amber-500 transition-colors mb-6 group"><div className="p-2 rounded-full group-hover:bg-amber-900/20 transition-colors"><Home size={18} /></div><span className="font-bold uppercase tracking-widest text-[10px]">Beranda</span></button>
        <div className="flex items-center gap-4">
          <div className="p-4 bg-stone-900 border border-stone-800 rounded-2xl text-white shadow-2xl shadow-black"><Layers size={32} /></div>
          <div>
            <h2 className="text-4xl md:text-5xl font-heritage font-bold text-white uppercase tracking-tight text-glow-amber">Cek Khodam</h2>
            <p className="text-amber-600 uppercase text-[10px] tracking-[0.4em] font-black mt-1">Kartu Lukisan Batin Nusantara</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-8 px-4">
          <div className="p-8 bg-stone-900/40 rounded-[40px] border border-stone-800 space-y-8 shadow-inner backdrop-blur-md">
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-stone-500 uppercase tracking-widest flex items-center gap-2 px-1"><User size={12} className="text-amber-600" /> Nama Lengkap Sesuai Sanad</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Contoh: Raden Gatotkaca..." className="w-full bg-stone-950 border border-stone-800 rounded-xl p-4 text-white focus:border-amber-600 outline-none text-sm font-bold shadow-inner placeholder:text-stone-700" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-stone-500 uppercase tracking-widest flex items-center gap-2 px-1"><Calendar size={12} className="text-amber-600" /> Tgl Lahir (Opsional)</label>
                  <input type="text" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} placeholder="17-08-1945" className="w-full bg-stone-950 border border-stone-800 rounded-xl p-4 text-white focus:border-amber-600 outline-none text-sm font-bold shadow-inner placeholder:text-stone-700" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-stone-500 uppercase tracking-widest flex items-center gap-2 px-1"><Heart size={12} className="text-rose-600" /> Nama Ibu (Opsional)</label>
                  <input type="text" value={motherName} onChange={(e) => setMotherName(e.target.value)} placeholder="Dewi..." className="w-full bg-stone-950 border border-stone-800 rounded-xl p-4 text-white focus:border-amber-600 outline-none text-sm font-bold shadow-inner placeholder:text-stone-700" />
                </div>
              </div>
            </div>

            <div className={`aspect-[3/4] rounded-[40px] border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden relative bg-stone-950 ${image || isCameraActive ? 'border-amber-600/30' : 'border-stone-800'}`}>
              {!image && !isCameraActive && (
                <div className="text-center p-8 space-y-6">
                  <div className="w-20 h-20 bg-stone-900 rounded-3xl flex items-center justify-center text-stone-700 mx-auto border border-stone-800"><Camera size={40} /></div>
                  <div className="space-y-2"><p className="text-stone-300 font-bold uppercase tracking-widest text-[10px]">Pindai Citra Batin</p><p className="text-stone-600 text-[10px] italic">Tangkap aura wajah Anda.</p></div>
                  <div className="flex gap-4 w-full max-w-xs mx-auto"><button onClick={() => startCamera()} className="flex-1 py-4 bg-amber-600 text-stone-950 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-transform">KAMERA</button><button onClick={() => fileInputRef.current?.click()} className="flex-1 py-4 bg-stone-800 border border-stone-700 rounded-xl text-stone-300 text-[10px] font-black shadow-sm uppercase tracking-widest hover:bg-stone-700 transition-colors">UNGGAH</button></div>
                </div>
              )}
              {isCameraActive && (
                <div className="absolute inset-0">
                  <video ref={videoRef} autoPlay playsInline className={`w-full h-full object-cover grayscale opacity-60 ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`} />
                  <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-6 z-20">
                    <button onClick={toggleCamera} className="p-4 bg-black/40 backdrop-blur-md rounded-full text-stone-300 border border-stone-700"><SwitchCamera size={24} /></button>
                    <button onClick={capturePhoto} className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center text-stone-950 shadow-lg active:scale-90"><Flame size={28} /></button>
                    <button onClick={stopCamera} className="p-4 bg-black/40 backdrop-blur-md rounded-full text-stone-300 border border-stone-700 hover:bg-rose-900"><RefreshCw size={24} /></button>
                  </div>
                </div>
              )}
              {image && (
                <div className="absolute inset-0 group">
                  <img src={image} alt="Input" className="w-full h-full object-cover grayscale opacity-30" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[1px]"><p className="text-amber-500 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Citra Terkunci</p></div>
                  <button onClick={() => { setImage(null); startCamera(); }} className="absolute top-6 right-6 p-4 bg-stone-900/80 backdrop-blur rounded-full text-stone-100 shadow-xl hover:bg-amber-600 transition-all opacity-0 group-hover:opacity-100"><RefreshCw size={20} /></button>
                </div>
              )}
              <canvas ref={canvasRef} className="hidden" />
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
            </div>

            {error && (
              <div className="p-4 bg-red-900/20 border border-red-800 rounded-2xl flex items-center gap-3 text-red-400 text-xs italic animate-in fade-in zoom-in">
                <AlertCircle size={16} className="shrink-0" /> {error}
              </div>
            )}

            <button onClick={handleAnalyze} disabled={!image || !name.trim() || loading} className="w-full py-6 bg-stone-100 hover:bg-white text-stone-950 font-black rounded-2xl transition-all flex items-center justify-center gap-3 shadow-2xl uppercase tracking-widest text-[11px] active:scale-95 disabled:opacity-50">
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} className="text-amber-600" />}
              {loading ? 'MENYELARASKAN SANAD...' : 'SINGKAP KARTU LUKISAN'}
            </button>
          </div>
        </div>

        <div className="space-y-6 px-0">
          <div className="p-0 md:p-12 glass-panel md:rounded-[60px] border-y md:border border-stone-800 bg-stone-900/30 min-h-[500px] flex flex-col shadow-2xl">
            <div className="flex items-center gap-3 text-amber-500 mb-8 border-b border-stone-800 pb-6 pt-8 px-6 md:pt-0 md:px-0 relative z-10">
              <Flame size={24} className="animate-pulse" />
              <h3 className="font-heritage text-xl md:text-2xl font-bold uppercase tracking-wider">Manifestasi Batin</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto relative z-10">
              {!analysis && !loading && (
                <div className="h-full flex flex-col items-center justify-center text-stone-700 space-y-6 opacity-40 italic py-20 px-6 text-center">
                  <div className="w-24 h-32 border-2 border-stone-800 rounded-3xl border-dashed flex items-center justify-center"><Layers size={32} /></div>
                  <p className="font-heritage italic text-lg">Menanti pemancaran dari cermin batin...</p>
                </div>
              )}

              {loading && (
                <div className="h-full flex flex-col items-center justify-center space-y-8 py-20 px-6 text-center">
                  <div className="relative"><div className="w-24 h-24 border-2 border-amber-900 rounded-full animate-ping"></div><Flame className="absolute inset-0 m-auto text-amber-600 animate-pulse" size={40} /></div>
                  <p className="text-amber-600 font-heritage italic text-xl animate-pulse">Melukis sanad energi...</p>
                </div>
              )}

              {analysis && (
                <div className="space-y-10 animate-in fade-in duration-1000 w-full px-0">
                  {khodamVisual ? (
                    <div className="px-4 md:px-0 animate-in zoom-in duration-1000">
                      <div className="p-1 bg-stone-900 border border-stone-800 md:rounded-[32px] overflow-hidden shadow-[0_0_40px_-10px_rgba(217,119,6,0.3)] flex flex-col">
                         <img src={khodamVisual} alt="Lukisan Kartu Khodam" className="w-full aspect-[3/4] md:aspect-[4/5] object-cover rounded-none md:rounded-[24px] brightness-75 transition-all duration-1000" />
                         <div className="p-6 text-center border-t border-stone-800 bg-stone-950 flex justify-between items-center">
                            <div className="text-left">
                              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-amber-500">Lukisan Minyak Waskita AI</p>
                              <p className="text-[8px] text-stone-500 italic mt-1">Kartu Manifestasi Batin</p>
                            </div>
                            <button onClick={handleDownload} className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-stone-950 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg transition-all active:scale-95"><Download size={14} /> SIMPAN</button>
                         </div>
                      </div>
                    </div>
                  ) : !loading && (
                    <div className="px-4 md:px-0">
                       <div className="p-6 bg-amber-950/20 border border-amber-900/30 rounded-3xl flex gap-4 items-center">
                          <AlertCircle size={24} className="text-amber-600 shrink-0" />
                          <p className="text-[10px] text-stone-400 italic leading-relaxed">
                            Visi visual sedang tertutup kabut dimensi (Safety Filter). Namun risalah tertulis tetap dapat Anda baca di bawah ini.
                          </p>
                       </div>
                    </div>
                  )}
                  
                  <div className="px-4 md:px-0">
                    <div className="text-stone-100 text-lg md:text-3xl leading-relaxed italic text-justify whitespace-pre-wrap bg-stone-900/50 p-6 md:p-20 border-y md:border md:rounded-[40px] border-stone-800 shadow-inner w-full font-medium">
                      {analysis}
                    </div>
                  </div>
                  
                  <div className="px-6 pb-10">
                    <ShareResult title="Risalah Kartu Lukisan Khodam" text={analysis} context={`Sanad: ${name}`} />
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

export default KhodamCheckView;
