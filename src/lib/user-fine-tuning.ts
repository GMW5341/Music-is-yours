import { v4 as uuidv4 } from "uuid";
import { Genre, Key, Scale, ComposeRequest } from "@/types/music";
import {
  MusicDNA,
  EmotionVector,
  ReferenceTrackInput,
  analyzeReferenceTrack,
  compareMusicDNA,
} from "./reference-analyzer";
import {
  getKnowledgeGraph,
  SynthesizedKnowledge,
  UnifiedKnowledgeObject,
} from "./knowledge-plane";

// ============================================================================
// Per-User Fine-Tuning Engine
// 각 사용자마다 독립적인 음악적 프로파일을 구축하고
// 레퍼런스 곡, 작곡 이력, 피드백을 기반으로 개인화된 모델을 만드는 엔진
// ============================================================================

export interface UserMusicProfile {
  userId: string;
  createdAt: string;
  updatedAt: string;

  // 레퍼런스 트랙 DNA 모음
  referenceDNAs: MusicDNA[];

  // 작곡 이력에서 학습된 선호도
  compositionHistory: CompositionRecord[];

  // 축적된 선호도 벡터
  preferenceVector: PreferenceVector;

  // 장르별 선호 가중치
  genreAffinities: Partial<Record<Genre, number>>;

  // 사용자 피드백 기반 보정값
  feedbackAdjustments: FeedbackAdjustment[];

  // 파인튜닝 상태
  tuningState: TuningState;
}

export interface PreferenceVector {
  // 리듬 선호
  preferredBpmRange: { min: number; max: number };
  swingPreference: number;           // 0~1
  rhythmComplexity: number;          // 단순~복잡 0~1

  // 화성 선호
  preferredKeys: Key[];
  preferredScales: Scale[];
  harmonicComplexity: number;        // 단순~복잡 0~1
  dissonanceTolerance: number;       // 불협화음 허용 0~1

  // 멜로디 선호
  melodyRange: number;               // 좁은~넓은 0~1
  repetitionPreference: number;      // 반복 선호 0~1
  leapPreference: number;            // 도약 선호 0~1

  // 음색 선호
  brightnessPreference: number;
  warmthPreference: number;
  depthPreference: number;

  // 프로덕션 선호
  compressionAmount: number;
  reverbAmount: number;
  stereoWidth: number;
  dynamicRange: number;              // 좁은~넓은 0~1

  // 감정 선호 벡터
  emotionPreference: EmotionVector;
}

export interface CompositionRecord {
  id: string;
  prompt: string;
  genre: Genre;
  bpm: number;
  key: Key;
  scale: Scale;
  satisfaction: number;              // 사용자 만족도 0~1 (명시적 또는 추론)
  timestamp: string;
  features: string[];                // 사용한 프로듀서 기능들
}

export interface FeedbackAdjustment {
  parameter: string;
  direction: "increase" | "decrease";
  magnitude: number;
  reason: string;
  timestamp: string;
}

export interface TuningState {
  totalReferences: number;
  totalCompositions: number;
  totalFeedbacks: number;
  maturityLevel: "novice" | "learning" | "calibrated" | "personalized" | "expert";
  lastTuningAt: string;
  convergenceScore: number;          // 모델 수렴 정도 0~1
}

// --- 선호 벡터 초기화 ---

function createDefaultPreference(): PreferenceVector {
  return {
    preferredBpmRange: { min: 80, max: 140 },
    swingPreference: 0.1,
    rhythmComplexity: 0.5,
    preferredKeys: ["C", "G", "D", "A"],
    preferredScales: ["major", "minor"],
    harmonicComplexity: 0.4,
    dissonanceTolerance: 0.3,
    melodyRange: 0.5,
    repetitionPreference: 0.5,
    leapPreference: 0.3,
    brightnessPreference: 0.5,
    warmthPreference: 0.5,
    depthPreference: 0.5,
    compressionAmount: 0.5,
    reverbAmount: 0.4,
    stereoWidth: 0.6,
    dynamicRange: 0.5,
    emotionPreference: {
      valence: 0.5, arousal: 0.5, dominance: 0.5,
      tension: 0.3, joy: 0.5, sadness: 0.2,
      energy: 0.5, nostalgia: 0.3, darkness: 0.2, ethereal: 0.3,
    },
  };
}

