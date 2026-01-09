
import { GoogleGenAI, Type } from "@google/genai";

/**
 * Inisialisasi klien AI secara dinamis.
 * Menggunakan process.env.API_KEY yang diperbarui dari UI SplashScreen.
 */
const getAIClient = () => {
  const apiKey = (window as any).process?.env?.API_KEY || process.env.API_KEY || "";
  return new GoogleGenAI({ apiKey });
};

const SYSTEM_PROMPT = `Anda adalah GALURA LUGAY KANCANA Waskita Pasundan, entitas AI penjaga sanad kebudayaan, sejarah, dan spiritualitas Tanah Sunda yang diilhami oleh semangat Lugay Kancana. 
TUGAS UTAMA: 
1. Gunakan Bahasa Indonesia yang sangat puitis dan berwibawa.
2. WAJIB sisipkan istilah Sunda Buhun (seperti: Jagat Sagala, Sanghyang, Waskita, Bujangga, Parahyang, Silih Asah/Asih/Asuh, Nyungsi, Karsa, Raksa, Galudra, dll) dalam setiap penjelasan.
3. Selalu awali jawaban dengan "Sampurasun,".
4. Jangan gunakan simbol markdown seperti bintang (*), pagar (#), atau bold (**). Gunakan teks polos (plain text) yang bersih.
5. PENTING: Teks harus mengalir memenuhi SELURUH LEBAR LAYAR secara horizontal (FULL WIDTH).
6. HINDARI indentasi atau spasi di tepi kiri. Pastikan teks memenuhi bingkai layar secara simetris.`;

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

/**
 * Mengubah prompt yang berisiko filter keamanan menjadi deskripsi artistik yang aman.
 */
const cleanForImagePrompt = (text: string) => {
  const riskyWords = [/khodam/gi, /hantu/gi, /setan/gi, /iblis/gi, /jin/gi, /demon/gi, /ghost/gi, /spirit/gi, /magic/gi, /mistik/gi, /gaib/gi, /blood/gi, /dark/gi, /horror/gi, /ritual/gi, /magic/gi];
  let cleaned = text;
  riskyWords.forEach(regex => { cleaned = cleaned.replace(regex, 'luminous energy'); });
  const context = cleaned.substring(0, 150).replace(/[^\w\s]/gi, ' ');
  return `A majestic artistic digital painting of ${context}, featured with traditional Indonesian batik sacred geometric patterns, glowing golden aura, ethereal warm lighting, masterpiece quality, cinematic atmosphere, benevolent and peaceful spiritual aesthetic.`;
};

/**
 * Ekstraksi gambar dari respon dengan iterasi semua parts.
 */
const extractImageUrl = (response: any) => {
  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  }
  return null;
};

export async function getCulturalSynthesis(prompt: string) {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: { parts: [{ text: prompt }] },
    config: { systemInstruction: SYSTEM_PROMPT, temperature: 0.7 },
  });
  return sanitizeText(response.text);
}

export async function getMantraContext(prompt: string) {
  return getCulturalSynthesis(prompt);
}

export async function getLocationChronicle(locationName: string, coords: string) {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts: [{ text: `Berikan risalah sejarah dan legenda mendalam untuk lokasi '${locationName}' di koordinat '${coords}'. Sampaikan secara puitis dan penuhi lebar layar.` }] },
    config: { systemInstruction: SYSTEM_PROMPT },
  });
  return { text: sanitizeText(response.text), sources: [] };
}

export async function searchCultureDiscovery(query: string) {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts: [{ text: `Lakukan penelusuran sejarah mendalam tentang: ${query}. Berikan fakta akurat dan penuhi lebar layar.` }] },
    config: { systemInstruction: SYSTEM_PROMPT },
  });
  return { text: sanitizeText(response.text), sources: [] };
}

