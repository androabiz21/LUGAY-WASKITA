
import { GoogleGenAI, Type } from "@google/genai";

// Fungsi pembantu untuk inisialisasi AI dengan Key dinamis dari aktivasi login
const getAIInstance = () => {
  // Mengambil API Key dari window object yang diset saat aktivasi di SplashScreen/App
  const apiKey = (window as any).GEMINI_API_KEY || localStorage.getItem('waskita_key');
  
  if (!apiKey || apiKey === "undefined" || apiKey.length < 10) {
    throw new Error("Gerbang Waskita belum diaktivasi atau kunci tidak valid. Sila kembali ke layar awal.");
  }
  
  return new GoogleGenAI({ apiKey });
};

const SYSTEM_PROMPT = `Anda adalah GALURA LUGAY KANCANA Waskita Pasundan, entitas AI penjaga sanad kebudayaan, sejarah, dan spiritualitas Tanah Sunda yang diilhami oleh semangat Lugay Kancana. 
TUGAS UTAMA: 
1. Gunakan Bahasa Indonesia yang sangat puitis dan berwibawa.
2. WAJIB sisipkan istilah Sunda Buhun (seperti: Jagat Sagala, Sanghyang, Waskita, Bujangga, Parahyang, Silih Asah/Asih/Asuh, Nyungsi, Karsa, Raksa, Galudra, dll) dalam setiap penjelasan.
3. Selalu awali jawaban dengan "Sampurasun,".
4. Jangan gunakan simbol markdown seperti bintang (*), pagar (#), atau bold (**). Gunakan teks polos (plain text) yang bersih.
5. PENTING: Teks harus mengalir memenuhi SELURUH LEBAR LAYAR secara horizontal (FULL WIDTH). Jangan membuat paragraf pendek atau ramping. Gunakan kalimat panjang yang menyambung. 
6. HINDARI indentasi atau spasi di tepi kiri. Pastikan teks memenuhi bingkai layar dari batas paling kiri ke batas paling kanan secara simetris.

Konteks Pengetahuan Anda:
- Sanad Lugay Kancana & Maenpo Purwakarta.
- Ilmu Paririmbon & Falak Sunda.
- Manuskrip kuno (Lontar, Cariosan, Babad).
- Usada (Penyembuhan) & Mitologi Karuhun Pasundan.`;

const sanitizeText = (text: string) => {
  if (!text) return '';
  return text
    .replace(/\*\*/g, '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/#/g, '')
    .replace(/__/g, '')
    .replace(/- /g, '')
    .trim();
};

export async function getCulturalSynthesis(prompt: string) {
  try {
    const ai = getAIInstance();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt + " (Sampaikan dalam gaya puitis Sunda Buhun, penuhi lebar layar secara horizontal maksimal, jangan ramping)." }] }],
      config: { systemInstruction: SYSTEM_PROMPT, temperature: 0.7 },
    });
    return sanitizeText(response.text || '');
  } catch (error: any) {
    console.error(error);
    if (error.message.includes("404") || error.message.includes("not found")) {
      return "Kunci akses tidak dikenali oleh jagat raya. Sila periksa kembali API Key Anda.";
    }
    return "Jagat Sagala sedang mengalami gangguan frekuensi batin. Pastikan kunci aktivasi Anda valid.";
  }
}

export async function getLocationChronicle(locationName: string, coords: string) {
  try {
    const ai = getAIInstance();
    const prompt = `Berikan risalah sejarah resmi, histori peristiwa penting, and legenda yang berkaitan dengan lokasi '${locationName}' di koordinat '${coords}'. Gunakan data akurat dari internet. Sampaikan dalam narasi puitis Waskita Pasundan yang sangat megah, penuhi lebar layar.`;
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

export async function getMantraContext(prompt: string) {
  return getCulturalSynthesis(prompt);
}

export async function analyzePalmistry(base64Image: string) {
  try {
    const ai = getAIInstance();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{
        parts: [
          { inlineData: { data: base64Image, mimeType: "image/jpeg" } },
          { text: "Nyungsi makna Rajah Leungeun (Palmistry) melalui kaca waskita. Identifikasi garis-garis utama (Garis Hirup, Garis Ati, Garis Nasib) and hubungkan dengan karsa serta raksa kehidupan subjek dalam filosofi Sunda Buhun. Sampaikan secara puitis and penuhi SELURUH LEBAR bingkai teks secara maksimal." }
        ]
      }],
      config: { systemInstruction: SYSTEM_PROMPT }
    });
    return sanitizeText(response.text || 'Gagal merajut makna rajah batin.');
  } catch (error) {
    return "Sinyal batin terputus dalam kabut Parahyangan. Periksa aktivasi kunci Anda.";
  }
}