// --- 사용자 프로파일 저장소 ---

const userProfiles: Map<string, UserMusicProfile> = new Map();

export function getUserProfile(userId: string): UserMusicProfile {
  if (!userProfiles.has(userId)) {
    const profile: UserMusicProfile = {
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      referenceDNAs: [],
      compositionHistory: [],
      preferenceVector: createDefaultPreference(),
      genreAffinities: {},
      feedbackAdjustments: [],
      tuningState: {
        totalReferences: 0,
        totalCompositions: 0,
        totalFeedbacks: 0,
        maturityLevel: "novice",
        lastTuningAt: new Date().toISOString(),
        convergenceScore: 0,
      },
    };
    userProfiles.set(userId, profile);
  }
  return userProfiles.get(userId)!;
}

// --- 레퍼런스 트랙 추가 + 파인튜닝 ---

export function addReferenceTrack(userId: string, input: ReferenceTrackInput): MusicDNA {
  const profile = getUserProfile(userId);
  const dna = analyzeReferenceTrack(input);

  profile.referenceDNAs.push(dna);
  profile.tuningState.totalReferences++;

  // 지식 그래프에도 추가
  const kg = getKnowledgeGraph();
  kg.ingestTrack(input);

  // 선호도 벡터 업데이트 (점진적 파인튜닝)
  updatePreferenceFromDNA(profile, dna);

  // 장르 선호도 업데이트
  profile.genreAffinities[dna.genre] = (profile.genreAffinities[dna.genre] || 0) + 1;

  // 성숙도 업데이트
  updateMaturityLevel(profile);

  profile.updatedAt = new Date().toISOString();
  profile.tuningState.lastTuningAt = new Date().toISOString();

  return dna;
}

// 레퍼런스 여러 개 한번에 추가
export function addMultipleReferences(userId: string, inputs: ReferenceTrackInput[]): MusicDNA[] {
  return inputs.map((input) => addReferenceTrack(userId, input));
}

// --- 작곡 기록 추가 ---

export function recordComposition(
  userId: string,
  prompt: string,
  genre: Genre,
  bpm: number,
  key: Key,
  scale: Scale,
  features: string[],
  satisfaction?: number
): void {
  const profile = getUserProfile(userId);

  profile.compositionHistory.push({
    id: uuidv4(),
    prompt,
    genre,
    bpm,
    key,
    scale,
    satisfaction: satisfaction ?? 0.5,
    timestamp: new Date().toISOString(),
    features,
  });

  profile.tuningState.totalCompositions++;

  // 장르 선호도 업데이트
  profile.genreAffinities[genre] = (profile.genreAffinities[genre] || 0) + 0.5;

  // BPM 범위 조정
  const pref = profile.preferenceVector;
  if (bpm < pref.preferredBpmRange.min) pref.preferredBpmRange.min = Math.round((pref.preferredBpmRange.min + bpm) / 2);
  if (bpm > pref.preferredBpmRange.max) pref.preferredBpmRange.max = Math.round((pref.preferredBpmRange.max + bpm) / 2);

  // 키/스케일 선호도 갱신
  if (!pref.preferredKeys.includes(key)) {
    if (pref.preferredKeys.length < 6) pref.preferredKeys.push(key);
  }
  if (!pref.preferredScales.includes(scale)) {
    if (pref.preferredScales.length < 4) pref.preferredScales.push(scale);
  }

  updateMaturityLevel(profile);
  profile.updatedAt = new Date().toISOString();
}

// --- 사용자 피드백 처리 ---

