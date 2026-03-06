import { v4 as uuidv4 } from "uuid";
import { Genre, Key, Scale, Effect } from "@/types/music";

// ============================================================================
// Reference Track Analyzer
// 오디오 파일을 음악적 구성 요소(DNA)로 분해하는 엔진
// 실제 환경에서는 Web Audio API + ML 모델로 처리
// ============================================================================

export interface AudioFeatures {
  spectralCentroid: number;      // 밝기/어두움 (0~1)
  spectralRolloff: number;       // 고주파 에너지 비율
  zeroCrossingRate: number;      // 음색 거칠기
  rmsEnergy: number;             // 전체 에너지 레벨
  spectralFlux: number;          // 스펙트럼 변화율
  chromagram: number[];          // 12개 음정별 에너지 (C~B)
  mfcc: number[];                // Mel-frequency cepstral coefficients (음색 지문)
  onsetStrength: number;         // 비트 강도
}

export interface RhythmDNA {
  bpm: number;
  timeSignature: string;         // "4/4", "3/4", "6/8" 등
  swingAmount: number;           // 스윙 정도 0~1
  rhythmDensity: number;         // 리듬 밀도 0~1
  syncopation: number;           // 당김음 빈도 0~1
  groovePattern: number[];       // 16스텝 그루브 패턴 (velocity)
  kickPattern: boolean[];        // 16스텝 킥 패턴
  snarePattern: boolean[];       // 16스텝 스네어 패턴
  hihatPattern: number[];        // 16스텝 하이햇 velocity
}

export interface HarmonyDNA {
  key: Key;
  scale: Scale;
  chordProgression: ChordInfo[];
  modulationPoints: number[];    // 전조 시점 (초)
  harmonicComplexity: number;    // 화성 복잡도 0~1
  tensionCurve: number[];        // 시간에 따른 긴장감 곡선
  voicingStyle: "open" | "close" | "mixed";
  bassMovement: "root" | "walking" | "pedal" | "chromatic";
}

export interface ChordInfo {
  root: string;
  quality: "major" | "minor" | "dim" | "aug" | "dom7" | "maj7" | "min7" | "sus2" | "sus4" | "add9";
  startTime: number;
  duration: number;
  inversion: number;
}

export interface MelodyDNA {
  range: { low: number; high: number };
  contour: ("ascending" | "descending" | "static" | "arc" | "wave")[];
  intervalDistribution: Record<string, number>;  // 음정 간격별 빈도
  rhythmicDensity: number;
  repetitionFactor: number;      // 반복 패턴 빈도 0~1
  ornamentationLevel: number;    // 꾸밈음 수준 0~1
  phraseLength: number;          // 평균 프레이즈 길이 (박)
  leapFrequency: number;         // 도약 진행 빈도 0~1
}

export interface TimbreDNA {
  brightness: number;            // 밝기 0~1
  warmth: number;                // 따뜻함 0~1
  roughness: number;             // 거칠기 0~1
  depth: number;                 // 깊이감 0~1
  instrumentFingerprint: InstrumentProfile[];
  effectChain: EffectSignature[];
  stereoWidth: number;           // 스테레오 넓이 0~1
  dynamicRange: number;          // 다이나믹 레인지 dB
}

export interface InstrumentProfile {
  type: string;
  role: "lead" | "rhythm" | "bass" | "pad" | "percussion" | "fx";
  frequency: { low: number; high: number };
  prominence: number;            // 얼마나 두드러지는지 0~1
  attackCharacter: "sharp" | "soft" | "plucked" | "bowed";
}

export interface EffectSignature {
  type: Effect["type"];
  intensity: number;
  character: string;
}

export interface ArrangementDNA {
  sections: SectionInfo[];
  buildupPoints: number[];       // 빌드업 시점 (초)
  dropPoints: number[];          // 드롭 시점 (초)
  dynamicCurve: number[];        // 시간에 따른 다이나믹 곡선
  layerDensityCurve: number[];   // 시간에 따른 레이어 밀도
  introLength: number;
  outroLength: number;
  transitionStyle: "cut" | "fade" | "riser" | "breakdown" | "fill";
}

export interface SectionInfo {
  type: "intro" | "verse" | "pre_chorus" | "chorus" | "bridge" | "drop" | "breakdown" | "outro" | "interlude";
  startTime: number;
  duration: number;
  energy: number;
  layerCount: number;
}

