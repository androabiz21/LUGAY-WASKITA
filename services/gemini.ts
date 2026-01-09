
import { GoogleGenAI, Type } from "@google/genai";

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

const cleanForImagePrompt = (text: string) => {
  const riskyWords = [/khodam/gi, /hantu/gi, /setan/gi, /iblis/gi, /jin/gi, /demon/gi, /ghost/gi, /spirit/gi, /magic/gi, /mistik/gi, /gaib/gi, /blood/gi, /dark/gi, /horror/gi];
  let cleaned = text;
  riskyWords.forEach(regex => { cleaned = cleaned.replace(regex, 'luminous energy'); });
  return `A majestic artistic digital painting, ${cleaned.substring(0, 150).replace(/[^\w\s]/gi, ' ')}, traditional Indonesian batik patterns, glowing golden aura, masterpiece quality, cinematic lighting, benevolent spiritual atmosphere.`;
};

/**
 * Fungsi pembantu untuk mengekstrak gambar dari respon Gemini.
 * Sesuai aturan: Iterasi semua parts, jangan asumsikan part pertama adalah gambar.
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
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: { systemInstruction: SYSTEM_PROMPT, temperature: 0.7 },
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
    contents: `Berikan risalah sejarah dan legenda untuk lokasi '${locationName}' di koordinat '${coords}'. Penuhi lebar layar.`,
    config: { systemInstruction: SYSTEM_PROMPT, tools: [{ googleSearch: {} }] },
  });
  return { text: sanitizeText(response.text), sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [] };
}

export async function searchCultureDiscovery(query: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: query,
    config: { systemInstruction: SYSTEM_PROMPT, tools: [{ googleSearch: {} }] },
  });
  return { text: sanitizeText(response.text), sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [] };
}

export async function analyzePalmistry(base64Image: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Nyungsi hartos impian: ${dream}. Penuhi lebar layar.`,
    config: { systemInstruction: SYSTEM_PROMPT }
  });
  return sanitizeText(response.text);
}

export async function generateAmalan(category: string, hajat: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Susun amalan batin kategori ${category} untuk hajat: ${hajat}. Penuhi lebar layar.`,
    config: { systemInstruction: SYSTEM_PROMPT, thinkingConfig: { thinkingBudget: 4000 } }
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
        { text: `Pindai pancaran aura batin atas nama ${name}. Penuhi lebar layar.` }
      ]
    },
    config: { systemInstruction: SYSTEM_PROMPT }
  });
  return sanitizeText(response.text);
}

export async function generateHealingProtocol(name: string, condition: string, type: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Ramulah risalah Usada untuk ${name} dengan keluhan ${condition}. Penuhi lebar layar.`,
    config: { systemInstruction: SYSTEM_PROMPT, thinkingConfig: { thinkingBudget: 4000 } }
  });
  return sanitizeText(response.text);
}

export async function getMysticalProtection(name: string, condition: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Ramulah amalan benteng batin untuk ${name} menghadapi ${condition}. Penuhi lebar layar.`,
    config: { systemInstruction: SYSTEM_PROMPT }
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
        { text: "Lakukan analisis grafologi waskita. Penuhi seluruh lebar layar." }
      ]
    },
    config: { systemInstruction: SYSTEM_PROMPT }
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
        { text: `Singkap tabir kearifan batin untuk ${name}. Penuhi lebar layar.` }
      ]
    },
    config: { systemInstruction: SYSTEM_PROMPT }
  });
  return sanitizeText(response.text);
}

export async function generateKhodamVisual(base64Image: string, analysis: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
        { text: "Edit photo to add a majestic glowing golden aura and traditional Indonesian batik patterns. Style: Sacred oil painting, masterpiece." }
      ]
    },
    config: { imageConfig: { aspectRatio: "1:1" } }
  });
  return extractImageUrl(response);
}

export async function generateCardVisual(cardName: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: `A beautiful artistic card of "${cardName}" in traditional batik style. Gold colors, masterpiece.` }] },
    config: { imageConfig: { aspectRatio: "1:1" } }
  });
  return extractImageUrl(response);
}

export async function analyzeFengShui(base64Image: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
        }
      }
    }
  });
  return JSON.parse(response.text || '{}');
}

export async function detectMysticalEnergy(base64Image: string, extraPrompt: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Berdasarkan analisis energi: "${analysis}", susun amalan penyeimbang batin. Penuhi lebar layar.`,
    config: { systemInstruction: SYSTEM_PROMPT }
  });
  return sanitizeText(response.text);
}

export async function generateMysticalVisual(base64Image: string, textResult: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
        { text: "Enhance this photo with beautiful golden glowing energy patterns and Nusantara ornaments. Masterpiece digital art." }
      ]
    },
    config: { imageConfig: { aspectRatio: "1:1" } }
  });
  return extractImageUrl(response);
}

export async function generateResultIllustration(text: string, title: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const safePrompt = cleanForImagePrompt(text);
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: safePrompt }] },
    config: { imageConfig: { aspectRatio: "1:1" } }
  });
  return extractImageUrl(response);
}

export async function generateAksaraArt(aksaraType: string, text: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: `Sacred calligraphy of ${text} in ${aksaraType} style on ancient parchment. Gold ink.` }] },
    config: { imageConfig: { aspectRatio: "1:1" } }
  });
  return extractImageUrl(response);
}

export async function generateAncientRitual(category: string, name: string, targetName: string, targetBirthDate: string, targetParent: string, notes: string, base64Image: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const textResponse = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Susun risalah ritual kuno kategori ${category} untuk ${name}. Penuhi layar.`,
    config: { systemInstruction: SYSTEM_PROMPT, thinkingConfig: { thinkingBudget: 4000 } }
  });
  const analysisText = sanitizeText(textResponse.text);
  const visualResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
        { text: "A majestic traditional Indonesian spiritual scene with glowing golden lights. Masterpiece oil painting." }
      ]
    },
    config: { imageConfig: { aspectRatio: "1:1" } }
  });
  return { analysisText, visualUrl: extractImageUrl(visualResponse) };
}

export async function visualizePortalEntity(base64Image: string, analysis: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
        { text: "Visualize majestic golden glowing energy manifestation. Masterpiece digital art." }
      ]
    },
    config: { imageConfig: { aspectRatio: "1:1" } }
  });
  return extractImageUrl(response);
}

export async function generateRajahVisual(ritualText: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: "Sacred gold calligraphy pattern on ancient parchment. Masterpiece quality." }] },
    config: { imageConfig: { aspectRatio: "1:1" } }
  });
  return extractImageUrl(response);
}

export async function communicateWithEntity(context: string, message: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts: [{ text: `Balas pesan manusia ini dengan bijak: "${message}". Singkat, misterius.` }] },
    config: { systemInstruction: SYSTEM_PROMPT }
  });
  return sanitizeText(response.text) || '...suara statis...';
}