export function submitFeedback(
  userId: string,
  feedback: {
    liked: string[];           // "더 밝게", "베이스 강하게" 등
    disliked: string[];        // "너무 단조로워", "리버브 과함" 등
    rating: number;            // 1~5
  }
): void {
  const profile = getUserProfile(userId);
  const pref = profile.preferenceVector;

  const feedbackMap: Record<string, () => void> = {
    "더 밝게": () => adjustPref(profile, "brightnessPreference", "increase", 0.1, "사용자가 더 밝은 소리 요청"),
    "더 따뜻하게": () => adjustPref(profile, "warmthPreference", "increase", 0.1, "사용자가 더 따뜻한 소리 요청"),
    "더 어둡게": () => adjustPref(profile, "brightnessPreference", "decrease", 0.1, "사용자가 어두운 소리 요청"),
    "베이스 강하게": () => adjustPref(profile, "depthPreference", "increase", 0.1, "사용자가 베이스 강조 요청"),
    "리듬 복잡하게": () => adjustPref(profile, "rhythmComplexity", "increase", 0.1, "사용자가 복잡한 리듬 요청"),
    "리듬 단순하게": () => adjustPref(profile, "rhythmComplexity", "decrease", 0.1, "사용자가 단순한 리듬 요청"),
    "리버브 더": () => adjustPref(profile, "reverbAmount", "increase", 0.1, "사용자가 리버브 추가 요청"),
    "리버브 줄여": () => adjustPref(profile, "reverbAmount", "decrease", 0.1, "사용자가 리버브 감소 요청"),
    "스테레오 넓게": () => adjustPref(profile, "stereoWidth", "increase", 0.1, "사용자가 넓은 스테레오 요청"),
    "더 신나게": () => {
      pref.emotionPreference.energy = Math.min(pref.emotionPreference.energy + 0.1, 1);
      pref.emotionPreference.joy = Math.min(pref.emotionPreference.joy + 0.1, 1);
    },
    "더 차분하게": () => {
      pref.emotionPreference.energy = Math.max(pref.emotionPreference.energy - 0.1, 0);
      pref.emotionPreference.tension = Math.max(pref.emotionPreference.tension - 0.1, 0);
    },
  };

  // 좋아요 피드백 처리
  feedback.liked.forEach((item) => {
    const handler = Object.entries(feedbackMap).find(([key]) => item.includes(key));
    if (handler) handler[1]();
  });

  // 싫어요 피드백 처리
  const dislikeMap: Record<string, () => void> = {
    "너무 단조로": () => {
      adjustPref(profile, "rhythmComplexity", "increase", 0.15, "단조로움 불만");
      adjustPref(profile, "harmonicComplexity", "increase", 0.1, "단조로움 불만");
    },
    "리버브 과함": () => adjustPref(profile, "reverbAmount", "decrease", 0.15, "리버브 과함 불만"),
    "너무 시끄러": () => adjustPref(profile, "compressionAmount", "decrease", 0.1, "시끄러움 불만"),
    "너무 어두": () => adjustPref(profile, "brightnessPreference", "increase", 0.15, "어두움 불만"),
    "밋밋해": () => {
      adjustPref(profile, "harmonicComplexity", "increase", 0.1, "밋밋함 불만");
      pref.emotionPreference.tension = Math.min(pref.emotionPreference.tension + 0.1, 1);
    },
  };

  feedback.disliked.forEach((item) => {
    const handler = Object.entries(dislikeMap).find(([key]) => item.includes(key));
    if (handler) handler[1]();
  });

  // 전체 만족도에 따른 수렴도 조정
  if (feedback.rating >= 4) {
    profile.tuningState.convergenceScore = Math.min(profile.tuningState.convergenceScore + 0.05, 1);
  } else if (feedback.rating <= 2) {
    profile.tuningState.convergenceScore = Math.max(profile.tuningState.convergenceScore - 0.03, 0);
  }

  profile.tuningState.totalFeedbacks++;
  updateMaturityLevel(profile);
  profile.updatedAt = new Date().toISOString();
}

// --- 개인화된 작곡 파라미터 생성 ---

