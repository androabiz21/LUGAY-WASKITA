
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Camera, Upload, Loader2, Sparkles, RefreshCw, Skull, SwitchCamera, Home, User, Flame, Zap, Heart, Download, ScrollText, Layers, Ghost, Calendar, Users, Info, BookOpen, AlertTriangle } from 'lucide-react';
import { generateAncientRitual } from '../services/gemini.ts';
import ShareResult from '../components/ShareResult.tsx';
import { AppView } from '../types.ts';

const AncientKnowledgeView: React.FC<{ onNavigate: (view: AppView) => void }> = ({ onNavigate }) => {
  const [name, setName] = useState('');
  const [targetName, setTargetName] = useState('');
  const [targetBirthDate, setTargetBirthDate] = useState('');
  const [targetParent, setTargetParent] = useState('');
  const [category, setCategory] = useState<'Pelet' | 'Puter Giling' | 'Santet'>('Pelet');
  const [notes, setNotes] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [ritualVisual, setRitualVisual] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categoryDetails = useMemo(() => {
    switch(category) {
      case 'Pelet':
        return {
          desc: 'Ilmu pengasihan tingkat tinggi yang bertujuan untuk memikat sanubari dan mengunci sukma target agar timbul rasa asih yang mendalam.',
          philosophy: 'Berakar dari kepercayaan tentang getaran energi daya pikat (magnetisme batin). Secara tradisional digunakan untuk keharmonisan rumah tangga yang retak.',
          ritual: 'Biasanya menggunakan media foto, wewangian (minyak mistik), atau benda milik target yang diritualkan pada waktu tengah malam.',
          warning: 'Pelet yang dipaksakan dapat merusak kewarasan batin target and berbalik menjadi beban karma bagi pengirim.',
          color: 'text-amber-500',
          bg: 'bg-amber-950/20'
        };
      case 'Puter Giling':
        return {
          desc: 'Kearifan kuno untuk memutar kembali sukma yang pergi, baik itu kekasih yang menjauh, anggota keluarga yang hilang, maupun barang yang tercuri.',
          philosophy: 'Mengandalkan energi kerinduan (nostalgia batin) and memutar frekuensi ingatan target agar terfokus kembali kepada pengirim.',
          ritual: 'Dilakukan dengan laku "Melek" (begadang) and pembacaan mantra secara repetitif sambil membayangkan wajah target di bawah cahaya rembulan.',
          warning: 'Efektifitas bergantung pada ikatan batin yang pernah ada; jika ikatan telah putus total, energi akan sulit bersambut.',
          color: 'text-teal-500',
          bg: 'bg-teal-950/20'
        };
      case 'Santet':
        return {
          desc: 'Simulasi pengiriman energi negatif (destructive energy) yang secara historis dikenal sebagai Teluh atau Desti untuk perlindungan wilayah atau pembalasan dendam.',
          philosophy: 'Manifestasi dari sisi gelap energi Nusantara (Ilmu Hitam). Menggunakan bantuan entitas ghaib untuk menembus pagar batin target.',
          ritual: 'Secara tradisional melibatkan media benda tajam, boneka peraga, atau tanah sakral. Membutuhkan konsentrasi kemarahan yang sangat tinggi.',
          warning: 'Santet adalah jalan pedang bermata dua. Risiko "Senjata Makan Tuan" sangat besar jika pagar batin target lebih kuat.',
          color: 'text-rose-600',
          bg: 'bg-rose-950/20'
        };
    }
  }, [category]);

  const startCamera = async (mode: 'user' | 'environment' = facingMode) => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: mode } 
      });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      setIsCameraActive(false);
      alert("Gagal mengakses kamera. Pastikan izin kamera telah diberikan.");
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
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        setImage(canvasRef.current.toDataURL('image/jpeg'));
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

  const handleRitual = async () => {
    if (!image || !name.trim() || !targetName.trim()) {
      alert("Mohon lengkapi minimal Nama Anda, Nama Target, dan ambil foto media ritual.");
      return;
    }
    setLoading(true);
    setAnalysis('');
    setRitualVisual(null);
    
    try {
      const base64Data = image.split(',')[1];
      const result = await generateAncientRitual(
        category, 
        name, 
        targetName, 
        targetBirthDate,
        targetParent,
        notes, 
        base64Data
      );
      
      setAnalysis(result.analysisText);
      setRitualVisual(result.visualUrl);
    } catch (err) {
      alert("Energi batin sedang kacau. Sila coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!ritualVisual) return;
    const link = document.createElement('a');
    link.href = ritualVisual;
    link.download = `Lukisan_Ritual_${category}_${targetName.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20 px-0 md:px-10 pt-8 bg-stone-950 min-h-screen text-stone-200">
      <header className="space-y-4 px-4">
        <button 
          onClick={() => onNavigate(AppView.HOME)}
          className="flex items-center gap-2 text-stone-500 hover:text-amber-600 transition-colors mb-6 group"
        >
          <div className="p-2 rounded-full group-hover:bg-amber-900/20 transition-colors">
            <Home size={18} />
          </div>
          <span className="font-bold uppercase tracking-widest text-[10px]">Beranda</span>
        </button>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-950 border border-red-800 rounded-2xl text-red-500 shadow-xl shadow-red-950/20">
            <Skull size={32} />
          </div>
          <div>
            <h2 className="text-3xl md:text-5xl font-heritage font-bold text-stone-100 uppercase tracking-tight text-glow-amber leading-none">Ilmu Leluhur</h2>
            <p className="text-red-500 uppercase text-[10px] tracking-[0.4em] font-black mt-2">Simulasi Kebatinan & Mantra Kuno Nusantara</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 px-0 md:px-0">
        {/* Left Column: Config and Info */}
        <div className="lg:col-span-5 space-y-8 px-4 md:px-0 flex flex-col h-full">
          <div className="p-8 bg-stone-900/50 rounded-[40px] border border-stone-800 space-y-8 shadow-2xl backdrop-blur-sm flex-1">
            <div className="flex gap-2 p-1 bg-stone-950 rounded-2xl border border-stone-800">
              {(['Pelet', 'Puter Giling', 'Santet'] as const).map(cat => (
                <button 
                  key={cat} 
                  onClick={() => { setCategory(cat); setAnalysis(''); setRitualVisual(null); }}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${category === cat ? 'bg-red-700 text-white shadow-lg' : 'text-stone-500 hover:text-stone-300'}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Category Context Info */}
            <div className={`p-6 ${categoryDetails.bg} rounded-3xl border border-stone-800/50 space-y-4 animate-in fade-in duration-700`}>
              <div className={`flex items-center gap-2 ${categoryDetails.color}`}>
                <BookOpen size={16} />
                <h4 className="text-[10px] font-black uppercase tracking-widest leading-none">Serat Pengetahuan: {category}</h4>
              </div>
              <p className="text-xs text-stone-400 italic leading-relaxed">"{categoryDetails.desc}"</p>
              <div className="space-y-3 pt-2">
                <div className="flex gap-3">
                   <Zap size={14} className={`${categoryDetails.color} shrink-0 mt-0.5`} />
                   <div className="space-y-1">
                     <p className="text-[9px] font-black text-stone-300 uppercase tracking-wider">Filosofi Batin</p>
                     <p className="text-[10px] text-stone-500 leading-tight">{categoryDetails.philosophy}</p>
                   </div>
                </div>
                <div className="flex gap-3">
                   <Layers size={14} className={`${categoryDetails.color} shrink-0 mt-0.5`} />
                   <div className="space-y-1">
                     <p className="text-[9px] font-black text-stone-300 uppercase tracking-wider">Tata Cara Tradisi</p>
                     <p className="text-[10px] text-stone-500 leading-tight">{categoryDetails.ritual}</p>
                   </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-stone-500 uppercase tracking-widest flex items-center gap-2">
                  <User size={12} className="text-red-700" /> Nama Anda (Sadhaka)
                </label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Contoh: Ki Buyut Ragasukma..." 
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-4 text-stone-100 focus:border-red-700 outline-none text-sm font-bold shadow-inner placeholder:text-stone-800" 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-stone-500 uppercase tracking-widest flex items-center gap-2">
                    <Ghost size={12} className="text-red-700" /> Nama Sasaran
                  </label>
                  <input 
                    type="text" 
                    value={targetName} 
                    onChange={(e) => setTargetName(e.target.value)} 
                    placeholder="Contoh: Sangkuriang..." 
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-4 text-stone-100 focus:border-red-700 outline-none text-sm font-bold shadow-inner placeholder:text-stone-800" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-stone-500 uppercase tracking-widest flex items-center gap-2">
                    <Calendar size={12} className="text-red-700" /> Tgl Lahir Sasaran
                  </label>
                  <input 
                    type="text" 
                    value={targetBirthDate} 
                    onChange={(e) => setTargetBirthDate(e.target.value)} 
                    placeholder="Contoh: 01-01-1990" 
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-4 text-stone-100 focus:border-red-700 outline-none text-sm font-bold shadow-inner placeholder:text-stone-800" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-stone-500 uppercase tracking-widest flex items-center gap-2">
                  <Users size={12} className="text-red-700" /> Sanad Batin (Nama Ortu Target)
                </label>
                <input 
                  type="text" 
                  value={targetParent} 
                  onChange={(e) => setTargetParent(e.target.value)} 
                  placeholder="Contoh: Bin/Binti (Nama Ayah/Ibu)..." 
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-4 text-stone-100 focus:border-red-700 outline-none text-sm font-bold shadow-inner placeholder:text-stone-800" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-stone-500 uppercase tracking-widest flex items-center gap-2">
                  <ScrollText size={12} className="text-red-700" /> Detail Niat/Hajat
                </label>
                <textarea 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)} 
                  placeholder="Tuliskan niat batin Anda secara mendalam..." 
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-4 text-stone-100 focus:border-red-700 outline-none text-sm font-bold shadow-inner h-24 resize-none italic placeholder:text-stone-800" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Visual and Manifestation */}
        <div className="lg:col-span-7 space-y-8 px-0 md:px-0 pb-10">
          <div className="p-0 md:p-12 bg-stone-900/30 md:rounded-[40px] border-y md:border border-stone-800 min-h-[500px] flex flex-col shadow-2xl relative overflow-hidden">
            <div className="flex items-center gap-3 text-red-500 mb-8 border-b border-stone-800 pb-6 pt-8 px-6 md:pt-0 md:px-0 relative z-10">
              <Flame size={24} className="animate-pulse" />
              <h3 className="font-heritage text-xl md:text-2xl font-bold uppercase tracking-wider">Altas Manifestasi Ritual</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto px-0 md:px-0 space-y-10 relative z-10">
              {/* Media Capture Area */}
              {!analysis && !loading && (
                <div className="space-y-10 px-4 md:px-0">
                  <div 
                    className={`
                      aspect-[3/4] w-full max-w-sm mx-auto rounded-[40px] border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden relative bg-stone-950 shadow-inner
                      ${image || isCameraActive ? 'border-red-700/50' : 'border-stone-800'}
                    `}
                  >
                    {!image && !isCameraActive && (
                      <div className="text-center p-8 space-y-6">
                        <div className="w-20 h-20 bg-stone-900 rounded-3xl flex items-center justify-center text-stone-700 mx-auto shadow-inner border border-stone-800">
                          <Camera size={40} />
                        </div>
                        <div className="space-y-2">
                          <p className="text-stone-300 font-bold uppercase tracking-widest text-[10px]">Wadah Media Sasaran</p>
                          <p className="text-stone-700 text-[10px] italic">Unggah foto sasaran untuk disatukan dalam visual ritual.</p>
                        </div>
                        <div className="flex gap-4 w-full max-w-xs mx-auto">
                          <button 
                            onClick={() => startCamera()}
                            className="flex-1 py-4 bg-red-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-900/20 active:scale-95 transition-transform"
                          >
                            KAMERA
                          </button>
                          <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="flex-1 py-4 bg-stone-800 border border-stone-700 rounded-xl text-stone-400 text-[10px] font-black shadow-sm uppercase tracking-widest hover:bg-stone-700 transition-colors"
                          >
                            UNGGAH
                          </button>
                        </div>
                      </div>
                    )}

                    {isCameraActive && (
                      <div className="absolute inset-0">
                        <video 
                          ref={videoRef} 
                          autoPlay 
                          playsInline 
                          className={`w-full h-full object-cover grayscale brightness-50 ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`} 
                        />
                        <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-6 z-20">
                          <button 
                            onClick={toggleCamera} 
                            className="p-4 bg-black/40 backdrop-blur-md rounded-full text-stone-300 border border-stone-700 transition-all hover:bg-stone-800"
                          >
                            <SwitchCamera size={24} />
                          </button>
                          <button 
                            onClick={capturePhoto} 
                            className="w-16 h-16 bg-red-700 rounded-full flex items-center justify-center text-white shadow-lg active:scale-90 transition-transform"
                          >
                            <Flame size={28} />
                          </button>
                          <button 
                            onClick={stopCamera} 
                            className="p-4 bg-black/40 backdrop-blur-md rounded-full text-stone-300 border border-stone-700 transition-all hover:bg-rose-900"
                          >
                            <RefreshCw size={24} />
                          </button>
                        </div>
                      </div>
                    )}

                    {image && (
                      <div className="absolute inset-0 group">
                        <img src={image} alt="Input Ritual" className="w-full h-full object-cover grayscale opacity-40 blur-[1px]" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[1px]">
                           <p className="text-red-500 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Citra Sasaran Terkunci</p>
                        </div>
                        <button 
                          onClick={() => { setImage(null); startCamera(); }}
                          className="absolute top-6 right-6 p-4 bg-stone-900/80 backdrop-blur rounded-full text-stone-100 shadow-xl hover:bg-red-700 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <RefreshCw size={20} />
                        </button>
                      </div>
                    )}
                    
                    <canvas ref={canvasRef} className="hidden" />
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </div>
                  
                  <button 
                    onClick={handleRitual}
                    disabled={!image || !name.trim() || !targetName.trim() || loading}
                    className="w-full py-6 bg-red-900 hover:bg-red-800 text-white font-black rounded-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-2xl uppercase tracking-widest text-[11px] active:scale-95"
                  >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} className="text-amber-500" />}
                    {loading ? 'MENYELARASKAN ENERGI...' : `INITIASI RITUAL ${category.toUpperCase()}`}
                  </button>

                  <div className="h-40 flex flex-col items-center justify-center text-stone-800 space-y-6 opacity-30 italic py-10">
                    <Ghost size={32} />
                    <p className="font-heritage text-lg text-center">Menanti pemancaran energi dari batin...</p>
                  </div>
                </div>
              )}

              {loading && (
                <div className="h-full flex flex-col items-center justify-center space-y-8 py-20 px-6 text-center">
                  <div className="relative">
                    <div className="w-24 h-24 border-2 border-red-500/20 rounded-full animate-ping"></div>
                    <Skull className="absolute inset-0 m-auto text-red-600 animate-pulse" size={40} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-red-600 font-heritage italic text-xl animate-pulse">Menghimpun Mantra & Kemenyan...</p>
                    <p className="text-stone-700 text-[10px] uppercase tracking-widest font-black">AI Waskita sedang menenun takdir batin</p>
                  </div>
                </div>
              )}

              {analysis && (
                <div className="space-y-12 animate-in fade-in duration-1000 w-full px-0 pb-10">
                  {ritualVisual && (
                    <div className="px-4 md:px-0">
                      <div className="relative p-1 bg-stone-900 border border-stone-800 rounded-[40px] overflow-hidden shadow-[0_0_50px_-10px_rgba(220,38,38,0.3)] mx-auto flex flex-col group transition-all duration-1000">
                         {/* Ancient Art Frame */}
                         <div className="absolute inset-0 border-[16px] border-stone-950/40 pointer-events-none z-10" />
                         <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent opacity-60 z-10" />
                         
                         <img 
                           src={ritualVisual} 
                           alt="Lukisan Ritual AI" 
                           className="w-full aspect-[3/4] object-cover transition-all duration-1000 brightness-[0.8] contrast-[1.1]" 
                         />
                         
                         <div className="p-8 text-center border-t border-stone-800 bg-stone-950 relative z-20 flex justify-between items-center">
                            <div className="text-left">
                              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600">Lukisan Minyak AI</p>
                              <p className="text-[8px] text-stone-500 italic mt-1 leading-none tracking-wider">Manifestasi Batin {category}</p>
                            </div>
                            <button 
                              onClick={handleDownload}
                              className="flex items-center gap-2 px-6 py-2.5 bg-red-800 hover:bg-red-700 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg transition-all active:scale-95"
                            >
                              <Download size={14} /> SIMPAN ARTEFAK
                            </button>
                         </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="px-4 md:px-0">
                    <div className="text-stone-100 text-lg md:text-3xl leading-relaxed italic text-justify whitespace-pre-wrap bg-stone-900/50 p-6 md:p-20 border-y md:border md:rounded-[40px] border-stone-800 shadow-inner w-full font-medium animate-in slide-in-from-bottom-4 duration-1000">
                      {analysis}
                    </div>
                  </div>
                  
                  <div className="px-6">
                    <ShareResult title={`Risalah Ritual: ${category}`} text={analysis} context={`Atas Nama: ${targetName}`} />
                  </div>
                </div>
              )}
            </div>

            {/* Decorative Background for Ritual Altas */}
            <div className="absolute inset-0 pointer-events-none z-0 opacity-10">
               <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,rgba(220,38,38,0.2),transparent_70%)]" />
            </div>
          </div>

          {/* Karma Warning Footer */}
          <div className="p-6 bg-red-950/20 border border-red-900/30 rounded-3xl space-y-3 mx-4 md:mx-0 shadow-lg relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <Skull size={40} className="text-red-600" />
             </div>
             <div className="flex items-center gap-3 text-red-600 relative z-10">
               <AlertTriangle size={20} />
               <span className="font-black text-red-600 block uppercase tracking-widest text-[11px]">Peringatan Sanubari & Hukum Karma</span>
             </div>
             <p className="text-[10px] text-stone-500 leading-relaxed italic font-medium relative z-10">
               "{categoryDetails.warning} Jagad Raya selalu beresonansi dengan setiap kehendak. Apa yang ditenun hari ini akan mewujud sebagai jalinan nasib di esok hari."
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AncientKnowledgeView;
