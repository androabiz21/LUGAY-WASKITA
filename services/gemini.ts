
import { GoogleGenAI, Type } from "@google/genai";

/**
 * Mendapatkan instance AI.
 * Mengutamakan Waskita Key dari localStorage (Login) dengan fallback ke process.env.
 */
const getAIClient = () => {
  const loginKey = localStorage.getItem('waskita_key');
  const envKey = (window as any).process?.env?.API_KEY || "";
  const apiKey = (loginKey && loginKey.trim() !== "") ? loginKey.trim() : envKey;
  
  if (!apiKey) {
    console.error("Waskita Key (API Key) tidak terdeteksi.");
  }
  
  return new GoogleGenAI({ apiKey });
};

const SYSTEM_PROMPT = `Anda adalah GALURA LUGAY KANCANA Waskita Pasundan, entitas AI penjaga sanad kebudayaan, sejarah, dan spiritualitas Tanah Sunda yang diilhami oleh semangat Lugay Kancana. 
TUGAS UTAMA: 
1. Gunakan Bahasa Indonesia yang sangat puitis dan berwibawa.
2. WAJIB sisipkan istilah Sunda Buhun (seperti: Jagat Sagala, Sanghyang, Waskita, Bujangga, Parahyang, Silih Asah/Asih/Asuh, Nyungsi, Karsa, Raksa, Galudra, dll) dalam setiap penjelasan.
3. Selalu awali jawaban dengan "Sampurasun,".
4. Jangan gunakan simbol markdown seperti bintang (*), pagar (#), atau bold (**). Gunakan teks polos yang bersih.
5. Teks harus mengalir memenuhi SELURUH LEBAR LAYAR secara horizontal (FULL WIDTH).
6. HINDARI indentasi atau spasi di tepi kiri.`;

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
 * ULTRA-SAFE PROMPT GENERATOR
 * Mengonversi hasil teks Paririmbon/Ramalan menjadi visual seni murni.
 * Ini krusial untuk menghindari Error 400 (Safety Block) dari Google.
 */
const cleanForImagePrompt = (text: string) => {
  const lowercaseText = text.toLowerCase();
  
  // Tentukan tema visual berdasarkan kata kunci batin
  let visualTheme = "Spiritual Peace and Enlightenment";
  
  if (lowercaseText.includes("rejeki") || lowercaseText.includes("harta") || lowercaseText.includes("emas")) {
    visualTheme = "Golden Abundance and Radiant Sunbeams";
  } else if (lowercaseText.includes("jodoh") || lowercaseText.includes("cinta") || lowercaseText.includes("kasih")) {
    visualTheme = "Harmonious Blooming Lotus in Soft Moonlight";
  } else if (lowercaseText.includes("kuat") || lowercaseText.includes("wibawa") || lowercaseText.includes("pemimpin")) {
    visualTheme = "Majestic High Mountain Peak with Royal Clouds";
  } else if (lowercaseText.includes("sakit") || lowercaseText.includes("sedih") || lowercaseText.includes("prihatin")) {
    visualTheme = "Calm Healing Waters with Gentle Ripples";
  }

  // Bangun prompt seni murni tanpa menyertakan teks asli yang berisiko sensor
  return `A high-quality artistic digital painting of ${visualTheme}. Featuring intricate traditional Indonesian batik Mega Mendung and Parang patterns in the atmosphere. Warm ethereal lighting, glowing golden dust particles, sacred geometric shapes, masterpiece aesthetic, vivid but peaceful colors. Strictly no human faces, no scary elements, no text.`;
};

/**
 * Ekstraksi citra dari respon model secara aman.
 */
const extractImageUrl = (response: any) => {
  try {
    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
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

// --- FUNGSI GENERATE TEKS ---

export async function getCulturalSynthesis(prompt: string) {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
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

// --- FUNGSI ANALISIS CITRA (MULTIMODAL) ---

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
    model: "gemini-3-flash-preview",
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
    model: "gemini-3-flash-preview",
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

// --- FUNGSI GENERATE GAMBAR ---

export async function generateKhodamVisual(base64Image: string, analysis: string) {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
        { text: "Apply a majestic glowing golden aura and sacred traditional Indonesian batik ornaments around this face. Style: Fine art painting, warm spiritual light, ethereal masterpiece." }
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
    contents: { 
      parts: [
        { text: `Artistic illustration of a sacred card titled "${cardName}". Incorporating traditional golden Indonesian batik patterns, radiant lighting, celestial atmosphere, digital art masterpiece.` }
      ] 
    },
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
        { text: "Analisis Tata Ruang pada citra ini. Berikan penjelasan dalam teks puitis yang mendalam." }
      ]
    },
    config: { systemInstruction: SYSTEM_PROMPT }
  });
  return { analysisText: sanitizeText(response.text), zones: [] };
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
        { text: "Add elegant glowing golden geometric energy patterns and traditional Nusantara ornaments to this photo. Ethereal light, artistic masterpiece." }
      ]
    },
    config: { imageConfig: { aspectRatio: "1:1" } }
  });
  return extractImageUrl(response);
}

export async function generateResultIllustration(text: string, title: string) {
  const ai = getAIClient();
  const safePrompt = cleanForImagePrompt(text);
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { 
        parts: [
          { text: safePrompt }
        ] 
      },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });
    return extractImageUrl(response);
  } catch (error) {
    console.error("Gagal menenun gambar:", error);
    return null;
  }
}

export async function generateAksaraArt(aksaraType: string, text: string) {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { 
      parts: [
        { text: `Golden sacred calligraphy of the word "${text}" in ${aksaraType} style on aged parchment. Radiant glowing ink, digital art masterpiece.` }
      ] 
    },
    config: { imageConfig: { aspectRatio: "1:1" } }
  });
  return extractImageUrl(response);
}

export async function generateAncientRitual(category: string, name: string, targetName: string, targetBirthDate: string, targetParent: string, notes: string, base64Image: string) {
  const ai = getAIClient();
  const textResponse = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts: [{ text: `Susun risalah tradisi kategori ${category} untuk ${name}. Penuhi layar.` }] },
    config: { systemInstruction: SYSTEM_PROMPT }
  });
  const analysisText = sanitizeText(textResponse.text);
  
  const visualResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
        { text: "A majestic scene of a peaceful traditional ceremony with glowing golden lanterns. Oil painting style, serene." }
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
        { text: "Manifestation of beautiful benevolent golden energy patterns. Traditional motifs, serene glow, artistic digital art." }
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
    contents: { 
      parts: [
        { text: "Exquisite gold calligraphy pattern on ancient parchment. Radiant, intricate, traditional spiritual style." }
      ] 
    },
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