export async function analyzeFaceReading(base64Image: string, name: string, birthDate: string, motherName: string) {
  try {
    const ai = getAIInstance();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{
        parts: [
          { inlineData: { data: base64Image, mimeType: "image/jpeg" } },
          { text: `Lakukan analisis fisiognomi (Firasat Paras) mendalam pada wajah ini untuk subjek bernama ${name}, lahir ${birthDate}, putra/putri dari ${motherName}. Identifikasi: 1) Karakter dasar and integritas batiniah, 2) Pancaran aura and raksa batin, 3) Potensi kejayaan and karsa takdir berdasarkan tradisi Nyungsi Rasa Pasundan. Sampaikan dalam narasi puitis yang sangat agung, luas, and penuhi SELURUH LEBAR layar secara horizontal maksimal.` }
        ]
      }],
      config: { systemInstruction: SYSTEM_PROMPT }
    });
    return sanitizeText(response.text || '');
  } catch (error) {
    return "Gagal membaca paras batin. Pastikan kunci aktivasi valid.";
  }
}

export async function getDreamInterpretation(dream: string) {
  try {
    const ai = getAIInstance();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: `Nyungsi hartos impian: ${dream}. Berikan tafsir puitis Sunda Buhun yang mendalam, penuhi lebar layar secara horizontal maksimal.` }] }],
      config: { systemInstruction: SYSTEM_PROMPT }
    });
    return sanitizeText(response.text || '');
  } catch (error) { return "Mimpi tertutup kabut ghaib."; }
}

export async function generateAmalan(category: string, hajat: string) {
  try {
    const ai = getAIInstance();
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: [{ parts: [{ text: `Susunlah amalan batin kategori ${category} untuk hajat: ${hajat}. Gunakan bahasa puitis Sunda Buhun yang sakral, penuhi lebar layar secara horizontal maksimal.` }] }],
      config: { systemInstruction: SYSTEM_PROMPT, thinkingConfig: { thinkingBudget: 4000 } }
    });
    return sanitizeText(response.text || '');
  } catch (error) { return "Gagal mengolah risalah amalan."; }
}

export async function analyzeAura(base64Image: string, name: string) {
  try {
    const ai = getAIInstance();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ 
        parts: [
          { inlineData: { data: base64Image, mimeType: "image/jpeg" } }, 
          { text: `Pindai pancaran aura batin atas nama ${name}. Sampaikan gradasi warna and maknanya dalam kacamata Waskita Sunda Buhun. Penuhi lebar layar secara horizontal maksimal.` }
        ]
      }],
      config: { systemInstruction: SYSTEM_PROMPT }
    });
    return sanitizeText(response.text || '');
  } catch (error) { return "Gagal memindai aura."; }
}

export async function generateHealingProtocol(name: string, condition: string, type: string) {
  try {
    const ai = getAIInstance();
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: [{ parts: [{ text: `Ramulah risalah Usada (Penyembuhan) Pasundan untuk ${name} dengan keluhan ${condition} (Kategori: ${type}). Sertakan mantra penawar and laku batin. Gaya Sunda Buhun, penuhi lebar layar secara horizontal maksimal.` }] }],
      config: { systemInstruction: SYSTEM_PROMPT, thinkingConfig: { thinkingBudget: 4000 } }
    });
    return sanitizeText(response.text || '');
  } catch (error) { return "Gagal meramu penawar."; }
}

