
import { GoogleGenAI, Type } from "@google/genai";

/**
 * Inisialisasi klien AI secara dinamis.
 */
const getAIClient = () => {
  const apiKey = (window as any).process?.env?.API_KEY || "";
  return new GoogleGenAI({ apiKey });
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
 * Membersihkan teks agar lolos dari safety filter Google AI Gambar.
 */
const cleanForImagePrompt = (text: string) => {
  if (!text) return 'Ancient Nusantara sacred energy';
  const forbidden = [/khodam/gi, /hantu/gi, /setan/gi, /iblis/gi, /jin/gi, /demon/gi, /ghost/gi, /spirit/gi, /magic/gi, /mistik/gi, /ghaib/gi, /gaib/gi, /blood/gi, /dark/gi, /seram/gi, /scary/gi];
  let cleaned = text;
  forbidden.forEach(regex => {
    cleaned = cleaned.replace(regex, 'benevolent energy');
  });
  return cleaned.substring(0, 100).replace(/[^\w\s]/gi, ' ');
};

export async function getCulturalSynthesis(prompt: string) {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
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
    const prompt = `Berikan risalah sejarah resmi, histori peristiwa penting, and legenda yang berkaitan dengan lokasi '${locationName}' di koordinat '${coords}'. Gunakan data akurat. Penuhi lebar layar.`;
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        tools: [{ googleSearch: {} }],
      },
    });
    const text = sanitizeText(response.text || '');
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    return { text, sources };
  } catch (error) {
    return { text: "Gagal menelusuri kronik jagat raya.", sources: [] };
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
          { text: "Nyungsi makna Rajah Leungeun (Palmistry) melalui kaca waskita. Sampaikan secara puitis and penuhi SELURUH LEBAR bingkai teks secara maksimal." }
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
          { text: `Lakukan analisis fisiognomi (Firasat Paras) mendalam pada wajah ini untuk subjek bernama ${name}, lahir ${birthDate}, putra/putri dari ${motherName}. Penuhi SELURUH LEBAR layar secara horizontal maksimal.` }
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
      contents: { parts: [{ text: `Nyungsi hartos impian: ${dream}. Berikan tafsir puitis Sunda Buhun, penuhi lebar layar secara horizontal maksimal.` }] },
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
          { text: `Pindai pancaran aura batin atas nama ${name}. Sampaikan gradasi warna and maknanya. Penuhi lebar layar.` }
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
      contents: { parts: [{ text: `Ramulah risalah Usada (Penyembuhan) Pasundan untuk ${name} dengan keluhan ${condition}. Penuhi lebar layar.` }] },
      config: { systemInstruction: SYSTEM_PROMPT, thinkingConfig: { thinkingBudget: 4000 } }
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
          { text: "Lakukan analisis mendalam (Graphology Waskita) pada goresan tangan ini. Penuhi SELURUH LEBAR layar secara horizontal maksimal." }
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
          { text: `Singkap tabir penjaga batin untuk ${name}, lahir ${birthDate}, anak dari ${motherName}. Narasikan manifestasi energinya secara puitis Sunda Buhun. Penuhi lebar layar secara horizontal maksimal.` }
        ]
      },
      config: { systemInstruction: SYSTEM_PROMPT }
    });
    return sanitizeText(response.text || '');
  } catch (error) {
    throw error;
  }
}

export async function analyzePortalEnergy(base64Image: string, locationType: string, resonanceLevel: number) {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: "image/jpeg" } },
          { text: `Lakukan analisis spectral portal pada lokasi ${locationType}. Identifikasi energi yang mencoba bermanifestasi. Penuhi lebar layar.` }
        ]
      },
      config: { systemInstruction: SYSTEM_PROMPT }
    });
    return sanitizeText(response.text || '');
  } catch (error) { throw error; }
}

export async function generateCardVisual(cardName: string) {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: `A sacred artistic card illustration of "${cardName}" in Indonesian batik style. Professional oil painting, glowing gold colors, masterpiece quality.` }] },
      config: {
        imageConfig: { aspectRatio: "1:1" }
      }
    });
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (e) { 
    return null; 
  }
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
          { text: "Lakukan deteksi energi ghaib. " + extraPrompt }
        ]
      },
      config: { systemInstruction: SYSTEM_PROMPT }
    });
    return sanitizeText(response.text || '');
  } catch (e) { throw e; }
}

