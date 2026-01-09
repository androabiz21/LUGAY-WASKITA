
export enum AppView {
  HOME = 'home',
  LIBRARY = 'library',
  CALCULATOR = 'calculator',
  MATCHMAKING = 'matchmaking',
  ORAL_TRADITION = 'oral_tradition',
  PALMISTRY = 'palmistry',
  SILAT = 'silat',
  DREAM = 'dream',
  CARD_READING = 'card_reading',
  AMALAN = 'amalan',
  FACE_READING = 'face_reading',
  FENG_SHUI = 'feng_shui',
  MYSTICAL_DETECTION = 'mystical_detection',
  HEALING = 'healing',
  HANDWRITING_READING = 'handwriting_reading',
  CULTURE_TREASURY = 'culture_treasury',
  AKSARA_WASKITA = 'aksara_waskita',
  KHODAM_CHECK = 'khodam_check',
  ANCIENT_KNOWLEDGE = 'ancient_knowledge',
  GHOST_PORTAL = 'ghost_portal',
  PROFILE = 'profile'
}

export interface WetonResult {
  date: string;
  javaneseDate: string;
  neptu: number;
  character: string;
  element: string;
  careerMatch: string[];
}

export interface Manuscript {
  id: string;
  title: string;
  origin: string;
  category: string;
  summary: string;
  thumbnail: string;
}

export interface Mantra {
  id: string;
  name: string;
  category: string;
  text: string;
  translation: string;
  philosophy: string;
}
