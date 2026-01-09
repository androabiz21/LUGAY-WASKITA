
import { GoogleGenAI, Type } from "@google/genai";

/**
 * Mendapatkan instance AI.
 * Selalu mengambil API Key terbaru dari localStorage atau environment.
 */
const getAIClient = () => {
  const loginKey = localStorage.getItem('waskita_key');
  const envKey = (window as any).process?.env?.API_KEY || "";
  const apiKey = (loginKey && loginKey.trim() !== "") ? loginKey.trim() : envKey;
  
  return new GoogleGenAI({ apiKey });
};

// SYSTEM_PROMPT hanya digunakan untuk GENERATE TEKS (Gemini 3 Flash)
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
 * ULTRA-SAFE NATURE METAPHOR PROMPT
 * Teknik ini menghindari penggunaan kata-kata hasil ramalan/mistis sama sekali.
 * Mengalihkan fokus ke pemandangan alam Indonesia yang 100% aman bagi sensor.
 */
const cleanForImagePrompt = (text: string) => {
  const lowText = text.toLowerCase();
  
  // Base default: Pemandangan hutan pagi yang tenang
  let visualTheme = "A peaceful morning in a lush tropical forest with soft sunbeams";
  let colorMood = "vibrant greens and soft yellows";

  // Mapping kondisi batin ke metafora alam murni
  if (lowText.includes("rejeki") || lowText.includes("harta") || lowText.includes("emas") || lowText.includes("untung")) {
    visualTheme = "A wide golden rice terrace field during a beautiful sunset";
    colorMood = "warm golds, amber, and orange";
  } else if (lowText.includes("jodoh") || lowText.includes("cinta") || lowText.includes("kasih") || lowText.includes("sayang")) {
    visualTheme = "Beautiful exotic colorful birds perching on a blooming orchid branch";
    colorMood = "soft pinks, purple, and turquoise";
  } else if (lowText.includes("kuat") || lowText.includes("wibawa") || lowText.includes("pimpin") || lowText.includes("macan")) {
    visualTheme = "A majestic high mountain peak standing above a sea of blue clouds";
    colorMood = "royal blues, deep greys, and bright white";
  } else if (lowText.includes("sakit") || lowText.includes("sedih") || lowText.includes("prihatin") || lowText.includes("obat")) {
    visualTheme = "Calm blue water ripples on a serene lake with floating green leaves";
    colorMood = "tranquil blues, silver, and deep greens";
  }

  // Gunakan instruksi seni murni tanpa kata kunci spiritual
  return `A high-quality artistic digital painting of ${visualTheme}. The composition includes elegant traditional Indonesian batik patterns like Mega Mendung integrated into the sky. Lighting is ${colorMood}. High definition, masterpiece style, peaceful atmosphere, vivid but soft colors. Strictly no human faces, no people, no text, no scary elements.`;
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

// --- FUNGSI GENERATE TEKS (MENGGUNAKAN SYSTEM_PROMPT) ---

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
    contents: { parts: [{ text: `Berikan risalah sejarah dan legenda untuk lokasi '${locationName}' di koordinat '${coords}'.` }] },
    config: { systemInstruction: SYSTEM_PROMPT },
  });
  return { text: sanitizeText(response.text), sources: [] };
}

export async function searchCultureDiscovery(query: string) {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts: [{ text: `Lakukan penelusuran sejarah tentang: ${query}.` }] },
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
        { text: "Lakukan analisis rajah tangan secara puitis dan mendalam." }
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
        { text: `Lakukan analisis fisiognomi pada wajah ${name}, lahir ${birthDate}.` }
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
    contents: { parts: [{ text: `Tafsirkan impian berikut secara puitis: ${dream}` }] },
    config: { systemInstruction: SYSTEM_PROMPT }
  });
  return sanitizeText(response.text);
}

export async function generateAmalan(category: string, hajat: string) {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts: [{ text: `Susun wejangan atau kalimat bijak untuk hajat: ${hajat}` }] },
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
        { text: `Analisislah pancaran batin atas nama ${name}.` }
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
    contents: { parts: [{ text: `Ramulah risalah kearifan batin untuk ${name} dengan keluhan ${condition}.` }] },
    config: { systemInstruction: SYSTEM_PROMPT }
  });
  return sanitizeText(response.text);
}

export async function getMysticalProtection(name: string, condition: string) {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts: [{ text: `Susunlah kalimat pelindung batin untuk ${name} menghadapi ${condition}.` }] },
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
        { text: "Lakukan analisis karakter melalui tulisan tangan ini." }
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
        { text: `Singkap tabir kearifan untuk ${name}.` }
      ]
    },
    config: { systemInstruction: SYSTEM_PROMPT }
  });
  return sanitizeText(response.text);
}

// --- FUNGSI GENERATE GAMBAR (TANPA SYSTEM_PROMPT AGAR LOLOS FILTER) ---

export async function generateKhodamVisual(base64Image: string, analysis: string) {
  const ai = getAIClient();
  // Gunakan instruksi visual murni tanpa kata 'khodam' atau 'mistis'
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
        { text: "Transform this photo into an artistic painting with glowing golden light patterns and traditional Indonesian batik clouds in the background. High-quality digital art, warm and serene colors." }
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
        { text: `A beautiful artistic illustration of a card depicting "${cardName}". Incorporating traditional golden Indonesian patterns, soft sunlight, and a peaceful sky. Masterpiece quality.` }
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
        { text: "Analisis tata letak pada citra ini secara mendalam." }
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
        { text: "Analisis energi lingkungan pada citra ini. " + extraPrompt }
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
        { text: `Pindai kondisi energi di lokasi ${locationType}.` }
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
    contents: { parts: [{ text: `Berdasarkan analisis ini: "${analysis}", susunlah wejangan penyeimbang batin.` }] },
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
        { text: "Enhance this image with elegant abstract golden lines and traditional Indonesian textile motifs. Beautiful lighting, high-quality artistic finish." }
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
        { text: `Artistic golden decorative patterns inspired by the shape of "${text}" in ancient style on a vintage paper texture. Elegant and bright lighting.` }
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
    contents: { parts: [{ text: `Susun risalah tradisi untuk ${name}.` }] },
    config: { systemInstruction: SYSTEM_PROMPT }
  });
  const analysisText = sanitizeText(textResponse.text);
  
  const visualResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
        { text: "A peaceful and artistic scene of traditional lanterns and flowers at night. Oil painting style, beautiful glowing lights." }
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
        { text: "Beautiful abstract waves of glowing golden light with traditional Indonesian motifs. Bright, serene, and artistic atmosphere." }
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
        { text: "An intricate artistic pattern made of golden lines on an old parchment paper background. Traditional and elegant digital art." }
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
    contents: { parts: [{ text: `Jawablah pesan ini secara bijak: "${message}".` }] },
    config: { systemInstruction: SYSTEM_PROMPT }
  });
  return sanitizeText(response.text) || '...';
}