export interface ProductionDNA {
  mixBalance: Record<string, number>;  // 트랙별 볼륨 밸런스
  compressionStyle: "transparent" | "punchy" | "glued" | "crushed";
  reverbSpace: "dry" | "room" | "hall" | "cathedral" | "plate";
  lowEndCharacter: "tight" | "boomy" | "sub_heavy" | "warm";
  highEndCharacter: "bright" | "airy" | "dark" | "crispy";
  masteringLoudness: number;     // LUFS
  stereoImage: "narrow" | "balanced" | "wide" | "immersive";
}

// 모든 음악적 요소를 담는 단일 지식 객체 (Single Knowledge Object)
export interface MusicDNA {
  id: string;
  sourceId: string;              // 원본 곡 ID
  sourceTitle: string;
  sourceArtist: string;
  genre: Genre;
  subGenres: string[];
  tags: string[];

  // 핵심 음악적 DNA (비정형 데이터를 구조화)
  rhythm: RhythmDNA;
  harmony: HarmonyDNA;
  melody: MelodyDNA;
  timbre: TimbreDNA;
  arrangement: ArrangementDNA;
  production: ProductionDNA;

  // 고차원 특성
  audioFeatures: AudioFeatures;

  // 감정/분위기 벡터 (다중 모달 통합)
  emotionVector: EmotionVector;

  // 메타
  analyzedAt: string;
  confidence: number;            // 분석 신뢰도 0~1
}

export interface EmotionVector {
  valence: number;      // 긍정/부정 -1~1
  arousal: number;      // 각성/이완 -1~1
  dominance: number;    // 지배적/순종적 -1~1
  tension: number;      // 긴장감 0~1
  joy: number;          // 기쁨 0~1
  sadness: number;      // 슬픔 0~1
  energy: number;       // 에너지 0~1
  nostalgia: number;    // 향수 0~1
  darkness: number;     // 어두움 0~1
  ethereal: number;     // 몽환 0~1
}

// ============================================================================
// 오디오 분석 시뮬레이터
// 실제로는 Web Audio API + Essentia.js + TensorFlow.js 기반
// ============================================================================

function simulateSpectralAnalysis(genre: Genre): AudioFeatures {
  const genreProfiles: Partial<Record<Genre, Partial<AudioFeatures>>> = {
    edm: { spectralCentroid: 0.7, rmsEnergy: 0.9, onsetStrength: 0.95 },
    classical: { spectralCentroid: 0.5, rmsEnergy: 0.4, onsetStrength: 0.3 },
    hiphop: { spectralCentroid: 0.4, rmsEnergy: 0.75, onsetStrength: 0.8 },
    jazz: { spectralCentroid: 0.55, rmsEnergy: 0.5, onsetStrength: 0.5 },
    lofi: { spectralCentroid: 0.35, rmsEnergy: 0.35, onsetStrength: 0.4 },
    metal: { spectralCentroid: 0.85, rmsEnergy: 0.95, onsetStrength: 0.9 },
    ambient: { spectralCentroid: 0.3, rmsEnergy: 0.2, onsetStrength: 0.1 },
    kpop: { spectralCentroid: 0.65, rmsEnergy: 0.8, onsetStrength: 0.85 },
  };

  const profile = genreProfiles[genre] || {};
  const rand = () => 0.3 + Math.random() * 0.4;

  return {
    spectralCentroid: profile.spectralCentroid ?? rand(),
    spectralRolloff: rand(),
    zeroCrossingRate: rand(),
    rmsEnergy: profile.rmsEnergy ?? rand(),
    spectralFlux: rand(),
    chromagram: Array.from({ length: 12 }, () => Math.random()),
    mfcc: Array.from({ length: 13 }, () => (Math.random() - 0.5) * 50),
    onsetStrength: profile.onsetStrength ?? rand(),
  };
}

