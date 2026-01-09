
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, Radio, Sparkles, Loader2, Skull, ShieldAlert, Zap, Flame, Ghost, SwitchCamera, Home, Volume2, Waves, Activity, RotateCcw, Download, Mic, Power, Info, MapPin, Globe, History, Book, PowerOff, Target, Scan, Hexagon, CircleDashed, Eye, EyeOff, Moon, Sun, Layers, Contrast, Maximize2, Minimize2, AudioLines, MessageSquare, LayoutPanelLeft, Activity as ActivityIcon, Disc, Map as MapIcon, CheckCircle2 } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from "@google/genai";
import { analyzePortalEnergy, visualizePortalEntity, generateBalaRitual, generateRajahVisual, communicateWithEntity, getLocationChronicle } from '../services/gemini.ts';
import ShareResult from '../components/ShareResult.tsx';
import { AppView } from '../types.ts';

type CameraFilter = 'normal' | 'negative' | 'wulung' | 'infrared' | 'nightvision';

interface EnergyNode {
  x: number;
  y: number;
  intensity: number;
  phase: number;
}

// --- Audio Utility Functions ---
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

const GhostPortalView: React.FC<{ onNavigate: (view: AppView) => void }> = ({ onNavigate }) => {
  const [image, setImage] = useState<string | null>(null);
  const [manifestation, setManifestation] = useState<string | null>(null);
  const [rajahVisual, setRajahVisual] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState('');
  const [protection, setProtection] = useState('');
  const [activeFilter, setActiveFilter] = useState<CameraFilter>('normal');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [emfLevel, setEmfLevel] = useState(1.2);
  const [locationType, setLocationType] = useState('Tempat Angker');
  const [locationName, setLocationName] = useState('Area Terdeteksi');
  const [resonanceLevel, setResonanceLevel] = useState(0);
  const [peakFreq, setPeakFreq] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ sender: 'user' | 'entity', text: string }[]>([]);
  const [isCommunicating, setIsCommunicating] = useState(false);
  const [radioPower, setRadioPower] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCastingMantra, setIsCastingMantra] = useState<string | null>(null);
  
  // Mantra Caching
  const [mantrasLoadedCount, setMantrasLoadedCount] = useState(0);
  const mantraCacheRef = useRef<Record<string, AudioBuffer>>({});
  
  // Realtime EVP Live API States
  const [isLiveEVPActive, setIsLiveEVPActive] = useState(false);
  const [isEntitySpeaking, setIsEntitySpeaking] = useState(false);
  const liveSessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);
  const liveSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const liveOutputNodeRef = useRef<GainNode | null>(null);

  const [slsActive, setSlsActive] = useState(false);
  const [skeletonNodes, setSkeletonNodes] = useState<{x: number, y: number}[]>([]);
  const [radioFreq, setRadioFreq] = useState(76.0);
  const [tempCelsius, setTempCelsius] = useState(24.5);
  const [isColdSpot, setIsColdSpot] = useState(false);

  const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null);
  const [chronicle, setChronicle] = useState('');
  const [loadingChronicle, setLoadingChronicle] = useState(false);
  const [loadingProtection, setLoadingProtection] = useState(false);
  const [spectralMorph, setSpectralMorph] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const visualizerCanvasRef = useRef<HTMLCanvasElement>(null);
  const radioWaveCanvasRef = useRef<HTMLCanvasElement>(null);
  const hudWaveCanvasRef = useRef<HTMLCanvasElement>(null); 
  const liveRadarCanvasRef = useRef<HTMLCanvasElement>(null);
  const waterfallCanvasRef = useRef<HTMLCanvasElement>(null);
  const portalContainerRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);

  const noiseNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const filterStyles: Record<CameraFilter, string> = {
    normal: '',
    negative: 'invert(1) contrast(1.2)',
    wulung: 'grayscale(1) contrast(1.4) brightness(0.9)',
    infrared: 'sepia(1) hue-rotate(280deg) saturate(4) brightness(0.7) contrast(1.3)',
    nightvision: 'sepia(1) hue-rotate(70deg) saturate(2.5) brightness(1.3) contrast(1.1) opacity(0.9)'
  };

  const mysticalMantras = [
    { label: 'Hadir Khodir', text: 'Hadir... Khodir... Tembus cahaya batin...' },
    { label: 'Halimul Ghaib', text: 'Ya Halimul Ghaib... Bukalah tabir jagat ghaib...' },
    { label: 'Haimul Jasad', text: 'Ya Haimul Jasad... Resonansi sukma ke raga batin...' },
    { label: 'Haimul Ruh', text: 'Ya Haimul Ruh... Panggillah kesadaran yang tersembunyi...' },
    { label: 'Haimul Jin', text: 'Ya Haimul Jin... Tunduklah pada karsa waskita...' },
    { label: 'Ya Karuhun', text: 'Ya Karuhun... Berikan restu dan cahaya leluhur...' }
  ];

  // --- Pre-Caching Mantras on Mount ---
  useEffect(() => {
    const preCacheAllMantras = async () => {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      for (const m of mysticalMantras) {
        try {
          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: `Ucapkan secara misterius, dalam, dan sakral: ${m.text}` }] }],
            config: {
              responseModalities: [Modality.AUDIO],
              speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Charon' } } },
            },
          });

          const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
          if (base64Audio) {
            const buffer = await decodeAudioData(decode(base64Audio), audioCtxRef.current, 24000, 1);
            mantraCacheRef.current[m.text] = buffer;
            setMantrasLoadedCount(prev => prev + 1);
          }
        } catch (e) {
          console.error("Gagal Pre-cache mantra:", m.label, e);
        }
      }
    };

    preCacheAllMantras();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      });
    }

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      stopAudioEngine();
      stopLiveEVP();
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // --- Map Initialization ---
  useEffect(() => {
    if (coords && mapContainerRef.current && !leafletMapRef.current) {
      const L = (window as any).L;
      if (!L) return;

      const map = L.map(mapContainerRef.current, {
        center: [coords.lat, coords.lng],
        zoom: 16,
        zoomControl: false,
        attributionControl: true
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO'
      }).addTo(map);

      leafletMapRef.current = map;

      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: #d97706; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px #d97706;" class="animate-pulse"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6]
      });

      L.marker([coords.lat, coords.lng], { icon: customIcon }).addTo(map);

      const generateZones = () => {
        const zoneCount = 5;
        for (let i = 0; i < zoneCount; i++) {
          const latOffset = (Math.random() - 0.5) * 0.005;
          const lngOffset = (Math.random() - 0.5) * 0.005;
          const isPositive = Math.random() > 0.4;
          const radius = 50 + Math.random() * 150;
          
          L.circle([coords.lat + latOffset, coords.lng + lngOffset], {
            color: isPositive ? '#10b981' : '#ef4444',
            fillColor: isPositive ? '#10b981' : '#ef4444',
            fillOpacity: 0.15,
            weight: 1,
            radius: radius
          }).addTo(map);
        }
      };
      
      generateZones();
    }
  }, [coords]);

  const toggleFullscreen = () => {
    if (!portalContainerRef.current) return;
    if (!document.fullscreenElement) {
      portalContainerRef.current.requestFullscreen().catch(err => {
        console.error(`Error: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const startLiveEVP = async () => {
    if (isLiveEVPActive) {
      stopLiveEVP();
      return;
    }

    try {
      setLoading(true);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const outNode = outputAudioContext.createGain();
      outNode.connect(outputAudioContext.destination);
      liveOutputNodeRef.current = outNode;

      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            const source = inputAudioContext.createMediaStreamSource(micStream);
            const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContext.destination);
            setIsLiveEVPActive(true);
            setLoading(false);
          },
          onmessage: async (message: LiveServerMessage) => {
            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) {
              setIsEntitySpeaking(true);
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContext.currentTime);
              const audioBuffer = await decodeAudioData(decode(audioData), outputAudioContext, 24000, 1);
              const source = outputAudioContext.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(liveOutputNodeRef.current!);
              source.addEventListener('ended', () => {
                liveSourcesRef.current.delete(source);
                if (liveSourcesRef.current.size === 0) setIsEntitySpeaking(false);
              });
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              liveSourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              liveSourcesRef.current.forEach(s => s.stop());
              liveSourcesRef.current.clear();
              nextStartTimeRef.current = 0;
              setIsEntitySpeaking(false);
            }
          },
          onerror: (e) => { console.error("EVP Error:", e); stopLiveEVP(); },
          onclose: () => { setIsLiveEVPActive(false); }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Charon' } } },
          systemInstruction: 'Anda adalah entitas mistis dari Jagat Pasundan. Anda berbicara dengan suara rendah, misterius, dan puitis. Gunakan istilah Sunda Buhun sesekali. Anda merespons keberadaan manusia melalui frekuensi EVP. Berikan pesan pendek yang terputus-putus dan menyeramkan namun bijak.'
        }
      });

      liveSessionRef.current = await sessionPromise;
    } catch (err) {
      console.error("Live EVP Start Fail:", err);
      setIsLiveEVPActive(false);
      setLoading(false);
    }
  };

  const stopLiveEVP = () => {
    if (liveSessionRef.current) {
      liveSessionRef.current.close();
      liveSessionRef.current = null;
    }
    liveSourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
    liveSourcesRef.current.clear();
    setIsLiveEVPActive(false);
    setIsEntitySpeaking(false);
  };

  // --- UPDATED playMantraAudio: Instant Playback from Cache ---
  const playMantraAudio = async (mantra: string) => {
    if (isCastingMantra) return;
    setIsCastingMantra(mantra);
    
    setEmfLevel(9.9);
    setTimeout(() => setEmfLevel(prev => Math.max(1.2, prev - 2)), 3000);

    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const playBuffer = (buffer: AudioBuffer) => {
      const source = audioCtxRef.current!.createBufferSource();
      source.buffer = buffer;
      const gain = audioCtxRef.current!.createGain();
      gain.gain.value = 1.2;
      source.connect(gain);
      gain.connect(audioCtxRef.current!.destination);
      source.start();
      source.onended = () => setIsCastingMantra(null);
    };

    // 1. Cek Cache (Instant)
    if (mantraCacheRef.current[mantra]) {
      playBuffer(mantraCacheRef.current[mantra]);
      return;
    }

    // 2. Fallback jika cache belum siap (Fetch as usual)
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Ucapkan secara misterius, dalam, dan sakral: ${mantra}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Charon' } } },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const buffer = await decodeAudioData(decode(base64Audio), audioCtxRef.current, 24000, 1);
        mantraCacheRef.current[mantra] = buffer; // Simpan ke cache untuk pemakaian berikutnya
        playBuffer(buffer);
      } else {
        setIsCastingMantra(null);
      }
    } catch (err) {
      console.error("Mantra Audio Error:", err);
      setIsCastingMantra(null);
    }
  };

  const updateSpectralMorph = useCallback(() => {
    if (!slsActive) { setSpectralMorph(''); return; }
    const center = skeletonNodes[0] || { x: 50, y: 50 };
    const points = 8;
    const radius = 15 + Math.random() * 10 * (emfLevel / 5);
    let d = `M ${center.x + radius},${center.y} `;
    for (let i = 1; i <= points; i++) {
      const angle = (i * 2 * Math.PI) / points;
      const r = radius + (Math.random() - 0.5) * 10;
      const x = center.x + r * Math.cos(angle);
      const y = center.y + r * Math.sin(angle);
      d += `L ${x},${y} `;
    }
    d += 'Z';
    setSpectralMorph(d);
  }, [slsActive, skeletonNodes, emfLevel]);

  const updateSLS = useCallback(() => {
    const threshold = 0.92 - (emfLevel / 40);
    if (Math.random() > threshold) {
      setSlsActive(true);
      const centerX = 20 + Math.random() * 60;
      const centerY = 20 + Math.random() * 60;
      setSkeletonNodes([
        { x: centerX, y: centerY },
        { x: centerX, y: centerY + 15 },
        { x: centerX - 10, y: centerY + 10 },
        { x: centerX + 10, y: centerY + 10 },
        { x: centerX - 8, y: centerY + 30 },
        { x: centerX + 8, y: centerY + 30 }
      ]);
      setIsColdSpot(true);
    } else {
      setSlsActive(false);
      setIsColdSpot(false);
    }
  }, [emfLevel]);

  const startAudioEngine = async () => {
    try {
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') { await audioCtxRef.current.resume(); }
      if (streamRef.current) return;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioCtxRef.current.createAnalyser();
      const source = audioCtxRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      let radarRotation = 0;

      const renderLoop = () => {
        if (!analyserRef.current) return;
        animationFrameRef.current = requestAnimationFrame(renderLoop);
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0, maxVal = 0, peakIdx = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
          if (dataArray[i] > maxVal) { maxVal = dataArray[i]; peakIdx = i; }
        }
        const avg = sum / bufferLength;
        setResonanceLevel(avg / 2);
        setPeakFreq(peakIdx * (audioCtxRef.current?.sampleRate || 44100) / (bufferLength * 2));

        if (visualizerCanvasRef.current) {
          const canvas = visualizerCanvasRef.current;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const centerX = canvas.width / 2, centerY = canvas.height / 2;
            const radius = Math.min(centerX, centerY) - 1;
            ctx.strokeStyle = 'rgba(16, 185, 129, 0.2)';
            ctx.lineWidth = 0.5;
            for (let r = 1; r <= 2; r++) { ctx.beginPath(); ctx.arc(centerX, centerY, radius * (r / 2), 0, Math.PI * 2); ctx.stroke(); }
            radarRotation += 0.08;
            ctx.beginPath(); ctx.moveTo(centerX, centerY); ctx.arc(centerX, centerY, radius, radarRotation, radarRotation + 0.4);
            ctx.fillStyle = 'rgba(16, 185, 129, 0.15)'; ctx.fill();
            for (let i = 0; i < bufferLength; i += 4) {
              const val = dataArray[i];
              const barHeight = (val / 255) * (radius * 0.5);
              const angle = (i / bufferLength) * Math.PI * 2;
              const startX = centerX + (radius * 0.3) * Math.cos(angle);
              const startY = centerY + (radius * 0.3) * Math.sin(angle);
              const endX = centerX + (radius * 0.3 + barHeight) * Math.cos(angle);
              const endY = centerY + (radius * 0.3 + barHeight) * Math.sin(angle);
              ctx.strokeStyle = `hsla(${(i / bufferLength) * 120 + 100}, 100%, 50%, 0.5)`;
              ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(startX, startY); ctx.lineTo(endX, endY); ctx.stroke();
            }
          }
        }
        if (liveRadarCanvasRef.current && isLiveEVPActive) {
          const canvas = liveRadarCanvasRef.current;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const cx = canvas.width / 2, cy = canvas.height / 2;
            const radius = canvas.width / 3;
            if (isEntitySpeaking) {
              const pulse = (Math.sin(Date.now() / 100) + 1) / 2;
              ctx.strokeStyle = `rgba(239, 68, 68, ${0.4 * pulse})`;
              ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, radius * (1 + 0.5 * pulse), 0, Math.PI * 2); ctx.stroke();
            }
            ctx.strokeStyle = isEntitySpeaking ? '#ef4444' : '#6366f1';
            ctx.lineWidth = 2; ctx.beginPath();
            for (let i = 0; i < bufferLength; i++) {
              const val = dataArray[i];
              const r = radius + (val / 255) * (radius * 0.5);
              const angle = (i / bufferLength) * Math.PI * 2;
              const x = cx + r * Math.cos(angle), y = cy + r * Math.sin(angle);
              if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            ctx.closePath(); ctx.stroke();
            ctx.fillStyle = isEntitySpeaking ? 'rgba(239, 68, 68, 0.2)' : 'rgba(99, 102, 241, 0.1)';
            ctx.beginPath(); ctx.arc(cx, cy, radius * 0.8, 0, Math.PI * 2); ctx.fill();
          }
        }
        if (hudWaveCanvasRef.current && isCameraActive) {
            const canvas = hudWaveCanvasRef.current;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.lineWidth = 1.5; ctx.strokeStyle = '#fbbf24'; ctx.beginPath();
                const sliceWidth = canvas.width / bufferLength; let x = 0;
                for (let i = 0; i < bufferLength; i++) {
                    const v = dataArray[i] / 128.0; const y = (v * canvas.height) / 2;
                    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
                    x += sliceWidth;
                }
                ctx.stroke();
            }
        }
        if (radioWaveCanvasRef.current && radioPower) {
          const canvas = radioWaveCanvasRef.current;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.lineWidth = 2; ctx.strokeStyle = isListening ? '#ef4444' : '#fbbf24'; ctx.beginPath();
            const sliceWidth = canvas.width / bufferLength; let x = 0;
            for (let i = 0; i < bufferLength; i++) {
              const v = dataArray[i] / 128.0; const y = (v * canvas.height) / 3 + (canvas.height / 3);
              if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
              x += sliceWidth;
            }
            ctx.stroke();
          }
        }
        if (waterfallCanvasRef.current && radioPower) {
          const canvas = waterfallCanvasRef.current;
          const ctx = canvas.getContext('2d');
          if (ctx) {
             const tempImg = ctx.getImageData(0, 0, canvas.width, canvas.height);
             ctx.putImageData(tempImg, 0, 1);
             for (let i = 0; i < bufferLength; i++) {
               const val = dataArray[i];
               ctx.fillStyle = val > 140 ? `rgba(251, 191, 36, ${val/255})` : `rgba(30, 27, 24, ${val/255})`;
               ctx.fillRect((i * canvas.width) / bufferLength, 0, canvas.width / bufferLength, 1);
             }
          }
        }
      };
      renderLoop();
    } catch (err) { console.warn("Mikrofon ditolak."); }
  };

  const stopAudioEngine = () => {
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    if (audioCtxRef.current) { audioCtxRef.current.close(); audioCtxRef.current = null; }
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
  };

  const toggleRadioPower = async () => {
    if (!radioPower) {
      if (!audioCtxRef.current) await startAudioEngine();
      setRadioPower(true);
    } else { setRadioPower(false); }
  };

  const startCamera = async (mode: 'user' | 'environment' = facingMode) => {
    try {
      setIsCameraActive(true); await startAudioEngine(); 
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) { setIsCameraActive(false); }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) { (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop()); videoRef.current.srcObject = null; }
    setIsCameraActive(false);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setEmfLevel(prev => {
        const jitter = (Math.random() - 0.5) * 0.8;
        return Math.min(9.9, Math.max(0.1, prev + jitter));
      });
      setTempCelsius(prev => prev + (Math.random() - 0.5) * 0.15);
      if (radioPower) {
        setRadioFreq(prev => {
          const next = prev + (Math.random() * 0.15);
          return next > 108.0 ? 76.0 : next;
        });
      }
      if (isCameraActive) { updateSLS(); updateSpectralMorph(); }
    }, 150);
    return () => clearInterval(interval);
  }, [isCameraActive, radioPower, updateSLS, updateSpectralMorph]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      ctx?.drawImage(videoRef.current, 0, 0);
      setImage(canvasRef.current.toDataURL('image/jpeg'));
      stopCamera();
    }
  };

  const handleRescan = () => {
    setImage(null); setManifestation(null); setRajahVisual(null); setAnalysis(''); setProtection(''); setChatHistory([]);
    setChronicle(''); setLocationName('Area Terdeteksi'); startCamera();
  };

  const handleSummon = async () => {
    if (!image) return;
    setLoading(true); setAnalysis(''); setProtection(''); setManifestation(null);
    setLoadingChronicle(true);
    try {
      const b64 = image.split(',')[1];
      const res = await analyzePortalEnergy(b64, locationType, resonanceLevel);
      setAnalysis(res);
      const visual = await visualizePortalEntity(b64, res);
      setManifestation(visual);
      const detectedLoc = locationType + " " + (coords ? `${coords.lat.toFixed(4)},${coords.lng.toFixed(4)}` : "");
      setLocationName(detectedLoc);
      const coordString = coords ? `${coords.lat}, ${coords.lng}` : "Unknown Coords";
      const chronicRes = await getLocationChronicle(locationType, coordString);
      setChronicle(chronicRes.text);
    } catch (err) { alert("Gerbang tertutup."); } finally { setLoading(false); setLoadingChronicle(false); }
  };

  const handleDownloadManifestation = () => {
    if (!manifestation) return;
    const link = document.createElement('a');
    link.href = manifestation;
    link.download = `Visi_Portal_${locationType.replace(/\s+/g, '_')}_${new Date().getTime()}.png`;
    link.click();
  };

  const handleStartListening = () => {
    if (!radioPower) { alert("Aktifkan Spirit Box terlebih dahulu."); return; }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { alert("Browser tidak mendukung pengenalan suara."); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = 'id-ID';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = async (event: any) => {
      const speech = event.results[0][0].transcript;
      setChatHistory(prev => [...prev, { sender: 'user', text: speech }]);
      setIsCommunicating(true);
      try {
        const reply = await communicateWithEntity(analysis || "Spirit", speech);
        setChatHistory(prev => [...prev, { sender: 'entity', text: reply }]);
      } catch (err) { setChatHistory(prev => [...prev, { sender: 'entity', text: "...suara statis..." }]); }
      finally { setIsCommunicating(false); }
    };
    recognition.start();
  };

  const handleProtect = async () => {
    if (!analysis) return;
    setLoadingProtection(true);
    try {
      const prayer = await generateBalaRitual(analysis);
      setProtection(prayer);
      const isim = await generateRajahVisual(prayer);
      setRajahVisual(isim);
    } catch (err) { alert("Gagal meramu batin."); } finally { setLoadingProtection(false); }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 px-0 pt-0 bg-stone-950 min-h-screen text-stone-100 overflow-hidden">
      <style>{`
        @keyframes spiritEcho { 0% { box-shadow: 0 0 0px 0px rgba(239, 68, 68, 0); } 50% { box-shadow: 0 0 30px 10px rgba(239, 68, 68, 0.4); } 100% { box-shadow: 0 0 0px 0px rgba(239, 68, 68, 0); } }
        .chromatic-aberration { filter: ${emfLevel > 8 ? 'contrast(1.2) brightness(1.1) drop-shadow(2px 0px 0px rgba(255,0,0,0.5)) drop-shadow(-2px 0px 0px rgba(0,0,255,0.5))' : 'none'}; animation: ${isCastingMantra ? 'mantraGlitch 0.2s infinite' : 'none'}; }
        @keyframes mantraGlitch { 0% { transform: translate(0); filter: hue-rotate(0deg); } 20% { transform: translate(-2px, 2px); filter: hue-rotate(90deg); } 40% { transform: translate(2px, -2px); filter: hue-rotate(180deg); } 60% { transform: translate(-2px, -2px); filter: hue-rotate(270deg); } 80% { transform: translate(2px, 2px); filter: hue-rotate(360deg); } 100% { transform: translate(0); filter: hue-rotate(0deg); } }
        .scrollbar-hidden::-webkit-scrollbar { display: none; }
        .scrollbar-hidden { -ms-overflow-style: none; scrollbar-width: none; }
        #spectral-map { filter: grayscale(1) contrast(1.2) brightness(0.8) invert(0.05); }
      `}</style>

      <header className="px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-stone-900 border border-stone-800 rounded-xl text-amber-500 animate-pulse"><Radio size={18} /></div>
          <div>
            <h2 className="text-xl md:text-3xl font-heritage font-bold text-white tracking-tight uppercase leading-none text-glow-amber">Portal Ghaib</h2>
            <p className="text-stone-600 uppercase text-[7px] tracking-[0.3em] font-black mt-1">Multi-Spectral Anomaly Tracker</p>
          </div>
        </div>
        <button onClick={() => onNavigate(AppView.HOME)} className="p-2 text-stone-500 hover:text-amber-500 transition-colors">
          <Home size={20} />
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 flex flex-col items-center gap-2 px-0 md:px-6">
          <div ref={portalContainerRef} id="portal-container" className={`relative w-full aspect-[3/4] rounded-none md:rounded-[40px] bg-stone-950 overflow-hidden border-none md:border md:border-stone-800/40 shadow-2xl group ${isFullscreen ? 'max-w-none w-screen h-screen rounded-none border-none' : ''}`}>
             
             <div className="absolute inset-0 z-20 pointer-events-none p-5 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                   <div className="flex items-center gap-2">
                     <div className="bg-black/30 p-2.5 rounded-2xl backdrop-blur-md border border-white/5 space-y-1">
                        <div className="flex items-center gap-1.5 text-[7px] font-black text-amber-500 uppercase tracking-widest">
                          <Scan size={10} /> UNIT-ALPHA::ACTIVE
                        </div>
                        <div className="flex items-center gap-1.5 text-[6px] font-black text-blue-400">
                          <MapPin size={8} /> {coords ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : 'GPS-SYNC...'}
                        </div>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
                          <span className={`text-[6px] font-black ${isColdSpot ? 'text-blue-400 animate-pulse' : 'text-stone-500'}`}>TEMP: {tempCelsius.toFixed(1)}°C</span>
                          <span className={`text-[6px] font-black ${slsActive ? 'text-green-500' : 'text-stone-500'}`}>SLS: {slsActive ? 'LOCK' : 'SCN'}</span>
                        </div>
                     </div>
                     <div className="w-12 h-12 overflow-hidden bg-black/20 rounded-full border border-white/5 backdrop-blur-[1px] flex items-center justify-center relative shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                        <canvas ref={visualizerCanvasRef} width="48" height="48" className="w-full h-full opacity-90" />
                     </div>
                   </div>
                   
                   <div className="flex flex-col items-end gap-2">
                      {isLiveEVPActive && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-red-600/20 backdrop-blur-md border border-red-500/40 rounded-full animate-pulse">
                           <Disc size={12} className="text-red-500 animate-spin" />
                           <span className="text-[7px] font-black text-red-400 uppercase tracking-widest">LIVE EVP</span>
                        </div>
                      )}
                      <div className="relative w-2 h-20 bg-black/40 border border-white/10 rounded-full overflow-hidden flex flex-col-reverse p-0.5">
                         <div className="w-full transition-all duration-300 rounded-full" style={{ height: `${emfLevel * 10}%`, background: `linear-gradient(to top, #10b981 0%, #f59e0b 50%, #ef4444 100%)` }} />
                      </div>
                      <span className={`text-[9px] font-mono font-bold ${emfLevel > 7 ? 'text-red-500 animate-pulse' : 'text-amber-500'}`}>{emfLevel.toFixed(1)} mG</span>
                   </div>
                </div>

                <div className="absolute left-2 top-1/2 -translate-y-1/2 z-30 pointer-events-auto flex flex-col gap-2 p-1.5 rounded-full bg-black/10 backdrop-blur-sm border border-white/5">
                  <button onClick={() => setActiveFilter('nightvision')} className={`p-1.5 rounded-full backdrop-blur-md border transition-all ${activeFilter === 'nightvision' ? 'bg-green-600/70 border-green-400 text-white scale-110 shadow-lg' : 'bg-black/30 border-white/10 text-stone-500 hover:bg-black/50'}`} title="Night Vision"><Moon size={12} /></button>
                  <button onClick={() => setActiveFilter('negative')} className={`p-1.5 rounded-full backdrop-blur-md border transition-all ${activeFilter === 'negative' ? 'bg-orange-600/70 border-orange-400 text-white scale-110 shadow-lg' : 'bg-black/30 border-white/10 text-stone-500 hover:bg-black/50'}`} title="Negative Mode"><Contrast size={12} /></button>
                  <button onClick={() => setActiveFilter('wulung')} className={`p-1.5 rounded-full backdrop-blur-md border transition-all ${activeFilter === 'wulung' ? 'bg-stone-600/70 border-stone-400 text-white scale-110 shadow-lg' : 'bg-black/30 border-white/10 text-stone-500 hover:bg-black/50'}`} title="Wulung (B&W)"><Layers size={12} /></button>
                  <button onClick={() => setActiveFilter('normal')} className={`p-1.5 rounded-full backdrop-blur-md border transition-all ${activeFilter === 'normal' ? 'bg-blue-600/70 border-blue-400 text-white scale-110 shadow-lg' : 'bg-black/30 border-white/10 text-stone-500 hover:bg-black/50'}`} title="Normal Spectral"><Sun size={12} /></button>
                  <button onClick={toggleFullscreen} className={`p-1.5 rounded-full backdrop-blur-md border transition-all bg-black/30 border-white/10 text-stone-500 hover:bg-amber-600/50 hover:text-white mt-1`} title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}>{isFullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}</button>
                </div>

                {isLiveEVPActive && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-64 h-64 md:w-96 md:h-96 relative">
                       <canvas ref={liveRadarCanvasRef} width="400" height="400" className="w-full h-full opacity-60" />
                    </div>
                  </div>
                )}

                <div className="mt-auto flex flex-col items-center gap-4 py-6 pointer-events-auto w-full">
                   {isCameraActive && (
                     <div className="flex flex-col items-center gap-1.5 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex items-center gap-2 px-3 py-1 bg-black/40 backdrop-blur-md border border-amber-500/30 rounded-full shadow-[0_0_15px_rgba(251,191,36,0.15)]">
                           <ActivityIcon size={12} className="text-amber-500 animate-pulse" />
                           <div className="w-32 h-6 overflow-hidden">
                              <canvas ref={hudWaveCanvasRef} width="128" height="24" className="w-full h-full opacity-90" />
                           </div>
                           <span className="text-[10px] font-mono font-bold text-amber-400 tracking-wider">{radioFreq.toFixed(1)} <span className="text-[7px] text-stone-500">MHz</span></span>
                        </div>
                     </div>
                   )}

                   {isCameraActive && (
                     <div className="flex justify-center items-center gap-8">
                        <button onClick={() => setFacingMode(prev => prev === 'user' ? 'environment' : 'user')} className="p-2.5 bg-black/40 backdrop-blur rounded-full text-stone-400 border border-white/10 active:scale-90"><SwitchCamera size={14} /></button>
                        <div className="relative group">
                          <button onClick={capturePhoto} className="w-14 h-14 bg-amber-600 rounded-full flex items-center justify-center text-stone-950 shadow-xl active:scale-90 transition-all border-4 border-black/40 z-10 relative">
                             <Camera size={24} />
                          </button>
                        </div>
                        <button onClick={stopCamera} className="p-2.5 bg-black/40 backdrop-blur rounded-full text-stone-400 border border-white/10 active:scale-90"><RefreshCw size={14} /></button>
                     </div>
                   )}
                </div>
             </div>

             <div className="absolute inset-0 z-10 chromatic-aberration">
                {!image && !isCameraActive && (
                  <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-6 bg-stone-900/95">
                    <Ghost size={40} className="text-stone-800 animate-bounce" />
                    <button onClick={() => startCamera()} className="px-10 py-4 bg-amber-600 text-stone-950 font-black rounded-full shadow-2xl active:scale-95 transition-all text-[9px] uppercase tracking-widest">AKTIFKAN SISTEM ALPHA</button>
                  </div>
                )}
                {isCameraActive && (
                   <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover transition-all" style={{ filter: filterStyles[activeFilter] }} />
                )}
                {image && (
                   <div className="relative h-full overflow-hidden animate-in zoom-in duration-300">
                      <img src={manifestation || image} className={`w-full h-full object-cover transition-all duration-1000 ${manifestation ? 'scale-105 saturate-150 contrast-125' : filterStyles[activeFilter]}`} alt="Portal" />
                      <div className="absolute top-6 right-6 z-30 flex gap-2">
                        {manifestation && (
                          <button onClick={handleDownloadManifestation} className="p-3 bg-amber-600 rounded-full text-stone-950 border border-amber-400 shadow-xl active:scale-90 transition-all"><Download size={18} /></button>
                        )}
                        <button onClick={handleRescan} className="p-3 bg-black/60 rounded-full text-white border border-white/5 active:scale-90"><RotateCcw size={18} /></button>
                      </div>
                   </div>
                )}
             </div>
          </div>

          {/* INTERACTIVE SPECTRAL MAP */}
          <div className="w-full px-4 md:px-0 mt-4 space-y-3">
             <div className="flex items-center gap-2 px-2">
                <MapIcon size={14} className="text-blue-500" />
                <h4 className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Peta Interaktif Resonansi Energi</h4>
             </div>
             <div className="w-full h-64 bg-stone-900 rounded-[32px] border border-stone-800 overflow-hidden relative shadow-inner">
                {coords ? (
                   <div ref={mapContainerRef} id="spectral-map" className="w-full h-full z-10" />
                ) : (
                   <div className="w-full h-full flex flex-col items-center justify-center text-stone-700 p-8 text-center space-y-3">
                      <Loader2 size={24} className="animate-spin" />
                      <p className="text-[10px] uppercase font-black tracking-widest">Sinkronisasi GPS Jagat Ghaib...</p>
                   </div>
                )}
                <div className="absolute bottom-3 left-3 z-[1000] flex flex-col gap-1.5">
                   <div className="flex items-center gap-2 px-2 py-1 bg-black/60 backdrop-blur rounded-full border border-white/5">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-[7px] font-black text-emerald-400 uppercase tracking-tighter">Positif</span>
                   </div>
                   <div className="flex items-center gap-2 px-2 py-1 bg-black/60 backdrop-blur rounded-full border border-white/5">
                      <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                      <span className="text-[7px] font-black text-rose-400 uppercase tracking-tighter">Negatif</span>
                   </div>
                </div>
             </div>
          </div>

          <div className="w-full px-4 md:px-0 mt-2">
             <button 
                onClick={startLiveEVP}
                disabled={loading}
                className={`w-full py-5 rounded-[24px] border-2 transition-all flex flex-col items-center justify-center gap-2 group relative overflow-hidden ${isLiveEVPActive ? 'bg-red-950/40 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]' : 'bg-indigo-950/20 border-indigo-500/30 hover:bg-indigo-900/30 shadow-lg'}`}
             >
                <div className="flex items-center gap-3 relative z-10">
                   {loading ? <Loader2 className="animate-spin text-white" size={20} /> : (isLiveEVPActive ? <PowerOff size={20} className="text-red-500" /> : <Mic size={20} className="text-indigo-400 group-hover:scale-110 transition-transform" />)}
                   <span className={`text-[11px] font-black uppercase tracking-[0.2em] ${isLiveEVPActive ? 'text-red-400' : 'text-indigo-300'}`}>
                      {loading ? 'SYNCHRONIZING...' : (isLiveEVPActive ? 'TERMINATE EVP STREAM' : 'INITIATE EVP REALTIME')}
                   </span>
                </div>
             </button>
          </div>

          <div className="w-full p-4 bg-stone-900/40 rounded-[32px] border border-stone-800/60 space-y-4 backdrop-blur-md shadow-lg mt-2">
             <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                   <select value={locationType} onChange={(e) => setLocationType(e.target.value)} className="w-full bg-stone-950/80 border border-stone-800 rounded-2xl px-4 py-3.5 text-[10px] font-bold text-stone-200 outline-none focus:border-amber-600 appearance-none cursor-pointer">
                      <option>Tempat Angker</option>
                      <option>Rumah</option>
                      <option>Ruang Kamar</option>
                      <option>Hutan / Alam</option>
                      <option>Situs Kuno</option>
                   </select>
                   <Target size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-600 pointer-events-none" />
                </div>
                <button onClick={handleSummon} disabled={!image || loading} className="flex-[1.5] py-4 bg-stone-100 hover:bg-white text-stone-950 font-black rounded-2xl shadow-2xl transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 text-[10px] uppercase tracking-widest group">
                  {loading ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} className="text-amber-600 group-hover:scale-125 transition-transform" />} 
                  <span>{loading ? 'ANALISIS...' : 'SINGKAP VISI'}</span>
                </button>
             </div>
          </div>

          {/* MANTRA PAMANGGIL GHAIB - DENGAN PRE-CACHING STATUS */}
          <div className="w-full p-2 space-y-3 animate-in fade-in duration-700">
             <div className="flex items-center justify-between px-2">
               <div className="flex items-center gap-2">
                 <AudioLines size={12} className="text-amber-500" />
                 <h4 className="text-[8px] font-black text-amber-600 uppercase tracking-widest">Mantra Pamanggil Ghaib</h4>
               </div>
               {mantrasLoadedCount < mysticalMantras.length ? (
                 <div className="flex items-center gap-1.5">
                   <Loader2 size={8} className="animate-spin text-stone-600" />
                   <span className="text-[6px] font-black text-stone-600 uppercase tracking-widest">Penyelarasan {mantrasLoadedCount}/{mysticalMantras.length}</span>
                 </div>
               ) : (
                 <div className="flex items-center gap-1">
                   <CheckCircle2 size={10} className="text-emerald-500" />
                   <span className="text-[6px] font-black text-emerald-500 uppercase tracking-widest">Mantra Selaras</span>
                 </div>
               )}
             </div>
             <div className="grid grid-cols-3 gap-2">
               {mysticalMantras.map((mantra, idx) => (
                 <button
                   key={idx}
                   onClick={() => playMantraAudio(mantra.text)}
                   disabled={isCastingMantra !== null}
                   className={`p-2 rounded-xl border text-[7px] font-bold uppercase transition-all flex flex-col items-center justify-center gap-1.5 text-center leading-none h-14 ${isCastingMantra === mantra.text ? 'bg-amber-600 border-amber-400 text-stone-950 scale-95 shadow-inner' : 'bg-stone-900/60 border-stone-800 text-stone-300 hover:border-amber-600/50 hover:bg-stone-900 shadow-sm'}`}
                 >
                   {isCastingMantra === mantra.text ? <Loader2 size={10} className="animate-spin" /> : <Flame size={12} className="text-amber-700" />}
                   <span className="line-clamp-2">{mantra.label}</span>
                 </button>
               ))}
             </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6 pb-10 flex flex-col h-full px-4 md:px-0 mt-4 md:mt-0">
          <div className="glass-panel rounded-[40px] border border-stone-800 bg-stone-900/10 min-h-[500px] flex flex-col shadow-2xl relative overflow-hidden flex-1">
             <div className="flex items-center justify-between border-b border-stone-800/60 p-7 relative z-20">
                <div className="flex items-center gap-3 text-amber-500">
                   <Radio size={22} className={radioPower ? "animate-pulse" : "opacity-30"} />
                   <h3 className="font-heritage text-lg font-bold uppercase tracking-wider leading-none">Waskita Intel</h3>
                </div>
                <button onClick={toggleRadioPower} className={`p-2 rounded-lg transition-all border ${radioPower ? 'bg-amber-600 border-amber-400 text-stone-950 shadow-[0_0_15px_rgba(251,191,36,0.5)]' : 'bg-stone-800 border-stone-700 text-stone-500'}`}>
                  {radioPower ? <Power size={18} /> : <PowerOff size={18} />}
                </button>
             </div>

             <div className="flex-1 px-6 overflow-y-auto max-h-[1000px] scrollbar-hide space-y-8 pb-10 relative z-20">
                {coords && (
                  <div className="p-4 bg-stone-950/80 rounded-2xl border border-blue-900/30 shadow-inner flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-900/20 rounded-lg text-blue-500"><MapPin size={16} /></div>
                      <div>
                        <p className="text-[7px] font-black text-stone-500 uppercase tracking-widest">COORDINATE LOCK</p>
                        <p className="text-[10px] font-mono font-bold text-blue-400">{coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}</p>
                      </div>
                    </div>
                  </div>
                )}
                {(chronicle || loadingChronicle) && (
                  <div className="p-6 bg-stone-950/80 rounded-[32px] border border-stone-800 shadow-xl relative overflow-hidden animate-in fade-in duration-700">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-[9px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2"><History size={14} /> KRONIK LOKASI</h4>
                      {loadingChronicle && <Loader2 size={12} className="animate-spin text-blue-400" />}
                    </div>
                    {!loadingChronicle && <div className="text-stone-300 text-xs leading-relaxed italic text-justify whitespace-pre-wrap font-medium">{chronicle}</div>}
                  </div>
                )}
                {radioPower && (
                   <div className="space-y-8 animate-in fade-in duration-700">
                      <div className="p-6 bg-black/95 rounded-[32px] border border-indigo-900/20 shadow-xl relative overflow-hidden group">
                         <canvas ref={waterfallCanvasRef} width="400" height="200" className="absolute inset-0 w-full h-full opacity-15 mix-blend-screen pointer-events-none" />
                         <div className="flex justify-between items-center mb-6 relative z-10">
                            <div>
                              <h4 className="text-[7px] font-black text-indigo-400 uppercase tracking-widest mb-1">EVP BANDWIDTH</h4>
                              <span className="text-xl font-mono font-bold text-white tracking-widest">{radioFreq.toFixed(1)} <span className="text-[8px] text-stone-600 uppercase">MHz</span></span>
                            </div>
                         </div>
                         <canvas ref={radioWaveCanvasRef} width="400" height="80" className="w-full h-16 relative z-10 mb-6 border-y border-white/5 bg-black/40" />
                         <div className="h-48 overflow-y-auto bg-stone-950/80 border border-stone-800 rounded-2xl p-4 space-y-4 shadow-inner custom-scrollbar relative z-10">
                            {chatHistory.length === 0 && (
                              <div className="h-full flex flex-col items-center justify-center opacity-30 text-[9px] text-stone-500 italic text-center uppercase tracking-widest space-y-3">
                                <Hexagon size={24} className="text-indigo-500 animate-pulse" />
                                <p>Komunikasi aktif.</p>
                              </div>
                            )}
                            {chatHistory.map((chat, i) => (
                               <div key={i} className={`flex flex-col ${chat.sender === 'user' ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-1 duration-300`}>
                                  <span className="text-[6px] font-black uppercase text-stone-700 mb-1 px-2 tracking-widest">{chat.sender === 'user' ? 'SADHAKA' : 'MANIFESTASI'}</span>
                                  <div className={`max-w-[92%] p-3 rounded-xl text-xs leading-relaxed shadow-lg ${chat.sender === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-stone-900 text-stone-300 rounded-tl-none border border-indigo-950/40 italic'}`}>
                                     {chat.text}
                                  </div>
                               </div>
                            ))}
                         </div>
                         <div className="mt-6 flex flex-col items-center gap-3 relative z-10">
                            <button onClick={handleStartListening} disabled={isCommunicating} className={`relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 active:scale-90 ${isListening ? 'bg-red-600 scale-105 shadow-[0_0_40px_rgba(220,38,38,0.5)]' : 'bg-indigo-700 hover:bg-indigo-600'}`}>
                               {isListening ? <Power size={24} className="text-white animate-pulse" /> : <Mic size={24} className="text-white" />}
                            </button>
                         </div>
                      </div>
                      <div className="p-7 bg-stone-950/80 rounded-[32px] border border-stone-800 shadow-inner relative overflow-hidden">
                         <h4 className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-5 flex items-center gap-2"><Ghost size={14} /> SPECTRAL ANALYTICS</h4>
                         <div className="text-stone-100 text-sm leading-relaxed italic text-justify whitespace-pre-wrap font-medium">{analysis || "Singkap citra portal untuk analisis energi."}</div>
                      </div>
                      <div className="p-10 bg-red-950/10 rounded-[40px] border border-red-900/20 shadow-xl space-y-10 mb-10">
                         <div className="flex items-center gap-4 text-red-600 border-b border-red-900/10 pb-5">
                            <ShieldAlert size={28} className="animate-pulse" />
                            <h4 className="font-heritage text-xl font-bold uppercase tracking-wider leading-none text-glow-amber">Benteng Batin</h4>
                         </div>
                         {!protection && !loadingProtection && (
                            <button onClick={handleProtect} disabled={loading || !analysis} className="w-full py-5 bg-red-900/80 text-white font-black rounded-[24px] shadow-lg flex items-center justify-center gap-3 uppercase tracking-widest text-[10px] transition-all active:scale-95 disabled:opacity-30">INISIASI AMALAN PELINDUNG</button>
                         )}
                         {(protection || loadingProtection) && (
                            <div className="space-y-10 animate-in fade-in duration-700">
                               {loadingProtection ? (
                                 <div className="py-20 flex flex-col items-center justify-center gap-6">
                                    <div className="w-20 h-20 border-4 border-red-900 border-t-red-500 rounded-full animate-spin"></div>
                                    <p className="text-red-500 font-heritage italic text-xl animate-pulse">Menghimpun Kalimah...</p>
                                 </div>
                               ) : (
                                 <>
                                   <div className="p-8 bg-stone-950/50 border border-red-900/30 rounded-3xl shadow-inner relative group overflow-hidden">
                                      <div className="text-stone-100 text-lg leading-relaxed italic text-center font-medium">{protection}</div>
                                   </div>
                                   {rajahVisual && (
                                     <div className="p-1 bg-stone-900 border border-stone-800 rounded-[32px] overflow-hidden shadow-2xl flex flex-col group transition-all duration-1000">
                                        <img src={rajahVisual} alt="Isim" className="w-full aspect-[3/4] object-cover brightness-50 group-hover:brightness-100 transition-all duration-1000" />
                                        <div className="p-6 bg-stone-950 flex justify-between items-center border-t border-stone-900">
                                           <div className="text-left">
                                             <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500">ISIM WASKITA AI</p>
                                           </div>
                                           <button onClick={() => { const a = document.createElement('a'); a.href = rajahVisual!; a.download = 'isim.png'; a.click(); }} className="p-3 bg-red-900 text-white rounded-xl shadow-lg active:scale-90 transition-transform"><Download size={18} /></button>
                                        </div>
                                     </div>
                                   )}
                                   <ShareResult title="Risalah Benteng Batin" text={protection} context="Amalan Tolak Bala" />
                                 </>
                               )}
                            </div>
                         )}
                      </div>
                   </div>
                )}
             </div>
          </div>
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default GhostPortalView;
