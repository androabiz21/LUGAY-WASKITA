
import React, { useMemo } from 'react';
import { Shield, Award, MapPin, Landmark, History, Home, Briefcase, School } from 'lucide-react';
import { AppView } from '../types.ts';

const ProfileView: React.FC<{ onNavigate: (view: AppView) => void }> = ({ onNavigate }) => {
  // Identitas Inohong Pembuat Aplikasi (Sesuai Permintaan: Jangan Dirubah)
  const creatorName = "Kang Dodi Lugay";
  
  // Mengambil nama user yang sedang login untuk narasi
  const activeUser = useMemo(() => {
    return localStorage.getItem('waskita_user') || 'Sadhaka';
  }, []);

  const credentials = [
    { icon: <Shield className="text-blue-600" size={18} />, label: "Guru Besar Lugay Kancana", desc: "Penerus Sanad Maenpo Purwakarta" },
    { icon: <Briefcase className="text-blue-600" size={18} />, label: "Sekretaris APN", desc: "Asosiasi Pesilat Nusantara" },
    { icon: <Award className="text-blue-600" size={18} />, label: "Tokoh Budaya Pasundan", desc: "Pelestari Nilai Pajajaran Kiwari" },
    { icon: <School className="text-blue-600" size={18} />, label: "Penyusun Kurikulum", desc: "Program Pencak Silat di Jawa Barat" },
  ];

  return (
    <div className="space-y-12 bg-stone-950 pt-8 pb-20 px-1 md:px-4 text-stone-100 min-h-screen">
      <header className="px-4">
        <button onClick={() => onNavigate(AppView.HOME)} className="flex items-center gap-2 text-stone-500 hover:text-blue-500 transition-colors mb-6 group">
          <div className="p-2 rounded-full group-hover:bg-blue-900/20 transition-colors"><Home size={18} /></div>
          <span className="font-bold uppercase tracking-widest text-[10px]">Beranda</span>
        </button>
      </header>

      <section className="relative p-6 md:p-16 bg-stone-900/40 md:rounded-[60px] border-y md:border border-stone-800 overflow-hidden shadow-2xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row items-center gap-12 relative z-10">
          <div className="shrink-0 relative">
            <div className="w-56 h-56 md:w-80 md:h-80 rounded-[60px] overflow-hidden border-4 border-stone-800 p-1 bg-stone-900 shadow-2xl rotate-3">
               <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEikK-hpLB9cZkZiExxIPKP1e-kSNGPtqNezky0GnctRB7pDJT5uJMLPPmRid13b7SDNOTwc3Pt-USU7810k4iaVW2vtJ5mEMxYpIfPglKKuJ0PN8EjlKW51xuEIAal-wj9OwvnswZ67T4JbzJHvvJ7OQgYOmHKTxf2i6D2hHepBxhq6eIAtp025_IGYVbA/s1632/1741190292888.jpg" alt="Tokoh" className="w-full h-full object-cover rounded-[50px] shadow-inner grayscale group-hover:grayscale-0 transition-all duration-1000" />
            </div>
          </div>
          <div className="flex-1 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-600 text-stone-950 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg">Inohong Pembuat Aplikasi</div>
            <h1 className="text-5xl md:text-8xl font-heritage font-bold text-white text-glow-amber tracking-tight leading-none uppercase">{creatorName}</h1>
            <div className="flex flex-wrap justify-center lg:justify-start gap-6 mt-6">
              <div className="flex items-center gap-2 text-stone-500 font-bold text-[10px] uppercase tracking-widest"><MapPin size={14} className="text-blue-700" /> Purwakarta / Jagat Digital</div>
              <div className="flex items-center gap-2 text-stone-500 font-bold text-[10px] uppercase tracking-widest"><Landmark size={14} className="text-blue-700" /> Lugay Kancana</div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 px-4 md:px-0">
        <div className="xl:col-span-8 space-y-12">
           <section className="space-y-8">
             <div className="flex items-center gap-4 border-b border-stone-800 pb-4">
               <History className="text-blue-600 animate-pulse" size={24} />
               <h2 className="text-3xl font-heritage font-bold text-white uppercase tracking-wider">Lalakon Hirup</h2>
             </div>
             <div className="p-6 md:p-16 bg-stone-900/30 border border-stone-800 rounded-[40px] italic text-stone-100 text-lg md:text-3xl leading-relaxed text-justify shadow-inner space-y-8 font-medium">
               <p>
                 Selamat datang, <span className="text-blue-400 font-bold">{activeUser}</span>. Anda kini terhubung ke dalam ekosistem digital 
                 Galura Lugay Kancana. Sesuai visi <span className="text-white font-bold">{creatorName}</span>, aplikasi ini dirancang untuk membantu Anda merajut 
                 kearifan purba Pasundan dengan kecanggihan waskita masa depan.
               </p>
               <p>
                 Sanad Lugay Kancana berakar pada ajaran Maenpo yang mementingkan olah rasa dan keseimbangan. Melalui 
                 gerbang ini, setiap langkah Anda diawasi oleh nilai-nilai luhur silih asah, silih asih, dan silih asuh.
               </p>
             </div>
           </section>
        </div>
        <div className="xl:col-span-4 space-y-8">
          <div className="p-8 bg-stone-900/50 rounded-[40px] border border-stone-800 space-y-8 shadow-2xl backdrop-blur-md">
            <h3 className="text-xl font-heritage font-bold text-white text-glow-amber flex items-center gap-2 border-b border-stone-800 pb-4">
              <Award size={20} className="text-blue-600" /> Sanad Pengampu
            </h3>
            <div className="space-y-6">
              {credentials.map((c, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className="shrink-0 w-12 h-12 bg-stone-950 rounded-2xl flex items-center justify-center border border-stone-800 text-blue-600 shadow-inner group-hover:bg-blue-600 group-hover:text-stone-950 transition-all">
                    {c.icon}
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-black text-white uppercase tracking-widest">{c.label}</p>
                    <p className="text-[10px] text-stone-600 font-bold italic">{c.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