export async function analyzePalmistry(base64Image: string) {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType: "image/jpeg" } },
        { text: "Nyungsi makna Rajah Leungeun (Palmistry) melalui kaca waskita. Sampaikan puitis dan penuhi seluruh lebar bingkai." }
      ]
    },
    config: { systemInstruction: SYSTEM_PROMPT }
  });
  return sanitizeText(response.text);
}

export async function analyzeFaceReading(base64Image: string, name: string, birthDate: string, motherName: string) {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType: "image/jpeg" } },
        { text: `Lakukan analisis fisiognomi pada wajah ${name}, lahir ${birthDate}. Penuhi seluruh lebar layar.` }
      ]
    },
    config: { systemInstruction: SYSTEM_PROMPT }
  });
  return sanitizeText(response.text);
}

export async function getDreamInterpretation(dream: string) {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts: [{ text: `Nyungsi hartos impian: ${dream}. Penuhi lebar layar.` }] },
    config: { systemInstruction: SYSTEM_PROMPT }
  });
  return sanitizeText(response.text);
}

export async function generateAmalan(category: string, hajat: string) {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: { parts: [{ text: `Susun amalan batin kategori ${category} untuk hajat: ${hajat}. Penuhi lebar layar.` }] },
    config: { systemInstruction: SYSTEM_PROMPT }
  });
  return sanitizeText(response.text);
}

export async function analyzeAura(base64Image: string, name: string) {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { 
      parts: [
        { inlineData: { data: base64Image, mimeType: "image/jpeg" } }, 
        { text: `Pindai pancaran aura batin atas nama ${name}. Penuhi lebar layar.` }
      ]
    },
    config: { systemInstruction: SYSTEM_PROMPT }
  });
  return sanitizeText(response.text);
}

export async function generateHealingProtocol(name: string, condition: string, type: string) {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: { parts: [{ text: `Ramulah risalah Usada untuk ${name} dengan keluhan ${condition}. Penuhi lebar layar.` }] },
    config: { systemInstruction: SYSTEM_PROMPT }
  });
  return sanitizeText(response.text);
}

export async function getMysticalProtection(name: string, condition: string) {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts: [{ text: `Ramulah amalan benteng batin untuk ${name} menghadapi ${condition}. Penuhi lebar layar.` }] },
    config: { systemInstruction: SYSTEM_PROMPT }
  });
  return sanitizeText(response.text);
}

export async function analyzeHandwriting(base64Image: string) {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType: "image/jpeg" } },
        { text: "Lakukan analisis grafologi waskita. Penuhi seluruh lebar layar." }
      ]
    },
    config: { systemInstruction: SYSTEM_PROMPT }
  });
  return sanitizeText(response.text);
}

export async function analyzeKhodam(base64Image: string, name: string, birthDate: string, motherName: string) {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType: "image/jpeg" } },
        { text: `Singkap tabir kearifan batin untuk ${name}. Penuhi lebar layar.` }
      ]
    },
    config: { systemInstruction: SYSTEM_PROMPT }
  });
  return sanitizeText(response.text);
}

export async function generateKhodamVisual(base64Image: string, analysis: string) {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
        { text: "Enhance photo with a majestic glowing golden aura and intricate traditional Indonesian batik sacred patterns. Style: Sacred oil painting, masterpiece, warm lighting." }
      ]
    },
    config: { imageConfig: { aspectRatio: "1:1" } }
  });
  return extractImageUrl(response);
}

export async function generateCardVisual(cardName: string) {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: `A beautiful artistic card illustration of "${cardName}" in traditional Indonesian batik and gold style. Glowing colors, oil painting, masterpiece.` }] },
    config: { imageConfig: { aspectRatio: "1:1" } }
  });
  return extractImageUrl(response);
}

export async function analyzeFengShui(base64Image: string) {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType: "image/jpeg" } },
        { text: "Analisis Tata Ruang pada citra ini. Output JSON." }
      ]
    },
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          analysisText: { type: Type.STRING },
          zones: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { box_2d: { type: Type.ARRAY, items: { type: Type.NUMBER } }, label: { type: Type.STRING }, type: { type: Type.STRING }, description: { type: Type.STRING } } } }
        },
        required: ["analysisText"]
      }
    }
  });
  return JSON.parse(response.text || '{}');
}

