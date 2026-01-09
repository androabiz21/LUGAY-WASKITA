
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Upload, Loader2, Sparkles, RefreshCw, Ghost, Flame, ShieldAlert, Radio, Bell, BellOff, Clock, AlertCircle, Sliders, SwitchCamera, Home, User, Calendar, Heart } from 'lucide-react';
import { detectMysticalEnergy, generateMysticalVisual } from '../services/gemini.ts';
import ShareResult from '../components/ShareResult.tsx';
import { AppView } from '../types.ts';

const MysticalDetectionView: React.FC<{ onNavigate: (view: AppView) => void }> = ({ onNavigate }) => {
  const [userName, setUserName] = useState(localStorage.getItem('waskita_user') || '');
  const [birthDate, setBirthDate] = useState('');
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
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
      alert("Gagal mengakses kamera. Sila coba unggah citra.");
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
      setOriginalImage(canvasRef.current.toDataURL('image/jpeg'));
      stopCamera();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { setOriginalImage(reader.result as string); stopCamera(); };
      reader.readAsDataURL(file);
    }
  };

  const performScan = useCallback(async () => {
    if (!originalImage || !userName.trim()) { alert("Lengkapi nama and citra."); return; }
    setLoading(true); setAnalysis(''); setGeneratedImage(null);
    const base64Data = originalImage.split(',')[1];
    try {
      const textResult = await detectMysticalEnergy(base64Data, `Subjek: ${userName}. [PENTING: Sertakan nilai "Skor Anomali: X" 0-100]. Sampaikan puitis Nusantara, penuhi lebar layar.`);
      setAnalysis(textResult);
      const visualResult = await generateMysticalVisual(base64Data, textResult);
      if (visualResult) setGeneratedImage(visualResult);
    } catch (error: any) { alert(error.message || "Gagal menyingkap dimensi."); } finally { setLoading(false); }
  }, [originalImage, userName]);

  useEffect(() => { return () => stopCamera(); }, []);

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20 px-0 md:px-10 pt-8 bg-stone-950 min-h-screen text-stone-100">
      <header className="space-y-4 px-4">
        <button onClick={() => onNavigate(AppView.HOME)} className="flex items-center gap-2 text-stone-500 hover:text-amber-500 transition-colors mb-6 group"><div className="p-2 rounded-full group-hover:bg-amber-900/20 transition-colors"><Home size={18} /></div><span className="font-bold uppercase tracking-widest text-[10px]">Beranda</span></button>
        <div className="flex items-center gap-4">
          <div className="p-4 bg-stone-900 border border-stone-800 rounded-2xl text-amber-500 shadow-2xl shadow-black"><Ghost size={32} /></div>
          <div>
            <h2 className="text-3xl md:text-5xl font-heritage font-bold text-white text-glow-amber tracking-tight uppercase leading-none">Deteksi Energi</h2>
            <p className="text-stone-500 uppercase text-[10px] tracking-[0.4em] font-black mt-1 text-left">Pemindaian Anomali & Manifestasi Ghaib Digital</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 px-0 md:px-0">
        <div className="space-y-8 px-4 md:px-0 flex flex-col h-full">
          <div className="p-8 bg-stone-900/40 rounded-[40px] border border-stone-800 space-y-8 shadow-inner backdrop-blur-md flex-1">
             <div className="space-y-4">
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-stone-500 uppercase tracking-widest flex items-center gap-2 px-1"><User size={12} className="text-amber-600" /> Nama Sadhaka</label>
                 <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Nama..." className="w-full bg-stone-950 border border-stone-800 rounded-xl p-4 text-white focus:border-amber-600 outline-none shadow-inner text-sm font-bold" />
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-stone-500 uppercase tracking-widest flex items-center gap-2 px-1"><Calendar size={12} className="text-amber-600" /> Tanggal Deteksi</label>
                 <input type="text" readOnly value={new Date().toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' })} className="w-full bg-stone-950 border border-stone-800 rounded-xl p-4 text-stone-500 focus:border-amber-600 outline-none shadow-inner text-xs font-bold" />
               </div>
             </div>

             <div className="aspect-[3/4] bg-stone-950 rounded-[40px] border-2 border-dashed border-stone-800 overflow-hidden relative shadow-inner group">
                {!originalImage && !isCameraActive && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center space-y-8">
                    <div className="w-20 h-20 bg-stone-900 rounded-3xl flex items-center justify-center text-stone-700 mx-auto shadow-inner border border-stone-800"><Camera size={32} /></div>
                    <div className="space-y-1"><p className="text-white font-bold uppercase tracking-widest text-[10px]">Pindai Dimensi</p><p className="text-stone-700 text-[10px] italic">Arahkan pada area yang terasa berat.</p></div>
                    <div className="flex gap-4 w-full max-w-xs mx-auto"><button onClick={() => startCamera()} className="flex-1 py-4 bg-amber-600 text-stone-950 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-transform">KAMERA</button><button onClick={() => fileInputRef.current?.click()} className="flex-1 py-4 bg-stone-800 border border-stone-700 rounded-xl text-stone-400 text-[10px] font-black shadow-sm uppercase tracking-widest hover:bg-stone-700 transition-colors">UNGGAH</button></div>
                  </div>
                )}
                {isCameraActive && (
                  <div className="absolute inset-0">
                    <video ref={videoRef} autoPlay playsInline className={`w-full h-full object-cover grayscale opacity-40 brightness-50 ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`} />
                    <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-6 z-20"><button onClick={toggleCamera} className="p-4 bg-black/40 backdrop-blur rounded-full text-stone-300 border border-stone-700 hover:bg-stone-800 transition-colors"><SwitchCamera size={24} /></button><button onClick={capturePhoto} className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center text-stone-950 shadow-lg active:scale-90 transition-transform"><Flame size={28} /></button><button onClick={stopCamera} className="p-4 bg-black/40 backdrop-blur rounded-full text-stone-300 border border-stone-700 hover:bg-rose-900 transition-colors"><RefreshCw size={24} /></button></div>
                  </div>
                )}
                {originalImage && (
                  <div className="absolute inset-0 group">
                    <img src={generatedImage || originalImage} alt="Mystical scan" className="w-full h-full object-cover grayscale opacity-40 brightness-50 transition-all duration-1000" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]"><p className="text-amber-500 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Dimensi Terbuka</p></div>
                    <button onClick={() => { setOriginalImage(null); setGeneratedImage(null); startCamera(); }} className="absolute top-4 right-4 p-3 bg-stone-900/80 rounded-full text-white shadow-xl hover:bg-amber-600 transition-all opacity-0 group-hover:opacity-100"><RefreshCw size={18} /></button>
                  </div>
                )}
                <canvas ref={canvasRef} className="hidden" />
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
             </div>
             <button onClick={() => performScan()} disabled={!originalImage || loading || !userName.trim()} className="w-full py-6 bg-stone-100 hover:bg-white text-stone-950 font-black rounded-2xl shadow-2xl transition-all uppercase tracking-widest text-[11px] mt-4">{loading ? <Loader2 className="animate-spin mx-auto" /> : "INISIASI TERAWANGAN ENERGI"}</button>
          </div>
        </div>

        <div className="space-y-6 pb-10 px-0">
          <div className="p-0 md:p-16 glass-panel md:rounded-[60px] border-y md:border border-stone-800 bg-stone-900/20 h-full min-h-[500px] flex flex-col shadow-2xl relative overflow-hidden">
            <div className="flex items-center gap-4 text-amber-500 mb-10 border-b border-stone-800 pb-8 px-6 pt-8 md:pt-0 md:px-0">
               <ShieldAlert size={28} className="animate-pulse" /><h3 className="font-heritage text-2xl md:text-5xl font-bold uppercase tracking-wider leading-none">Hasil Terawangan</h3>
            </div>
            <div className="flex-1 w-full px-0">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center space-y-8 py-20 px-6 text-center">
                  <div className="relative"><div className="w-24 h-24 border-2 border-amber-900 rounded-full animate-ping"></div><Radio className="absolute inset-0 m-auto text-amber-600 animate-pulse" size={40} /></div>
                  <p className="text-amber-600 font-heritage italic text-2xl animate-pulse">Menghimpun resonansi batin...</p>
                </div>
              ) : analysis ? (
                <div className="space-y-12 animate-in fade-in duration-1000 px-0 w-full">
                  <div className="text-stone-100 leading-relaxed italic text-justify text-lg md:text-4xl whitespace-pre-wrap font-medium p-6 md:p-20 bg-stone-950/50 md:rounded-[40px] border-y md:border border-stone-800 shadow-inner w-full overflow-visible">{analysis}</div>
                  <div className="px-6 md:px-0 pb-10"><ShareResult title="Risalah Deteksi Energi" text={analysis} /></div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-stone-800 space-y-6 opacity-30 py-20 px-6 text-center">
                  <Ghost size={80} /><p className="font-heritage text-2xl italic leading-tight">Menanti gema dari dimensi lain untuk disingkap...</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="p-6 bg-red-950/10 border border-red-900/20 rounded-3xl flex gap-4 mx-4 md:mx-0 shadow-lg animate-in slide-in-from-bottom-4 duration-1000">
            <AlertCircle className="text-red-700 shrink-0" size={24} />
            <div className="text-[10px] text-stone-600 leading-relaxed italic font-medium">
              <span className="font-black text-red-900 block mb-1 uppercase tracking-widest">Peringatan Sadhaka</span>
              "Fitur ini merupakan interpretasi simbolik digital melalui kaca waskita. Gunakan sebagai sarana kewaspadaan batin and tetaplah berpijak pada keteguhan iman masing-masing."
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MysticalDetectionView;
