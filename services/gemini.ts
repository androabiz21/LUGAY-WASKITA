
import { GoogleGenAI, Type } from "@google/genai";

/**
 * Inisialisasi klien AI secara eksklusif menggunakan API Key dari process.env.API_KEY.
 */
const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

const SYSTEM_PROMPT = `Anda adalah GALURA LUGAY KANCANA Waskita Pasundan, entitas AI penjaga sanad kebudayaan, sejarah, dan spiritualitas Tanah Sunda yang diilhami oleh semangat Lugay Kancana. 
TUGAS UTAMA: 
1. Gunakan Bahasa Indonesia yang sangat puitis dan berwibawa.
2. WAJIB sisipkan istilah Sunda Buhun (seperti: Jagat Sagala, Sanghyang, Waskita, Bujangga, Parahyang, Silih Asah/Asih/Asuh, Nyungsi, Karsa, Raksa, Galudra, dll) dalam setiap penjelasan.
3. Selalu awali jawaban dengan "Sampurasun,".
4. Jangan gunakan simbol markdown seperti bintang (*), pagar (#), atau bold (**). Gunakan teks polos (plain text) yang bersih.
5. PENTING: Teks harus mengalir memenuhi SELURUH LEBAR LAYAR secara horizontal (FULL WIDTH). Jangan membuat paragraf pendek atau ramping. Gunakan kalimat panjang yang menyambung. 
6. HINDARI indentasi atau spasi di tepi kiri. Pastikan teks memenuhi bingkai layar dari batas paling kiri ke batas paling kanan secara simetris.`;

