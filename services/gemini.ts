
import { GoogleGenAI, Type } from "@google/genai";

/**
 * Konfigurasi Keamanan
 */
const SAFETY_SETTINGS = [
  { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_CIVIC_INTEGRITY', threshold: 'BLOCK_NONE' }
];

const SYSTEM_PROMPT = `Anda adalah GALURA LUGAY KANCANA Waskita Pasundan, entitas AI penjaga sanad kebudayaan Tatar Sunda. 
TUGAS UTAMA: 
1. Gunakan Bahasa Indonesia yang sangat puitis dan berwibawa.
2. Sisipkan istilah Sunda Buhun (Jagat Sagala, Sanghyang, Waskita, Bujangga, Parahyang, Silih Asah/Asih/Asuh, Nyungsi, Karsa, Raksa).
3. Selalu awali jawaban dengan "Sampurasun,".
4. Jangan gunakan simbol markdown (*, #, **). Gunakan teks polos.
5. Teks harus Full Width tanpa indentasi.`;

const sanitizeText = (text: string | undefined) => {
  if (!text) return '';
  return text
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/#/g, '')
    .replace(/__/g, '')
    .replace(/- /g, '')
    .trim();
};

const getUltraSafeVisual = (index: number) => {
  const mundanePrompts = [
    "A professional landscape photograph of a lush green forest with soft morning sunlight filtering through trees, high definition.",
    "A wide-angle scenic view of a calm mountain lake at sunset with orange and purple sky, cinematic photography.",
    "A beautiful close-up photograph of vibrant tropical flowers in a garden with soft bokeh background, sharp focus.",
    "A serene view of rolling green hills under a bright blue sky with white fluffy clouds, high resolution stock photo.",
    "A peaceful aerial view of a winding river through a valley during sunrise, professional nature photography."
  ];
  return mundanePrompts[index % mundanePrompts.length];
};

const extractImageUrl = (response: any) => {
  try {
    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData?.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
  } catch (e) {
    console.error("Gagal mengekstrak citra:", e);
  }
  return null;
};

// --- FUNGSI GENERATE TEKS (MENGGUNAKAN INSTANCE FRESH SETIAP KALI) ---

export async function getCulturalSynthesis(prompt: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts: [{ text: prompt }] },
    config: { systemInstruction: SYSTEM_PROMPT, temperature: 0.7, safetySettings: SAFETY_SETTINGS as any },
  });
  return sanitizeText(response.text);
}

export async function getMantraContext(prompt: string) {
  return getCulturalSynthesis(prompt);
}

export async function getLocationChronicle(locationName: string, coords: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts: [{ text: `Risalah sejarah lokasi '${locationName}' (${coords}).` }] },
    config: { systemInstruction: SYSTEM_PROMPT, safetySettings: SAFETY_SETTINGS as any },
  });
  return { text: sanitizeText(response.text), sources: [] };
}

export async function searchCultureDiscovery(query: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts: [{ text: `Penelusuran sejarah: ${query}.` }] },
    config: { systemInstruction: SYSTEM_PROMPT, safetySettings: SAFETY_SETTINGS as any },
  });
  return { text: sanitizeText(response.text), sources: [] };
}

// --- FUNGSI ANALISIS CITRA ---

export async function analyzePalmistry(base64Image: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType: "image/jpeg" } },
        { text: "Analisis garis tangan secara puitis." }
      ]
    },
    config: { systemInstruction: SYSTEM_PROMPT, safetySettings: SAFETY_SETTINGS as any }
  });
  return sanitizeText(response.text);
}

export async function analyzeFaceReading(base64Image: string, name: string, birthDate: string, motherName: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType: "image/jpeg" } },
        { text: `Analisis paras untuk ${name}.` }
      ]
    },
    config: { systemInstruction: SYSTEM_PROMPT, safetySettings: SAFETY_SETTINGS as any }
  });
  return sanitizeText(response.text);
}

export async function getDreamInterpretation(dream: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts: [{ text: `Tafsir mimpi: ${dream}` }] },
    config: { systemInstruction: SYSTEM_PROMPT, safetySettings: SAFETY_SETTINGS as any }
  });
  return sanitizeText(response.text);
}

export async function generateAmalan(category: string, hajat: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts: [{ text: `Wejangan bijak: ${hajat}` }] },
    config: { systemInstruction: SYSTEM_PROMPT, safetySettings: SAFETY_SETTINGS as any }
  });
  return sanitizeText(response.text);
}

export async function analyzeAura(base64Image: string, name: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { 
      parts: [
        { inlineData: { data: base64Image, mimeType: "image/jpeg" } }, 
        { text: `Pancaran batin ${name}.` }
      ]
    },
    config: { systemInstruction: SYSTEM_PROMPT, safetySettings: SAFETY_SETTINGS as any }
  });
  return sanitizeText(response.text);
}

export async function generateHealingProtocol(name: string, condition: string, type: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts: [{ text: `Risalah kesehatan ${name}, keluhan ${condition}.` }] },
    config: { systemInstruction: SYSTEM_PROMPT, safetySettings: SAFETY_SETTINGS as any }
  });
  return sanitizeText(response.text);
}