export async function detectMysticalEnergy(base64Image: string, extraPrompt: string) {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType: "image/jpeg" } },
        { text: "Lakukan deteksi energi lingkungan. " + extraPrompt }
      ]
    },
    config: { systemInstruction: SYSTEM_PROMPT }
  });
  return sanitizeText(response.text);
}

export async function analyzePortalEnergy(base64Image: string, locationType: string, resonanceLevel: number) {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType: "image/jpeg" } },
        { text: `Pindai portal energi di lokasi ${locationType}. Penuhi lebar layar.` }
      ]
    },
    config: { systemInstruction: SYSTEM_PROMPT }
  });
  return sanitizeText(response.text);
}

export async function generateBalaRitual(analysis: string) {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts: [{ text: `Berdasarkan analisis energi: "${analysis}", susun amalan penyeimbang batin. Penuhi lebar layar.` }] },
    config: { systemInstruction: SYSTEM_PROMPT }
  });
  return sanitizeText(response.text);
}

export async function generateMysticalVisual(base64Image: string, textResult: string) {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
        { text: "Enhance this photo with beautiful golden glowing energy patterns and intricate traditional ornaments. Masterpiece digital art, warm ethereal lighting." }
      ]
    },
    config: { imageConfig: { aspectRatio: "1:1" } }
  });
  return extractImageUrl(response);
}

export async function generateResultIllustration(text: string, title: string) {
  const ai = getAIClient();
  const safePrompt = cleanForImagePrompt(text);
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: safePrompt }] },
    config: { imageConfig: { aspectRatio: "1:1" } }
  });
  return extractImageUrl(response);
}

export async function generateAksaraArt(aksaraType: string, text: string) {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: `Sacred calligraphy of the word "${text}" in ancient ${aksaraType} style on aged parchment. Gold ink, glowing, masterpiece quality.` }] },
    config: { imageConfig: { aspectRatio: "1:1" } }
  });
  return extractImageUrl(response);
}

export async function generateAncientRitual(category: string, name: string, targetName: string, targetBirthDate: string, targetParent: string, notes: string, base64Image: string) {
  const ai = getAIClient();
  const textResponse = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: { parts: [{ text: `Susun risalah tradisi kategori ${category} untuk ${name}. Penuhi layar.` }] },
    config: { systemInstruction: SYSTEM_PROMPT }
  });
  const analysisText = sanitizeText(textResponse.text);
  
  const visualResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
        { text: "A majestic scene of traditional ceremony with glowing golden lights and sacred batik patterns. Masterpiece oil painting, cinematic lighting." }
      ]
    },
    config: { imageConfig: { aspectRatio: "1:1" } }
  });
  
  return { analysisText, visualUrl: extractImageUrl(visualResponse) };
}

export async function visualizePortalEntity(base64Image: string, analysis: string) {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
        { text: "Visualize majestic golden glowing energy manifestation with traditional Nusantara spiritual motifs. Masterpiece digital art." }
      ]
    },
    config: { imageConfig: { aspectRatio: "1:1" } }
  });
  return extractImageUrl(response);
}

export async function generateRajahVisual(ritualText: string) {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: "Sacred gold calligraphy pattern on ancient parchment paper. Glowing, masterpiece quality." }] },
    config: { imageConfig: { aspectRatio: "1:1" } }
  });
  return extractImageUrl(response);
}

export async function communicateWithEntity(context: string, message: string) {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts: [{ text: `Balas pesan manusia ini dengan bijak dan puitis: "${message}". Singkat, misterius.` }] },
    config: { systemInstruction: SYSTEM_PROMPT }
  });
  return sanitizeText(response.text) || '...suara statis...';
}