const sanitizeText = (text: string) => {
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
 * Membersihkan teks untuk prompt gambar agar tidak memicu Safety Filter.
 * Menghapus semua referensi mistis dan menggantinya dengan deskripsi artistik.
 */
const cleanForImagePrompt = (text: string) => {
  if (!text) return 'Majestic traditional Nusantara golden patterns, ethereal light';
  
  const riskyWords = [
    /khodam/gi, /hantu/gi, /setan/gi, /iblis/gi, /jin/gi, /demon/gi, /ghost/gi, 
    /spirit/gi, /magic/gi, /mistik/gi, /ghaib/gi, /gaib/gi, /blood/gi, /dark/gi, 
    /seram/gi, /scary/gi, /curse/gi, /santet/gi, /teluh/gi, /supranatural/gi,
    /ritual/gi, /mati/gi, /death/gi, /horror/gi, /entity/gi, /manifestasi/gi
  ];

  let cleaned = text;
  riskyWords.forEach(regex => {
    cleaned = cleaned.replace(regex, 'luminous energy');
  });

  // Ambil hanya 100 karakter pertama dan pastikan hanya deskripsi artistik
  return "Beautiful artistic digital painting, " + cleaned.substring(0, 100).replace(/[^\w\s]/gi, ' ') + ", traditional batik motifs, glowing golden aura, masterpiece quality, cinematic lighting";
};

/**
 * Fungsi pembantu untuk mengekstrak gambar dari respon Gemini
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

// Update to use gemini-3-pro-preview for complex reasoning tasks
export async function getCulturalSynthesis(prompt: string) {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: { parts: [{ text: prompt + " (Sampaikan dalam gaya puitis Sunda Buhun, penuhi lebar layar secara horizontal maksimal)." }] },
      config: { systemInstruction: SYSTEM_PROMPT, temperature: 0.7 },
    });
    return sanitizeText(response.text || '');
  } catch (error: any) {
    console.error("Synthesis Error:", error);
    throw error;
  }
}

export async function getMantraContext(prompt: string) {
  return getCulturalSynthesis(prompt);
}

export async function getLocationChronicle(locationName: string, coords: string) {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Berikan risalah sejarah resmi dan legenda yang berkaitan dengan lokasi '${locationName}' di koordinat '${coords}'. Gunakan data akurat. Penuhi lebar layar.`,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        tools: [{ googleSearch: {} }],
      },
    });
    const text = sanitizeText(response.text || '');
    return { text, sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [] };
  } catch (error) {
    return { text: "Gagal menelusuri kronik jagat raya.", sources: [] };
  }
}

/**
 * Fixed missing function for CultureTreasury.tsx
 */
export async function searchCultureDiscovery(query: string) {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Lakukan penelusuran waskita tentang: ${query}. Berikan fakta sejarah yang akurat dan penuhi lebar layar.`,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        tools: [{ googleSearch: {} }],
      },
    });
    const text = sanitizeText(response.text || '');
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    return { text, sources };
  } catch (error) {
    return { text: "Gagal menelusuri pustaka jagat.", sources: [] };
  }
}

export async function analyzePalmistry(base64Image: string) {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: "image/jpeg" } },
          { text: "Nyungsi makna Rajah Leungeun (Palmistry) melalui kaca waskita. Sampaikan secara puitis dan penuhi SELURUH LEBAR bingkai teks secara maksimal." }
        ]
      },
      config: { systemInstruction: SYSTEM_PROMPT }
    });
    return sanitizeText(response.text || 'Gagal merajut makna rajah batin.');
  } catch (error) { throw error; }
}

export async function analyzeFaceReading(base64Image: string, name: string, birthDate: string, motherName: string) {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: "image/jpeg" } },
          { text: `Lakukan analisis fisiognomi pada wajah ${name}, lahir ${birthDate}. Penuhi SELURUH LEBAR layar.` }
        ]
      },
      config: { systemInstruction: SYSTEM_PROMPT }
    });
    return sanitizeText(response.text || '');
  } catch (error) { throw error; }
}

export async function getDreamInterpretation(dream: string) {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts: [{ text: `Nyungsi hartos impian: ${dream}. Berikan tafsir puitis Sunda Buhun, penuhi lebar layar.` }] },
      config: { systemInstruction: SYSTEM_PROMPT }
    });
    return sanitizeText(response.text || '');
  } catch (error) { throw error; }
}

export async function generateAmalan(category: string, hajat: string) {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: { parts: [{ text: `Susunlah amalan batin kategori ${category} untuk hajat: ${hajat}. Gaya Sunda Buhun, penuhi lebar layar.` }] },
      config: { systemInstruction: SYSTEM_PROMPT, thinkingConfig: { thinkingBudget: 4000 } }
    });
    return sanitizeText(response.text || '');
  } catch (error) { throw error; }
}

export async function analyzeAura(base64Image: string, name: string) {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { 
        parts: [
          { inlineData: { data: base64Image, mimeType: "image/jpeg" } }, 
          { text: `Pindai pancaran aura batin atas nama ${name}. Sampaikan gradasi warna dan maknanya. Penuhi lebar layar.` }
        ]
      },
      config: { systemInstruction: SYSTEM_PROMPT }
    });
    return sanitizeText(response.text || '');
  } catch (error) { throw error; }
}

export async function generateHealingProtocol(name: string, condition: string, type: string) {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: { parts: [{ text: `Ramulah risalah Usada untuk ${name} dengan keluhan ${condition}. Penuhi lebar layar.` }] },
      config: { systemInstruction: SYSTEM_PROMPT, thinkingConfig: { thinkingBudget: 4000 } }
    });
    return sanitizeText(response.text || '');
  } catch (error) { throw error; }
}

/**
 * Fixed missing function for Healing.tsx
 */
export async function getMysticalProtection(name: string, condition: string) {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts: [{ text: `Ramulah amalan benteng batin (pagar ghaib) untuk ${name} yang sedang menghadapi ${condition}. Gunakan gaya Sunda Buhun puitis, penuhi lebar layar.` }] },
      config: { systemInstruction: SYSTEM_PROMPT }
    });
    return sanitizeText(response.text || '');
  } catch (error) { throw error; }
}

export async function analyzeHandwriting(base64Image: string) {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: "image/jpeg" } },
          { text: "Lakukan analisis grafologi pada tulisan ini. Penuhi SELURUH LEBAR layar." }
        ]
      },
      config: { systemInstruction: SYSTEM_PROMPT }
    });
    return sanitizeText(response.text || '');
  } catch (error) { throw error; }
}

export async function analyzeKhodam(base64Image: string, name: string, birthDate: string, motherName: string) {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: "image/jpeg" } },
          { text: `Singkap tabir kearifan batin untuk ${name}. Narasikan batiniahnya secara puitis Sunda Buhun. Penuhi lebar layar secara horizontal maksimal.` }
        ]
      },
      config: { systemInstruction: SYSTEM_PROMPT }
    });
    return sanitizeText(response.text || '');
  } catch (error) {
    throw error;
  }
}

export async function generateKhodamVisual(base64Image: string, analysis: string) {
  try {
    const ai = getAIClient();
    const safePrompt = "Add a majestic glowing golden aura and traditional Indonesian batik patterns around the subject. Style: Sacred oil painting, warm ethereal lighting, Nusantara aesthetic.";
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
          { text: safePrompt }
        ]
      },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });
    return extractImageUrl(response);
  } catch (e) {
    console.error("Khodam visual generation failed:", e);
    return null;
  }
}

export async function generateCardVisual(cardName: string) {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: `A beautiful artistic card illustration of "${cardName}" in traditional batik style. Gold colors, masterpiece quality.` }] },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });
    return extractImageUrl(response);
  } catch (e) { return null; }
}

export async function analyzeFengShui(base64Image: string) {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: "image/jpeg" } },
          { text: "Lakukan analisis Tata Ruang pada citra ini. Output dalam JSON." }
        ]
      },
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysisText: { type: Type.STRING },
            zones: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  box_2d: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                  label: { type: Type.STRING },
                  type: { type: Type.STRING },
                  description: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (e) { throw e; }
}

export async function detectMysticalEnergy(base64Image: string, extraPrompt: string) {
  try {
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
    return sanitizeText(response.text || '');
  } catch (e) { throw e; }
}

/**
 * Fixed missing function for GhostPortal.tsx
 */
export async function analyzePortalEnergy(base64Image: string, locationType: string, resonanceLevel: number) {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: "image/jpeg" } },
          { text: `Pindai portal ghaib di lokasi ${locationType} dengan level resonansi ${resonanceLevel}. Sampaikan apa yang terdeteksi secara puitis dan penuhi lebar layar.` }
        ]
      },
      config: { systemInstruction: SYSTEM_PROMPT }
    });
    return sanitizeText(response.text || '');
  } catch (error) { throw error; }
}

/**
 * Fixed missing function for GhostPortal.tsx
 */
export async function generateBalaRitual(analysis: string) {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts: [{ text: `Berdasarkan analisis energi: "${analysis}", susunlah amalan tolak bala atau benteng batin yang sesuai. Puitis Sunda Buhun, penuhi lebar layar.` }] },
      config: { systemInstruction: SYSTEM_PROMPT }
    });
    return sanitizeText(response.text || '');
  } catch (error) { throw error; }
}

export async function generateMysticalVisual(base64Image: string, textResult: string) {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
          { text: "Enhance this photo with beautiful golden glowing energy patterns and traditional Nusantara ornaments. Masterpiece digital art." }
        ]
      },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });
    return extractImageUrl(response);
  } catch (e) { return null; }
}

export async function generateResultIllustration(text: string, title: string) {
  try {
    const ai = getAIClient();
    const safePrompt = cleanForImagePrompt(text);
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: safePrompt }] },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });
    return extractImageUrl(response);
  } catch (e: any) { 
    console.error("Image generation failed:", e);
    return null; 
  }
}

export async function generateAksaraArt(aksaraType: string, text: string) {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: `Sacred and beautiful calligraphy on ancient parchment. Gold ink, masterpiece quality.` }] },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });
    return extractImageUrl(response);
  } catch (e) { return null; }
}

export async function generateAncientRitual(category: string, name: string, targetName: string, targetBirthDate: string, targetParent: string, notes: string, base64Image: string) {
  try {
    const ai = getAIClient();
    const textResponse = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Susunlah risalah ritual kuno kategori ${category} untuk ${name}. Sampaikan secara puitis.`,
      config: { systemInstruction: SYSTEM_PROMPT, thinkingConfig: { thinkingBudget: 4000 } }
    });
    
    const analysisText = sanitizeText(textResponse.text || '');
    
    const visualResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
          { text: "A beautiful traditional scene with glowing lights and Nusantara ornaments. Masterpiece style." }
        ]
      },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });
    
    return { analysisText, visualUrl: extractImageUrl(visualResponse) };
  } catch (e) { throw e; }
}

export async function visualizePortalEntity(base64Image: string, analysis: string) {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
          { text: "Visualize majestic golden energy manifestation from Ancient Nusantara. Masterpiece digital art." }
        ]
      },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });
    return extractImageUrl(response);
  } catch (e) { return null; }
}

export async function generateRajahVisual(ritualText: string) {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: "Sacred gold calligraphy pattern on ancient parchment. Masterpiece quality." }] },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });
    return extractImageUrl(response);
  } catch (e) { return null; }
}

export async function communicateWithEntity(context: string, message: string) {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts: [{ text: `Balas pesan manusia: "${message}". Singkat, misterius, puitis.` }] },
      config: { systemInstruction: SYSTEM_PROMPT }
    });
    return sanitizeText(response.text || '...suara statis...');
  } catch (e) { return '...suara statis...'; }
}