export interface PersonalizedComposeParams {
  genre: Genre;
  bpm: number;
  key: Key;
  scale: Scale;
  emotionTarget: EmotionVector;
  timbreTarget: { brightness: number; warmth: number; depth: number };
  productionHints: string[];
  arrangementHints: string[];
  personalizationLevel: number;      // 개인화 수준 0~1
  knowledgeConfidence: number;       // 지식 기반 신뢰도 0~1
  sourceDescription: string;         // 어떤 근거로 파라미터가 결정됐는지
}

export function getPersonalizedParams(
  userId: string,
  request: ComposeRequest
): PersonalizedComposeParams {
  const profile = getUserProfile(userId);
  const pref = profile.preferenceVector;
  const kg = getKnowledgeGraph();

  // 1단계: 지식 그래프에서 프롬프트 기반 검색
  const queryResult = kg.queryByNaturalLanguage(request.prompt);
  const synthesis = queryResult.synthesizedKnowledge;

  // 2단계: 사용자 선호도와 지식 그래프 결과 블렌딩
  const maturity = getMaturityWeight(profile);  // 0~1: 모델이 성숙할수록 개인화 강해짐

  // 장르 결정: 요청 > 지식그래프 > 선호도
  const genre = request.genre || (queryResult.intent.genres[0]) || getMostPreferredGenre(profile) || "pop";

  // BPM 블렌딩
  const knowledgeBpm = synthesis.suggestedBpm;
  const prefBpmCenter = (pref.preferredBpmRange.min + pref.preferredBpmRange.max) / 2;
  const bpm = request.bpm || Math.round(
    knowledgeBpm * (1 - maturity * 0.3) + prefBpmCenter * maturity * 0.3
  );

  // 키/스케일 블렌딩
  const key = request.key || (maturity > 0.5 ? pref.preferredKeys[0] : synthesis.suggestedKey) || "C";
  const scale = request.scale || (maturity > 0.5 ? pref.preferredScales[0] : synthesis.suggestedScale) || "major";

  // 감정 벡터 블렌딩
  const emotionKeys = Object.keys(pref.emotionPreference) as (keyof EmotionVector)[];
  const blendedEmotion: EmotionVector = {} as EmotionVector;
  emotionKeys.forEach((k) => {
    (blendedEmotion as unknown as Record<string, number>)[k] =
      synthesis.emotionTarget[k] * (1 - maturity * 0.4) + pref.emotionPreference[k] * maturity * 0.4;
  });

  // 음색 블렌딩
  const timbreTarget = {
    brightness: synthesis.timbreTarget.brightness * (1 - maturity * 0.3) + pref.brightnessPreference * maturity * 0.3,
    warmth: synthesis.timbreTarget.warmth * (1 - maturity * 0.3) + pref.warmthPreference * maturity * 0.3,
    depth: synthesis.timbreTarget.depth * (1 - maturity * 0.3) + pref.depthPreference * maturity * 0.3,
  };

  // 프로덕션 힌트
  const productionHints = [...synthesis.productionHints];
  if (pref.reverbAmount > 0.6) productionHints.push("reverb: heavy");
  if (pref.compressionAmount > 0.7) productionHints.push("compression: punchy");
  if (pref.stereoWidth > 0.7) productionHints.push("stereo: wide");

  // 근거 설명 생성
  const sources: string[] = [];
  if (queryResult.totalMatches > 0) sources.push(`지식그래프 ${queryResult.totalMatches}건 참조`);
  if (profile.referenceDNAs.length > 0) sources.push(`레퍼런스 ${profile.referenceDNAs.length}곡 반영`);
  if (profile.compositionHistory.length > 0) sources.push(`작곡이력 ${profile.compositionHistory.length}건 학습`);
  if (profile.feedbackAdjustments.length > 0) sources.push(`피드백 ${profile.tuningState.totalFeedbacks}건 반영`);

  return {
    genre,
    bpm,
    key,
    scale,
    emotionTarget: blendedEmotion,
    timbreTarget,
    productionHints,
    arrangementHints: synthesis.arrangementHints,
    personalizationLevel: maturity,
    knowledgeConfidence: synthesis.confidence,
    sourceDescription: sources.join(" / ") || "기본 설정",
  };
}

