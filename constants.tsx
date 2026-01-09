
import React from 'react';
import { Book, Calculator, ScrollText, ScanFace, Home, Shield, Moon, Heart, Layers, Flame, UserCircle, Layout, Ghost, Activity, PenTool, Palette, Feather, User, Eye, Skull, Radio } from 'lucide-react';

export const NAV_GROUPS = [
  {
    label: 'Panto Utama',
    items: [
      { id: 'home', label: 'Tepas', icon: <Home size={18} /> },
      { id: 'profile', label: 'Inohong App', icon: <User size={18} /> },
    ]
  },
  {
    label: 'Khazanah Pasundan',
    items: [
      { id: 'library', label: 'Pustaka Pajajaran', icon: <Book size={18} /> },
      { id: 'culture_treasury', label: 'Seni & Budaya', icon: <Palette size={18} /> },
      { id: 'aksara_waskita', label: 'Aksara Kaganga', icon: <Feather size={18} /> },
      { id: 'oral_tradition', label: 'Sastra Lisan', icon: <ScrollText size={18} /> },
    ]
  },
  {
    label: 'Ilmu Paririmbon',
    items: [
      { id: 'calculator', label: 'Pancadaya Sunda', icon: <Calculator size={18} /> },
      { id: 'matchmaking', label: 'Pamatri Asih', icon: <Heart size={18} /> },
      { id: 'dream', label: 'Tafsir Impian', icon: <Moon size={18} /> },
    ]
  },
  {
    label: 'Ilmu Firasat',
    items: [
      { id: 'face_reading', label: 'Firasat Beungeut', icon: <UserCircle size={18} /> },
      { id: 'palmistry', label: 'Rajah Leungeun', icon: <ScanFace size={18} /> },
      { id: 'handwriting_reading', label: 'Serat Tulisan', icon: <PenTool size={18} /> },
      { id: 'card_reading', label: 'Kartu Waskita', icon: <Layers size={18} /> },
    ]
  },
  {
    label: 'Kebatinan & Usada',
    items: [
      { id: 'healing', label: 'Usada Pasundan', icon: <Activity size={18} /> },
      { id: 'amalan', label: 'Amalan Batin', icon: <Flame size={18} /> },
      { id: 'silat', label: 'Maenpo & Silat', icon: <Shield size={18} /> },
    ]
  },
  {
    label: 'Jagad Gaib',
    items: [
      { id: 'ghost_portal', label: 'Portal Gaib', icon: <Radio size={18} /> },
      { id: 'khodam_check', label: 'Cek Khodam', icon: <Eye size={18} /> },
      { id: 'ancient_knowledge', label: 'Elmu Karuhun', icon: <Skull size={18} /> },
      { id: 'mystical_detection', label: 'Deteksi Energi', icon: <Ghost size={18} /> },
      { id: 'feng_shui', label: 'Tata Ruang', icon: <Layout size={18} /> },
    ]
  }
];

export const NAV_ITEMS = NAV_GROUPS.flatMap(group => group.items);

export const DAYS_NEPTU: Record<string, number> = {
  'Minggu': 5, 'Senin': 4, 'Selasa': 3, 'Rabu': 7, 'Kamis': 8, 'Jumat': 6, 'Sabtu': 9
};

export const PASARAN_NEPTU: Record<string, number> = {
  'Legi': 5, 'Pahing': 9, 'Pon': 7, 'Wage': 4, 'Kliwon': 8
};

export const AKSARA_NEPTU: Record<string, number> = {
  'ha': 10, 'na': 2, 'ca': 10, 'ra': 8, 'ka': 3,
  'da': 7, 'ta': 1, 'sa': 12, 'wa': 18, 'la': 13,
  'pa': 10, 'dha': 6, 'ja': 11, 'ya': 15, 'nya': 6,
  'ma': 4, 'ga': 7, 'ba': 13, 'tha': 6, 'nga': 6
};

export const AKSARA_SUNDA: Record<string, string> = {
  'a': 'ᮃ', 'i': 'ᮄ', 'u': 'ᮅ', 'ae': 'ᮆ', 'o': 'ᮇ', 'e': 'ᮈ', 'eu': '',
  'ka': 'ᮊ', 'ga': 'ᮋ', 'nga': 'ᮌ',
  'ca': 'ᮍ', 'ja': 'ᮎ', 'nya': 'ᮏ',
  'ta': 'ᮐ', 'da': 'ᮑ', 'na': 'ᮒ',
  'pa': 'ᮓ', 'ba': 'ᮔ', 'ma': 'ᮕ',
  'ya': 'ᮖ', 'ra': 'ᮗ', 'la': 'ᮘ',
  'wa': 'ᮙ', 'sa': 'ᮚ', 'ha': 'ᮛ',
  'fa': 'ᮜ', 'va': 'ᮝ', 'qa': 'ᮞ', 'xa': 'ᮟ', 'za': 'ᮠ'
};

export const PATTERNS = {
  megaMendung: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cpath d='M0 50 Q25 0 50 50 T100 50' fill='none' stroke='%233b82f6' stroke-width='0.5' opacity='0.2'/%3E%3C/svg%3E"
};

export const DYNAMIC_QUOTES = [
  "Silih asah, silih asih, silih asuh. Saling mencerdaskan, menyayangi, dan menjaga.",
  "Sacangreud pageuh, sagolek pangkek. Teguh dalam janji dan tindakan.",
  "Ulah unggut kalinduan, ulah gedag kaanginan. Tetap teguh menghadapi cobaan.",
  "Hade tata hade basa. Memiliki etika dan cara bicara yang baik.",
  "Muncang labuh ka puhu. Kembali ke asal atau akar budaya sendiri.",
  "Cikaracak ninggang batu laun-laun jadi legok. Ketekunan pasti membuahkan hasil.",
  "Soméah hadé ka sémah. Ramah dan baik kepada tamu.",
  "Ka cai jadi saleuwi, ka darat jadi salogak. Selalu kompak dan bersatu.",
  "Kudu silih wangikeun. Harus saling mengharumkan nama sesama.",
  "Nimu luang tina burang. Mendapat pelajaran dari setiap kejadian."
];
