
import React, { useState } from 'react';
import { Share2, Copy, Image as ImageIcon, Download, Check, Loader2, Sparkles, X } from 'lucide-react';
import { generateResultIllustration } from '../services/gemini.ts';

interface ShareResultProps {
  title: string;
  text: string;
  context?: string;
}

const ShareResult: React.FC<ShareResultProps> = ({ title, text, context }) => {
  const [copied, setCopied] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);

  const handleCopy = async () => {
    const fullText = `[${title}]\n${context ? `Konteks: ${context}\n\n` : ''}${text}\n\n-- Dibagikan dari Gerbang Waskita Nusantara --`;
    await navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateIllustration = async () => {
    setIsGeneratingImage(true);
    const url = await generateResultIllustration(text, title);
    if (url) {
      setGeneratedImageUrl(url);
      setShowImageModal(true);
    } else {
      alert("Gagal menenun ilustrasi batin. Sila coba lagi.");
    }
    setIsGeneratingImage(false);
  };

  const downloadImage = () => {
    if (!generatedImageUrl) return;
    const link = document.createElement('a');
    link.href = generatedImageUrl;
    link.download = `Waskita_Nusantara_${title.replace(/\s+/g, '_')}.png`;
    link.click();
  };

  return (
    <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-stone-800/50 mt-6">
      <div className="text-[10px] font-black text-stone-600 uppercase tracking-widest flex items-center gap-2">
        <Share2 size={12} /> Bagikan Risalah
      </div>
      
      <div className="flex gap-2">
        <button 
          onClick={handleCopy}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border ${copied ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-amber-500 hover:border-amber-600/30'}`}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Tersalin' : 'Salin Teks'}
        </button>

        <button 
          onClick={handleGenerateIllustration}
          disabled={isGeneratingImage}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border bg-stone-900 border-stone-800 text-stone-400 hover:text-amber-500 hover:border-amber-600/30 disabled:opacity-50"
        >
          {isGeneratingImage ? <Loader2 size={14} className="animate-spin" /> : <ImageIcon size={14} />}
          {isGeneratingImage ? 'Menenun...' : 'Ilustrasi AI'}
        </button>
      </div>

      {showImageModal && generatedImageUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="max-w-md w-full glass-panel rounded-[40px] border border-amber-600/30 p-8 relative shadow-2xl animate-in zoom-in duration-300">
            <button 
              onClick={() => setShowImageModal(false)}
              className="absolute top-6 right-6 p-2 text-stone-500 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-amber-500">
                <Sparkles size={20} />
                <h3 className="font-heritage text-xl font-bold uppercase tracking-wider">Ilustrasi Batin</h3>
              </div>
              
              <div className="aspect-square w-full rounded-3xl overflow-hidden border border-amber-900/30 bg-stone-950 shadow-inner">
                <img src={generatedImageUrl} alt="Waskita Illustration" className="w-full h-full object-cover" />
              </div>
              
              <p className="text-[10px] text-stone-500 italic text-center">
                Visualisasi ini ditenun secara unik oleh AI Waskita berdasarkan inti risalah spiritual Anda.
              </p>
              
              <button 
                onClick={downloadImage}
                className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-black font-black rounded-xl transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 uppercase tracking-widest text-xs"
              >
                <Download size={18} /> UNDUH GAMBAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShareResult;