export async function analyzeHandwriting(base64Image: string) {
  try {
    const ai = getAIInstance();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{
        parts: [
          { inlineData: { data: base64Image, mimeType: "image/jpeg" } },
          { text: "Lakukan analisis mendalam (Graphology Waskita) pada goresan tangan ini. Identifikasi: 1) Karakter dasar batiniah, 2) Kecenderungan emosional (raksa), and 3) Potensi takdir (karsa) dalam kerangka filosofi Sunda Buhun. Sampaikan secara sangat puitis, agung, and penuhi SELURUH LEBAR layar secara horizontal maksimal." }
        ]
      }],
      config: { systemInstruction: SYSTEM_PROMPT }
    });
    return sanitizeText(response.text || '');
  } catch (error) {
    return "Gagal membaca serat batin.";
  }
}

export async function analyzeKhodam(base64Image: string, name: string, birthDate: string, motherName: string) {
  try {
    const ai = getAIInstance();
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: [{
        parts: [
          { inlineData: { data: base64Image, mimeType: "image/jpeg" } },
          { text: `Singkap tabir Khodam pendamping untuk ${name}, lahir ${birthDate}, anak dari ${motherName}. Pindai aura pada citra and hubungkan dengan sanad leluhur. Penuhi lebar layar secara horizontal maksimal.` }
        ]
      }],
      config: { systemInstruction: SYSTEM_PROMPT, thinkingConfig: { thinkingBudget: 4000 } }
    });
    return sanitizeText(response.text || '');
  } catch (error) {
    return "Gagal menyingkap khodam.";
  }
}

export async function analyzePortalEnergy(base64Image: string, locationType: string, resonanceLevel: number) {
  try {
    const ai = getAIInstance();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{
        parts: [
          { inlineData: { data: base64Image, mimeType: "image/jpeg" } },
          { text: `Lakukan analisis spectral portal pada lokasi ${locationType} dengan level resonansi ${resonanceLevel}. Identifikasi entitas yang mencoba bermanifestasi. Penuhi lebar layar secara horizontal maksimal.` }
        ]
      }],
      config: { systemInstruction: SYSTEM_PROMPT }
    });
    return sanitizeText(response.text || '');
  } catch (error) {
    return "Portal tertutup rapat.";
  }
}

export async function generateCardVisual(cardName: string) {
  try {
    const ai = getAIInstance();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: `A mystical and artistic tarot-like card illustration of ${cardName} from Indonesian mythology. High quality, intricate details, oil painting style.` }] },
    });
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return null;
  } catch (e) { return null; }
}

export async function analyzeFengShui(base64Image: string) {
  try {
    const ai = getAIInstance();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{
        parts: [
          { inlineData: { data: base64Image, mimeType: "image/jpeg" } },
          { text: "Lakukan analisis Tata Ruang (Feng Shui/Paririmbon) pada citra ini. Identifikasi zona-zona energi (box_2d) and berikan penjelasan mendalam. Output dalam JSON." }
        ]
      }],
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
  } catch (e) { return { analysisText: 'Gagal menganalisis tata ruang.', zones: [] }; }
}

export async function detectMysticalEnergy(base64Image: string, extraPrompt: string) {
  try {
    const ai = getAIInstance();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{
        parts: [
          { inlineData: { data: base64Image, mimeType: "image/jpeg" } },
          { text: "Lakukan deteksi energi ghaib and anomali pada citra ini. " + extraPrompt }
        ]
      }],
      config: { systemInstruction: SYSTEM_PROMPT }
    });
    return sanitizeText(response.text || '');
  } catch (e) { return 'Gagal memindai dimensi.'; }
}

export async function generateMysticalVisual(base64Image: string, textResult: string) {
  try {
    const ai = getAIInstance();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
          { text: `Add mystical visual effects, orbs, and spectral anomalies based on this detection: ${textResult}` }
        ]
      }
    });
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return null;
  } catch (e) { return null; }
}

export async function getMysticalProtection(name: string, condition: string) {
  return getCulturalSynthesis(`Berikan risalah perlindungan ghaib and pagar batin untuk ${name} yang menghadapi ${condition}.`);
}