// --- 레퍼런스 기반 DNA 분석 요약 ---

export function getReferenceAnalysisSummary(userId: string): ReferenceAnalysisSummary | null {
  const profile = getUserProfile(userId);
  if (profile.referenceDNAs.length === 0) return null;

  const dnas = profile.referenceDNAs;
  const avgBpm = dnas.reduce((s, d) => s + d.rhythm.bpm, 0) / dnas.length;

  // 장르 분포
  const genreDist: Record<string, number> = {};
  dnas.forEach((d) => { genreDist[d.genre] = (genreDist[d.genre] || 0) + 1; });

  // 감정 벡터 평균
  const emotionKeys = Object.keys(dnas[0].emotionVector) as (keyof EmotionVector)[];
  const avgEmotion: EmotionVector = {} as EmotionVector;
  emotionKeys.forEach((k) => {
    (avgEmotion as unknown as Record<string, number>)[k] =
      dnas.reduce((s, d) => s + d.emotionVector[k], 0) / dnas.length;
  });

  // DNA 간 유사도 클러스터링 (간단한 평균 유사도)
  let totalSim = 0, simCount = 0;
  for (let i = 0; i < dnas.length; i++) {
    for (let j = i + 1; j < dnas.length; j++) {
      totalSim += compareMusicDNA(dnas[i], dnas[j]);
      simCount++;
    }
  }
  const avgSimilarity = simCount > 0 ? totalSim / simCount : 0;

  // 분해된 요소들 요약
  const decomposition: DecomposedElements = {
    rhythmPatterns: dnas.map((d) => ({
      source: d.sourceTitle,
      bpm: d.rhythm.bpm,
      swing: d.rhythm.swingAmount,
      density: d.rhythm.rhythmDensity,
      syncopation: d.rhythm.syncopation,
    })),
    harmonyPatterns: dnas.map((d) => ({
      source: d.sourceTitle,
      key: d.harmony.key,
      scale: d.harmony.scale,
      complexity: d.harmony.harmonicComplexity,
      voicing: d.harmony.voicingStyle,
    })),
    melodyCharacteristics: dnas.map((d) => ({
      source: d.sourceTitle,
      range: d.melody.range,
      repetition: d.melody.repetitionFactor,
      ornamentation: d.melody.ornamentationLevel,
    })),
    timbreProfiles: dnas.map((d) => ({
      source: d.sourceTitle,
      brightness: d.timbre.brightness,
      warmth: d.timbre.warmth,
      roughness: d.timbre.roughness,
      depth: d.timbre.depth,
    })),
    productionStyles: dnas.map((d) => ({
      source: d.sourceTitle,
      compression: d.production.compressionStyle,
      reverb: d.production.reverbSpace,
      stereo: d.production.stereoImage,
      lowEnd: d.production.lowEndCharacter,
    })),
  };

  return {
    totalReferences: dnas.length,
    avgBpm: Math.round(avgBpm),
    genreDistribution: genreDist,
    avgEmotionVector: avgEmotion,
    consistencyScore: avgSimilarity,
    decomposition,
    maturityLevel: profile.tuningState.maturityLevel,
    convergenceScore: profile.tuningState.convergenceScore,
  };
}

export interface ReferenceAnalysisSummary {
  totalReferences: number;
  avgBpm: number;
  genreDistribution: Record<string, number>;
  avgEmotionVector: EmotionVector;
  consistencyScore: number;
  decomposition: DecomposedElements;
  maturityLevel: string;
  convergenceScore: number;
}