function analyzeRhythm(genre: Genre, bpm: number): RhythmDNA {
  const genreSwing: Partial<Record<Genre, number>> = {
    jazz: 0.6, blues: 0.4, soul: 0.3, funk: 0.35,
    hiphop: 0.15, edm: 0, techno: 0, house: 0.05,
  };

  const kickPatterns: Record<string, boolean[]> = {
    four_floor: [true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false],
    hiphop: [true,false,false,false,false,false,true,false,false,false,true,false,false,false,false,false],
    rock: [true,false,false,false,false,false,false,false,true,false,false,false,false,false,false,false],
    breakbeat: [true,false,false,true,false,false,true,false,false,false,true,false,false,true,false,false],
  };

  const patternType =
    genre === "house" || genre === "techno" || genre === "edm" || genre === "trance" ? "four_floor" :
    genre === "hiphop" || genre === "rnb" ? "hiphop" :
    genre === "rock" || genre === "metal" || genre === "punk" ? "rock" : "breakbeat";

  return {
    bpm,
    timeSignature: genre === "jazz" ? (Math.random() > 0.7 ? "3/4" : "4/4") : "4/4",
    swingAmount: genreSwing[genre] ?? 0,
    rhythmDensity: genre === "metal" || genre === "edm" ? 0.8 : genre === "ambient" ? 0.2 : 0.5,
    syncopation: genre === "funk" || genre === "reggae" ? 0.7 : genre === "hiphop" ? 0.5 : 0.2,
    groovePattern: Array.from({ length: 16 }, () => Math.floor(40 + Math.random() * 87)),
    kickPattern: kickPatterns[patternType],
    snarePattern: [false,false,false,false,true,false,false,false,false,false,false,false,true,false,false,false],
    hihatPattern: Array.from({ length: 16 }, (_, i) => i % 2 === 0 ? 80 + Math.random() * 20 : 40 + Math.random() * 30),
  };
}

function analyzeHarmony(genre: Genre, key: Key, scale: Scale): HarmonyDNA {
  const commonProgressions: Record<string, ChordInfo[]> = {
    pop: [
      { root: "I", quality: "major", startTime: 0, duration: 2, inversion: 0 },
      { root: "V", quality: "major", startTime: 2, duration: 2, inversion: 0 },
      { root: "vi", quality: "minor", startTime: 4, duration: 2, inversion: 0 },
      { root: "IV", quality: "major", startTime: 6, duration: 2, inversion: 0 },
    ],
    jazz: [
      { root: "ii", quality: "min7", startTime: 0, duration: 2, inversion: 0 },
      { root: "V", quality: "dom7", startTime: 2, duration: 2, inversion: 0 },
      { root: "I", quality: "maj7", startTime: 4, duration: 4, inversion: 0 },
    ],
    blues: [
      { root: "I", quality: "dom7", startTime: 0, duration: 4, inversion: 0 },
      { root: "IV", quality: "dom7", startTime: 4, duration: 2, inversion: 0 },
      { root: "I", quality: "dom7", startTime: 6, duration: 2, inversion: 0 },
    ],
  };

  const progType =
    genre === "jazz" ? "jazz" :
    genre === "blues" ? "blues" : "pop";

  return {
    key,
    scale,
    chordProgression: commonProgressions[progType],
    modulationPoints: [],
    harmonicComplexity: genre === "jazz" ? 0.9 : genre === "pop" ? 0.4 : 0.5,
    tensionCurve: Array.from({ length: 8 }, (_, i) => 0.3 + 0.4 * Math.sin(i / 7 * Math.PI)),
    voicingStyle: genre === "jazz" ? "open" : "close",
    bassMovement: genre === "jazz" ? "walking" : genre === "blues" ? "chromatic" : "root",
  };
}

function analyzeMelody(genre: Genre): MelodyDNA {
  return {
    range: { low: 48, high: genre === "metal" ? 84 : genre === "pop" ? 72 : 76 },
    contour: ["ascending", "arc", "descending", "wave"],
    intervalDistribution: { "unison": 0.1, "step": 0.5, "third": 0.2, "fourth": 0.1, "fifth": 0.05, "leap": 0.05 },
    rhythmicDensity: genre === "hiphop" ? 0.8 : genre === "ambient" ? 0.2 : 0.5,
    repetitionFactor: genre === "pop" || genre === "edm" ? 0.7 : genre === "jazz" ? 0.2 : 0.4,
    ornamentationLevel: genre === "jazz" || genre === "blues" ? 0.7 : genre === "classical" ? 0.5 : 0.2,
    phraseLength: genre === "hiphop" ? 8 : genre === "pop" ? 4 : 4,
    leapFrequency: genre === "jazz" ? 0.4 : 0.15,
  };
}