export async function generateMysticalVisual(base64Image: string, textResult: string) {
  try {
    const ai = getAIClient();
    const cleanContext = cleanForImagePrompt(textResult);
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
          { text: `Edit this photo to add a majestic benevolent glowing aura and traditional sacred Nusantara patterns. Soft lighting, high quality digital painting.` }
        ]
      },
      config: {
        imageConfig: { aspectRatio: "1:1" }
      }
    });
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (e) { return null; }
}

export async function getMysticalProtection(name: string, condition: string) {
  return getCulturalSynthesis(`Berikan risalah perlindungan ghaib and pagar batin untuk ${name} yang menghadapi ${condition}.`);
}

export async function searchCultureDiscovery(query: string) {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: query,
      config: { tools: [{ googleSearch: {} }] },
    });
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    return { text: response.text || '', sources };
  } catch (e) { return { text: 'Gagal menelusuri khazanah.', sources: [] }; }
}

export async function generateResultIllustration(text: string, title: string) {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { 
        parts: [{ 
          text: `A professional digital painting of a beautiful sacred Nusantara landscape with golden glowing energy fields. Masterpiece quality, oil painting texture.` 
        }] 
      },
      config: {
        imageConfig: { aspectRatio: "1:1" }
      }
    });
    
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (e: any) { 
    return null; 
  }
}

export async function generateAksaraArt(aksaraType: string, text: string) {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: `Beautiful sacred calligraphy of "${text}" on ancient Nusantara parchment. Masterpiece quality, gold ink.` }] },
      config: {
        imageConfig: { aspectRatio: "1:1" }
      }
    });
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (e) { return null; }
}

export async function generateKhodamVisual(base64Image: string, analysis: string) {
  try {
    const ai = getAIClient();
    // Gunakan prompt yang sangat "safe" dan deskriptif secara artistik
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
          { text: `Add a majestic and benevolent golden glowing energy field around the person. Style: Ancient Nusantara oil painting, masterpiece, soft warm lighting, intricate spiritual patterns.` }
        ]
      },
      config: {
        imageConfig: { aspectRatio: "1:1" }
      }
    });
    
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (e) {
    console.error("Khodam visual generation failed:", e);
    return null;
  }
}

export async function generateAncientRitual(category: string, name: string, targetName: string, targetBirthDate: string, targetParent: string, notes: string, base64Image: string) {
  try {
    const ai = getAIClient();
    const textPrompt = `Susunlah risalah ritual kuno kategori ${category} untuk ${name} yang ditujukan kepada ${targetName}. Catatan: ${notes}. Sampaikan secara puitis.`;
    
    const textResponse = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: textPrompt,
      config: { systemInstruction: SYSTEM_PROMPT, thinkingConfig: { thinkingBudget: 4000 } }
    });
    
    const analysisText = sanitizeText(textResponse.text || '');
    
    const visualResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
          { text: `A beautiful sacred ritual scene in a traditional forest with glowing candles and soft smoke. Oil painting style.` }
        ]
      },
      config: {
        imageConfig: { aspectRatio: "1:1" }
      }
    });
    
    let visualUrl = null;
    if (visualResponse.candidates?.[0]?.content?.parts) {
      for (const part of visualResponse.candidates[0].content.parts) {
        if (part.inlineData) { visualUrl = `data:image/png;base64,${part.inlineData.data}`; break; }
      }
    }
    
    return { analysisText, visualUrl };
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
          { text: `Visualize a majestic luminous energy manifestation. Glowing translucent patterns, ancient Nusantara masterpiece style.` }
        ]
      },
      config: {
        imageConfig: { aspectRatio: "1:1" }
      }
    });
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (e) { return null; }
}

export async function generateBalaRitual(analysis: string) {
  const prompt = `Berdasarkan analisis portal: ${analysis}, rumuskan amalan tolak bala warisan Pasundan. Penuhi lebar layar.`;
  return getCulturalSynthesis(prompt);
}

export async function generateRajahVisual(ritualText: string) {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { 
        parts: [{ text: `A sacred gold calligraphy pattern on ancient parchment. Symmetric Nusantara aesthetic.` }] 
      },
      config: {
        imageConfig: { aspectRatio: "1:1" }
      }
    });
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (e) { return null; }
}

export async function communicateWithEntity(context: string, message: string) {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts: [{ text: `Berperanlah sebagai entitas cahaya: ${context}. Balas pesan manusia: "${message}". Singkat, misterius, puitis.` }] },
      config: { systemInstruction: SYSTEM_PROMPT }
    });
    return sanitizeText(response.text || '...suara statis...');
  } catch (e) { return '...suara statis...'; }
}