export interface DecomposedElements {
  rhythmPatterns: Array<{ source: string; bpm: number; swing: number; density: number; syncopation: number }>;
  harmonyPatterns: Array<{ source: string; key: Key; scale: Scale; complexity: number; voicing: string }>;
  melodyCharacteristics: Array<{ source: string; range: { low: number; high: number }; repetition: number; ornamentation: number }>;
  timbreProfiles: Array<{ source: string; brightness: number; warmth: number; roughness: number; depth: number }>;
  productionStyles: Array<{ source: string; compression: string; reverb: string; stereo: string; lowEnd: string }>;
}

// --- 내부 유틸리티 ---

function updatePreferenceFromDNA(profile: UserMusicProfile, dna: MusicDNA): void {
  const pref = profile.preferenceVector;
  const alpha = 0.3; // 학습률

  // 점진적 이동 평균 (Exponential Moving Average)
  pref.brightnessPreference = pref.brightnessPreference * (1 - alpha) + dna.timbre.brightness * alpha;
  pref.warmthPreference = pref.warmthPreference * (1 - alpha) + dna.timbre.warmth * alpha;
  pref.depthPreference = pref.depthPreference * (1 - alpha) + dna.timbre.depth * alpha;
  pref.rhythmComplexity = pref.rhythmComplexity * (1 - alpha) + dna.rhythm.rhythmDensity * alpha;
  pref.harmonicComplexity = pref.harmonicComplexity * (1 - alpha) + dna.harmony.harmonicComplexity * alpha;
  pref.repetitionPreference = pref.repetitionPreference * (1 - alpha) + dna.melody.repetitionFactor * alpha;
  pref.swingPreference = pref.swingPreference * (1 - alpha) + dna.rhythm.swingAmount * alpha;
  pref.stereoWidth = pref.stereoWidth * (1 - alpha) + dna.timbre.stereoWidth * alpha;

  // 감정 벡터도 EMA
  const emotionKeys = Object.keys(pref.emotionPreference) as (keyof EmotionVector)[];
  emotionKeys.forEach((k) => {
    (pref.emotionPreference as unknown as Record<string, number>)[k] =
      pref.emotionPreference[k] * (1 - alpha) + dna.emotionVector[k] * alpha;
  });

  // BPM 범위 확장
  pref.preferredBpmRange.min = Math.min(pref.preferredBpmRange.min, dna.rhythm.bpm - 10);
  pref.preferredBpmRange.max = Math.max(pref.preferredBpmRange.max, dna.rhythm.bpm + 10);
}

function adjustPref(
  profile: UserMusicProfile,
  param: string,
  direction: "increase" | "decrease",
  magnitude: number,
  reason: string
): void {
  const pref = profile.preferenceVector as unknown as Record<string, unknown>;
  const current = pref[param];
  if (typeof current === "number") {
    pref[param] = direction === "increase"
      ? Math.min(current + magnitude, 1)
      : Math.max(current - magnitude, 0);
  }

  profile.feedbackAdjustments.push({
    parameter: param,
    direction,
    magnitude,
    reason,
    timestamp: new Date().toISOString(),
  });
}

function updateMaturityLevel(profile: UserMusicProfile): void {
  const state = profile.tuningState;
  const total = state.totalReferences + state.totalCompositions + state.totalFeedbacks;

  if (total >= 50 && state.convergenceScore > 0.7) {
    state.maturityLevel = "expert";
  } else if (total >= 20 && state.convergenceScore > 0.5) {
    state.maturityLevel = "personalized";
  } else if (total >= 10) {
    state.maturityLevel = "calibrated";
  } else if (total >= 3) {
    state.maturityLevel = "learning";
  } else {
    state.maturityLevel = "novice";
  }
}

function getMaturityWeight(profile: UserMusicProfile): number {
  switch (profile.tuningState.maturityLevel) {
    case "expert": return 0.9;
    case "personalized": return 0.7;
    case "calibrated": return 0.5;
    case "learning": return 0.3;
    case "novice": return 0.1;
  }
}

function getMostPreferredGenre(profile: UserMusicProfile): Genre | null {
  const entries = Object.entries(profile.genreAffinities);
  if (entries.length === 0) return null;
  return entries.sort((a, b) => b[1] - a[1])[0][0] as Genre;
}