function analyzeTimbre(genre: Genre): TimbreDNA {
  const genreTimbre: Partial<Record<Genre, Partial<TimbreDNA>>> = {
    lofi: { brightness: 0.3, warmth: 0.8, roughness: 0.4, depth: 0.6 },
    edm: { brightness: 0.9, warmth: 0.3, roughness: 0.2, depth: 0.5 },
    metal: { brightness: 0.7, warmth: 0.2, roughness: 0.9, depth: 0.4 },
    jazz: { brightness: 0.5, warmth: 0.7, roughness: 0.1, depth: 0.7 },
    ambient: { brightness: 0.4, warmth: 0.6, roughness: 0.05, depth: 0.9 },
    classical: { brightness: 0.6, warmth: 0.7, roughness: 0.05, depth: 0.8 },
  };

  const profile = genreTimbre[genre] || {};

  return {
    brightness: profile.brightness ?? 0.5,
    warmth: profile.warmth ?? 0.5,
    roughness: profile.roughness ?? 0.3,
    depth: profile.depth ?? 0.5,
    instrumentFingerprint: [],
    effectChain: [],
    stereoWidth: genre === "ambient" || genre === "edm" ? 0.9 : genre === "hiphop" ? 0.6 : 0.7,
    dynamicRange: genre === "classical" ? 30 : genre === "edm" ? 8 : 15,
  };
}

function analyzeArrangement(genre: Genre, duration: number): ArrangementDNA {
  const sectionTemplates: Record<string, SectionInfo["type"][]> = {
    pop: ["intro", "verse", "pre_chorus", "chorus", "verse", "pre_chorus", "chorus", "bridge", "chorus", "outro"],
    edm: ["intro", "breakdown", "drop", "breakdown", "drop", "outro"],
    hiphop: ["intro", "verse", "chorus", "verse", "chorus", "verse", "chorus", "outro"],
    classical: ["intro", "verse", "interlude", "verse", "bridge", "verse", "outro"],
  };

  const template =
    genre === "edm" || genre === "house" || genre === "techno" || genre === "trance" ? "edm" :
    genre === "hiphop" || genre === "rnb" ? "hiphop" :
    genre === "classical" ? "classical" : "pop";

  const types = sectionTemplates[template];
  const sectionDuration = duration / types.length;

  return {
    sections: types.map((type, i) => ({
      type,
      startTime: i * sectionDuration,
      duration: sectionDuration,
      energy: type === "chorus" || type === "drop" ? 0.9 : type === "breakdown" || type === "intro" ? 0.3 : 0.6,
      layerCount: type === "chorus" || type === "drop" ? 6 : type === "verse" ? 4 : 3,
    })),
    buildupPoints: [],
    dropPoints: [],
    dynamicCurve: types.map((t) => t === "chorus" || t === "drop" ? 0.9 : t === "verse" ? 0.6 : 0.4),
    layerDensityCurve: types.map((t) => t === "chorus" || t === "drop" ? 0.9 : 0.5),
    introLength: sectionDuration,
    outroLength: sectionDuration,
    transitionStyle: genre === "edm" ? "riser" : genre === "rock" ? "fill" : "fade",
  };
}

function analyzeProduction(genre: Genre): ProductionDNA {
  return {
    mixBalance: { melody: 0.8, harmony: 0.6, bass: 0.75, drums: 0.85 },
    compressionStyle:
      genre === "edm" || genre === "metal" ? "crushed" :
      genre === "pop" || genre === "kpop" ? "punchy" :
      genre === "jazz" || genre === "classical" ? "transparent" : "glued",
    reverbSpace:
      genre === "ambient" ? "cathedral" :
      genre === "classical" ? "hall" :
      genre === "pop" || genre === "kpop" ? "plate" : "room",
    lowEndCharacter:
      genre === "hiphop" || genre === "dubstep" ? "sub_heavy" :
      genre === "edm" ? "tight" :
      genre === "jazz" ? "warm" : "warm",
    highEndCharacter:
      genre === "lofi" ? "dark" :
      genre === "edm" || genre === "kpop" ? "bright" :
      genre === "metal" ? "crispy" : "airy",
    masteringLoudness: genre === "edm" || genre === "metal" ? -6 : genre === "classical" ? -18 : -10,
    stereoImage: genre === "ambient" ? "immersive" : genre === "edm" ? "wide" : "balanced",
  };
}