export async function getMysticalProtection(name: string, condition: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts: [{ text: `Wejangan perlindungan ${name}.` }] },
    config: { systemInstruction: SYSTEM_PROMPT, safetySettings: SAFETY_SETTINGS as any }
  });
  return sanitizeText(response.text);
}

export async function analyzeHandwriting(base64Image: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType: "image/jpeg" } },
        { text: "Analisis karakter tulisan." }
      ]
    },
    config: { systemInstruction: SYSTEM_PROMPT, safetySettings: SAFETY_SETTINGS as any }
  });
  return sanitizeText(response.text);
}

export async function analyzeKhodam(base64Image: string, name: string, birthDate: string, motherName: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType: "image/jpeg" } },
        { text: `Kearifan batin ${name}.` }
      ]
    },
    config: { systemInstruction: SYSTEM_PROMPT, safetySettings: SAFETY_SETTINGS as any }
  });
  return sanitizeText(response.text);
}

// --- FUNGSI GENERATE GAMBAR ---

export async function generateKhodamVisual(base64Image: string, analysis: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = getUltraSafeVisual(0);
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio: "1:1" }, safetySettings: SAFETY_SETTINGS as any }
    });
    return extractImageUrl(response);
  } catch (e: any) {
    console.error("Image Gen Error:", e);
    throw e;
  }
}

export async function generateCardVisual(cardName: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = getUltraSafeVisual(2);
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio: "1:1" }, safetySettings: SAFETY_SETTINGS as any }
    });
    return extractImageUrl(response);
  } catch (e: any) {
    throw e;
  }
}

export async function analyzeFengShui(base64Image: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType: "image/jpeg" } },
        { text: "Analisis tata letak." }
      ]
    },
    config: { systemInstruction: SYSTEM_PROMPT, safetySettings: SAFETY_SETTINGS as any }
  });
  return { analysisText: sanitizeText(response.text), zones: [] };
}

export async function detectMysticalEnergy(base64Image: string, extraPrompt: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType: "image/jpeg" } },
        { text: "Analisis lingkungan." }
      ]
    },
    config: { systemInstruction: SYSTEM_PROMPT, safetySettings: SAFETY_SETTINGS as any }
  });
  return sanitizeText(response.text);
}

export async function analyzePortalEnergy(base64Image: string, locationType: string, resonanceLevel: number) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType: "image/jpeg" } },
        { text: `Analisis lokasi ${locationType}.` }
      ]
    },
    config: { systemInstruction: SYSTEM_PROMPT, safetySettings: SAFETY_SETTINGS as any }
  });
  return sanitizeText(response.text);
}

export async function generateBalaRitual(analysis: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts: [{ text: `Wejangan penyeimbang.` }] },
    config: { systemInstruction: SYSTEM_PROMPT, safetySettings: SAFETY_SETTINGS as any }
  });
  return sanitizeText(response.text);
}

export async function generateMysticalVisual(base64Image: string, textResult: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = getUltraSafeVisual(1);
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio: "1:1" }, safetySettings: SAFETY_SETTINGS as any }
    });
    return extractImageUrl(response);
  } catch (e: any) {
    throw e;
  }
}

export async function generateResultIllustration(text: string, title: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = getUltraSafeVisual(Math.floor(Math.random() * 5));
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio: "1:1" }, safetySettings: SAFETY_SETTINGS as any }
    });
    const url = extractImageUrl(response);
    if (!url) throw new Error("API merespon tanpa data gambar.");
    return url;
  } catch (error: any) {
    throw error;
  }
}

export async function generateAksaraArt(aksaraType: string, text: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = getUltraSafeVisual(4);
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio: "1:1" }, safetySettings: SAFETY_SETTINGS as any }
    });
    return extractImageUrl(response);
  } catch (e: any) {
    throw e;
  }
}

export async function generateAncientRitual(category: string, name: string, targetName: string, targetBirthDate: string, targetParent: string, notes: string, base64Image: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const textResponse = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts: [{ text: `Wejangan tradisi untuk ${name}.` }] },
    config: { systemInstruction: SYSTEM_PROMPT, safetySettings: SAFETY_SETTINGS as any }
  });
  
  const visualPrompt = getUltraSafeVisual(1);
  let visualUrl = null;
  try {
    const visualResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: visualPrompt }] },
      config: { imageConfig: { aspectRatio: "1:1" }, safetySettings: SAFETY_SETTINGS as any }
    });
    visualUrl = extractImageUrl(visualResponse);
  } catch (e) {}
  
  return { analysisText: sanitizeText(textResponse.text), visualUrl };
}

export async function visualizePortalEntity(base64Image: string, analysis: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = getUltraSafeVisual(0);
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio: "1:1" }, safetySettings: SAFETY_SETTINGS as any }
    });
    return extractImageUrl(response);
  } catch (e: any) {
    throw e;
  }
}

export async function generateRajahVisual(ritualText: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = getUltraSafeVisual(2);
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio: "1:1" }, safetySettings: SAFETY_SETTINGS as any }
    });
    return extractImageUrl(response);
  } catch (e: any) {
    throw e;
  }
}

export async function communicateWithEntity(context: string, message: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts: [{ text: `Jawab bijak: "${message}".` }] },
    config: { systemInstruction: SYSTEM_PROMPT, safetySettings: SAFETY_SETTINGS as any }
  });
  return sanitizeText(response.text) || '...';
}