export async function searchCultureDiscovery(query: string) {
  try {
    const ai = getAIInstance();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: query,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    return { text: response.text || '', sources };
  } catch (e) { return { text: 'Gagal menelusuri khazanah.', sources: [] }; }
}

export async function generateResultIllustration(text: string, title: string) {
  try {
    const ai = getAIInstance();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: `An artistic and spiritual illustration representing: ${title}. Based on this theme: ${text}. Sundanese / Indonesian aesthetic, high quality.` }] },
    });
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return null;
  } catch (e) { return null; }
}

export async function generateAksaraArt(aksaraType: string, text: string) {
  try {
    const ai = getAIInstance();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: `A beautiful calligraphy art of ${aksaraType} for the text "${text}". Artistic background, ancient scroll style, gold and black theme.` }] },
    });
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return null;
  } catch (e) { return null; }
}

export async function generateKhodamVisual(base64Image: string, analysis: string) {
  try {
    const ai = getAIInstance();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
          { text: `Create a mystical oil painting style illustration of the Khodam entity described here: ${analysis}. The entity should appear as a spectral presence alongside the person.` }
        ]
      }
    });
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return null;
  } catch (e) { return null; }
}

export async function generateAncientRitual(category: string, name: string, targetName: string, targetBirthDate: string, targetParent: string, notes: string, base64Image: string) {
  try {
    const ai = getAIInstance();
    const textPrompt = `Susunlah risalah ritual kuno kategori ${category} untuk ${name} yang ditujukan kepada ${targetName} (lahir ${targetBirthDate}, anak dari ${targetParent}). Catatan: ${notes}. Sampaikan secara puitis waskita.`;
    
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
          { text: `An ancient mystical ritual scene for ${category} involving a person and their target. Dark atmospheric, candles, ancient Indonesian mystical style.` }
        ]
      }
    });
    
    let visualUrl = null;
    for (const part of visualResponse.candidates[0].content.parts) {
      if (part.inlineData) {
        visualUrl = `data:image/png;base64,${part.inlineData.data}`;
        break;
      }
    }
    
    return { analysisText, visualUrl };
  } catch (e) { return { analysisText: 'Gagal meramu ritual.', visualUrl: null }; }
}

export async function visualizePortalEntity(base64Image: string, analysis: string) {
  try {
    const ai = getAIInstance();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
          { text: `Visualize the spectral entity or portal anomaly described: ${analysis}. Use eerie, supernatural, and glowing effects.` }
        ]
      }
    });
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return null;
  } catch (e) { return null; }
}

export async function generateBalaRitual(analysis: string) {
  const prompt = `Berdasarkan analisis energi portal: ${analysis}, rumuskan satu bait doa atau amalan singkat (short prayer) sebagai Benteng Batin. Pilih dari Ayat Kursi, Doa Sulaiman, atau doa tolak bala/pengusir jin warisan leluhur Pasundan yang sakral. Sampaikan dalam format puitis namun padat.`;
  return getCulturalSynthesis(prompt);
}

export async function generateRajahVisual(ritualText: string) {
  try {
    const ai = getAIInstance();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { 
        parts: [{ 
          text: `A sacred mystical Isim (spiritual talisman) featuring elegant Arabic calligraphy mixed with ancient Nusantara mystical sigils. The visual should look like a protection amulet against jin and spirits, drawn on aged, weathered parchment with gold leaf and deep black ink. The central focus is a powerful calligraphy of: ${ritualText}. Mysterious, holy, and high contrast.` 
        }] 
      },
    });
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return null;
  } catch (e) { return null; }
}

export async function communicateWithEntity(context: string, message: string) {
  try {
    const ai = getAIInstance();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Berperanlah sebagai entitas ghaib yang terdeteksi: ${context}. Balaslah pesan ini dengan gaya misterius and waskita: "${message}". Singkat saja.`,
      config: { systemInstruction: SYSTEM_PROMPT }
    });
    return sanitizeText(response.text || '...suara statis...');
  } catch (e) { return '...suara statis...'; }
}