function deriveEmotionVector(genre: Genre, scale: Scale, bpm: number): EmotionVector {
  const isMinor = scale === "minor" || scale === "harmonic_minor" || scale === "melodic_minor" || scale === "dorian";
  const isFast = bpm > 120;
  const isSlow = bpm < 85;

  return {
    valence: isMinor ? -0.3 + Math.random() * 0.3 : 0.3 + Math.random() * 0.4,
    arousal: isFast ? 0.5 + Math.random() * 0.4 : isSlow ? -0.3 + Math.random() * 0.3 : Math.random() * 0.5,
    dominance: genre === "metal" || genre === "edm" ? 0.7 : genre === "ambient" ? -0.3 : 0.2,
    tension: genre === "metal" ? 0.8 : genre === "ambient" ? 0.1 : 0.3 + Math.random() * 0.3,
    joy: !isMinor && isFast ? 0.8 : !isMinor ? 0.5 : 0.2,
    sadness: isMinor && isSlow ? 0.7 : isMinor ? 0.4 : 0.1,
    energy: isFast ? 0.8 : isSlow ? 0.2 : 0.5,
    nostalgia: genre === "lofi" || genre === "folk" ? 0.7 : genre === "blues" ? 0.6 : 0.2,
    darkness: genre === "metal" || genre === "techno" ? 0.7 : genre === "ambient" ? 0.4 : 0.2,
    ethereal: genre === "ambient" || genre === "trance" || genre === "newage" ? 0.8 : 0.2,
  };
}

// ============================================================================
// 메인 분석 함수
// ============================================================================

export interface ReferenceTrackInput {
  title: string;
  artist: string;
  genre: Genre;
  bpm?: number;
  key?: Key;
  scale?: Scale;
  duration?: number;
  fileType?: "audio" | "midi" | "metadata";
  tags?: string[];
  description?: string;
}

export function analyzeReferenceTrack(input: ReferenceTrackInput): MusicDNA {
  const bpm = input.bpm || 120;
  const key = input.key || "C";
  const scale = input.scale || "major";
  const duration = input.duration || 180;

  return {
    id: uuidv4(),
    sourceId: uuidv4(),
    sourceTitle: input.title,
    sourceArtist: input.artist,
    genre: input.genre,
    subGenres: [],
    tags: input.tags || [input.genre],

    rhythm: analyzeRhythm(input.genre, bpm),
    harmony: analyzeHarmony(input.genre, key, scale),
    melody: analyzeMelody(input.genre),
    timbre: analyzeTimbre(input.genre),
    arrangement: analyzeArrangement(input.genre, duration),
    production: analyzeProduction(input.genre),
    audioFeatures: simulateSpectralAnalysis(input.genre),
    emotionVector: deriveEmotionVector(input.genre, scale, bpm),

    analyzedAt: new Date().toISOString(),
    confidence: 0.75 + Math.random() * 0.2,
  };
}

export function compareMusicDNA(a: MusicDNA, b: MusicDNA): number {
  let similarity = 0;
  let factors = 0;

  // 리듬 유사도
  const bpmSim = 1 - Math.abs(a.rhythm.bpm - b.rhythm.bpm) / 100;
  similarity += bpmSim; factors++;

  const swingSim = 1 - Math.abs(a.rhythm.swingAmount - b.rhythm.swingAmount);
  similarity += swingSim; factors++;

  // 화성 유사도
  if (a.harmony.key === b.harmony.key) { similarity += 1; } else { similarity += 0.3; }
  factors++;

  if (a.harmony.scale === b.harmony.scale) { similarity += 1; } else { similarity += 0.2; }
  factors++;

  const harmComplexSim = 1 - Math.abs(a.harmony.harmonicComplexity - b.harmony.harmonicComplexity);
  similarity += harmComplexSim; factors++;

  // 음색 유사도
  const brightSim = 1 - Math.abs(a.timbre.brightness - b.timbre.brightness);
  const warmSim = 1 - Math.abs(a.timbre.warmth - b.timbre.warmth);
  const depthSim = 1 - Math.abs(a.timbre.depth - b.timbre.depth);
  similarity += (brightSim + warmSim + depthSim) / 3; factors++;

  // 감정 벡터 유사도 (코사인 유사도 근사)
  const emotA = Object.values(a.emotionVector);
  const emotB = Object.values(b.emotionVector);
  let dotProduct = 0, magA = 0, magB = 0;
  for (let i = 0; i < emotA.length; i++) {
    dotProduct += emotA[i] * emotB[i];
    magA += emotA[i] * emotA[i];
    magB += emotB[i] * emotB[i];
  }
  const emotionSim = magA > 0 && magB > 0 ? dotProduct / (Math.sqrt(magA) * Math.sqrt(magB)) : 0;
  similarity += Math.max(0, emotionSim); factors++;

  // 장르 일치
  if (a.genre === b.genre) { similarity += 1; } else { similarity += 0; }
  factors++;

  return similarity / factors;
}
