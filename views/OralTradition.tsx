
import React, { useState } from 'react';
import { Volume2, ScrollText, Play, Info, Sparkles, Loader2, BookOpen, Shield, AlertTriangle, Zap, ArrowRight, Quote, Wind, Flame, Image as ImageIcon, Sparkle, Home, HeartHandshake, Smile, Handshake, Waves, Music } from 'lucide-react';
import { getMantraContext } from '../services/gemini.ts';
import ShareResult from '../components/ShareResult.tsx';
import { AppView } from '../types.ts';

const OralTraditionView: React.FC<{ onNavigate: (view: AppView) => void }> = ({ onNavigate }) => {
  const [selectedMantra, setSelectedMantra] = useState<any>(null);
  const [contextLoading, setContextLoading] = useState(false);
  const [aiContext, setAiContext] = useState('');

  const mantras = [
    { 
      id: 'sd-sas', 
      name: 'Silih Asah, Silih Asih, Silih Asuh', 
      category: 'Amanah Leluhur (Sunda)', 
      theme: 'filosofi',
      image: 'https://images.unsplash.com/photo-1516733968668-dbdce39c46ef?auto=format&fit=crop&q=80&w=1200',
      text: 'Silih Asah, Silih Asih, Silih Asuh', 
      translation: 'Saling Mencerdaskan, Saling Menyayangi, Saling Melindungi.',
      philosophy: 'Tiga pilar keharmonisan sosial yang menyeimbangkan kecerdasan intelektual, kasih sayang emosional, dan perlindungan batin.',
      ritual: 'Diaplikasikan dalam interaksi sosial sehari-hari sebagai bentuk pengabdian batin.',
      ethics: 'Kehilangan salah satu pilar akan merusak tatanan harmoni kemanusiaan.',
      icon: <HeartHandshake size={24} />
    },
    { 
      id: 'sd-sps', 
      name: 'Soméah Hadé ka Sémah', 
      category: 'Filosofi Ucapan (Sunda)', 
      theme: 'filosofi',
      image: 'https://images.unsplash.com/photo-1499933374294-4584851497cc?auto=format&fit=crop&q=80&w=1200',
      text: 'Soméah Hadé ka Sémah', 
      translation: 'Ramah dan Baik terhadap Tamu.',
      philosophy: 'Memuliakan tamu adalah refleksi dari kebersihan hati dan keterbukaan jiwa terhadap berkah semesta.',
      ritual: 'Menyambut setiap kedatangan dengan senyuman tulus dan penyajian terbaik.',
      ethics: 'Bentuk penghormatan tertinggi kepada Sang Maha Pemberi Tamu.',
      icon: <Smile size={24} />
    },
    { 
      id: 'sd-spp', 
      name: 'Sacangreud Pageuh Sagolek Pangkek', 
      category: 'Amanah Leluhur (Sunda)', 
      theme: 'filosofi',
      image: 'https://images.unsplash.com/photo-1501556466850-7c9fa1fccb4c?auto=format&fit=crop&q=80&w=1200',
      text: 'Sacangreud Pageuh, Sagolek Pangkek', 
      translation: 'Apa yang diikat harus kuat, apa yang diucap harus tetap.',
      philosophy: 'Integritas antara ucapan dan tindakan; kesetiaan pada janji sebagai martabat tertinggi manusia.',
      ritual: 'Dilakukan dengan menjaga lisan dari janji yang tidak mampu ditepati.',
      ethics: 'Ingkar janji adalah bentuk keruntuhan martabat batin.',
      icon: <Handshake size={24} />
    },
    { 
      id: 'kj-b1', 
      name: 'Aji Brajamusti', 
      category: 'Kejawen (Kekuatan)', 
      theme: 'kejawen',
      image: 'https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&q=80&w=1200',
      text: 'Sun amatek ajiku si Brajamusti, kang aneng Pringgondani, purubaya, purubaya, purubaya...', 
      translation: 'Aku merapal ajianku si Brajamusti, yang bersemayam di Pringgondani...',
      philosophy: 'Simbol ketangguhan batin dan perlindungan diri yang berakar pada figur Gatotkaca.',
      ritual: 'Puasa Mutih dan laku prihatin pada hari-hari sakral tertentu.',
      ethics: 'Hanya digunakan dalam kondisi terdesak demi kebenaran.',
      icon: <Flame size={24} />
    },
    { 
      id: 'sd-as', 
      name: 'Asihan Siliwangi', 
      category: 'Sunda (Kewibawaan)', 
      theme: 'sunda',
      image: 'https://images.unsplash.com/photo-1571401835393-8c5f3b39c6ec?auto=format&fit=crop&q=80&w=1200',
      text: 'Nyai Roro Kidul mawa kembang, kuring mawa cahaya Prabu Siliwangi...', 
      translation: 'Nyai Roro Kidul membawa bunga, aku membawa cahaya Prabu Siliwangi...',
      philosophy: 'Menanamkan rasa kasih sayang dan kewibawaan agung agar disegani dan dicintai sesama.',
      ritual: 'Wudu atau mandi kembang pada waktu fajar menyingsing.',
      ethics: 'Dilarang digunakan untuk niat jahat atau merusak rumah tangga orang lain.',
      icon: <Wind size={24} />
    },
    { 
      id: 'kj-sm', 
      name: 'Aji Semar Mesem', 
      category: 'Kejawen (Pengasihan)', 
      theme: 'kejawen',
      image: 'https://images.unsplash.com/photo-1598124146163-36819847286d?auto=format&fit=crop&q=80&w=1200',
      text: 'Ingsun amatak ajiku si semar mesem, mut-mutanku inten cahyane, tumancep kumantil ing telenging sanubariku...', 
      translation: 'Aku merapal ajian si semar tersenyum, dalam mulutku cahaya intan, tertancap di lubuk sanubari...',
      philosophy: 'Menaklukkan dunia dengan senyuman dan kedamaian batin, mencerminkan karakter Semar Badranaya.',
      ritual: 'Puasa pada hari Weton kelahiran.',
      ethics: 'Ketulusan hati adalah kunci utama; bukan untuk mempermainkan perasaan.',
      icon: <Sparkle size={24} />
    },
    { 
      id: 'sd-jp', 
      name: 'Jampi Pamunah', 
      category: 'Sunda (Penyembuhan)', 
      theme: 'sunda',
      image: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&q=80&w=800',
      text: 'Pun sapun ka luhur ka sang rumuhun, pamunah rasa anu teu nyata...', 
      translation: 'Mohon izin kepada para leluhur, pemusnah rasa yang tidak nyata (penyakit)...',
      philosophy: 'Sastra lisan untuk memohon kesembuhan dan penetralan energi negatif dalam tubuh.',
      ritual: 'Dibacakan pada segelas air putih yang kemudian diminumkan kepada yang sakit.',
      ethics: 'Harus disertai keyakinan penuh kepada Sang Pencipta.',
      icon: <Waves size={24} />
    },
    { 
      id: 'nt-rt', 
      name: 'Rajah Totolak', 
      category: 'Nusantara (Perlindungan)', 
      theme: 'nusantara',
      image: 'https://images.unsplash.com/photo-1596436889106-be35e843f974?auto=format&fit=crop&q=80&w=1200',
      text: 'Rajah tunggal, penjaga marwah, tulak bala ti opat penjuru...', 
      translation: 'Rajah tunggal, penjaga kehormatan, penolak bala dari empat penjuru...',
      philosophy: 'Manifestasi perlindungan ghaib terhadap gangguan lahir maupun batin.',
      ritual: 'Dituliskan pada media atau diucapkan dengan pernapasan perut yang dalam.',
      ethics: 'Menghargai kesucian simbol and tidak boleh takabur.',
      icon: <Shield size={24} />
    },
    { 
      id: 'kj-kd', 
      name: 'Kidungan Purwajati', 
      category: 'Kejawen (Suluk)', 
      theme: 'kejawen',
      image: 'https://images.unsplash.com/photo-1584810359583-96fc3448beaa?auto=format&fit=crop&q=80&w=1200',
      text: 'Ana kidung rumeksa ing wengi, teguh ayu luputa ing lara...', 
      translation: 'Ada nyanyian penjaga di waktu malam, kuat selamat terhindar dari penyakit...',
      philosophy: 'Sastra lisan berbentuk tembang sebagai doa perlindungan dan keselamatan jagad raya.',
      ritual: 'Ditembangkan saat hening malam (Laku Melek).',
      ethics: 'Menjaga kesucian nada dan penghayatan makna yang dalam.',
      icon: <Music size={24} />
    }
  ];

  const handleSelectMantra = async (m: any) => {
    setSelectedMantra(m);
    setContextLoading(true);
    setAiContext('');

    const prompt = `Bedah mendalam waskita untuk Sastra Lisan/Amanah Leluhur: '${m.name}' kategori ${m.category}. Teks/Ucapan: "${m.text}". Jelaskan asal-usul, tata cara (jika amalan) atau cara menerapkan (jika amanah) yang benar menurut tradisi, filosofi batin, dan peringatan etika. Gunakan gaya bahasa puitis waskita agung, berikan teks polos tanpa simbol bintang, dan pastikan tulisan memenuhi SELURUH LEBAR LAYAR secara maksimal (edge-to-edge).`;
    
    const result = await getMantraContext(prompt);
    setAiContext(result);
    setContextLoading(false);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20 px-0 md:px-10 pt-8 bg-stone-950 min-h-screen text-stone-100">
      <header className="space-y-6 px-4 md:px-0">
        <button 
          onClick={() => onNavigate(AppView.HOME)}
          className="flex items-center gap-2 text-stone-500 hover:text-amber-500 transition-colors mb-6 group"
        >
          <div className="p-2 rounded-full group-hover:bg-amber-900/20 transition-colors">
            <Home size={18} />
          </div>
          <span className="font-bold uppercase tracking-widest text-[10px]">Beranda</span>
        </button>
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="p-4 bg-stone-900 border border-stone-800 rounded-3xl text-amber-500 shadow-2xl shrink-0 w-fit">
            <ScrollText size={32} />
          </div>
          <div className="space-y-2">
            <h2 className="text-4xl md:text-6xl font-heritage font-bold text-white tracking-tight leading-none uppercase text-glow-amber">Sastra Lisan</h2>
            <p className="text-stone-400 text-sm md:text-xl italic font-medium max-w-4xl leading-relaxed">
              Amalan Kejawen, Amanah Leluhur, Filosofi Ucapan, dan Mantra Nusantara.
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 px-0 md:px-0">
        <div className="lg:col-span-4 space-y-4 px-4 md:px-0">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2">
            <h3 className="text-[10px] font-black text-stone-600 uppercase tracking-[0.3em]">Khazanah Waskita</h3>
          </div>
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 scrollbar-hide">
            {mantras.map(m => (
              <div 
                key={m.id}
                onClick={() => handleSelectMantra(m)}
                className={`p-5 bg-stone-900/40 rounded-2xl border cursor-pointer transition-all ${selectedMantra?.id === m.id ? 'border-amber-600 shadow-[0_0_20px_-10px_rgba(217,119,6,0.5)]' : 'border-stone-800 hover:border-stone-700'}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${selectedMantra?.id === m.id ? 'bg-amber-600 text-stone-950' : 'bg-stone-800 text-stone-500'}`}>{m.category}</span>
                  <div className={`transition-colors ${selectedMantra?.id === m.id ? 'text-amber-500' : 'text-stone-700'}`}>
                    {m.icon}
                  </div>
                </div>
                <h4 className={`text-lg font-heritage font-bold mb-1 ${selectedMantra?.id === m.id ? 'text-amber-500' : 'text-stone-100'}`}>{m.name}</h4>
                <p className="text-[10px] text-stone-600 italic line-clamp-1">"{m.text}"</p>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-8 px-0">
          {selectedMantra ? (
            <div className="space-y-8 animate-in slide-in-from-right duration-700 px-0">
              <div className="p-0 md:p-12 bg-stone-900/20 border-y md:border md:rounded-[40px] border-stone-800 space-y-8 relative overflow-hidden shadow-2xl">
                <div className="h-64 md:h-96 w-full relative overflow-hidden md:rounded-[32px] group">
                   <img 
                     src={selectedMantra.image} 
                     alt={selectedMantra.name} 
                     className="w-full h-full object-cover grayscale opacity-30 group-hover:grayscale-0 group-hover:opacity-40 transition-all duration-1000 brightness-50"
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent" />
                </div>
                
                <div className="flex flex-col md:flex-row gap-8 relative z-10 p-6 md:p-0">
                  <div className="flex-1 space-y-6">
                    <div className="flex items-center gap-3 border-b border-stone-800 pb-6">
                       <div className="p-3 bg-amber-600 rounded-2xl text-stone-950 shadow-xl shadow-amber-900/20">
                         {selectedMantra.icon}
                       </div>
                       <div>
                         <h3 className="text-3xl md:text-5xl font-heritage font-bold text-white text-glow-amber">{selectedMantra.name}</h3>
                         <p className="text-amber-700 text-[10px] font-black uppercase tracking-widest mt-1">{selectedMantra.category}</p>
                       </div>
                    </div>
                    <div className="space-y-4">
                      <p className="text-xl md:text-3xl font-heritage italic text-stone-200 leading-relaxed text-center p-8 md:p-12 bg-stone-950/50 rounded-3xl border border-stone-800 shadow-inner font-medium">
                        "{selectedMantra.text}"
                      </p>
                      <div className="px-4 text-center">
                        <p className="text-stone-500 text-xs italic">"{selectedMantra.translation}"</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 px-[1px] md:p-10 bg-stone-900/40 border-y md:border border-stone-800 md:rounded-[40px] shadow-sm">
                  <div className="flex items-center gap-3 text-amber-500 mb-6 px-4 md:px-0">
                    <Sparkles size={24} className="animate-pulse" />
                    <h4 className="font-heritage text-2xl font-bold uppercase tracking-wider">Bedah Waskita</h4>
                  </div>
                  {contextLoading ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-4 text-amber-600/60">
                      <div className="relative">
                        <div className="w-16 h-16 border-4 border-amber-900 border-t-amber-600 rounded-full animate-spin"></div>
                        <ScrollText className="absolute inset-0 m-auto text-amber-500" size={20} />
                      </div>
                      <p className="font-heritage italic text-xl animate-pulse">Membuka sanad risalah...</p>
                    </div>
                  ) : (
                    <div className="space-y-12 animate-in fade-in duration-1000 px-0">
                      <div className="text-stone-100 text-lg md:text-3xl leading-relaxed italic text-justify whitespace-pre-wrap px-1 md:px-0 w-full bg-stone-950/50 md:p-16 p-6 px-[1px] md:rounded-[32px] border-y md:border border-stone-800 shadow-inner font-medium">
                        {aiContext || "Menanti wejangan waskita..."}
                      </div>
                      <div className="px-4 md:px-0">
                        {aiContext && <ShareResult title={`Bedah Sastra: ${selectedMantra.name}`} text={aiContext} />}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[500px] bg-stone-900/20 border-y md:border md:rounded-[40px] border-dashed border-stone-800 flex flex-col items-center justify-center text-stone-700 p-12 text-center space-y-6 opacity-40 italic mx-4 md:mx-0">
              <ScrollText size={64} />
              <p className="text-xl font-heritage">Pilih salah satu bait amalan untuk menyingkap rahasia batin.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OralTraditionView;
